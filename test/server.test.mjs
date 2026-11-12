import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../server.js';

// Starts a real server on a free port with its data in a fresh temp folder.
async function start(dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wishlist-'))) {
  const server = createServer({ dataDir, password: 'vuur' });
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;
  return { base, dataDir, close: () => new Promise((resolve) => server.close(resolve)) };
}
const json = (base, p, method, body) =>
  fetch(base + p, { method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) });

// A real, claimable item from the list, so the test follows whatever is in items.json.
const items = JSON.parse(fs.readFileSync(new URL('../public/items.json', import.meta.url))).items;
const claimable = items.find((i) => !i.perpetual).id;

test('serves the site and refuses paths outside public/', async () => {
  const s = await start();
  try {
    const home = await fetch(s.base + '/');
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type'), /text\/html/);
    assert.equal((await fetch(s.base + '/style.css')).headers.get('content-type'), 'text/css; charset=utf-8');
    assert.equal((await fetch(s.base + '/nope.png')).status, 404);
    for (const sneaky of ['/..%2fserver.js', '/%2e%2e/package.json', '/..%5c.env']) {
      assert.equal((await fetch(s.base + sneaky)).status, 404, sneaky);
    }
  } finally { await s.close(); }
});

test('a claim is stored in db.json and survives a restart', async () => {
  let s = await start();
  const { dataDir } = s;
  let token;
  try {
    const res = await json(s.base, '/api/claims', 'POST', { id: claimable, name: 'Mama', password: 'vuur' });
    assert.equal(res.status, 200);
    token = (await res.json()).token;
    assert.equal((await json(s.base, '/api/claims', 'POST', { id: claimable, name: 'Papa', password: 'vuur' })).status, 409);
  } finally { await s.close(); }

  assert.ok(fs.readFileSync(path.join(dataDir, 'db.json'), 'utf8').includes(`claim:${claimable}`));

  s = await start(dataDir);
  try {
    assert.deepEqual((await (await fetch(s.base + '/api/claims')).json()).claimed, [claimable]);
    assert.equal((await json(s.base, '/api/claims', 'DELETE', { id: claimable, token })).status, 200);
    assert.deepEqual((await (await fetch(s.base + '/api/claims')).json()).claimed, []);
  } finally { await s.close(); }
});

test('visitor counter counts POSTs only', async () => {
  const s = await start();
  try {
    assert.equal((await (await json(s.base, '/api/visits', 'POST')).json()).count, 1);
    assert.equal((await (await json(s.base, '/api/visits', 'POST')).json()).count, 2);
    assert.equal((await (await fetch(s.base + '/api/visits')).json()).count, 2);
    assert.equal((await json(s.base, '/api/visits', 'DELETE')).status, 405);
  } finally { await s.close(); }
});

test('rejects oversized request bodies', async () => {
  const s = await start();
  try {
    const res = await json(s.base, '/api/claims', 'POST', { id: 'x'.repeat(20_000), name: 'Mama', password: 'vuur' });
    assert.equal(res.status, 413);
  } finally { await s.close(); }
});
