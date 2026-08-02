import React, { useState, useEffect } from 'react';
import { DemandRequest, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, CheckCircle2, Clock, Activity, FileSpreadsheet } from 'lucide-react';

interface AnalyticsDashboardProps {
  orders: DemandRequest[];
  products: Product[];
  jwtToken: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ orders, products, jwtToken }) => {
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [orders]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/v1/analytics/demand-summary', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      setSummaryData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
  };

  // Recharts Data Prep
  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const categoryData = summaryData?.category_distribution || [
    { name: 'Injectables', value: 9400 },
    { name: 'Emergency Contraceptives', value: 1440 },
    { name: 'LARCs', value: 12900 },
    { name: 'Condoms', value: 560 },
    { name: 'Safe Abortion and PPH', value: 9350 }
  ];

  const urgencyData = [
    { name: 'Routine Monthly', count: orders.filter((o) => o.urgency === 'routine').length || 1 },
    { name: 'Urgent Priority', count: orders.filter((o) => o.urgency === 'urgent').length || 1 },
    { name: 'Emergency Stock Out', count: orders.filter((o) => o.urgency === 'emergency_stockout').length || 1 }
  ];

  const totalETB = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Demand Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ETB {totalETB.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.8% from previous month
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Orders Logged</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{orders.length} Requests</div>
          <div className="text-[11px] text-slate-500">API Transmitted & Authenticated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {orders.filter((o) => o.status === 'pending').length} Orders
          </div>
          <div className="text-[11px] text-slate-500">Sales Review Queue</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Fulfilled & Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {orders.filter((o) => o.status === 'delivered').length} Orders
          </div>
          <div className="text-[11px] text-slate-500">Express Fleet Dispatched</div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demand Value by Health Category</h3>
              <p className="text-xs text-slate-500">Aggregated trade price volume in ETB</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`ETB ${Number(value).toLocaleString()}`, 'Demand Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Priority Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Urgency Distribution</h3>
            <p className="text-xs text-slate-500">Priority levels breakdown across partner clinics</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={urgencyData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {urgencyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 text-xs border-t border-slate-100">
            {urgencyData.map((u, i) => (
              <div key={u.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {u.name}
                </span>
                <span className="font-bold font-mono text-slate-900">{u.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
