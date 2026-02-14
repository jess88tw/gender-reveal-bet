# 開發環境設定指南

## 系統需求

- Node.js 18+
- Git
- MongoDB Atlas 帳號 (免費)

## 快速開始

### 1. Clone 專案

```bash
git clone <your-repo-url>
cd gender-reveal-bet
```

### 2. 設定資料庫 (MongoDB Atlas)

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 建立帳號
2. 建立一個免費的 Cluster (M0 Sandbox)
3. 在 Security > Database Access 建立資料庫使用者
4. 在 Security > Network Access 加入你的 IP (或允許所有 IP: 0.0.0.0/0)
5. 在 Database > Connect 取得連線字串

### 3. 設定後端

```bash
cd backend

# 安裝依賴
npm install

# 複製環境變數範例
cp .env.example .env

# 編輯 .env 檔案
# 設定 DATABASE_URL 和其他必要變數
```

`.env` 設定範例:

```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gender-reveal?retryWrites=true&w=majority"
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:4444
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_secret_key_here
```

```bash
# 同步資料庫 Schema (MongoDB 不需要 migrate，用 db push)
npx prisma db push

# 產生 Prisma Client
npx prisma generate

# 啟動開發伺服器
npm run dev
```

後端會在 `http://localhost:3333` 啟動

### 4. 設定前端

開啟新的終端視窗:

```bash
cd frontend

# 安裝依賴
npm install

# 編輯環境變數
# 在 src/environments/environment.ts 設定 API URL 和 Google Client ID

# 啟動開發伺服器
npm start
```

前端會在 `http://localhost:4444` 啟動

## Google OAuth 設定 (開發環境)

### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 "Google+ API" 或 "Google Identity Services"

### 2. 建立 OAuth 2.0 憑證

1. 前往 "APIs & Services" > "Credentials"
2. 點擊 "Create Credentials" > "OAuth client ID"
3. 選擇 "Web application"
4. 設定:
   - **Authorized JavaScript origins**:
     - `http://localhost:4444`
   - **Authorized redirect URIs**:
     - `http://localhost:4444`
5. 儲存並複製 Client ID 和 Client Secret

### 3. 更新設定檔

**後端** (`backend/.env`):

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**前端** (`frontend/src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3333/api",
  googleClientId: "your_client_id_here.apps.googleusercontent.com",
};
```

## 資料庫管理工具

### Prisma Studio

視覺化介面管理資料庫:

```bash
cd backend
npx prisma studio
```

會在 `http://localhost:5555` 開啟

### 常用資料庫操作

```bash
# 同步 Schema 到資料庫 (MongoDB 用 db push)
npx prisma db push

# 重置資料庫 (會清除所有資料)
npx prisma db push --force-reset

# 更新 Prisma Client
npx prisma generate

# 開啟資料庫管理介面
npx prisma studio
```

## 開發工具推薦

### VS Code 擴充套件

- **Prisma**: 語法高亮和自動完成
- **Angular Language Service**: Angular 開發支援
- **ESLint**: 程式碼檢查
- **Prettier**: 程式碼格式化

### 瀏覽器擴充套件

- **Redux DevTools**: 狀態管理除錯
- **Angular DevTools**: Angular 應用除錯

## 測試

### 後端測試

```bash
cd backend
npm test
```

### 前端測試

```bash
cd frontend
npm test
```

## 常見問題

### 資料庫連線失敗

1. 確認 MongoDB Atlas Cluster 正在運行
2. 確認 `.env` 中的 `DATABASE_URL` 正確
3. 檢查 Network Access 是否有加入你的 IP
4. 測試連線: 使用 MongoDB Compass 連接

### CORS 錯誤

確認後端 `src/index.ts` 中的 CORS 設定:

```typescript
app.use(
  cors({
    origin: "http://localhost:4444",
    credentials: true,
  }),
);
```

### Prisma Client 錯誤

重新產生 Client:

```bash
cd backend
npx prisma generate
```

### Google 登入不工作

1. 檢查 Google OAuth 設定的網址
2. 確認 Client ID 正確無誤
3. 清除瀏覽器 Cookie 和快取

## 開發流程建議

### 1. 功能開發

```bash
# 建立新分支
git checkout -b feature/new-feature

# 開發...

# 提交
git add .
git commit -m "Add new feature"

# 推送
git push origin feature/new-feature
```

### 2. 資料庫變更

```bash
# 修改 schema.prisma

# 建立 migration
npx prisma migrate dev --name add_new_field

# 測試變更
npm run dev
```

### 3. API 測試

使用 Thunder Client (VS Code) 或 Postman 測試 API:

```
GET http://localhost:3333/api/bets/stats
POST http://localhost:3333/api/auth/google
POST http://localhost:3333/api/bets
```

## 除錯技巧

### 後端除錯

在 VS Code 中設定 `launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "cwd": "${workspaceFolder}/backend",
  "console": "integratedTerminal"
}
```

### 前端除錯

使用 Chrome DevTools:

1. 開啟 F12
2. 在 Sources 標籤設定中斷點
3. 查看 Network 標籤追蹤 API 請求

## 效能最佳化

### 資料庫查詢

使用 Prisma 的 `select` 和 `include` 減少查詢資料:

```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Angular 效能

- 使用 `OnPush` 變更偵測策略
- 使用新的 `@for` 語法時加入 `track` 追蹤
- 使用 lazy loading 載入路由
- 善用 signals 進行狀態管理

## 下一步

- 閱讀 [API 文件](./API.md)
- 查看 [部署指南](./DEPLOYMENT.md)
- 了解[專案架構](./README.md)
