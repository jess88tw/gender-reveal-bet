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

// 驗證是否為管理員 (這裡簡單用特定 email 判斷)
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // TODO: 在這裡加入你的管理員 email
  const adminEmails = ['your-email@example.com']; 
  
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Forbidden - Admin only' });
  }
  
  next();
};
