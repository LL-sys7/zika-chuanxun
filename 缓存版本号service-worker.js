// 缓存版本号
var CACHE_NAME = 'zika-msg-v1';

// 需要缓存的资源
var urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// 安装 Service Worker，缓存资源
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// 拦截请求，优先从缓存读取
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 后台推送通知（备用）
self.addEventListener('push', function(event) {
    var data = event.data ? event.data.json() : {};
    var title = data.title || '💬 字卡传讯';
    var options = {
        body: data.body || '你有一条新消息',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y=".9em" font-size="90"%3E🌙%3C/text%3E%3C/svg%3E',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            url: data.url || '/'
        }
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 点击通知打开页面
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
