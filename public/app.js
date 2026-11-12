const $ = (sel) => document.querySelector(sel);
const euro = (cents) => new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Browser storage can be blocked (private mode, strict settings); the page must still work without it.
const store = (area) => ({
  get(key, fallback) { try { return JSON.parse(area().getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { area().setItem(key, JSON.stringify(value)); } catch {} },
});
const local = store(() => localStorage);
const session = store(() => sessionStorage);

// A share link like https://…/#wachtwoord=kampvuur (or ?wachtwoord=…) hands the visitor the password.
// The part after # never reaches the server, so the password stays out of its logs. It's kept for this visit
// and taken out of the address bar, so the link isn't copied along with it by accident.
function passwordFromLink() {
  const fromLink = new URLSearchParams(location.hash.slice(1)).get('wachtwoord')
    ?? new URLSearchParams(location.search).get('wachtwoord');
  const password = fromLink?.trim().slice(0, 100);
  if (password) {
    session.set('wachtwoord', password);
    history.replaceState(null, '', location.pathname);
  }
  return password || session.get('wachtwoord', '');
}
let linkPassword = '';
let passwordVisible = false;
function showLinkPassword() {
  linkPassword = passwordFromLink();
  $('#key-box').hidden = !linkPassword;
  renderKey();
}
// Hidden behind 8 dots by default (always 8, so the length isn't given away); the eye button reveals it.
function renderKey() {
  $('#key-value').textContent = passwordVisible ? linkPassword : '••••••••';
  const eye = $('#key-eye');
  eye.innerHTML = svg(passwordVisible ? SPR.eyeClosed : SPR.eyeOpen);
  eye.setAttribute('aria-pressed', passwordVisible);
  eye.setAttribute('aria-label', passwordVisible ? 'Wachtwoord verbergen' : 'Wachtwoord tonen');
  eye.title = eye.getAttribute('aria-label');
}
$('#key-eye').addEventListener('click', () => { passwordVisible = !passwordVisible; renderKey(); });
showLinkPassword();
// A share link opened in a tab that already shows the page only changes the #-part, without reloading.
addEventListener('hashchange', () => { if (location.hash.includes('wachtwoord=')) showLinkPassword(); });

let data = { categories: [], items: [] };
let claimed = new Set();

const api = (method, body) => fetch('/api/claims', {
  method,
  headers: { 'content-type': 'application/json' },
  body: body && JSON.stringify(body),
});

// A category shows its pixel sprite (from sprites.js) when it has one, otherwise its emoji, otherwise nothing.
const icon = (cat) => {
  const content = SPR[cat.sprite] ? svg(SPR[cat.sprite]) : cat.icon;
  return content ? `<span class="icon" aria-hidden="true">${content}</span>` : '';
};

function card(item, cat) {
  const tokens = local.get('mijnClaims', {});
  const isClaimed = claimed.has(item.id);
  const isMine = isClaimed && item.id in tokens;

  const price = item.priceCents ? `<dl class="meta"><div><dt>Prijs</dt><dd>${euro(item.priceCents)}</dd></div></dl>` : '';
  const shops = item.links?.length
    ? `<p class="shops">Te koop bij: ${item.links.map((l) =>
        `» <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.shop)}</a>${l.priceCents ? ` (${euro(l.priceCents)})` : ''}`).join(' ')}</p>`
    : '';

  let action;
  if (item.perpetual) action = '<p class="always">★ Altijd welkom: iedereen mag dit geven, zo vaak als ge wilt</p>';
  else if (isMine) action = `<p class="mine">✔ Gij hebt dit geregeld</p><button class="btn" data-release="${esc(item.id)}">Vrijgeven</button>`;
  else if (isClaimed) action = '<p class="stamp">Al geregeld!</p>';
  else action = `<button class="btn btn--gold btn--claim" data-claim="${esc(item.id)}">${svg(SPR.gift)}Ik koop dit!</button>`;

  return `<article class="item${isClaimed && !isMine ? ' is-claimed' : ''}">
    <div class="item__img">${icon(cat)}<img src="img/${esc(item.id)}.jpg" data-try="png webp"
      alt="" loading="lazy" onload="this.parentElement.classList.add('has-pic')" onerror="nextImage(this)"></div>
    <div>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description)}</p>
      ${price}${shops}${action}
    </div>
  </article>`;
}

// Each item looks for public/img/<id>.jpg, then .png, then .webp; without one it keeps its emoji.
function nextImage(img) {
  const [ext, ...rest] = img.dataset.try.split(' ').filter(Boolean);
  if (!ext) return img.remove();
  img.dataset.try = rest.join(' ');
  img.src = img.getAttribute('src').replace(/\.\w+$/, `.${ext}`);
}

function render() {
  const sections = data.categories
    .map((cat) => ({ cat, items: data.items.filter((i) => i.category === cat.id) }))
    .filter((s) => s.items.length);

  $('#nav').innerHTML = sections.map(({ cat }) => `<a href="#cat-${esc(cat.id)}">${esc(cat.name)}</a>`).join('');
  $('#list').innerHTML = sections.map(({ cat, items }) => `
    <section class="cat cat--${esc(cat.id)}" id="cat-${esc(cat.id)}">
      <h2>${icon(cat)}${esc(cat.name)}</h2>
      ${cat.note ? `<p class="cat__note">${esc(cat.note)}</p>` : ''}
      ${items.map((i) => card(i, cat)).join('')}
    </section>`).join('');

  const tokens = local.get('mijnClaims', {});
  $('#mine-count').textContent = Object.keys(tokens).filter((id) => claimed.has(id)).length;
}

async function refreshClaims() {
  try {
    const res = await api('GET');
    if (res.ok) claimed = new Set((await res.json()).claimed);
  } catch {} // offline or no API: show everything as available
  render();
}

async function countVisit() {
  const counted = session.get('geteld', false);
  try {
    const res = await fetch('/api/visits', { method: counted ? 'GET' : 'POST' });
    const { count } = await res.json();
    $('#counter').textContent = String(count).padStart(6, '0');
    session.set('geteld', true);
  } catch {}
}

// The little 3D printer in the sidebar "prints" as you scroll down.
function updatePrinter() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.min(1, scrollY / max) : 0;
  $('#print-bar').style.width = `${pct * 100}%`;
  $('#print-pct').textContent = `${Math.round(pct * 100)}%`;
  $('#print-layer').textContent = String(Math.round(pct * 240)).padStart(3, '0');
  $('#print-status').textContent = pct > 0.99 ? 'KLAAR!' : 'PRINTEN...';
}

// ---------- Claiming ----------
const dialog = $('#claim-dialog');
const form = $('#claim-form');
let pendingId = null;

$('#list').addEventListener('click', async (e) => {
  const claimBtn = e.target.closest('[data-claim]');
  const releaseBtn = e.target.closest('[data-release]');

  if (claimBtn) {
    pendingId = claimBtn.dataset.claim;
    $('#claim-what').textContent = data.items.find((i) => i.id === pendingId).title;
    form.reset();
    form.elements.wachtwoord.value = linkPassword; // empty unless they came in through a share link
    $('#claim-error').textContent = '';
    dialog.showModal();
  }

  if (releaseBtn) {
    const id = releaseBtn.dataset.release;
    const title = data.items.find((i) => i.id === id).title;
    if (!confirm(`Wilt ge "${title}" weer vrijgeven?`)) return;
    const tokens = local.get('mijnClaims', {});
    try {
      const res = await api('DELETE', { id, token: tokens[id] });
      if (!res.ok) throw new Error(res.status);
      delete tokens[id];
      local.set('mijnClaims', tokens);
    } catch {
      alert('Vrijgeven lukte niet. Probeer het later opnieuw.');
    }
    refreshClaims();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const naam = form.elements.naam.value.trim();
  const wachtwoord = form.elements.wachtwoord.value;
  const button = form.querySelector('.btn--gold');
  button.disabled = true;
  try {
    const res = await api('POST', { id: pendingId, name: naam, password: wachtwoord });
    if (res.ok) {
      const tokens = local.get('mijnClaims', {});
      tokens[pendingId] = (await res.json()).token;
      local.set('mijnClaims', tokens);
      dialog.close();
    } else {
      $('#claim-error').textContent = {
        400: 'Vul uw naam in.',
        403: 'Dat wachtwoord klopt niet.',
        409: 'Iemand was u voor: dit cadeau is al geregeld!',
      }[res.status] || 'Er ging iets mis. Probeer het later opnieuw.';
    }
  } catch {
    $('#claim-error').textContent = 'Geen verbinding. Probeer het later opnieuw.';
  } finally {
    button.disabled = false;
    refreshClaims();
  }
});

// ---------- Start ----------
// The banner runs its text twice in a row for a seamless loop. Each copy drops its closing ★ and ends in a space,
// so where one copy meets the next there is exactly one ★, spaced like all the others.
const marquee = $('.marquee span');
const bannerText = marquee.textContent.replace(/\s+/g, ' ').trim().replace(/\s*★$/, '');
marquee.innerHTML = `<b>${esc(bannerText)} </b>`.repeat(2);

addEventListener('scroll', updatePrinter, { passive: true });
updatePrinter();
countVisit();
(async () => {
  try {
    data = await (await fetch('items.json')).json();
  } catch {
    $('#list').innerHTML = '<p class="loading">De lijst kon niet laden. Vernieuw de pagina eens.</p>';
    return;
  }
  render();
  refreshClaims();
})();
