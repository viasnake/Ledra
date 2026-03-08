import { createServer } from 'node:http';
import { parse } from 'node:url';
import { createReadOnlyApi } from '../../apps/api/dist/apps/api/src/index.js';

const registryPath = process.env.LEDRA_REGISTRY_PATH ?? '/data/registry';
const port = Number(process.env.PORT ?? '8080');
const api = createReadOnlyApi(registryPath);

const send = (response, status, body) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body, null, 2));
};

createServer((request, response) => {
  if (!request.url) {
    return send(response, 400, { error: 'missing URL' });
  }

  const { pathname = '/', query } = parse(request.url, true);

  if (pathname === '/health') {
    return send(response, 200, { ok: true, readOnly: true });
  }

  if (pathname === '/api/types') {
    return send(response, 200, api['/api/types']());
  }

  if (pathname === '/api/entities') {
    return send(response, 200, api['/api/entities']());
  }

  if (pathname.startsWith('/api/entities/')) {
    const [, , , type, id] = pathname.split('/');
    if (!type || !id) {
      return send(response, 400, { error: 'expected /api/entities/{type}/{id}' });
    }
    return send(response, 200, api['/api/entities/{type}/{id}'](type, id));
  }

  if (pathname === '/api/relations') {
    return send(response, 200, api['/api/relations']());
  }

  if (pathname === '/api/search') {
    const raw = query.q;
    const q = typeof raw === 'string' ? raw : '';
    return send(response, 200, api['/api/search'](q));
  }

  if (pathname === '/api/diagnostics') {
    return send(response, 200, api['/api/diagnostics']());
  }

  if (pathname === '/api/views') {
    return send(response, 200, api['/api/views']());
  }

  return send(response, 404, { error: 'not found' });
}).listen(port, () => {
  console.log(`Ledra read-only API listening on :${port} (registry: ${registryPath})`);
});
