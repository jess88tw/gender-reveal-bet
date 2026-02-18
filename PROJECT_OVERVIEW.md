# 寶寶性別揭曉派對 - 專案概覽

## 🎯 專案目標

建立一個互動式網站,讓朋友和家人可以線上下注寶寶性別,並在揭曉時進行抽獎。

## 📁 專案結構

```
gender-reveal-bet/
├── backend/                 # Node.js + Express 後端
│   ├── prisma/
│   │   └── schema.prisma   # 資料庫 Schema (MongoDB)
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   ├── auth.ts     # 認證相關 (Google Identity Services)
│   │   │   ├── bets.ts     # 下注相關
│   │   │   ├── clues.ts    # 線索相關
│   │   │   ├── symptoms.ts # 孕徵對照 CRUD
│   │   │   ├── admin.ts    # 管理功能
│   │   │   └── config.ts   # 公開設定 API
│   │   ├── middleware/     # 中間件 (auth, admin)
│   │   ├── lib/           # 工具函式 (prisma client)
│   │   └── index.ts       # 主程式
│   ├── .env.example        # 環境變數範例
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Angular 17 前端 (Standalone)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI 元件
│   │   │   │   ├── home/           # 首頁 (統計顯示)
│   │   │   │   ├── betting/        # 下注頁面
│   │   │   │   ├── my-bets/        # 我的下注記錄
│   │   │   │   ├── clues/          # 線索頁面
│   │   │   │   ├── participants/   # 參與者列表
│   │   │   │   └── admin/          # 管理後台
│   │   │   ├── services/    # API 服務 (使用 signals)
│   │   │   │   ├── config.service.ts  # 統一設定 (APP_INITIALIZER)
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── bet.service.ts
│   │   │   │   ├── clue.service.ts
│   │   │   │   └── admin.service.ts
│   │   │   ├── models/      # 資料模型
│   │   │   └── app.routes.ts # 路由設定 (lazy loading)
│   │   └── environments/    # 環境設定 (僅 apiUrl)
│   └── package.json
│
├── README.md               # 專案說明
├── DEVELOPMENT.md          # 開發指南
├── DEPLOYMENT.md           # 部署指南
└── PROJECT_OVERVIEW.md     # 本文件
```

## ⚙️ 設定管理架構

所有個人化設定統一在 `backend/.env`（已被 .gitignore 忽略）：

```
backend/.env  ──→  GET /api/config  ──→  前端 ConfigService (APP_INITIALIZER)
                   (只回傳非敏感資料)       ↓
                                      auth.service.ts (Google Client ID, Admin Emails)
                                      auth.ts middleware (Admin Emails)
```

前端不需要在 `environment.ts` 中設定個人化資訊，一切從後端動態載入。

## ✅ 已完成功能

### 後端 API

- ✅ 使用者認證 (Google Identity Services — ID Token 驗證)
- ✅ 統一設定 API (`GET /api/config` — 回傳 googleClientId + adminEmails)
- ✅ 下注系統
  - 每人限下一注（NT$200，男生或女生擇一）
  - 查詢個人下注記錄
  - 查詢統計資訊
  - 參與者列表
- ✅ 線索管理
  - CRUD 操作
- ✅ 孕徵對照系統
  - 預設 9 項孕徵初始化（肚型、皮膚、喜食口味等）
  - 管理員切換 BOY/GIRL 勾選
  - 新增/刪除自訂孕徵
  - 爸媽預測設定（dadPrediction / momPrediction）
- ✅ 管理功能
  - 查看所有下注 / 付款確認
  - 性別揭曉
  - 抽獎系統（猜對者中抽一位，獎金扣 10% 手續費）
  - 揭曉狀態 API（`GET /api/admin/reveal-status` — 含得獎者資訊與獎金明細）
  - 爸媽預測更新（`PATCH /admin/predictions`）
  - 清空資料（開發用，含孕徵）— 自動銷毀 Session 避免殘留登入狀態

### 前端介面

- ✅ 首頁 (`home.component`) - 統計顯示 + 管理員入口 + 揭曉動態效果（性別色彩變化）+ 得獎者公告卡片 + 揭曉後「敬請期待」提示 + 每 30 秒自動更新狀態
- ✅ 下注頁面 (`betting.component`) - 選擇性別，固定 NT$200 + 三種付款方式專屬成功畫面（銀行轉帳/LINE Pay/現金）
- ✅ 我的下注 (`my-bets.component`) - Hero 下注卡片 + 付款方式專屬提醒 + 下注詳情
- ✅ 線索頁面 (`clues.component`) - Boy or Girl 孕徵對照卡片（深色主題、BOY/GIRL 計分條、爸媽預測標籤）+ 其他線索卡片 + 揭曉後隱藏下注按鈕
- ✅ 參與者列表 (`participants.component`) - 顯示性別選擇
- ✅ 管理後台 (`admin.component`) - 付款確認、揭曉、抽獎、孕徵管理（toggle / 新增 / 刪除 / 初始化）、爸媽預測設定、清除資料 + 得獎資訊持久化 + 清除資料時自動登出並導向首頁

### 前端服務

- ✅ 設定服務 (`config.service.ts`) - 啟動時從後端載入設定，使用 `APP_INITIALIZER`
- ✅ 認證服務 (`auth.service.ts`) - Google GIS 登入，使用 signals + 取消登入不破版 + `clearUser()` 方法
- ✅ 下注服務 (`bet.service.ts`) - 使用 signals + 揭曉狀態查詢 + 得獎者/獎金資訊
- ✅ 線索服務 (`clue.service.ts`) - 使用 signals + 孕徵 CRUD（getSymptoms、initSymptoms、toggleSymptom、createSymptom、deleteSymptom）
- ✅ 管理服務 (`admin.service.ts`) - 使用 signals + 得獎者/獎金持久化 signals + 爸媽預測更新

### 資料庫

- ✅ Prisma Schema 設計 (MongoDB)
- ✅ User 表（支援 Google 登入）
- ✅ Bet 表（userId @unique — 每人限一注）
- ✅ Clue 表
- ✅ RevealConfig 表（含 dadPrediction / momPrediction）
- ✅ Symptom 表（category、boyDescription、girlDescription、checkedGender、order）

## 🚧 待完成功能

### 短期

1. **LINE Login 整合**: 目前按鈕已保留但尚未實作
2. **檔案上傳功能**: 線索圖片上傳（可用 Cloudinary / AWS S3）
3. **即時通知**: 使用 WebSocket 或 Server-Sent Events
4. **付款整合**: 串接台灣金流（綠界、藍新）

### 長期

1. **多語言支援**: i18n（中文/英文）
2. **直播整合**: YouTube Live / Twitch 嵌入
3. **主題切換**: 深色/淺色模式

## 🔒 安全注意事項

1. **環境變數**: 絕對不要提交 `.env` 到 Git — 已透過 `.gitignore` 排除
2. **設定分離**: 所有個人 ID / Email 統一放在 `backend/.env`，原始碼中不含硬編碼（包含銀行帳號等付款資訊，一律提示「請私訊主辦人」）
3. **Config API**: `GET /api/config` 只回傳可公開資料（Google Client ID、Admin Emails），不回傳密碼或 Secret
4. **Session Secret**: 使用強密碼並定期更換
5. **輸入驗證**: 後端必須驗證所有輸入
6. **HTTPS**: 正式環境必須使用 HTTPS

## 🎉 性別揭曉日清單

揭曉當天要做的事:

- [ ] 確認所有下注付款都已確認（管理後台）
- [ ] 準備揭曉影片/道具
- [ ] 在管理後台揭曉性別
- [ ] 執行抽獎功能
- [ ] 公布得獎者
- [ ] 統計奶粉錢總額

祝你的寶寶性別派對圓滿成功！🎊👶

---

## 快速指令參考

### 後端

```bash
cd backend
npm run dev          # 啟動開發伺服器 (port 3333)
npx prisma studio    # 開啟資料庫管理介面
npx prisma db push   # 同步 Schema 到 MongoDB
```

### 前端

```bash
cd frontend
npm start           # 啟動開發伺服器 (port 4444)
ng build --configuration production  # 建置正式版本
ng generate component components/<name>  # 建立新元件
```

### 部署

```bash
# 後端 (Railway)
railway login
railway link
railway up

# 前端 (Vercel)
vercel
vercel --prod
```
