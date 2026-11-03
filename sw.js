const CACHE = 'familien-entdecker-v14';
const FILES = ['./', 'index.html', 'style.css', 'ages.css', 'app.js', 'kids7.js', 'teen17.js', 'manifest.webmanifest', 'icon.svg',
  ...['kuh','hund','katze','schwein','schaf','huhn','ente','pferd','frosch','loewe','biene','elefant','ziege','esel','hase','fuchs','baer','eule','igel','eichhoernchen','hirsch','wolf','maus','vogel','giraffe','zebra','affe','tiger','nilpferd','nashorn','kamel','krokodil','panda','kaenguru','koala','gorilla','papagei','schlange','fisch','delfin','wal','schildkroete','pinguin','krake','krebs','robbe','schmetterling','marienkaefer','schnecke','ameise'].map(n => `img/tiere/${n}.png`),
  ...['kuh','hund','katze','schwein','schaf','huhn','ente','pferd','frosch','loewe','elefant'].map(n => `sounds/tiere/${n}.mp3`)];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
