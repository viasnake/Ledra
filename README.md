# Ledra

Ledra is a **Git-native registry engine** for read-only, static-first delivery.

- **Git-native**: the registry data repository is the source of truth.
- **Read-only by design**: Ledra validates, indexes, and serves data without mutating it.
- **Static-first**: generate portable build artifacts first, then add API surfaces where needed.
- **IPAM is one use case**: the same model also works for DNS, service inventory, and other domains.

## Core workflow

1. Keep registry records in a Git repository (JSON/YAML).
2. Run Ledra validation and bundle build against that repo.
3. Publish generated static output and optional read-only API endpoints.

## Docs

- [Self-host guide](docs/self-host-guide.md)
- [CLI examples](docs/cli-examples.md)
- [Data repository structure](docs/data-repository-structure.md)
- [Read-only and static-first model](docs/read-only-and-delivery-model.md)
- [Reproducible deployment notes](docs/deployment-reproducible.md)
- [Docker example](deploy/docker/README.md)
- [Cloudflare example](deploy/cloudflare/README.md)
