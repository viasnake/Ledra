# Docker deployment example

This runs Ledra as a read-only API backed by a mounted registry data repo.

## Run

```bash
docker compose -f deploy/docker/compose.yaml up --build -d
```

## Check

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/diagnostics
curl "http://localhost:8080/api/search?q=vlan"
```

## Stop

```bash
docker compose -f deploy/docker/compose.yaml down
```

The mounted path (`examples/minimal-registry` in this example) is the source-of-truth registry data repository.
