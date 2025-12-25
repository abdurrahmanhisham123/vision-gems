import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, User, 
  DollarSign, Globe, Building2, 
  Info, Briefcase, ChevronRight, X, Edit, 
  Trash2, Save, Wallet, Layers, ArrowRight,
  TrendingUp, Percent, Coins, ShieldCheck, Download
} from 'lucide-react';

interface PurchaseEntry {
  id: string;
  type: 'purchase';
  date: string;
  name: string;
  usdAmount: number;
  slRate: number;
  rsAmount: number;
}

interface ExchangeEntry {
  id: string;
  type: 'exchange';
  date: string;
  name: string;
  usdAmount: number;
  slRate: number;
  rsAmount: number;
  ksRate: number;
  kshAmount: number;
}

interface ShareEntry {
  id: string;
  label: string;
  usdEach: number;
  rsEach: number;
  shiEach: number;
}

const MOCK_PURCHASES: PurchaseEntry[] = [
  { id: 'p-1', type: 'purchase', date: '2024-11-10', name: 'Ziyam', usdAmount: 5000, slRate: 302.50, rsAmount: 1512500 },
  { id: 'p-2', type: 'purchase', date: '2024-11-15', name: 'Rimsan', usdAmount: 3200, slRate: 301.20, rsAmount: 963840 },
];

const MOCK_EXCHANGES: ExchangeEntry[] = [
  { id: 'e-1', type: 'exchange', date: '2024-11-12', name: 'Nairobi Ex', usdAmount: 2500, slRate: 300.00, rsAmount: 750000, ksRate: 129.50, kshAmount: 323750 },
  { id: 'e-2', type: 'exchange', date: '2024-11-18', name: 'Mombasa Trans', usdAmount: 4000, slRate: 301.50, rsAmount: 1206000, ksRate: 128.80, kshAmount: 515200 },
];

const MOCK_SHARES: ShareEntry[] = [
  { id: 's-1', label: 'Partner A (Main)', usdEach: 15000, rsEach: 4500000, shiEach: 1942500 },
  { id: 's-2', label: 'Partner B (Kenya)', usdEach: 15000, rsEach: 4500000, shiEach: 1942500 },
];

const DetailPanel: React.FC<{
  item: PurchaseEntry | ExchangeEntry | null;
  onClose: () => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, isReadOnly }) => {
  if (!item) return null;
  const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                item.type === 'purchase' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {item.type === 'purchase' ? 'USD Purchase' : 'USD Exchange'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{item.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} className="text-gem-purple" /> General Info
            </h3>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4 text-sm font-bold text-stone-800">
              <div className="flex justify-between"><span>Date</span><span>{item.date}</span></div>
              <div className="flex justify-between"><span>Entity</span><span>{item.name}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Globe size={14} className="text-gem-purple" /> Financial Summary
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex justify-between items-end">
                <div><div className="text-[9px] text-stone-400 font-bold uppercase mb-1">USD Amount</div><div className="text-2xl font-bold text-stone-900">$ {fmt(item.usdAmount)}</div></div>
                <div className="text-right"><div className="text-[9px] text-stone-400 font-bold uppercase mb-1">Rate</div><div className="text-sm font-bold text-stone-600">{item.slRate.toFixed(2)}</div></div>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <div className="text-[9px] text-stone-400 font-bold uppercase mb-1 text-gem-purple">Final LKR Value</div>
                <div className="text-2xl font-bold text-gem-purple">LKR {fmt(item.rsAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const KenyaCapitalTemplate: React.FC<{ isReadOnly?: boolean }> = ({ isReadOnly }) => {
  const [purchases] = useState<PurchaseEntry[]>(MOCK_PURCHASES);
  const [exchanges] = useState<ExchangeEntry[]>(MOCK_EXCHANGES);
  const [shares] = useState<ShareEntry[]>(MOCK_SHARES);
  const [selectedItem, setSelectedItem] = useState<PurchaseEntry | ExchangeEntry | null>(null);

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 mt-8 flex items-center gap-2 ml-2">
      <div className="w-1 h-4 bg-gem-gold rounded-full"></div>
      {title}
    </h3>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Kenya <span className="text-stone-300">/</span> Capital
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Capital Management</h2>
           <p className="text-stone-500 text-sm mt-1">Official tracking for capital injections and settlements</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
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
               placeholder="Search entries..." 
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
        <SectionHeader title="$ Purchased" />
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <th className="p-5 pl-8">Date</th>
                <th className="p-5">Name</th>
                <th className="p-5 text-right">$ Amount</th>
                <th className="p-5 text-right $ Rate">$ Rate</th>
                <th className="p-5 text-right pr-10">Rs Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {purchases.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                  <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                  <td className="p-5 font-bold text-stone-800">{item.name}</td>
                  <td className="p-5 text-right font-bold text-stone-700">$ {item.usdAmount.toLocaleString()}</td>
                  <td className="p-5 text-right font-mono text-stone-500">{item.slRate.toFixed(2)}</td>
                  <td className="p-5 text-right pr-10 font-bold text-gem-purple text-base">
                     {item.rsAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionHeader title="$ Exchange" />
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <th className="p-5 pl-8">Date</th>
                <th className="p-5">Name</th>
                <th className="p-5 text-right text-stone-500">$ Amount</th>
                <th className="p-5 text-right">$ KS Rate</th>
                <th className="p-5 text-right pr-10">K Shilling (KSh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {exchanges.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer">
                  <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                  <td className="p-5 font-bold text-stone-800">{item.name}</td>
                  <td className="p-5 text-right font-bold text-stone-700">$ {item.usdAmount.toLocaleString()}</td>
                  <td className="p-5 text-right font-mono text-stone-500">{item.ksRate.toFixed(2)}</td>
                  <td className="p-5 text-right pr-10 font-bold text-amber-600 text-base">
                     {item.kshAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
         <DetailPanel item={selectedItem} isReadOnly={isReadOnly} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};