import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google 登入
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // 驗證 Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    // 查找或建立使用者
    let user = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: payload.sub,
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email,
          avatarUrl: payload.picture,
          provider: 'google',
          providerId: payload.sub,
        },
      });
    }

    // 設定 session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Google 登入 — redirect 模式（手機用）
// GIS 在手機上 popup/iframe 常卡在 /gsi/transform，改用 ux_mode:'redirect'
// Google 會將 credential 以 form POST 傳送到此端點
router.post('/google-redirect', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.redirect('/?login_error=missing_credential');
    }

    // 驗證 Google token（與 /google 端點相同邏輯）
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return res.redirect('/?login_error=invalid_token');
    }

    // 查找或建立使用者
    let user = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: payload.sub,
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email,
          avatarUrl: payload.picture,
          provider: 'google',
          providerId: payload.sub,
        },
      });
    }

    // 設定 session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    // 確保 session 儲存後再 redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/?login_error=session_error');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Google redirect auth error:', error);
    res.redirect('/?login_error=auth_failed');
  }
});

// 登出
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// 取得當前使用者資訊
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
