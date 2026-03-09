#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const cliEntrypoint = resolve(currentDirectory, '../dist/apps/cli/src/index.js');

if (process.env.INIT_CWD) {
  process.chdir(process.env.INIT_CWD);
}

if (!existsSync(cliEntrypoint)) {
  console.error('Ledra CLI is not built yet. Run `npm run build` first.');
  process.exit(1);
}

process.env.LEDRA_CLI_EMBEDDED = '1';
const { runLedraCli, startLedraServe } = await import(pathToFileURL(cliEntrypoint).href);
const args = process.argv.slice(2);

if (args[0] === 'serve') {
  try {
    const { port, registryRoot } = await startLedraServe(args);
    console.log(
      JSON.stringify({ readOnly: true, port, registryRoot, status: 'Listening' }, null, 2)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown serve error';
    console.error(message);
    process.exit(1);
  }
} else {
  console.log(runLedraCli(args));
}
