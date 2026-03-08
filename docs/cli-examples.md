# CLI examples

Build first:

```bash
npm run build
```

Use a Git-tracked registry data repo (example path: `./.local/registry-data`).

## Validate

```bash
node apps/cli/dist/apps/cli/src/index.js validate --registry ./.local/registry-data
```

## Build static bundle + diagnostics

```bash
node apps/cli/dist/apps/cli/src/index.js build --registry ./.local/registry-data
```

## Inspect/search entities

```bash
node apps/cli/dist/apps/cli/src/index.js inspect --registry ./.local/registry-data vlan
```

## Export bundle JSON

```bash
node apps/cli/dist/apps/cli/src/index.js export --registry ./.local/registry-data > ./dist/bundle.json
```

## Serve command status

```bash
node apps/cli/dist/apps/cli/src/index.js serve
```

Current output:

```text
serve mode is read-only and scheduled after validate/build.
```
