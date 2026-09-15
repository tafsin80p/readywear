import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7"; // '7', '30', or '90'
    const days = parseInt(range, 10);

    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - days * 24 * 60 * 60 * 1000);

    // Get current period totals
    const currentOrders = await Order.find({ createdAt: { $gte: currentPeriodStart } });
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    
    // Get previous period totals to calculate change percentage
    const previousOrders = await Order.find({ 
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } 
    });
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

    // Calculate percent changes
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenueChange = calcChange(currentRevenue, previousRevenue);
    const ordersChange = calcChange(currentOrders.length, previousOrders.length);

    // Total counts (all-time)
    const totalOrders = await Order.countDocuments();
    
    // Get all orders to calculate total revenue all-time
    const allOrders = await Order.find({}, { 'pricing.total': 1 });
    const totalRevenue = allOrders.reduce((sum, order) => sum + ((order as any).pricing?.total || 0), 0);

    // Users are created with role 'user' by default
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();

    // In Stock products count
    const inStockProducts = await Product.countDocuments({ stock: { $gt: 0 } });

    // Pending / Processing Orders
    const pendingOrders = await Order.countDocuments({ status: { $in: ["pending", "processing"] } });

    // Low stock items (stock <= 5)
    const lowStockItems = await Product.find({ stock: { $lte: 5 } }, 'name sku stock images').limit(10);
    
    // Format low stock for dashboard
    const formattedLowStock = lowStockItems.map(item => ({
      name: item.name,
      sku: item.sku || 'N/A',
      stock: item.stock,
      status: item.stock === 0 ? "Critical" : "Low",
      img: (item.images && item.images.length > 0) ? item.images[0] : "https://via.placeholder.com/100"
    }));

    // Top selling products (simplified by counting items in orders)
    // A better way is aggregation, but this is simple enough for now
    const orderItems = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.productId",
          name: { $first: "$items.title" },
          price: { $first: "$items.price" },
          sold: { $sum: "$items.quantity" },
          img: { $first: "$items.image" }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 4 }
    ]);

    // Recent orders (last 5)
    const recentOrdersDb = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name image');

    const recentOrders = recentOrdersDb.map(order => ({
      id: order.orderId,
      customer: order.customerInfo?.firstName + " " + (order.customerInfo?.lastName || ""),
      amount: order.pricing?.total || 0,
      status: order.status === "pending" ? "Processing" : (order.status.charAt(0).toUpperCase() + order.status.slice(1)),
      date: new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      img: (order.items && order.items.length > 0) ? order.items[0].image : "https://via.placeholder.com/100"
    }));

    // Chart Data Generation (Sales per day for the requested range)
    const salesChartData = [];
    const dateMap = new Map();
    
    currentOrders.forEach(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, dateMap.get(dateStr) + (order.pricing?.total || 0));
      } else {
        dateMap.set(dateStr, (order.pricing?.total || 0));
      }
    });

    // Fill missing days with 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesChartData.push({
        date: dateStr,
        sales: dateMap.get(dateStr) || 0
      });
    }

    const orderStatuses = [
      { name: 'Pending', value: 0, color: '#f59e0b' },
      { name: 'Processing', value: 0, color: '#3b82f6' },
      { name: 'Shipped', value: 0, color: '#8b5cf6' },
      { name: 'Delivered', value: 0, color: '#10b981' },
      { name: 'Cancelled', value: 0, color: '#ef4444' },
    ];
    
    // Process status for current period orders or all orders depending on preference
    // Doing it for all time to show overall status distribution
    const allOrderStatuses = await Order.find({}, { status: 1 });
    allOrderStatuses.forEach(order => {
      const status = order.status?.toLowerCase();
      if (status === 'pending' || status === 'processing' || status === 'pending_verification') {
        const item = orderStatuses.find(s => s.name === 'Processing');
        if (item) item.value++;
      } else if (status === 'shipped') {
        const item = orderStatuses.find(s => s.name === 'Shipped');
        if (item) item.value++;
      } else if (status === 'delivered') {
        const item = orderStatuses.find(s => s.name === 'Delivered');
        if (item) item.value++;
      } else if (status === 'cancelled') {
        const item = orderStatuses.find(s => s.name === 'Cancelled');
        if (item) item.value++;
      } else {
        const item = orderStatuses.find(s => s.name === 'Pending');
        if (item) item.value++;
      }
    });

    // Inventory Chart Data
    const inventoryDataAgg = await Product.aggregate([
      { $group: { _id: "$category", stock: { $sum: "$stock" } } }
    ]);
    const inventoryData = inventoryDataAgg.map(item => ({
      name: item._id || 'Uncategorized',
      stock: item.stock,
      lowStock: item.stock <= 5 ? item.stock : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          revenue: totalRevenue,
          orders: totalOrders,
          customers: totalCustomers,
          products: totalProducts,
          inStockProducts
        },
        changes: {
          revenue: revenueChange,
          orders: ordersChange
        },
        pendingOrders,
        activeVisitors: Math.floor(Math.random() * 20) + 5, // Simulated active visitors
        lowStockItems: formattedLowStock,
        topSelling: orderItems,
        recentOrders,
        salesChartData,
        orderStatuses,
        inventoryData
      }
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
