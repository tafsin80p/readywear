import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export const revalidate = 0; // Disable cache for this route

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await StoreSettings.findOne().lean();
    return NextResponse.json({ 
      success: true, 
      logoUrl: settings?.headerLogo || "/readywear logo.png"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, logoUrl: "/readywear logo.png" }, { status: 500 });
  }
}
