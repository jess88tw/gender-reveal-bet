# 寶寶性別揭曉派對 - 下注系統

一個讓朋友們可以線上下注寶寶性別的互動網站！

## 專案架構

- **前端**: Angular 17 (Standalone Components)
- **後端**: Node.js + Express + TypeScript
- **資料庫**: MongoDB Atlas (使用 Prisma ORM)
- **認證**: Google Identity Services (GIS)
- **設定管理**: 統一由 `backend/.env` 管理，前端透過 `/api/config` 取得公開設定

## 功能特色

- 🎲 線上下注男生/女生（每人限一注）
- 📊 即時統計下注情況
- 🎁 揭曉後抽獎功能（得主獨得獎金池扣 10% 手續費）
- 🔐 Google 帳號登入
- 📱 響應式設計
- 🖼️ 線索展示區（超音波、孕徵）
- 🤰 孕徵對照表（Boy or Girl 症狀比較卡片 + 計分條 + 爸媽預測）
- ⚙️ 管理後台（付款確認、性別揭曉、抽獎、孕徵管理、清除資料）
- 🏠 首頁動態揭曉效果（性別揭曉後色彩變化 + 得獎者公告卡片）
- 💳 三種付款方式專屬提示畫面（銀行轉帳、LINE Pay、現金）
- 🔒 隱私保護（無硬編碼帳號資訊，付款資訊請私訊主辦人）

## 下注規則

- 一注 NT$200
- 每人限下一注（男生或女生擇一）
- 性別揭曉後，從猜對的箱子中抽出一位幸運得主
- 得主獨得全部獎金池（扣除 10% 手續費作為奶粉錢 🍼）

## 快速開始

### 1. 後端設定

```bash
cd backend
npm install

# 複製環境變數範例，然後填入你自己的設定
cp .env.example .env
# 編輯 .env：設定 DATABASE_URL、GOOGLE_CLIENT_ID、ADMIN_EMAILS 等

# 同步資料庫 Schema
npx prisma db push
npx prisma generate

# 啟動開發伺服器
npm run dev
```

後端會在 `http://localhost:3333` 啟動

### 2. 前端設定

```bash
cd frontend
npm install
npm start
```

前端會在 `http://localhost:4444` 啟動

> **注意**: 前端不需要額外設定！Google Client ID 和管理員 Email 等設定都統一在 `backend/.env` 管理，前端啟動時會自動從 `/api/config` 取得。

## 設定說明

所有個人化設定都集中在 `backend/.env`（已被 .gitignore 忽略）：

| 變數               | 說明                           |
| ------------------ | ------------------------------ |
| `DATABASE_URL`     | MongoDB Atlas 連線字串         |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID         |
| `ADMIN_EMAILS`     | 管理員 Email（多位用逗號分隔） |
| `SESSION_SECRET`   | Session 加密密鑰               |
| `FRONTEND_URL`     | 前端網址（CORS 用）            |

## 部署

本專案使用 **Render 合併部署**（前後端同一服務），詳見 [部署指南](DEPLOYMENT.md)。

- **運行環境**: Render Web Service
- **資料庫**: MongoDB Atlas (雲端)

## 參與者

- **實體參與**: 家人和親密好友
- **線上參與**: 遠端朋友們
- **直播**: 揭曉時刻線上同步

---

Made with ❤️ for Baby's Gender Reveal Party
