"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function OrderStatusChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Pending', value: 0, color: '#F5426A' },
    { name: 'Processing', value: 0, color: '#F59E0B' },
    { name: 'Shipped', value: 0, color: '#3B82F6' },
    { name: 'Delivered', value: 0, color: '#10B981' },
    { name: 'Cancelled', value: 0, color: '#ef4444' }
  ];

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full mt-4">
      <div className="relative h-[220px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900 leading-none">{totalOrders.toLocaleString()}</span>
          <span className="text-xs text-gray-500 mt-1">Total Orders</span>
        </div>
      </div>

      {/* Legend below chart to match reference exactly */}
      <div className="mt-4 space-y-3 px-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[13px] text-gray-600 font-medium">{item.name}</span>
            </div>
            <span className="text-[13px] font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
