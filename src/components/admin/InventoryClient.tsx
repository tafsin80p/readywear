"use client";

import React, { useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Plus, Filter, AlertCircle, CheckCircle2, XCircle, PieChart, BarChart3 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  PieChart as RechartsPieChart, Pie, Legend,
  AreaChart, Area
} from "recharts";

interface Product {
  _id: string;
  name: string;
  sku: string;
  images: string[];
  stock: number;
  price: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  updatedAt: string;
}

export default function InventoryClient({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<"All" | "Low" | "Out">("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const lowStockThreshold = 10;
  const maxStockForGauge = 50; // Threshold for a "full" visual gauge

  // Filter products by stock status
  const lowStockProductList = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold);
  const outOfStockProductList = products.filter(p => p.stock <= 0);

  // Unique categories for the filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || "Uncategorized"));
    return ["All", ...Array.from(cats)];
  }, [products]);

  // Compute Metrics & Chart Data using useMemo for performance
  const { 
    totalProducts, 
    totalInventoryValue,
    totalStockUnits,
    lowStockItems, 
    outOfStockItems,
    inStockItems,
    stockData,
    trendData
  } = useMemo(() => {
    let lowStock = 0;
    let outOfStock = 0;
    let inStock = 0;
    
    const categoryStockMap: Record<string, { products: number, stock: number }> = {};

    products.forEach(p => {
      // Stock metrics
      if (p.stock <= 0) outOfStock++;
      else if (p.stock <= lowStockThreshold) lowStock++;
      else inStock++;

      // Category metrics
      const cat = p.category || "Uncategorized";
      if (!categoryStockMap[cat]) categoryStockMap[cat] = { products: 0, stock: 0 };
      categoryStockMap[cat].products += 1;
      categoryStockMap[cat].stock += p.stock;
    });

    // Format for Recharts PieChart
    const formattedStockData = [
      { name: 'In Stock', value: inStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Format for AreaChart, sorted to create a nice visual curve
    const trendData = Object.keys(categoryStockMap)
      .map(key => ({ 
        name: key, 
        stock: categoryStockMap[key].stock,
        products: categoryStockMap[key].products
      }))
      .sort((a, b) => b.stock - a.stock);

    return {
      totalProducts: products.length,
      totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      totalStockUnits: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      inStockItems: inStock,
      stockData: formattedStockData,
      trendData
    };
  }, [products]);
  
  // Filter for the table
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cat = p.category || "Uncategorized";
    const matchesCategory = selectedCategory === "All" || cat === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "Low") matchesStock = p.stock > 0 && p.stock <= lowStockThreshold;
    if (stockFilter === "Out") matchesStock = p.stock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Fast, subtle professional animation
  useGSAP(() => {
    gsap.fromTo(".fade-in-section", 
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-[#f6f6f7] min-h-screen pb-12 font-sans">
      
      {/* Header */}
      <div className="fade-in-section px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product stock, categories, and analytics.</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="px-8 space-y-6">
        
        {/* Advanced Metric Cards */}
        <div className="fade-in-section grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total Products Overview */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Inventory Summary</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
                  <p className="text-2xl font-black text-gray-900">{totalProducts} <span className="text-sm font-medium text-gray-500">items</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Units</p>
                    <p className="text-lg font-bold text-gray-900">{totalStockUnits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-lg font-bold text-blue-600">৳ {(totalInventoryValue / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 2: Low Stock Alert with Mini List */}
          <div className={`bg-white rounded-xl p-0 border shadow-sm flex flex-col h-full overflow-hidden transition-all ${stockFilter === "Low" ? "border-amber-400 ring-4 ring-amber-50" : "border-gray-200"}`}>
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Low Stock</h3>
                    <p className="text-xs font-medium text-amber-600">{lowStockItems} items running low</p>
                  </div>
                </div>
                <button 
                  onClick={() => setStockFilter(stockFilter === "Low" ? "All" : "Low")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${stockFilter === "Low" ? "bg-amber-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {stockFilter === "Low" ? "Clear Filter" : "View All"}
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 bg-white">
              {lowStockProductList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium">No low stock items</div>
              ) : (
                <ul className="space-y-3">
                  {lowStockProductList.slice(0, 3).map(product => (
                    <li key={product._id} className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                        {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <Package className="w-4 h-4 m-2 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-amber-600 font-bold">{product.stock} left in stock</p>
                      </div>
                    </li>
                  ))}
                  {lowStockItems > 3 && (
                    <li className="text-xs font-semibold text-gray-400 text-center pt-2">+{lowStockItems - 3} more items</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          
          {/* Card 3: Out of Stock Alert with Mini List */}
          <div className={`bg-white rounded-xl p-0 border shadow-sm flex flex-col h-full overflow-hidden transition-all ${stockFilter === "Out" ? "border-red-400 ring-4 ring-red-50" : "border-gray-200"}`}>
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 text-red-700 rounded-lg shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Out of Stock</h3>
                    <p className="text-xs font-medium text-red-600">{outOfStockItems} items depleted</p>
                  </div>
                </div>
                <button 
                  onClick={() => setStockFilter(stockFilter === "Out" ? "All" : "Out")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${stockFilter === "Out" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {stockFilter === "Out" ? "Clear Filter" : "View All"}
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 bg-white">
              {outOfStockProductList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium">No out of stock items</div>
              ) : (
                <ul className="space-y-3">
                  {outOfStockProductList.slice(0, 3).map(product => (
                    <li key={product._id} className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                        {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <Package className="w-4 h-4 m-2 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-red-600 font-bold">Needs restock</p>
                      </div>
                    </li>
                  ))}
                  {outOfStockItems > 3 && (
                    <li className="text-xs font-semibold text-gray-400 text-center pt-2">+{outOfStockItems - 3} more items</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>        {/* Analytics Charts */}
        <div className="fade-in-section grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Category Stock Area Chart (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="grid flex-1 gap-1">
                <h3 className="text-base font-semibold text-gray-900">Inventory Volume by Category</h3>
                <p className="text-sm text-gray-500">Visualizing total stock units across different product categories.</p>
              </div>
              <div className="hidden sm:flex px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
                All Categories
              </div>
            </div>
            
            <div className="flex-1 mt-4 min-h-[250px] w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={trendData} 
                    layout="vertical"
                    margin={{ right: 80, left: 0, top: 10, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      hide
                    />
                    <XAxis dataKey="stock" type="number" hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Bar dataKey="stock" name="Total Stock Units" fill="#F5426A" radius={4} barSize={32}>
                      <LabelList
                        dataKey="name"
                        position="insideLeft"
                        offset={12}
                        fill="#ffffff"
                        fontSize={13}
                        fontWeight={600}
                      />
                      <LabelList
                        dataKey="stock"
                        position="right"
                        offset={12}
                        fill="#111827"
                        fontSize={13}
                        fontWeight={700}
                        formatter={(value: number) => `${value} units`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">No category data available</div>
              )}
            </div>
          </div>

          {/* Stock Health Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">Inventory Health</h3>
            </div>
            <div className="h-[250px] w-full relative">
              {stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#111827', fontWeight: 500 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#4b5563' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">No stock data available</div>
              )}
              
              {/* Center text for Donut Chart */}
              {stockData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-2xl font-bold text-gray-900">{totalProducts}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="fade-in-section bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by name, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-shadow"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-900 font-medium">No products found</p>
                      <p className="text-gray-500 text-sm mt-1">Try changing your search filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    // Clean professional stock badges
                    let statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
                    let statusLabel = "In Stock";
                    let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    let gaugeColor = "text-emerald-500";
                    
                    if (product.stock <= 0) {
                      statusIcon = <XCircle className="w-3.5 h-3.5" />;
                      statusLabel = "Out of Stock";
                      statusColor = "bg-red-50 text-red-700 border-red-200";
                      gaugeColor = "text-red-500";
                    } else if (product.stock <= lowStockThreshold) {
                      statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
                      statusLabel = "Low Stock";
                      statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                      gaugeColor = "text-amber-500";
                    }

                    // Gauge Calculations
                    const percentage = Math.min((product.stock / maxStockForGauge) * 100, 100);
                    const radius = 12;
                    const circumference = Math.PI * radius;
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-3">
                          <Link href={`/admin/products/${product._id}`} className="flex items-center gap-3 w-fit">
                            <div className="relative w-10 h-10 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white">
                              {product.images && product.images[0] ? (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                  <Package className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-sm group-hover:underline group-hover:text-blue-600">
                                {product.name}
                              </span>
                              <span className="text-xs text-gray-500">{product.category}</span>
                            </div>
                          </Link>
                        </td>
                        
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-600 font-mono">{product.sku}</span>
                        </td>
                        
                        <td className="px-6 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${statusColor}`}>
                            {statusIcon}
                            {statusLabel}
                          </div>
                        </td>
                        
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-5 overflow-hidden flex items-end justify-center shrink-0">
                              <svg className="w-8 h-8 absolute top-0" viewBox="0 0 32 32">
                                <path
                                  d="M 4 16 A 12 12 0 0 1 28 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  className="text-gray-200"
                                />
                                <path
                                  d="M 4 16 A 12 12 0 0 1 28 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  className={`${gaugeColor} transition-all duration-1000 ease-out`}
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-16">{product.stock} <span className="text-xs font-normal text-gray-500">units</span></span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">৳ {product.price.toLocaleString('en-US')}</span>
                            {product.oldPrice && product.oldPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">৳ {product.oldPrice.toLocaleString('en-US')}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
