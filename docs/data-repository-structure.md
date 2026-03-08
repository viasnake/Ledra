# Data repository structure

Ledra reads JSON/YAML entity files from a Git-managed registry repository.

Recommended layout:

```text
registry/
  entities/
    site/
      tokyo.yaml
    segment/
      core.json
    vlan/
      vlan-100.yaml
    prefix/
      prefix-10-0-0-0-24.json
```

## Loader behavior

- Scans recursively for `.json`, `.yaml`, `.yml`.
- Uses explicit `type`/`id` fields when present.
- If `type` is missing, Ledra infers it from path:
  - `entities/<type>/...` -> `<type>`
  - `<type>/...` -> `<type>`
- If `id` is missing, Ledra falls back to the filename stem.

## Record guidance

- One record per file for clean Git diffs.
- Keep `id` stable across refactors.
- Keep `relations` explicit (`{ type, targetId }`) for validator checks.
