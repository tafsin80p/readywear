import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { telegramService } from "@/lib/services/telegramService";
import { googleSheetService } from "@/lib/services/googleSheetService";
import { activityLogService } from "@/lib/services/activityLogService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerInfo, items, pricing, paymentMethod, source } = body;

    if (!customerInfo || !items || items.length === 0 || !pricing) {
      return NextResponse.json(
        { success: false, message: "Missing required order data" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate Order ID (MZO-0001, MZO-0002, etc.)
    // Find the order with the highest orderId
    const lastOrder = await Order.findOne({}, { orderId: 1 }).sort({ createdAt: -1 });
    
    let nextNum = 1;
    if (lastOrder && lastOrder.orderId) {
      // Extract the numeric part from e.g. "RW005" or "MZ00005" or "MZO-0005"
      const match = lastOrder.orderId.match(/^(?:RW|MZ|MZO)-?(\d+)$/);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      } else {
        // If the last order format is weird, fallback to counting documents (less reliable but safe fallback)
        const count = await Order.countDocuments();
        nextNum = count + 1;
      }
    }

    // Pad with leading zeros to ensure at least 4 digits
    const paddedNum = String(nextNum).padStart(4, '0');
    const orderId = `MZO-${paddedNum}`;

    // Create the order
    const orderData: any = {
      orderId,
      customerInfo,
      items,
      pricing,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
      source: source || "Website",
    };

    // If user is logged in, attach their userId
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      orderData.userId = session.user.id;
    }

    const newOrder = await Order.create(orderData);

    await newOrder.save();

    // Run external notifications asynchronously without blocking the API response
    after(async () => {
      await Promise.allSettled([
      (async () => {
        try {
          const tgResult = await telegramService.sendOrderNotification(newOrder);
          if (tgResult.success) {
            newOrder.telegramNotificationStatus = "sent";
            newOrder.telegramMessageId = tgResult.messageId;
            newOrder.telegramChatId = tgResult.chatId;
          } else {
            newOrder.telegramNotificationStatus = "failed";
            newOrder.telegramLastError = tgResult.error || tgResult.reason;
          }
          await newOrder.save();
        } catch (err) {
          console.error("Telegram notification error:", err);
        }
      })(),
      (async () => {
        try {
          const gsResult = await googleSheetService.sendOrderToSheet(newOrder);
          if (gsResult.success) {
            newOrder.googleSheetSyncStatus = "sent";
          } else {
            newOrder.googleSheetSyncStatus = "failed";
            newOrder.googleSheetLastError = gsResult.error || gsResult.reason;
          }
          await newOrder.save();
        } catch (err) {
          console.error("Google Sheet sync error:", err);
        }
      })(),
      (async () => {
        try {
          await activityLogService.logActivity({
            title: "New Order Received! 🛍️",
            message: `Order ${orderId} has been placed for ${pricing.total} BDT.`,
            type: "order",
            link: `/admin/orders/${newOrder._id}`,
            sendPush: true
          });
        } catch (err) {
          console.error("Failed to log activity and send admin push notification", err);
        }
      })()
    ]);
    });

    return NextResponse.json(
      { success: true, message: "Order created successfully", orderId: newOrder._id, displayId: orderId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order", error: error.message },
      { status: 500 }
    );
  }
}
