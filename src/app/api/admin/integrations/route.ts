import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";
import { getIntegrationSettings, telegramService } from "@/lib/services/telegramService";
import { activityLogService } from "@/lib/services/activityLogService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await getIntegrationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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

    // Log Activity
    activityLogService.logActivity({
      title: "Settings Updated",
      message: `System integrations and settings have been modified.`,
      type: "setting",
      link: `/admin/integrations`,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
