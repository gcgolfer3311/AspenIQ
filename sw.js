// AspenIQ service worker — caches the app shell so the app loads with no
// connection (agents working from cars / facility lobbies with weak signal).
// All client/lead data lives in localStorage, which persists offline already;
// this worker's only job is making sure the page itself is available offline.

var CACHE_NAME = 'aspeniq-shell-v4';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {
        // Best-effort: if one asset fails (e.g. offline first install), don't block install
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Navigation requests (loading the app shell itself) go network-first:
  // always fetch the latest index.html when online, so a new deploy is
  // visible on next load without needing to bump CACHE_NAME every time.
  // Falls back to the last cached copy only when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (networkRes) {
          if (networkRes && networkRes.status === 200) {
            var resClone = networkRes.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(req, resClone); });
          }
          return networkRes;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (cached) {
            return cached || caches.match(req);
          });
        })
    );
    return;
  }

  // Everything else (icons, manifest, etc.) stays cache-first — these
  // change rarely and cache-first keeps the app fast and fully offline-capable.
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req)
        .then(function (networkRes) {
          if (networkRes && networkRes.status === 200) {
            var resClone = networkRes.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(function () {
          return undefined;
        });
    })
  );
});

// Tapping a due-reminder notification focuses an open AspenIQ tab, or opens one.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if ('focus' in clients[i]) return clients[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
