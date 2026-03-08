import { buildBundle } from '@ledra/bundle';
import { loadRegistryFromFs } from '@ledra/core';
import { searchEntities, type SearchQueryInput } from '@ledra/search';
import { API_ENDPOINTS } from '@ledra/schemas';

export const appName = '@ledra/api';

export const createReadOnlyApi = (registryRoot = 'packages/sample-data/registry') => {
  const repository = loadRegistryFromFs(registryRoot);

  return {
    endpoints: API_ENDPOINTS,
    '/api/types': () => repository.listTypes(),
    '/api/entities': () => repository.listEntities(),
    '/api/entities/{type}/{id}': (type: string, id: string) =>
      repository.findEntity(type, id) ?? null,
    '/api/relations': () => repository.listRelations(),
    '/api/search': (query: SearchQueryInput) => searchEntities(query, repository),
    '/api/diagnostics': () => repository.diagnostics(),
    '/api/views': () => ({ bundle: buildBundle(repository), readOnly: true })
  };
};
