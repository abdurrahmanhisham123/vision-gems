import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, User, Tag, 
  Scale, Gem, DollarSign, Globe, Building2, 
  Info, Briefcase, ChevronRight, X, Edit, 
  Trash2, Save, CheckCircle, AlertCircle, TrendingUp,
  Wallet, Layers, Download, ShoppingBag, Coins
} from 'lucide-react';

interface KenyaPurchaseItem {
  id: string;
  date: string;         
  code: string;         
  variety: string;      
  supplier: string;     
  weight: number;       
  pieces: number;       
  cost: number;         
  status: 'Paid' | 'Not Paid'; 
  kshAmount: number;    
  usdRate: number;      
  usdAmount: number;    
  lkrAmount: number;    
}

const MOCK_DATA: KenyaPurchaseItem[] = [
  {
    id: 'kp-1',
    date: '2024-11-20',
    code: 'K-TS-882',
    variety: 'Tsavorite',
    supplier: 'Pepper Maluki',
    weight: 45.20,
    pieces: 12,
    cost: 850000,
    status: 'Paid',
    kshAmount: 850000,
    usdRate: 129.50,
    usdAmount: 6563.70,
    lkrAmount: 1969110
  },
  {
    id: 'kp-2',
    date: '2024-11-22',
    code: 'K-SP-901',
    variety: 'Pink Spinel',
    supplier: 'Junior',
    weight: 12.80,
    pieces: 1,
    cost: 45000,
    status: 'Not Paid',
    kshAmount: 45000,
    usdRate: 129.50,
    usdAmount: 347.49,
    lkrAmount: 104247
  }
];

const PurchaseDetailPanel: React.FC<{
  item: KenyaPurchaseItem;
  onClose: () => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, isReadOnly }) => {
  const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {item.status}
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">PURCHASE</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{item.code}</h2>
            <p className="text-sm text-stone-500 mt-1">{item.variety} from {item.supplier}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Gem size={14} className="text-gem-purple" /> Stone Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Date', val: item.date },
                { label: 'Variety', val: item.variety },
                { label: 'Weight', val: `${item.weight.toFixed(2)} ct` },
                { label: 'Pieces', val: item.pieces }
              ].map((f, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                  <div className="text-[9px] text-stone-400 font-bold uppercase mb-0.5">{f.label}</div>
                  <div className="text-sm font-bold text-stone-800">{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={14} className="text-gem-purple" /> Financial Breakdown
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase mb-1">Equivalent LKR Amount</div>
                  <div className="text-3xl font-black text-gem-purple">LKR {fmt(item.lkrAmount)}</div>
                </div>
                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs">
                   <div><span className="text-stone-400 block mb-0.5 uppercase font-bold">KSh Amount</span><span className="font-bold text-stone-800">{fmt(item.kshAmount)}</span></div>
                   <div className="text-right"><span className="text-stone-400 block mb-0.5 uppercase font-bold">USD Amount</span><span className="font-bold text-stone-800">${fmt(item.usdAmount)}</span></div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 z-10">
           {!isReadOnly && (
             <button className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                <Edit size={16} /> Edit Record
             </button>
           )}
        </div>
      </div>
    </>
  );
};

export const KenyaPurchasingTemplate: React.FC<{ isReadOnly?: boolean }> = ({ isReadOnly }) => {
  const [items] = useState<KenyaPurchaseItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<KenyaPurchaseItem | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.code.toLowerCase().includes(q) || item.variety.toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Kenya <span className="text-stone-300">/</span> Purchasing
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Procurement Log</h2>
           <p className="text-stone-500 text-sm mt-1">{filteredItems.length} purchases recorded</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> New Entry
           </button>
        )}
      </div>

      {/* Stats - Consolidated in top card style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gem-purple/10 text-gem-purple"><Wallet size={20} /></div>
            <div><div className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Total LKR</div><div className="text-xl font-bold text-stone-900">{filteredItems.reduce((s,i)=>s+i.lkrAmount,0).toLocaleString()}</div></div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 text-amber-600">
            <div className="p-3 rounded-xl bg-amber-50"><Globe size={20} /></div>
            <div><div className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Total KSh</div><div className="text-xl font-bold text-stone-900">{filteredItems.reduce((s,i)=>s+i.kshAmount,0).toLocaleString()}</div></div>
         </div>
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search records..." 
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
                <th className="p-5 pl-8">Date</th>
                <th className="p-5">Code No.</th>
                <th className="p-5">Variety</th>
                <th className="p-5">Supplier</th>
                <th className="p-5 text-right pr-10">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredItems.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                  <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                  <td className="p-5 font-bold text-stone-700">{item.code}</td>
                  <td className="p-5 font-bold text-stone-900">{item.variety}</td>
                  <td className="p-5 text-stone-600">{item.supplier}</td>
                  <td className="p-5 text-right pr-10 font-bold text-stone-900">
                     {item.lkrAmount.toLocaleString()}
                     <ChevronRight className="inline-block ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-stone-300" size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
         <PurchaseDetailPanel item={selectedItem} isReadOnly={isReadOnly} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};