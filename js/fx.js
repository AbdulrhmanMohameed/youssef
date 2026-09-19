/* =====================================================================
   FX  ·  motion + visuals          (loads after main.js — fully additive)
   Engine: anime.js 3.2.2  (vanilla, ~17 kB, no build step)

   Modules
     01  boot + helpers
     02  intro curtain
     03  hero: masked letter reveal, scanlines, audio meter
     04  works cards: pointer depth + entrance on filter
     05  lightbox open sequence
     06  scroll progress
     07  mobile menu
     08  micro interactions

   Every visual has a CSS counterpart in style.css, so if the CDN is
   blocked the page still looks right — it just doesn't move.
   ===================================================================== */
(() => {
'use strict';

/* ========================================================== 01 · BOOT */
const A = window.anime || null;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = matchMedia('(hover:none)').matches;
const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
const home    = !!$('#heroInner');

/* lets the stylesheet know the engine is alive */
if (A) document.documentElement.classList.add('anime-on');

/* one easing used everywhere, so the whole site moves with one accent */
const EASE = 'cubicBezier(.16,1,.3,1)';

const anim = opts => (A && !reduce) ? A(opts) : null;

/* split a line of text into masked characters */
function splitLine(el) {
  const text = el.textContent;
  el.textContent = '';
  const line = document.createElement('div');
  line.className = 'ln';
  [...text].forEach(c => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c === ' ' ? '\u00A0' : c;
    line.appendChild(s);
  });
  el.appendChild(line);
  return [...line.children];
}

/* ================================================ 02 · INTRO CURTAIN */
let gateDone = () => {};
let gate = new Promise(r => { gateDone = r; });

if (home && !reduce && A && !sessionStorage.getItem('seen')) {
  sessionStorage.setItem('seen', '1');
  const pre = document.createElement('div');
  pre.className = 'pre';
  pre.innerHTML =
    '<div class="pre-in">' +
      '<span class="pre-name">Youssef</span>' +
      '<span class="pre-role">Video Editor</span>' +
      '<div class="pre-bar"><i></i></div>' +
      '<span class="pre-n">0</span>' +
    '</div>';
  document.body.appendChild(pre);
  document.documentElement.classList.add('pre-on');

  const n = $('.pre-n', pre), counter = { v: 0 };
  A.timeline({ easing: EASE })
    .add({ targets: '.pre-bar i', scaleX: [0, 1], duration: 1000, easing: 'easeInOutQuart' })
    .add({
      targets: counter, v: 100, round: 1, duration: 1000, easing: 'easeInOutQuart',
      update: () => { n.textContent = counter.v; }
    }, 0)
    .add({ targets: '.pre-in', translateY: -24, opacity: 0, duration: 450 }, '+=100')
    .add({
      targets: pre, translateY: '-100%', duration: 750, easing: 'cubicBezier(.7,0,.2,1)',
      complete: () => {
        document.documentElement.classList.remove('pre-on');
        pre.remove();
        gateDone();
      }
    }, '-=220');
} else {
  gateDone();
}

/* ========================================================== 03 · HERO */
const h1 = $('.hero-title h1');
if (h1) {
  /* rebuild "Youssef" + "Video Editor" as two maskable lines */
  const l1 = (h1.childNodes[0].textContent || '').trim();
  const l2 = (h1.querySelector('span')?.textContent || '').trim();
  h1.textContent = '';
  h1.dataset.text = l1 + ' ' + l2;

  const mk = (txt, dim) => {
    const d = document.createElement('div');
    d.className = 'hl' + (dim ? ' dim' : '');
    d.textContent = txt;
    h1.appendChild(d);
    return d;
  };
  const chars = [...splitLine(mk(l1, false)), ...splitLine(mk(l2, true))];

  if (reduce || !A) {
    chars.forEach(c => { c.style.transform = 'none'; });
  } else {
    chars.forEach(c => { c.style.transform = 'translateY(115%)'; });
    gate.then(() => {
      A({ targets: chars, translateY: ['115%', '0%'], duration: 1100, easing: EASE, delay: A.stagger(24) });
      A({
        targets: ['.pill', '.hero-sub p', '.hero-actions', '.hero-cue'],
        translateY: [22, 0], opacity: [0, 1], duration: 900, easing: EASE, delay: A.stagger(90, { start: 260 })
      });
      A({ targets: '.hero-col', translateY: [40, 0], opacity: [0, 1], duration: 1400, easing: EASE, delay: A.stagger(140) });
      A({
        targets: ['header .logo', 'nav li', '.nav-tools > *'],
        translateY: [-14, 0], opacity: [0, 1], duration: 700, easing: EASE, delay: A.stagger(45),
        complete: () => $$('header .logo, nav li, .nav-tools > *').forEach(el => { el.style.transform = ''; el.style.opacity = ''; })
      });
    });
  }
}

/* --- editor-room texture: scanlines, a soft flicker, an audio meter --- */
if (home) {
  const hero = $('.hero');
  if (hero) {
    const scan = document.createElement('div');
    scan.className = 'scanlines';
    scan.setAttribute('aria-hidden', 'true');
    hero.appendChild(scan);
  }

  const cue = $('#heroCue');
  if (cue) {
    const meter = document.createElement('span');
    meter.className = 'meter';
    meter.setAttribute('aria-hidden', 'true');
    meter.innerHTML = '<i></i>'.repeat(14);
    cue.appendChild(meter);
    if (A && !reduce) {
      A({
        targets: '.meter i',
        scaleY: () => 0.25 + Math.random() * 0.95,
        duration: 520,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true,
        delay: A.stagger(55, { from: 'center' })
      });
    }
  }
}

/* ====================================== 04 · WORKS CARDS */
/* the artwork lags behind the pointer, the caption counter-moves */
if (!isTouch && !reduce) {
  const lerp = new WeakMap();

  const set = (card, px, py) => {
    const media  = $('.wc-media', card);
    const bottom = $('.wc-bottom', card);
    const top    = $('.wc-top', card);
    if (media)  media.style.transform  = `translate(${px * -16}px,${py * -16}px) scale(1.12)`;
    if (bottom) bottom.style.transform = `translate(${px * 10}px,${py * 7}px)`;
    if (top)    top.style.transform    = `translateX(${px * -7}px)`;
  };

  document.addEventListener('mousemove', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    set(card, (e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5);
    lerp.set(card, 1);
  }, { passive: true });

  document.addEventListener('mouseout', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card || card.contains(e.relatedTarget)) return;
    ['.wc-media', '.wc-bottom', '.wc-top'].forEach(sel => {
      const el = $(sel, card);
      if (el) el.style.transform = '';
    });
  });
}

/* cards step in whenever the works page re-renders a category
   (main.js still owns the filtering — this only animates the result) */
const filterBar = $('#filters'), grid = $('#worksGrid');
if (filterBar && grid && A && !reduce) {
  const stepIn = () => A({
    targets: $$('.work-card', grid),
    translateY: [26, 0], opacity: [0, 1], scale: [.96, 1],
    duration: 700, easing: EASE, delay: A.stagger(35)
  });
  filterBar.addEventListener('click', e => {
    if (!e.target.closest('.filter')) return;
    requestAnimationFrame(stepIn);   /* runs after main.js has rendered */
  });
  stepIn();
}

/* ============================================ 05 · LIGHTBOX */
const lb = $('.lb');
if (lb && A && !reduce) {
  new MutationObserver(() => {
    if (!lb.classList.contains('open')) return;
    A({ targets: $('.lb-player', lb), scale: [.92, 1], opacity: [0, 1], duration: 550, easing: EASE });
    A({ targets: $$('.lb-info > *', lb), translateY: [18, 0], opacity: [0, 1], duration: 550, easing: EASE, delay: A.stagger(70, { start: 140 }) });
    A({ targets: $('.lb-close', lb), scale: [.5, 1], opacity: [0, 1], duration: 450, easing: EASE, delay: 180 });
  }).observe(lb, { attributes: true, attributeFilter: ['class'] });
}

/* ==================================== 06 · SCROLL PROGRESS */
(() => {
  const bar = document.createElement('div');
  bar.className = 'scroll-prog';
  document.body.appendChild(bar);
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
})();

/* ======================================= 07 · MOBILE MENU */
const mm = $('#mobileMenu');
if (mm && A && !reduce) {
  const links = $$('a', mm);
  new MutationObserver(() => {
    if (!document.body.classList.contains('menu-open')) return;
    A({ targets: links, translateY: [40, 0], opacity: [0, 1], duration: 650, easing: EASE, delay: A.stagger(45) });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

/* ================================ 08 · MICRO INTERACTIONS */
if (A && !reduce) {
  /* tool chips settle in as the row appears */
  $$('.stack-row').forEach(row => {
    new IntersectionObserver((en, io) => {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      A({ targets: $$('.stack-item', row), translateY: [16, 0], opacity: [0, 1], duration: 600, easing: EASE, delay: A.stagger(45) });
    }, { threshold: .3 }).observe(row);
  });

  /* the logo dot pops on every theme switch */
  const themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    A({ targets: '.logo .dot', scale: [1, 1.9, 1], duration: 600, easing: EASE });
    A({ targets: '#themeBtn', rotate: [0, 180], duration: 600, easing: EASE, complete: () => { $('#themeBtn').style.transform = ''; } });
  });
}
})();
