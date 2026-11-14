// РћС„Р»Р°Р№РЅ-СЂРµР¶РёРј В«Р§РµС‚С‹СЂС‘С… СЃРёР»В». РљСЌС€РёСЂСѓРµС‚ С‚РѕР»СЊРєРѕ С„Р°Р№Р»С‹ РїСЂРёР»РѕР¶РµРЅРёСЏ; РґР°РЅРЅС‹Рµ (localStorage, IndexedDB) РЅРµ С‚СЂРѕРіР°РµС‚.
// РЎС‚СЂР°С‚РµРіРёСЏ: СЃРЅР°С‡Р°Р»Р° РёР· РєСЌС€Р° (РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ Р±РµР· СЃРµС‚Рё), РІ С„РѕРЅРµ С‚РёС…Рѕ СЃРєР°С‡РёРІР°РµС‚ СЃРІРµР¶СѓСЋ РІРµСЂСЃРёСЋ вЂ”
// РїРѕСЃР»Рµ РїСЂР°РІРѕРє РЅР° СЃР°Р№С‚Рµ РЅРѕРІР°СЏ РІРµСЂСЃРёСЏ РїРѕСЏРІРёС‚СЃСЏ СЃРѕ РІС‚РѕСЂРѕРіРѕ РѕС‚РєСЂС‹С‚РёСЏ. VERSION РјРµРЅСЏР№ РїСЂРё СЃРјРµРЅРµ СЃРїРёСЃРєР° С„Р°Р№Р»РѕРІ.
const VERSION = 'v26';
const CACHE = 'chetyre-sily-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

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
