import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { orderVerificationService } from "@/lib/services/orderVerificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    
    // Verify that the session user is an admin or staff member
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const adminName = session.user.name || (session.user.role === "staff" ? "Staff Operator" : "Admin");

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
