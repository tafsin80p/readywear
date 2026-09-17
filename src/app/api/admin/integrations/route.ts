import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";
import { getIntegrationSettings, telegramService } from "@/lib/services/telegramService";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await getIntegrationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    let settings = await IntegrationSettings.findOne();
    if (!settings) {
      settings = new IntegrationSettings(body);
    } else {
      // Preserve pendingTelegramUsers
      const existingPending = settings.telegram?.pendingTelegramUsers || [];
      settings.telegram = {
        ...body.telegram,
        pendingTelegramUsers: existingPending
      };
      settings.meta = body.meta;
      settings.googleSheet = body.googleSheet;
      settings.pathao = body.pathao;
      settings.steadfast = body.steadfast;
      settings.googleAnalytics = body.googleAnalytics;
      if (body.tiktok) settings.tiktok = body.tiktok;
      if (body.pushNotification) settings.pushNotification = body.pushNotification;
    }
    
    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
