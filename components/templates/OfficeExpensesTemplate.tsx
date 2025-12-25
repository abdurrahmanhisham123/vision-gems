
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, X, DollarSign, 
  User, Tag, Save, Building2,
  Briefcase
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---
interface OfficeExpenseItem {
  id: string;
  date: string;
  code: string;
  name: string; // Payer/Payee
  description: string;
  amount: number;
}

// --- Dummy Data ---
const MOCK_DATA: OfficeExpenseItem[] = [
  { 
    id: 'off-1', 
    date: '2024-11-01', 
    code: 'RENT-NOV', 
    name: 'Landlord', 
    description: 'Monthly Office Rent - November', 
    amount: 85000 
  },
  { 
    id: 'off-2', 
    date: '2024-11-05', 
    code: 'UTL-ELEC', 
    name: 'CEB', 
    description: 'Electricity Bill - October Cycle', 
    amount: 12450 
  },
  { 
    id: 'off-3', 
    date: '2024-11-10', 
    code: 'SUP-001', 
    name: 'Keells Super', 
    description: 'Office Supplies & Refreshments', 
    amount: 3200 
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const OfficeExpensesTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [items, setItems] = useState<OfficeExpenseItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfficeExpenseItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<OfficeExpenseItem | null>(null);

  // --- Statistics ---
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items]);

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

  const handleSave = (item: OfficeExpenseItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-indigo-600">
              All Expenses <span className="text-stone-300">/</span> Operational
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">{tabId}</h2>
           <p className="text-stone-500">Manage rent, utilities, and daily office expenditures.</p>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Expenses</div>
           <div className="text-3xl font-bold text-stone-900 bg-white px-5 py-3 rounded-2xl shadow-sm border border-stone-100 flex items-baseline gap-1">
              <span className="text-stone-400 text-lg font-medium">LKR</span>
              {totalAmount.toLocaleString()}
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search expenses..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-transparent text-sm focus:outline-none text-stone-800 placeholder-stone-400"
            />
         </div>
         {!isReadOnly && (
            <button 
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 w-full md:w-auto justify-center mx-1 my-1 md:my-0"
            >
              <Plus size={18} /> New Expense
            </button>
         )}
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden lg:block bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 w-40">Date</th>
                  <th className="p-5 w-40">Code</th>
                  <th className="p-5 w-64">Name</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right w-48">Amount (LKR)</th>
                  {!isReadOnly && <th className="p-5 w-24"></th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredItems.map(item => (
                  <tr 
                     key={item.id} 
                     onClick={() => setSelectedItem(item)}
                     className="hover:bg-indigo-50/10 transition-colors cursor-pointer group"
                  >
                     <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-stone-300" />
                        {item.date}
                     </td>
                     <td className="p-5">
                        <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                           {item.code}
                        </span>
                     </td>
                     <td className="p-5 font-medium text-stone-800">
                        {item.name}
                     </td>
                     <td className="p-5 text-stone-600">
                        {item.description}
                     </td>
                     <td className="p-5 text-right font-bold text-stone-900 text-base">
                        {item.amount.toLocaleString()}
                     </td>
                     
                     {!isReadOnly && (
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}
                                className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                 <Edit size={16} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(item.id, e)}
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
         {filteredItems.length === 0 && (
            <div className="p-16 text-center text-stone-400 flex flex-col items-center">
               <Briefcase size={48} className="mb-4 text-stone-200" />
               <p>No office expenses found.</p>
            </div>
         )}
      </div>

      {/* --- MOBILE/TABLET CARD VIEW --- */}
      <div className="lg:hidden space-y-4">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1 flex items-center gap-1">
                        <Calendar size={12} /> {item.date}
                     </div>
                     <h3 className="font-bold text-stone-900 text-lg leading-tight">{item.description}</h3>
                  </div>
                  <div className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded border border-stone-200 whitespace-nowrap ml-2">
                     {item.code}
                  </div>
               </div>

               <div className="flex items-center gap-2 mb-4 text-sm text-stone-600">
                  <User size={14} className="text-stone-400" />
                  <span>{item.name}</span>
               </div>

               <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Amount</div>
                  <div className="text-xl font-bold text-stone-900">LKR {item.amount.toLocaleString()}</div>
               </div>
            </div>
         ))}
         {filteredItems.length === 0 && (
            <div className="p-10 text-center text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200">
               No expenses found.
            </div>
         )}
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Expense Details'}
         subtitle={`${selectedItem?.code} • ${selectedItem?.name}`}
         status="Completed"
         statusColor="bg-emerald-100 text-emerald-700"
         icon={<Building2 size={32} className="text-indigo-600" />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Date': selectedItem.date,
            'Code': selectedItem.code,
            'Payee Name': selectedItem.name,
            'Description': selectedItem.description,
            'Amount': `LKR ${selectedItem.amount.toLocaleString()}`
         } : undefined}
      />

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Expense' : 'New Office Expense'}</h3>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: OfficeExpenseItem = {
                     id: editingItem?.id || `off-${Date.now()}`,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     amount: Number(formData.get('amount')),
                  };
                  
                  if (!newItem.amount || !newItem.description) return alert('Amount and Description are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Date</label>
                           <div className="relative">
                              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                              <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                           <div className="relative">
                              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                              <input name="code" type="text" defaultValue={editingItem?.code} className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="EXP-..." />
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Name / Payee</label>
                        <div className="relative">
                           <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                           <input name="name" type="text" defaultValue={editingItem?.name} className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Landlord, CEB" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                        <textarea name="description" rows={3} defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="Details of the expense..." />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount (LKR)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} className="w-full pl-12 p-3 bg-white border-2 border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="0.00" />
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
