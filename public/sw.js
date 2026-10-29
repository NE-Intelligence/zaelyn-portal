/*
 * El service worker de Zaelyn (fase 2 · Zaelyn DECISIONS #229).
 *
 * Solo hace dos cosas, a propósito:
 *  1. Recibir los avisos y enseñarlos. Si el portal YA está a la vista, no
 *     enseña nada: la respuesta ya se está viendo en el chat y una
 *     notificación encima sería ruido.
 *  2. Al tocar el aviso, abrir (o traer al frente) el portal.
 *
 * NO guarda páginas en caché: el portal es estado vivo (un plan de hace diez
 * minutos sin decirlo es peor que una pantalla lenta), y una caché de HTML
 * con datos de alguien en un teléfono compartido es justo lo que no queremos.
 */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let d = { titulo: 'Zaelyn', texto: '', url: '/app' }
  try { d = { ...d, ...e.data.json() } } catch { /* aviso sin cuerpo: se enseña el título */ }
  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    if (ventanas.some((v) => v.visibilityState === 'visible' && v.focused)) return
    await self.registration.showNotification(d.titulo, {
      body: d.texto, icon: '/icono-192.png', badge: '/icono-192.png',
      data: { url: d.url }, tag: 'zaelyn', renotify: true,
    })
  })())
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || '/app', self.location.origin).href
  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const propia = ventanas.find((v) => new URL(v.url).origin === self.location.origin)
    if (propia) { await propia.focus(); return propia.navigate(url) }
    return self.clients.openWindow(url)
  })())
})
