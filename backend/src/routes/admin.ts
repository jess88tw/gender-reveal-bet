import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 取得揭曉狀態
router.get('/reveal-status', async (req: Request, res: Response) => {
  try {
    let config = await prisma.revealConfig.findFirst();
    
    if (!config) {
      config = await prisma.revealConfig.create({
        data: {},
      });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get reveal status error:', error);
    res.status(500).json({ error: 'Failed to get reveal status' });
  }
});

// 揭曉性別（管理員）
router.post('/reveal', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { gender } = req.body;

    if (!gender || !['BOY', 'GIRL'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender' });
    }

    // 檢查是否已經揭曉
    let config = await prisma.revealConfig.findFirst();
    
    if (config?.isRevealed) {
      return res.status(400).json({ error: 'Gender already revealed' });
    }

    // 更新揭曉狀態
    config = await prisma.revealConfig.upsert({
      where: { id: config?.id || 'new' },
      create: {
        revealedGender: gender,
        isRevealed: true,
        revealDate: new Date(),
      },
      update: {
        revealedGender: gender,
        isRevealed: true,
        revealDate: new Date(),
      },
    });

    res.json({
      message: 'Gender revealed successfully',
      config,
    });
  } catch (error) {
    console.error('Reveal gender error:', error);
    res.status(500).json({ error: 'Failed to reveal gender' });
  }
});

// 抽獎（管理員）
router.post('/draw-winner', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // 取得揭曉設定
    const config = await prisma.revealConfig.findFirst();

    if (!config?.isRevealed || !config.revealedGender) {
      return res.status(400).json({ error: 'Gender must be revealed first' });
    }

    if (config.winnerId) {
      return res.status(400).json({ error: 'Winner already drawn' });
    }

    // 取得所有猜對的下注記錄
    const correctBets = await prisma.bet.findMany({
      where: {
        gender: config.revealedGender,
        isPaid: true, // 只有已付款的才能參加抽獎
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (correctBets.length === 0) {
      return res.status(400).json({ error: 'No valid bets for drawing' });
    }

    // 建立抽獎池（每人一注 = 一張籤）
    const participantIds = correctBets.map(bet => bet.userId);

    // 隨機抽出一位得主
    const randomIndex = Math.floor(Math.random() * participantIds.length);
    const winnerId = participantIds[randomIndex];

    // 更新得獎者
    await prisma.revealConfig.update({
      where: { id: config.id },
      data: { winnerId },
    });

    // 取得得獎者資訊
    const winner = await prisma.user.findUnique({
      where: { id: winnerId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    // 計算獎金資訊（全部已付款下注的總金額）
    const allPaidBets = await prisma.bet.aggregate({
      where: { isPaid: true },
      _sum: { amount: true },
    });
    const totalPool = allPaidBets._sum.amount || 0;
    const fee = Math.round(totalPool * 0.1); // 10% 手續費（奶粉錢）
    const winnerPrize = totalPool - fee;

    res.json({
      message: 'Winner drawn successfully',
      winner,
      totalPool,
      fee,
      winnerPrize,
      totalParticipants: participantIds.length,
    });
  } catch (error) {
    console.error('Draw winner error:', error);
    res.status(500).json({ error: 'Failed to draw winner' });
  }
});

// 取得所有下注記錄（管理員）
router.get('/all-bets', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const bets = await prisma.bet.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bets });
  } catch (error) {
    console.error('Get all bets error:', error);
    res.status(500).json({ error: 'Failed to get bets' });
  }
});

// 確認付款（管理員）
router.patch('/confirm-payment/:betId', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;

    const bet = await prisma.bet.update({
      where: { id: betId },
      data: { isPaid: true },
    });

    res.json({ message: 'Payment confirmed', bet });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;
