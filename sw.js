/* PickFood Service Worker — 웹 푸시 비활성화 (카카오 브랜드 메시지 전환 예정).
   범위는 sw.js 가 위치한 도메인 루트(/) 전체. cache-control 은 Express 정적 서빙에 위임.
   복구: SW_PUSH_ENABLED 를 true 로 바꾸면 모든 핸들러가 즉시 작동.
   기존 코드는 의도적으로 보존 — early return 으로 차단만 한다. */

const SW_PUSH_ENABLED = false;

self.addEventListener('push', e => {
  if (!SW_PUSH_ENABLED) return;
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch (_) {
    try { data = { body: e.data.text() }; } catch (_) {}
  }
  e.waitUntil(
    self.registration.showNotification(
      data.title || '픽푸드',
      {
        body: data.body || '',
        icon: data.icon || '/icon-192.svg',
        badge: data.badge || '/badge-72.svg',
        tag: data.tag || 'foodpicker',
        requireInteraction: false,
        data: { url: data.url || '/' }
      }
    )
  );
});

self.addEventListener('notificationclick', e => {
  if (!SW_PUSH_ENABLED) return;
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || 'https://pickfood.kr';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const c of windowClients) {
          if (c.url === url && 'focus' in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

// 브라우저가 구독을 자동 갱신할 때 — 새 구독을 서버에 즉시 동기화 (uid 없이도 endpoint 키로 매칭).
self.addEventListener('pushsubscriptionchange', e => {
  if (!SW_PUSH_ENABLED) return;
  if (!e.newSubscription) return;
  e.waitUntil(
    fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: e.newSubscription.toJSON ? e.newSubscription.toJSON() : e.newSubscription })
    }).catch(() => {})
  );
});
