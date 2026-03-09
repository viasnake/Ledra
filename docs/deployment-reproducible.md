# Reproducible deployment (Cloudflare / Docker)

This document ties the runnable examples under `deploy/` to the Git-native registry workflow.

## Shared principle

Use a registry data repository as source-of-truth input, then regenerate artifacts and redeploy:

```bash
node apps/cli/dist/apps/cli/src/index.js validate --registry <registry_repo_path>
node apps/cli/dist/apps/cli/src/index.js build --registry <registry_repo_path> --out dist/bundle.json
```

## Docker

- Files:
  - `deploy/docker/Dockerfile`
  - `deploy/docker/compose.yaml`
  - `deploy/docker/server.mjs`
- Uses mounted registry repo (`LEDRA_REGISTRY_PATH`) in read-only mode.

```bash
docker compose -f deploy/docker/compose.yaml up --build -d
```

## Cloudflare Workers + Assets

- Files:
  - `deploy/cloudflare/wrangler.toml.example`
  - `deploy/cloudflare/worker.mjs`
- Uses CLI export output wired into assets (`deploy/cloudflare/public/bundle.json`).

```bash
node apps/cli/dist/apps/cli/src/index.js export --registry <registry_repo_path> --out deploy/cloudflare/public/bundle.json
cd deploy/cloudflare && npx wrangler deploy
```
