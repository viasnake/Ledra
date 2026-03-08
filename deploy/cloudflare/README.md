# Cloudflare Deploy Template

## 必要ツール

- Node.js 20+
- pnpm
- Wrangler (`pnpm dlx wrangler`)

## 手順

```bash
cp deploy/cloudflare/wrangler.toml.example deploy/cloudflare/wrangler.toml
pnpm install
pnpm build
cd deploy/cloudflare
pnpm dlx wrangler deploy
```

`wrangler.toml` の値は自身の Cloudflare アカウント情報へ置き換えてください。
