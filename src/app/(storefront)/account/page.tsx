"use client";

import { useSession } from "next-auth/react";
import { Package, Truck, CheckCircle, Clock, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { mockOrders } from "@/data/mock";

export default function AccountOverview() {
  const { data: session } = useSession();
  
  // Calculate stats based on mockOrders
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === "processing").length;
  const deliveredOrders = mockOrders.filter(o => o.status === "delivered").length;
  
  // Get recent 3 orders
  const recentOrders = mockOrders.slice(0, 3);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", trend: "+2 this month" },
    { label: "Processing", value: pendingOrders, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", trend: "Shipping soon" },
    { label: "Delivered", value: deliveredOrders, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: "All time" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider mb-4 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#F5426A] animate-pulse"></span>
              DASHBOARD
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, <span className="text-[#F5426A]">{session?.user?.name || "Customer"}</span>!</h1>
            <p className="text-gray-400 max-w-md">Track your recent orders, manage your account settings, and discover new products.</p>
          </div>
          
          <Link href="/category/saree" className="shrink-0 bg-[#F5426A] hover:bg-[#ff5a7f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#F5426A]/30 flex items-center justify-center gap-2 hover:-translate-y-1 w-max">
            Shop New Arrivals
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5426A]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-[#F5426A]/30 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.border} border`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {stat.label === "Total Orders" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
            </div>

            {/* Hover decorative gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F5426A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest purchases and their status.</p>
          </div>
          <Link href="/account/orders" className="hidden sm:flex items-center gap-1 text-[#F5426A] text-sm font-bold hover:bg-[#F5426A]/10 px-4 py-2 rounded-lg transition-colors">
            View All History
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => {
            const firstItem = order.items[0];
            const extraItems = order.items.length - 1;

            return (
              <div key={order.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                
                {/* Product Image & Info */}
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Image src={firstItem.image} alt={firstItem.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{firstItem.name}</h3>
                    {extraItems > 0 && (
                      <p className="text-xs font-medium text-gray-500 mt-1">+{extraItems} more item{extraItems > 1 ? 's' : ''}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-500">Order <span className="font-semibold text-gray-900">#{order.id}</span></span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Price */}
                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="font-black text-lg text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                  
                  <span className={`px-4 py-1.5 text-sm font-bold rounded-full capitalize w-max flex items-center gap-2 ${
                    order.status === "delivered" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    order.status === "processing" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                    order.status === "shipped" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                    "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                    {order.status === "processing" && <Clock className="w-4 h-4" />}
                    {order.status === "shipped" && <Truck className="w-4 h-4" />}
                    {order.status === "delivered" && <CheckCircle className="w-4 h-4" />}
                    {order.status}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
        
        {/* Mobile View All Button */}
        <div className="p-4 border-t border-gray-100 sm:hidden">
          <Link href="/account/orders" className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-900 text-sm font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors">
            View All History
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
