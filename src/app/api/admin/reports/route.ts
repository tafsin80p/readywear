import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const searchParams = req.nextUrl.searchParams;
    const range = parseInt(searchParams.get("range") || "30"); // default 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    startDate.setHours(0, 0, 0, 0);

    // 1. Fetch Orders within date range
    // We only count revenue for non-fake, non-cancelled orders
    const orders = await Order.find({ createdAt: { $gte: startDate } }).lean();

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let verifiedCount = 0;
    let validOrdersCount = 0;
    
    // Status counters
    const statusMap: Record<string, number> = {
      pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0
    };
    
    // Verification counters for 'verified orders' metric
    const verificationMap: Record<string, number> = {
      pending_verification: 0, confirmed: 0, fake: 0, cancelled: 0
    };

    // Trend mapping by Date (YYYY-MM-DD)
    const trendMap: Record<string, { revenue: number; orders: number }> = {};
    
    // Product mapping
    const productMap: Record<string, { id: string; title: string; sold: number; revenue: number }> = {};

    // Initialize trend map with 0s for all days in range to ensure continuous chart
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      trendMap[dateStr] = { revenue: 0, orders: 0 };
    }

    orders.forEach((order: any) => {
      const dateStr = new Date(order.createdAt).toISOString().split("T")[0];
      const isValidRevenue = order.verificationStatus !== "fake" && order.status !== "cancelled";

      // Status
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
      verificationMap[order.verificationStatus] = (verificationMap[order.verificationStatus] || 0) + 1;
      
      if (order.verificationStatus === "confirmed") {
        verifiedCount++;
      }

      // Ensure date exists in map (if timezone weirdness happens)
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { revenue: 0, orders: 0 };
      }
      
      trendMap[dateStr].orders += 1;

      if (isValidRevenue) {
        totalRevenue += order.pricing.total;
        trendMap[dateStr].revenue += order.pricing.total;
        validOrdersCount++;

        // Products
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (!productMap[item.productId]) {
              productMap[item.productId] = { 
                id: item.productId, 
                title: item.title, 
                sold: 0, 
                revenue: 0 
              };
            }
            productMap[item.productId].sold += item.quantity;
            productMap[item.productId].revenue += (item.price * item.quantity);
          });
        }
      }
    });

    const averageOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;
    const verifiedRate = totalOrders > 0 ? Math.round((verifiedCount / totalOrders) * 100) : 0;

    // Format Trend Data
    const trendData = Object.keys(trendMap)
      .sort() // chronological order
      .map(date => ({
        date,
        revenue: trendMap[date].revenue,
        orders: trendMap[date].orders
      }));

    // Format Status Data for Donut Chart
    const statusData = Object.keys(statusMap)
      .filter(key => statusMap[key] > 0)
      .map(key => {
        // Pretty formatting for status name
        const name = key.charAt(0).toUpperCase() + key.slice(1);
        let color = "#cbd5e1"; // default slate
        if (key === "pending") color = "#f59e0b"; // amber
        else if (key === "processing") color = "#3b82f6"; // blue
        else if (key === "shipped") color = "#8b5cf6"; // purple
        else if (key === "delivered") color = "#10b981"; // emerald
        else if (key === "cancelled") color = "#ef4444"; // red
        
        return { name, value: statusMap[key], color };
      });
      
    // Format Top Products
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10); // Top 10

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        verifiedRate
      },
      trendData,
      statusData,
      topProducts
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
