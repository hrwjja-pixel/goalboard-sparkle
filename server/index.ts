import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import { setupPassport } from './auth/passport';
import authRoutes from './routes/auth';
import { optionalAuth, AuthRequest } from './middleware/auth';
import { attachAuditLog } from './middleware/audit';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

// ES module __dirname polyfill (only needed when running as ES module)
let __dirname: string;
try {
  // @ts-ignore - __dirname is available in CommonJS
  __dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
} catch {
  // Fallback for CommonJS
  __dirname = __dirname;
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Multer uses busboy which decodes multipart as latin1, but browsers send UTF-8
    // We need to convert: latin1 bytes -> UTF-8 string
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8').normalize('NFC');
    cb(null, uniqueSuffix + '-' + decodedName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  }
});

// Setup Passport
setupPassport();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/api/auth', authRoutes);

// Apply optional auth and audit middleware to all API routes
app.use('/api', optionalAuth, attachAuditLog);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Helper functions for project hierarchy
async function isDescendant(targetId: string, ancestorId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: targetId },
    select: { parentId: true }
  });

  if (!project || !project.parentId) return false;
  if (project.parentId === ancestorId) return true;

  return isDescendant(project.parentId, ancestorId);
}

async function getDescendantIds(projectId: string): Promise<string[]> {
  const children = await prisma.project.findMany({
    where: { parentId: projectId },
    select: { id: true }
  });

  const childIds = children.map(c => c.id);
  const descendantIds = await Promise.all(
    childIds.map(id => getDescendantIds(id))
  );

  return [...childIds, ...descendantIds.flat()];
}

// Project endpoints
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects', details: error });
  }
});

app.post('/api/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, dashboardTitle, dashboardSubtitle, parentId } = req.body;

    // Validate parentId if provided
    if (parentId) {
      const parent = await prisma.project.findUnique({ where: { id: parentId } });
      if (!parent) {
        return res.status(400).json({ error: 'Parent project not found' });
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        dashboardTitle: dashboardTitle || '목표 대시보드',
        dashboardSubtitle: dashboardSubtitle || '',
        parentId: parentId || null,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Project',
      entityId: project.id,
      entityTitle: project.name,
      projectId: project.id,
      summary: `프로젝트 '${project.name}' 생성`,
    });

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', details: error });
  }
});

app.put('/api/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, dashboardTitle, dashboardSubtitle, parentId } = req.body;

    // Validate circular reference
    if (parentId !== undefined && parentId !== null) {
      if (parentId === id) {
        return res.status(400).json({ error: 'Cannot set project as its own parent' });
      }

      const isCircular = await isDescendant(parentId, id);
      if (isCircular) {
        return res.status(400).json({
          error: 'Cannot set descendant as parent (circular reference)'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (dashboardTitle !== undefined) updateData.dashboardTitle = dashboardTitle;
    if (dashboardSubtitle !== undefined) updateData.dashboardSubtitle = dashboardSubtitle;
    if (parentId !== undefined) updateData.parentId = parentId;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Project',
      entityId: project.id,
      entityTitle: project.name,
      projectId: project.id,
      summary: `프로젝트 '${project.name}' 수정`,
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project', details: error });
  }
});

app.delete('/api/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;

    // Verify admin password
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Invalid admin password' });
    }

    // Check for child projects
    const childrenCount = await prisma.project.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete project with child projects',
        details: `This project has ${childrenCount} child project(s). Please delete or move them first.`
      });
    }

    // Get project name before deletion for audit log
    const project = await prisma.project.findUnique({ where: { id } });

    // This will cascade delete all related goals, categories, etc.
    await prisma.project.delete({
      where: { id },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'DELETE',
      entityType: 'Project',
      entityId: id,
      entityTitle: project?.name || 'Unknown',
      projectId: id,
      summary: `프로젝트 '${project?.name || 'Unknown'}' 삭제`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project', details: error });
  }
});

// Categories endpoints
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const includeDescendants = req.query.includeDescendants === 'true';

    let projectIds = [projectId];
    if (includeDescendants) {
      const descendants = await getDescendantIds(projectId);
      projectIds = [projectId, ...descendants];
    }

    const categories = await prisma.category.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', details: error });
  }
});

app.post('/api/categories', async (req: AuthRequest, res: Response) => {
  try {
    const { name, color, projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const category = await prisma.category.create({
      data: { name, color, projectId },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Category',
      entityId: category.id,
      entityTitle: category.name,
      projectId: category.projectId,
      summary: `카테고리 '${category.name}' 생성`,
    });

    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', details: error });
  }
});

app.delete('/api/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get category name before deletion for audit log
    const category = await prisma.category.findUnique({ where: { id } });

    await prisma.category.delete({
      where: { id },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'DELETE',
      entityType: 'Category',
      entityId: id,
      entityTitle: category?.name || 'Unknown',
      projectId: category?.projectId,
      summary: `카테고리 '${category?.name || 'Unknown'}' 삭제`,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.put('/api/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { color, name } = req.body;
    const updateData: any = {};
    if (color !== undefined) updateData.color = color;
    if (name !== undefined) updateData.name = name;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Category',
      entityId: category.id,
      entityTitle: category.name,
      projectId: category.projectId,
      summary: `카테고리 '${category.name}' 수정`,
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', details: error });
  }
});

// Goals endpoints
app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const showCompleted = req.query.showCompleted === 'true';
    const includeDescendants = req.query.includeDescendants === 'true';

    let projectIds = [projectId];

    if (includeDescendants) {
      const descendants = await getDescendantIds(projectId);
      projectIds = [projectId, ...descendants];
    }

    const whereClause: any = {
      projectId: { in: projectIds }
    };
    if (!showCompleted) {
      whereClause.completed = false;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        categories: true,
        subGoals: {
          orderBy: { order: 'asc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        project: {
          select: { id: true, name: true }
        },
      },
      orderBy: { order: 'asc' },
    });

    // Transform to match frontend format
    const transformedGoals = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      owner: goal.owner,
      projectId: goal.projectId,
      project: goal.project,
      categories: goal.categories.map(cat => cat.name),
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      completed: goal.completed,
      version: goal.version,
      subGoals: goal.subGoals,
      notes: goal.notes,
      attachments: goal.attachments,
    }));

    res.json(transformedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Get single goal with latest data
app.get('/api/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        categories: true,
        subGoals: {
          orderBy: { order: 'asc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Transform to match frontend format
    const transformedGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      owner: goal.owner,
      categories: goal.categories.map(cat => cat.name),
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      completed: goal.completed,
      version: goal.version,
      subGoals: goal.subGoals,
      notes: goal.notes,
      attachments: goal.attachments,
    };

    res.json(transformedGoal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

app.post('/api/goals', async (req: AuthRequest, res: Response) => {
  try {
    const { categories, subGoals, notes, attachments, projectId, ...goalData } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    // Validate categories (1-5 required)
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: 'Must provide 1-5 categories' });
    }

    // Find or create categories (within the project)
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName: string) => {
        let categoryRecord = await prisma.category.findFirst({
          where: {
            name: categoryName,
            projectId: projectId,
          },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { name: categoryName, color: '#6b7280', projectId },
          });
        }

        return categoryRecord;
      })
    );

    // Automatically set completed based on progress
    const progress = goalData.progress !== undefined ? goalData.progress : 0;
    const completed = progress >= 100;

    const goal = await prisma.goal.create({
      data: {
        ...goalData,
        projectId,
        completed,
        categories: {
          connect: categoryRecords.map(cat => ({ id: cat.id })),
        },
        subGoals: subGoals
          ? {
              create: subGoals.map((sg: any, index: number) => ({
                id: sg.id,
                title: sg.title,
                description: sg.description,
                owner: sg.owner,
                progress: sg.progress,
                startDate: sg.startDate,
                dueDate: sg.dueDate,
                statusNote: sg.statusNote,
                order: index,
              })),
            }
          : undefined,
        notes: notes
          ? {
              create: notes.map((note: any) => ({
                id: note.id,
                content: note.content,
                isPinned: note.isPinned,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
              })),
            }
          : undefined,
      },
      include: {
        categories: true,
        subGoals: { orderBy: { order: 'asc' } },
        notes: true,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
      goalId: goal.id,
      projectId: projectId,
      summary: `목표 '${goal.title}' 생성`,
    });

    res.json({
      ...goal,
      categories: goal.categories.map(cat => cat.name),
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Bulk update goal orders (for drag and drop)
// IMPORTANT: This must be before /api/goals/:id to avoid route matching issues
app.put('/api/goals/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { goals } = req.body;

    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({ error: 'Invalid request: goals must be an array' });
    }

    await Promise.all(
      goals.map((goal: { id: string; order: number }) =>
        prisma.goal.update({
          where: { id: goal.id },
          data: { order: goal.order },
        })
      )
    );

    // Audit log
    await (req as any).audit?.({
      action: 'REORDER',
      entityType: 'Goal',
      entityId: 'bulk',
      entityTitle: `${goals.length} goals reordered`,
      summary: `${goals.length}개 목표 순서 변경`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering goals:', error);
    res.status(500).json({ error: 'Failed to reorder goals', details: error });
  }
});

// Toggle goal completion status
app.put('/api/goals/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        completed,
        version: { increment: 1 }
      },
      include: {
        categories: true,
        subGoals: { orderBy: { order: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
      goalId: goal.id,
      projectId: goal.projectId,
      summary: completed ? `목표 '${goal.title}' 완료 처리` : `목표 '${goal.title}' 완료 해제`,
      changes: { completed },
    });

    res.json({
      ...goal,
      categories: goal.categories.map(cat => cat.name),
    });
  } catch (error) {
    console.error('Error toggling goal completion:', error);
    res.status(500).json({ error: 'Failed to toggle goal completion', details: error });
  }
});

app.put('/api/goals/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { categories, subGoals, notes, attachments, version, ...goalData } = req.body;

    // Validate categories (1-5 required)
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: 'Must provide 1-5 categories' });
    }

    // Pre-fetch current goal for version check and projectId
    const currentGoal = await prisma.goal.findUnique({
      where: { id },
      include: {
        subGoals: { orderBy: { order: 'asc' } },
        notes: true,
      },
    });

    if (!currentGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (version !== undefined && currentGoal.version !== version) {
      return res.status(409).json({
        error: 'Conflict',
        message: '다른 사용자가 이 목표를 수정했습니다. 새로고침 후 다시 시도하세요.',
        currentData: currentGoal,
      });
    }

    // Find or create categories (outside transaction)
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName: string) => {
        let categoryRecord = await prisma.category.findFirst({
          where: {
            name: categoryName,
            projectId: currentGoal.projectId
          },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: {
              name: categoryName,
              color: '#6b7280',
              projectId: currentGoal.projectId
            },
          });
        }

        return categoryRecord;
      })
    );

    // Use transaction to ensure atomicity of all updates
    const goal = await prisma.$transaction(async (tx) => {
      // Double-check version inside transaction to prevent race conditions
      const goalInTransaction = await tx.goal.findUnique({
        where: { id },
        select: { version: true },
      });

      if (!goalInTransaction || (version !== undefined && goalInTransaction.version !== version)) {
        throw new Error('VERSION_CONFLICT');
      }

      // Partial update for SubGoals
      if (subGoals) {
        const incomingSubGoalIds = new Set(subGoals.map((sg: any) => sg.id).filter(Boolean));
        const existingSubGoalIds = new Set(currentGoal.subGoals.map((sg) => sg.id));

        // Delete subgoals that are not in the incoming data
        const subGoalsToDelete = currentGoal.subGoals.filter((sg) => !incomingSubGoalIds.has(sg.id));
        for (const sg of subGoalsToDelete) {
          await tx.subGoal.delete({ where: { id: sg.id } });
        }

        // Update existing or create new subgoals
        for (let i = 0; i < subGoals.length; i++) {
          const sg = subGoals[i];
          if (sg.id && existingSubGoalIds.has(sg.id)) {
            // Update existing subgoal
            await tx.subGoal.update({
              where: { id: sg.id },
              data: {
                title: sg.title,
                description: sg.description,
                owner: sg.owner,
                progress: sg.progress,
                startDate: sg.startDate,
                dueDate: sg.dueDate,
                statusNote: sg.statusNote,
                order: i,
                version: { increment: 1 },
              },
            });
          } else {
            // Create new subgoal
            await tx.subGoal.create({
              data: {
                id: sg.id || undefined,
                title: sg.title,
                description: sg.description,
                owner: sg.owner,
                progress: sg.progress,
                startDate: sg.startDate,
                dueDate: sg.dueDate,
                statusNote: sg.statusNote,
                order: i,
                goalId: id,
              },
            });
          }
        }
      }

      // Partial update for Notes
      if (notes) {
        const incomingNoteIds = new Set(notes.map((note: any) => note.id).filter(Boolean));
        const existingNoteIds = new Set(currentGoal.notes.map((note) => note.id));

        // Delete notes that are not in the incoming data
        const notesToDelete = currentGoal.notes.filter((note) => !incomingNoteIds.has(note.id));
        for (const note of notesToDelete) {
          await tx.note.delete({ where: { id: note.id } });
        }

        // Update existing or create new notes
        for (const note of notes) {
          if (note.id && existingNoteIds.has(note.id)) {
            // Update existing note
            await tx.note.update({
              where: { id: note.id },
              data: {
                content: note.content,
                isPinned: note.isPinned,
                version: { increment: 1 },
              },
            });
          } else {
            // Create new note
            await tx.note.create({
              data: {
                id: note.id || undefined,
                content: note.content,
                isPinned: note.isPinned,
                goalId: id,
                createdAt: note.createdAt || new Date(),
              },
            });
          }
        }
      }

      // Automatically set completed based on progress
      const updatedData = {
        ...goalData,
        completed: goalData.progress !== undefined
          ? goalData.progress >= 100
          : currentGoal.progress >= 100,
      };

      // Update the goal with incremented version
      return await tx.goal.update({
        where: { id },
        data: {
          ...updatedData,
          categories: {
            set: categoryRecords.map(cat => ({ id: cat.id })),
          },
          version: { increment: 1 },
        },
        include: {
          categories: true,
          subGoals: {
            orderBy: { order: 'asc' },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    // Audit log (outside transaction)
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
      goalId: goal.id,
      projectId: currentGoal.projectId,
      summary: `목표 '${goal.title}' 수정`,
    });

    res.json({
      ...goal,
      categories: goal.categories.map(cat => cat.name),
    });
  } catch (error: any) {
    console.error('Error updating goal:', error);

    // Handle version conflict from transaction
    if (error.message === 'VERSION_CONFLICT') {
      return res.status(409).json({
        error: 'Conflict',
        message: '다른 사용자가 이 목표를 수정했습니다. 새로고침 후 다시 시도하세요.',
      });
    }

    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get goal title and projectId before deletion for audit log
    const goal = await prisma.goal.findUnique({ where: { id } });

    await prisma.goal.delete({
      where: { id },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'DELETE',
      entityType: 'Goal',
      entityId: id,
      entityTitle: goal?.title || 'Unknown',
      goalId: id,
      projectId: goal?.projectId,
      summary: `목표 '${goal?.title || 'Unknown'}' 삭제`,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Activity Log endpoints

// Get activity feed (all activities)
app.get('/api/activity', async (req: Request, res: Response) => {
  try {
    const { projectId, limit = '50', offset = '0' } = req.query;

    const activities = await prisma.auditLog.findMany({
      where: projectId ? { projectId: projectId as string } : undefined,
      include: { user: { select: { name: true, picture: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    // IP 주소 또는 사용자 이름 표시
    const result = activities.map(a => ({
      ...a,
      displayName: a.user?.name || a.ipAddress || '알 수 없음',
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get activity for a specific goal
app.get('/api/goals/:id/activity', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '50' } = req.query;

    const activities = await prisma.auditLog.findMany({
      where: { goalId: id },
      include: { user: { select: { name: true, picture: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    // IP 주소 또는 사용자 이름 표시
    const result = activities.map(a => ({
      ...a,
      displayName: a.user?.name || a.ipAddress || '알 수 없음',
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching goal activity:', error);
    res.status(500).json({ error: 'Failed to fetch goal activity' });
  }
});

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production' || Number(PORT) === 80) {
  const distPath = path.resolve(process.cwd(), 'dist');
  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath));

  // Handle client-side routing - send all non-API requests to index.html
  app.use((req: Request, res: Response, next) => {
    // Skip if it's an API request
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Attachment endpoints

// Upload file to a goal
app.post('/api/goals/:id/attachments', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if goal exists
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Create attachment record
    // Multer uses busboy which decodes multipart as latin1, but browsers send UTF-8
    // We need to convert: latin1 bytes -> UTF-8 string
    const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8').normalize('NFC');

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.filename,
        originalName: decodedOriginalName,
        mimeType: file.mimetype,
        size: file.size,
        goalId: id,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Attachment',
      entityId: attachment.id,
      entityTitle: decodedOriginalName,
      goalId: id,
      projectId: goal.projectId,
      summary: `'${goal.title}'에 첨부파일 '${decodedOriginalName}' 추가`,
    });

    res.json(attachment);
  } catch (error) {
    console.error('Error uploading file:', error);
    // Clean up file if database operation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get attachments for a goal
app.get('/api/goals/:id/attachments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attachments = await prisma.attachment.findMany({
      where: { goalId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

// Download an attachment
app.get('/api/attachments/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(uploadsDir, attachment.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Properly encode filename for Content-Disposition header (RFC 5987)
    const encodedFilename = encodeURIComponent(attachment.originalName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete an attachment
app.delete('/api/attachments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { goal: { select: { id: true, title: true, projectId: true } } },
    });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from disk
    const filePath = path.join(uploadsDir, attachment.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.attachment.delete({ where: { id } });

    // Audit log
    await (req as any).audit?.({
      action: 'DELETE',
      entityType: 'Attachment',
      entityId: id,
      entityTitle: attachment.originalName,
      goalId: attachment.goalId,
      projectId: attachment.goal?.projectId,
      summary: `'${attachment.goal?.title}'에서 첨부파일 '${attachment.originalName}' 삭제`,
    });

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// Settings endpoints
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // Set defaults if not found
    const defaults = {
      dashboardTitle: process.env.DASHBOARD_TITLE || 'WEHAGO H 목표 대시보드',
      dashboardSubtitle: process.env.DASHBOARD_SUBTITLE || 'EMR개발본부 > WEHAGO H 개발센터',
    };

    res.json({ ...defaults, ...settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardTitle, dashboardSubtitle } = req.body;

    if (dashboardTitle !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'dashboardTitle' },
        update: { value: dashboardTitle },
        create: { key: 'dashboardTitle', value: dashboardTitle },
      });
    }

    if (dashboardSubtitle !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'dashboardSubtitle' },
        update: { value: dashboardSubtitle },
        create: { key: 'dashboardSubtitle', value: dashboardSubtitle },
      });
    }

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Setting',
      entityId: 'dashboard',
      entityTitle: 'Dashboard Settings',
      changes: JSON.stringify({ dashboardTitle, dashboardSubtitle }),
    });

    const settings = await prisma.setting.findMany();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json(settingsObj);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Migrate existing data: update completed field based on progress
async function migrateCompletedField() {
  try {
    const goals = await prisma.goal.findMany();
    let updated = 0;

    for (const goal of goals) {
      const shouldBeCompleted = goal.progress >= 100;
      if (goal.completed !== shouldBeCompleted) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { completed: shouldBeCompleted },
        });
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`✅ Migrated ${updated} goals to sync completed field with progress`);
    }
  } catch (error) {
    console.error('Error migrating completed field:', error);
  }
}

// Run migration on server start
migrateCompletedField().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Also accessible at http://localhost:${PORT}`);
  });
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
