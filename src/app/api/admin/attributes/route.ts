import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attribute from "@/models/Attribute";
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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
