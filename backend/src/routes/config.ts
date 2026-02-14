import express, { Request, Response } from 'express';

const router = express.Router();

// 公開設定 API（不需要登入）— 只回傳非敏感的設定
router.get('/', (req: Request, res: Response) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    adminEmails: (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean),
  });
});

export default router;
