# 寶寶性別揭曉派對 - 下注系統

一個讓朋友們可以線上下注寶寶性別的互動網站！

## 專案架構

- **前端**: Angular 17 (Standalone Components)
- **後端**: Node.js + Express + TypeScript
- **資料庫**: MongoDB Atlas (使用 Prisma ORM)
- **認證**: Google OAuth / Line Login

## 功能特色

- 🎲 線上下注男生/女生
- 📊 即時統計下注情況
- 🎁 揭曉後抽獎功能
- 🔐 實名制登入
- 📱 響應式設計
- 🖼️ 線索展示區（超音波、孕徵）

## 下注規則

- 一注 NT$200
- 每人限下一注（男生或女生擇一）
- 性別揭曉後，從猜對的箱子中抽出一位幸運得主
- 得主獨得全部獎金池（扣除 10% 手續費作為奶粉錢 🍼）

## 快速開始

### 後端設定

```bash
cd backend
npm install
npm run dev
```

後端會在 `http://localhost:3333` 啟動

### 前端設定

```bash
cd frontend
npm install
npm start
```

前端會在 `http://localhost:4444` 啟動

## 部署建議

- **後端**: Railway / Render
- **前端**: Vercel / Netlify
- **資料庫**: MongoDB Atlas (雲端)

## 參與者

- **實體參與**: 家人和親密好友
- **線上參與**: 遠端朋友們
- **直播**: 揭曉時刻線上同步

---

Made with ❤️ for Baby's Gender Reveal Party
