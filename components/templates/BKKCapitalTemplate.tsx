import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, User, FileText, 
  DollarSign, Globe, TrendingUp, Building2, 
  ChevronRight, X, Edit, Trash2, Save, Info, ArrowRight,
  Calculator, Wallet, Download
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface BKKCapitalItem {
  id: string;
  company: string;      
  date: string;         
  name: string;         
  currency: string;     
  slRate: number;       
  rsAmount: number;     
}

const MOCK_DATA: BKKCapitalItem[] = [
  { id: 'cap-1', company: 'Vision Gems', date: '2024-11-20', name: 'Somchai', currency: '$ 8,500', slRate: 302.50, rsAmount: 2571250 },
  { id: 'cap-2', company: 'Spinel Gallery', date: '2024-11-25', name: 'Ananda', currency: '$ 12,000', slRate: 298.20, rsAmount: 3578400 }
];

export const BKKCapitalTemplate: React.FC<{ moduleId: string, tabId: string, isReadOnly?: boolean }> = ({ moduleId, tabId, isReadOnly }) => {
  const [items] = useState<BKKCapitalItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BKKCapitalItem | null>(null);

  const totalLKR = useMemo(() => items.reduce((sum, i) => sum + i.rsAmount, 0), [items]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              BKK Operations <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Capital Ledger</h2>
           <p className="text-stone-500 text-sm mt-1">LKR {totalLKR.toLocaleString()} total capital injected</p>
        </div>
        {!isReadOnly && (
           <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
             <Plus size={18} /> New Entry
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by payer or amount..." 
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
                  <th className="p-5 pl-8">Payer</th>
                  <th className="p-5">Date</th>
                  <th className="p-5 text-right">Currency ($)</th>
                  <th className="p-5 text-right">SL Rate</th>
                  <th className="p-5 text-right pr-10">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {items.map(item => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-bold text-stone-800">{item.name}</td>
                     <td className="p-5 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 text-right font-mono text-blue-600 font-bold">{item.currency}</td>
                     <td className="p-5 text-right font-mono text-stone-500">{item.slRate.toFixed(2)}</td>
                     <td className="p-5 text-right pr-10 font-bold text-emerald-600 text-base">{item.rsAmount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {selectedItem && (
         <DetailModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem.name} subtitle="Capital Injection" status="Funds Received" statusColor="bg-emerald-50 text-emerald-700 border-emerald-100" icon={<Globe size={32} className="text-purple-600" />} data={{'Company': selectedItem.company, 'Date': selectedItem.date, 'USD Amount': selectedItem.currency, 'SL Rate': selectedItem.slRate, 'LKR Total': `Rs ${selectedItem.rsAmount.toLocaleString()}`}} />
      )}
    </div>
  );
};