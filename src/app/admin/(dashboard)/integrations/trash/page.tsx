import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { Search } from "lucide-react";
import { TrashTableClient } from "@/components/admin/TrashTableClient";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminTrashPage() {
  await connectToDatabase();
  const _ = User; 
  const rawOrders = await Order.find({ isDeleted: true }).populate('userId', 'image name').sort({ deletedAt: -1 }).lean();
  
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
          <p className="text-gray-500 text-sm mt-1">Manage deleted orders. You can restore them or delete them permanently.</p>
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

      <TrashTableClient orders={orders} />
    </div>
  );
}
