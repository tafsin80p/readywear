"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart2, 
  Users, 
  Eye, 
  TrendingUp, 
  Key, 
  FileText, 
  AlertCircle,
  Copy,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import toast from "react-hot-toast";

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      
      if (json.setupRequired) {
        setSetupRequired(true);
      } else if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (setupRequired) {
    return (
      <div className="w-full p-6 space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-10 mt-8">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
            <BarChart2 className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Setup Google Analytics Dashboard</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            To view live visitor statistics directly in your admin panel, you need to connect the Google Analytics Data API using a Service Account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Step-by-Step Setup Guide
            </h2>
          </div>
          
          <div className="p-6 space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Create a Google Cloud Project & Enable API</h3>
                <p className="text-sm text-gray-600 mb-3">Go to Google Cloud Console, create a new project, and enable the <b>Google Analytics Data API</b>.</p>
                <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Open Google Cloud Console <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Create a Service Account & Download Key</h3>
                <p className="text-sm text-gray-600 mb-3">In your Cloud Project, go to <b>IAM & Admin &gt; Service Accounts</b>. Create one, then generate a <b>JSON Key</b> and download it.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Add Service Account to Google Analytics</h3>
                <p className="text-sm text-gray-600 mb-3">Open the downloaded JSON file and copy the <code>client_email</code>. Go to your Google Analytics (analytics.google.com) &gt; Admin &gt; Property Access Management, and add this email as a <b>Viewer</b>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">4</div>
              <div className="w-full">
                <h3 className="font-bold text-gray-900 mb-2">Add Credentials to Integrations Dashboard</h3>
                <p className="text-sm text-gray-600 mb-4">Go to <span className="font-bold">Settings &gt; Integrations</span> and add the following keys to the Google Analytics section using the details from your downloaded JSON and Google Analytics Property Settings.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-6 border-t border-orange-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800 font-medium leading-relaxed">
              After adding these keys to your Integrations Dashboard and saving, this page will automatically unlock and show your live analytics dashboard!
            </p>
          </div>

        </div>
      </div>
    );
  }

  // Dashboard View (Connected)
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Visitors Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your website traffic and user engagement (Last 7 Days).</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-green-200 shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Connection
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Live Users Card */}
            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex justify-between items-start mb-4 gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5 truncate">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Right Now
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight truncate">{data.liveUsers}</h3>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-50/80 flex items-center justify-center border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap items-center text-[11px] lg:text-xs text-gray-500 gap-2 mt-auto">
                <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-semibold border border-emerald-100 whitespace-nowrap">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
                  Realtime
                </span>
                <span className="font-medium truncate">active on site</span>
              </div>
            </div>

            {/* Visitors Card */}
            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex justify-between items-start mb-4 gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 truncate">Active Visitors</p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight truncate">{data.totals.visitors.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-50/80 flex items-center justify-center border border-blue-100/50 group-hover:bg-blue-100 transition-colors shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap items-center text-[11px] lg:text-xs text-gray-500 gap-2 mt-auto">
                <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-semibold border border-blue-100 whitespace-nowrap">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
                  Historical
                </span>
                <span className="font-medium truncate">from last 7 days</span>
              </div>
            </div>

            {/* Page Views Card */}
            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex justify-between items-start mb-4 gap-2">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-1 truncate">Total Page Views</p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight truncate">{data.totals.pageviews.toLocaleString()}</h3>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-50/80 flex items-center justify-center border border-orange-100/50 group-hover:bg-orange-100 transition-colors shrink-0">
                  <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap items-center text-[11px] lg:text-xs text-gray-500 gap-2 mt-auto">
                <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-md font-semibold border border-orange-100 whitespace-nowrap">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
                  Historical
                </span>
                <span className="font-medium truncate">from last 7 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Traffic Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Daily visitors vs page views for the last 7 days</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-2">
                Last 7 Days
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pageviews" 
                    name="Page Views"
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPageviews)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    name="Visitors"
                    stroke="#2563eb" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
