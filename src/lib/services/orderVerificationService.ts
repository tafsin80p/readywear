import Order from "@/models/Order";
import { telegramService } from "./telegramService";
import { metaService } from "./metaService";

export const orderVerificationService = {
  async confirmOrder(orderId: string, confirmedBy: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.verificationStatus === "confirmed") {
      throw new Error("Order is already confirmed");
    }

    // 1. Change status to confirmed
    order.verificationStatus = "confirmed";
    order.confirmedAt = new Date();
    order.confirmedBy = confirmedBy;
    
    // 2. Trigger Meta Purchase event (deduplication handled inside service and by status)
    if (order.metaEventStatus !== "sent") {
      order.metaEventId = order.metaEventId || `event_${order._id}_${Date.now()}`;
      
      const metaResult = await metaService.sendPurchaseEvent(order);
      
      if (metaResult.success) {
        order.metaEventStatus = "sent";
        order.metaEventSentAt = new Date();
        order.metaEventResponse = metaResult.response;
      } else {
        order.metaEventStatus = "failed";
        order.metaEventError = metaResult.error || metaResult.reason;
      }
    }

    await order.save();

    // 3. Update Telegram message (do this after save so we have the latest meta status)
    if (order.telegramMessageId) {
       await telegramService.updateOrderNotification(order, "confirmed");
    }

    // 4. Sync status update to Google Sheet
    await (await import("./googleSheetService")).googleSheetService.sendOrderToSheet(order);

    return order;
  },

  async markOrderFake(orderId: string, markedBy: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.verificationStatus === "fake" || order.verificationStatus === "cancelled") {
      throw new Error("Order is already marked fake/cancelled");
    }

    // 1. Change status
    order.verificationStatus = "fake";
    order.status = "cancelled"; // Also update main fulfillment status
    order.confirmedAt = new Date();
    order.confirmedBy = markedBy;
    
    await order.save();

    // 2. Update Telegram message
    if (order.telegramMessageId) {
       await telegramService.updateOrderNotification(order, "fake");
    }

    // 3. Sync status update to Google Sheet
    await (await import("./googleSheetService")).googleSheetService.sendOrderToSheet(order);

    return order;
  },

  async markOrderLead(orderId: string, markedBy: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    // We don't restrict status change here heavily because a Lead could be requested at any time before confirmation
    // Just trigger Meta Lead event
    if (order.metaLeadEventStatus !== "sent") {
      order.metaLeadEventId = order.metaLeadEventId || `lead_${order._id}_${Date.now()}`;
      
      const metaResult = await metaService.sendLeadEvent(order);
      
      if (metaResult.success) {
        order.metaLeadEventStatus = "sent";
        order.metaLeadEventSentAt = new Date();
      } else {
        order.metaLeadEventStatus = "failed";
      }
    }

    await order.save();

    // Update Telegram message to show it's a Lead now
    if (order.telegramMessageId) {
       await telegramService.updateOrderNotification(order, "lead" as any); // We will update updateOrderNotification to handle "lead"
    }

    return order;
  }
};
