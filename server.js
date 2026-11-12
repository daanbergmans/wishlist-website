// The whole site in one small Node server: serves public/ and runs the API.
// Claims and the visitor count live in DATA_DIR/db.json (put that folder on a persistent volume).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as claims from './api/claims.js';
import * as visits from './api/visits.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// A tiny key/value store with the same get/put/delete/list calls the API code expects.
// Every write replaces db.json in one step (write a temp file, then rename), so a crash never leaves half a file.
export function fileStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'db.json');
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const save = () => {
    fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
    fs.renameSync(`${file}.tmp`, file);
  };
  return {
    get: async (key) => data[key] ?? null,
    put: async (key, value) => { data[key] = value; save(); },
    delete: async (key) => { delete data[key]; save(); },
    list: async ({ prefix = '' } = {}) => ({ keys: Object.keys(data).filter((k) => k.startsWith(prefix)).map((name) => ({ name })) }),
  };
}

// Resolves a URL path to a file inside public/, or null if it would escape that folder.
function publicFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  const file = path.join(PUBLIC, decoded === '/' ? 'index.html' : decoded);
  return file.startsWith(PUBLIC + path.sep) ? file : null;
}

async function readBody(req, limit = 10_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function createServer({ dataDir, password }) {
  const env = {
    CLAIMS: fileStore(dataDir),
    FAMILY_PASSWORD: password,
    ASSETS: { fetch: async () => new Response(fs.readFileSync(path.join(PUBLIC, 'items.json'))) },
  };
  const routes = {
    '/api/claims': { GET: claims.onRequestGet, POST: claims.onRequestPost, DELETE: claims.onRequestDelete },
    '/api/visits': { GET: visits.onRequest, POST: visits.onRequest },
  };

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const route = routes[url.pathname];

      if (route) {
        const handler = route[req.method];
        if (!handler) return send(res, 405, 'Method not allowed');
        const body = ['POST', 'DELETE'].includes(req.method) ? await readBody(req) : undefined;
        const request = new Request(url, { method: req.method, headers: { 'content-type': 'application/json' }, body });
        const response = await handler({ request, env });
        res.writeHead(response.status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        return res.end(Buffer.from(await response.arrayBuffer()));
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
      const file = publicFile(url.pathname);
      if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'Niet gevonden');
      res.writeHead(200, {
        'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-cache', // always check for a newer version, so list edits show up right away
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      const tooLarge = err.message === 'too large';
      if (!tooLarge) console.error(err);
      if (!res.headersSent) send(res, tooLarge ? 413 : 500, 'Er ging iets mis');
      else res.end();
    }
  });
}

function send(res, status, text) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(text);
}

// Start only when run directly (`node server.js`), not when imported by the tests.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 3000;
  if (!process.env.FAMILY_PASSWORD) console.warn('Let op: FAMILY_PASSWORD is niet ingesteld, niemand kan iets claimen.');
  createServer({ dataDir: process.env.DATA_DIR || path.join(ROOT, 'data'), password: process.env.FAMILY_PASSWORD })
    .listen(port, () => console.log(`Verlanglijstje draait op http://localhost:${port}`));
}
