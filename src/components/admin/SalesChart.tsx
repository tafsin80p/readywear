"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Aug 17', sales: 22000 },
  { name: 'Aug 18', sales: 38000 },
  { name: 'Aug 19', sales: 35000 },
  { name: 'Aug 20', sales: 52000 },
  { name: 'Aug 21', sales: 42000 },
  { name: 'Aug 22', sales: 45000 },
  { name: 'Aug 23', sales: 62000 },
];

export function SalesChart() {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5426A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#F5426A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}K`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`৳ ${Number(value).toLocaleString()}`, 'Sales']}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="#F5426A" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSales)" 
            activeDot={{ r: 6, fill: '#F5426A', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
