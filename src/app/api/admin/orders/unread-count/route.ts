import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    await connectToDatabase();
    const count = await Order.countDocuments({ 
      isDeleted: { $ne: true },
      $or: [
        { isRead: false },
        { isRead: { $exists: false } }
      ]
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Unread count error:", error);
    return NextResponse.json({ count: 0, error: error.message }, { status: 500 });
  }
}
