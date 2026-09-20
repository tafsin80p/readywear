import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');
    
    if (!since) {
      return NextResponse.json({ success: false, message: "Missing since parameter" }, { status: 400 });
    }

    const sinceDate = new Date(parseInt(since));

    await connectToDatabase();
    
    // Find orders created after the 'since' timestamp
    const orders = await Order.find({
      createdAt: { $gt: sinceDate }
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
