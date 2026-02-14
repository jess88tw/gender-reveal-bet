import { Request, Response, NextFunction } from 'express';

// 擴展 Express Request 型別以包含 user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// 驗證使用者是否已登入
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized - Please login first' });
  }
  next();
};

// 驗證是否為管理員 (從環境變數 ADMIN_EMAILS 讀取)
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (!req.session.userEmail || !adminEmails.includes(req.session.userEmail)) {
    return res.status(403).json({ error: 'Forbidden - Admin only' });
  }
  
  next();
};
