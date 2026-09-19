/* =====================================================================
   FX  ·  GSAP motion system        (loads after main.js — fully additive)
   ---------------------------------------------------------------------
   Plugins used (all free since GSAP 3.13): ScrollTrigger, SplitText,
   Flip, ScrambleTextPlugin, CustomEase.

   Modules
     01  boot + eases + text splitting
     02  intro curtain
     03  hero
     04  headings and paragraphs
     05  generic reveals
     06  marquee + scroll velocity
     07  works reel (home) — focus + depth
     08  works gallery (works.html) — Flip filtering
     09  card cursor parallax
     10  scramble text
     11  light, grade slider, progress, menu, micro

   If GSAP never loads, none of this runs and the site behaves exactly
   like the plain HTML/CSS version.
   ===================================================================== */
(() => {
'use strict';

/* ========================================================== 01 · BOOT */
if (typeof gsap === 'undefined') return;

const has = n => typeof window[n] !== 'undefined';
if (has('ScrollTrigger'))       gsap.registerPlugin(ScrollTrigger);
if (has('SplitText'))           gsap.registerPlugin(SplitText);
if (has('Flip'))                gsap.registerPlugin(Flip);
if (has('ScrambleTextPlugin'))  gsap.registerPlugin(ScrambleTextPlugin);
if (has('CustomEase'))          gsap.registerPlugin(CustomEase);

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = matchMedia('(hover:none)').matches;
const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
const home    = !!$('#heroInner');

/* tells the stylesheet that GSAP owns the motion from here on */
document.documentElement.classList.add('gsap-on');

/* eases with a bit of character instead of the stock ones */
if (has('CustomEase')) {
  CustomEase.create('cut',   'M0,0 C0.12,0 0.13,1 1,1');          // fast out, long settle
  CustomEase.create('lift',  'M0,0 C0.3,0 0,1 1,1');
  CustomEase.create('swipe', 'M0,0 C0.7,0 0.2,1 1,1');
} else {
  gsap.registerEase('cut',   p => 1 - Math.pow(1 - p, 4.2));
  gsap.registerEase('lift',  p => 1 - Math.pow(1 - p, 3));
  gsap.registerEase('swipe', p => 1 - Math.pow(1 - p, 3.4));
}

/* --------------------------------------------------- text splitting */
/* SplitText when it's there, a small hand-rolled splitter when it isn't */
function splitHeading(el) {
  if (!el || el.dataset.split) return null;
  el.dataset.split = '1';
  if (has('SplitText')) {
    try {
      const s = new SplitText(el, { type: 'lines,chars', linesClass: 'ln', charsClass: 'ch' });
      if (s.chars.length) return s.chars;
    } catch (e) { /* fall through */ }
  }
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
  return $$('.ch', el);
}

function splitLines(el) {
  if (!el || el.dataset.split) return null;
  el.dataset.split = '1';
  if (has('SplitText')) {
    try {
      const s = new SplitText(el, { type: 'lines', linesClass: 'pl' });
      if (s.lines.length) return s.lines;
    } catch (e) { /* fall through */ }
  }
  return [el];
}

/* ================================================ 02 · INTRO CURTAIN */
/* shows once per browser session, on the home page only */
let introGate = Promise.resolve();

if (home && !reduce && !sessionStorage.getItem('seen')) {
  sessionStorage.setItem('seen', '1');
  const pre = document.createElement('div');
  pre.className = 'pre';
  pre.innerHTML =
    '<div class="pre-in"><span class="pre-name">Youssef</span>' +
    '<span class="pre-role">Video Editor</span>' +
    '<div class="pre-bar"><i></i></div><span class="pre-n">0</span></div>';
  document.body.appendChild(pre);
  document.documentElement.classList.add('pre-on');

  introGate = new Promise(done => {
    const n = $('.pre-n', pre), counter = { v: 0 };
    gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('pre-on');
        pre.remove();
        if (has('ScrollTrigger')) ScrollTrigger.refresh();
        done();
      }
    })
      .to('.pre-bar i', { scaleX: 1, duration: 1.1, ease: 'lift' })
      .to(counter, {
        v: 100, duration: 1.1, ease: 'lift',
        onUpdate: () => { n.textContent = Math.round(counter.v); }
      }, 0)
      .to('.pre-in', { y: -26, opacity: 0, duration: .5, ease: 'cut' }, '+=.12')
      .to(pre, { yPercent: -100, duration: .8, ease: 'swipe' }, '-=.25');
  });
}

/* split only once the webfonts are in, otherwise SplitText measures the
   fallback font and the line breaks come out wrong */
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
const ready = Promise.race([fontsReady, new Promise(r => setTimeout(r, 2500))]);

gsap.set('.hero-title h1', { autoAlpha: 0 });
const headingBlocks = [];

ready.then(() => {

  /* ========================================================== 03 · HERO */
  const h1 = $('.hero-title h1');
  if (h1) {
    /* the h1 is "Youssef" + <span>Video Editor</span> — split each line apart */
    const l1 = (h1.childNodes[0].textContent || '').trim();
    const l2 = (h1.querySelector('span')?.textContent || '').trim();
    h1.textContent = '';
    const mk = (txt, dim) => {
      const d = document.createElement('div');
      d.className = 'hl' + (dim ? ' dim' : '');
      d.textContent = txt;
      h1.appendChild(d);
      return d;
    };
    const chars = [...(splitHeading(mk(l1, false)) || []), ...(splitHeading(mk(l2, true)) || [])];

    gsap.set(h1, { autoAlpha: 1 });
    const intro = gsap.timeline({ paused: true, defaults: { ease: 'cut' } });
    if (reduce) {
      gsap.set(chars, { yPercent: 0, opacity: 1 });
    } else {
      intro
        .from(chars, { yPercent: 116, duration: 1.15, stagger: { each: .024 } })
        .from('.pill', { y: 16, opacity: 0, duration: .7 }, .12)
        .from('.hero-sub p', { y: 20, opacity: 0, duration: .85 }, '-=.8')
        .from('.hero-actions', { y: 20, opacity: 0, duration: .85 }, '-=.65')
        .from('.hero-cue', { x: -24, opacity: 0, duration: .8 }, '-=.55')
        .from('.hero-col', { yPercent: 10, opacity: 0, duration: 1.5, stagger: .14, ease: 'lift' }, .1)
        .from('header .logo, nav li, .nav-tools > *', { y: -14, opacity: 0, duration: .6, stagger: .05 }, .05);
    }
    introGate.then(() => intro.play());
  }

  /* the reel frames in the hero drift slightly with the pointer */
  if (home && !isTouch && !reduce) {
    const cols = $$('.hero-col');
    const setters = cols.map((c, i) => ({ el: c, d: i ? -1 : 1 }));
    let tx = 0, ty = 0;
    addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth - .5) * 22;
      ty = (e.clientY / innerHeight - .5) * 16;
    }, { passive: true });
    gsap.ticker.add(() => {
      setters.forEach(s => {
        const cx = gsap.getProperty(s.el, 'x') || 0;
        const cy = gsap.getProperty(s.el, 'y') || 0;
        gsap.set(s.el, {
          x: cx + ((tx * s.d) - cx) * .05,
          y: cy + ((ty * s.d) - cy) * .05
        });
      });
    });
  }

  /* ====================================== 04 · HEADINGS AND PARAGRAPHS */
  /* every big title gets the masked letter rise; body copy comes up line
     by line right after it — that's the "library" text feel             */

  $$('.title').forEach(t => {
    if (t.closest('.hero-title')) return;
    const chars = splitHeading(t);
    if (!chars) return;

    /* the copy that belongs with this title */
    const host = t.parentElement;
    const mates = [...host.children].filter(c => c !== t);
    const lines = [];
    mates.forEach(m => {
      if (m.tagName === 'P') lines.push(...(splitLines(m) || []));
      else lines.push(m);
    });

    headingBlocks.push(host.closest('.reveal') || host);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'cut' } })
      .from(chars, { yPercent: 118, duration: 1, stagger: { each: .022 } });
    if (lines.length) tl.from(lines, { y: 22, opacity: 0, duration: .8, stagger: .07 }, '-=.72');

    if (reduce) { tl.progress(1); return; }

    if (t.closest('.page-head') || t.closest('.hero')) { introGate.then(() => tl.play()); return; }
    if (!has('ScrollTrigger')) { tl.play(); return; }

    /* the works lead sits inside a track that slides sideways, so it gets
       the section itself as a trigger instead of its own box */
    const inTrack = !!t.closest('#projects-track');
    ScrollTrigger.create({
      trigger: inTrack ? '#projects' : host,
      start: inTrack ? 'top 72%' : 'top 84%',
      once: true,
      onEnter: () => tl.play()
    });
  });

  /* stand-alone paragraphs worth splitting */
  ['.about-lead', '.about-desc', '.proj-intro'].forEach(sel => {
    $$(sel).forEach(p => {
      const lines = splitLines(p);
      if (!lines) return;
      const block = p.closest('.reveal');
      if (block) headingBlocks.push(block);   /* don't animate it twice */
      if (reduce || !has('ScrollTrigger')) return;
      gsap.from(lines, {
        scrollTrigger: { trigger: p, start: 'top 86%', once: true },
        y: 24, opacity: 0, duration: .85, stagger: .07, ease: 'cut'
      });
    });
  });

  /* ============================================== 05 · GENERIC REVEALS */
  /* GSAP takes over the .reveal class (the stylesheet steps aside)      */
  if (has('ScrollTrigger') && !reduce) {
    const items = $$('.reveal').filter(el => !headingBlocks.includes(el));
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: batch => gsap.from(batch, {
        y: 36, opacity: 0, filter: 'blur(9px)', duration: 1, ease: 'cut', stagger: .1, clearProps: 'filter'
      })
    });
  }


});

/* ================================ 06 · MARQUEE AND SCROLL VELOCITY */
const marquees = $$('.marquee').map(m => {
  const row = $('.marquee-row', m);
  if (!row) return null;
  row.style.animation = 'none';
  const rev = m.classList.contains('rev');
  const tw = gsap.fromTo(row,
    { xPercent: rev ? -50 : 0 },
    { xPercent: rev ? 0 : -50, duration: 46, ease: 'none', repeat: -1 });
  m.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: .16, duration: .5 }));
  m.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: .6 }));
  return tw;
}).filter(Boolean);

if (has('ScrollTrigger') && !reduce) {
  const skewSet = gsap.quickSetter($$('.marquee-row, .stack-row'), 'skewY', 'deg');
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

/* ================================= 07 · WORKS REEL (home) — FOCUS */
/* the horizontal track is still driven by main.js; this layer gives the
   reel depth: the card nearest the middle is the sharp one            */
const reel = $('#projCards');
if (reel && !reduce) {
  const cards = $$('.work-card', reel);
  const state = cards.map(c => ({
    card: c,
    media: $('.wc-media', c),
    frame: $('.wc-frame', c),
    v: 0
  }));

  const wide = () => innerWidth >= 900;
  let flat = false;
  gsap.ticker.add(() => {
    if (!wide()) {
      /* on phones the reel is a native swipe carousel — hand it back */
      if (!flat) {
        flat = true;
        state.forEach(s => {
          s.v = 0;
          gsap.set([s.card, s.media, s.frame].filter(Boolean), { clearProps: 'scale,opacity,xPercent' });
        });
      }
      return;
    }
    flat = false;
    const sec = $('#projects');
    const r = sec.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;

    const mid = innerWidth / 2;
    state.forEach(s => {
      const b = s.card.getBoundingClientRect();
      if (b.right < -200 || b.left > innerWidth + 200) return;
      const d = gsap.utils.clamp(-1, 1, (b.left + b.width / 2 - mid) / (innerWidth * .6));
      s.v += (d - s.v) * .12;
      gsap.set(s.card, { scale: 1 - Math.abs(s.v) * .07, opacity: 1 - Math.abs(s.v) * .38 });
      gsap.set(s.media, { xPercent: s.v * 6 });
      if (s.frame) gsap.set(s.frame, { opacity: .55 + (1 - Math.abs(s.v)) * .45 });
    });
  });

}

/* ============ 08 · WORKS GALLERY (works.html) — FLIP FILTERING */
const grid = $('#worksGrid'), bar = $('#filters');
if (grid && bar && has('Flip')) {
  /* make sure every card is in the DOM, then take the filter bar over
     from main.js so the cards can be animated instead of re-rendered */
  const allBtn = $('[data-cat="all"]', bar);
  if (allBtn) allBtn.click();

  const freshBar = bar.cloneNode(true);
  bar.replaceWith(freshBar);

  const cards = $$('.work-card', grid);
  cards.forEach(c => c.style.animation = 'none');

  const apply = (cat, animate = true) => {
    const state = animate ? Flip.getState(cards) : null;
    cards.forEach(c => {
      const w = WORKS.find(x => x.id === c.dataset.id);
      c.classList.toggle('is-out', !(cat === 'all' || (w && w.cat === cat)));
    });
    if (!state) return;
    Flip.from(state, {
      duration: .62,
      ease: 'power2.inOut',
      absolute: true,
      scale: true,
      stagger: .022,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .84, y: 22 },
        { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'cut', stagger: .03 }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .84, duration: .3, ease: 'power2.in' })
    });
  };

  freshBar.addEventListener('click', e => {
    const b = e.target.closest('.filter');
    if (!b) return;
    $$('.filter', freshBar).forEach(x => x.classList.toggle('on', x === b));
    gsap.fromTo(b, { scale: .92 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
    apply(b.dataset.cat);
  });

  /* entrance, card by card */
  if (has('ScrollTrigger') && !reduce) {
    ScrollTrigger.batch(cards, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.from(batch, {
        y: 60, opacity: 0, scale: .94, duration: .9, ease: 'cut', stagger: .06
      })
    });
  }

  /* honour #reels, #ads … in the URL */
  const fromHash = location.hash.replace('#', '');
  if (fromHash && typeof CATS !== 'undefined' && CATS[fromHash]) {
    $$('.filter', freshBar).forEach(x => x.classList.toggle('on', x.dataset.cat === fromHash));
    apply(fromHash, false);
  }
}

/* the lightbox gets its own little open sequence */
const lb = $('.lb');
if (lb && !reduce) {
  const inner = $('.lb-inner', lb);
  if (inner) inner.style.transition = 'none';
  new MutationObserver(() => {
    if (!lb.classList.contains('open')) return;
    const tl = gsap.timeline({ defaults: { ease: 'cut' } });
    tl.fromTo($('.lb-player', lb), { scale: .9, yPercent: 4, opacity: 0 },
              { scale: 1, yPercent: 0, opacity: 1, duration: .6 });
    const info = $$('.lb-info > *', lb);
    if (info.length) tl.from(info, { y: 20, opacity: 0, duration: .55, stagger: .07 }, '-=.35');
    tl.fromTo($('.lb-close', lb), { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .45 }, '-=.5');
  }).observe(lb, { attributes: true, attributeFilter: ['class'] });
}

/* ================================== 09 · CARD CURSOR PARALLAX */
if (!isTouch && !reduce) {
  /* the lift is GSAP's now, so it can sit next to the reel's scaling */
  document.addEventListener('mouseover', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card || card.contains(e.relatedTarget)) return;
    gsap.to(card, { y: -10, duration: .5, ease: 'cut' });
  });
  document.addEventListener('mouseout', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card || card.contains(e.relatedTarget)) return;
    gsap.to(card, { y: 0, duration: .5, ease: 'cut' });
  });

  document.addEventListener('mousemove', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    gsap.to($('.wc-media', card), { x: px * -18, y: py * -18, scale: 1.14, duration: .9, ease: 'power3.out', overwrite: 'auto' });
    gsap.to($('.wc-bottom', card), { x: px * 11, y: py * 8, duration: 1.1, ease: 'power3.out', overwrite: 'auto' });
    gsap.to($('.wc-top', card), { x: px * -8, duration: 1.1, ease: 'power3.out', overwrite: 'auto' });
  }, { passive: true });

  document.addEventListener('mouseout', e => {
    const card = e.target.closest && e.target.closest('.work-card');
    if (!card || card.contains(e.relatedTarget)) return;
    gsap.to([$('.wc-media', card), $('.wc-bottom', card), $('.wc-top', card)],
      { x: 0, y: 0, scale: 1, duration: .8, ease: 'power3.out', overwrite: 'auto' });
  });
}

/* ========================================= 10 · SCRAMBLE TEXT */
/* nav links and contact labels shuffle their letters on hover  */
if (has('ScrambleTextPlugin') && !isTouch && !reduce) {
  $$('nav a, .contact-row .lbl, .shine-btn, .nav-cta').forEach(el => {
    const original = el.textContent;
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        duration: .55,
        scrambleText: { text: original, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\|<>*', speed: .7, revealDelay: .08 }
      });
    });
  });
}

/* ============================== 11 · LIGHT, GRADE, PROGRESS, MENU */

/* the background glows breathe instead of sitting still */
if (!reduce) {
  $$('.glow').forEach((g, i) => {
    gsap.to(g, {
      xPercent: gsap.utils.random(-14, 14),
      yPercent: gsap.utils.random(-12, 12),
      scale: gsap.utils.random(.86, 1.2),
      duration: gsap.utils.random(11, 18),
      ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * .6
    });
  });
}

/* the colour slider sweeps itself as the section passes by
   (it stops the moment you grab the handle yourself)        */
const ba = $('#ba');
if (ba && has('ScrollTrigger') && !reduce) {
  const range = $('input', ba);
  let owned = false;
  range.addEventListener('input', () => { owned = true; }, { once: true });
  const pos = { v: 50 };
  gsap.to(pos, {
    scrollTrigger: { trigger: ba, start: 'top 80%', end: 'bottom 40%', scrub: 1.2 },
    v: 88,
    onUpdate: () => {
      if (owned) return;
      ba.style.setProperty('--pos', pos.v + '%');
      range.value = pos.v;
    }
  });
}

/* accent hairline across the top */
(() => {
  const el = document.createElement('div');
  el.className = 'scroll-prog';
  document.body.appendChild(el);
  const set = gsap.quickSetter(el, 'scaleX');
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    set(max > 0 ? Math.min(scrollY / max, 1) : 0);
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
})();

/* mobile menu links step in */
const mm = $('#mobileMenu');
if (mm && !reduce) {
  const links = $$('a', mm);
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open'))
      gsap.fromTo(links, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'cut', stagger: .05 });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

/* small stuff: tool chips, process numbers, stat figures, back to top */
if (has('ScrollTrigger') && !reduce) {
  $$('.stack-row').forEach(row => {
    gsap.from($$('.stack-item', row), {
      scrollTrigger: { trigger: row, start: 'top 90%', once: true },
      y: 18, opacity: 0, duration: .6, ease: 'cut', stagger: .05
    });
  });
  $$('.step .n, .stat-num').forEach(el => {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%', once: true }, y: 20, opacity: 0, duration: .8, ease: 'cut' });
  });
  addEventListener('load', () => ScrollTrigger.refresh());
}

if (!isTouch && !reduce) {
  $$('.stack-item').forEach(it => {
    it.addEventListener('mouseenter', () => gsap.to(it, { y: -4, duration: .35, ease: 'cut' }));
    it.addEventListener('mouseleave', () => gsap.to(it, { y: 0, duration: .45, ease: 'cut' }));
  });
  $$('.contact-row').forEach(r => {
    const arrow = $('.arrow', r);
    if (!arrow) return;
    r.addEventListener('mouseenter', () => gsap.fromTo(arrow, { x: -6, y: 6, opacity: .4 }, { x: 0, y: 0, opacity: 1, duration: .45, ease: 'cut' }));
  });
}
})();
