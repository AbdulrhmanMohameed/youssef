# Youssef — Video Editor Portfolio

Static site (HTML / CSS / JS). No build step.

```
index.html        home page
works.html        all works page
css/style.css     styles (dark + light theme)
js/data.js        <- add your videos here
js/main.js        behavior
js/fx.js          motion + visuals (anime.js)
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

## Motion and visuals
The engine is **anime.js 3.2.2** from cdnjs — vanilla, about 17 kB, no build
step and no plugins to register. It replaced GSAP.

`js/fx.js` is split into numbered modules; delete a block to switch it off.

| # | module | what it does |
|---|--------|--------------|
| 01 | boot | helpers, one shared easing, a small text splitter |
| 02 | intro curtain | name, counter and loading bar, then the panel lifts. Once per browser session, home page only |
| 03 | hero | title rises letter by letter out of a mask, then the pill, copy, buttons, cue and reel columns. Adds CRT scanlines and a live audio meter |
| 04 | works cards | artwork lags behind the pointer and the caption counter-moves; cards step in each time a category is picked |
| 05 | lightbox | player, info lines and close button open in sequence |
| 06 | scroll progress | accent hairline across the top |
| 07 | mobile menu | links stagger in |
| 08 | micro | tool chips settle in, logo dot pops on a theme switch |

### Visual details (pure CSS, no engine needed)
* scanlines with a slow flicker over the hero
* RGB split across the hero title while the cursor is over it
* viewfinder brackets in the corners of a hovered card
* a pulse ring around the play button
* a light sweeping across the solid and shine buttons
* the active category chip lights up like a button on a deck
* film perforations under each marquee divider
* header icons that cross-fade — moon/sun and bars/close

### Filtering
The works page filter is back to the original `main.js` behaviour. `fx.js` only
animates the cards in after the render; it does not touch the logic.

### Safety
`html.anime-on` is only added when the CDN actually loaded. Everything is
skipped under `prefers-reduced-motion: reduce`, and if the engine never arrives
the page still looks and works right.

The old hero timeline bar was removed; a small "Scroll" cue with the audio
meter sits in its place.

## Deploy
Push to GitHub, import the repo in Vercel, click Deploy (Framework Preset: Other, no build command).
