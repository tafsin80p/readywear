import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    const allowedFields = ["status", "paymentStatus"];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error: any) {
    console.error("Order delete error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
