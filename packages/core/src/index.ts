import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { load } from 'js-yaml';
import type { Diagnostics, EntityRecord } from '@ledra/types';
import { IMPLEMENTATION_ORDER } from '@ledra/types';

export const packageName = '@ledra/core';

const DEFAULT_ENTITIES: readonly EntityRecord[] = [
  {
    id: 'intro',
    type: 'doc',
    title: 'Getting Started',
    summary: 'Entry point document.',
    tags: ['guide'],
    relations: [{ type: 'references', targetId: 'schema-overview' }]
  },
  {
    id: 'schema-overview',
    type: 'doc',
    title: 'Schema Overview',
    tags: ['reference'],
    relations: []
  }
];

export const createReadOnlyRepository = (
  entities: readonly EntityRecord[] = DEFAULT_ENTITIES
) => {
  const frozen = entities.map((entity) =>
    Object.freeze({
      ...entity,
      relations: [...entity.relations],
      tags: [...entity.tags]
    })
  );

  return Object.freeze({
    listTypes: (): readonly string[] => [...new Set(frozen.map((entry) => entry.type))].sort((a, b) => a.localeCompare(b)),
    listEntities: (): readonly EntityRecord[] => frozen,
    findEntity: (type: string, id: string): EntityRecord | undefined =>
      frozen.find((entry) => entry.type === type && entry.id === id),
    listRelations: () =>
      frozen.flatMap((source) =>
        source.relations.map((relation) => ({
          sourceType: source.type,
          sourceId: source.id,
          relationType: relation.type,
          targetId: relation.targetId
        }))
      ),
    diagnostics: (): Diagnostics => ({
      implementationOrder: IMPLEMENTATION_ORDER,
      readOnly: true,
      entityCount: frozen.length,
      sourceFilePaths: frozen
        .map((entity) => entity.sourceFilePath)
        .filter((path): path is string => typeof path === 'string')
    })
  });
};

export type ReadOnlyRepository = ReturnType<typeof createReadOnlyRepository>;

const SUPPORTED_EXTENSIONS = new Set(['.json', '.yaml', '.yml']);

type RawEntity = Partial<EntityRecord> & {
  name?: string;
  relations?: readonly { type?: string; targetId?: string }[];
};

const walkFiles = (rootPath: string): readonly string[] => {
  const stack = [rootPath];
  const files: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const next = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
        continue;
      }

      const extension = extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(extension)) {
        files.push(next);
      }
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
};

const parseFile = (filePath: string): RawEntity | undefined => {
  const raw = readFileSync(filePath, 'utf8');
  const extension = extname(filePath).toLowerCase();

  if (extension === '.json') {
    return JSON.parse(raw) as RawEntity;
  }

  const parsed = load(raw);
  if (parsed && typeof parsed === 'object') {
    return parsed as RawEntity;
  }

  return undefined;
};

export const loadEntitiesFromRegistry = (registryPath: string): readonly EntityRecord[] => {
  const root = statSync(registryPath).isDirectory() ? registryPath : '.';
  const files = walkFiles(root);

  return files.map((filePath): EntityRecord => {
    const parsed = parseFile(filePath) ?? {};
    const relativePath = relative(process.cwd(), filePath).replaceAll('\\', '/');
    const relativeSegments = relative(root, filePath).replaceAll('\\', '/').split('/').filter(Boolean);
    const guessedType =
      relativeSegments[0] === 'entities'
        ? relativeSegments[1] ?? 'entity'
        : (relativeSegments[0] ?? 'entity');
    const idFromPath = relativeSegments[relativeSegments.length - 1]?.replace(/\.(json|ya?ml)$/i, '') ?? 'unknown';
    const id = typeof parsed.id === 'string' && parsed.id.trim() ? parsed.id : idFromPath;
    const type = typeof parsed.type === 'string' && parsed.type.trim() ? parsed.type : guessedType;
    const title =
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title
        : typeof parsed.name === 'string' && parsed.name.trim()
          ? parsed.name
          : id;
    const summary = typeof parsed.summary === 'string' ? parsed.summary : undefined;
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const relations = Array.isArray(parsed.relations)
      ? parsed.relations
          .filter(
            (relation): relation is { type: string; targetId: string } =>
              typeof relation.type === 'string' && typeof relation.targetId === 'string'
          )
          .map((relation) => ({ type: relation.type, targetId: relation.targetId }))
      : [];

    return {
      id,
      type,
      title,
      ...(summary ? { summary } : {}),
      tags,
      relations,
      sourceFilePath: relativePath
    };
  });
};
