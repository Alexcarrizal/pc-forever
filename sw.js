// A simple, no-op service worker that's enough to make the app installable.

self.addEventListener('install', (event) => {
  // console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  // console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // We are not caching anything in this simple version.
  // The fetch event is just intercepted.
});
