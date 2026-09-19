import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initFirebase = (firebaseConfig: any) => {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    return { app: null, messaging: null };
  }

  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    // Only initialize on the client side and if the browser supports it
    if ("serviceWorker" in navigator) {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.error("Failed to initialize Firebase Messaging:", error);
      }
    }
  }

  return { app, messaging };
};

export { getToken, onMessage };
