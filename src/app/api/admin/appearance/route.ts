import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import { activityLogService } from "@/lib/services/activityLogService";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await StoreSettings.findOne();
    return NextResponse.json({ success: true, settings: settings || {} });
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
    
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(body);
    } else {
      settings.headerLogo = body.headerLogo;
      settings.footerLogo = body.footerLogo;
      settings.favicon = body.favicon;
      settings.storeName = body.storeName;
      settings.storeTagline = body.storeTagline;
      settings.storeDescription = body.storeDescription;
      settings.primaryColor = body.primaryColor;
      settings.notificationTone = body.notificationTone;
      if (body.socialImage !== undefined) {
        settings.socialImage = body.socialImage;
      }
      if (body.facebookUrl !== undefined) settings.facebookUrl = body.facebookUrl;
      if (body.instagramUrl !== undefined) settings.instagramUrl = body.instagramUrl;
      if (body.youtubeUrl !== undefined) settings.youtubeUrl = body.youtubeUrl;
      if (body.whatsappUrl !== undefined) settings.whatsappUrl = body.whatsappUrl;
      if (body.messengerUrl !== undefined) settings.messengerUrl = body.messengerUrl;
    }
    
    await settings.save();
    
    // Log Activity
    activityLogService.logActivity({
      title: "Appearance Settings Updated",
      message: `Store logos and appearance have been modified.`,
      type: "setting",
      link: `/admin/appearance`,
    });

    // Revalidate layout and home to update logos and favicon immediately
    revalidatePath("/", "layout");
    revalidatePath("/admin/appearance");

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
