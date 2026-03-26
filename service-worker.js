const CACHE_NAME = "carebridge-v1";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-512.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Try network first (fresh content)
  try {
    const networkResponse = await fetch(request);

    // Save with timestamp
    const responseClone = networkResponse.clone();
    const headers = new Headers(responseClone.headers);
    headers.append("sw-fetched-at", Date.now());

    const newResponse = new Response(await responseClone.blob(), {
      status: responseClone.status,
      statusText: responseClone.statusText,
      headers
    });

    cache.put(request, newResponse.clone());

    return networkResponse;
  } catch (err) {
    // If offline, use cache
    if (cachedResponse) {
      const fetchedAt = cachedResponse.headers.get("sw-fetched-at");

      if (fetchedAt) {
        const age = Date.now() - parseInt(fetchedAt);

        if (age > TTL) {
          // Cache expired, but still return it as fallback
          return cachedResponse;
        }
      }

      return cachedResponse;
    }

    // fallback
    return new Response("Offline", { status: 503 });
  }
}