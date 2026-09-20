import { getIntegrationSettings } from "./telegramService";

export const googleSheetService = {
  async sendOrderToSheet(order: any) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.googleSheet?.enabled || !settings.googleSheet?.webhookUrl) {
        return { success: false, reason: "disabled_or_missing_url" };
      }

      // Format data for Google Sheet
      const payload = {
        createdAt: order.createdAt 
          ? new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) 
          : new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
        orderId: order.orderId,
        customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName || ""}`.trim(),
        customerPhone: order.customerInfo.phone,
        customerAddress: `${order.customerInfo.address}, ${order.customerInfo.area}`,
        products: order.items.map((item: any) => `${item.title || item.name} (x${item.quantity})`).join(", "),
        productSizes: order.items.map((item: any) => item.size).filter(Boolean).join(", ") || "-",
        productColors: order.items.map((item: any) => item.color).filter(Boolean).join(", ") || "-",
        subtotal: order.pricing.subtotal,
        shipping: order.pricing.deliveryCharge,
        total: order.pricing.total,
        paymentMethod: order.paymentMethod,
        status: order.verificationStatus || order.status
      };

      const response = await fetch(settings.googleSheet.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Since Apps Script webhooks might return redirects or different content types, we just check ok
      if (!response.ok) {
        throw new Error(`Google Apps Script returned status ${response.status}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error("[GoogleSheet] Error syncing order:", error);
      return { success: false, error: error.message };
    }
  }
};
