import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";
import { telegramService } from "@/lib/services/telegramService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { action, telegramId } = await req.json();

    if (!action || !telegramId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const settings = await IntegrationSettings.findOne();

    if (!settings) {
      return NextResponse.json({ success: false, error: "Settings not found" }, { status: 404 });
    }

    // Find the user in the pending list
    const pendingIndex = settings.telegram.pendingTelegramUsers.findIndex(u => u.telegramId === telegramId);

    if (pendingIndex === -1) {
      return NextResponse.json({ success: false, error: "User not found in pending list" }, { status: 404 });
    }

    // Remove from pending
    settings.telegram.pendingTelegramUsers.splice(pendingIndex, 1);

    if (action === "authorize") {
      // Add to authorized
      if (!settings.telegram.authorizedUsers.includes(telegramId)) {
        settings.telegram.authorizedUsers.push(telegramId);
      }
      // Send Telegram notification
      await telegramService.sendMessage(telegramId, "✅ *Congratulations!*\nYou have been authorized by the Admin to manage orders.");
    } else if (action === "reject") {
      // Just send rejection
      await telegramService.sendMessage(telegramId, "❌ Your authorization request has been rejected by the Admin.");
    }

    await settings.save();
    return NextResponse.json({ success: true, message: `User ${action}d successfully` });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
