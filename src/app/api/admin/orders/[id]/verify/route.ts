import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { orderVerificationService } from "@/lib/services/orderVerificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    
    // In a real app, verify that the session user is an admin.
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || "Admin (Dashboard)";

    const body = await req.json();
    const { action } = body;

    if (!action || !["confirm", "fake"].includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    let order;
    if (action === "confirm") {
      order = await orderVerificationService.confirmOrder(resolvedParams.id, adminName);
    } else {
      order = await orderVerificationService.markOrderFake(resolvedParams.id, adminName);
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order verification error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
