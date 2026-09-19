import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import IntegrationSettings from '@/models/IntegrationSettings';

// Helper to initialize firebase admin
const initAdmin = (serviceAccountJson: string) => {
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Failed to parse Service Account JSON:", error);
    return null;
  }
};

export const fcmService = {
  sendAdminNotification: async (title: string, body: string, url: string = '/admin/orders', type: string = 'other') => {
    try {
      const settings = await IntegrationSettings.findOne();
      
      if (!settings || !settings.pushNotification || !settings.pushNotification.enabled) {
        return { success: false, reason: "Push notifications disabled" };
      }

      if (!settings.pushNotification.serviceAccountJson) {
        return { success: false, reason: "Service Account JSON not configured" };
      }

      const tokens = settings.pushNotification.adminFcmTokens;
      if (!tokens || tokens.length === 0) {
        return { success: false, reason: "No admin tokens registered" };
      }

      const app = initAdmin(settings.pushNotification.serviceAccountJson);
      if (!app) {
        return { success: false, reason: "Failed to initialize Firebase Admin" };
      }

      const message = {
        notification: {
          title,
          body,
        },
        webpush: {
          fcmOptions: {
            link: url
          }
        },
        data: {
          type,
          url
        },
        tokens: tokens,
      };

      const response = await getMessaging(app).sendEachForMulticast(message);
      
      // We can also clean up invalid tokens if response.failureCount > 0
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
          await IntegrationSettings.updateOne(
            {},
            { $pullAll: { "pushNotification.adminFcmTokens": failedTokens } }
          );
        }
      }

      return { success: true, successCount: response.successCount };
    } catch (error: any) {
      console.error("FCM Send Error:", error);
      return { success: false, error: error.message };
    }
  }
};
