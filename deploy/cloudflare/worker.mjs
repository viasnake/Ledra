export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ ok: true, readOnly: true, runtime: 'cloudflare-workers' });
    }

    if (url.pathname === '/api/views') {
      const bundle = await env.ASSETS.fetch(new URL('/bundle.json', url));
      if (!bundle.ok) {
        return Response.json({ error: 'bundle.json not found in assets output' }, { status: 500 });
      }

      const payload = await bundle.json();
      return Response.json(payload.graph?.views ?? []);
    }

    return env.ASSETS.fetch(request);
  }
};
