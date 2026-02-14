# 部署指南

## 部署架構

```
Frontend (Angular 17) → Vercel/Netlify
Backend (Express)     → Railway/Render
Database (MongoDB)    → MongoDB Atlas (雲端)
```

## 資料庫 (MongoDB Atlas)

MongoDB Atlas 是雲端資料庫，不需要額外部署。

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 登入你的帳號
3. 在 Network Access 加入生產環境的 IP（或 0.0.0.0/0 允許所有）
4. 複製連線字串供後端使用

## 後端部署 (Railway)

### 1. 部署後端

```bash
cd backend

# 初始化 Git (如果還沒有的話)
git init
git add .
git commit -m "Initial commit"

# 連接到 Railway
railway login
railway link
railway up
```

### 2. 設定環境變數

在 Railway Dashboard 設定以下環境變數:

```
DATABASE_URL=<你的 MongoDB Atlas 連線字串>
NODE_ENV=production
FRONTEND_URL=<你的前端網址>
GOOGLE_CLIENT_ID=<Google OAuth Client ID>
ADMIN_EMAILS=<管理員 Email，多位用逗號分隔>
SESSION_SECRET=<隨機產生的密鑰>
PORT=3333
```

### 3. 同步資料庫 Schema

```bash
railway run npx prisma db push
railway run npx prisma generate
```

## 前端部署 (Vercel)

### 1. 安裝 Vercel CLI

```bash
npm i -g vercel
```

### 2. 部署

```bash
cd frontend

# 前端不需要額外設定環境變數
# Google Client ID 等設定會自動從後端 /api/config 取得
# 只需確認 environment.prod.ts 中的 apiUrl 指向你的後端 URL

# 建置
ng build --configuration production

# 部署
vercel
```

### 3. 環境設定

前端的 `src/environments/environment.prod.ts` 只需設定 `apiUrl`：

```typescript
export const environment = {
  production: true,
  apiUrl: "https://your-backend-domain.railway.app/api",
};
```

所有個人化設定（Google Client ID、Admin Emails）都由後端統一提供。

## Google OAuth 設定

### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案
3. 啟用 "Google+ API"

### 2. 建立 OAuth 認證

1. 前往 "APIs & Services" > "Credentials"
2. 建立 OAuth 2.0 Client ID
3. 應用程式類型: Web application
4. 授權的 JavaScript 來源:
   - `http://localhost:4444` (開發環境)
   - `https://your-frontend-domain.vercel.app` (正式環境)
5. 授權的重新導向 URI:
   - `http://localhost:4444` (開發環境)
   - `https://your-frontend-domain.vercel.app` (正式環境)

### 3. 取得憑證

- 複製 Client ID
- 將它設定到後端環境變數 `GOOGLE_CLIENT_ID`
- 前端會自動從 `/api/config` 取得，不需要額外設定

## 資料庫初始設定

部署完成後,使用 Prisma Studio 建立第一個 RevealConfig:

```bash
# 連線到資料庫
railway run npx prisma studio
```

在 Prisma Studio 中:

1. 開啟 RevealConfig 表
2. 新增一筆記錄,所有欄位保持預設值

## 測試

1. 訪問前端網址
2. 使用 Google 登入
3. 測試下注功能
4. 檢查統計是否正確更新

## 監控

### Railway

- 查看後端 logs: `railway logs`
- 監控資源使用

### Vercel

- 在 Dashboard 查看部署狀態
- 檢查 Analytics

### MongoDB Atlas

- 在 Atlas Dashboard 監控連線數
- 查看資料庫效能指標

## 常見問題

### CORS 錯誤

- 確認後端 `FRONTEND_URL` 環境變數正確
- 檢查前端是否使用 `withCredentials: true`

### Google 登入失敗

- 確認 Google OAuth 設定的網址正確
- 檢查 Client ID 是否正確設定

### 資料庫連線失敗

- 檢查 `DATABASE_URL` 格式 (MongoDB 連線字串)
- 確認 MongoDB Atlas Network Access 設定正確
- 確認已執行 `npx prisma db push`

## 維護

### 更新後端

```bash
cd backend
git add .
git commit -m "Update"
railway up
```

### 更新前端

```bash
cd frontend
ng build --configuration production
vercel --prod
```

### 備份資料庫

在 MongoDB Atlas Dashboard:

1. 進入 Database
2. 使用內建的備份功能
3. 或使用 `mongodump` 工具匯出資料

## 成本估算

- **Railway**: 免費額度 $5/月,足夠小型應用
- **Vercel**: 免費方案,頻寬 100GB/月
- **MongoDB Atlas**: M0 免費層 (512MB 儲存空間)
- **總計**: 基本上免費,除非流量很大

## 安全建議

1. 定期更新 `SESSION_SECRET`
2. 使用 HTTPS (Vercel/Railway 自動提供)
3. 設定適當的 CORS 來源
4. 定期備份資料庫
5. 監控異常登入活動
6. 在 MongoDB Atlas 設定 IP 白名單
