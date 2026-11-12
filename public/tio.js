// Tio reacts to visitors.
// Resting the pointer on him (or a long press on a phone) is petting: he purrs and hearts float up.
// Clicking (or Enter) pulls his tail, which the scrolling banner asks you not to do. He gets angrier each time,
// and on the fifth pull he scratches the screen, runs off and trots back 10 seconds later.
(() => {
  const tio = document.querySelector('.scene .tio');
  const site = document.querySelector('.site');
  const banner = document.querySelector('.marquee');
  const bannerText = banner.querySelector('span');
  if (!tio) return;

  tio.insertAdjacentHTML('beforeend', `<div class="tio-angry">${svg(SPR.tioAngry)}</div><p class="tio-bubble" role="status"></p>`);
  tio.setAttribute('role', 'button');
  tio.setAttribute('aria-label', 'Tio, de kat');
  tio.tabIndex = 0;
  const bubble = tio.querySelector('.tio-bubble');

  const PET_DELAY = 600;    // ms a press on a phone must last to count as petting rather than a tap
  const CALM_AFTER = 6000;  // ms without pulls before he forgives you
  const AWAY_FOR = 10000;   // ms he stays away after scratching
  const RETURN_WALK = 3000; // ms the walk back takes (matches the CSS transition)

  let pulls = 0, gone = false, petted = false;
  let petTimer, heartLoop, bubbleTimer, calmTimer, bannerTimer;
  const originalBanner = bannerText.innerHTML;

  function say(text, ms = 1800) {
    bubble.textContent = text;
    bubble.classList.add('is-shown');
    clearTimeout(bubbleTimer);
    if (ms) bubbleTimer = setTimeout(() => bubble.classList.remove('is-shown'), ms);
  }

  function calmDown() {
    pulls = 0;
    tio.classList.remove('is-busy', 'is-angry');
  }

  // ---------- Petting ----------
  function startPetting(delay) {
    if (gone || pulls) return;
    clearTimeout(petTimer);
    petTimer = setTimeout(() => {
      petted = true;
      tio.classList.add('is-busy');
      say('Prrrr...', 0);
      heart();
      heartLoop = setInterval(heart, 450);
    }, delay);
  }

  function stopPetting() {
    clearTimeout(petTimer);
    clearInterval(heartLoop);
    if (!petted) return;
    petted = false;
    bubble.classList.remove('is-shown');
    if (!pulls) tio.classList.remove('is-busy');
  }

  function heart() {
    const h = document.createElement('i');
    h.className = 'heart';
    h.style.left = `${15 + Math.random() * 55}%`;
    h.innerHTML = svg(SPR.heart);
    tio.append(h);
    setTimeout(() => h.remove(), 1400);
  }

  // ---------- Pulling his tail ----------
  function pull() {
    if (gone) return;
    stopPetting();
    pulls++;
    tio.classList.add('is-busy');
    clearTimeout(calmTimer);
    calmTimer = setTimeout(calmDown, CALM_AFTER);

    if (pulls === 1) { say('Mrr?'); hop(); }
    else if (pulls === 2) { say('Mrrrrr...'); hop(); }
    else if (pulls === 3) { tio.classList.add('is-angry'); say('PFFFT!'); warnBanner(); }
    else if (pulls === 4) { tio.classList.add('is-angry'); say('GRRRR!!'); }
    else scratchAndRun();
  }

  function hop() {
    tio.classList.remove('is-hopping');
    void tio.offsetWidth; // restart the hop when pulled twice in a row
    tio.classList.add('is-hopping');
    setTimeout(() => tio.classList.remove('is-hopping'), 200);
  }

  function warnBanner() {
    // An even number of copies keeps the seamless scroll loop working (see the .marquee styles);
    // like the normal banner, each copy ends in a space instead of a ★, so they join with a single ★.
    bannerText.innerHTML = '<b>★ IK ZEI TOCH: NIET AAN TIO Z\'N STAART TREKKEN! </b>'.repeat(6);
    banner.classList.add('is-angry');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      bannerText.innerHTML = originalBanner;
      banner.classList.remove('is-angry');
    }, 8000);
  }

  function scratchAndRun() {
    clearTimeout(calmTimer);
    gone = true;
    say('RAAAWR!', 900);
    scratch();

    setTimeout(() => {
      tio.classList.remove('is-angry');
      tio.classList.add('is-gone'); // runs off to the right
    }, 700);

    setTimeout(() => {
      tio.classList.add('is-returning'); // walks back in from the right
      tio.classList.remove('is-gone');
      setTimeout(() => {
        tio.classList.remove('is-returning');
        gone = false;
        calmDown();
      }, RETURN_WALK);
    }, 700 + AWAY_FOR);
  }

  function scratch() {
    const claws = document.createElement('div');
    claws.className = 'claws';
    claws.setAttribute('aria-hidden', 'true');
    claws.innerHTML = '<i></i><i></i><i></i>';
    document.body.append(claws);
    site.classList.add('is-shaking');
    setTimeout(() => site.classList.remove('is-shaking'), 450);
    setTimeout(() => claws.remove(), 3200);
  }

  // ---------- Input ----------
  // Mouse: pointing at him pets right away, clicking pulls. Touch: a long press pets, a short tap pulls.
  tio.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') startPetting(0); });
  tio.addEventListener('pointerleave', stopPetting);
  let pressStart = 0;
  tio.addEventListener('pointerdown', (e) => {
    pressStart = e.pointerType === 'mouse' ? 0 : Date.now();
    if (pressStart) startPetting(PET_DELAY);
  });
  tio.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') setTimeout(stopPetting, 1500); });
  tio.addEventListener('contextmenu', (e) => e.preventDefault()); // no long-press menu on phones
  tio.addEventListener('click', () => {
    if (pressStart && Date.now() - pressStart >= PET_DELAY) return; // end of a long press: that was petting
    pull();
  });
  tio.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pull(); }
  });
})();
