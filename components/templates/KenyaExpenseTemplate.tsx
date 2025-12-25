import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, X, DollarSign, 
  Wallet, ChevronRight, Info, Save,
  ArrowRight, Calculator, Building2, Download
} from 'lucide-react';

interface KenyaExpenseItem {
  id: string;
  date: string;
  description: string;
  kshAmount: number;
}

const MOCK_DATA: KenyaExpenseItem[] = [
  { id: 'ke-1', date: '2024-11-20', description: 'Local Office Rent - November Settlement', kshAmount: 85000 },
  { id: 'ke-2', date: '2024-11-22', description: 'Nairobi to Voi Transport (Diesel & Driver)', kshAmount: 12400 },
  { id: 'ke-3', date: '2024-11-25', description: 'Mining Site Water Supply & Refreshments', kshAmount: 4500 }
];

const ExpenseDetailPanel: React.FC<{
  item: KenyaExpenseItem;
  onClose: () => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, isReadOnly }) => {
  const fmt = (val: number) => val.toLocaleString();
  const lkrRate = 2.32; 
  const lkrAmount = item.kshAmount * lkrRate;

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-red-50 text-red-700 border-red-200">
                LOCAL EXPENSE
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">K-LOG</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight leading-tight">{item.description}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} className="text-red-500" /> Record Details
            </h3>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <div className="text-[9px] text-stone-400 font-bold uppercase mb-0.5">Date</div>
                <div className="text-sm font-bold text-stone-800">{item.date}</div>
              </div>
              <div>
                <div className="text-[9px] text-stone-400 font-bold uppercase mb-0.5">Description</div>
                <div className="text-sm font-medium text-stone-700 italic">"{item.description}"</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Calculator size={14} className="text-red-500" /> Financial Value
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
               <div><div className="text-[9px] text-stone-400 font-bold uppercase mb-1">Amount KSh</div><div className="text-2xl font-bold text-stone-900">{fmt(item.kshAmount)}</div></div>
               <div className="pt-4 border-t border-stone-100">
                  <div className="text-[9px] text-red-500 font-bold uppercase mb-1">Equivalent LKR</div>
                  <div className="text-2xl font-bold text-red-600">LKR {fmt(Math.floor(lkrAmount))}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 z-10">
           {!isReadOnly && (
             <button className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                <Edit size={16} /> Edit Entry
             </button>
           )}
        </div>
      </div>
    </>
  );
};

export const KenyaExpenseTemplate: React.FC<{ isReadOnly?: boolean }> = ({ isReadOnly }) => {
  const [items] = useState<KenyaExpenseItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<KenyaExpenseItem | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.description.toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Kenya <span className="text-stone-300">/</span> KExpenses
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Local Expenses</h2>
           <p className="text-stone-500 text-sm mt-1">{filteredItems.length} records found</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> New Expense
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search description..." 
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

      <div className="pb-32">
        <div className="hidden md:block bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <th className="p-5 pl-10">Date</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right pr-10">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredItems.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                  <td className="p-5 pl-10 font-mono text-stone-400 text-xs whitespace-nowrap">{item.date}</td>
                  <td className="p-5 font-bold text-stone-800">{item.description}</td>
                  <td className="p-5 text-right pr-10">
                     <span className="font-bold text-stone-900 group-hover:text-red-600 transition-all inline-block">
                        {item.kshAmount.toLocaleString()}
                     </span>
                     <ChevronRight className="inline-block ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-stone-300" size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
         <ExpenseDetailPanel item={selectedItem} isReadOnly={isReadOnly} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};