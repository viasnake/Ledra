# Cloudflare deployment example (Workers + Assets)

This example publishes static assets and exposes a read-only `/api/views` endpoint.

## 1) Build Ledra

```bash
npm install
npm run build
```

## 2) Prepare source-of-truth registry repo path

```bash
mkdir -p ./.local/registry-data
cp -R examples/minimal-registry/. ./.local/registry-data/
```

## 3) Generate static build output for Cloudflare assets

```bash
mkdir -p deploy/cloudflare/public
node apps/cli/dist/apps/cli/src/index.js export --registry ./.local/registry-data > deploy/cloudflare/public/bundle.json
```

## 4) Configure Wrangler and deploy

```bash
cp deploy/cloudflare/wrangler.toml.example deploy/cloudflare/wrangler.toml
cd deploy/cloudflare
npx wrangler deploy
```

## Routes

- `/bundle.json` -> static artifact from CLI export
- `/api/views` -> Worker wraps `bundle.json` as `{ bundle, readOnly: true }`
- `/health` -> basic read-only health check
