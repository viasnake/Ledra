# Read-only and static-first delivery model

## Read-only contract

Ledra CLI/API/viewer are read-only views of registry data.

- No write endpoint is exposed.
- Data changes happen through commits in the registry data Git repository.
- Diagnostics include `sourceFilePath` so reviewers can trace entities, relations, views, and policies to versioned files.

## Static-first workflow

1. Validate data:

   ```bash
   node apps/cli/dist/apps/cli/src/index.js validate --registry <registry_repo_path>
   ```

2. Build/export static bundle:

   ```bash
   node apps/cli/dist/apps/cli/src/index.js export --registry <registry_repo_path> --out dist/bundle.json
   ```

3. Serve `bundle.json` directly from static hosting or wrap the same registry in read-only API endpoints.

## Why this model

- Operationally simple and cache-friendly.
- Strong audit trail through Git history.
- Clear trust boundary: the registry Git repo is the single source of truth.
