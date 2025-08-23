// ===== SERVICE WORKER FOR AJAS SERVICES =====
// Basic PWA functionality with caching

const CACHE_NAME = 'ajas-services-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/admin-dashboard.html',
  '/scheduler.html',
  '/enquiry.html',
  '/about.html',
  '/objective.html',
  '/services.html',
  '/contact.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/js/login.js',
  '/js/audits.js',
  '/js/dashboard.js',
  '/js/enquiry.js',
  '/assets/img/ajas-logo.png',
  '/favicon.ico',
  '/favicon.svg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 