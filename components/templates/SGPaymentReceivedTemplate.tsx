import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, CreditCard, ArrowDownLeft, Briefcase, Scale, Tag,
  Filter, ChevronDown, Building2, Info, ChevronRight
} from 'lucide-react';

// --- Types ---
interface PaymentItem {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  dealAmount: number; // "Deal"
  amount: number;     // "Amount" (Received)
  method: string;     // "Cash / Cheque"
}

// --- Demo Data ---
const INITIAL_DATA: PaymentItem[] = [
  { 
    id: 'sg-pay-1', 
    company: 'Spinel Gallery', 
    date: '2024-11-25', 
    code: 'SG-24-088', 
    name: 'Zahran', 
    description: 'Payment for Lot 5 (Pink Spinels)', 
    weight: 12.5, 
    dealAmount: 2500000, 
    amount: 1000000, 
    method: 'Cash' 
  },
  { 
    id: 'sg-pay-2', 
    company: 'Spinel Gallery', 
    date: '2024-11-28', 
    code: 'SG-24-092', 
    name: 'Nusrath Ali', 
    description: 'Settlement for Blue Sapphire 3.2ct', 
    weight: 3.20, 
    dealAmount: 450000, 
    amount: 450000, 
    method: 'Cheque (88291)' 
  },
  { 
    id: 'sg-pay-3', 
    company: 'Spinel Gallery', 
    date: '2024-12-01', 
    code: 'SG-24-105', 
    name: 'Chinese Buyer', 
    description: 'Advance for Mahenge Export Batch', 
    weight: 0, 
    dealAmount: 5000000, 
    amount: 2000000, 
    method: 'Bank Transfer' 
  },
  { 
    id: 'sg-pay-4', 
    company: 'Vision Gems', 
    date: '2024-12-05', 
    code: 'VG-PAY-001', 
    name: 'Rimsan', 
    description: 'Payment for Gem Lot', 
    weight: 5.5, 
    dealAmount: 1200000, 
    amount: 1200000, 
    method: 'Cash' 
  },
  { 
    id: 'sg-pay-5', 
    company: 'Vision Gems', 
    date: '2024-12-08', 
    code: 'VG-PAY-002', 
    name: 'Azeem', 
    description: 'Partial payment for Ruby', 
    weight: 2.1, 
    dealAmount: 850000, 
    amount: 300000, 
    method: 'Bank Transfer' 
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- SIDE PANEL COMPONENT ---
const PaymentDetailPanel: React.FC<{
  item: PaymentItem;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item, onClose, onEdit, onDelete, isReadOnly }) => {
  const fmt = (val: number) => val.toLocaleString();

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                Payment Record
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{item.code}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{item.name}</h2>
            <p className="text-sm text-stone-500 mt-1">{item.company}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} /> Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Date</div>
                <div className="text-sm font-bold text-stone-800">{item.date}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Method</div>
                <div className="text-sm font-bold text-stone-800">{item.method}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 col-span-2">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Description</div>
                <div className="text-sm font-medium text-stone-700">{item.description}</div>
              </div>
              {item.weight > 0 && (
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Weight</div>
                  <div className="text-sm font-bold text-stone-800">{item.weight} ct</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={14} /> Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200">
                 <span className="text-sm text-stone-500">Deal Value</span>
                 <span className="text-sm font-bold text-stone-800">LKR {fmt(item.dealAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                 <span className="text-sm font-bold text-emerald-700">Amount Received</span>
                 <span className="text-xl font-bold text-emerald-900">LKR {fmt(item.amount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200">
                 <span className="text-sm text-stone-500">Outstanding</span>
                 <span className="text-sm font-bold text-red-600">LKR {fmt(item.dealAmount - item.amount)}</span>
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

export const SGPaymentReceivedTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [items, setItems] = useState<PaymentItem[]>(INITIAL_DATA);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);

  // --- Statistics ---
  const totalReceived = useMemo(() => items.reduce((sum, i) => sum + (i.amount || 0), 0), [items]);
  const totalDealValue = useMemo(() => items.reduce((sum, i) => sum + (i.dealAmount || 0), 0), [items]);

  // --- Derived Lists for Dropdowns ---
  const uniqueCompanies = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.company))).sort()], [items]);
  const uniqueMethods = useMemo(() => ['All', 'Cash', 'Cheque', 'Bank Transfer', 'Other'], []);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search Text
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q);

      // Company Filter
      const matchesCompany = filterCompany === 'All' || item.company === filterCompany;

      // Method Filter
      const method = (item.method || '').toLowerCase();
      const matchesMethod = filterMethod === 'All' || 
        (filterMethod === 'Cheque' && method.includes('cheque')) ||
        (filterMethod === 'Cash' && method.includes('cash')) ||
        (filterMethod === 'Bank Transfer' && method.includes('bank')) ||
        (filterMethod === 'Other' && !method.match(/cash|cheque|bank/));

      // Date Range
      const matchesDate = 
        (!dateRange.start || item.date >= dateRange.start) &&
        (!dateRange.end || item.date <= dateRange.end);

      return matchesSearch && matchesCompany && matchesMethod && matchesDate;
    });
  }, [items, searchQuery, filterCompany, filterMethod, dateRange]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: PaymentItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // --- Visual Helpers ---
  const getMethodBadgeStyle = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('cash')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (m.includes('cheque') || m.includes('chk')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (m.includes('bank') || m.includes('transfer')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-stone-100 text-stone-600 border-stone-200';
  };

  // Safe toLocaleString helper
  const fmt = (val: number | undefined | null) => (val || 0).toLocaleString();

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-emerald-600">
              Outstanding <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Payment Received</h2>
           <p className="text-stone-500">Track incoming payments against deals and sales.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
           <div className="flex-1 min-w-[200px] xl:min-w-0 bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Deal Value</div>
              <div className="text-xl font-bold text-stone-600">LKR {fmt(totalDealValue)}</div>
           </div>
           <div className="flex-1 min-w-[200px] xl:min-w-0 bg-emerald-50 px-6 py-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Received</div>
              <div className="text-xl font-bold text-emerald-700">LKR {fmt(totalReceived)}</div>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm items-center">
         <div className="relative w-full xl:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by name, code, description..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-stone-400 text-stone-800"
            />
         </div>

         <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-xl flex-grow xl:flex-grow-0 min-w-[260px]">
               <Calendar size={16} className="text-stone-400" />
               <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent text-xs font-medium text-stone-600 outline-none w-24"
               />
               <span className="text-stone-300">-</span>
               <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent text-xs font-medium text-stone-600 outline-none w-24"
               />
            </div>

            <div className="relative flex-grow xl:flex-grow-0 min-w-[140px]">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Building2 size={16} /></div>
               <select 
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
               >
                  {uniqueCompanies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} />
            </div>

            <div className="relative flex-grow xl:flex-grow-0 min-w-[140px]">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><CreditCard size={16} /></div>
               <select 
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
               >
                  {uniqueMethods.map(m => <option key={m} value={m}>{m === 'All' ? 'All Methods' : m}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} />
            </div>

            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 flex-grow xl:flex-grow-0 min-w-[140px]"
               >
                  <Plus size={18} /> New Payment
               </button>
            )}
         </div>
      </div>

      {/* Main Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden min-h-[500px]">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-5 pl-6">Company</th>
                     <th className="p-5">Date</th>
                     <th className="p-5">Code</th>
                     <th className="p-5">Name</th>
                     <th className="p-5">Description</th>
                     <th className="p-5 text-right">Weight</th>
                     <th className="p-5 text-right">Deal Value</th>
                     <th className="p-5 text-right">Received</th>
                     <th className="p-5 text-center">Method</th>
                     {!isReadOnly && <th className="p-5 w-24"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-emerald-50/10 transition-colors cursor-pointer group"
                     >
                        <td className="p-5 pl-6">
                           <span className="font-bold text-[10px] text-stone-600 bg-stone-100 px-2 py-1 rounded border border-stone-200 uppercase tracking-wide">
                              {item.company}
                           </span>
                        </td>
                        <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                           <Calendar size={14} className="text-stone-300" />
                           {item.date}
                        </td>
                        <td className="p-5 font-mono text-stone-600 text-xs font-bold">{item.code}</td>
                        <td className="p-5">
                           <span className="font-bold text-stone-800">{item.name}</span>
                        </td>
                        <td className="p-5 text-stone-600 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                        <td className="p-5 text-right font-mono text-stone-600">{item.weight > 0 ? item.weight.toFixed(2) : '-'}</td>
                        <td className="p-5 text-right font-medium text-stone-500">{fmt(item.dealAmount)}</td>
                        <td className="p-5 text-right">
                           <span className="font-bold text-emerald-700 text-base bg-emerald-50 px-2 py-1 rounded-lg">
                              {fmt(item.amount)}
                           </span>
                        </td>
                        <td className="p-5 text-center">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getMethodBadgeStyle(item.method)}`}>
                              {item.method}
                           </span>
                        </td>
                        {!isReadOnly && (
                           <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                                   className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
               </tbody>
            </table>
         </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
               <div className="flex justify-between items-start mb-4 pl-3">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 uppercase">{item.company}</span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                     </div>
                     <h3 className="font-bold text-stone-900 text-lg leading-tight">{item.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getMethodBadgeStyle(item.method)}`}>
                     {item.method}
                  </span>
               </div>
               <div className="pl-3 mb-4">
                  <div className="text-xs font-mono text-stone-400 mb-1">{item.code}</div>
                  <p className="text-sm text-stone-600 leading-snug">{item.description}</p>
               </div>
               <div className="pt-3 border-t border-stone-100 flex justify-between items-center pl-3">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Received</div>
                  <div className="text-xl font-bold text-emerald-700">LKR {fmt(item.amount)}</div>
               </div>
            </div>
         ))}
      </div>

      {/* Detail Side Panel */}
      {selectedItem && (
         <PaymentDetailPanel 
            item={selectedItem}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedItem(null)}
            onEdit={() => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); }}
            onDelete={handleDelete}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Payment' : 'New Payment Record'}</h3>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: PaymentItem = {
                     id: editingItem?.id || `pay-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     dealAmount: Number(formData.get('dealAmount')),
                     amount: Number(formData.get('amount')),
                     method: formData.get('method') as string,
                  };
                  if (!newItem.amount || !newItem.name) return alert('Name and Received Amount are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Company</label>
                           <input name="company" type="text" defaultValue={editingItem?.company || 'Spinel Gallery'} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Name</label>
                           <input name="name" type="text" defaultValue={editingItem?.name} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold" placeholder="Payer Name" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" placeholder="REF-..." />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Description</label>
                        <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" placeholder="Payment details..." />
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Weight</label>
                           <input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Method</label>
                           <input name="method" type="text" defaultValue={editingItem?.method || 'Cash'} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="Cash / Cheque" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Deal Amount</label>
                           <input name="dealAmount" type="number" defaultValue={editingItem?.dealAmount} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="0" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 text-emerald-600">Received Amount</label>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} required className="w-full p-3 bg-white border-2 border-emerald-100 rounded-xl text-sm font-bold text-emerald-700" placeholder="0" />
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="px-8 py-3 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                        <Save size={18} /> Save Record
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};