import { searchEntities } from '@ledra/search';
import { VIEWER_POLICY } from '@ledra/schemas';
import type {
  EntityRecord,
  LedraBundle,
  RegistryGraph,
  RelationRecord,
  ViewRecord
} from '@ledra/types';

export const appName = '@ledra/web';
export const DEFAULT_BUNDLE_PATH = './bundle.json';
export const viewerMode = VIEWER_POLICY.mode;

export type FilteredViewState = {
  entities: readonly EntityRecord[];
  selectedView?: ViewRecord;
};

export type EntityRelationEntry = {
  direction: 'outgoing' | 'incoming';
  relation: RelationRecord;
};

const intersectEntityLists = (
  left: readonly EntityRecord[],
  right: readonly EntityRecord[]
): readonly EntityRecord[] => {
  const rightIds = new Set(right.map((entity) => entity.id));
  return left.filter((entity) => rightIds.has(entity.id));
};

export const getSelectedView = (
  graph: RegistryGraph,
  viewId: string | undefined
): ViewRecord | undefined => graph.views.find((view) => view.id === viewId);

export const filterEntitiesForViewer = (
  bundle: LedraBundle,
  searchText: string,
  selectedViewId?: string
): FilteredViewState => {
  const graph = bundle.graph;
  const selectedView = getSelectedView(graph, selectedViewId);
  let entities: readonly EntityRecord[] = graph.entities;

  if (selectedView) {
    const scopedTypes = new Set(selectedView.entityTypes);
    entities = entities.filter((entity) => scopedTypes.has(entity.type));

    if (selectedView.query) {
      entities = intersectEntityLists(entities, searchEntities(selectedView.query, graph));
    }
  }

  if (searchText.trim()) {
    entities = intersectEntityLists(entities, searchEntities(searchText, graph));
  }

  return selectedView ? { entities, selectedView } : { entities };
};

export const getEntityRelations = (
  bundle: LedraBundle,
  entityId: string
): readonly EntityRelationEntry[] => {
  return bundle.graph.relations.flatMap((relation): readonly EntityRelationEntry[] => {
    if (relation.source.id === entityId) {
      return [{ direction: 'outgoing' as const, relation }];
    }

    if (relation.target.id === entityId) {
      return [{ direction: 'incoming' as const, relation }];
    }

    return [];
  });
};

export const loadBundleFromUrl = async (bundlePath = DEFAULT_BUNDLE_PATH): Promise<LedraBundle> => {
  const response = await fetch(bundlePath, {
    headers: {
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load bundle from '${bundlePath}' (${response.status})`);
  }

  return (await response.json()) as LedraBundle;
};
