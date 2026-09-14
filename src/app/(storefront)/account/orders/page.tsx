"use client";

import { mockOrders } from "@/data/mock";
import { Package, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function AccountOrders() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h1>
          <p className="text-gray-500 mt-1">View and track all your recent orders</p>
        </div>

        <div className="space-y-6">
          {mockOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mt-1">When you place an order, it will appear here.</p>
            </div>
          ) : (
            mockOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Placed</p>
                      <p className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</p>
                      <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</p>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                    </div>
                  </div>
                  
                  <span className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize w-max ${
                    order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                    order.status === "processing" ? "bg-orange-100 text-orange-700" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="p-4 md:px-6 divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start sm:items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl relative overflow-hidden shrink-0">
                        <Image src={item.image || "https://placehold.co/400x600/f3f4f6/a1a1aa?text=No+Image"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#F5426A] mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#F5426A] transition-colors p-2">
                        View Product <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
