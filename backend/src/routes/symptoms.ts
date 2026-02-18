import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 預設孕徵列表
const DEFAULT_SYMPTOMS = [
  { category: '肚型', boyDescription: '尖尖', girlDescription: '圓圓', order: 1 },
  { category: '皮膚', boyDescription: '會變糟', girlDescription: '變光滑', order: 2 },
  { category: '喜食口味', boyDescription: '酸、鹹食', girlDescription: '甜、甜食', order: 3 },
  { category: '肚臍', boyDescription: '突出', girlDescription: '不突出', order: 4 },
  { category: '害喜反應', boyDescription: '不重', girlDescription: '重', order: 5 },
  { category: '胎心音', boyDescription: '< 140', girlDescription: '> 140', order: 6 },
  { category: '腳', boyDescription: '不水腫', girlDescription: '很水腫', order: 7 },
  { category: '體溫', boyDescription: '偏高', girlDescription: '偏低', order: 8 },
  { category: '心情', boyDescription: '愉快', girlDescription: '多變', order: 9 },
];

// 取得所有孕徵（公開）
router.get('/', async (req: Request, res: Response) => {
  try {
    const symptoms = await prisma.symptom.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({ symptoms });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({ error: 'Failed to get symptoms' });
  }
});

// 初始化預設孕徵（管理員）
router.post('/init', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // 檢查是否已有資料
    const count = await prisma.symptom.count();
    if (count > 0) {
      return res.status(400).json({ error: '孕徵資料已存在，如需重新初始化請先清除' });
    }

    // 批次建立預設孕徵
    const created = await prisma.symptom.createMany({
      data: DEFAULT_SYMPTOMS,
    });

    const symptoms = await prisma.symptom.findMany({
      orderBy: { order: 'asc' },
    });

    res.status(201).json({
      message: `已建立 ${created.count} 筆預設孕徵`,
      symptoms,
    });
  } catch (error) {
    console.error('Init symptoms error:', error);
    res.status(500).json({ error: 'Failed to initialize symptoms' });
  }
});

// 新增孕徵（管理員）
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category, boyDescription, girlDescription, order } = req.body;

    if (!category || !boyDescription || !girlDescription) {
      return res.status(400).json({ error: 'category, boyDescription, girlDescription are required' });
    }

    const symptom = await prisma.symptom.create({
      data: {
        category,
        boyDescription,
        girlDescription,
        order: order || 0,
      },
    });

    res.status(201).json({ message: 'Symptom created', symptom });
  } catch (error) {
    console.error('Create symptom error:', error);
    res.status(500).json({ error: 'Failed to create symptom' });
  }
});

// 更新孕徵（管理員）
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, boyDescription, girlDescription, checkedGender, order } = req.body;

    const symptom = await prisma.symptom.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(boyDescription !== undefined && { boyDescription }),
        ...(girlDescription !== undefined && { girlDescription }),
        ...(checkedGender !== undefined && { checkedGender }),
        ...(order !== undefined && { order }),
      },
    });

    res.json({ message: 'Symptom updated', symptom });
  } catch (error) {
    console.error('Update symptom error:', error);
    res.status(500).json({ error: 'Failed to update symptom' });
  }
});

// 切換孕徵勾選（管理員）— 快捷操作
router.patch('/toggle/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { gender } = req.body; // 'BOY', 'GIRL', or null (取消勾選)

    if (gender !== null && gender !== 'BOY' && gender !== 'GIRL') {
      return res.status(400).json({ error: 'gender must be BOY, GIRL, or null' });
    }

    const symptom = await prisma.symptom.update({
      where: { id },
      data: { checkedGender: gender },
    });

    res.json({ message: 'Symptom toggled', symptom });
  } catch (error) {
    console.error('Toggle symptom error:', error);
    res.status(500).json({ error: 'Failed to toggle symptom' });
  }
});

// 刪除孕徵（管理員）
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.symptom.delete({
      where: { id },
    });

    res.json({ message: 'Symptom deleted' });
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
});

// 清空所有孕徵（管理員）
router.delete('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await prisma.symptom.deleteMany();
    res.json({ message: `已清除 ${result.count} 筆孕徵` });
  } catch (error) {
    console.error('Clear symptoms error:', error);
    res.status(500).json({ error: 'Failed to clear symptoms' });
  }
});

export default router;
