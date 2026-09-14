import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attribute from "@/models/Attribute";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const attributes = await Attribute.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, attributes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Validate request
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Attribute name is required" },
        { status: 400 }
      );
    }
    
    const attribute = await Attribute.create(body);
    
    return NextResponse.json(
      { success: true, attribute },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "An attribute with this name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
