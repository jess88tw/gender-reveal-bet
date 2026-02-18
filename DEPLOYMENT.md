# 部署指南

## 部署架構（合併部署）

```
┌─────────────────────────────────────────┐
│            Render (Web Service)          │
│                                         │
│   Express Server (Node.js)              │
│   ├── /api/*     → API 路由             │
│   └── /*         → Angular 靜態檔案     │
│                                         │
│   前後端同一個服務，同一個網域           │
│   https://your-app.onrender.com         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         MongoDB Atlas (雲端資料庫)       │
└─────────────────────────────────────────┘
```

> **為什麼合併部署？** Session cookie 不會有跨域問題，部署管理只需一個服務。

## 前置準備

### 1. MongoDB Atlas

資料庫已在使用中，部署前需確認：

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Network Access
2. **加入 `0.0.0.0/0`**（允許所有 IP，Render 免費方案無固定 IP）
3. 複製連線字串備用

### 2. Google OAuth 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. 編輯你的 OAuth 2.0 Client ID
3. 在「授權的 JavaScript 來源」加入：
   - `https://your-app.onrender.com`（Render 給你的網址）
4. 在「授權的重新導向 URI」加入（手機 redirect 登入用）：
   - `https://your-app.onrender.com/api/auth/google-redirect`

### 3. GitHub Repository

把程式碼推到 GitHub：

```bash
# 如果還沒有 remote
git remote add origin https://github.com/你的帳號/gender-reveal-bet.git
git push -u origin main
```

## 部署步驟（Render）

### 1. 建立 Web Service

1. 登入 [Render](https://render.com)（建議用 GitHub 帳號）
2. 點選 **New** → **Web Service**
3. 連結你的 GitHub repo（`gender-reveal-bet`）
4. 填入以下設定：

| 欄位              | 值                                |
| ----------------- | --------------------------------- |
| **Name**          | `gender-reveal-bet`（或任何名稱） |
| **Region**        | Singapore（離台灣最近）           |
| **Branch**        | `main`                            |
| **Runtime**       | `Node`                            |
| **Build Command** | `npm run render:build`            |
| **Start Command** | `npm start`                       |
| **Plan**          | Free                              |

### 2. 設定環境變數

在 Render Dashboard → Environment 加入：

| 變數               | 值                               | 說明                   |
| ------------------ | -------------------------------- | ---------------------- |
| `NODE_ENV`         | `production`                     | 啟用正式模式           |
| `DATABASE_URL`     | `mongodb+srv://...`              | MongoDB Atlas 連線字串 |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth ID        |
| `ADMIN_EMAILS`     | `your@email.com`                 | 管理員 Email           |
| `SESSION_SECRET`   | （自動產生或自訂強密碼）         | Session 加密           |

> **不需要設定** `PORT`（Render 自動分配）和 `FRONTEND_URL`（合併部署不需要）。

### 3. 點擊 Deploy

Render 會自動執行：

1. `npm run render:build` — 安裝前後端依賴 → 編譯 Angular → 編譯 TypeScript
2. `npm start` — 啟動 Express，同時 serve API 和前端靜態檔

部署完成後，你會得到一個網址：`https://your-app.onrender.com`

### 4. 同步資料庫

首次部署後，如果 Schema 還沒同步：

```bash
cd backend
DATABASE_URL="你的連線字串" npx prisma db push
```

## 自動部署

設定完成後，每次 push 到 `main` 分支，Render 會自動重新部署。

```bash
git add .
git commit -m "update"
git push
# Render 自動偵測 → 重新 build → 重啟服務
```

## Build 流程說明

```
npm run render:build
  │
  ├── npm run install:all
  │   ├── cd backend && npm install
  │   └── cd frontend && npm install
  │
  ├── npm run build:frontend
  │   └── ng build --configuration production
  │       → 輸出到 frontend/dist/frontend/browser/
  │
  └── npm run build:backend
      ├── npx prisma generate
      └── tsc
          → 輸出到 backend/dist/
```

Express 在正式環境會：

- 先處理 `/api/*` 路由
- 再 serve `frontend/dist/frontend/browser/` 靜態檔
- 所有其他路由 fallback 到 `index.html`（SPA routing）

## 免費方案注意事項

| 項目    | 說明                                       |
| ------- | ------------------------------------------ |
| ⏱️ 休眠 | 15 分鐘無流量會休眠，下次訪問等 ~30 秒喚醒 |
| 📊 額度 | 750 小時/月（足夠 1 個服務全月運行）       |
| 🌐 流量 | 100 GB/月                                  |
| 💾 空間 | 免費方案足夠                               |

> **活動當天提示**：提前 5 分鐘訪問網站確保已喚醒，之後不會再休眠。

## 測試部署

1. 訪問 `https://your-app.onrender.com`
2. 使用 Google 登入
3. 測試下注功能
4. 訪問 `/admin` 測試管理功能
5. 檢查 `/health` 確認後端正常

## 常見問題

### Google 登入失敗

- 確認 Google Cloud Console 的「授權的 JavaScript 來源」有加入 Render 網址
- 確認「授權的重新導向 URI」有加入 `https://your-app.onrender.com/api/auth/google-redirect`（手機登入用）
- 確認 `GOOGLE_CLIENT_ID` 環境變數正確
- LINE / Facebook 內建瀏覽器無法使用 Google 登入（Google 政策限制），前端已加入引導訊息

### Session / 登入狀態無法保持

- 確認 `NODE_ENV=production`（啟用 secure cookie + trust proxy）
- 確認 `SESSION_SECRET` 已設定

### 資料庫連線失敗

- 確認 MongoDB Atlas Network Access 有 `0.0.0.0/0`
- 確認 `DATABASE_URL` 格式正確（包含帳號密碼和資料庫名稱）

### 頁面空白（前端沒載入）

- 檢查 Render logs，確認 build 過程有成功編譯 Angular
- 確認 `npm run render:build` 有正確執行

## 安全建議

1. **SESSION_SECRET**: 使用強密碼（Render 可自動產生）
2. **HTTPS**: Render 自動提供 SSL 憑證
3. **MongoDB**: 正式上線後考慮限制 IP 白名單（需升級 Render 付費方案取得固定 IP）
4. **環境變數**: 絕不提交 `.env` 到 Git
5. **定期備份**: 在 MongoDB Atlas Dashboard 設定備份排程
