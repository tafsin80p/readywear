import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import Category from '@/models/Category';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: true, 
        results: { products: [], orders: [], customers: [], categories: [], pages: [] } 
      });
    }

    await connectToDatabase();
    
    // Create a regex for case-insensitive search
    const regex = new RegExp(query, 'i');

    // Parallel search across collections (limit 5 per category for performance and UI brevity)
    const [products, orders, customers, categories] = await Promise.all([
      // Search Products (by name or sku)
      Product.find({
        $or: [
          { name: { $regex: regex } },
          { sku: { $regex: regex } }
        ]
      })
      .select('name sku images price stock')
      .limit(5)
      .lean(),

      // Search Orders (by orderId, customer phone, customer name)
      Order.find({
        $or: [
          { orderId: { $regex: regex } },
          { 'customerInfo.firstName': { $regex: regex } },
          { 'customerInfo.phone': { $regex: regex } }
        ]
      })
      .select('orderId customerInfo status pricing.total createdAt')
      .limit(5)
      .lean(),

      // Search Customers (Users by name, email, phone)
      User.find({
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { phone: { $regex: regex } }
        ]
      })
      .select('name email image createdAt')
      .limit(5)
      .lean(),

      // Search Categories (by name or slug)
      Category.find({
        $or: [
          { name: { $regex: regex } },
          { slug: { $regex: regex } }
        ]
      })
      .select('name slug image')
      .limit(5)
      .lean()
    ]);

    // Static Quick Links (Pages & Actions)
    const quickLinks = [
      { name: 'Dashboard Home Analytics', url: '/admin', type: 'page' },
      { name: 'Add New Product', url: '/admin/products/add', type: 'action' },
      { name: 'View All Products', url: '/admin/products', type: 'page' },
      { name: 'Orders List & Management', url: '/admin/orders', type: 'page' },
      { name: 'Customers Directory', url: '/admin/customers', type: 'page' },
      { name: 'Categories Management', url: '/admin/categories', type: 'page' },
      { name: 'Admin Profile & Settings', url: '/admin/profile', type: 'page' },
    ];

    const pages = quickLinks.filter(link => regex.test(link.name));

    return NextResponse.json({
      success: true,
      results: {
        pages,
        products,
        orders,
        customers,
        categories
      }
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
