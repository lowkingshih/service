# Supabase 部署指南

本文件說明如何將本地 Supabase 變更部署到遠端環境。

## 前置需求

1. 安裝 Supabase CLI

```bash
npm install -g supabase
```

2. 設定環境變數

- 建立 `.env.local` 檔案：

```bash
SUPABASE_ACCESS_TOKEN=your_access_token
SUPABASE_PROJECT_ID=your_project_id
```

注意：專案使用 `.env.local` 來管理環境變數，這個檔案不會被 git 追蹤，確保敏感資訊的安全性。

## 使用 NPM Scripts

專案提供了一系列的 npm scripts 來簡化 Supabase 操作，所有命令都會自動讀取 `.env.local` 的設定：

### 部署相關

```bash
# 部署到遠端
npm run supa:deploy

# 檢查部署狀態
npm run supa:check
```

### 本地開發

```bash
# 啟動本地 Supabase
npm run supa:start

# 停止本地 Supabase
npm run supa:stop

# 檢查本地狀態
npm run supa:status
```

### 資料庫操作

```bash
# 重置本地資料庫
npm run db:reset

# 檢視資料庫變更
npm run db:diff

# 列出所有 migrations
npm run supa:list

# 建立新的 migration
npm run db:new

# 本地測試環境重置
npm run supa:test
```

## 環境變數設定

1. 取得必要資訊：

   - SUPABASE_PROJECT_ID：從專案 URL 取得
     ```
     https://supabase.com/dashboard/project/YOUR_PROJECT_ID
     ```
   - SUPABASE_ACCESS_TOKEN：從 Dashboard > Account > Access Tokens 產生

2. 建立 `.env.local`：

```bash
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_ACCESS_TOKEN=your_access_token
```

## 開發工作流程建議

1. 開始開發：

```bash
npm run supa:start
```

2. 建立新的變更：

```bash
npm run db:new
# 編輯新建立的 migration 檔案
```

3. 測試變更：

```bash
npm run supa:test
```

4. 檢查變更：

```bash
npm run supa:check
```

5. 部署變更：

```bash
npm run supa:deploy
```

## GitHub Actions 部署

1. 在 GitHub 專案設定中加入以下 Secrets：

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`

2. 部署會在以下情況自動觸發：

- 推送到 `main` 分支
- 手動觸發 workflow

## 部署內容

部署流程會：

1. 推送資料庫變更（migrations）
2. 部署 Edge Functions（如果有的話）

## 故障排除

1. 環境變數問題：

- 確認 `.env.local` 檔案存在
- 確認檔案內容正確
- 確認權限設定正確

2. 權限錯誤：

```sql
-- 在 Supabase Dashboard 執行：
grant all on all tables in schema graphql to postgres, anon, authenticated, service_role;
grant all on all functions in schema graphql to postgres, anon, authenticated, service_role;
grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
```

3. 表格擁有者問題：

```sql
ALTER TABLE table_name OWNER TO postgres;
```

## 注意事項

1. `.env.local` 不應該被提交到 git
2. 定期更新 access token
3. 在推送前先在本地測試所有變更
4. 定期備份資料庫
5. 檢查 migration 版本是否正確

## 指令參考

1. 檢查 migration 狀態：

```bash
supabase migration list
```

2. 檢視變更內容：

```bash
supabase db diff
```

3. 重置本地資料庫：

```bash
supabase db reset
```
