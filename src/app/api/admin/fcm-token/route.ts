import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import IntegrationSettings from "@/models/IntegrationSettings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    let settings = await IntegrationSettings.findOne();
    if (settings && settings.pushNotification) {
      // Initialize array if it doesn't exist
      if (!settings.pushNotification.adminFcmTokens) {
        settings.pushNotification.adminFcmTokens = [];
      }
      
      // Add token if not already in array
      if (!settings.pushNotification.adminFcmTokens.includes(token)) {
        settings.pushNotification.adminFcmTokens.push(token);
        await settings.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
