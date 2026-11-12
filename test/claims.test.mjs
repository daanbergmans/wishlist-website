import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost, onRequestDelete } from '../api/claims.js';

function fakeEnv() {
  const kv = new Map();
  return {
    FAMILY_PASSWORD: 'vuur',
    CLAIMS: {
      get: async (k) => kv.get(k) ?? null,
      put: async (k, v) => void kv.set(k, v),
      delete: async (k) => void kv.delete(k),
      list: async ({ prefix }) => ({ keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) }),
    },
    ASSETS: { fetch: async () => Response.json({ items: [{ id: 'feder' }, { id: 'bon', perpetual: true }] }) },
  };
}

const call = async (handler, env, method, body) => {
  const request = new Request('https://wishlist.test/api/claims', { method, body: body && JSON.stringify(body) });
  const res = await handler({ request, env });
  return { status: res.status, body: await res.json() };
};
const claimedIds = async (env) => (await call(onRequestGet, env, 'GET')).body.claimed;

test('claim, block a second claim, release with the right token', async () => {
  const env = fakeEnv();
  const first = await call(onRequestPost, env, 'POST', { id: 'feder', name: 'Mama', password: 'vuur' });
  assert.equal(first.status, 200);
  assert.deepEqual(await claimedIds(env), ['feder']);

  const second = await call(onRequestPost, env, 'POST', { id: 'feder', name: 'Papa', password: 'vuur' });
  assert.equal(second.status, 409);

  const wrongToken = await call(onRequestDelete, env, 'DELETE', { id: 'feder', token: 'nope' });
  assert.equal(wrongToken.status, 403);
  const noToken = await call(onRequestDelete, env, 'DELETE', { id: 'feder' });
  assert.equal(noToken.status, 403);
  assert.deepEqual(await claimedIds(env), ['feder']);

  const release = await call(onRequestDelete, env, 'DELETE', { id: 'feder', token: first.body.token });
  assert.equal(release.status, 200);
  assert.deepEqual(await claimedIds(env), []);
});

test('rejects wrong password, missing name, perpetual and unknown items', async () => {
  const env = fakeEnv();
  assert.equal((await call(onRequestPost, env, 'POST', { id: 'feder', name: 'Mama', password: 'fout' })).status, 403);
  assert.equal((await call(onRequestPost, env, 'POST', { id: 'feder', name: '  ', password: 'vuur' })).status, 400);
  assert.equal((await call(onRequestPost, env, 'POST', { id: 'bon', name: 'Mama', password: 'vuur' })).status, 404);
  assert.equal((await call(onRequestPost, env, 'POST', { id: 'nope', name: 'Mama', password: 'vuur' })).status, 404);
  assert.deepEqual(await claimedIds(env), []);
});

test('no FAMILY_PASSWORD configured means nobody can claim', async () => {
  const env = { ...fakeEnv(), FAMILY_PASSWORD: undefined };
  assert.equal((await call(onRequestPost, env, 'POST', { id: 'feder', name: 'Mama' })).status, 403);
});

test('GET never leaks who claimed what', async () => {
  const env = fakeEnv();
  await call(onRequestPost, env, 'POST', { id: 'feder', name: 'Mama', password: 'vuur' });
  assert.ok(!JSON.stringify((await call(onRequestGet, env, 'GET')).body).includes('Mama'));
});
