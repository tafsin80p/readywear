import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import IntegrationSettings from "@/models/IntegrationSettings";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { courier } = await req.json(); // "pathao" | "steadfast"

    if (!courier || !["pathao", "steadfast"].includes(courier)) {
      return NextResponse.json({ success: false, message: "Invalid courier selected" }, { status: 400 });
    }

    await connectToDatabase();

    const { id } = await params;

    // 1. Fetch Order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.courierStatus === "dispatched") {
      return NextResponse.json({ success: false, message: `Order already dispatched to ${order.dispatchedTo}` }, { status: 400 });
    }

    // 2. Fetch Courier Settings
    const settings = await IntegrationSettings.findOne();
    if (!settings || !settings[courier as keyof typeof settings] || !(settings[courier as "pathao" | "steadfast"] as any).enabled) {
      return NextResponse.json({ success: false, message: `${courier} is not connected or enabled in settings.` }, { status: 400 });
    }

    const itemDescription = order.items.map((i: any) => {
      let desc = `${i.quantity}x ${i.title}${i.size ? ` (${i.size})` : ''}`;
      if (i.image) {
        desc += ` [Image: ${i.image}]`;
      }
      return desc;
    }).join(", ");
    
    // Amount to collect logic (only if payment is unpaid, else 0)
    const amountToCollect = order.paymentStatus === "unpaid" ? order.pricing.total : 0;

    let consignmentId = "";

    // ----------------------------------------------------
    // PATHAO DISPATCH LOGIC
    // ----------------------------------------------------
    if (courier === "pathao") {
      const { clientId, clientSecret, username, password, storeId } = settings.pathao;
      
      // Step 1: Get Access Token
      const tokenRes = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/issue-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, username, password, grant_type: "password" })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.message || "Failed to authenticate with Pathao");
      }
      const accessToken = tokenData.access_token;

      // Step 2: Create Order
      const pathaoPayload = {
        store_id: storeId,
        merchant_order_id: order.orderId,
        recipient_name: order.customerInfo.firstName + (order.customerInfo.lastName ? ` ${order.customerInfo.lastName}` : ""),
        recipient_phone: order.customerInfo.phone,
        recipient_address: order.customerInfo.address,
        recipient_city: 1, // Fallback to Dhaka (1) since no city selection in checkout yet
        recipient_zone: 1, // Fallback zone
        delivery_type: 48, // Normal delivery
        item_type: 2, // Parcel
        special_instruction: order.customerInfo.note || "",
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: amountToCollect,
        item_description: itemDescription
      };

      const orderRes = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(pathaoPayload)
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData.type === "error") {
        throw new Error(orderData.message || JSON.stringify(orderData.errors) || "Failed to create Pathao order");
      }
      
      consignmentId = orderData.data.consignment_id;
    } 

    // ----------------------------------------------------
    // STEADFAST DISPATCH LOGIC
    // ----------------------------------------------------
    else if (courier === "steadfast") {
      const { apiKey, secretKey } = settings.steadfast;

      const steadfastPayload = {
        invoice: order.orderId,
        recipient_name: order.customerInfo.firstName + (order.customerInfo.lastName ? ` ${order.customerInfo.lastName}` : ""),
        recipient_phone: order.customerInfo.phone,
        recipient_address: order.customerInfo.address,
        cod_amount: amountToCollect,
        note: itemDescription + (order.customerInfo.note ? ` | Note: ${order.customerInfo.note}` : "")
      };

      const orderRes = await fetch("https://portal.packzy.com/api/v1/create_order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": apiKey,
          "Secret-Key": secretKey
        },
        body: JSON.stringify(steadfastPayload)
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData.status !== 200) {
        let errorMsg = "Failed to create Steadfast order";
        if (orderData.errors) {
            errorMsg = Object.values(orderData.errors).flat().join(", ");
        }
        throw new Error(errorMsg);
      }
      
      consignmentId = orderData.consignment?.consignment_id || orderData.consignment?.tracking_code || orderData.data?.tracking_code;
    }

    // 3. Update Order in DB
    order.courierStatus = "dispatched";
    order.dispatchedTo = courier;
    order.consignmentId = consignmentId;
    
    // Automatically shift status to processing or shipped based on dispatch if desired.
    if (order.status === "pending") {
      order.status = "processing";
    }

    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: `Order successfully dispatched to ${courier.charAt(0).toUpperCase() + courier.slice(1)}!`,
      consignmentId
    });

  } catch (error: any) {
    console.error("Dispatch error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
