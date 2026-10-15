import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";
import { CreateOrderModal } from "@/components/admin/CreateOrderModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminOrdersPage() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const canDelete = session?.user?.role === "admin";

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
          <p className="text-gray-500 text-sm mt-1">Manage and process customer orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <CreateOrderModal />
        </div>
      </div>

      <OrdersTableClient orders={orders} canDelete={canDelete} />
    </div>
  );
}
