import { useEffect, useMemo, useState } from 'react';
import type { EntityRecord, LedraBundle } from '@ledra/types';
import {
  DEFAULT_BUNDLE_PATH,
  filterEntitiesForViewer,
  getEntityRelations,
  loadBundleFromUrl,
  viewerMode
} from './index';
import './styles.css';

type AppState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; bundle: LedraBundle; bundlePath: string };

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
};

const getBundlePath = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_BUNDLE_PATH;
  }

  return new URL(window.location.href).searchParams.get('bundle') ?? DEFAULT_BUNDLE_PATH;
};

const EntityList = ({
  entities,
  selectedEntityId,
  onSelect
}: {
  entities: readonly EntityRecord[];
  selectedEntityId: string | undefined;
  onSelect: (entityId: string) => void;
}) => (
  <div className="panel entity-panel">
    <div className="panel-header">
      <p className="eyebrow">Registry</p>
      <h2>Entities</h2>
      <span>{entities.length}</span>
    </div>
    <div className="entity-list">
      {entities.map((entity) => (
        <button
          key={entity.id}
          className={entity.id === selectedEntityId ? 'entity-card selected' : 'entity-card'}
          onClick={() => onSelect(entity.id)}
          type="button"
        >
          <span className="entity-type">{entity.type}</span>
          <strong>{entity.title}</strong>
          <span>{entity.id}</span>
        </button>
      ))}
    </div>
  </div>
);

const App = () => {
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const [selectedViewId, setSelectedViewId] = useState<string | undefined>(undefined);
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const bundlePath = getBundlePath();

    void loadBundleFromUrl(bundlePath)
      .then((bundle) => {
        setState({ status: 'ready', bundle, bundlePath });
        setSelectedViewId(bundle.graph.views[0]?.id);
        setSelectedEntityId(bundle.graph.entities[0]?.id);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load registry bundle.';
        setState({ status: 'error', message });
      });
  }, []);

  const readyState = state.status === 'ready' ? state : undefined;
  const filteredView = useMemo(() => {
    if (!readyState) {
      return undefined;
    }

    return filterEntitiesForViewer(readyState.bundle, searchText, selectedViewId);
  }, [readyState, searchText, selectedViewId]);

  useEffect(() => {
    if (!filteredView || filteredView.entities.length === 0) {
      return;
    }

    if (
      !selectedEntityId ||
      !filteredView.entities.some((entity) => entity.id === selectedEntityId)
    ) {
      setSelectedEntityId(filteredView.entities[0]?.id);
    }
  }, [filteredView, selectedEntityId]);

  if (state.status === 'loading') {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">Ledra Viewer</p>
          <h1>Loading static registry bundle...</h1>
        </section>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">Ledra Viewer</p>
          <h1>Bundle load failed</h1>
          <p>{state.message}</p>
        </section>
      </main>
    );
  }

  const { bundle, bundlePath } = state;
  const filteredEntities = filteredView?.entities ?? bundle.graph.entities;
  const selectedEntity =
    filteredEntities.find((entity) => entity.id === selectedEntityId) ??
    filteredEntities[0] ??
    null;
  const relatedRelations = selectedEntity ? getEntityRelations(bundle, selectedEntity.id) : [];

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Ledra Viewer</p>
          <h1>Static-first registry browsing without a live backend</h1>
          <p className="lede">
            Viewer mode is <strong>{viewerMode}</strong>. This page reads <code>{bundlePath}</code>{' '}
            directly and keeps Git as the only source of truth.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <span>Entities</span>
            <strong>{bundle.diagnostics.counts.entities}</strong>
          </div>
          <div>
            <span>Relations</span>
            <strong>{bundle.diagnostics.counts.relations}</strong>
          </div>
          <div>
            <span>Views</span>
            <strong>{bundle.diagnostics.counts.views}</strong>
          </div>
          <div>
            <span>Policies</span>
            <strong>{bundle.diagnostics.counts.policies}</strong>
          </div>
        </div>
      </section>

      <section className="toolbar panel">
        <label className="field">
          <span>Search</span>
          <input
            placeholder="Search ids, titles, tags, or attributes"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
        <label className="field">
          <span>View</span>
          <select
            value={selectedViewId ?? ''}
            onChange={(event) => setSelectedViewId(event.target.value || undefined)}
          >
            <option value="">All Entities</option>
            {bundle.graph.views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="workspace-grid">
        <EntityList
          entities={filteredEntities}
          selectedEntityId={selectedEntity?.id}
          onSelect={setSelectedEntityId}
        />

        <div className="panel detail-panel">
          <div className="panel-header">
            <p className="eyebrow">Entity Detail</p>
            <h2>{selectedEntity ? selectedEntity.title : 'No entity selected'}</h2>
            <span>{selectedEntity?.type ?? 'empty'}</span>
          </div>

          {selectedEntity ? (
            <>
              <div className="detail-meta">
                <div>
                  <span>ID</span>
                  <strong>{selectedEntity.id}</strong>
                </div>
                <div>
                  <span>Source File</span>
                  <strong>{selectedEntity.sourceFilePath}</strong>
                </div>
              </div>

              {selectedEntity.summary ? (
                <p className="detail-summary">{selectedEntity.summary}</p>
              ) : null}

              <div className="attribute-grid">
                {Object.entries(selectedEntity.attributes).map(([key, value]) => (
                  <div key={key} className="attribute-card">
                    <span>{key}</span>
                    <strong>{formatValue(value)}</strong>
                  </div>
                ))}
              </div>

              <div className="relation-section">
                <h3>Relations</h3>
                <ul>
                  {relatedRelations.map(({ direction, relation }) => (
                    <li key={`${direction}-${relation.id}`}>
                      <strong>{relation.type}</strong> {direction === 'outgoing' ? 'to' : 'from'}{' '}
                      {direction === 'outgoing' ? relation.target.id : relation.source.id}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="empty-state">Search returned no matching entities.</p>
          )}
        </div>

        <div className="panel sidebar-panel">
          <div className="panel-header">
            <p className="eyebrow">Diagnostics</p>
            <h2>Registry Metadata</h2>
            <span>read-only</span>
          </div>

          <div className="sidebar-block">
            <h3>Available Views</h3>
            <ul>
              {bundle.graph.views.map((view) => (
                <li key={view.id}>
                  <strong>{view.title}</strong>
                  <span>{view.query ?? 'no query filter'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-block">
            <h3>Policies</h3>
            <ul>
              {bundle.graph.policies.map((policy) => (
                <li key={policy.id}>
                  <strong>{policy.title}</strong>
                  <span>{policy.rules.length} rules</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-block">
            <h3>Tracked Source Files</h3>
            <ul className="source-list">
              {bundle.diagnostics.sourceFilePaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
