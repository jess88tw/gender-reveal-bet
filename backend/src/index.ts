import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import dotenv from 'dotenv';

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

// 中間件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 錯誤處理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);
});

export default app;
