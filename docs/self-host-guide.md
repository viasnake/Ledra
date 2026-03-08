# Self-host guide

This guide shows how to run Ledra locally with a **registry data Git repository** as the source of truth.

## Requirements

- Node.js 20+
- npm (or pnpm equivalent)
- Git

## 1) Install and build

```bash
npm install
npm run build
```

## 2) Prepare a registry data repository

Use the included example as a baseline:

```bash
mkdir -p ./.local/registry-data
cp -R examples/minimal-registry/. ./.local/registry-data/
```

Treat `./.local/registry-data` as your Git-tracked registry repo:

```bash
cd ./.local/registry-data
git init
git add .
git commit -m "chore: bootstrap registry data"
cd ../..
```

## 3) Run CLI against registry data

All commands point to the registry repo via `--registry`.

```bash
node apps/cli/dist/apps/cli/src/index.js validate --registry ./.local/registry-data
node apps/cli/dist/apps/cli/src/index.js build --registry ./.local/registry-data
node apps/cli/dist/apps/cli/src/index.js inspect --registry ./.local/registry-data tokyo
node apps/cli/dist/apps/cli/src/index.js export --registry ./.local/registry-data
```

## 4) Use API handlers in read-only mode

`@ledra/api` exposes read-only endpoint handlers through `createReadOnlyApi(registryPath)`.

```bash
node -e "import('./apps/api/dist/apps/api/src/index.js').then(({createReadOnlyApi})=>{const api=createReadOnlyApi('./.local/registry-data');console.log(api['/api/diagnostics']());})"
```

## 5) Update loop (Git-native)

1. Commit changes in registry data repo.
2. Re-run `validate`.
3. Re-run `build` / `export` to refresh static output.
4. Redeploy Docker or Cloudflare assets.
