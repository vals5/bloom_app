/* Service worker de Bloom.
   Hace UNA cosa a propósito: si no hay internet al abrir una página, muestra /offline.html
   en vez del error del navegador. No guarda publicaciones ni datos de cuentas (siempre frescos). */
const CACHE = "bloom-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return; // imágenes, API y scripts van directo a la red
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
