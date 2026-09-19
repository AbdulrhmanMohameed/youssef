# Youssef — Video Editor Portfolio

Static site (HTML / CSS / JS). No build step.

```
index.html        home page
works.html        all works page
css/style.css     styles (dark + light theme)
js/data.js        <- add your videos here
js/main.js        behavior
js/fx.js          GSAP motion layer
videos/           put your .mp4 files here
assets/           profile.jpg + optional poster images
```

## Demo videos (turn this off later)
`js/data.js` currently loads free public sample clips so you can see how the
site feels with real video in it. They are 16:9 so they get cropped inside the
9:16 cards — that is expected.

Set `const DEMO = false;` at the top of `js/data.js` to go back to empty
placeholder cards, or simply overwrite `video` / `poster` with your own paths.

## Add a real video
1. Put `reel-01.mp4` in `videos/`
2. In `js/data.js` set `video: 'videos/reel-01.mp4'` on that work
3. (optional) add a thumbnail in `assets/` and set `poster: 'assets/reel-01.jpg'`

Tips: export vertical 9:16 (e.g. 720x1280, H.264, under ~15 MB). GitHub blocks files over 100 MB.
Bigger videos: upload elsewhere and paste the direct .mp4 URL in `video`.

## Motion (GSAP)
GSAP 3.13 loads from cdnjs in both pages, together with the bonus plugins that
became free in that release:

```
gsap  ScrollTrigger  SplitText  Flip  ScrambleTextPlugin  CustomEase
```

Everything lives in `js/fx.js`, split into numbered modules so you can switch
any one of them off by deleting its block:

| # | module | what it does |
|---|--------|--------------|
| 01 | boot | registers plugins, three custom eases (`cut`, `lift`, `swipe`), text splitting with a hand-written fallback |
| 02 | intro curtain | name, counter and loading bar, then the panel swipes up. Once per browser session, home page only |
| 03 | hero | the title rises letter by letter out of a mask; pill, copy, buttons, cue, reel columns and nav follow. Reel frames drift with the pointer |
| 04 | headings and paragraphs | every `.title` gets the same masked letter rise on scroll, and the copy under it comes up line by line (SplitText) |
| 05 | reveals | GSAP takes over the `.reveal` class with a batched y + blur stagger |
| 06 | marquee | driven by GSAP, speeds up with scroll velocity, settles back, slows on hover, plus a small velocity skew |
| 07 | works reel | the card nearest the middle of the screen is the sharp one — the rest scale down, dim and shift their artwork |
| 08 | works gallery | the category filters animate with **Flip**: cards fly to their new positions instead of re-rendering. Cards also enter on scroll |
| 09 | cards + lightbox | artwork drifts behind the cursor, caption counter-moves, lift is GSAP's; the lightbox opens with its own sequence |
| 10 | scramble | nav links and contact labels shuffle their letters on hover (ScrambleTextPlugin) |
| 11 | light and extras | glows breathe, the colour slider sweeps itself on scroll, accent progress hairline, mobile-menu stagger, tool chips and process numbers |

Notes:

* text is only split after `document.fonts.ready`, so SplitText never measures
  the fallback font and breaks the lines in the wrong place
* `html.gsap-on` is added by `fx.js`. The stylesheet uses it to stand down —
  so if the CDN is blocked, the old CSS animations run instead and nothing breaks
* everything is skipped under `prefers-reduced-motion: reduce`

The old hero timeline bar was removed; a small "Scroll" cue sits in its place.

## Deploy
Push to GitHub, import the repo in Vercel, click Deploy (Framework Preset: Other, no build command).
