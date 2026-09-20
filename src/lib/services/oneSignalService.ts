import IntegrationSettings from '@/models/IntegrationSettings';

export const oneSignalService = {
  sendAdminNotification: async (title: string, body: string, url: string = '/admin/orders', type: string = 'order') => {
    try {
      const settings = await IntegrationSettings.findOne();
      const storeSettings = await (await import('@/models/StoreSettings')).default.findOne();
      const iconUrl = storeSettings?.favicon || storeSettings?.headerLogo || "";
      
      if (!settings || !settings.pushNotification || !settings.pushNotification.enabled) {
        return { success: false, reason: "Push notifications disabled" };
      }

      if (!settings.pushNotification.appId || !settings.pushNotification.restApiKey) {
        return { success: false, reason: "OneSignal config is missing" };
      }

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${settings.pushNotification.restApiKey}`
        },
        body: JSON.stringify({
          app_id: settings.pushNotification.appId,
          // Target admins via tag
          filters: [
            { field: "tag", key: "role", relation: "=", value: "admin" }
          ],
          contents: { en: body },
          headings: { en: title },
          url: url,
          data: { type, url },
          chrome_web_icon: iconUrl,
          firefox_icon: iconUrl,
          safari_icon: iconUrl
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("OneSignal API Error:", responseData);
        return { success: false, reason: responseData.errors?.[0] || "OneSignal API Error" };
      }

      return { success: true, messageId: responseData.id };
    } catch (error: any) {
      console.error("OneSignal Send Error:", error);
      return { success: false, reason: error.message };
    }
  }
};
