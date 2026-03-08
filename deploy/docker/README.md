# Docker Deploy Template

## 手順

```bash
docker compose -f deploy/docker/compose.yaml build
docker compose -f deploy/docker/compose.yaml up -d
docker compose -f deploy/docker/compose.yaml logs -f
```

## 停止

```bash
docker compose -f deploy/docker/compose.yaml down
```
