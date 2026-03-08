# 再現可能なデプロイ手順（Cloudflare / Docker）

このドキュメントは `deploy/cloudflare` と `deploy/docker` のテンプレートを使って、第三者が同じ手順でデプロイできることを目的にしています。

## Cloudflare へのデプロイ

参照テンプレート:

- `deploy/cloudflare/wrangler.toml.example`
- `deploy/cloudflare/worker.mjs`
- `deploy/cloudflare/README.md`

手順:

1. テンプレートをコピー。

   ```bash
   cp deploy/cloudflare/wrangler.toml.example deploy/cloudflare/wrangler.toml
   ```

2. `deploy/cloudflare/wrangler.toml` の `name`, `account_id`, `route` を編集。
3. static 成果物（例: `dist/`）をビルド。
4. `deploy/cloudflare/README.md` のコマンドで `wrangler deploy` を実行。

## Docker へのデプロイ

参照テンプレート:

- `deploy/docker/Dockerfile.template`
- `deploy/docker/compose.yaml`
- `deploy/docker/README.md`

手順:

1. 必要に応じて `Dockerfile.template` を `Dockerfile` として利用。
2. `compose.yaml` の `image`, `ports`, `volumes` を環境に合わせて調整。
3. 以下を実行。

   ```bash
   docker compose -f deploy/docker/compose.yaml build
   docker compose -f deploy/docker/compose.yaml up -d
   ```

4. `http://localhost:8080/health` 等で read-only 提供を確認。

