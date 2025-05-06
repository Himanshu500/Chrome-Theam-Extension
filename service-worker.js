// Service Worker for HackerSpace Chrome Extension
const CACHE_NAME = 'hackerspace-v1';
// Use relative paths from the service worker root
const ASSETS_TO_CACHE = [
  'newtab.html',
  'styles.css',
  'js/background.js',
  'js/particles.js',
  'js/shortcuts.js',
  'js/clock.js',
  'js/tasks.js',
  'js/settings.js',
  'js/main.js',
  'assets/icon16.png',
  'assets/icon48.png',
  'assets/icon128.png'
  // Add other essential assets like fonts if needed and cacheable
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache', CACHE_NAME);
        // Add assets individually for robustness
        const cachePromises = ASSETS_TO_CACHE.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Failed to cache ${asset}:`, err);
            // Optionally, you could track failures here
          });
        });
        // Wait for all individual add operations
        return Promise.all(cachePromises);
      })
      .then(() => {
          console.log('Assets caching attempt complete.');
          return self.skipWaiting();
      })
      .catch(error => {
          // This catch might now be less likely if individual adds handle errors,
          // but keep it for overall open/wait failures.
          console.error('Cache installation process failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('hackerspace-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Only handle http and https requests, ignore others (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
      return; // Let the browser handle non-http(s) requests normally
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request since it can only be used once
        const fetchRequest = event.request.clone();
        
        // Fall back to network
        return fetch(fetchRequest).then(response => {
          // Check if response is valid and cacheable (basic type ensures same-origin or CORS)
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; // Don't cache invalid responses
          }
          
          // Clone the response since it can only be used once
          const responseToCache = response.clone();
          
          // Cache the fetched response
          caches.open(CACHE_NAME)
            .then(cache => {
              // Check scheme again just to be safe before putting
              if (event.request.url.startsWith('http')) {
                  cache.put(event.request, responseToCache);
              }
            });
          
          return response;
        });
      })
  );
}); 