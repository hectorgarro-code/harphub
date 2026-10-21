const CACHE_NAME = 'harphub-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only intercept GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Pass-through API requests, soundfonts, and external YouTube requests directly to network
    const url = new URL(request.url);
    if (
        url.pathname.includes('/backend/') || 
        url.pathname.endsWith('.php') || 
        url.pathname.endsWith('.sf2') ||
        url.hostname.includes('youtube') ||
        url.hostname.includes('googleapis')
    ) {
        return;
    }

    // Network-first strategy with cache fallback
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});
