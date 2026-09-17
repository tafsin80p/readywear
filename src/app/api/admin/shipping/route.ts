import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ShippingSettings from "@/models/ShippingSettings";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await ShippingSettings.findOne();
    
    if (!settings) {
      settings = await ShippingSettings.create({});
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = new ShippingSettings(body);
    } else {
      settings.zones = body.zones;
      settings.freeShipping = body.freeShipping;
      settings.storePickup = body.storePickup;
    }
    
    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
