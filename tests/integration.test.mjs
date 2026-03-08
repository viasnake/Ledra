import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const runCli = (command) => {
  const output = execFileSync('node', ['apps/cli/dist/apps/cli/src/index.js', command], {
    encoding: 'utf8'
  });

  return JSON.parse(output);
};

test('ledra validate succeeds with sample data', () => {
  const result = runCli('validate');

  assert.equal(result.result.ok, true);
  assert.equal(result.result.issues.length, 0);
});

test('ledra build outputs a static bundle', () => {
  const result = runCli('build');

  assert.equal(result.bundle.kind, 'static-bundle');
  assert.equal(result.bundle.entities.length, 8);
  assert.deepEqual(result.bundle.types, [
    'allocation',
    'dns_record',
    'host',
    'prefix',
    'segment',
    'service',
    'site',
    'vlan'
  ]);
});

test('diagnostics include source file paths', () => {
  const result = runCli('validate');

  assert.equal(result.diagnostics.sourceFilePaths.length, 8);
  assert.ok(result.diagnostics.sourceFilePaths.every((entry) => entry.startsWith('packages/sample-data/data/')));
});
