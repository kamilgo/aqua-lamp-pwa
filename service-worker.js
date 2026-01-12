// sw.js
const CACHE_NAME = 'device-config-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.indexOf('/ping') !== -1) {
        console.log('skip /ping');
        return false;
    }
    if (event.request.url.indexOf('/store') !== -1) {
        console.log('skip /store');
        return false;
    }

    if (event.request.url.indexOf('/channels') !== -1) {
        console.log('skip /channels/*');
        return false;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
