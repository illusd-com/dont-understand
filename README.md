# 搞不懂 — Don't Understand

類似 Threads 的「搞不懂」討論平台，完全支援 Vercel。

## 環境變數（部署時必須設定）

在 Vercel 專案設定中加入以下變數：

| 變數 | 說明 | 範例 |
|------|------|------|
| `TURSO_DATABASE_URL` | Turso 資料庫 URL | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso Auth Token | `eyJ...` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 Site Key（公開） | `6Le...` |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 Secret Key（私密） | `6Le...` |

## 本機開發

1. 複製 `.env.example` 為 `.env.local` 並填入值
2. 在 Turso 執行 `migrations.sql` 建立資料表
3. `npm install && npm run dev`

## 部署

使用 Vercel MCP 或 Dashboard 連接 GitHub repo 即可自動部署。

## 功能
- 登入 / 註冊（含 reCAPTCHA v3）
- 需登入才能瀏覽與發文
- 時間軸 + 發文（最多 500 字）
- Turso 資料庫
