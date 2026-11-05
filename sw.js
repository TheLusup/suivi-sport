// Garde une copie de la page (et de Chart.js, des polices) pour l'ouvrir sans réseau. Réseau d'abord, copie en secours.
// Les appels à api.github.com ne passent jamais par ce cache.
// La page elle-même est toujours revérifiée auprès du serveur (cache: 'no-cache') : GitHub Pages autorise 10 min de cache
// navigateur, qui faisaient voir l'ancienne version juste après une publication.
const CACHE = 'suivi-sport-v5';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname === 'api.github.com') return;
  e.respondWith(
    (url.origin === location.origin ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin', redirect: e.request.mode === 'navigate' ? 'manual' : 'follow' }) : fetch(e.request)).then(r => {
      if (r.ok || r.type === 'opaque') { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then(r => r || Response.error()))
  );
});
