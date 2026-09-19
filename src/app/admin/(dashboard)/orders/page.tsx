import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { Eye, Clock, Truck, CheckCircle, XCircle, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminOrdersPage() {
  await connectToDatabase();
  // We just reference User to ensure the model is loaded for populate
  const _ = User; 
  const rawOrders = await Order.find({ isDeleted: { $ne: true } }).populate('userId', 'image name').sort({ createdAt: -1 }).lean();
  
  // Serialize complex types (like MongoDB ObjectId) so they can be passed to the Client Component
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your customer orders from one place</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <OrdersTableClient orders={orders} />
    </div>
  );
}
