import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await IntegrationSettings.findOne();
    
    if (settings && settings.pushNotification && settings.pushNotification.enabled) {
      return NextResponse.json({
        success: true,
        config: {
          appId: settings.pushNotification.appId,
        }
      });
    }

    return NextResponse.json({ success: false, error: "OneSignal Push Notifications are not enabled or configured." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
