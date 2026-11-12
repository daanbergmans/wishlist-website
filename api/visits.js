// /api/visits, called by server.js. POST counts a visit, GET only reads the count.
export async function onRequest({ request, env }) {
  let count = Number(await env.CLAIMS.get('visits')) || 0;
  if (request.method === 'POST') await env.CLAIMS.put('visits', String(++count));
  return Response.json({ count });
}
