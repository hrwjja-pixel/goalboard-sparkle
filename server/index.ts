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

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

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

// Categories endpoints
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
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
    const { name, color } = req.body;
    const category = await prisma.category.create({
      data: { name, color },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Category',
      entityId: category.id,
      entityTitle: category.name,
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
    const showCompleted = req.query.showCompleted === 'true';

    const goals = await prisma.goal.findMany({
      where: showCompleted ? {} : { completed: false },
      include: {
        categories: true,
        subGoals: {
          orderBy: { createdAt: 'asc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
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
      categories: goal.categories.map(cat => cat.name),
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      completed: goal.completed,
      subGoals: goal.subGoals,
      notes: goal.notes,
    }));

    res.json(transformedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req: AuthRequest, res: Response) => {
  try {
    const { categories, subGoals, notes, ...goalData } = req.body;

    // Validate categories (1-5 required)
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: 'Must provide 1-5 categories' });
    }

    // Find or create categories
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName: string) => {
        let categoryRecord = await prisma.category.findUnique({
          where: { name: categoryName },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { name: categoryName, color: '#6b7280' },
          });
        }

        return categoryRecord;
      })
    );

    const goal = await prisma.goal.create({
      data: {
        ...goalData,
        categories: {
          connect: categoryRecords.map(cat => ({ id: cat.id })),
        },
        subGoals: subGoals
          ? {
              create: subGoals.map((sg: any) => ({
                id: sg.id,
                title: sg.title,
                description: sg.description,
                owner: sg.owner,
                progress: sg.progress,
                startDate: sg.startDate,
                dueDate: sg.dueDate,
                statusNote: sg.statusNote,
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
        subGoals: true,
        notes: true,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'CREATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
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
      data: { completed },
      include: {
        categories: true,
        subGoals: true,
        notes: true,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
      changes: JSON.stringify({ completed }),
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
    const { categories, subGoals, notes, ...goalData } = req.body;

    // Validate categories (1-5 required)
    if (!categories || !Array.isArray(categories) || categories.length < 1 || categories.length > 5) {
      return res.status(400).json({ error: 'Must provide 1-5 categories' });
    }

    // Find or create categories
    const categoryRecords = await Promise.all(
      categories.map(async (categoryName: string) => {
        let categoryRecord = await prisma.category.findUnique({
          where: { name: categoryName },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { name: categoryName, color: '#6b7280' },
          });
        }

        return categoryRecord;
      })
    );

    // Delete existing subgoals and notes, then recreate
    await prisma.subGoal.deleteMany({
      where: { goalId: id },
    });

    await prisma.note.deleteMany({
      where: { goalId: id },
    });

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...goalData,
        categories: {
          set: categoryRecords.map(cat => ({ id: cat.id })),
        },
        subGoals: subGoals
          ? {
              create: subGoals.map((sg: any) => ({
                id: sg.id,
                title: sg.title,
                description: sg.description,
                owner: sg.owner,
                progress: sg.progress,
                startDate: sg.startDate,
                dueDate: sg.dueDate,
                statusNote: sg.statusNote,
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
        subGoals: true,
        notes: true,
      },
    });

    // Audit log
    await (req as any).audit?.({
      action: 'UPDATE',
      entityType: 'Goal',
      entityId: goal.id,
      entityTitle: goal.title,
    });

    res.json({
      ...goal,
      categories: goal.categories.map(cat => cat.name),
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get goal title before deletion for audit log
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
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Also accessible at http://localhost:${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
