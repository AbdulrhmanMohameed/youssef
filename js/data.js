/* =====================================================================
   WORKS DATA  —  this is the ONLY file you need to edit to add videos.

   For each work:
     video  : path to your mp4 file (put the file inside /videos)
              e.g.  video: 'videos/reel-01.mp4'
              leave '' to keep the placeholder card
     poster : optional thumbnail image (put it inside /assets)
              e.g.  poster: 'assets/reel-01.jpg'
     cat    : reels | ads | music | film | motion
     tone   : a | b | c | d | e | f   (placeholder color: ember, violet,
              teal, amber, rose, blue)

   The first FEATURED works show on the home page. Everything shows on
   the Works page (works.html).

   ---------------------------------------------------------------------
   DEMO MODE  ·  IMPORTANT
   The videos below are free public sample clips (Google's open test
   bucket) so you can see how the site feels with real video in it.
   They are 16:9, so they get cropped inside the 9:16 cards — that is
   expected. When your own reels are ready:

     1. set DEMO = false   (or just overwrite video/poster below)
     2. drop your files in /videos and /assets
     3. use paths like  video:'videos/reel-01.mp4'

   Setting DEMO = false brings back the empty placeholder cards.
   ===================================================================== */

const DEMO = true;

const CATS = {
  all:    'All',
  reels:  'Reels',
  ads:    'Ads',
  music:  'Music Videos',
  film:   'Short Films',
  motion: 'Motion'
};

const FEATURED = 6;

/* --- demo clips (delete this whole block once you add your own) ------ */
const S = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const demo = name => DEMO ? S + name + '.mp4' : '';
const demoPoster = name => DEMO ? S + 'images/' + name + '.jpg' : '';
/* -------------------------------------------------------------------- */

const WORKS = [
  { id:'01', cat:'reels',  title:'Daily Reels',       client:'Social content',  year:'2026', dur:'00:58', tone:'a', video:demo('ForBiggerBlazes'),              poster:demoPoster('ForBiggerBlazes') },
  { id:'02', cat:'ads',    title:'Product Campaign',  client:'Advertisement',   year:'2026', dur:'01:24', tone:'b', video:demo('ForBiggerEscapes'),             poster:demoPoster('ForBiggerEscapes') },
  { id:'03', cat:'music',  title:'Night Rhythm',      client:'Music video',     year:'2026', dur:'03:47', tone:'c', video:demo('ForBiggerFun'),                 poster:demoPoster('ForBiggerFun') },
  { id:'04', cat:'film',   title:'Echoes',            client:'Short film',      year:'2025', dur:'08:12', tone:'d', video:demo('ForBiggerJoyrides'),            poster:demoPoster('ForBiggerJoyrides') },
  { id:'05', cat:'motion', title:'Logo Reveal',       client:'Motion design',   year:'2026', dur:'00:12', tone:'e', video:demo('ForBiggerMeltdowns'),           poster:demoPoster('ForBiggerMeltdowns') },
  { id:'06', cat:'reels',  title:'Street Stories',    client:'Social content',  year:'2025', dur:'00:45', tone:'f', video:demo('SubaruOutbackOnStreetAndDirt'), poster:demoPoster('SubaruOutbackOnStreetAndDirt') },
  { id:'07', cat:'ads',    title:'Summer Drop',       client:'Advertisement',   year:'2025', dur:'00:30', tone:'a', video:demo('VolkswagenGTIReview'),          poster:demoPoster('VolkswagenGTIReview') },
  { id:'08', cat:'music',  title:'Golden Hour',       client:'Music video',     year:'2025', dur:'03:05', tone:'d', video:demo('WeAreGoingOnBullrun'),          poster:demoPoster('WeAreGoingOnBullrun') },
  { id:'09', cat:'reels',  title:'Behind The Scenes', client:'Social content',  year:'2025', dur:'01:02', tone:'b', video:demo('WhatCarCanYouGetForAGrand'),    poster:demoPoster('WhatCarCanYouGetForAGrand') },
  { id:'10', cat:'motion', title:'Kinetic Type',      client:'Motion design',   year:'2026', dur:'00:20', tone:'c', video:demo('ForBiggerBlazes'),              poster:demoPoster('ForBiggerBlazes') },
  { id:'11', cat:'film',   title:'Last Signal',       client:'Short film',      year:'2024', dur:'05:40', tone:'f', video:demo('ForBiggerJoyrides'),            poster:demoPoster('ForBiggerJoyrides') },
  { id:'12', cat:'ads',    title:'Brand Story',       client:'Advertisement',   year:'2024', dur:'01:00', tone:'e', video:demo('ForBiggerMeltdowns'),           poster:demoPoster('ForBiggerMeltdowns') }
];
