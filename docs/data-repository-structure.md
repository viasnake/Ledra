# Data repository structure

Ledra reads a canonical `registry/` tree from a Git-managed data repository.

## Canonical layout

```text
registry/
  entity-types/
  entities/
    site/
      tokyo.yaml
    segment/
      core.yaml
    vlan/
      app.yaml
    prefix/
      app.yaml
    allocation/
      app-01.yaml
    host/
      app-01.yaml
    service/
      web.yaml
    dns_record/
      app.yaml
  relations/
    site-contains-segment.yaml
    service-resolves-to-dns.yaml
  views/
    site-overview.yaml
  policies/
    core.yaml
```

## Loader behavior

- `registry/entities`, `registry/relations`, `registry/views`, and `registry/policies` are required.
- Each record must live in exactly one file.
- Ledra reads `.json`, `.yaml`, and `.yml` files recursively.
- `sourceFilePath` is preserved for diagnostics and viewer/API output.

## Record guidance

- Keep `id` stable across refactors.
- Keep `type` explicit in every entity file.
- Put graph edges in `relations/`, not inline inside entity records.
- Use `views/` for read-only navigation presets.
- Use `policies/` for validation metadata, not imperative workflows.
