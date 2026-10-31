// Service worker minimalista: torna o app instalável e mantém o shell
// em cache. Dados de reservas NUNCA são cacheados (sempre rede).
const CACHE = 'hotel-engine-v1';
const SHELL = ['/', '/admin', '/login', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API e Supabase: sempre rede, nunca cache (dados sensíveis/dinâmicos)
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) return;
  if (url.pathname.startsWith('/manifest')) return; // manifests: sempre rede
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
  );
});
