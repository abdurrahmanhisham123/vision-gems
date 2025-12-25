import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingDown, TrendingUp, Users, 
  MapPin, Calendar, ArrowRight, Building2, 
  Wallet, PieChart, BarChart2, Filter, Download,
  CheckCircle, AlertCircle, Plus, RefreshCw,
  // Added missing ChevronRight import
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend
} from 'recharts';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

const PAYABLE_DATA = {
  stats: {
    totalOwed: 4250000,
    totalPaid: 30413500,
    totalCapital: 39500000,
    activeSuppliers: 14
  },
  locations: [
    { name: 'Kisu (TZ)', owed: 2850000, paid: 26427955, color: '#DC2626' },
    { name: 'Galle (SL)', owed: 850000, paid: 3255000, color: '#F59E0B' },
    { name: 'Beruwala', owed: 310000, paid: 310000, color: '#10B981' },
    { name: 'Colombo', owed: 240000, paid: 0, color: '#6366F1' },
    { name: 'Bangkok', owed: 0, paid: 1125000, color: '#EC4899' },
  ],
  capital: [
    { name: 'Tanzania Capital', amount: 36866882, percent: 85 },
    { name: 'BKK Capital', amount: 6500000, percent: 15 }
  ],
  topCreditors: [
    { name: 'Mashaka', location: 'Kisu', amount: 750000, dueDate: '2024-12-15' },
    { name: 'Juma', location: 'Kisu', amount: 680000, dueDate: '2024-12-18' },
    { name: 'Yusuph', location: 'Kisu', amount: 650000, dueDate: '2024-12-20' },
    { name: 'Abubakkar', location: 'Kisu', amount: 420000, dueDate: '2024-12-22' },
    { name: 'Muhdeen', location: 'Galle', amount: 250000, dueDate: '2024-12-25' }
  ]
};

export const PayableDashboardTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50 space-y-8">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Payable <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Accounts Payable Overview</h2>
           <p className="text-stone-500 text-sm mt-1">LKR {PAYABLE_DATA.stats.totalOwed.toLocaleString()} currently outstanding</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 shadow-sm transition-all"><RefreshCw size={16} /></button>
           {!isReadOnly && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
                <Plus size={18} /> New Bill
              </button>
           )}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><DollarSign size={24} /></div>
               <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">+12%</span>
            </div>
            <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Outstanding</div>
            <div className="text-2xl font-bold text-stone-900">LKR {PAYABLE_DATA.stats.totalOwed.toLocaleString()}</div>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle size={24} /></div>
            </div>
            <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Paid (YTD)</div>
            <div className="text-2xl font-bold text-stone-900">LKR {PAYABLE_DATA.stats.totalPaid.toLocaleString()}</div>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Building2 size={24} /></div>
            </div>
            <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Capital</div>
            <div className="text-2xl font-bold text-stone-900">LKR {PAYABLE_DATA.stats.totalCapital.toLocaleString()}</div>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Users size={24} /></div>
            </div>
            <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">Active Suppliers</div>
            <div className="text-2xl font-bold text-stone-900">{PAYABLE_DATA.stats.activeSuppliers}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <MapPin size={18} className="text-red-500"/> Payable by Location
            </h3>
            <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PAYABLE_DATA.locations} barSize={40}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716C'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716C'}} tickFormatter={(val) => `${val/1000000}M`} />
                     <RechartsTooltip cursor={{fill: '#F5F5F4'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}} />
                     <Bar dataKey="owed" name="Outstanding" stackId="a" fill="#EF4444" radius={[0, 0, 4, 4]} />
                     <Bar dataKey="paid" name="Paid" stackId="a" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <PieChart size={18} className="text-blue-600"/> Capital Split
            </h3>
            <div className="flex-1 relative min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                     <Pie data={PAYABLE_DATA.capital} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount">
                        {PAYABLE_DATA.capital.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#A855F7'} />
                        ))}
                     </Pie>
                     <RechartsTooltip />
                  </RePieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-stone-800">39.5M</span>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col mb-20">
         <div className="p-5 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
            <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
               <Users size={16} className="text-orange-500"/> Top Creditors (Suppliers)
            </h3>
            <button className="text-xs font-bold text-purple-600 hover:underline transition-all">View All Entries</button>
         </div>
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-stone-50 text-xs font-bold text-stone-500 uppercase">
                  <tr>
                     <th className="p-5 pl-8">Supplier</th>
                     <th className="p-5">Location</th>
                     <th className="p-5 text-right">Amount Owed</th>
                     <th className="p-5">Due Date</th>
                     <th className="p-5 w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {PAYABLE_DATA.topCreditors.map((creditor, i) => (
                     <tr key={i} className="hover:bg-stone-50 transition-colors cursor-pointer group">
                        <td className="p-5 pl-8 font-bold text-stone-800">{creditor.name}</td>
                        <td className="p-5 text-xs text-stone-400 font-bold uppercase">{creditor.location}</td>
                        <td className="p-5 text-right font-mono font-bold text-red-600">LKR {creditor.amount.toLocaleString()}</td>
                        <td className="p-5 text-stone-500 text-xs flex items-center gap-1"><Calendar size={12} /> {creditor.dueDate}</td>
                        <td className="p-5 text-right pr-8"><ChevronRight size={18} className="text-stone-300 group-hover:text-purple-600 transition-all"/></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};