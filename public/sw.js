/* public/sw.js */
/* Versión de caché: subila para invalidar */
const CACHE_NAME = "gascalc-v1";
const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

/* Estrategias:
   - Navegaciones: network-first -> offline fallback
   - Estáticos: stale-while-revalidate
*/
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegaciones (document)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/offline")))
    );
    return;
  }

  // Otros (CSS/JS/imágenes) -> SWR
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
