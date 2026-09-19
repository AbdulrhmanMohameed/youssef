/* =====================================================================
   FX  ·  GSAP layer   (loads after main.js — purely additive)
   ---------------------------------------------------------------------
   Everything here is hand-timed motion: intro title mask, velocity-
   driven marquee, card depth parallax, drifting light, scroll progress.
   If GSAP fails to load, the site still works exactly as before.
   ===================================================================== */
(() => {
'use strict';
if (typeof gsap === 'undefined') return;
if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = matchMedia('(hover:none)').matches;
const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* a couple of eases that don't feel like a default tween */
gsap.registerEase('cut',  p => 1 - Math.pow(1 - p, 4.2));
gsap.registerEase('lift', p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/* ------------------------------------------------- split into chars */
function splitChars(text, dim) {
  const line = document.createElement('div');
  line.className = 'ln' + (dim ? ' dim' : '');
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    line.appendChild(s);
  });
  return line;
}

/* ================================================================== 1
   HERO INTRO — the title comes up out of a mask, letter by letter
   ================================================================== */
const h1 = $('.hero-title h1');
if (h1) {
  const l1 = (h1.childNodes[0].textContent || '').trim();
  const l2 = (h1.querySelector('span')?.textContent || '').trim();
  h1.textContent = '';
  h1.appendChild(splitChars(l1, false));
  h1.appendChild(splitChars(l2, true));

  const chars = $$('.ch', h1);
  const tl = gsap.timeline({ defaults: { ease: 'cut' }, delay: .15 });

  if (reduce) {
    gsap.set(chars, { yPercent: 0, opacity: 1 });
  } else {
    tl.from(chars, { yPercent: 118, duration: 1.05, stagger: { each: .026, from: 'start' } })
      .from('.pill', { y: 14, opacity: 0, duration: .7 }, .1)
      .from('.hero-sub p', { y: 18, opacity: 0, duration: .8 }, '-=.75')
      .from('.hero-actions', { y: 18, opacity: 0, duration: .8 }, '-=.6')
      .from('.hero-cue', { opacity: 0, x: -20, duration: .8 }, '-=.5')
      .from('.hero-col', { yPercent: 8, opacity: 0, duration: 1.4, stagger: .12, ease: 'lift' }, .15)
      .from('header .logo, nav li, .nav-tools > *', { y: -12, opacity: 0, duration: .6, stagger: .05 }, .05);
  }
}

/* page head (works.html) gets the same mask treatment */
const ph = $('.page-head .title');
if (ph && !reduce) {
  const t = ph.textContent.trim();
  ph.textContent = '';
  ph.appendChild(splitChars(t, false));
  gsap.from($$('.ch', ph), { yPercent: 115, duration: 1, ease: 'cut', stagger: .03, delay: .1 });
  gsap.from('.page-head p', { y: 18, opacity: 0, duration: .8, ease: 'cut', delay: .45 });
}

/* ================================================================== 2
   MARQUEE — GSAP takes it over so it can react to scroll speed
   (scroll fast, the words rush; stop, they settle back)
   ================================================================== */
const marquees = $$('.marquee').map(m => {
  const row = $('.marquee-row', m);
  if (!row) return null;
  row.style.animation = 'none';
  const rev = m.classList.contains('rev');
  const tw = gsap.fromTo(row,
    { xPercent: rev ? -50 : 0 },
    { xPercent: rev ? 0 : -50, duration: 46, ease: 'none', repeat: -1 });
  m.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: .18, duration: .5 }));
  m.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: .6 }));
  return tw;
}).filter(Boolean);

/* ================================================================== 3
   SCROLL VELOCITY — speeds up the marquees and adds a hair of skew
   ================================================================== */
if (typeof ScrollTrigger !== 'undefined' && !reduce) {
  const skewTargets = $$('.marquee-row, .stack-row');
  const skewSet = gsap.quickSetter(skewTargets, 'skewY', 'deg');
  let speed = 1, wanted = 1, skew = 0;

  ScrollTrigger.create({
    onUpdate: self => {
      const v = self.getVelocity();
      wanted = 1 + Math.min(Math.abs(v) / 900, 3);
      skew = gsap.utils.clamp(-5, 5, v / 950);
    }
  });

  gsap.ticker.add(() => {
    wanted += (1 - wanted) * .06;
    speed  += (wanted - speed) * .12;
    marquees.forEach(tw => tw.timeScale(speed));
    skew += (0 - skew) * .08;
    skewSet(skew);
  });
}

/* ================================================================== 4
   CARD DEPTH — the media inside a card lags behind the cursor
   ================================================================== */
if (!isTouch && !reduce) {
  document.addEventListener('mousemove', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    gsap.to($('.wc-media', card), { x: px * -18, y: py * -18, scale: 1.14, duration: .9, ease: 'power3.out', overwrite: 'auto' });
    gsap.to($('.wc-bottom', card), { x: px * 10, y: py * 8, duration: 1.1, ease: 'power3.out', overwrite: 'auto' });
  }, { passive: true });

  document.addEventListener('mouseout', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card || card.contains(e.relatedTarget)) return;
    gsap.to([$('.wc-media', card), $('.wc-bottom', card)], { x: 0, y: 0, scale: 1, duration: .8, ease: 'power3.out', overwrite: 'auto' });
  });
}

/* ================================================================== 5
   LIGHT — the glows breathe instead of sitting still
   ================================================================== */
if (!reduce) {
  $$('.glow').forEach((g, i) => {
    gsap.to(g, {
      xPercent: gsap.utils.random(-14, 14),
      yPercent: gsap.utils.random(-12, 12),
      scale: gsap.utils.random(.88, 1.18),
      duration: gsap.utils.random(11, 18),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * .6
    });
  });
}

/* ================================================================== 6
   SCROLL PROGRESS — one accent hairline across the top
   ================================================================== */
(() => {
  const bar = document.createElement('div');
  bar.className = 'scroll-prog';
  document.body.appendChild(bar);
  const set = gsap.quickSetter(bar, 'scaleX');
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    set(max > 0 ? Math.min(scrollY / max, 1) : 0);
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
})();

/* ================================================================== 7
   MOBILE MENU — links step in instead of appearing all at once
   ================================================================== */
const mm = $('#mobileMenu');
if (mm && !reduce) {
  const links = $$('a', mm);
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open')) {
      gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'cut', stagger: .05 });
    }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

/* ================================================================== 8
   SECTION TAGS — process numbers and stat figures get a small lift
   ================================================================== */
if (typeof ScrollTrigger !== 'undefined' && !reduce) {
  $$('.step .n, .stat-num').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      y: 22, opacity: 0, duration: .9, ease: 'cut'
    });
  });
  addEventListener('load', () => ScrollTrigger.refresh());
}
})();
