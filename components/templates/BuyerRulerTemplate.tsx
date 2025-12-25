
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Building2,
  ChevronRight, ArrowRight, Wallet,
  ShieldCheck, Calculator, CreditCard,
  Printer, Download, Filter, Gem,
  ArrowUpRight, Clock, User,
  AlertTriangle, Percent, Scale
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---

interface BuyerRulerEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string; // Seller/Supplier
  description: string;
  weight: number;
  
  // Financials
  amount: number;      // Base Amount
  percent: number;     // Adjustment %
  commission: number;  // Commission Amount
  finalAmount: number; // Final Amount (Amt + Comm)
  
  // Debt Tracking
  payableAmount: number; // Net Payable
  paidAmount: number;    // Amount already settled
  paymentDue: string;    // Due Date
  
  status: 'Paid' | 'Pending' | 'Overdue';
}

// --- Mock Data ---

const INITIAL_DATA: BuyerRulerEntry[] = [
  {
    id: 'br-1',
    company: 'Vision Gems',
    date: '2024-11-20',
    code: 'PUR-8821',
    name: 'Mashaka',
    description: 'Rough Spinel Selection (Tanzania)',
    weight: 45.20,
    amount: 1250000,
    percent: 5,
    commission: 62500,
    finalAmount: 1312500,
    payableAmount: 1312500,
    paidAmount: 500000,
    paymentDue: '2024-12-15',
    status: 'Pending'
  },
  {
    id: 'br-2',
    company: 'Spinel Gallery',
    date: '2024-11-25',
    code: 'PUR-9902',
    name: 'Juma',
    description: 'Mahenge Pink Lot',
    weight: 12.80,
    amount: 850000,
    percent: 0,
    commission: 0,
    finalAmount: 850000,
    payableAmount: 850000,
    paidAmount: 850000,
    paymentDue: '2024-11-25',
    status: 'Paid'
  },
  {
    id: 'br-3',
    company: 'Vision Gems',
    date: '2024-12-01',
    code: 'PUR-1150',
    name: 'Yusuph',
    description: 'Rough Ruby Parcel',
    weight: 8.50,
    amount: 2100000,
    percent: 10,
    commission: 210000,
    finalAmount: 2310000,
    payableAmount: 2310000,
    paidAmount: 0,
    paymentDue: '2024-12-10',
    status: 'Overdue'
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const BuyerRulerTemplate: React.FC<Props> = ({ isReadOnly, tabId }) => {
  const [entries, setEntries] = useState<BuyerRulerEntry[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Selection/Modal State
  const [selectedEntry, setSelectedEntry] = useState<BuyerRulerEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BuyerRulerEntry | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalPayable = entries.reduce((sum, e) => sum + e.payableAmount, 0);
    const totalPaid = entries.reduce((sum, e) => sum + e.paidAmount, 0);
    const totalOwed = totalPayable - totalPaid;
    return { totalPayable, totalPaid, totalOwed, count: entries.length };
  }, [entries]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    return entries.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);
      
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery, filterStatus]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this ledger record?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    }
  };

  const handleSave = (item: BuyerRulerEntry) => {
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
      
      {/* Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-red-600">
              Payable <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Bayer Ruler Ledger</h2>
           <p className="text-stone-500 max-w-xl">Detailed buying ledger for tracking commissions, final settlements, and supplier liabilities.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 min-w-[180px] bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Owed</div>
                 <div className="text-xl font-bold text-red-600">LKR {fmt(stats.totalOwed)}</div>
              </div>
           </div>
           <div className="flex-1 min-w-[180px] bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <Wallet size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Settled</div>
                 <div className="text-xl font-bold text-emerald-600">LKR {fmt(stats.totalPaid)}</div>
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
               placeholder="Search by supplier, code, or description..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-stone-800 placeholder-stone-400"
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
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
               </select>
            </div>
            
            <button className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 shadow-sm transition-all shrink-0">
               <Download size={18} />
            </button>

            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
               >
                  <Plus size={18} /> New Entry
               </button>
            )}
         </div>
      </div>

      {/* Responsive Content */}
      
      {/* 1. Mobile/Tablet View (Cards) */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
         {filteredData.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedEntry(item)}
               className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               {/* Left border indicator */}
               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Paid' ? 'bg-emerald-500' : item.status === 'Overdue' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

               <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Calendar size={10} /> {item.date}
                     </span>
                     <h3 className="font-bold text-stone-900 text-lg leading-tight">{item.name}</h3>
                     <div className="text-[10px] font-bold uppercase text-stone-400 mt-1">{item.company}</div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded border border-stone-200">{item.code}</span>
               </div>

               <p className="text-sm text-stone-600 mb-6 line-clamp-2 pl-2 italic">"{item.description}"</p>

               <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-2xl p-4 mb-4 ml-2">
                  <div>
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Final Amount</span>
                     <div className="text-stone-800 font-bold">LKR {fmt(item.finalAmount)}</div>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-bold text-red-400 uppercase">Payment Due</span>
                     <div className="text-red-600 font-bold text-xs">{item.paymentDue}</div>
                  </div>
               </div>

               {/* Payment Progress Bar */}
               <div className="ml-2 mb-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-stone-400 mb-1.5">
                     <span>Settled</span>
                     <span>{Math.round((item.paidAmount / item.finalAmount) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-500 ${item.status === 'Paid' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${(item.paidAmount / item.finalAmount) * 100}%` }}
                     ></div>
                  </div>
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center ml-2">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Outstanding</div>
                  <div className={`text-2xl font-bold ${item.status === 'Paid' ? 'text-emerald-700' : 'text-red-600'}`}>
                     LKR {fmt(item.payableAmount - item.paidAmount)}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* 2. Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-4 pl-8">Company</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Code</th>
                     <th className="p-4">Name</th>
                     <th className="p-4">Description</th>
                     <th className="p-4 text-right">Weight</th>
                     <th className="p-4 text-right">Amount</th>
                     <th className="p-4 text-center">%</th>
                     <th className="p-4 text-right">Comm.</th>
                     <th className="p-4 text-right">Final Amt</th>
                     <th className="p-4 text-right">Paid Amt</th>
                     <th className="p-4">Payment Due</th>
                     {!isReadOnly && <th className="p-4 w-24"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-[13px]">
                  {filteredData.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedEntry(item)}
                        className="hover:bg-red-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-4 pl-8">
                           <span className="font-bold text-[9px] text-stone-500 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200 uppercase whitespace-nowrap">
                              {item.company}
                           </span>
                        </td>
                        <td className="p-4 font-mono text-stone-400 whitespace-nowrap">{item.date}</td>
                        <td className="p-4 font-mono text-stone-700 font-bold">{item.code}</td>
                        <td className="p-4 font-bold text-stone-800">{item.name}</td>
                        <td className="p-4 text-stone-500 truncate max-w-[150px]">{item.description}</td>
                        <td className="p-4 text-right font-mono text-stone-600">{item.weight}ct</td>
                        <td className="p-4 text-right font-medium text-stone-600">{fmt(item.amount)}</td>
                        <td className="p-4 text-center">
                           <span className="text-[10px] font-bold text-stone-400">{item.percent}%</span>
                        </td>
                        <td className="p-4 text-right font-mono text-stone-500">{fmt(item.commission)}</td>
                        <td className="p-4 text-right font-bold text-stone-900">{fmt(item.finalAmount)}</td>
                        <td className="p-4 text-right font-bold text-emerald-600 bg-emerald-50/30">{fmt(item.paidAmount)}</td>
                        <td className="p-4 text-red-500 font-bold whitespace-nowrap">{item.paymentDue}</td>
                        {!isReadOnly && (
                           <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                                   className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                 >
                                    <Edit size={14} />
                                 </button>
                                 <button onClick={() => handleDelete(item.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
         <DetailModal 
            isOpen={!!selectedEntry}
            onClose={() => setSelectedEntry(null)}
            title={selectedEntry.name}
            subtitle={selectedEntry.description}
            status={selectedEntry.status}
            statusColor={selectedEntry.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
            icon={<Briefcase size={32} className="text-red-600" />}
            onEdit={!isReadOnly ? () => { setEditingItem(selectedEntry); setIsFormOpen(true); setSelectedEntry(null); } : undefined}
            data={{
               'Company': selectedEntry.company,
               'Date': selectedEntry.date,
               'Reference Code': selectedEntry.code,
               'Variety/Desc': selectedEntry.description,
               'Weight (ct)': selectedEntry.weight,
               'Base Amount': `LKR ${fmt(selectedEntry.amount)}`,
               'Adjustment %': `${selectedEntry.percent}%`,
               'Commission': `LKR ${fmt(selectedEntry.commission)}`,
               'Final Amount': `LKR ${fmt(selectedEntry.finalAmount)}`,
               'Payable Total': `LKR ${fmt(selectedEntry.payableAmount)}`,
               'Settled Paid': `LKR ${fmt(selectedEntry.paidAmount)}`,
               'Outstanding Balance': `LKR ${fmt(selectedEntry.payableAmount - selectedEntry.paidAmount)}`,
               'Payment Due': selectedEntry.paymentDue
            }}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                  <div>
                     <h3 className="text-2xl font-bold text-stone-900">{editingItem ? 'Edit Ruler Record' : 'Add Buyer Ruler Entry'}</h3>
                     <p className="text-stone-500 text-sm mt-1">Capture detailed procurement and commission data.</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={24}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  // Calculated logic
                  const amount = Number(formData.get('amount'));
                  const commission = Number(formData.get('commission'));
                  const paid = Number(formData.get('paidAmount'));
                  const final = amount + commission;
                  
                  const newItem: BuyerRulerEntry = {
                     id: editingItem?.id || `br-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     amount: amount,
                     percent: Number(formData.get('percent')),
                     commission: commission,
                     finalAmount: final,
                     payableAmount: final, // usually matches final
                     paidAmount: paid,
                     paymentDue: formData.get('paymentDue') as string,
                     status: paid >= final ? 'Paid' : 'Pending'
                  };
                  handleSave(newItem);
               }}>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Company</label>
                           <select name="company" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none">
                              <option>Vision Gems</option>
                              <option>Spinel Gallery</option>
                              <option>Kenya Branch</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono" placeholder="PUR-..." />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Supplier/Name</label>
                           <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold outline-none" placeholder="e.g. Mashaka" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Variety/Description</label>
                           <input name="description" type="text" defaultValue={editingItem?.description} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" placeholder="Mixed Spinel Lot" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Scale size={12}/> Weight</label>
                           <input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" placeholder="0.00" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><DollarSign size={12}/> Amount</label>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1"><Percent size={12}/> Margin</label>
                           <input name="percent" type="number" defaultValue={editingItem?.percent} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Commission</label>
                           <input name="commission" type="number" defaultValue={editingItem?.commission} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                        </div>
                     </div>

                     <div className="bg-red-50/50 p-6 rounded-[32px] border border-red-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[11px] font-bold text-red-400 uppercase tracking-widest mb-2 ml-1">Settled (Paid Amount)</label>
                           <input name="paidAmount" type="number" defaultValue={editingItem?.paidAmount} className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl text-xl font-bold text-stone-900 focus:border-red-500 transition-all outline-none" placeholder="0" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Payment Due Date</label>
                           <input name="paymentDue" type="date" defaultValue={editingItem?.paymentDue} className="w-full p-4 bg-white border-2 border-stone-200 rounded-2xl text-lg font-bold text-stone-900 outline-none" />
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-10">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-colors">Cancel</button>
                     <button type="submit" className="px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl shadow-xl hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-2">
                        <Save size={20} /> Save Ruler Record
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};
