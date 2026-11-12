// Pixel sprites for the header scene.
// Each string is one row of pixels, each letter a colour from PAL, '.' is transparent.
const PAL = {
  K: '#1a1c2c', s: '#d6dde3', S: '#7d8794',
  o: '#ef7d57', y: '#ffcd75', r: '#b13e53', u: '#73323f',
  b: '#6b4226', B: '#a8683a', t: '#2e6b4f', T: '#183d36', a: '#d8b36a', A: '#9c7a3c',
  m: '#fff3c4', M: '#e0d49a',
  // fencers
  h: '#4a3020', H: '#7a5236', f: '#f2c3a0', w: '#ece6da', W: '#b9b1a3', n: '#3b2a22', k: '#2a1d16', j: '#2b2f45', J: '#434a6b',
  // Tio: slate grey with a blue-violet tint, yellow-green eyes
  g: '#737a8c', G: '#8f97a9', d: '#4b5061', p: '#a8787e', N: '#5e4f5c', e: '#c5d65c',
  // category icons: brick red with highlight and shadow, gold ribbon
  R: '#d01012', E: '#ff6f5e', D: '#7c0a0a', Y: '#f2cd37', O: '#b8860b',
  V: '#39ff6a', v: '#0b3d1a', // terminal screen
};

const SPR = {
  pine: [
    '.....T......',
    '.....T......',
    '....TtT.....',
    '...TtttT....',
    '....TtT.....',
    '...TtttT....',
    '..TtttttT...',
    '...TtttT....',
    '..TtttttT...',
    '.TtttttttT..',
    '..TtttttT...',
    '.TtttttttT..',
    'TtttttttttT.',
    '.....bb.....',
    '.....bb.....',
  ],
  moon: [
    '...mmmm...',
    '..mmmmmm..',
    '.mmmMmmmm.',
    'mmmmmmmmMm',
    'mmMmmmmmmm',
    'mmmmmmMmmm',
    'mmmmmmmmmm',
    '.mmMmmmmm.',
    '..mmmmmm..',
    '...mmmm...',
  ],
  tent: [
    '.........K..........',
    '........KaK.........',
    '.......KaaaK........',
    '......KaaaaaK.......',
    '.....KaaaKaaaK......',
    '....KaaaKKKaaaK.....',
    '...KaaaKKKKKaaaK....',
    '..KaaaKKKKKKKaaaK...',
    '.KaaaKKKKKKKKKaaaK..',
    'KAAAAKKKKKKKKKKAAAAK',
  ],
  fire1: [
    '.....o......',
    '....ooo..o..',
    '...ooyoo.o..',
    '..rooyyoor..',
    '..royyyyor..',
    '..rroyyorr..',
    '.bBbbBbbBb..',
    'bBbbBbbBbbB.',
  ],
  fire2: [
    '......o.....',
    '..o..ooo....',
    '..o.ooyoo...',
    '..rooyyoor..',
    '..royyyyor..',
    '..rrooyorr..',
    '.bBbbBbbBb..',
    'bBbbBbbBbbB.',
  ],
  // A fencer with a feder (crossguard S, the wide "schilt" and a long blunt blade), facing right.
  // The second fencer is the same sprite mirrored and recoloured.
  fencerGuard: [
    '......hhh.........s.....',
    '.....hhHhf.......s......',
    '.....hhfKf......s.......',
    '......hfff.....s........',
    '......WWw...S.ss........',
    '.....Wwwwwwnnss.........',
    '.....WwWwwwn..S.........',
    '......WWwwW.............',
    '......kkkkk.............',
    '......jJJjj.............',
    '......jJ.Jj.............',
    '.....jJ...Jj............',
    '.....jJ....Jj...........',
    '....jJ......Jj..........',
    '...kkk......kkk.........',
  ],
  fencerThrust: [
    '......hhh...............',
    '.....hhHhf..............',
    '.....hhfKf..............',
    '......hfff..............',
    '......WWw....S..........',
    '.....WwwwwwnnSsssssssssS',
    '.....WwWwwwnnSss........',
    '......WWwwW..S..........',
    '......kkkkk.............',
    '......jJJjj.............',
    '.....jjJ.JJj............',
    '....jjJ....JJ...........',
    '...jjJ......JJ..........',
    '..jjJ.......jJ..........',
    '.kkk........kkk.........',
  ],
  // Tio sitting by the fire, after the photo: big ears, slim chest, paws together, tail curled around.
  tio1: [
    '..d.....d....',
    '..dd...dd....',
    '..dpd.dpd....',
    '..dgggggd....',
    '.dgGgggGgd...',
    '.dgeKgKegd...',
    '.dgggNgggd...',
    '..dgGGGgd....',
    '...dgGgd.....',
    '..dggGggd....',
    '.dgggGgggd...',
    'dggggGggggd..',
    'dggggggGggd..',
    'dgggGgggGgd..',
    '.dGGdddGGdd.d',
    '.........dddd',
  ],
  tio2: [
    '..d.....d....',
    '..dd...dd....',
    '..dpd.dpd....',
    '..dgggggd....',
    '.dgGgggGgd...',
    '.dgeKgKegd...',
    '.dgggNgggd...',
    '..dgGGGgd....',
    '...dgGgd.....',
    '..dggGggd....',
    '.dgggGgggd...',
    'dggggGggggd..',
    'dggggggGggd..',
    'dgggGgggGgd.d',
    '.dGGdddGGdd.d',
    '.........ddd.',
  ],
  // Category icons (used via "sprite" in items.json instead of an emoji)
  brick: [
    '..EER....EER..',
    '..RRD....RRD..',
    'EEEEEEEEEEEEER',
    'ERRRRRRRRRRRRD',
    'ERRRRRRRRRRRRD',
    'ERRRRRRRRRRRRD',
    'ERRRRRRRRRRRRD',
    'DDDDDDDDDDDDDD',
  ],
  // A retro computer with green terminal text and a power light
  computer: [
    '.ssssssssssss.',
    'ssvvvvvvvvvvss',
    'ssvVVVvvvvvvss',
    'ssvvvvvvvvvvss',
    'ssvVVVVVvvvvss',
    'ssvvvvvvvvvvss',
    'ssvVVvvvvvvvss',
    'ssvvvvvvvvvvss',
    'sssssssssssVss',
    '.SSSSSSSSSSSS.',
    '....SSSSSS....',
    '..ssssssssss..',
    '..SSSSSSSSSS..',
  ],
  gift: [
    '...Y....Y...',
    '..YOY..YOY..',
    '...YYYYYY...',
    'EEEEEYYEEEEE',
    'RRRRRYYRRRRR',
    'DDDDDOODDDDD',
    '.RRRRYYRRRR.',
    '.RRRRYYRRRR.',
    '.RRRRYYRRRR.',
    '.RRRRYYRRRR.',
    '.DDDDOODDDD.',
  ],
  // Tio walking right (mirrored with CSS when he walks left): long tail up, big ears, two-step leg cycle.
  tioWalk1: [
    'd............d..d.',
    '.d..........dpddpd',
    '.d..........dggggd',
    '..d.........gGgegg',
    '..d.........gggggN',
    '..d..dggggggggGGg.',
    '...ddgggggggggGg..',
    '....dggggggggggd..',
    '....dGGGGGGGGGGd..',
    '....dg.dg...dg.dg.',
    '....dd.dd...dd.dd.',
  ],
  tioWalk2: [
    'd............d..d.',
    '.d..........dpddpd',
    '.d..........dggggd',
    '..d.........gGgegg',
    '..d.........gggggN',
    '..d..dggggggggGGg.',
    '...ddgggggggggGg..',
    '....dggggggggggd..',
    '....dGGGGGGGGGGd..',
    '.....dgdg....dgdg.',
    '.....dddd....dddd.',
  ],
};

// Turns a sprite into an SVG; runs of the same colour become one rect.
function svg(rows, swap = {}) {
  const w = rows[0].length, h = rows.length;
  let rects = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < w;) {
      const ch = row[x];
      let n = 1;
      while (row[x + n] === ch) n++;
      if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[swap[ch] || ch]}"/>`;
      x += n;
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" style="--w:${w};--h:${h}">${rects}</svg>`;
}

function buildScene(root) {
  const d = (cls, html = '', style = '') => `<div class="${cls}"${style ? ` style="${style}"` : ''}>${html}</div>`;
  const frames = (a, b, swap) => d('frames', svg(a, swap) + svg(b, swap));
  const rand = (max) => (Math.random() * max).toFixed(1);
  const red = { w: 'r', W: 'u', h: 'A', H: 'a' }; // second fencer: red gambeson, blond

  const trees = [[1, 1], [9, .8], [17, 1.1], [27, .75], [36, .95], [52, .85], [60, 1.05], [70, .9], [78, .8], [88, 1.1], [95, .85]]
    .map(([left, s]) => d('spr tree', svg(SPR.pine), `left:${left}%;--s:${s}`)).join('');

  let html = d('moon', svg(SPR.moon));
  for (let i = 0; i < 45; i++) html += `<i class="star" style="left:${rand(100)}%;top:${rand(55)}%;animation-delay:-${rand(3)}s"></i>`;
  html += d('trees', trees) + d('ground') + d('front',
    d('spr tent', svg(SPR.tent), 'left:6%') +
    d('spr campfire', frames(SPR.fire1, SPR.fire2), 'left:24%') +
    d('spr tio', d('tio-sit', frames(SPR.tio1, SPR.tio2)) + d('tio-walk', frames(SPR.tioWalk1, SPR.tioWalk2))) +
    d('spr fencers',
      d('fencer fencer--a', frames(SPR.fencerGuard, SPR.fencerThrust)) +
      d('fencer fencer--b', frames(SPR.fencerThrust, SPR.fencerGuard, red)) +
      '<i class="clash"></i><i class="clash clash--a"></i>', 'left:52%'),
  );
  for (let i = 0; i < 9; i++) html += `<i class="firefly" style="left:${rand(100)}%;bottom:${20 + +rand(60)}px;animation-delay:-${rand(7)}s"></i>`;
  root.innerHTML = html;
}

buildScene(document.getElementById('scene'));

// The footer is a LEGO wall; it builds itself brick by brick when it scrolls into view.
function buildLegoWall(wall) {
  const colours = ['#c91a09', '#f2cd37', '#0055bf', '#237841', '#f4f4f4', '#fe8a18'];
  const full = Array(16).fill(4);
  const offset = [2, ...Array(15).fill(4), 2]; // every other row shifted half a brick, like a real wall
  let html = '', i = 0;
  [full, offset, full].forEach((row, r) => {
    html += `<div class="lego__row">${row.map((studs, b) =>
      `<span class="brick" style="--studs:${studs};--c:${colours[(r * 5 + b * 4) % colours.length]};--i:${i++}"></span>`).join('')}</div>`;
  });
  wall.innerHTML = html;
  new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) { wall.classList.add('is-building'); obs.disconnect(); }
  }).observe(wall);
}

buildLegoWall(document.getElementById('lego-wall'));
