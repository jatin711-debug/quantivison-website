/**
 * Service Worker for Quantivision
 * Provides offline functionality and performance optimization
 */

const CACHE_NAME = 'quantivision-v1.0.0';
const STATIC_CACHE = 'quantivision-static-v1.0.0';
const DYNAMIC_CACHE = 'quantivision-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/scrollbar.css',
    '/js/main.js',
    '/assets/logo.svg',
    '/site.webmanifest',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('[SW] Failed to cache static files:', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    
    // Claim clients immediately
    self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('[SW] Serving from cache:', request.url);
                    return cachedResponse;
                }
                
                console.log('[SW] Fetching from network:', request.url);
                
                return fetch(request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response
                        const responseToCache = networkResponse.clone();
                        
                        // Determine which cache to use
                        const cacheName = STATIC_FILES.some(file => request.url.includes(file)) 
                            ? STATIC_CACHE 
                            : DYNAMIC_CACHE;
                        
                        // Cache the response
                        caches.open(cacheName)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[SW] Fetch failed:', error);
                        
                        // Return offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        
                        // Return offline fallback for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('[SW] Background sync triggered');
        event.waitUntil(
            // Handle offline actions here
            Promise.resolve()
        );
    }
});

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Quantivision',
        icon: '/assets/logo.svg',
        badge: '/assets/logo.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/logo.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/logo.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Quantivision', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Performance monitoring
self.addEventListener('fetch', event => {
    const startTime = performance.now();
    
    event.respondWith(
        handleRequest(event.request)
            .then(response => {
                const endTime = performance.now();
                console.log(`[SW] Request to ${event.request.url} took ${endTime - startTime}ms`);
                return response;
            })
            .catch(error => {
                const endTime = performance.now();
                console.error(`[SW] Failed request to ${event.request.url} took ${endTime - startTime}ms:`, error);
                throw error;
            })
    );
});

async function handleRequest(request) {
    // Implement request handling logic
    return fetch(request);
}

// Cache management utilities
function clearOldCaches() {
    return caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (!cacheName.includes('quantivision')) {
                    return caches.delete(cacheName);
                }
            })
        );
    });
}

function getCacheSize() {
    return caches.open(STATIC_CACHE).then(cache => {
        return cache.keys().then(keys => {
            return keys.length;
        });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        STATIC_CACHE,
        DYNAMIC_CACHE,
        clearOldCaches,
        getCacheSize
    };
}