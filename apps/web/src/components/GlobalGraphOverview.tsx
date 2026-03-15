import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { forceX, forceY } from 'd3-force';
import { formatEntityTypeLabel } from '../copy';
import type { GraphOverviewData } from '../index';

type GlobalGraphOverviewProps = {
  data: GraphOverviewData;
  highlightedTypes?: ReadonlySet<string> | undefined;
  onNodeSelect?: (nodeId: string) => void;
};

type GraphNodeDatum = {
  id: string;
  type: string;
  title: string;
  degree: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type GraphLinkDatum = {
  id: string;
  source: string | GraphNodeDatum;
  target: string | GraphNodeDatum;
  relationType: string;
};

type LegendEntry = {
  type: string;
  nodeCount: number;
  edgeCount: number;
  scopedNodeCount: number;
};

type NeighborEntry = {
  nodeId: string;
  title: string;
  type: string;
  incoming: number;
  outgoing: number;
  relationTypes: string[];
};

const NODE_COLORS: readonly string[] = [
  '#0f766e',
  '#2563eb',
  '#ea580c',
  '#7c3aed',
  '#0891b2',
  '#4f46e5'
];

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const colorForType = (type: string) =>
  NODE_COLORS[hashString(type) % NODE_COLORS.length] ?? '#2563eb';

const getNodeId = (value: string | GraphNodeDatum): string =>
  typeof value === 'string' ? value : value.id;

const getInitialPosition = (node: GraphNodeDatum, allTypes: readonly string[]) => {
  const typeIndex = Math.max(0, allTypes.indexOf(node.type));
  const angle = (Math.PI * 2 * typeIndex) / Math.max(1, allTypes.length);
  const clusterRadius = 140;
  const centerX = Math.cos(angle) * clusterRadius;
  const centerY = Math.sin(angle) * clusterRadius;
  const nodeAngle = ((hashString(node.id) % 360) * Math.PI) / 180;
  const nodeRadius = 18 + (hashString(node.title) % 44);

  return {
    x: centerX + Math.cos(nodeAngle) * nodeRadius,
    y: centerY + Math.sin(nodeAngle) * nodeRadius
  };
};

export const GlobalGraphOverview = ({
  data,
  highlightedTypes,
  onNodeSelect
}: GlobalGraphOverviewProps) => {
  const graphRef = useRef<ForceGraphMethods<GraphNodeDatum, GraphLinkDatum> | undefined>(undefined);
  const [size, setSize] = useState({ width: 960, height: 340 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | undefined>(undefined);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const fixedPositionRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const allTypes = useMemo(
    () =>
      Array.from(new Set(data.nodes.map((node) => node.type))).sort((left, right) =>
        left.localeCompare(right)
      ),
    [data.nodes]
  );

  const graphData = useMemo(() => {
    const nodes: GraphNodeDatum[] = data.nodes.map((node) => {
      const fixed = fixedPositionRef.current.get(node.id);
      if (fixed) {
        return {
          ...node,
          x: fixed.x,
          y: fixed.y,
          fx: fixed.x,
          fy: fixed.y
        };
      }

      const initial = getInitialPosition(node, allTypes);
      return {
        ...node,
        ...initial
      };
    });

    const links: GraphLinkDatum[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      relationType: edge.type
    }));

    return {
      nodes,
      links
    };
  }, [allTypes, data.edges, data.nodes]);

  const nodeById = useMemo(() => {
    return new Map(data.nodes.map((node) => [node.id, node]));
  }, [data.nodes]);

  const adjacencyMap = useMemo(() => {
    const map = new Map<
      string,
      Array<{ nodeId: string; relationType: string; direction: 'incoming' | 'outgoing' }>
    >();

    for (const edge of data.edges) {
      const outgoing = map.get(edge.sourceId) ?? [];
      outgoing.push({ nodeId: edge.targetId, relationType: edge.type, direction: 'outgoing' });
      map.set(edge.sourceId, outgoing);

      const incoming = map.get(edge.targetId) ?? [];
      incoming.push({ nodeId: edge.sourceId, relationType: edge.type, direction: 'incoming' });
      map.set(edge.targetId, incoming);
    }

    return map;
  }, [data.edges]);

  const activeNodeId = selectedNodeId ?? hoveredNodeId;

  const activeNeighborhoodIds = useMemo(() => {
    if (!activeNodeId) {
      return undefined;
    }

    return new Set<string>([
      activeNodeId,
      ...(adjacencyMap.get(activeNodeId)?.map((item) => item.nodeId) ?? [])
    ]);
  }, [activeNodeId, adjacencyMap]);

  const legendEntries = useMemo(() => {
    const counts = new Map<string, LegendEntry>();

    for (const node of data.nodes) {
      const current = counts.get(node.type) ?? {
        type: node.type,
        nodeCount: 0,
        edgeCount: 0,
        scopedNodeCount: 0
      };
      current.nodeCount += 1;
      if (highlightedTypes?.has(node.type)) {
        current.scopedNodeCount += 1;
      }
      counts.set(node.type, current);
    }

    for (const edge of data.edges) {
      const sourceType = nodeById.get(edge.sourceId)?.type;
      const targetType = nodeById.get(edge.targetId)?.type;
      if (!sourceType || !targetType) {
        continue;
      }

      const sourceEntry = counts.get(sourceType);
      if (sourceEntry) {
        sourceEntry.edgeCount += 1;
      }

      if (targetType !== sourceType) {
        const targetEntry = counts.get(targetType);
        if (targetEntry) {
          targetEntry.edgeCount += 1;
        }
      }
    }

    return Array.from(counts.values()).sort((left, right) => right.nodeCount - left.nodeCount);
  }, [data.edges, data.nodes, highlightedTypes, nodeById]);

  const selectedNeighborEntries = useMemo(() => {
    if (!activeNodeId) {
      return [] as NeighborEntry[];
    }

    const relations = adjacencyMap.get(activeNodeId) ?? [];
    const grouped = new Map<string, NeighborEntry>();

    for (const item of relations) {
      const targetNode = nodeById.get(item.nodeId);
      if (!targetNode) {
        continue;
      }

      const current = grouped.get(item.nodeId) ?? {
        nodeId: item.nodeId,
        title: targetNode.title,
        type: targetNode.type,
        incoming: 0,
        outgoing: 0,
        relationTypes: []
      };

      if (item.direction === 'incoming') {
        current.incoming += 1;
      } else {
        current.outgoing += 1;
      }

      if (!current.relationTypes.includes(item.relationType)) {
        current.relationTypes.push(item.relationType);
      }

      grouped.set(item.nodeId, current);
    }

    return Array.from(grouped.values())
      .sort((left, right) => right.incoming + right.outgoing - (left.incoming + left.outgoing))
      .slice(0, 12);
  }, [activeNodeId, adjacencyMap, nodeById]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const applySize = () => {
      setSize({
        width: Math.max(360, element.clientWidth),
        height: 340
      });
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) {
      return;
    }

    const centers = new Map<string, { x: number; y: number }>();
    const clusterRadius = 150;
    for (let index = 0; index < allTypes.length; index += 1) {
      const type = allTypes[index];
      if (!type) {
        continue;
      }

      const angle = (Math.PI * 2 * index) / Math.max(1, allTypes.length);
      centers.set(type, {
        x: Math.cos(angle) * clusterRadius,
        y: Math.sin(angle) * clusterRadius
      });
    }

    graph.d3Force(
      'x',
      forceX<GraphNodeDatum>((node) => centers.get(node.type)?.x ?? 0).strength(0.09)
    );
    graph.d3Force(
      'y',
      forceY<GraphNodeDatum>((node) => centers.get(node.type)?.y ?? 0).strength(0.09)
    );
    graph.d3ReheatSimulation();
  }, [allTypes, graphData]);

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="graph-canvas-shell">
        <div aria-label="全体関連グラフ" role="img">
          <ForceGraph2D<GraphNodeDatum, GraphLinkDatum>
            backgroundColor="rgba(248,250,252,0.5)"
            cooldownTicks={90}
            enableNodeDrag
            graphData={graphData}
            height={size.height}
            linkColor={(link) => {
              const sourceId = getNodeId(link.source);
              const targetId = getNodeId(link.target);
              const sourceNode = nodeById.get(sourceId);
              const targetNode = nodeById.get(targetId);
              const sourceMatch = selectedType ? sourceNode?.type === selectedType : true;
              const targetMatch = selectedType ? targetNode?.type === selectedType : true;
              const active = activeNeighborhoodIds
                ? activeNeighborhoodIds.has(sourceId) && activeNeighborhoodIds.has(targetId)
                : true;

              if (!sourceMatch || !targetMatch) {
                return 'rgba(203,213,225,0.24)';
              }

              return active ? 'rgba(71,85,105,0.5)' : 'rgba(148,163,184,0.25)';
            }}
            linkDirectionalParticles={0}
            linkWidth={(link) => {
              const sourceId = getNodeId(link.source);
              const targetId = getNodeId(link.target);
              const active = activeNeighborhoodIds
                ? activeNeighborhoodIds.has(sourceId) && activeNeighborhoodIds.has(targetId)
                : false;
              return active ? 1.6 : 0.9;
            }}
            nodeCanvasObject={(node, context, globalScale) => {
              const inScope = highlightedTypes ? highlightedTypes.has(node.type) : true;
              const selectedByType = selectedType ? node.type === selectedType : true;
              const color = colorForType(node.type);
              const radius = Math.min(10, 3 + Math.log2(node.degree + 1));
              const isActive = activeNodeId === node.id;
              const isNearActive = activeNeighborhoodIds?.has(node.id) ?? false;
              const alpha = selectedByType && inScope ? 0.9 : 0.25;

              context.beginPath();
              context.arc(
                node.x ?? 0,
                node.y ?? 0,
                isActive ? radius + 2.4 : radius,
                0,
                Math.PI * 2
              );
              context.fillStyle = isNearActive
                ? `${color}ff`
                : `${color}${Math.round(alpha * 255)
                    .toString(16)
                    .padStart(2, '0')}`;
              context.fill();

              if (isActive) {
                context.beginPath();
                context.arc(node.x ?? 0, node.y ?? 0, radius + 5.5, 0, Math.PI * 2);
                context.strokeStyle = `${color}66`;
                context.lineWidth = 2.8;
                context.stroke();
              }

              const fontSize = 11 / globalScale;
              if (isActive || (isNearActive && globalScale > 1.1)) {
                context.font = `${fontSize}px sans-serif`;
                context.fillStyle = '#1e293b';
                context.textAlign = 'center';
                context.fillText(
                  node.title.slice(0, 18),
                  node.x ?? 0,
                  (node.y ?? 0) - radius - 8 / globalScale
                );
              }
            }}
            nodeLabel={(node) => `${node.title} (${formatEntityTypeLabel(node.type)})`}
            onBackgroundClick={() => {
              setSelectedNodeId(undefined);
              setHoveredNodeId(undefined);
            }}
            onNodeClick={(node: GraphNodeDatum) => {
              setSelectedNodeId(node.id);
            }}
            onNodeDragEnd={(node: GraphNodeDatum) => {
              if (typeof node.x !== 'number' || typeof node.y !== 'number') {
                return;
              }

              node.fx = node.x;
              node.fy = node.y;
              fixedPositionRef.current.set(node.id, { x: node.x, y: node.y });
              setSelectedNodeId(node.id);
            }}
            onNodeHover={(node: GraphNodeDatum | null) => {
              setHoveredNodeId(node?.id);
            }}
            ref={graphRef}
            width={size.width}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-2 py-1">ノード {data.nodes.length}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1">関係 {data.edges.length}</span>
        {data.truncated ? (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            全体 {data.totalNodes}/{data.totalEdges} から軽量表示
          </span>
        ) : null}
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">種別一覧</h3>
            <button
              className="text-xs text-slate-500 underline"
              onClick={() => {
                setSelectedType(undefined);
              }}
              type="button"
            >
              絞り込み解除
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {legendEntries.map((entry) => {
              const isActive = selectedType === entry.type;
              return (
                <li key={entry.type}>
                  <button
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-sky-300 bg-sky-50/70'
                        : 'border-slate-200 bg-white hover:border-sky-200'
                    }`}
                    onClick={() => {
                      setSelectedType((current) =>
                        current === entry.type ? undefined : entry.type
                      );
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: colorForType(entry.type) }}
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {formatEntityTypeLabel(entry.type)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>ノード {entry.nodeCount}</span>
                      <span>関係 {entry.edgeCount}</span>
                      {highlightedTypes ? <span>スコープ {entry.scopedNodeCount}</span> : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">関連ノード一覧</h3>
            {activeNodeId ? (
              <button
                className="text-xs text-slate-500 underline"
                onClick={() => {
                  setSelectedNodeId(undefined);
                }}
                type="button"
              >
                選択解除
              </button>
            ) : null}
          </div>

          {activeNodeId ? (
            <div className="space-y-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">
                  {nodeById.get(activeNodeId)?.title}
                </p>
                <p className="text-xs text-slate-500">
                  {formatEntityTypeLabel(nodeById.get(activeNodeId)?.type ?? 'unknown')}
                </p>
                <button
                  className="mt-2 text-xs font-semibold text-sky-700 underline"
                  onClick={() => {
                    onNodeSelect?.(activeNodeId);
                  }}
                  type="button"
                >
                  詳細ページを開く
                </button>
              </div>
              <ul className="max-h-[220px] space-y-2 overflow-auto">
                {selectedNeighborEntries.map((neighbor) => (
                  <li key={neighbor.nodeId}>
                    <button
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-sky-200"
                      onClick={() => {
                        setSelectedNodeId(neighbor.nodeId);
                      }}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-slate-800">{neighbor.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatEntityTypeLabel(neighbor.type)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        入力 {neighbor.incoming} / 出力 {neighbor.outgoing} /{' '}
                        {neighbor.relationTypes.slice(0, 2).join(', ')}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              ノードをクリックすると関連ノード一覧を表示します。
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
