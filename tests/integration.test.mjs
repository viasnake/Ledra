import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createReadOnlyApi } from '../apps/api/dist/apps/api/src/index.js';
import { runLedraCli } from '../apps/cli/dist/apps/cli/src/index.js';

const registryPath = 'packages/sample-data/registry';

const runCli = (args) => {
  const output = runLedraCli(args);
  return JSON.parse(output);
};

test('workspace ledra command exposes help output', () => {
  const output = runLedraCli(['--help']);

  assert.match(output, /Usage: ledra/u);
  assert.match(output, /validate/u);
});

test('web build outputs static viewer assets', () => {
  assert.equal(existsSync('apps/web/dist/index.html'), true);
  const indexHtml = readFileSync('apps/web/dist/index.html', 'utf8');
  const assetFiles = readdirSync('apps/web/dist/assets');

  assert.match(indexHtml, /<div id="root"><\/div>/u);
  assert.ok(assetFiles.some((fileName) => fileName.endsWith('.js')));
  assert.ok(assetFiles.some((fileName) => fileName.endsWith('.css')));
});

test('ledra validate succeeds with sample registry graph', () => {
  const result = runCli(['validate', '--registry', registryPath]);

  assert.equal(result.validation.ok, true);
  assert.equal(result.validation.diagnostics.length, 0);
  assert.deepEqual(result.diagnostics.counts, {
    entities: 34,
    relations: 37,
    views: 7,
    policies: 1
  });
});

test('ledra build outputs a static bundle and writes --out', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'ledra-build-'));
  const outPath = join(tempDir, 'bundle.json');

  try {
    const result = runCli(['build', '--registry', registryPath, '--out', outPath]);

    assert.equal(result.bundle.kind, 'static-bundle');
    assert.equal(result.bundle.graph.entities.length, 34);
    assert.equal(result.bundle.graph.relations.length, 37);
    assert.equal(result.bundle.graph.views.length, 7);
    assert.equal(result.bundle.graph.policies.length, 1);

    const writtenBundle = JSON.parse(readFileSync(outPath, 'utf8'));
    assert.equal(writtenBundle.kind, 'static-bundle');
    assert.equal(writtenBundle.graph.entities.length, 34);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('diagnostics include source file paths across entity and registry records', () => {
  const result = runCli(['validate', '--registry', registryPath]);

  assert.equal(result.diagnostics.sourceFilePaths.length, 79);
  assert.ok(
    result.diagnostics.sourceFilePaths.some((entry) => entry.startsWith('registry/entities/'))
  );
  assert.ok(
    result.diagnostics.sourceFilePaths.some((entry) => entry.startsWith('registry/relations/'))
  );
  assert.ok(
    result.diagnostics.sourceFilePaths.some((entry) => entry.startsWith('registry/views/'))
  );
  assert.ok(
    result.diagnostics.sourceFilePaths.some((entry) => entry.startsWith('registry/policies/'))
  );
});

test('inspect supports structured query input over attributes', () => {
  const query = JSON.stringify({ type: 'site', text: 'tokyo' });
  const result = runCli(['inspect', '--registry', registryPath, '--query', query]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'site-tokyo-prod');
});

test('export writes a bundle file when --out is provided', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'ledra-export-'));
  const outPath = join(tempDir, 'bundle.json');

  try {
    const result = runCli(['export', '--registry', registryPath, '--out', outPath]);

    assert.equal(result.kind, 'static-bundle');
    const writtenBundle = JSON.parse(readFileSync(outPath, 'utf8'));
    assert.equal(writtenBundle.kind, 'static-bundle');
    assert.equal(writtenBundle.graph.views.length, 7);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('read-only API exposes registry data without mutation paths', () => {
  const api = createReadOnlyApi(registryPath);
  const types = api['/api/types']();
  const search = api['/api/search']('attributes.siteId=site-tokyo-prod');
  const views = api['/api/views']();
  const diagnostics = api['/api/diagnostics']();

  assert.ok(Array.isArray(types));
  assert.ok(types.includes('site'));
  assert.equal(search.length, 12);
  assert.equal(views.length, 7);
  assert.equal(views[0].kind, 'view');
  assert.equal(diagnostics.repository.readOnly, true);
});
