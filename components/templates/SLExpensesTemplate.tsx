
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Calendar, 
  Trash2, Edit, X, CreditCard, 
  DollarSign, Briefcase, FileText, 
  User, CheckCircle, Clock, ArrowDownCircle,
  Save
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---
interface SLExpenseItem {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  method: string; // Payment Method
  amount: number;
}

// --- Mock Data ---
const MOCK_DATA: SLExpenseItem[] = [
  { id: '1', company: 'Spinel Gallery', date: '2024-11-20', code: 'EXP-001', name: 'Azeem', description: 'Rough Stone Purchase', weight: 5.2, method: 'Cash', amount: 450000 },
  { id: '2', company: 'Vision Gems', date: '2024-11-22', code: 'EXP-002', name: 'Office', description: 'Monthly Utility Bill', weight: 0, method: 'Bank Transfer', amount: 15000 },
  { id: '3', company: 'Spinel Gallery', date: '2024-11-25', code: 'SRV-102', name: 'Nimal Cutter', description: 'Cutting Service - Blue Spinel', weight: 2.5, method: 'Cash', amount: 8500 },
  { id: '4', company: 'Spinel Gallery', date: '2024-11-28', code: 'TRV-055', name: 'Uber', description: 'Transport to Beruwala', weight: 0, method: 'Card', amount: 4200 },
  { id: '5', company: 'Vision Gems', date: '2024-12-01', code: 'EXP-005', name: 'Rimsan', description: 'Brokerage Fee', weight: 0, method: 'Cash', amount: 25000 },
  { id: '6', company: 'Spinel Gallery', date: '2024-12-03', code: 'MAT-882', name: 'Packaging Co', description: 'Export Boxes', weight: 0, method: 'Cheque', amount: 12500 },
  { id: '7', company: 'Spinel Gallery', date: '2024-12-05', code: 'SRV-109', name: 'Kamal Polisher', description: 'Polishing Lot A', weight: 12.4, method: 'Cash', amount: 35000 },
  { id: '8', company: 'Vision Gems', date: '2024-12-10', code: 'EXP-008', name: 'Food City', description: 'Office Supplies', weight: 0, method: 'Card', amount: 3450 },
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const SLExpensesTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [items, setItems] = useState<SLExpenseItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SLExpenseItem | null>(null);
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SLExpenseItem | null>(null);

  // --- Calculations ---
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const totalCount = items.length;

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: SLExpenseItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // --- Render Helpers ---
  const getMethodBadgeStyle = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'bank transfer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'card': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cheque': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-blue-600">
              Spinel Gallery <span className="text-stone-300">/</span> Expenses
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">SL Expenses Log</h2>
           <p className="text-stone-500 text-sm mt-1">Track operational costs and payments in Sri Lanka.</p>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
           >
             <Plus size={18} /> Add New Expense
           </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-stone-900">LKR {totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Transactions</div>
              <div className="text-2xl font-bold text-stone-900">{totalCount}</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-500">
              <FileText size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Last Update</div>
              <div className="text-lg font-bold text-stone-900">Today</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock size={24} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search description, name, code..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm font-medium flex items-center gap-2">
              <Filter size={16} /> Filter
            </button>
         </div>
      </div>

      {/* Data Display: Table (Desktop) / Cards (Mobile) */}
      
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5">Date</th>
                  <th className="p-5">Company</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right">Weight</th>
                  <th className="p-5 text-center">Method</th>
                  <th className="p-5 text-right">Amount (LKR)</th>
                  {!isReadOnly && <th className="p-5 w-20"></th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredItems.map(item => (
                  <tr 
                     key={item.id} 
                     onClick={() => setSelectedItem(item)}
                     className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                     <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-stone-300" />
                        {item.date}
                     </td>
                     <td className="p-5">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200 tracking-wide">
                           {item.company}
                        </span>
                     </td>
                     <td className="p-5 font-mono text-stone-600 text-xs font-bold">{item.code || '-'}</td>
                     <td className="p-5 font-medium text-stone-800">{item.name}</td>
                     <td className="p-5 text-stone-600 max-w-xs truncate" title={item.description}>{item.description}</td>
                     <td className="p-5 text-right font-mono text-stone-600">{item.weight > 0 ? `${item.weight} ct` : '-'}</td>
                     <td className="p-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getMethodBadgeStyle(item.method)}`}>
                           {item.method}
                        </span>
                     </td>
                     <td className="p-5 text-right font-bold text-stone-900">{item.amount.toLocaleString()}</td>
                     
                     {!isReadOnly && (
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}
                                className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                 <Edit size={14} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </td>
                     )}
                  </tr>
               ))}
            </tbody>
         </table>
         {filteredItems.length === 0 && (
            <div className="p-12 text-center text-stone-400">No records found.</div>
         )}
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-50 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                     </span>
                     <h3 className="font-bold text-stone-900 text-lg">{item.description}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getMethodBadgeStyle(item.method)}`}>
                     {item.method}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                     <Briefcase size={14} className="text-stone-400" />
                     <span className="truncate">{item.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <User size={14} className="text-stone-400" />
                     <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FileText size={14} className="text-stone-400" />
                     <span className="font-mono text-xs">{item.code || 'No Code'}</span>
                  </div>
                  {item.weight > 0 && (
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Weight:</span>
                        <span className="font-mono">{item.weight} ct</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div className="text-xs text-stone-400 font-medium">LKR Amount</div>
                  <div className="text-xl font-bold text-blue-700">{item.amount.toLocaleString()}</div>
               </div>
            </div>
         ))}
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Expense Details'}
         subtitle={`${selectedItem?.date} • ${selectedItem?.code}`}
         status={selectedItem?.method}
         statusColor={selectedItem ? getMethodBadgeStyle(selectedItem.method) : ''}
         icon={<CreditCard size={32} className="text-blue-600" />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Company': selectedItem.company,
            'Name': selectedItem.name,
            'Amount': `LKR ${selectedItem.amount.toLocaleString()}`,
            'Weight': selectedItem.weight > 0 ? `${selectedItem.weight} ct` : 'N/A',
            'Code': selectedItem.code,
            'Date': selectedItem.date,
            'Description': selectedItem.description
         } : undefined}
      />

      {/* Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Expense' : 'New Expense'}</h3>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: SLExpenseItem = {
                     id: editingItem?.id || `exp-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     method: formData.get('method') as string,
                     amount: Number(formData.get('amount')),
                  };
                  if (!newItem.amount || !newItem.description) return alert('Amount and Description required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Company</label>
                           <select name="company" defaultValue={editingItem?.company || 'Spinel Gallery'} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm">
                              <option>Spinel Gallery</option>
                              <option>Vision Gems</option>
                              <option>Dad</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                        <input name="description" type="text" defaultValue={editingItem?.description} placeholder="e.g. Utility Bill" className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name / Payee</label>
                           <input name="name" type="text" defaultValue={editingItem?.name} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" placeholder="Optional" />
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Weight</label>
                           <input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm" placeholder="0.00" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Payment Method</label>
                           <select name="method" defaultValue={editingItem?.method || 'Cash'} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm">
                              <option>Cash</option>
                              <option>Bank Transfer</option>
                              <option>Cheque</option>
                              <option>Card</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount (LKR)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} className="w-full pl-10 p-3 bg-white border-2 border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:border-blue-500 outline-none" placeholder="0.00" />
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
