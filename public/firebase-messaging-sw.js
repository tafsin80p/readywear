importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Fetch the configuration dynamically from the backend before initializing
fetch('/api/settings/firebase')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.config && data.config.apiKey) {
      // Initialize Firebase with dynamic config
      firebase.initializeApp(data.config);
      const messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        console.log(
          '[firebase-messaging-sw.js] Received background message ',
          payload
        );
        // Customize notification here
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body,
          icon: '/favicon.ico' // Update with your logo path
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    } else {
      console.log("[firebase-messaging-sw.js] Firebase Push Notifications are disabled or not configured.");
    }
  })
  .catch(err => {
    console.error("[firebase-messaging-sw.js] Failed to fetch Firebase config:", err);
  });
