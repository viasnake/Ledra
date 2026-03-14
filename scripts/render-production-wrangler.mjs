import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const usage = [
  'Usage: node scripts/render-production-wrangler.mjs --input <path> --output <path> --worker-name <name> --hostname <hostname>',
  '',
  'This writes a production wrangler.toml with a specific worker name and custom domain route.'
].join('\n');

const parseArgs = (argv) => {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--help' || token === '-h') {
      parsed.help = true;
      continue;
    }

    if (token === '--input' && value) {
      parsed.inputPath = value;
      index += 1;
      continue;
    }

    if (token === '--output' && value) {
      parsed.outputPath = value;
      index += 1;
      continue;
    }

    if (token === '--worker-name' && value) {
      parsed.workerName = value;
      index += 1;
      continue;
    }

    if (token === '--hostname' && value) {
      parsed.hostname = value;
      index += 1;
    }
  }

  return parsed;
};

export const renderProductionWrangler = ({ inputPath, outputPath, workerName, hostname }) => {
  if (!inputPath || !outputPath || !workerName || !hostname) {
    throw new Error('--input, --output, --worker-name, and --hostname are required');
  }

  const input = resolve(inputPath);
  const output = resolve(outputPath);
  const source = readFileSync(input, 'utf8');
  const rendered = source
    .replace(/name = ".*"/u, `name = "${workerName}"`)
    .replace(/pattern = ".*"/u, `pattern = "${hostname}"`);

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, rendered, 'utf8');
};

const isEntrypoint = resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    console.log(usage);
    process.exit(0);
  }

  renderProductionWrangler(parsed);
}
