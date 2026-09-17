import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find orders where the userId matches the session user ID, OR where customer email matches if you were saving email
    // For now, since user ID is added on order creation if logged in, we search by userId.
    const query: any = {};
    if (session.user.id) {
      query.userId = session.user.id;
    } else {
      // Fallback if there's no id
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Map MongoDB docs to frontend expected structure
    const mappedOrders = orders.map((o: any) => ({
      id: o.orderId || o._id.toString(),
      date: o.createdAt,
      status: o.status,
      total: o.pricing.total,
      items: o.items.map((i: any) => ({
        name: i.title,
        quantity: i.quantity,
        price: i.price,
        image: i.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"
      }))
    }));

    return NextResponse.json({ success: true, orders: mappedOrders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
