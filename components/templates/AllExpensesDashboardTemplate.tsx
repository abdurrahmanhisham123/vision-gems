import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardConfig } from '../../utils/dashboardConfig';
import { getDashboardData } from '../../services/dashboardService';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Download, 
  Wallet, PieChart, ArrowUpRight, ArrowDownRight, 
  CreditCard, Users, Calendar, ArrowRight, Search, FileText, AlertCircle
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';

interface Props {
  config: DashboardConfig;
  moduleId: string;
  tabId: string;
}

export const AllExpensesDashboardTemplate: React.FC<Props> = ({ config, moduleId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getDashboardData(config).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [config]);

  const COLORS = ['#6B46C1', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6'];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="font-medium">Loading Expenses...</p>
      </div>
    );
  }

  const { metrics, breakdowns } = data;

  const navigateToCategory = (tabId: string) => {
    navigate(`/module/${moduleId}/${tabId}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
             Finance Dashboard
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">All Expenses Overview</h2>
          <p className="text-stone-500 text-sm mt-1">Consolidated view of all operational costs, shares, and payables.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all shadow-lg">
             <Download size={16} /> Export Report
           </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-600">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Expenses</div>
                  <div className="text-2xl font-bold text-stone-900">LKR {metrics.totalExpenses?.toLocaleString()}</div>
               </div>
               <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Wallet size={20} /></div>
            </div>
            <div className="text-xs font-medium text-stone-500">Across {metrics.activeCategories} Categories</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Payable</div>
                  <div className="text-2xl font-bold text-amber-600">LKR {metrics.totalPayable?.toLocaleString()}</div>
               </div>
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><CreditCard size={20} /></div>
            </div>
            <div className="text-xs font-medium text-stone-500">Outstanding Balances</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Partner Shares</div>
                  <div className="text-2xl font-bold text-stone-900">LKR {metrics.totalShares?.toLocaleString()}</div>
               </div>
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users size={20} /></div>
            </div>
            <div className="text-xs font-medium text-stone-500">Distributed Capital</div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-2xl font-bold text-blue-600">Active</div>
               </div>
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
            </div>
            <div className="text-xs font-medium text-stone-500">System Healthy</div>
         </div>
      </div>

      {/* 2. Expense Categories Grid */}
      <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
         <Wallet size={20} className="text-stone-400" /> Expense Categories
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
         {breakdowns?.categories?.map((cat: any) => (
            <div 
               key={cat.id} 
               onClick={() => navigateToCategory(cat.id)}
               className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
            >
               <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-stone-900 text-lg group-hover:text-purple-600 transition-colors truncate w-3/4" title={cat.name}>
                     {cat.name}
                  </h4>
                  {cat.trend === 'up' && <ArrowUpRight size={18} className="text-red-500" />}
                  {cat.trend === 'down' && <ArrowDownRight size={18} className="text-emerald-500" />}
                  {cat.trend === 'stable' && <Minus size={18} className="text-stone-300" />}
               </div>
               <div className="mb-4">
                  <div className="text-2xl font-bold text-stone-800 tracking-tight">LKR {cat.amount.toLocaleString()}</div>
                  {cat.payable > 0 && (
                     <div className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> Payable: {cat.payable.toLocaleString()}
                     </div>
                  )}
               </div>
               <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-xs text-stone-400 font-medium">View Details</span>
                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                     <ArrowRight size={12} />
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 3. Partner Shares Chart */}
         <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
               <PieChart size={20} className="text-stone-400" /> Partner Shares
            </h3>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                     <Pie
                        data={breakdowns?.shares}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                     >
                        {breakdowns?.shares?.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        formatter={(val: number) => `LKR ${val.toLocaleString()}`}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                     />
                  </RePieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                     <div className="text-xs font-bold text-stone-400 uppercase">Total Shares</div>
                     <div className="text-xl font-bold text-stone-800">100%</div>
                  </div>
               </div>
            </div>
            <div className="mt-6 space-y-3">
               {breakdowns?.shares?.map((share: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                        <span className="text-stone-600">{share.category}</span>
                     </div>
                     <span className="font-bold text-stone-900">LKR {share.amount.toLocaleString()}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Recent Expenses Table */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <FileText size={20} className="text-stone-400" /> Recent Activity
               </h3>
               <button className="text-sm font-medium text-purple-600 hover:text-purple-700">View All</button>
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs font-bold text-stone-500 uppercase">
                     <tr>
                        <th className="p-4 w-32">Date</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                     {breakdowns?.recent?.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                           <td className="p-4 text-stone-500 font-mono text-xs flex items-center gap-2">
                              <Calendar size={12} /> {item.date}
                           </td>
                           <td className="p-4">
                              <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-bold border border-stone-200">
                                 {item.category}
                              </span>
                           </td>
                           <td className="p-4 text-stone-700 font-medium">{item.description}</td>
                           <td className="p-4 text-right font-bold text-stone-900">LKR {item.amount.toLocaleString()}</td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                 item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                 {item.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

      </div>
    </div>
  );
};