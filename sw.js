// Офлайн-режим «Ихсана». Кэширует только файлы приложения; данные (localStorage, IndexedDB) не трогает.
// Стратегия: сначала из кэша (открывается без сети), в фоне тихо скачивает свежую версию —
// после правок на сайте новая версия появится со второго открытия. VERSION меняй при каждой правке.
const VERSION = 'v55';
const CACHE = 'chetyre-sily-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './icons/ic1.png', './icons/ic2.png', './icons/ic3.png', './icons/ic4.png', './icons/ic5.png', './themes/warm.webp', './themes/journal.webp', './themes/twilight.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('chetyre-sily-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, {ignoreSearch: true}) || (req.mode === 'navigate' ? await c.match('./index.html') : null);
    const fresh = fetch(req).then(r => { if (r && r.ok && r.type === 'basic') c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('РќРµС‚ СЃРµС‚Рё', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
  }));
});
