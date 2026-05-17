self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'Campus Life reminder';
  const options = {
    body: payload.body || 'A reminder is due now.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: payload.url || '/events'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/events', self.location.origin).href;

  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of windowClients) {
      if (client.url === targetUrl && 'focus' in client) {
        return client.focus();
      }
    }

    return clients.openWindow(targetUrl);
  })());
});