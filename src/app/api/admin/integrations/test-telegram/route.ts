import { NextRequest, NextResponse } from "next/server";
import { telegramService } from "@/lib/services/telegramService";

export async function POST(req: NextRequest) {
  try {
    const { botToken, chatId } = await req.json();
    
    if (!botToken || !chatId) {
      return NextResponse.json({ success: false, error: "Bot Token and Chat ID are required" }, { status: 400 });
    }

    const result = await telegramService.sendTestMessage(botToken, chatId);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Test message sent successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
