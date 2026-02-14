import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// 取得所有下注統計
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [boyBets, girlBets, totalUsers] = await Promise.all([
      prisma.bet.aggregate({
        where: { gender: 'BOY' },
        _sum: { amount: true, ticketCount: true },
      }),
      prisma.bet.aggregate({
        where: { gender: 'GIRL' },
        _sum: { amount: true, ticketCount: true },
      }),
      prisma.user.count(),
    ]);

    res.json({
      boy: {
        totalAmount: boyBets._sum.amount || 0,
        totalTickets: boyBets._sum.ticketCount || 0,
      },
      girl: {
        totalAmount: girlBets._sum.amount || 0,
        totalTickets: girlBets._sum.ticketCount || 0,
      },
      totalUsers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// 取得當前使用者的下注記錄
router.get('/my-bets', requireAuth, async (req: Request, res: Response) => {
  try {
    const bets = await prisma.bet.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bets });
  } catch (error) {
    console.error('Get my bets error:', error);
    res.status(500).json({ error: 'Failed to get bets' });
  }
});

// 建立新下注
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { gender, paymentMethod } = req.body;

    // 驗證輸入
    if (!gender || !['BOY', 'GIRL'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender' });
    }

    // 檢查是否已經揭曉
    const config = await prisma.revealConfig.findFirst();
    if (config?.isRevealed) {
      return res.status(400).json({ error: 'Betting is closed - gender already revealed' });
    }

    // 檢查是否已經下注過（每人限一注）
    const existingBet = await prisma.bet.findFirst({
      where: { userId: req.session.userId },
    });
    if (existingBet) {
      return res.status(400).json({ error: '每人限下一注，您已經下注過了' });
    }

    // 建立下注記錄（固定 NT$200，1 張籤）
    const bet = await prisma.bet.create({
      data: {
        userId: req.session.userId!,
        gender,
        amount: 200,
        ticketCount: 1,
        paymentMethod: paymentMethod || 'bank_transfer',
        isPaid: false, // 預設未付款，需要管理員確認
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Bet created successfully',
      bet,
    });
  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({ error: 'Failed to create bet' });
  }
});

// 取得所有參與者列表（公開資訊）
router.get('/participants', async (req: Request, res: Response) => {
  try {
    const participants = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bets: {
          select: {
            gender: true,
            ticketCount: true,
          },
        },
      },
    });

    // 整理資料
    const formattedParticipants = participants.map(p => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      gender: p.bets.length > 0 ? p.bets[0].gender : null,
    }));

    res.json({ participants: formattedParticipants });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

export default router;
