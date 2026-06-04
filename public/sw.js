// FitWork Service Worker
// Menangani notifikasi "Ayo Fokus" yang muncul DI LUAR website (level OS),
// lengkap dengan tombol aksi "Istirahat sebentar" / "Lanjut fokus".

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  const action = event.action; // "break" | "focus" | "" (klik badan notif)
  event.notification.close();

  // "Lanjut fokus" → biarkan pengguna tetap di aplikasinya, jangan ganggu.
  if (action === "focus") return;

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      let client = all.find((c) => "focus" in c) || null;
      if (client) await client.focus();
      else client = await self.clients.openWindow("/");
      // Hanya tombol "Istirahat" yang membuka modal istirahat di app.
      if (action === "break" && client) client.postMessage({ type: "focus-action", action: "break" });
    })()
  );
});
