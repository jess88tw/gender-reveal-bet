import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';

// 載入路由
import authRoutes from './routes/auth';
import betsRoutes from './routes/bets';
import cluesRoutes from './routes/clues';
import adminRoutes from './routes/admin';
import configRoutes from './routes/config';
import symptomsRoutes from './routes/symptoms';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// 中間件
if (isProduction) {
  app.set('trust proxy', 1); // Trust Render's reverse proxy
}
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      formAction: ["'self'", "https://accounts.google.com"],
    },
  } : false,
}));
app.use(cors({
  origin: isProduction ? false : (process.env.FRONTEND_URL || 'http://localhost:4200'),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction, // Trust proxy in production (Render)
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
}));

// 擴展 Session 型別
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userEmail: string;
  }
}

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bets', betsRoutes);
app.use('/api/clues', cluesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/symptoms', symptomsRoutes);

// 正式環境：serve Angular 靜態檔案
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist/frontend/browser');
  app.use(express.static(frontendPath));

  // SPA fallback — 所有非 API 路由導向 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // 開發環境：404 處理
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// 錯誤處理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (isProduction) {
    console.log(`🌐 Serving frontend from: ${path.join(__dirname, '../../frontend/dist/frontend/browser')}`);
  } else {
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);
  }
});

export default app;
