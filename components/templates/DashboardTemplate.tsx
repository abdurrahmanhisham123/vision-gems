
import React, { useMemo } from 'react';
import { generateKPIs, generateMockTransactions } from '../../services/dataService';
import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar, ChevronRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  moduleId: string;
  tabId: string;
}

export const DashboardTemplate: React.FC<Props> = ({ moduleId }) => {
  const kpis = useMemo(() => generateKPIs(moduleId.includes('expense') ? 'financial' : 'inventory'), [moduleId]);
  const transactions = useMemo(() => generateMockTransactions(5, 'Income'), []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-stone-900">Dashboard Overview</h2>
           <p className="text-stone-500 text-sm">Real-time insights for {moduleId}</p>
        </div>
        <select className="bg-white border border-stone-200 text-stone-600 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-card border border-stone-200 relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-2">{kpi.label}</div>
            <div className="text-3xl font-bold text-stone-900 tracking-tight mb-3">{kpi.value}</div>
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full w-fit ${kpi.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {kpi.trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(kpi.trend)}% vs last month
            </div>
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-stone-50 to-stone-100 rounded-bl-full -z-10 opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-6">Revenue Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                {name: 'Jan', val: 4000}, {name: 'Feb', val: 3000}, {name: 'Mar', val: 5500}, 
                {name: 'Apr', val: 4800}, {name: 'May', val: 6200}, {name: 'Jun', val: 7800}
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B21A8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6B21A8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A8A29E', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#A8A29E', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#6B21A8" strokeWidth={3} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-6">Activity Breakdown</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {name: 'Mon', val: 24}, {name: 'Tue', val: 13}, {name: 'Wed', val: 98}, 
                {name: 'Thu', val: 39}, {name: 'Fri', val: 48}, {name: 'Sat', val: 38}
              ]}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A8A29E', fontSize: 12}} />
                 <Tooltip cursor={{fill: '#F5F5F4'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                 <Bar dataKey="val" fill="#D97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 flex items-center gap-2"><Activity size={18} className="text-gem-purple" /> Recent Activity</h3>
          <button className="text-sm text-gem-purple font-medium">View All</button>
        </div>
        <div>
          {transactions.map((t, i) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0">
               <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   <DollarSign size={18} />
                 </div>
                 <div>
                   <div className="text-sm font-semibold text-stone-900">{t.description}</div>
                   <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                     <Calendar size={10} /> {t.date} • {t.party}
                   </div>
                 </div>
               </div>
               <div className="text-right">
                 <div className={`text-sm font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-stone-900'}`}>
                   {t.type === 'Expense' ? '-' : '+'}{t.amount.toLocaleString()} LKR
                 </div>
                 <div className="text-[10px] text-stone-400 font-medium">{t.status}</div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
