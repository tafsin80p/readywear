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

    // Restore orders by setting isDeleted: false and removing deletedAt
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { isDeleted: false },
        $unset: { deletedAt: 1 } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} orders restored from trash`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error("Bulk restore error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to restore orders", error: error.message },
      { status: 500 }
    );
  }
}
