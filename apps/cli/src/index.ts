declare const process: { argv: string[] } | undefined;
import { buildBundle } from '@ledra/bundle';
import { createReadOnlyRepository, loadEntitiesFromRegistry } from '@ledra/core';
import { searchEntities } from '@ledra/search';
import { validateEntities } from '@ledra/validator';

export const appName = '@ledra/cli';

export type CliCommand = 'validate' | 'build' | 'serve' | 'inspect' | 'export';

type ParsedOptions = {
  registryPath?: string;
  query: string;
};

const parseOptions = (args: readonly string[]): ParsedOptions => {
  const nextArgs = [...args];
  let registryPath: string | undefined;
  const queryParts: string[] = [];

  while (nextArgs.length > 0) {
    const current = nextArgs.shift();
    if (!current) {
      continue;
    }

    if (current === '--registry') {
      const value = nextArgs.shift();
      if (value) {
        registryPath = value;
      }
      continue;
    }

    queryParts.push(current);
  }

  return registryPath
    ? {
        registryPath,
        query: queryParts.join(' ')
      }
    : {
        query: queryParts.join(' ')
      };
};

const createRepository = (registryPath?: string) => {
  if (registryPath) {
    return createReadOnlyRepository(loadEntitiesFromRegistry(registryPath));
  }

  return createReadOnlyRepository();
};

export const runLedraCli = (args: readonly string[]): string => {
  const [command, ...rest] = args;
  const options = parseOptions(rest);
  const repository = createRepository(options.registryPath);

  switch (command as CliCommand | undefined) {
    case 'validate': {
      const result = validateEntities(repository.listEntities());
      return JSON.stringify({ result, diagnostics: repository.diagnostics() }, null, 2);
    }
    case 'build': {
      const bundle = buildBundle(repository);
      return JSON.stringify({ bundle, diagnostics: repository.diagnostics() }, null, 2);
    }
    case 'serve':
      return 'serve mode is read-only and scheduled after validate/build.';
    case 'inspect':
      return JSON.stringify(searchEntities(options.query, repository), null, 2);
    case 'export':
      return JSON.stringify(buildBundle(repository), null, 2);
    default:
      return 'Usage: ledra <validate|build|serve|inspect|export> [--registry <path>]';
  }
};

if (typeof process !== 'undefined' && process.argv[1]) {
  const args = process.argv.slice(2);
  // CLI intentionally keeps repository access read-only.
  console.log(runLedraCli(args));
}
