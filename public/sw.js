self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(
      data.title || "ShortBizAI",
      {
        body: data.body || "Tienes una nueva notificación.",
        icon: data.icon || "/logo-foodshortai.png",
        badge: data.icon || "/logo-foodshortai.png",
      }
    )
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("https://www.shortbizai.com")
  );
});