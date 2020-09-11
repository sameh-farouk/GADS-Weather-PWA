const CACHE_NAME = 'cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1'
const resourcesToPrecache = [
  '/',
  'index.html',
  'script.js',
  'install.js',
  'style.css',
  'manifest.json',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Ffavicon.ico?v=1599678840765',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Fpexels-efdal-yildiz-917494-2.jpg?v=1599781185649',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Fquit.svg?v=1599787690847',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Fpwa-512x512.png?v=1599678843012',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Fpwa-192x192.png?v=1599680650105',
  'https://cdn.glitch.com/9e05da28-6193-40b6-80e6-8ef5893889d9%2Fmaskable_icon.png?v=1599781894997',
]

self.addEventListener('install', event => {
  console.log('in service worker install event handler')
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      return cache.addAll(resourcesToPrecache);
    
  }));
});

self.addEventListener('activate', event => {
  console.log('in service worker activate event handler')
  event.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
});

self.addEventListener('fetch', event => {
  console.log('in service worker fetch event handler');
  if (event.request.url.includes('api.openweathermap')) {
    console.log('[Service Worker] Fetch (data)', event.request.url);
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            }).catch((err) => {
              // Network request failed, try to get it from the cache..
              return cache.match(event.request);
            });
      }));
  return;
}  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          });
    })
  );
});