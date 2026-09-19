# Youssef — Video Editor Portfolio

Static site (HTML / CSS / JS). No build step.

```
index.html        home page
works.html        all works page
css/style.css     styles (dark + light theme)
js/data.js        <- add your videos here
js/main.js        behavior
videos/           put your .mp4 files here
assets/           profile.jpg + optional poster images
```

## Add a real video
1. Put `reel-01.mp4` in `videos/`
2. In `js/data.js` set `video: 'videos/reel-01.mp4'` on that work
3. (optional) add a thumbnail in `assets/` and set `poster: 'assets/reel-01.jpg'`

Tips: export vertical 9:16 (e.g. 720x1280, H.264, under ~15 MB). GitHub blocks files over 100 MB.
Bigger videos: upload elsewhere and paste the direct .mp4 URL in `video`.

## Deploy
Push to GitHub, import the repo in Vercel, click Deploy (Framework Preset: Other, no build command).
