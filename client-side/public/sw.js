/* OASIS simple offline service worker */
const CACHE_NAME = 'oasis-cache-v2';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      OFFLINE_URL,
      '/manifest.webmanifest',
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigation requests: try network with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        // Try network first
        return fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => {
            // If network fails, use cache
            if (cachedResponse) {
              console.log('📦 Serving from cache (offline):', req.url);
              return cachedResponse;
            }
            // No cache, show offline page
            console.log('❌ Not cached, showing offline page:', req.url);
            return caches.match(OFFLINE_URL);
          });
      })
    );
    return;
  }

  // Same-origin requests: Cache-first when offline, network-first when online
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        // If online, try network first
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => {
            console.log('📦 Network failed, using cache:', req.url);
            return cached;
          });
        
        // Return cached if available, otherwise wait for network
        return cached || networkFetch;
      })
    );
  }
});
