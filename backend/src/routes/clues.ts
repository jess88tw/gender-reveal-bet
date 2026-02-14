import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 取得所有線索（公開）
router.get('/', async (req: Request, res: Response) => {
  try {
    const clues = await prisma.clue.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({ clues });
  } catch (error) {
    console.error('Get clues error:', error);
    res.status(500).json({ error: 'Failed to get clues' });
  }
});

// 新增線索（管理員）
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, clueType, order } = req.body;

    if (!title || !clueType) {
      return res.status(400).json({ error: 'Title and clueType are required' });
    }

    const clue = await prisma.clue.create({
      data: {
        title,
        description,
        imageUrl,
        clueType,
        order: order || 0,
      },
    });

    res.status(201).json({ message: 'Clue created', clue });
  } catch (error) {
    console.error('Create clue error:', error);
    res.status(500).json({ error: 'Failed to create clue' });
  }
});

// 更新線索（管理員）
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, clueType, order } = req.body;

    const clue = await prisma.clue.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        clueType,
        order,
      },
    });

    res.json({ message: 'Clue updated', clue });
  } catch (error) {
    console.error('Update clue error:', error);
    res.status(500).json({ error: 'Failed to update clue' });
  }
});

// 刪除線索（管理員）
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.clue.delete({
      where: { id },
    });

    res.json({ message: 'Clue deleted' });
  } catch (error) {
    console.error('Delete clue error:', error);
    res.status(500).json({ error: 'Failed to delete clue' });
  }
});

export default router;
