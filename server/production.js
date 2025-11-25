import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
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

app.post('/api/categories', async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.create({
      data: { name, color },
    });
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', details: error });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { color, name } = req.body;
    const updateData = {};
    if (color !== undefined) updateData.color = color;
    if (name !== undefined) updateData.name = name;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', details: error });
  }
});

// Goals endpoints
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        category: true,
        subGoals: {
          orderBy: { createdAt: 'asc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const transformedGoals = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      owner: goal.owner,
      category: goal.category.name,
      progress: goal.progress,
      size: goal.size,
      startDate: goal.startDate,
      dueDate: goal.dueDate,
      statusNote: goal.statusNote,
      order: goal.order,
      subGoals: goal.subGoals,
      notes: goal.notes,
    }));

    res.json(transformedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { category, subGoals, notes, ...goalData } = req.body;

    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category, color: '#6b7280' },
      });
    }

    const goal = await prisma.goal.create({
      data: {
        ...goalData,
        categoryId: categoryRecord.id,
        subGoals: subGoals
          ? {
              create: subGoals.map((sg) => ({
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
              create: notes.map((note) => ({
                id: note.id,
                content: note.content,
                isPinned: note.isPinned,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        subGoals: true,
        notes: true,
      },
    });

    res.json({
      ...goal,
      category: goal.category.name,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Bulk update goal orders (for drag and drop)
// IMPORTANT: This must be before /api/goals/:id to avoid route matching issues
app.put('/api/goals/reorder', async (req, res) => {
  try {
    const { goals } = req.body;

    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({ error: 'Invalid request: goals must be an array' });
    }

    await Promise.all(
      goals.map((goal) =>
        prisma.goal.update({
          where: { id: goal.id },
          data: { order: goal.order },
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering goals:', error);
    res.status(500).json({ error: 'Failed to reorder goals', details: error });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, subGoals, notes, ...goalData } = req.body;

    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category, color: '#6b7280' },
      });
    }

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
        categoryId: categoryRecord.id,
        subGoals: subGoals
          ? {
              create: subGoals.map((sg) => ({
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
              create: notes.map((note) => ({
                id: note.id,
                content: note.content,
                isPinned: note.isPinned,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        subGoals: true,
        notes: true,
      },
    });

    res.json({
      ...goal,
      category: goal.category.name,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Serve static files from the React app (dist folder)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// All other routes should serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Goalboard Server running!');
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://10.51.18.139:${PORT}`);
  console.log(`\nAccess from other devices using: http://10.51.18.139:${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
