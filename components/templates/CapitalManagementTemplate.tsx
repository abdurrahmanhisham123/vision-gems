import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Wallet, Users, 
  TrendingUp, TrendingDown, ArrowRight, BarChart2,
  MoreHorizontal, Building2, Globe, Info, CreditCard,
  CheckCircle, AlertTriangle, ChevronRight
} from 'lucide-react';
import { FinancialConfig } from '../../utils/financialConfig';
import { getFinancialData, USDCapitalTransaction } from '../../services/dataService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: FinancialConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const CapitalManagementTemplate: React.FC<Props> = ({ config, moduleId, tabId, isReadOnly }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    getFinancialData(config).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [config]);

  const stats = useMemo(() => {
    const totalUSD = data.reduce((sum, t) => sum + (t.usdAmount || 0), 0);
    const totalLKR = data.reduce((sum, t) => sum + (t.rsAmount || 0), 0);
    return { totalUSD, totalLKR };
  }, [data]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Capital Ledger</h2>
           <p className="text-stone-500 text-sm mt-1">LKR {stats.totalLKR.toLocaleString()} total capital injection</p>
        </div>
        {!isReadOnly && (
           <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
             <Plus size={18} /> Add Entry
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search ledger..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0">
               <Download size={18} />
            </button>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-32">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 pl-8">Date</th>
                  <th className="p-5">Vendor</th>
                  <th className="p-5 text-right">USD Amount</th>
                  <th className="p-5 text-right">Rate</th>
                  <th className="p-5 text-right pr-10">LKR Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {data.map(item => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-bold text-stone-900">{item.name}</td>
                     <td className="p-5 text-right font-mono font-bold text-blue-600">${item.usdAmount.toLocaleString()}</td>
                     <td className="p-5 text-right font-mono text-stone-400">{item.slRate}</td>
                     <td className="p-5 text-right pr-10 font-bold text-stone-900">{item.rsAmount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {selectedItem && (
         <DetailModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem.name} subtitle={selectedItem.description} status="Capital Injected" statusColor="bg-blue-50 text-blue-700 border-blue-100" icon={<Globe size={32} className="text-purple-600" />} data={{'Date': selectedItem.date, 'Amount USD': `$${selectedItem.usdAmount.toLocaleString()}`, 'Rate': selectedItem.slRate, 'Total LKR': `Rs ${selectedItem.rsAmount.toLocaleString()}`}} />
      )}
    </div>
  );
};