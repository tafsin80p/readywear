import IntegrationSettings from "@/models/IntegrationSettings";

export async function getIntegrationSettings() {
  let settings = await IntegrationSettings.findOne();
  if (!settings) {
    settings = await IntegrationSettings.create({
      telegram: { enabled: false, botToken: "", chatId: "", authorizedUsers: [] },
      meta: { enabled: false, pixelId: "", accessToken: "", currency: "BDT" },
      googleSheet: { enabled: false, webhookUrl: "", sheetUrl: "" }
    });
  }
  return settings;
}

const escapeMarkdown = (text: string | number | undefined | null) => {
  if (text == null) return "";
  return String(text).replace(/([_*\[`])/g, '\\$1');
};

const buildOrderMessageText = (order: any, extraText: string = "") => {
  let productsList = order.items.map((item: any) => {
    let name = escapeMarkdown(item.title || item.name);
    let plainItem = typeof item.toJSON === 'function' ? item.toJSON() : item;
    
    let size = item.size;
    let color = item.color;
    let otherAttrs: string[] = [];
    
    if (plainItem.attributes && typeof plainItem.attributes === 'object') {
      const attrsObj = plainItem.attributes instanceof Map ? Object.fromEntries(plainItem.attributes) : plainItem.attributes;
      for (const [key, val] of Object.entries(attrsObj)) {
         if (typeof val !== 'object' && typeof val !== 'function' && !key.startsWith('$')) {
           if (key.toLowerCase() === 'size' && !size) size = val;
           else if (key.toLowerCase() === 'color' && !color) color = val;
           else otherAttrs.push(`${key}: ${val}`);
         }
      }
    }

    let details: string[] = [];
    const sizeStr = size != null ? String(size).trim() : "";
    if (sizeStr && sizeStr !== "undefined" && sizeStr !== "null") {
      details.push(`সাইজ: ${sizeStr}`);
    }
    const colorStr = color != null ? String(color).trim() : "";
    if (colorStr && colorStr !== "undefined" && colorStr !== "null") {
      details.push(`রং: ${colorStr}`);
    }
    if (otherAttrs.length > 0) {
      details.push(otherAttrs.join(", "));
    }
    if (item.quantity > 1) {
      details.push(`পরিমাণ: ${item.quantity}টি`);
    }

    if (details.length > 0) {
      name += ` _(${escapeMarkdown(details.join(" | "))})_`;
    }

    const itemImg = item.image || (item.images && item.images[0]);
    if (itemImg && typeof itemImg === 'string' && (itemImg.startsWith('http://') || itemImg.startsWith('https://'))) {
      name = `[\u200B](${itemImg})` + name;
    }

    return name;
  }).join("\n• ");

  let totalQty = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  let orderDate = escapeMarkdown(dateObj.toLocaleString('en-US', { 
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }));
  
  let statusText = "pending\\_verification";
  if (order.status === "returned") statusText = "↩️ RETURNED";
  else if (order.verificationStatus === "confirmed") statusText = "✅ CONFIRMED";
  else if (order.verificationStatus === "fake") statusText = "❌ FAKE \\/ CANCELLED";
  else if (order.verificationStatus === "lead") statusText = "🎯 REAL ORDER \\(LEAD\\)";

  let stockStatusText = "⏳ On Hold \\(Pending Confirmation\\)";
  if (order.stockDeducted) {
    stockStatusText = "📉 Deducted from Stock";
  } else if (order.inventoryStatus === "restocked" || order.status === "cancelled" || order.status === "returned" || order.verificationStatus === "fake") {
    stockStatusText = "🔄 Restocked to Inventory";
  }

  const message = `
🛒 *New Order Placed: ${totalQty}*
*Order ID:* ${escapeMarkdown(order.orderId)}
*Placed on:* ${orderDate}
*Order Source:* ${escapeMarkdown(order.source || "Website")}

*Product:* 
• ${productsList}

*Customer:* ${escapeMarkdown(order.customerInfo.firstName)} ${escapeMarkdown(order.customerInfo.lastName || "")}
*Phone:* ${escapeMarkdown(order.customerInfo.phone)}
*Address:* ${escapeMarkdown(order.customerInfo.address)}, ${escapeMarkdown(order.customerInfo.area)}

*Subtotal:* ${escapeMarkdown(order.pricing.subtotal)}৳
*Shipping:* ${escapeMarkdown(order.pricing.deliveryCharge)}৳
*Total:* ${escapeMarkdown(order.pricing.total)}৳

*Payment:* ${escapeMarkdown(order.paymentMethod)}
*Status:* ${statusText}
*Stock:* ${stockStatusText}
${extraText ? `\n${extraText}` : ''}`;
  
  return message;
};

export const telegramService = {
  async sendOrderNotification(order: any) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.telegram.enabled || !settings.telegram.botToken || !settings.telegram.chatId) {
        console.log("[Telegram] Notification skipped: not enabled or missing credentials.");
        return { success: false, reason: "disabled" };
      }

      const { botToken, chatId } = settings.telegram;

      const message = buildOrderMessageText(order);

      // Telegram rejects localhost URLs in inline keyboards
      let appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com";
      if (appUrl.includes("localhost")) {
        appUrl = "https://yourwebsite.com";
      }
      
      const keyboard = {
        inline_keyboard: [
          ...(settings.googleSheet?.sheetUrl ? [[
            { text: "Open in Google Sheet", url: settings.googleSheet.sheetUrl }
          ]] : []),
          [
            { text: "❌ Fake Order", callback_data: `ask-fake_${order._id}` },
            { text: "✅ Real Order — Send Lead", callback_data: `ask-lead_${order._id}` }
          ],
          [
            { text: "✅ Confirm Order — Send Purchase to FB", callback_data: `ask-confirm_${order._id}` }
          ]
        ]
      };

      // Check if first item has a valid web image
      const firstValidImage = order.items?.find((i: any) => {
        const img = i.image || (i.images && i.images[0]);
        return img && typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
      });
      const imageUrl = firstValidImage ? (firstValidImage.image || firstValidImage.images[0]) : null;

      let data: any = null;
      let sentWithPhoto = false;

      // Try sendPhoto first if valid image and caption <= 1024 chars
      if (imageUrl && message.length <= 1024) {
        try {
          const photoUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
          const photoRes = await fetch(photoUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: imageUrl,
              caption: message,
              parse_mode: "Markdown",
              reply_markup: keyboard
            })
          });
          const photoData = await photoRes.json();
          if (photoData.ok) {
            data = photoData;
            sentWithPhoto = true;
          }
        } catch (photoErr) {
          console.warn("[Telegram] sendPhoto failed, will fallback to sendMessage:", photoErr);
        }
      }

      if (!sentWithPhoto) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
            reply_markup: keyboard
          })
        });

        data = await response.json();
        if (!data.ok) {
          throw new Error(data.description);
        }
      }

      return {
        success: true,
        messageId: data.result.message_id,
        chatId: data.result.chat.id
      };
    } catch (error: any) {
      console.error("[Telegram] Error sending order notification:", error);
      return { success: false, error: error.message };
    }
  },

  async updateOrderNotification(order: any, action: "confirmed" | "fake" | "lead") {
    try {
      if (!order.telegramMessageId || !order.telegramChatId) {
        return { success: false, reason: "missing_message_info" };
      }

      const settings = await getIntegrationSettings();
      if (!settings.telegram.botToken) return { success: false, reason: "missing_token" };

      const { botToken } = settings.telegram;
      
      const isConfirmed = action === "confirmed";
      const isLead = action === "lead";
      const isFake = action === "fake";
      
      let extraText = `
*Action by:* ${escapeMarkdown(order.confirmedBy || "Admin")}

*Meta Events:*
Purchase: ${order.metaEventStatus === "sent" ? "✅ SENT" : "🚫 NOT SENT"}
Lead: ${order.metaLeadEventStatus === "sent" ? "✅ SENT" : "🚫 NOT SENT"}

*Timestamp:* ${escapeMarkdown(new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}))}`;

      const message = buildOrderMessageText(order, extraText);

      let appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com";
      if (appUrl.includes("localhost")) {
        appUrl = "https://yourwebsite.com";
      }

      const keyboard: any = {
        inline_keyboard: []
      };

      if (settings.googleSheet?.sheetUrl) {
        keyboard.inline_keyboard.push([
          { text: "Open in Google Sheet", url: settings.googleSheet.sheetUrl }
        ]);
      }

      if (order.verificationStatus !== "confirmed" && order.verificationStatus !== "fake") {
        let actionRow = [
          { text: "❌ Fake Order", callback_data: `ask-fake_${order._id}` }
        ];
        
        if (order.metaLeadEventStatus !== "sent") {
          actionRow.push({ text: "✅ Real Order — Send Lead", callback_data: `ask-lead_${order._id}` });
        }
        
        keyboard.inline_keyboard.push(actionRow);
        
        keyboard.inline_keyboard.push([
          { text: "✅ Confirm Order — Send Purchase to FB", callback_data: `ask-confirm_${order._id}` }
        ]);
      }

      const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: order.telegramChatId,
          message_id: order.telegramMessageId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: keyboard
        })
      });

      const editData = await response.json();
      // If original message was a photo, edit caption instead
      if (!editData.ok && String(editData.description).toLowerCase().includes("no text")) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: order.telegramChatId,
            message_id: order.telegramMessageId,
            caption: message,
            parse_mode: "Markdown",
            reply_markup: keyboard
          })
        });
      }
      
      // Send a reply message mimicking the requested format
      if (isConfirmed || isLead) {
        const replyText = isConfirmed
          ? `✅ *Order confirmed and Purchase sent to Meta*\n\nOrder ID: ${escapeMarkdown(order.orderId)}\nConfirmed by: ${escapeMarkdown(order.confirmedBy || "Admin")}\n📦 *Stock:* Deducted from inventory\nMeta Dataset: ${escapeMarkdown(settings.meta?.datasetName || "Mehzin Offers")}\nStatus: Purchase event processed by server`
          : `✅ *Real Order — Lead sent to Meta*\n\nOrder ID: ${escapeMarkdown(order.orderId)}\nReviewed by: ${escapeMarkdown(order.confirmedBy || "Admin")}\nMeta Dataset: ${escapeMarkdown(settings.meta?.datasetName || "Mehzin Offers")}\nStatus: Lead event processed by server`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: order.telegramChatId,
            reply_to_message_id: order.telegramMessageId,
            text: replyText,
            parse_mode: "Markdown"
          })
        });
      } else if (isFake) {
        const replyText = `❌ *Order Cancelled / Fake*\n\nOrder ID: ${escapeMarkdown(order.orderId)}\nMarked by: ${escapeMarkdown(order.confirmedBy || "Admin")}\n📦 *Stock:* Restocked to inventory\nStatus: Order cancelled`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: order.telegramChatId,
            reply_to_message_id: order.telegramMessageId,
            text: replyText,
            parse_mode: "Markdown"
          })
        });
      }

      return { success: editData.ok };
    } catch (error: any) {
      console.error("[Telegram] Error editing message:", error);
      return { success: false, error: error.message };
    }
  },
  
  async sendTestMessage(botToken: string, chatId: string) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🟢 *Mehzin Offers Telegram Integration Test*\n\nConnection successful.",
          parse_mode: "Markdown"
        })
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.description);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async sendMessage(telegramId: string, text: string) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.telegram.botToken) return { success: false };

      const url = `https://api.telegram.org/bot${settings.telegram.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramId,
          text,
          parse_mode: "Markdown"
        })
      });
      const data = await response.json();
      if (!data.ok) {
        console.error("[Telegram] SendMessage API returned error:", data);
      }
      return { success: data.ok };
    } catch (error: any) {
      console.error("[Telegram] Error sending message:", error);
      return { success: false, error: error.message };
    }
  },

  async answerCallbackQuery(callbackQueryId: string, text: string) {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.telegram.botToken) return { success: false };

      const url = `https://api.telegram.org/bot${settings.telegram.botToken}/answerCallbackQuery`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: true
        })
      });
      const data = await response.json();
      return { success: data.ok };
    } catch (error: any) {
      console.error("[Telegram] Error answering callback:", error);
      return { success: false, error: error.message };
    }
  },

  async askConfirmation(order: any, actionType: "confirm" | "fake" | "lead") {
    try {
      const settings = await getIntegrationSettings();
      if (!settings.telegram.botToken) return { success: false };
      const { botToken } = settings.telegram;

      let actionText = "";
      if (actionType === "confirm") actionText = "CONFIRM this order and send Purchase event to Meta?";
      else if (actionType === "lead") actionText = "mark this as REAL ORDER and send Lead event to Meta?";
      else if (actionType === "fake") actionText = "mark this order as FAKE?";

      const keyboard: any = {
        inline_keyboard: []
      };

      if (settings.googleSheet?.sheetUrl) {
        keyboard.inline_keyboard.push([{ text: "Open in Google Sheet", url: settings.googleSheet.sheetUrl }]);
      }

      if (order.verificationStatus !== "confirmed" && order.verificationStatus !== "fake") {
        let actionRow = [
          { text: "❌ Fake Order", callback_data: `ask-fake_${order._id}` }
        ];
        
        if (order.metaLeadEventStatus !== "sent") {
          actionRow.push({ text: "✅ Real Order — Send Lead", callback_data: `ask-lead_${order._id}` });
        }
        
        keyboard.inline_keyboard.push(actionRow);
        
        keyboard.inline_keyboard.push([
          { text: "✅ Confirm Order — Send Purchase to FB", callback_data: `ask-confirm_${order._id}` }
        ]);
      }

      // Append Yes/No buttons at the bottom
      keyboard.inline_keyboard.push([
        { text: "✅ Yes, I'm sure", callback_data: `${actionType}_${order._id}` },
        { text: "❌ No, Cancel", callback_data: `cancel-ask_${order._id}` }
      ]);

      const message = buildOrderMessageText(order, `⚠️ *Are you sure you want to ${actionText}*`);

      const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: order.telegramChatId,
          message_id: order.telegramMessageId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: keyboard
        })
      });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  async restoreButtons(order: any) {
    // Just re-call updateOrderNotification with a fake pending action to re-render buttons
    // Since there's no "pending" action in updateOrderNotification currently, let's just edit it manually here.
    try {
      const settings = await getIntegrationSettings();
      if (!settings.telegram.botToken) return { success: false };
      const { botToken } = settings.telegram;

      let appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourwebsite.com";
      if (appUrl.includes("localhost")) appUrl = "https://yourwebsite.com";

      const keyboard: any = {
        inline_keyboard: []
      };

      if (settings.googleSheet?.sheetUrl) {
        keyboard.inline_keyboard.push([{ text: "Open in Google Sheet", url: settings.googleSheet.sheetUrl }]);
      }

      if (order.verificationStatus !== "confirmed" && order.verificationStatus !== "fake") {
        let actionRow = [
          { text: "❌ Fake Order", callback_data: `ask-fake_${order._id}` }
        ];
        
        if (order.metaLeadEventStatus !== "sent") {
          actionRow.push({ text: "✅ Real Order — Send Lead", callback_data: `ask-lead_${order._id}` });
        }
        
        keyboard.inline_keyboard.push(actionRow);
        
        keyboard.inline_keyboard.push([
          { text: "✅ Confirm Order — Send Purchase to FB", callback_data: `ask-confirm_${order._id}` }
        ]);
      }

      const message = buildOrderMessageText(order);

      const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: order.telegramChatId,
          message_id: order.telegramMessageId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: keyboard
        })
      });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
};
