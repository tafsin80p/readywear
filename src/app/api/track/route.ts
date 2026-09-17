import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");
    let phone = searchParams.get("phone");

    if (!orderId || !phone) {
      return NextResponse.json(
        { success: false, message: "অর্ডার আইডি এবং ফোন নাম্বার প্রদান করুন।" },
        { status: 400 }
      );
    }

    // Sanitize phone (remove spaces, dashes)
    phone = phone.replace(/[\s-]/g, "");

    await connectToDatabase();

    // Case-insensitive exact search for orderId
    const order = await Order.findOne({ 
      orderId: { $regex: new RegExp(`^${orderId}$`, "i") } 
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "এই অর্ডারের কোনো তথ্য পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Check if phone matches (allowing partial match for last 10 digits for flexibility)
    const dbPhone = order.customerInfo.phone.replace(/[\s-]/g, "");
    if (!dbPhone.includes(phone) && !phone.includes(dbPhone)) {
      return NextResponse.json(
        { success: false, message: "ফোন নাম্বার সঠিক নয়।" },
        { status: 401 }
      );
    }

    // Format the response securely
    const trackingData = {
      orderId: order.orderId,
      status: order.status, // "pending", "processing", "shipped", "delivered", "cancelled"
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color
      })),
      pricing: order.pricing,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    };

    return NextResponse.json({ success: true, data: trackingData }, { status: 200 });

  } catch (error) {
    console.error("Order Tracking Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর, কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
