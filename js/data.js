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
   ===================================================================== */

const CATS = {
  all:    'All',
  reels:  'Reels',
  ads:    'Ads',
  music:  'Music Videos',
  film:   'Short Films',
  motion: 'Motion'
};

const FEATURED = 6;

const WORKS = [
  { id:'01', cat:'reels',  title:'Daily Reels',       client:'Social content',  year:'2026', dur:'00:58', tone:'a', video:'', poster:'' },
  { id:'02', cat:'ads',    title:'Product Campaign',  client:'Advertisement',   year:'2026', dur:'01:24', tone:'b', video:'', poster:'' },
  { id:'03', cat:'music',  title:'Night Rhythm',      client:'Music video',     year:'2026', dur:'03:47', tone:'c', video:'', poster:'' },
  { id:'04', cat:'film',   title:'Echoes',            client:'Short film',      year:'2025', dur:'08:12', tone:'d', video:'', poster:'' },
  { id:'05', cat:'motion', title:'Logo Reveal',       client:'Motion design',   year:'2026', dur:'00:12', tone:'e', video:'', poster:'' },
  { id:'06', cat:'reels',  title:'Street Stories',    client:'Social content',  year:'2025', dur:'00:45', tone:'f', video:'', poster:'' },
  { id:'07', cat:'ads',    title:'Summer Drop',       client:'Advertisement',   year:'2025', dur:'00:30', tone:'a', video:'', poster:'' },
  { id:'08', cat:'music',  title:'Golden Hour',       client:'Music video',     year:'2025', dur:'03:05', tone:'d', video:'', poster:'' },
  { id:'09', cat:'reels',  title:'Behind The Scenes', client:'Social content',  year:'2025', dur:'01:02', tone:'b', video:'', poster:'' },
  { id:'10', cat:'motion', title:'Kinetic Type',      client:'Motion design',   year:'2026', dur:'00:20', tone:'c', video:'', poster:'' },
  { id:'11', cat:'film',   title:'Last Signal',       client:'Short film',      year:'2024', dur:'05:40', tone:'f', video:'', poster:'' },
  { id:'12', cat:'ads',    title:'Brand Story',       client:'Advertisement',   year:'2024', dur:'01:00', tone:'e', video:'', poster:'' }
];
