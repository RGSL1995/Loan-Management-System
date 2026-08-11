"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const disbursementData = [
  { month: 'Jan', amount: 8.5 },
  { month: 'Feb', amount: 10.2 },
  { month: 'Mar', amount: 9.8 },
  { month: 'Apr', amount: 12.5 },
  { month: 'May', amount: 14.1 },
  { month: 'Jun', amount: 18.4 },
];

const portfolioData = [
  { name: 'Active/Performing', value: 310, color: '#10b981' }, // emerald-500
  { name: 'Pending Disbursement', value: 45, color: '#3b82f6' }, // blue-500
  { name: 'Overdue (SMA)', value: 18, color: '#f59e0b' }, // amber-500
  { name: 'NPA / Default', value: 4, color: '#ef4444' }, // red-500
];

export function DashboardCharts() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[300px] w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-md"></div>;
  }

  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
  const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 / slate-200
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'; // slate-900 / white
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0'; // slate-800 / slate-200

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-[300px]">
      
      {/* Disbursement Area Chart */}
      <div className="flex flex-col h-full">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Disbursement Trends (₹ Lakhs)</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={disbursementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#e2e8f0' : '#000000'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isDark ? '#e2e8f0' : '#000000'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}L`} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: isDark ? '#fff' : '#000' }}
                itemStyle={{ color: isDark ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any) => [`₹${value} Lakhs`, 'Disbursed']}
              />
              <Area type="monotone" dataKey="amount" stroke={isDark ? '#e2e8f0' : '#000000'} strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Health Donut Chart */}
      <div className="flex flex-col h-full">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Portfolio Health (Accounts)</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px', fontSize: '11px', color: isDark ? '#fff' : '#000' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
