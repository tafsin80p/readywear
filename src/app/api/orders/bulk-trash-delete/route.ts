import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { orderIds } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, message: "No order IDs provided" }, { status: 400 });
    }

    await connectToDatabase();

    // Permanently delete orders
    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} orders permanently deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error("Bulk trash delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete orders permanently", error: error.message },
      { status: 500 }
    );
  }
}
