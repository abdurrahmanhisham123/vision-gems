import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Building2,
  ChevronRight, ArrowRight, Wallet,
  ShieldCheck, Calculator, CreditCard,
  Printer, Download, Filter, Gem,
  ArrowUpRight, Clock, User,
  AlertTriangle, Info, Percent, Tag,
  // Fix: Added missing 'Scale' icon import from lucide-react
  Scale
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---

interface LedgerDeal {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  dealValue: number;      // "Deal" (USD or Foreign)
  rsAmount: number;     // "Rs amount" (LKR)
  marginPercent: number; // "%"
  commission: number;    // "Commission"
  finalAmount: number;   // "Final Amount"
  outstanding: number;   // "Outstanding Amount"
  halfPaid: number;      // "Half Paid"
  dueDate: string;       // "Payment Due Date"
  status: 'Paid' | 'Not Paid' | 'Partial';
  paidDate: string;      // "Payment paid Date"
  method: string;        // "Cash / Cheque"
  cleared: boolean;      // "Cleared?"
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- SIDE PANEL COMPONENT ---
const LedgerDetailPanel: React.FC<{
  item: LedgerDeal;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, onEdit, onDelete, isReadOnly }) => {
  const fmt = (val: number) => val.toLocaleString();

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {item.status}
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{item.code}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{item.description}</h2>
            <p className="text-sm text-stone-500 mt-1">{item.name} • {item.company}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} /> Deal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Date</div>
                <div className="text-sm font-bold text-stone-800">{item.date}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Weight</div>
                <div className="text-sm font-bold text-stone-800">{item.weight} ct</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Deal Value ($)</div>
                <div className="text-sm font-bold text-stone-800 font-mono">${fmt(item.dealValue)}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Margin</div>
                <div className="text-sm font-bold text-stone-800">{item.marginPercent}%</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Calculator size={14} /> Settlement Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200">
                 <span className="text-sm text-stone-500">LKR Base Amount</span>
                 <span className="text-sm font-bold text-stone-800">LKR {fmt(item.rsAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200">
                 <span className="text-sm text-stone-500">Commission</span>
                 <span className="text-sm font-bold text-stone-800">LKR {fmt(item.commission)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                 <span className="text-sm font-bold text-purple-700">Final Amount</span>
                 <span className="text-lg font-bold text-purple-900">LKR {fmt(item.finalAmount)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Wallet size={14} /> Payment Tracking
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Received (Paid)</div>
                  <div className="text-sm font-bold text-emerald-700">LKR {fmt(item.halfPaid)}</div>
                </div>
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-right">
                  <div className="text-[10px] text-red-600 font-bold uppercase mb-1">Outstanding</div>
                  <div className="text-sm font-bold text-red-700">LKR {fmt(item.outstanding)}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-stone-500 uppercase font-bold">Due Date</span>
                  <span className="text-xs font-bold text-red-600">{item.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-stone-500 uppercase font-bold">Paid Date</span>
                  <span className="text-xs font-bold text-emerald-600">{item.paidDate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-stone-500 uppercase font-bold">Method</span>
                  <span className="text-xs font-bold text-stone-700">{item.method}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-stone-100 rounded-xl w-fit">
                <ShieldCheck size={16} className={item.cleared ? 'text-emerald-500' : 'text-stone-300'} />
                <span className="text-xs font-bold text-stone-600">Bank Cleared: {item.cleared ? 'YES' : 'NO'}</span>
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
                  <Edit size={16} /> Edit Entry
               </button>
             </>
           )}
        </div>
      </div>
    </>
  );
};

export const ZahranLedgerTemplate: React.FC<Props> = ({ isReadOnly, moduleId, tabId }) => {
  // --- Initial Data ---
  const initialData: LedgerDeal[] = useMemo(() => [
    {
      id: `${tabId}-1`,
      company: 'Vision Gems',
      date: '2024-11-20',
      code: 'VG-SPD-01',
      name: tabId,
      description: 'Fine Mahenge Spinel Lot',
      weight: 12.45,
      dealValue: 8500,
      rsAmount: 2550000,
      marginPercent: 12,
      commission: 50000,
      finalAmount: 2600000,
      outstanding: 0,
      halfPaid: 2600000,
      dueDate: '2024-12-05',
      status: 'Paid',
      paidDate: '2024-12-02',
      method: 'Cheque',
      cleared: true
    },
    {
      id: `${tabId}-2`,
      company: 'Spinel Gallery',
      date: '2024-12-10',
      code: 'SG-TSV-44',
      name: tabId,
      description: 'Tsavorite Parcel',
      weight: 25.80,
      dealValue: 12000,
      rsAmount: 3600000,
      marginPercent: 8,
      commission: 75000,
      finalAmount: 3675000,
      outstanding: 1675000,
      halfPaid: 2000000,
      dueDate: '2025-01-15',
      status: 'Partial',
      paidDate: '2024-12-28',
      method: 'Bank Transfer',
      cleared: false
    }
  ], [tabId]);

  const [deals, setDeals] = useState<LedgerDeal[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal/Panel State
  const [selectedDeal, setSelectedDeal] = useState<LedgerDeal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LedgerDeal | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalFinal = deals.reduce((sum, d) => sum + d.finalAmount, 0);
    const totalOwed = deals.reduce((sum, d) => sum + d.outstanding, 0);
    const totalReceived = deals.reduce((sum, d) => sum + d.halfPaid, 0);
    const totalCommission = deals.reduce((sum, d) => sum + d.commission, 0);
    const totalWeight = deals.reduce((sum, d) => sum + d.weight, 0);
    return { totalFinal, totalOwed, totalReceived, totalWeight, totalCommission, count: deals.length };
  }, [deals]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    return deals.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q);
      
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [deals, searchQuery, filterStatus]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    if (confirm('Delete this ledger record?')) {
      setDeals(prev => prev.filter(d => d.id !== id));
      if (selectedDeal?.id === id) setSelectedDeal(null);
    }
  };

  const handleSave = (item: LedgerDeal) => {
    if (editingItem) {
      setDeals(prev => prev.map(d => d.id === item.id ? item : d));
    } else {
      setDeals(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Partial': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Not Paid': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const fmt = (val: number) => val.toLocaleString();

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Standard Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Outstanding <span className="text-stone-300">/</span> Ledger
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">{tabId}'s Accounts</h2>
           <p className="text-stone-500 max-w-xl">Detailed record of transactions, deals, and outstanding payments for {tabId}.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Calculator size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Sales</div>
                 <div className="text-xl font-bold text-stone-800">LKR {fmt(stats.totalFinal)}</div>
              </div>
           </div>
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Outstanding</div>
                 <div className="text-xl font-bold text-red-600">LKR {fmt(stats.totalOwed)}</div>
              </div>
           </div>
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Percent size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Commissions</div>
                 <div className="text-xl font-bold text-indigo-600">LKR {fmt(stats.totalCommission)}</div>
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
               placeholder="Search by code, description, or status..." 
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

      {/* Main Content: Responsive Cards (Mobile/Tablet) and Table (Desktop) */}
      
      {/* 1. Mobile/Tablet Cards */}
      <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
         {filteredData.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedDeal(item)}
               className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                     <h3 className="font-bold text-stone-900 text-lg leading-tight">{item.description}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusStyle(item.status)}`}>
                     {item.status}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-6 bg-stone-50/50 p-4 rounded-2xl">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Code</span>
                     <span className="font-mono text-stone-800 font-bold">{item.code}</span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-bold text-indigo-400 uppercase">Commission</span>
                     <span className="font-bold text-indigo-600">LKR {fmt(item.commission)}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Weight</span>
                     <span className="font-medium text-stone-800">{item.weight} ct</span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Final Amount</span>
                     <span className="font-bold text-stone-900">LKR {fmt(item.finalAmount)}</span>
                  </div>
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Outstanding</div>
                  <div className={`text-2xl font-bold ${item.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                     LKR {fmt(item.outstanding)}
                     {item.outstanding === 0 && <CheckCircle size={20} className="inline ml-1" />}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* 2. Simplified Desktop Table View */}
      <div className="hidden xl:block bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-6 pl-10">Company</th>
                     <th className="p-6">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Variety / Description</th>
                     <th className="p-6 text-right">Commission</th>
                     <th className="p-6 text-right">Final Amount</th>
                     <th className="p-6 text-center">Status</th>
                     {!isReadOnly && <th className="p-6 w-24"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredData.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedDeal(item)}
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
                        <td className="p-6 font-medium text-stone-800 text-base">{item.description}</td>
                        <td className="p-6 text-right font-bold text-indigo-600 font-mono">
                           {fmt(item.commission)}
                        </td>
                        <td className="p-6 text-right font-bold text-stone-900 text-lg">
                           LKR {fmt(item.finalAmount)}
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(item.status)}`}>
                              {item.status}
                           </span>
                        </td>
                        {!isReadOnly && (
                           <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => { setEditingItem(item); setIsFormOpen(true); setSelectedDeal(null); }}
                                   className="p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                 >
                                    <Edit size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(item.id)}
                                   className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        )}
                     </tr>
                  ))}
                  {filteredData.length === 0 && (
                     <tr>
                        <td colSpan={8} className="p-20 text-center text-stone-400">
                           <div className="flex flex-col items-center">
                              <Search size={48} className="text-stone-200 mb-4" />
                              <p>No records found matching your current filters.</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Side Detail Panel */}
      {selectedDeal && (
         <LedgerDetailPanel 
            item={selectedDeal}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedDeal(null)}
            onEdit={() => { setEditingItem(selectedDeal); setIsFormOpen(true); setSelectedDeal(null); }}
            onDelete={handleDelete}
         />
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <div>
                     <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Transaction' : 'New Ledger Entry'}</h3>
                     <p className="text-stone-500 text-xs mt-1">Enter deal and payment details for {tabId}</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  // Calculated logic
                  const rsAmount = Number(formData.get('rsAmount'));
                  const commission = Number(formData.get('commission'));
                  const halfPaid = Number(formData.get('halfPaid'));
                  const finalAmount = rsAmount + commission;
                  const outstanding = finalAmount - halfPaid;
                  
                  const newItem: LedgerDeal = {
                     id: editingItem?.id || `zd-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: tabId,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     dealValue: Number(formData.get('dealValue')),
                     rsAmount: rsAmount,
                     marginPercent: Number(formData.get('marginPercent')),
                     commission: commission,
                     finalAmount: finalAmount,
                     halfPaid: halfPaid,
                     outstanding: outstanding,
                     dueDate: formData.get('dueDate') as string,
                     status: halfPaid >= finalAmount ? 'Paid' : halfPaid > 0 ? 'Partial' : 'Not Paid',
                     paidDate: formData.get('paidDate') as string,
                     method: formData.get('method') as string,
                     cleared: formData.get('cleared') === 'on'
                  };
                  
                  if (!newItem.code || !newItem.description) return alert('Code and Description are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Company</label>
                           <select name="company" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none">
                              <option>Vision Gems</option>
                              <option>Spinel Gallery</option>
                              <option>VG-T</option>
                              <option>Kenya</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" placeholder="VG-..." />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Variety / Description</label>
                        <input name="description" type="text" defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="e.g. 5ct Blue Sapphire" />
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Scale size={12}/> Weight (ct)</label>
                           <input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><DollarSign size={12}/> Deal ($)</label>
                           <input name="dealValue" type="number" defaultValue={editingItem?.dealValue} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Percent size={12}/> Margin %</label>
                           <input name="marginPercent" type="number" defaultValue={editingItem?.marginPercent} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Percent size={12}/> Commission</label>
                           <input name="commission" type="number" defaultValue={editingItem?.commission} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                     </div>

                     <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 ml-1">Rs Amount (LKR)</label>
                           <input name="rsAmount" type="number" defaultValue={editingItem?.rsAmount} className="w-full p-4 bg-white border-2 border-purple-200 rounded-2xl text-lg font-bold text-stone-900 focus:border-purple-500 outline-none" placeholder="0" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5 ml-1">Received (LKR)</label>
                           <input name="halfPaid" type="number" defaultValue={editingItem?.halfPaid} className="w-full p-4 bg-white border-2 border-emerald-200 rounded-2xl text-lg font-bold text-stone-900 focus:border-emerald-500 outline-none" placeholder="0" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Payment Due Date</label>
                           <input name="dueDate" type="date" defaultValue={editingItem?.dueDate} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Payment paid Date</label>
                           <input name="paidDate" type="date" defaultValue={editingItem?.paidDate} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                           <input name="method" type="text" defaultValue={editingItem?.method} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="Cash/Cheque" />
                        </div>
                     </div>

                     <div className="flex items-center gap-2 p-3 bg-stone-100 rounded-xl w-fit">
                        <input name="cleared" type="checkbox" defaultChecked={editingItem?.cleared} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" />
                        <label className="text-sm font-bold text-stone-700">Bank Cleared?</label>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-10">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="px-10 py-3 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                        <Save size={18} /> Save Entry
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};
