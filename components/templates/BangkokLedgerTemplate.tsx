import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Building2,
  ChevronRight, ArrowRight, Wallet,
  ShieldCheck, Calculator, CreditCard,
  Printer, Download, Filter, Gem,
  ArrowUpRight, Clock, User,
  AlertTriangle, Globe, Info
} from 'lucide-react';

// --- Types ---

interface BangkokEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  
  // Financial (LKR/RS)
  method: string;       // "Cash / Cheque"
  receivedPayment: number;
  outstandingAmount: number;
  rsAmount: number;
  unitRsAmount: number; // "1 RS Amount"
  
  // Financial (USD/$)
  usdOutstanding: number;
  usdAmount: number;
  usdPercent: number;
  usdAfterPercent: number;
  usdRate: number;
  
  // Financial (THB/Bath)
  bathOutstanding: number;
  bathAmount: number;
  bathPercent: number;
  bathAfterPercent: number;
  bathRate: number;
  
  // Status
  paymentDue: string;
  status: 'Paid' | 'Not Paid' | 'Partial';
  cleared: boolean;
}

// --- Mock Data ---

const INITIAL_DATA: BangkokEntry[] = [
  {
    id: 'bkk-1',
    company: 'Vision Gems',
    date: '2024-11-20',
    code: 'BKK-SPD-01',
    name: 'Sadam BKK',
    description: 'Mixed Spinel Selection',
    weight: 45.2,
    method: 'Bank Transfer',
    receivedPayment: 1500000,
    outstandingAmount: 2500000,
    rsAmount: 4000000,
    unitRsAmount: 88495,
    usdOutstanding: 5000,
    usdAmount: 8000,
    usdPercent: 10,
    usdAfterPercent: 7200,
    usdRate: 300.5,
    bathOutstanding: 150000,
    bathAmount: 250000,
    bathPercent: 5,
    bathAfterPercent: 237500,
    bathRate: 8.4,
    paymentDue: '2024-12-15',
    status: 'Partial',
    cleared: true
  },
  {
    id: 'bkk-2',
    company: 'Spinel Gallery',
    date: '2024-12-05',
    code: 'BKK-TSV-44',
    name: 'Bangkok Trader',
    description: 'Fine Tsavorite Parcel',
    weight: 12.8,
    method: 'Cash',
    receivedPayment: 5000000,
    outstandingAmount: 0,
    rsAmount: 5000000,
    unitRsAmount: 390625,
    usdOutstanding: 0,
    usdAmount: 15000,
    usdPercent: 12,
    usdAfterPercent: 13200,
    usdRate: 298.2,
    bathOutstanding: 0,
    bathAmount: 450000,
    bathPercent: 8,
    bathAfterPercent: 414000,
    bathRate: 8.5,
    paymentDue: '2024-12-10',
    status: 'Paid',
    cleared: true
  },
  {
    id: 'bkk-3',
    company: 'Vision Gems',
    date: '2025-01-10',
    code: 'BKK-RB-102',
    name: 'China Buyer',
    description: 'Ruby Grouping Export',
    weight: 28.4,
    method: 'Cheque',
    receivedPayment: 0,
    outstandingAmount: 8500000,
    rsAmount: 8500000,
    unitRsAmount: 299295,
    usdOutstanding: 25000,
    usdAmount: 25000,
    usdPercent: 15,
    usdAfterPercent: 21250,
    usdRate: 302.0,
    bathOutstanding: 750000,
    bathAmount: 750000,
    bathPercent: 10,
    bathAfterPercent: 675000,
    bathRate: 8.3,
    paymentDue: '2025-02-28',
    status: 'Not Paid',
    cleared: false
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- SIDE PANEL COMPONENT ---
const BangkokDetailPanel: React.FC<{
  item: BangkokEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, onEdit, onDelete, isReadOnly }) => {
  const fmt = (val: number) => val.toLocaleString();

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-100'
              }`}>
                {item.status}
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{item.code}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{item.description}</h2>
            <p className="text-sm text-stone-500 mt-1">Buyer: {item.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30 custom-scrollbar">
          
          {/* Identity & Weight */}
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} /> Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Date</div>
                <div className="text-sm font-bold text-stone-800">{item.date}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Weight</div>
                <div className="text-sm font-bold text-stone-800">{item.weight} ct</div>
              </div>
            </div>
          </div>

          {/* LKR Section */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={16}/> LKR (RS) Settlement
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
               <div>
                  <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Total Amount</div>
                  <div className="text-lg font-bold text-stone-800">Rs {fmt(item.rsAmount)}</div>
               </div>
               <div>
                  <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Received Payment</div>
                  <div className="text-lg font-bold text-emerald-600">Rs {fmt(item.receivedPayment)}</div>
               </div>
               <div>
                  <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Outstanding</div>
                  <div className="text-lg font-bold text-red-600">Rs {fmt(item.outstandingAmount)}</div>
               </div>
               <div>
                  <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Unit Price</div>
                  <div className="text-sm font-medium text-stone-500 italic">Rs {fmt(item.unitRsAmount)} /ct</div>
               </div>
            </div>
          </div>

          {/* USD & THB Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* USD */}
             <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Globe size={16}/> USD Details
                </h3>
                <div className="space-y-3">
                   <div className="flex justify-between">
                      <span className="text-xs text-stone-500">Amount</span>
                      <span className="text-xs font-bold text-stone-800">${fmt(item.usdAmount)}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs text-stone-500">Margin</span>
                      <span className="text-xs font-bold text-stone-800">{item.usdPercent}%</span>
                   </div>
                   <div className="flex justify-between border-t border-blue-100 pt-2">
                      <span className="text-xs font-bold text-blue-700">Owed</span>
                      <span className="text-sm font-black text-blue-800">${fmt(item.usdOutstanding)}</span>
                   </div>
                </div>
             </div>

             {/* THB */}
             <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Wallet size={16}/> THB Details
                </h3>
                <div className="space-y-3">
                   <div className="flex justify-between">
                      <span className="text-xs text-stone-500">Amount</span>
                      <span className="text-xs font-bold text-stone-800">฿{fmt(item.bathAmount)}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-xs text-stone-500">Margin</span>
                      <span className="text-xs font-bold text-stone-800">{item.bathPercent}%</span>
                   </div>
                   <div className="flex justify-between border-t border-emerald-100 pt-2">
                      <span className="text-xs font-bold text-emerald-700">Owed</span>
                      <span className="text-sm font-black text-emerald-800">฿{fmt(item.bathOutstanding)}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 z-10">
           {!isReadOnly && (
             <>
               <button onClick={() => onDelete(item.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
                  Delete
               </button>
               <button onClick={onEdit} className="px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                  <Edit size={16} /> Edit Record
               </button>
             </>
           )}
        </div>
      </div>
    </>
  );
};

export const BangkokLedgerTemplate: React.FC<Props> = ({ isReadOnly, moduleId, tabId }) => {
  const [entries, setEntries] = useState<BangkokEntry[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal State
  const [selectedEntry, setSelectedEntry] = useState<BangkokEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BangkokEntry | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalRS = entries.reduce((sum, e) => sum + e.rsAmount, 0);
    const totalUSD = entries.reduce((sum, e) => sum + e.usdAmount, 0);
    const totalBath = entries.reduce((sum, e) => sum + e.bathAmount, 0);
    const totalOwedLKR = entries.reduce((sum, e) => sum + e.outstandingAmount, 0);
    return { totalRS, totalUSD, totalBath, totalOwedLKR, count: entries.length };
  }, [entries]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    return entries.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery, filterStatus]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this Bangkok ledger record?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    }
  };

  const handleSave = (item: BangkokEntry) => {
    if (editingItem) {
      setEntries(prev => prev.map(e => e.id === item.id ? item : e));
    } else {
      setEntries(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const fmt = (val: number) => (val || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Standard Header UI */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Outstanding <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Bangkok Operations</h2>
           <p className="text-stone-500 max-w-xl">Multi-currency ledger for Bangkok sales tracking LKR, USD, and THB settlements.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
           <div className="flex-1 min-w-[160px] bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Calculator size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Sales</div>
                 <div className="text-xl font-bold text-stone-800">LKR {fmt(stats.totalRS)}</div>
              </div>
           </div>
           <div className="flex-1 min-w-[160px] bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <Globe size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">USD Total</div>
                 <div className="text-xl font-bold text-blue-600">${fmt(stats.totalUSD)}</div>
              </div>
           </div>
           <div className="flex-1 min-w-[160px] bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <Wallet size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Bath Total</div>
                 <div className="text-xl font-bold text-emerald-600">฿{fmt(stats.totalBath)}</div>
              </div>
        </div>
      </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm mb-10 flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code, description, or buyer..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
         
         <div className="flex gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl shadow-sm shrink-0">
               <Filter size={16} className="text-stone-400" />
               <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-sm font-bold text-stone-600 outline-none cursor-pointer"
               >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Not Paid">Not Paid</option>
                  <option value="Partial">Partial</option>
               </select>
            </div>
            
            <button className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 shadow-sm transition-all shrink-0">
               <Download size={18} />
            </button>

            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
               >
                  <Plus size={18} /> New Entry
               </button>
            )}
         </div>
      </div>

      {/* Main Content */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
         {filteredData.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedEntry(item)}
               className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                     <h3 className="font-bold text-stone-900 text-lg leading-tight">{item.description}</h3>
                     <span className="text-xs text-stone-500 font-medium">Buyer: {item.name}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                     item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                     item.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                     'bg-red-50 text-red-700 border-red-100'
                  }`}>
                     {item.status}
                  </span>
               </div>
               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-6 bg-stone-50/50 p-4 rounded-2xl">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Code</span>
                     <span className="font-mono text-stone-800 font-bold">{item.code}</span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">LKR Total</span>
                     <span className="font-bold text-stone-900">{fmt(item.rsAmount)}</span>
                  </div>
               </div>
               <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">LKR Outstanding</div>
                  <div className={`text-2xl font-bold ${item.outstandingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                     {fmt(item.outstandingAmount)}
                     {item.outstandingAmount === 0 && <CheckCircle size={20} className="inline ml-1" />}
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="hidden xl:block bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-6 pl-10">Company</th>
                     <th className="p-6">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Buyer</th>
                     <th className="p-6">Description</th>
                     <th className="p-6 text-right">LKR Total</th>
                     <th className="p-6 text-center">Status</th>
                     {!isReadOnly && <th className="p-6 w-24"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredData.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedEntry(item)}
                        className="hover:bg-purple-50/10 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10">
                           <span className="font-bold text-[10px] text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 uppercase tracking-wide whitespace-nowrap">
                              {item.company}
                           </span>
                        </td>
                        <td className="p-6 font-mono text-stone-500 whitespace-nowrap flex items-center gap-2">
                           <Calendar size={14} className="text-stone-300" />
                           {item.date}
                        </td>
                        <td className="p-6 font-mono text-stone-700 font-bold">{item.code}</td>
                        <td className="p-6 font-bold text-stone-800">{item.name}</td>
                        <td className="p-6 text-stone-600 truncate max-w-xs">{item.description}</td>
                        <td className="p-6 text-right font-bold text-stone-900 text-lg">
                           LKR {fmt(item.rsAmount)}
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              item.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              'bg-red-50 text-red-700 border-red-100'
                           }`}>
                              {item.status}
                           </span>
                        </td>
                        {!isReadOnly && (
                           <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                 <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </div>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {selectedEntry && (
         <BangkokDetailPanel 
            item={selectedEntry}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedEntry(null)}
            onEdit={() => { setEditingItem(selectedEntry); setIsFormOpen(true); setSelectedEntry(null); }}
            onDelete={handleDelete}
         />
      )}

      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <div>
                     <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Bangkok Entry' : 'New Bangkok Transaction'}</h3>
                     <p className="text-stone-500 text-xs mt-1">Multi-currency financial input</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const rsAmount = Number(formData.get('rsAmount'));
                  const received = Number(formData.get('receivedPayment'));
                  const newItem: BangkokEntry = {
                     id: editingItem?.id || `bkk-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     method: formData.get('method') as string,
                     receivedPayment: received,
                     outstandingAmount: rsAmount - received,
                     rsAmount: rsAmount,
                     unitRsAmount: Number(formData.get('unitRsAmount')),
                     usdAmount: Number(formData.get('usdAmount')),
                     usdOutstanding: Number(formData.get('usdOutstanding')),
                     usdPercent: Number(formData.get('usdPercent')),
                     usdAfterPercent: Number(formData.get('usdAfterPercent')),
                     usdRate: Number(formData.get('usdRate')),
                     bathAmount: Number(formData.get('bathAmount')),
                     bathOutstanding: Number(formData.get('bathOutstanding')),
                     bathPercent: Number(formData.get('bathPercent')),
                     bathAfterPercent: Number(formData.get('bathAfterPercent')),
                     bathRate: Number(formData.get('bathRate')),
                     paymentDue: formData.get('paymentDue') as string,
                     status: received >= rsAmount ? 'Paid' : received > 0 ? 'Partial' : 'Not Paid',
                     cleared: formData.get('cleared') === 'on'
                  };
                  handleSave(newItem);
               }}>
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Company</label><input name="company" type="text" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" /></div>
                        <div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Date</label><input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" /></div>
                        <div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Code</label><input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" placeholder="BKK-..." /></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Buyer Name</label><input name="name" type="text" defaultValue={editingItem?.name} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold" /></div>
                        <div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Description</label><input name="description" type="text" defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" /></div>
                     </div>
                     <div className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100"><h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={14}/> LKR (RS) Details</h4><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1.5">Weight (ct)</label><input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm" /></div><div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1.5">RS Amount</label><input name="rsAmount" type="number" defaultValue={editingItem?.rsAmount} className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm font-bold" /></div><div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1.5">Received Payment</label><input name="receivedPayment" type="number" defaultValue={editingItem?.receivedPayment} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700" /></div><div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1.5">Method</label><input name="method" type="text" defaultValue={editingItem?.method || 'Cash'} className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm" placeholder="Cash/Cheque" /></div></div></div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end"><div><label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Payment Due Date</label><input name="paymentDue" type="date" defaultValue={editingItem?.paymentDue} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" /></div><div className="flex items-center gap-2 p-3 bg-stone-100 rounded-xl h-[46px]"><input name="cleared" type="checkbox" defaultChecked={editingItem?.cleared} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" /><label className="text-sm font-bold text-stone-700">Bank Cleared?</label></div></div>
                  </div>
                  <div className="flex justify-end gap-3 mt-10"><button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button><button type="submit" className="px-10 py-3 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2"><Save size={18} /> Save Record</button></div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};