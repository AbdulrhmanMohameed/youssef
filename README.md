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
GSAP 3.12.5 + ScrollTrigger load from cdnjs in both pages, and `js/fx.js` holds
every animation:

1. hero title rises letter by letter out of a mask, with the nav and reel
   columns staggered behind it
2. the marquees are driven by GSAP and speed up with your scroll velocity,
   then settle back; hovering slows them down
3. a small skew follows fast scrolling and eases back to zero
4. work-card artwork drifts behind the cursor while the caption counter-moves
5. the background glows breathe instead of sitting still
6. an accent hairline across the top tracks scroll progress
7. mobile-menu links step in one after the other

Everything respects `prefers-reduced-motion`, and if GSAP fails to load the
site still works exactly as before.

The old hero timeline bar was removed; a small "Scroll" cue sits in its place.

## Deploy
Push to GitHub, import the repo in Vercel, click Deploy (Framework Preset: Other, no build command).
