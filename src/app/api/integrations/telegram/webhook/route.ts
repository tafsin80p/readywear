import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { orderVerificationService } from "@/lib/services/orderVerificationService";
import { getIntegrationSettings, telegramService } from "@/lib/services/telegramService";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle incoming text messages (e.g. /start command)
    if (update.message && update.message.text) {
      const text = update.message.text.trim().toLowerCase();
      const fromId = update.message.from.id.toString();
      const name = update.message.from.first_name + (update.message.from.last_name ? ` ${update.message.from.last_name}` : "");
      const username = update.message.from.username;

      console.log(`[Webhook] Received message from ${name} (${fromId}): ${text}`);

      if (text.startsWith("/id")) {
        await connectToDatabase();
        const settings = await getIntegrationSettings();
        const chatId = update.message.chat.id.toString();
        await fetch(`https://api.telegram.org/bot${settings.telegram.botToken}/sendMessage`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ chat_id: update.message.chat.id, text: `✅ This Chat ID is:\n\n\`${chatId}\`\n\nTap to copy.` })
        });
        return new NextResponse("OK");
      }

      if (text.startsWith("/start")) {
        await connectToDatabase();
        const settings = await getIntegrationSettings();
        
        console.log(`[Webhook] Processing /start for ${fromId}`);

        if (settings.telegram.authorizedUsers && settings.telegram.authorizedUsers.includes(fromId)) {
           console.log(`[Webhook] User ${fromId} is already authorized.`);
           const res = await telegramService.sendMessage(fromId, "✅ You are already authorized to manage orders.");
           console.log(`[Webhook] SendMessage response:`, res);
        } else {
           // Check if already in pending
           if (!settings.telegram.pendingTelegramUsers) {
             settings.telegram.pendingTelegramUsers = [];
           }
           const isPending = settings.telegram.pendingTelegramUsers.some(u => u.telegramId === fromId);
           if (!isPending) {
             console.log(`[Webhook] Adding user ${fromId} to pending list.`);
             settings.telegram.pendingTelegramUsers.push({
               telegramId: fromId,
               name,
               username,
               requestedAt: new Date()
             });
             await settings.save();
           } else {
             console.log(`[Webhook] User ${fromId} is already in pending list.`);
           }
           const res = await telegramService.sendMessage(fromId, "⏳ Your authorization request has been sent. Please wait for an Admin to approve you from the Dashboard.");
           console.log(`[Webhook] SendMessage response:`, res);
        }
      }
      return new NextResponse("OK");
    }

    // 2. Check if it's a callback query from an inline button
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const fromId = callbackQuery.from.id.toString();
      const callbackId = callbackQuery.id;

      await connectToDatabase();
      const settings = await getIntegrationSettings();

      // Check if Telegram notifications are enabled and user is authorized
      if (!settings.telegram.enabled) {
         return new NextResponse("OK");
      }

      // If authorizedUsers list is set and not empty, check it
      if (settings.telegram.authorizedUsers && settings.telegram.authorizedUsers.length > 0) {
        if (!settings.telegram.authorizedUsers.includes(fromId)) {
          // User is not authorized. Answer callback query with error.
          await telegramService.answerCallbackQuery(callbackId, "❌ You are not authorized to manage orders.");
          return new NextResponse("OK");
        }
      }

      // Process the action
      if (data.startsWith("ask-")) {
        const action = data.split("_")[0].replace("ask-", "");
        const orderId = data.split("_")[1];
        
        try {
          const order = await Order.findById(orderId);
          if (order) {
            await telegramService.askConfirmation(order, action as any);
            await telegramService.answerCallbackQuery(callbackId, "Please confirm your action");
          }
        } catch (err) {}
      } else if (data.startsWith("cancel-ask_")) {
        const orderId = data.split("_")[1];
        try {
          const order = await Order.findById(orderId);
          if (order) {
            await telegramService.restoreButtons(order);
            await telegramService.answerCallbackQuery(callbackId, "Cancelled action");
          }
        } catch (err) {}
      } else if (data.startsWith("confirm_") || data.startsWith("fake_") || data.startsWith("lead_")) {
        const action = data.split("_")[0];
        const orderId = data.split("_")[1];
        const adminName = callbackQuery.from.username 
          ? `@${callbackQuery.from.username}` 
          : callbackQuery.from.first_name || "Telegram Admin";

        try {
          if (action === "confirm") {
            await orderVerificationService.confirmOrder(orderId, adminName);
          } else if (action === "fake") {
            await orderVerificationService.markOrderFake(orderId, adminName);
          } else if (action === "lead") {
            await orderVerificationService.markOrderLead(orderId, adminName);
          }

          // Acknowledge the callback query successfully
          let statusMsg = "Confirmed";
          if (action === "fake") statusMsg = "Fake/Cancelled";
          if (action === "lead") statusMsg = "marked as Lead";
          
          await telegramService.answerCallbackQuery(callbackId, `Order ${statusMsg}`);
          
        } catch (error: any) {
          await telegramService.answerCallbackQuery(callbackId, `⚠️ Error: ${error.message}`);
        }
      }
    }

    return new NextResponse("OK");
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return new NextResponse("OK"); // Always return OK to Telegram so it doesn't retry infinitely
  }
}
