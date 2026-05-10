/* PickFood Service Worker — 버전 캐시 전략
   배포 시 CACHE_VERSION 만 올리면 activate 단계에서 구버전 캐시 자동 삭제.
   푸시는 비활성화 (카카오 브랜드 메시지 전환 예정) — early return 으로 차단. */

const CACHE_VERSION = 'pickfood-v1.0.0';
const STATIC_CACHE = CACHE_VERSION + '-static';
const API_CACHE    = CACHE_VERSION + '-api';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/menu-db.json',
  '/fruit-db.js',
  '/fruit-card.js'
];

const SW_PUSH_ENABLED = false;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => {
              console.log('[SW] 구버전 캐시 삭제:', k);
              return caches.delete(k);
            })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // API 요청: 네트워크 우선, 실패 시 캐시 폴백
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // 정적 자산: 캐시 우선, 없으면 네트워크 후 캐시
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(e.request, clone)).catch(() => {});
        }
        return res;
      });
    })
  );
});

// 푸시 차단 — 핸들러는 등록하되 즉시 return
self.addEventListener('push', e => { if (!SW_PUSH_ENABLED) return; });
self.addEventListener('notificationclick', e => { if (!SW_PUSH_ENABLED) return; });
self.addEventListener('pushsubscriptionchange', e => { if (!SW_PUSH_ENABLED) return; });
