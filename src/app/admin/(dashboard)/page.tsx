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
import { CustomDatePicker } from "@/components/admin/CustomDatePicker";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useEffect } from "react";

export default function AdminDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedDate) {
          queryParams.append("date", selectedDate);
        } else {
          queryParams.append("range", range);
        }
        
        const res = await fetch(`/api/admin/dashboard?${queryParams.toString()}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [range, selectedDate]);

  useGSAP(() => {
    if (loading) return;
    
    // 1. Fade and slide in cards
    gsap.fromTo(
      ".dashboard-item",
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.2)" }
    );
    
    // 2. Pulse icons in KPI cards
    gsap.fromTo(
      ".kpi-icon-wrapper",
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3 }
    );
  }, { scope: containerRef, dependencies: [loading, data] });

  
  const recentOrders: any[] = data?.recentOrders || [];
  const topSelling: any[] = data?.topSelling || [];
  const lowStockItems: any[] = data?.lowStockItems || [];
  
  const today = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading && !data) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* 1. WELCOME BANNER */}
      <div className="relative bg-gradient-to-br from-primary to-[#d62850] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-pink-200/50 dashboard-item z-10">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300 rounded-full blur-[80px] opacity-20 translate-y-1/4 -translate-x-1/4"></div>
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-center">
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome Back, Admin! 👋
            </h1>
            <p className="text-pink-100 font-medium text-lg max-w-lg">
              Here's what's happening with your store today. Keep up the great work!
            </p>
            
            <CustomDatePicker 
              selectedDate={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setRange('');
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* Live Visitors Card */}
            <div className="flex-1 sm:w-[200px] bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/20 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                <Users className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                <span className="text-xs font-bold text-pink-100 uppercase tracking-wider">Live Now</span>
              </div>
              <h3 className="text-4xl font-black relative z-10 text-white">{data?.activeVisitors || 0}</h3>
              <p className="text-xs text-pink-100 font-medium mt-1 relative z-10">Active visitors on site</p>
            </div>

            {/* Pending Orders Card */}
            <div className="flex-1 sm:w-[200px] bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/20 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                <Package className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]"></div>
                <span className="text-xs font-bold text-pink-100 uppercase tracking-wider">To Process</span>
              </div>
              <h3 className="text-4xl font-black relative z-10 text-white">{data?.pendingOrders || 0}</h3>
              <p className="text-xs text-pink-100 font-medium mt-1 relative z-10">Pending orders</p>
            </div>
            
            {/* Low Stock Card */}
            <div className="flex-1 sm:w-[200px] bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/20 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                <span className="text-xs font-bold text-pink-100 uppercase tracking-wider">Low Stock</span>
              </div>
              <h3 className="text-4xl font-black relative z-10 text-white">{data?.lowStockItems?.length || 0}</h3>
              <p className="text-xs text-pink-100 font-medium mt-1 relative z-10">Items need attention</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] dashboard-item hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-primary shadow-inner shadow-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={data?.totals?.orders || 0} />
            </h3>
            <p className="text-sm font-medium">
              <span className={`font-bold px-2 py-0.5 rounded-md ${(data?.changes?.orders || 0) >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                {(data?.changes?.orders || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.changes?.orders || 0)}%
              </span> 
              <span className="text-gray-400 ml-1">vs last {range} days</span>
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-primary shadow-inner shadow-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={data?.totals?.revenue || 0} prefix="৳ " />
            </h3>
            <p className="text-sm font-medium">
              <span className={`font-bold px-2 py-0.5 rounded-md ${(data?.changes?.revenue || 0) >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                {(data?.changes?.revenue || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.changes?.revenue || 0)}%
              </span> 
              <span className="text-gray-400 ml-1">vs last {range} days</span>
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-primary shadow-inner shadow-white">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Customers</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={data?.totals?.customers || 0} />
            </h3>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-[180px] hover:-translate-y-1 transition-transform duration-300 cursor-default">
          <div className="flex items-start justify-between">
            <div className="kpi-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-primary shadow-inner shadow-white">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
            <h3 className="text-3xl font-black text-[#1a2b4b] mb-2 tracking-tight">
              <AnimatedNumber value={data?.totals?.products || 0} />
            </h3>
            <p className="text-sm font-medium text-gray-400">In Stock: <span className="text-gray-600 font-bold">{data?.totals?.inStockProducts || 0}</span></p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION GRID */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="2xl:col-span-2 space-y-6 dashboard-item">
          
          {/* Sales Overview */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-[#1a2b4b]">Sales Overview</h2>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button onClick={() => { setRange('7'); setSelectedDate(''); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${range === '7' && !selectedDate ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>7 Days</button>
                <button onClick={() => { setRange('30'); setSelectedDate(''); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${range === '30' && !selectedDate ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>30 Days</button>
                <button onClick={() => { setRange('90'); setSelectedDate(''); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${range === '90' && !selectedDate ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>90 Days</button>
              </div>
            </div>
            <SalesChart data={data?.salesChartData} />
          </div>

          {/* Recent Orders */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ListOrdered className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-[#1a2b4b]">Recent Orders</h2>
              </div>
              <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
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
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary ml-auto transition-colors" />
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
            <OrderStatusChart data={data?.orderStatuses} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
            <h2 className="text-lg font-bold text-[#1a2b4b] mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Add Product</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Manage Orders</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Add Category</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UsersRound className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">View Customers</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Create Coupon</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700">Check Reports</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* 4. INVENTORY & TOP SELLING GRID */}
      <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
        
        {/* Inventory Overview (Span 3) */}
        <div className="2xl:col-span-3 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dashboard-item">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-[#1a2b4b]">Inventory Overview</h2>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline whitespace-nowrap shrink-0">
              Manage Inventory <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Chart Area */}
            <div className="lg:w-1/2">
              <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Stock by Category</h3>
              <InventoryChart data={data?.inventoryData} />
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
              <button className="text-primary text-[11px] font-bold uppercase hover:underline flex items-center gap-1">View All <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-5">
              {topSelling.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">৳ {item.price.toLocaleString()} • {item.sold} sold</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
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
                <button className="bg-primary hover:bg-primary/90 text-white w-full py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Create Campaign
                </button>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
