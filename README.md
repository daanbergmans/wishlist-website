# Het Verlanglijstje van Daan

A retro pixel-art wishlist set around a campfire in a night-time forest. Family can claim a gift with a shared password, so nobody buys the same thing twice.

- `public/`: the site (plain HTML/CSS/JS, no build step)
  - `items.json` is **the list**: edit this to add, change or remove gifts
  - `sprites.js` holds the pixel art (each letter is one pixel colour)
- `server.js`: a small Node server (no dependencies) that serves `public/` and runs the API
- `api/`: the two endpoints, claims and the visitor counter
- `data/db.json`: claims and the visitor count, created on first use (not in git)
- `test/`: tests for the claim rules and the server (`npm test`)

## Editing the list

Each item in `public/items.json`:

| field | meaning |
|---|---|
| `id` | unique short name, never change it after someone claimed it |
| `category` | id of a category from `categories` |
| `title`, `description` | shown on the card |
| `priceCents` | optional, e.g. `8900` for € 89,00 |
| `links` | optional list of `{ "shop", "url", "priceCents" }` |
| `perpetual` | `true` = "altijd welkom", cannot be claimed |

**Pictures:** put a photo named after the item's `id` in `public/img/` (e.g. `public/img/skull-king.jpg`, `.png` or `.webp`, matching capitals exactly). It replaces the emoji automatically.

## Run locally

Needs Node 22 or newer. Create a `.env` file (it's ignored by git):

```
FAMILY_PASSWORD=vuur
PORT=8788
```

Then run `npm run dev` and open http://localhost:8788. The server restarts by itself when you change `server.js` or `api/`; changes in `public/` show up on a page refresh.

## Put it online (Coolify on your VPS)

1. Push this folder to a GitHub repository (private is fine).
2. In Coolify: **+ New → Application**, pick the repository and the branch. Build pack: **Dockerfile** (uses the `Dockerfile` in this repo; no extra tools needed on the server). **Ports Exposes:** `3000`.
3. **Environment variable:** `FAMILY_PASSWORD`, the password you give your family (runtime only, not needed during build). `DATA_DIR=/data` and `PORT=3000` are already set in the Dockerfile.
4. **Persistent storage → + Add**: a volume mounted at `/data`. Without it every redeploy wipes the claims.
5. **Domains:** `https://wishlist.<yourdomain>.dev`
6. At your domain provider, add a DNS record: type `A`, name `wishlist`, value: your VPS's IP address.
7. **Deploy.** Coolify's proxy gets the HTTPS certificate from Let's Encrypt by itself (`.dev` needs HTTPS); give the DNS a few minutes first.

Every push to the branch can redeploy automatically: turn on **Auto Deploy** in the application's settings (Coolify sets up the GitHub webhook).

**Backups:** everything that matters is in `/data/db.json`. Add that volume to Coolify's backups, or copy the file now and then.

**Undo a claim** someone can't release themselves: remove the `"claim:<id>"` entry from `db.json` (in Coolify's terminal for the app) and restart the app.
