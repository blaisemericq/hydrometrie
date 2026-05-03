const CACHE = 'hydro-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch : network-only pour l'API Hub'Eau (jamais de cache), cache-first pour les assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API Hub'Eau : toujours réseau, pas de mise en cache
  // (chaque requête doit refléter la période choisie par l'utilisateur)
  if (url.hostname === 'hubeau.eaufrance.fr') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Autres ressources : cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
