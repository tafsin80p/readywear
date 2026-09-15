import { getIntegrationSettings } from "./telegramService"; // reuse the helper
import crypto from "crypto";

export const metaService = {
  async sendPurchaseEvent(order: any) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.meta.enabled || !settings.meta.pixelId || !settings.meta.accessToken) {
        return { success: false, reason: "disabled" };
      }

      // Deduplication check - caller should also check, but we double-check here
      if (order.metaEventStatus === "sent") {
        return { success: false, reason: "already_sent" };
      }

      const { pixelId, accessToken, testEventCode, currency } = settings.meta;

      const eventId = `purchase_${order.orderId}`;
      
      const contentIds = order.items.map((item: any) => item.productId || item.id);
      const numItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const contentName = order.items.map((item: any) => item.name).join(", ");
      const contents = order.items.map((item: any) => ({
        id: item.productId || item.id,
        quantity: item.quantity,
        item_price: item.price
      }));
      
      // Extract optional attributes from first item if present
      const firstItemAttrs = order.items[0]?.attributes || {};
      const selectedStyle = firstItemAttrs.style || firstItemAttrs.color || "";
      const blouseSize = firstItemAttrs.blouse_size || firstItemAttrs.size || "";
      const sareeLength = firstItemAttrs.saree_length || firstItemAttrs.length || "";

      // Hash user data if present (SHA256 required by Meta)
      const hash = (str: string) => crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
      
      const userData: any = {};
      if (order.customerInfo.phone) {
        // Basic phone number cleaning (Meta expects country code, so assuming +880 or similar might be needed, but we do basic clean)
        const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
        userData.ph = [hash(cleanPhone)];
      }
      if (order.customerInfo.firstName) {
        userData.fn = [hash(order.customerInfo.firstName)];
      }
      if (order.customerInfo.lastName) {
        userData.ln = [hash(order.customerInfo.lastName)];
      }

      const eventPayload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: "website",
            event_source_url: process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com",
            user_data: userData,
            custom_data: {
              value: order.pricing.total,
              currency: currency || "BDT",
              content_type: "product",
              content_ids: contentIds,
              content_name: contentName,
              contents: contents,
              num_items: numItems,
              order_id: order.orderId,
              order_status: "confirmed",
              payment_type: order.paymentMethod,
              shipping: order.pricing.deliveryCharge,
              selected_style: selectedStyle,
              blouse_size: blouseSize,
              saree_length: sareeLength
            }
          }
        ]
      };

      if (testEventCode) {
        (eventPayload as any).test_event_code = testEventCode;
      }

      const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload)
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Meta API Error");
      }

      return {
        success: true,
        eventId,
        response: data
      };
    } catch (error: any) {
      console.error("[Meta CAPI] Error sending Purchase event:", error);
      return { success: false, error: error.message };
    }
  },

  async sendLeadEvent(order: any) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.meta.enabled || !settings.meta.pixelId || !settings.meta.accessToken) {
        return { success: false, reason: "disabled" };
      }

      if (order.metaLeadEventStatus === "sent") {
        return { success: false, reason: "already_sent" };
      }

      const { pixelId, accessToken, testEventCode, currency } = settings.meta;
      const eventId = `lead_${order.orderId}`;
      
      const contentIds = order.items.map((item: any) => item.productId || item.id);
      const numItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const contentName = order.items.map((item: any) => item.name).join(", ");
      const contents = order.items.map((item: any) => ({
        id: item.productId || item.id,
        quantity: item.quantity,
        item_price: item.price
      }));
      
      const firstItemAttrs = order.items[0]?.attributes || {};
      const selectedStyle = firstItemAttrs.style || firstItemAttrs.color || "";
      const blouseSize = firstItemAttrs.blouse_size || firstItemAttrs.size || "";
      const sareeLength = firstItemAttrs.saree_length || firstItemAttrs.length || "";

      const hash = (str: string) => crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
      
      const userData: any = {};
      if (order.customerInfo.phone) {
        const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
        userData.ph = [hash(cleanPhone)];
      }
      if (order.customerInfo.firstName) {
        userData.fn = [hash(order.customerInfo.firstName)];
      }
      if (order.customerInfo.lastName) {
        userData.ln = [hash(order.customerInfo.lastName)];
      }

      const eventPayload = {
        data: [
          {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: "website",
            event_source_url: process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com",
            user_data: userData,
            custom_data: {
              value: order.pricing.total,
              currency: currency || "BDT",
              content_type: "product",
              content_ids: contentIds,
              content_name: contentName,
              contents: contents,
              num_items: numItems,
              order_id: order.orderId,
              order_status: "real",
              payment_type: order.paymentMethod,
              shipping: order.pricing.deliveryCharge,
              selected_style: selectedStyle,
              blouse_size: blouseSize,
              saree_length: sareeLength
            }
          }
        ]
      };

      if (testEventCode) {
        (eventPayload as any).test_event_code = testEventCode;
      }

      const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload)
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Meta API Error");
      }

      return {
        success: true,
        eventId,
        response: data
      };
    } catch (error: any) {
      console.error("[Meta CAPI] Error sending Lead event:", error);
      return { success: false, error: error.message };
    }
  }
};
