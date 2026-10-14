import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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

import { inventoryService } from "@/lib/services/inventoryService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;
    const newStatus = body.status;

    if (newStatus && newStatus !== oldStatus) {
      order.status = newStatus;

      if (newStatus === "cancelled") {
        // Order cancelled: restock inventory if previously deducted
        if (order.stockDeducted) {
          await inventoryService.restockOrderStock(order);
          order.stockDeducted = false;
          order.inventoryStatus = "restocked";
        }
        if (order.verificationStatus === "pending_verification") {
          order.verificationStatus = "cancelled";
        }
      } else if (newStatus === "returned") {
        // Order returned: restock inventory if requested (default: true)
        const shouldRestock = body.restockInventory !== false;
        if (order.stockDeducted && shouldRestock) {
          await inventoryService.restockOrderStock(order);
          order.stockDeducted = false;
          order.inventoryStatus = "restocked";
        }

        order.returnInfo = {
          returnedAt: new Date(),
          reason: body.returnReason || "Product Return",
          restocked: shouldRestock,
          notes: body.returnNotes || "",
        };

        if (body.refundPayment) {
          order.paymentStatus = "refunded";
        }
      } else if (["processing", "shipped", "delivered"].includes(newStatus)) {
        // Order confirmed / in progress: deduct inventory if currently on hold or restocked
        if (!order.stockDeducted) {
          await inventoryService.deductOrderStock(order);
          order.stockDeducted = true;
          order.inventoryStatus = "deducted";
        }
        if (order.verificationStatus === "pending_verification") {
          order.verificationStatus = "confirmed";
          order.confirmedAt = new Date();
          order.confirmedBy = session.user.name || "Admin (Dashboard)";
        }
      } else if (newStatus === "pending") {
        // Reverted to pending: return deducted stock back to hold
        if (order.stockDeducted) {
          await inventoryService.restockOrderStock(order);
          order.stockDeducted = false;
          order.inventoryStatus = "hold";
        }
      }
    }

    if (body.paymentStatus !== undefined) {
      order.paymentStatus = body.paymentStatus;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // If stock was deducted, restock it before removing the order
    if (order.stockDeducted) {
      await inventoryService.restockOrderStock(order);
    }
    
    await Order.findByIdAndDelete(id);
    
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
