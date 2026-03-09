# CLI examples

Build first:

```bash
npm install
npm run build
```

Assume the registry repo path is `./.local/registry-data`.

## Validate registry graph

```bash
node apps/cli/dist/apps/cli/src/index.js validate --registry ./.local/registry-data
```

## Inspect entities

```bash
node apps/cli/dist/apps/cli/src/index.js inspect --registry ./.local/registry-data --query "type=host"
node apps/cli/dist/apps/cli/src/index.js inspect --registry ./.local/registry-data --query '{"type":"prefix","attributes":[{"field":"vlanId","operator":"=","value":"vlan-10"}]}'
```

## Build bundle JSON

```bash
node apps/cli/dist/apps/cli/src/index.js build --registry ./.local/registry-data --out ./dist/bundle.json
```

## Export bundle JSON

```bash
node apps/cli/dist/apps/cli/src/index.js export --registry ./.local/registry-data --out ./dist/bundle.json
```

## Run read-only API

```bash
node apps/cli/dist/apps/cli/src/index.js serve --registry ./.local/registry-data --port 3000
```
