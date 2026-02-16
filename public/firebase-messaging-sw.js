// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyDeE5DWzl53vJy5Ri117rN6d_fCLD62Z9w",
    authDomain: "connectly-7ut07.firebaseapp.com",
    projectId: "connectly-7ut07",
    storageBucket: "connectly-7ut07.firebasestorage.app",
    messagingSenderId: "848634889696",
    appId: "1:848634889696:web:758463e66ef61e6e695785"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'pingme-notification',
        requireInteraction: false,
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    // Open the app and navigate to the chat
    const chatId = event.notification.data?.chatId;
    const urlToOpen = chatId
        ? `${self.location.origin}/?chat=${chatId}`
        : self.location.origin;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
