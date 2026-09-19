/* =====================================================================
   YOUSSEF — VIDEO EDITOR PORTFOLIO  ·  main.js
   Works on both index.html and works.html
   ===================================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = matchMedia('(hover:none)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TONES = ['a', 'b', 'c', 'd', 'e', 'f'];

/* small seeded random so the generated timeline looks the same every load */
const seeded = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const pad2 = n => String(n).padStart(2, '0');

/* ---------------------------------------------------------------- THEME */
const themeBtn = $('#themeBtn');
function syncThemeUI() {
  const dark = document.documentElement.dataset.theme !== 'light';
  themeBtn.textContent = dark ? '☾' : '☀';
  const m = $('meta[name="theme-color"]');
  if (m) m.setAttribute('content', dark ? '#0a0a0b' : '#f5f3ee');
}
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncThemeUI();
});
syncThemeUI();

/* ------------------------------------------------------ HEADER + MENU */
const header = $('#siteHeader');
const menuBtn = $('#menuBtn');
const closeMenu = () => { document.body.classList.remove('menu-open'); if (menuBtn) menuBtn.textContent = '≡'; };
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuBtn.textContent = open ? '✕' : '≡';
  });
}
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });
header.classList.toggle('scrolled', scrollY > 40);

/* ---------------------------------------------- SMOOTH ANCHOR SCROLL */
function scrollToHash(hash, smooth = true) {
  if (!hash || hash === '#') return;
  const el = hash === '#home' ? document.body : $(hash);
  if (!el) return;
  const top = hash === '#home' ? 0 : el.getBoundingClientRect().top + scrollY;
  scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  closeMenu();
  scrollToHash(a.getAttribute('href'));
});
/* arriving from works.html with index.html#projects etc. */
if (location.hash && $('#home')) {
  addEventListener('load', () => setTimeout(() => scrollToHash(location.hash, false), 300));
}

/* ------------------------------------------------------ BACK TO TOP */
const toTop = $('#backToTop');
if (toTop) {
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > innerHeight * 0.8), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ----------------------------------------------------------- REVEAL */
const revealIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
}), { threshold: 0.12 });
const observeReveals = () => $$('.reveal:not(.in)').forEach(el => revealIO.observe(el));

/* ----------------------------------------------------------- MARQUEE */
const PHRASES = ['Precision Timing', 'Clean Visual Storytelling', 'Uncompromised Pacing', 'Details That Matter', 'Shot By Shot', 'Cinematic Vision'];
$$('.marquee-row').forEach(row => {
  const one = PHRASES.map((p, i) => `<span class="item">${p}</span><span class="sep s${i % 4}"></span>`).join('');
  row.innerHTML = one + one;
});

/* ------------------------------------------------------- WORK CARDS */
function workCard(w, i = 0) {
  const poster = w.poster ? `<img class="wc-poster" src="${w.poster}" alt="" loading="lazy" onerror="this.remove()">` : '';
  const video = w.video ? `<video class="wc-video" muted loop playsinline preload="none" data-src="${w.video}"></video>` : '';
  return `
  <article class="work-card tone-${w.tone}" style="--i:${i}" data-id="${w.id}" data-cursor data-view tabindex="0" role="button" aria-label="Play ${w.title}">
    <div class="wc-media"><span class="wc-blob b1"></span><span class="wc-blob b2"></span>${poster}${video}</div>
    <span class="wc-frame"></span>
    <div class="wc-top"><span class="chip">${CATS[w.cat]}</span><span class="wc-year">${w.year}</span></div>
    <div class="wc-play"><i></i></div>
    <div class="wc-bottom"><span class="wc-no">${w.id} / ${w.client}</span><h3>${w.title}</h3><span class="wc-dur">${w.dur}</span></div>
  </article>`;
}

/* hover preview (only if a real video file was set in data.js) */
document.addEventListener('mouseover', e => {
  const c = e.target.closest && e.target.closest('.work-card');
  if (!c || c.contains(e.relatedTarget)) return;
  const v = $('video', c);
  if (!v) return;
  if (!v.src && v.dataset.src) v.src = v.dataset.src;
  v.play().then(() => c.classList.add('playing')).catch(() => {});
});
document.addEventListener('mouseout', e => {
  const c = e.target.closest && e.target.closest('.work-card');
  if (!c || c.contains(e.relatedTarget)) return;
  const v = $('video', c);
  if (!v) return;
  v.pause(); v.currentTime = 0; c.classList.remove('playing');
});

/* ---------------------------------------------------------- LIGHTBOX */
const lb = document.createElement('div');
lb.className = 'lb';
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.innerHTML = `<button class="lb-close" aria-label="Close">✕</button><div class="lb-inner"><div class="lb-player" id="lbPlayer"></div><div class="lb-info" id="lbInfo"></div></div>`;
document.body.appendChild(lb);
const lbPlayer = $('#lbPlayer', lb), lbInfo = $('#lbInfo', lb);
let lastFocus = null;

function openLightbox(w) {
  lastFocus = document.activeElement;
  lb.className = `lb tone-${w.tone}`;
  lbPlayer.innerHTML = w.video
    ? `<video src="${w.video}" controls autoplay loop playsinline ${w.poster ? `poster="${w.poster}"` : ''}></video>`
    : `<div class="lb-empty"><div class="ico"><i></i></div><strong>Video placeholder</strong><small>Add your file path to “video” in js/data.js and this player will play it.</small></div>`;
  lbInfo.innerHTML = `<span class="chip">${CATS[w.cat]}</span><h3>${w.title}</h3><p>${w.client}<br>${w.year} — ${w.dur}<br>Vertical 9:16</p>`;
  requestAnimationFrame(() => lb.classList.add('open'));
  document.body.classList.add('lb-open');
  $('.lb-close', lb).focus();
}
function closeLightbox() {
  lb.classList.remove('open');
  document.body.classList.remove('lb-open');
  const v = $('video', lbPlayer); if (v) v.pause();
  setTimeout(() => { if (!lb.classList.contains('open')) lbPlayer.innerHTML = ''; }, 400);
  if (lastFocus) lastFocus.focus();
}
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) closeLightbox(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox(); });
document.addEventListener('click', e => {
  const c = e.target.closest && e.target.closest('.work-card');
  if (c) openLightbox(WORKS.find(w => w.id === c.dataset.id));
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('work-card')) {
    e.preventDefault(); openLightbox(WORKS.find(w => w.id === e.target.dataset.id));
  }
});

/* -------------------------------------------------- HOME: work cards */
const projCards = $('#projCards');
if (projCards) {
  projCards.innerHTML = WORKS.slice(0, FEATURED).map((w, i) => workCard(w, i)).join('');
  const cnt = $('#worksCount'); if (cnt) cnt.textContent = `${WORKS.length} projects`;
}

/* ----------------------------------------------- WORKS PAGE: filters */
const grid = $('#worksGrid');
if (grid) {
  const bar = $('#filters');
  const counts = k => k === 'all' ? WORKS.length : WORKS.filter(w => w.cat === k).length;
  bar.innerHTML = Object.keys(CATS).filter(k => counts(k) > 0)
    .map(k => `<button class="filter ${k === 'all' ? 'on' : ''}" data-cat="${k}" data-cursor>${CATS[k]}<sup>${counts(k)}</sup></button>`).join('');
  const render = cat => {
    const list = WORKS.filter(w => cat === 'all' || w.cat === cat);
    grid.innerHTML = list.length ? list.map((w, i) => workCard(w, i)).join('') : '<p class="works-empty">Nothing here yet.</p>';
  };
  bar.addEventListener('click', e => {
    const b = e.target.closest('.filter'); if (!b) return;
    $$('.filter', bar).forEach(x => x.classList.toggle('on', x === b));
    render(b.dataset.cat);
  });
  const fromHash = location.hash.replace('#', '');
  const start = CATS[fromHash] ? fromHash : 'all';
  render(start);
  $$('.filter', bar).forEach(x => x.classList.toggle('on', x.dataset.cat === start));
}

/* ------------------------------------------------------ STACK (home) */
const STACK = [
  { title: 'Editing software', items: [['Pr', 'Premiere Pro', '#EA77FF'], ['DR', 'DaVinci Resolve', 'wheel'], ['FCP', 'Final Cut Pro', '#3E9BFF'], ['CC', 'CapCut', '#00E5CF']] },
  { title: 'Motion & VFX', items: [['Ae', 'After Effects', '#CF96FD'], ['Bl', 'Blender', '#F5792A'], ['Mo', 'Mocha Pro', '#FF6B6B']] },
  { title: 'Audio & color', items: [['Au', 'Audition', '#00E4BB'], ['CG', 'Color Grading', '#FFB020'], ['ST', 'Soundtrack Pro', '#8FA0FF']] },
  { title: 'Design & export', items: [['Ps', 'Photoshop', '#31A8FF'], ['Ai', 'Illustrator', '#FF9A00'], ['ME', 'Media Encoder', '#8B7CFF']] }
];
const stackEl = $('#stackContainer');
if (stackEl) {
  stackEl.innerHTML = STACK.map(cat => `
    <div class="stack-cat reveal">
      <div class="stack-cat-head"><h3>${cat.title}</h3></div>
      <div class="stack-row">${cat.items.map(([ab, nm, col]) => `
        <div class="stack-item">
          <span class="sw ${col === 'wheel' ? 'wheel' : ''}" style="--sw:${col === 'wheel' ? '#888' : col}">${col === 'wheel' ? '' : ab}</span>
          <span class="nm">${nm}</span>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

/* ---------------------------------------------- PROCESS mini visuals */
const waveHTML = (n, rnd) => Array.from({ length: n }, (_, i) => {
  const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 6.5));
  return `<i style="height:${Math.round(18 + 78 * env * (0.35 + rnd() * 0.65))}%"></i>`;
}).join('');
$$('[data-wave]').forEach((el, k) => { el.innerHTML = waveHTML(+el.dataset.wave, seeded(11 + k)); });
$$('.mv-bins').forEach(el => {
  const rnd = seeded(5);
  el.innerHTML = Array.from({ length: 12 }, () => `<i class="tone-${TONES[Math.floor(rnd() * 6)]}"></i>`).join('');
});
$$('.mv-cut').forEach(el => {
  const rnd = seeded(9);
  el.innerHTML = [3, 5, 2, 4, 3].map(f => `<i class="tone-${TONES[Math.floor(rnd() * 6)]}" style="flex:${f}"></i>`).join('');
});

/* --------------------------------------------------- BEFORE / AFTER */
const ba = $('#ba');
if (ba) {
  const range = $('input', ba);
  const upd = () => ba.style.setProperty('--pos', range.value + '%');
  range.addEventListener('input', upd); upd();
}

/* ---------------------------------------------------- STAT COUNTERS */
$$('.stat-num').forEach(el => {
  const to = +el.dataset.count, suf = el.dataset.suffix || '';
  el.textContent = '0' + suf;
  new IntersectionObserver((en, io) => {
    if (!en[0].isIntersecting) return;
    io.disconnect();
    if (reduceMotion) { el.textContent = to + suf; return; }
    const t0 = performance.now(), D = 1400;
    (function step(t) {
      const p = Math.min((t - t0) / D, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }, { threshold: 0.6 }).observe(el);
});

/* ------------------------------------------------------- ROADMAP */
const ROADMAP = [
  { id: '01', y: '2022', tone: 'a', p: 'Started learning editing and filming fundamentals, and picked up the basics of visual storytelling.', tags: ['Filming', 'Fundamentals'] },
  { id: '02', y: '2023', tone: 'b', p: 'Began using Premiere Pro and After Effects professionally, and worked on my first real client projects.', tags: ['Premiere Pro', 'After Effects'] },
  { id: '03', y: '2024', tone: 'c', p: 'Improved my color grading and motion graphics skills, and worked on social media content continuously.', tags: ['DaVinci Resolve', 'Motion Graphics'] },
  { id: '04', y: '2025', tone: 'd', p: 'Started working with brands on ads and covers, and learned CapCut and fast export tools for social.', tags: ['CapCut', 'Color Grading'] },
  { id: '05', y: '2026', tone: 'e', p: 'Currently working as a freelance video editor, developing my Motion Design skills and AI editing tools.', tags: ['Motion Design', 'AI Tools'] }
];
const roadEl = $('#roadContainer');
if (roadEl) {
  roadEl.innerHTML = ROADMAP.map((r, i) => `
    <div class="road-item ${i % 2 ? 'rev' : ''}">
      <div class="side"></div>
      <div class="road-card">
        <div class="road-box" data-roadbox>
          <div class="road-thumb tone-${r.tone}"><b>${r.id}</b></div>
          <h3>${r.y}</h3>
          <p>${r.p}</p>
          <div class="road-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
      </div>
    </div>`).join('');

  const wrap = $('#roadWrap'), prog = $('#roadProgress');
  const boxes = $$('[data-roadbox]');
  const update = () => {
    const rect = wrap.getBoundingClientRect();
    const frac = Math.max(0, Math.min((innerHeight / 2 - rect.top) / rect.height, 1));
    prog.style.height = frac * 100 + '%';
    const lineY = rect.top + rect.height * frac;
    boxes.forEach(b => {
      const on = lineY >= b.getBoundingClientRect().top + 30;
      b.classList.toggle('active', on);
      b.closest('.road-item').classList.toggle('on', on);
    });
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------- READ MORE */
const rm = $('#readMoreBtn');
if (rm) rm.addEventListener('click', () => $('#aboutFull').classList.toggle('open'));

/* ================================================================
   HERO  (home only): reel columns, timeline, parallax fade
   ================================================================ */
const heroInner = $('#heroInner');
if (heroInner) {
  /* two endless columns of vertical “reel frames” */
  [['col1', 0], ['col2', 3]].forEach(([id, off]) => {
    const el = $('#' + id); if (!el) return;
    let html = '';
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 6; i++) {
        const n = (i + off) % 6;
        html += `<div class="fc tone-${TONES[(i * 2 + off) % 6]}"><i></i><span>REEL_${pad2(n + 1)}</span></div>`;
      }
    }
    el.innerHTML = html;
  });

  /* timeline clips: footage on V1, titles on V2, linked audio on A1 */
  const V1_NAMES = ['A012_C003', 'Interview_01', 'Drone_04', 'B-roll', 'GH010231', 'Cutaway', 'Product_02', 'A014_C009', 'Outro'];
  const V2_NAMES = ['Title', 'Lower third', 'Logo', 'Subtitle', 'Overlay'];
  const V1_COLORS = ['teal', 'teal', 'blue', 'blue', 'ember'];
  const rnd = seeded(8);
  const cuts = []; let cx = 0;
  while (cx < 99) {
    let w = 9 + rnd() * 15;
    if (100 - (cx + w) < 8) w = 100 - cx;
    cuts.push([cx, w]); cx += w;
  }
  $('#laneV1').innerHTML = cuts.map(([x, w], i) =>
    `<div class="tl-clip thumbs c-${V1_COLORS[Math.floor(rnd() * V1_COLORS.length)]}" style="left:${x.toFixed(2)}%;width:${(w - 0.3).toFixed(2)}%"><span>${V1_NAMES[i % V1_NAMES.length]}</span></div>`).join('');

  const r2 = seeded(21); let px = 4, k = 0, v2 = '';
  while (px < 90) {
    const w = 5 + r2() * 7;
    v2 += `<div class="tl-clip c-${r2() < 0.6 ? 'violet' : 'rose'}" style="left:${px.toFixed(2)}%;width:${w.toFixed(2)}%"><span>${V2_NAMES[k++ % V2_NAMES.length]}</span></div>`;
    px += w + 7 + r2() * 14;
  }
  $('#laneV2').innerHTML = v2;

  const r3 = seeded(3);
  $('#laneA1').innerHTML = cuts.map(([x, w]) => {
    const n = Math.max(10, Math.round(w * 3.4)), ph0 = r3() * 6, top = [], bot = [];
    for (let i = 0; i < n; i++) {
      const a = (0.2 + 0.8 * r3()) * (0.45 + 0.55 * Math.abs(Math.sin(i / 3.4 + ph0)));
      top.push(`${i},${(10 - a * 9).toFixed(2)}`); bot.unshift(`${i},${(10 + a * 9).toFixed(2)}`);
    }
    return `<div class="tl-aclip" style="left:${x.toFixed(2)}%;width:${(w - 0.3).toFixed(2)}%"><svg viewBox="0 0 ${n} 20" preserveAspectRatio="none"><polygon points="${top.concat(bot).join(' ')}"/></svg></div>`;
  }).join('');

  /* playhead + timecode */
  const ph = $('#tlPH'), tc = $('#tlTC');
  const LOOP = 18000, FPS = 24;
  const fmt = f => `${pad2(Math.floor(f / (FPS * 3600)))}:${pad2(Math.floor(f / (FPS * 60)) % 60)}:${pad2(Math.floor(f / FPS) % 60)}:${pad2(f % FPS)}`;
  const setPlayhead = p => { ph.style.left = (p * 100).toFixed(3) + '%'; tc.textContent = fmt(Math.floor(p * LOOP / 1000 * FPS)); };

  /* parallax fade as the page scrolls over the fixed hero */
  const heroCols = $('.hero-cols');
  let cur = scrollY, target = scrollY;
  addEventListener('scroll', () => { target = scrollY; }, { passive: true });
  const colOpacity = getComputedStyle(heroCols).opacity;

  if (reduceMotion) setPlayhead(0.38);
  (function loop(t) {
    cur += (target - cur) * 0.1;
    if (cur < innerHeight * 1.2) {
      const o = Math.max(0, Math.min(1, 1 - cur / (innerHeight * 0.8)));
      heroInner.style.opacity = o;
      heroInner.style.transform = `translateY(${cur * 0.4}px)`;
      heroCols.style.opacity = o * parseFloat(colOpacity || 0.85);
      heroCols.style.transform = `translateY(${cur * 0.1}px)`;
      if (!reduceMotion) setPlayhead((t % LOOP) / LOOP);
    }
    requestAnimationFrame(loop);
  })(0);
}

/* ================================================================
   ROPE CARD (about photo you can drag)
   ================================================================ */
const rCard = $('#ropeCard');
if (rCard && !isTouch) {
  const rLine = $('.rope-svg line'), rSvg = $('.rope-svg');
  const center = () => rSvg.getBoundingClientRect().width / 2;
  const setCenter = () => rLine.setAttribute('x1', center());
  addEventListener('resize', setCenter); setCenter();

  let drag = false, sx = 0, sy = 0, x = 0, y = 0, vx = 0, vy = 0;
  rCard.addEventListener('mousedown', e => { drag = true; sx = e.clientX - x; sy = e.clientY - y; });
  addEventListener('mousemove', e => { if (drag) { x = e.clientX - sx; y = e.clientY - sy; } });
  addEventListener('mouseup', () => { drag = false; });
  (function loop() {
    if (!drag) { vx += -x * 0.04; vy += -y * 0.04; vx *= 0.85; vy *= 0.85; x += vx; y += vy; }
    rCard.style.transform = `translate(${x}px,${y}px) rotate(${x * 0.05}deg)`;
    rLine.setAttribute('x2', center() + x);
    rLine.setAttribute('y2', 80 + y);
    requestAnimationFrame(loop);
  })();
}

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
(() => {
  if (isTouch) return;
  const dot = $('#curDot'), ring = $('#curRing');
  let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, rx = mx, ry = my, started = false;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!started) { started = true; document.body.classList.add('cur-on'); dx = rx = mx; dy = ry = my; }
  }, { passive: true });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));
  document.addEventListener('mouseenter', () => started && document.body.classList.add('cur-on'));
  (function loop() {
    dx += (mx - dx) * 0.4; dy += (my - dy) * 0.4;
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    dot.style.transform = `translate(${dx}px,${dy}px)`;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    const t = e.target;
    const view = t.closest && t.closest('[data-view]');
    const link = t.closest && t.closest('a,button,[data-cursor]');
    dot.classList.toggle('hide', !!view);
    ring.classList.toggle('view', !!view);
    ring.classList.toggle('hover', !view && !!link);
  });
  $$('.magnetic').forEach(btn => {
    btn.style.transition = 'transform .35s cubic-bezier(.25,.46,.45,.94), background .3s, color .3s, border-color .3s';
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ================================================================
   HORIZONTAL SCROLL PROJECTS (home, desktop)
   Vertical scroll drives a horizontal move of the reels.
   On phones/tablets it becomes a native swipe carousel (CSS).
   ================================================================ */
(() => {
  const wrapper = $('#projects'), track = $('#projects-track');
  if (!wrapper || !track) return;
  let dist = 0, target = 0, cur = 0, running = false;
  const desktop = () => innerWidth >= 900;

  function measure() {
    if (!desktop()) { wrapper.style.height = ''; track.style.transform = ''; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth);
    wrapper.style.height = (dist + innerHeight) + 'px';
    onScroll();
  }
  function onScroll() {
    if (!desktop()) return;
    target = Math.max(0, Math.min(-wrapper.getBoundingClientRect().top, dist));
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    cur += (target - cur) * 0.09;
    track.style.transform = `translateX(${-cur}px)`;
    if (Math.abs(target - cur) > 0.3) requestAnimationFrame(tick); else { cur = target; track.style.transform = `translateX(${-cur}px)`; running = false; }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);
  measure();
})();

observeReveals();
})();
