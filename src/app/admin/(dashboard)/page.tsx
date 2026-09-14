"use client";

import Image from "next/image";
import { 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  ArrowUpRight,
  Plus,
  ListOrdered,
  FolderPlus,
  UsersRound,
  Ticket,
  BarChart3,
  ChevronRight,
  Truck,
  ShieldCheck,
  Award,
  Headset,
  AlertCircle
} from "lucide-react";
import { SalesChart } from "@/components/admin/SalesChart";
import { OrderStatusChart } from "@/components/admin/OrderStatusChart";
import { InventoryChart } from "@/components/admin/InventoryChart";
import { AnimatedNumber } from "@/components/admin/AnimatedNumber";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function AdminDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Fade and slide in cards
    gsap.fromTo(
      ".dashboard-item",
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.2)", delay: 0.1 }
    );
    
    // 2. Pulse icons in KPI cards
    gsap.fromTo(
      ".kpi-icon-wrapper",
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)", delay: 0.4 }
    );
  }, { scope: containerRef });

  
  const recentOrders = [
    { id: "#ORD-1256", customer: "Sarah Khan", amount: 1850, status: "Delivered", date: "23 Aug, 10:24 AM", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=100" },
    { id: "#ORD-1255", customer: "Rafiqul Islam", amount: 2450, status: "Processing", date: "22 Aug, 06:32 PM", img: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=100" },
    { id: "#ORD-1254", customer: "Nusrat Jahan", amount: 1320, status: "Shipped", date: "22 Aug, 04:17 PM", img: "https://images.unsplash.com/photo-1583391733958-6c581e2b6e15?auto=format&fit=crop&q=80&w=100" },
    { id: "#ORD-1253", customer: "Tanjim Ahmed", amount: 3780, status: "Processing", date: "21 Aug, 01:05 PM", img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=100" },
    { id: "#ORD-1252", customer: "Farhana Akter", amount: 2150, status: "Delivered", date: "20 Aug, 11:48 AM", img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=100" },
  ];

  const topSelling = [
    { name: "Floral Printed Dress", price: 1850, sold: 245, img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=100" },
    { name: "Men's Casual Shirt", price: 1650, sold: 189, img: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=100" },
    { name: "Leather Handbag", price: 3200, sold: 142, img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=100" },
    { name: "White Sneakers", price: 2450, sold: 128, img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=100" },
  ];

  const lowStockItems = [
    { name: "Classic White T-Shirt", sku: "TS-WHT-01", stock: 2, status: "Critical", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100" },
    { name: "Denim Jacket", sku: "JK-DEN-04", stock: 5, status: "Low", img: "https://images.unsplash.com/photo-1601333144130-8c1f123cb49a?auto=format&fit=crop&q=80&w=100" },
    { name: "Running Sneakers", sku: "SH-RUN-09", stock: 3, status: "Critical", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100" },
    { name: "Floral Summer Dress", sku: "DR-FLR-12", stock: 8, status: "Low", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=100" },
    { name: "Leather Wallet", sku: "AC-WAL-02", stock: 4, status: "Critical", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=100" },
  ];

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* 1. WELCOME AREA */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-stretch dashboard-item">
        
        {/* Welcome Left */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-[32px] font-extrabold text-[#1a2b4b] tracking-tight mb-2">Welcome Back, Admin! 👋</h1>
            <p className="text-gray-500 font-medium">Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white w-fit mt-6">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#F5426A]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today</p>
              <p className="text-sm font-bold text-gray-900">23 Aug, 2025</p>
            </div>
          </div>
        </div>

        {/* Store Insights Right */}
        <div className="w-full xl:w-[600px] flex gap-4">
          <div className="flex-1 bg-[#F5426A] p-6 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-pink-200">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <BarChart3 className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-xs font-bold text-pink-100 uppercase tracking-wider">Live Now</span>
                </div>
                <h3 className="text-4xl font-black mb-1 text-white">42</h3>
                <p className="text-sm text-pink-100 font-medium">Active visitors on site</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
             <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white flex-1 flex flex-col justify-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#F5426A] flex items-center justify-center"><Package className="w-4 h-4"/></div>
                   <h4 className="font-bold text-[#1a2b4b]">12 Pending</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium">Orders to process</p>
             </div>
             <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white flex-1 flex flex-col justify-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#F5426A] flex items-center justify-center"><AlertCircle className="w-4 h-4"/></div>
                   <h4 className="font-bold text-[#1a2b4b]">5 Items</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium">Low in stock</p>
             </div>
          </div>
        </div>

      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] dashboard-item hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-[#F5426A] shadow-inner shadow-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={1248} />
            </h3>
            <p className="text-sm font-medium"><span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">↑ +12%</span> <span className="text-gray-400 ml-1">vs last 7 days</span></p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-[#F5426A] shadow-inner shadow-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={485620} prefix="৳ " />
            </h3>
            <p className="text-sm font-medium"><span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">↑ +18%</span> <span className="text-gray-400 ml-1">vs last 7 days</span></p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-[#F5426A] shadow-inner shadow-white">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Customers</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={892} />
            </h3>
            <p className="text-sm font-medium"><span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">↑ +10%</span> <span className="text-gray-400 ml-1">vs last 7 days</span></p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-[#F5426A] shadow-inner shadow-white">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={156} />
            </h3>
            <p className="text-sm font-medium text-gray-400">In Stock: <span className="text-gray-600 font-bold">148</span></p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="xl:col-span-2 space-y-6 dashboard-item">
          
          {/* Sales Overview */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-[#F5426A]" />
                <h2 className="text-xl font-bold text-[#1a2b4b]">Sales Overview</h2>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button className="px-4 py-1.5 text-xs font-bold bg-[#F5426A] text-white rounded-lg shadow-sm">7 Days</button>
                <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 rounded-lg transition-colors">30 Days</button>
                <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 rounded-lg transition-colors">90 Days</button>
              </div>
            </div>
            <SalesChart />
          </div>

          {/* Recent Orders */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ListOrdered className="w-6 h-6 text-[#F5426A]" />
                <h2 className="text-xl font-bold text-[#1a2b4b]">Recent Orders</h2>
              </div>
              <button className="text-[#F5426A] text-sm font-bold flex items-center gap-1 hover:underline">
                View All <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Order</th>
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Customer</th>
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Amount</th>
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={order.img} alt="Product" fill className="object-cover" />
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-600">{order.customer}</td>
                      <td className="py-4 text-sm font-bold text-gray-900">৳ {order.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-500">{order.date}</td>
                      <td className="py-4 text-right pr-2">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F5426A] ml-auto transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          
          {/* Order Status */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-fit">
            <h2 className="text-lg font-bold text-[#1a2b4b] mb-2">Order Status</h2>
            <OrderStatusChart />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
            <h2 className="text-lg font-bold text-[#1a2b4b] mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Add Product</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Manage Orders</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Add Category</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UsersRound className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">View Customers</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Create Coupon</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F5426A] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Check Reports</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* 4. INVENTORY & TOP SELLING GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Inventory Overview (Span 3) */}
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dashboard-item">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#F5426A]" />
              <h2 className="text-xl font-bold text-[#1a2b4b]">Inventory Overview</h2>
            </div>
            <button className="text-[#F5426A] text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap shrink-0">
              Manage Inventory <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Chart Area */}
            <div className="lg:w-1/2">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Stock by Category</h3>
              <InventoryChart />
            </div>
            
            {/* Table Area */}
            <div className="lg:w-1/2">
              <h3 className="text-sm font-bold text-rose-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Low Stock Alerts
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Product</th>
                      <th className="pb-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Stock</th>
                      <th className="pb-3 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.slice(0, 4).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image src={item.img} alt="Product" fill className="object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</span>
                              <span className="text-[10px] text-gray-500 font-medium">{item.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            item.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.stock} left
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="px-3 py-1.5 text-[11px] font-bold bg-[#1a2b4b] hover:bg-[#2a3f6c] text-white rounded-lg transition-colors">
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling & Offer (Span 1) */}
        <div className="space-y-6 dashboard-item">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#1a2b4b]">Top Selling Products</h2>
              <button className="text-[#F5426A] text-[11px] font-bold uppercase hover:underline flex items-center gap-1">View All <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-5">
              {topSelling.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#F5426A] transition-colors">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">৳ {item.price.toLocaleString()} • {item.sold} sold</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F5426A] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a2b4b] rounded-[2rem] p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="currentColor"/>
               </svg>
             </div>
             <div className="relative z-10">
                <span className="inline-block px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider mb-3">Pro Tip</span>
                <h3 className="font-bold text-lg mb-2">Boost Your Sales</h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">Create targeted coupon campaigns to re-engage inactive customers and boost weekend revenue.</p>
                <button className="bg-[#F5426A] hover:bg-[#F5426A]/90 text-white w-full py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Create Campaign
                </button>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
