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
          apiKey: settings.pushNotification.apiKey,
          authDomain: settings.pushNotification.authDomain,
          projectId: settings.pushNotification.projectId,
          storageBucket: settings.pushNotification.storageBucket,
          messagingSenderId: settings.pushNotification.messagingSenderId,
          appId: settings.pushNotification.appId,
          vapidKey: settings.pushNotification.vapidKey
        }
      });
    }

    return NextResponse.json({ success: false, error: "Firebase Push Notifications are not enabled or configured." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
