const CACHE = 'familien-entdecker-v35';
const FILES = ['./', 'index.html', 'style.css', 'ages.css', 'app.js', 'welt7.js', 'spiele7b.js', 'kids7.js', 'teen17.js', 'fotos.js', 'videos.js', 'manifest.webmanifest', 'icon.svg',
  ...['adler','affe','ameise','baer','biber','biene','bison','bueffel','dachs','delfin','dodo','drache','eichhoernchen','eidechse','einhorn','eisbaer','elch','elefant','ente','esel','eule','faultier','fisch','flamingo','fledermaus','fliege','frosch','fuchs','gans','garnele','giraffe','gorilla','grille','hahn','hai','hamster','hase','hirsch','huhn','hummer','hund','igel','kaefer','kaenguru','kamel','katze','koala','krake','krebs','krokodil','kueken','kugelfisch','kuh','lama','langhals','leopard','loewe','mammut','marienkaefer','maus','nashorn','nilpferd','ochse','orangutan','otter','panda','papagei','pfau','pferd','pinguin','pudel','qualle','raupe','robbe','schaf','schildkroete','schlange','schmetterling','schnecke','schwan','schwein','spinne','stinktier','taube','tiger','tintenfisch','trex','truthahn','vogel','wal','waschbaer','widder','wildschwein','wolf','wurm','zebra','ziege'].map(n => `img/tiere/${n}.png`),
  ...['kuh','hund','katze','schwein','schaf','huhn','ente','pferd','frosch','loewe','elefant'].map(n => `sounds/tiere/${n}.mp3`),
  'img/fahrzeuge/blaulicht.png',
  ...['abschleppwagen','auto','bagger','bergrettung','betonmischer','bus','containerschiff','drehleiter','faehre','fahrrad','feuerloeschboot','feuerwehrauto_alt','flughafenfeuerwehr','flugzeug','gelaendewagen','heissluftballon','hubschrauber','kanu','kehrmaschine','kleinbus','kleinflugzeug','kreuzfahrtschiff','lastwagen','laufrad','loeschfahrzeug','loeschflugzeug','motorboot','motorrad','motorroller','mountainbike','muellauto','notarzt','obus','pannenhilfe','pickup','polizeiboot','polizeibus','polizeihubschrauber','polizeimotorrad','polizeipferd','quad','radfahrer','rakete','raumstation','rennwagen','rettungshubschrauber','rettungswagen','rikscha','rollschuh','ruestwagen','sattelzug','seenotrettungskreuzer','segelboot','segelflugzeug','skateboard','streifenwagen','tankloeschfahrzeug','taxi','thw_gkw','thw_lkw','thw_mtw','thw_radlader','traktor','tretroller','winterdienst'].map(n => `img/fahrzeuge/foto/${n}.jpg`)];
// Beim Installieren immer frisch vom Server holen (nicht aus dem Browser-Zwischenspeicher)
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE)
  .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(async keys => {
  const old = keys.filter(k => k !== CACHE);
  await Promise.all(old.map(k => caches.delete(k)));
  await self.clients.claim();
  // Seiten mit sehr alter App-Version (vor v32) laden sich nicht selbst neu → hier einmal neu öffnen
  const veryOld = old.some(k => { const m = /-v(\d+)$/.exec(k); return m && +m[1] < 32; });
  if (veryOld) (await self.clients.matchAll({ type: 'window' })).forEach(c => c.navigate(c.url).catch(() => {}));
})));
// Programm-Dateien (Seite, JS, CSS): zuerst aus dem Netz – so kommt jede neue Version sofort an.
// Ohne Internet: aus dem Speicher. Bilder, Töne, Videos: zuerst aus dem Speicher (schnell).
const isCode = url => url.origin === location.origin && (/\.(js|css|html|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/'));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (isCode(url)) {
    // eigene Anfrage nur mit der Adresse (Firefox mag keine Optionen an Seitenaufrufen)
    e.respondWith(fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
