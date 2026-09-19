"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  RefreshCw, TrendingUp, ShoppingCart, DollarSign, CheckCircle, 
  CalendarDays, PackageOpen
} from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ReportsClient() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState({
    metrics: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, verifiedRate: 0 },
    trendData: [],
    statusData: [],
    topProducts: []
  });

  useEffect(() => {
    fetchData();
  }, [range]);

  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        ".stagger-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData({
          metrics: json.metrics,
          trendData: json.trendData,
          statusData: json.statusData,
          topProducts: json.topProducts
        });
      } else {
        toast.error("Failed to load report data");
      }
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `৳${val.toLocaleString()}`;

  // Custom Tooltip for AreaChart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg text-sm">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-500 font-medium">{entry.name}:</span>
              <span className="font-bold text-gray-900">
                {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-6 space-y-6" ref={containerRef}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 stagger-item gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your store's performance and sales metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <RefreshCw className="animate-spin w-8 h-8 text-primary" />
        </div>
      ) : (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm stagger-item relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <DollarSign className="w-16 h-16 text-primary" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-primary flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.metrics.totalRevenue)}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm stagger-item relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-16 h-16 text-blue-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.metrics.totalOrders}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm stagger-item relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-16 h-16 text-purple-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-500">Average Order Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.metrics.averageOrderValue)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm stagger-item relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-gray-500">Verified Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.metrics.verifiedRate}%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 stagger-item">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Trend</h3>
              <div className="h-[300px] w-full">
                {data.trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111827" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#111827" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8' }} 
                        tickMargin={10} 
                        tickFormatter={(val) => {
                          const date = new Date(val);
                          return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
                        }}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8' }} 
                        tickFormatter={(val) => `৳${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8' }} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue"
                        stroke="var(--primary)" 
                        strokeWidth={3}
                        fill="url(#fillRevenue)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                      />
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="orders" 
                        name="Orders"
                        stroke="#111827" 
                        strokeWidth={3}
                        fill="url(#fillOrders)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#111827' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">No data available for this period.</div>
                )}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm stagger-item flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
              <div className="flex-1 min-h-[250px] w-full relative">
                {data.statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 600, color: '#111827' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-600 font-medium text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">No status data available.</div>
                )}
                
                {/* Center Label for Donut */}
                {data.statusData.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-[40px]">
                    <span className="text-2xl font-bold text-gray-900">{data.metrics.totalOrders}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm stagger-item overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <PackageOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                <p className="text-xs text-gray-500">Best performers for the selected period.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Units Sold</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topProducts.length > 0 ? (
                    data.topProducts.map((product: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{product.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {product.sold}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-primary">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No product data available for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
