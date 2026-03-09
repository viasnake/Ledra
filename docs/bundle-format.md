# Bundle format

`ledra build` and `ledra export` produce a static bundle that the viewer can load without a live API.

## Top-level structure

```json
{
  "kind": "static-bundle",
  "schemaVersion": 1,
  "generatedAt": "2026-03-09T00:00:00.000Z",
  "graph": {
    "kind": "registry-graph",
    "schemaVersion": 1,
    "entities": [],
    "relations": [],
    "views": [],
    "policies": []
  },
  "diagnostics": {
    "readOnly": true,
    "schemaVersion": 1,
    "counts": {
      "entities": 0,
      "relations": 0,
      "views": 0,
      "policies": 0
    },
    "sourceFilePaths": []
  }
}
```

## Graph records

### Entities

Each entity record includes:

- `kind`: always `entity`
- `id`, `type`, `title`
- `summary` and `tags`
- `attributes`: built-in type-specific fields
- `sourceFilePath`

### Relations

Each relation record includes:

- `kind`: always `relation`
- `id`, `type`
- `source`: `{ type, id }`
- `target`: `{ type, id }`
- `sourceFilePath`

### Views

Each view record includes:

- `kind`: always `view`
- `id`, `title`
- `entityTypes`: scoped entity types for the viewer
- optional `query`
- `sourceFilePath`

### Policies

Each policy record includes:

- `kind`: always `policy`
- `id`, `title`
- `rules`
- `sourceFilePath`

## Stability guidance

- `schemaVersion` is the compatibility boundary for viewer and API consumers.
- `sourceFilePath` is preserved so diagnostics can link records back to Git-managed files.
- Consumers should treat unknown fields as forward-compatible additions.
