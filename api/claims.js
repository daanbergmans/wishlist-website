// /api/claims, called by server.js.
// env.CLAIMS stores one key per claimed item: "claim:<id>" -> { name, token, at }.
// env.FAMILY_PASSWORD is the password the family needs to claim something.

const json = (body, status = 200) => Response.json(body, { status });
const readBody = (request) => request.json().catch(() => ({}));

async function claimableIds(request, env) {
  const res = await env.ASSETS.fetch(new URL('/items.json', request.url));
  const { items } = await res.json();
  return new Set(items.filter((i) => !i.perpetual).map((i) => i.id));
}

// Only ids, never names: the surprise stays a surprise even if Daan peeks.
export async function onRequestGet({ env }) {
  const { keys } = await env.CLAIMS.list({ prefix: 'claim:' });
  return json({ claimed: keys.map((k) => k.name.slice('claim:'.length)) });
}

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  const id = String(body.id ?? '');
  const name = String(body.name ?? '').trim().slice(0, 60);

  if (!env.FAMILY_PASSWORD || body.password !== env.FAMILY_PASSWORD) return json({ error: 'wachtwoord' }, 403);
  if (!name) return json({ error: 'naam' }, 400);
  if (!(await claimableIds(request, env)).has(id)) return json({ error: 'onbekend' }, 404);

  // The file store answers get/put without waiting on disk, so this check and the put below run as one step.
  if (await env.CLAIMS.get(`claim:${id}`)) return json({ error: 'al geclaimd' }, 409);

  const token = crypto.randomUUID();
  await env.CLAIMS.put(`claim:${id}`, JSON.stringify({ name, token, at: new Date().toISOString() }));
  return json({ token });
}

export async function onRequestDelete({ request, env }) {
  const body = await readBody(request);
  const key = `claim:${String(body.id ?? '')}`;
  const claim = JSON.parse((await env.CLAIMS.get(key)) || 'null');
  if (!claim) return json({ ok: true }); // already free
  if (!body.token || claim.token !== body.token) return json({ error: 'token' }, 403);
  await env.CLAIMS.delete(key);
  return json({ ok: true });
}
