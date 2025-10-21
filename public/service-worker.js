self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ATLAAS GO';
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-512x512.png',
    badge: '/icon-512x512.png',
    data: data.url || '/',
    tag: data.tag || 'default',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
