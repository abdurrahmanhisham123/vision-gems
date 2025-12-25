
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, MapPin, Tag, 
  CreditCard, User, FileText, DollarSign, 
  Edit, Trash2, X, Save, Plane, 
  Building2, Globe, Ticket
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---
interface OnlineTicketItem {
  id: string;
  company: string; // Airline or Travel Agency
  date: string;
  code: string;
  name: string; // Passenger Name
  description: string; // Route or Details
  amount: number;
}

// --- Mock Data ---
const MOCK_DATA: OnlineTicketItem[] = [
  { 
    id: '1', 
    company: 'SriLankan Airlines', 
    date: '2024-11-20', 
    code: 'TKT-8821', 
    name: 'Azeem', 
    description: 'CMB -> BKK (UL-402)', 
    amount: 85000 
  },
  { 
    id: '2', 
    company: 'Emirates', 
    date: '2024-11-22', 
    code: 'REF-9932', 
    name: 'Rimsan', 
    description: 'DXB -> CMB (EK-650)', 
    amount: 145000 
  },
  { 
    id: '3', 
    company: 'AirAsia', 
    date: '2024-11-25', 
    code: 'WEB-112', 
    name: 'Office Staff', 
    description: 'KUL -> CMB (AK-47)', 
    amount: 65000 
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const OnlineTicketsTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [items, setItems] = useState<OnlineTicketItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OnlineTicketItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<OnlineTicketItem | null>(null);

  // --- Statistics ---
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this ticket record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: OnlineTicketItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // --- Helper for Company Colors ---
  const getCompanyColor = (company: string) => {
    const c = company.toLowerCase();
    if (c.includes('srilankan') || c.includes('ul')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (c.includes('emirates') || c.includes('ek')) return 'bg-red-50 text-red-700 border-red-100';
    if (c.includes('airasia')) return 'bg-red-50 text-red-600 border-red-100';
    if (c.includes('qatar')) return 'bg-purple-50 text-purple-800 border-purple-100';
    return 'bg-stone-50 text-stone-600 border-stone-200';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-emerald-600">
              All Expenses <span className="text-stone-300">/</span> Travel
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">{tabId}</h2>
           <p className="text-stone-500">Track bookings, tickets, and travel expenses.</p>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Spent</div>
           <div className="text-3xl font-bold text-stone-900 bg-white px-5 py-3 rounded-2xl shadow-sm border border-stone-100 flex items-baseline gap-1">
              <span className="text-stone-400 text-lg font-medium">LKR</span>
              {totalAmount.toLocaleString()}
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search company, name, code..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
            />
         </div>
         {!isReadOnly && (
            <button 
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 w-full md:w-auto justify-center"
            >
              <Plus size={18} /> New Entry
            </button>
         )}
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5">Date</th>
                  <th className="p-5">Company</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right">Amount (LKR)</th>
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
                     <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-stone-300" />
                        {item.date}
                     </td>
                     <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${getCompanyColor(item.company)}`}>
                           {item.company}
                        </span>
                     </td>
                     <td className="p-5 font-mono text-stone-600 text-xs font-bold">{item.code}</td>
                     <td className="p-5 font-medium text-stone-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 font-bold">
                           {item.name.charAt(0)}
                        </div>
                        {item.name}
                     </td>
                     <td className="p-5 text-stone-600">{item.description}</td>
                     <td className="p-5 text-right font-bold text-stone-900">{item.amount.toLocaleString()}</td>
                     
                     {!isReadOnly && (
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}
                                className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
               <Ticket size={48} className="mb-4 text-stone-200" />
               <p>No tickets found matching your search.</p>
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
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Plane size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-stone-900 text-sm">{item.description}</h3>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                           <Calendar size={10} /> {item.date}
                        </div>
                     </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getCompanyColor(item.company)}`}>
                     {item.company}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 bg-stone-50/50 p-3 rounded-xl">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Passenger</span>
                     <span className="font-medium text-stone-800">{item.name}</span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Code</span>
                     <span className="font-mono text-stone-800">{item.code}</span>
                  </div>
               </div>

               <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                  <div className="text-xs font-bold text-stone-400 uppercase">Amount</div>
                  <div className="text-xl font-bold text-stone-900">LKR {item.amount.toLocaleString()}</div>
               </div>
            </div>
         ))}
         {filteredItems.length === 0 && (
            <div className="p-10 text-center text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200">
               No tickets found.
            </div>
         )}
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Ticket Details'}
         subtitle={`${selectedItem?.code} • ${selectedItem?.name}`}
         status={selectedItem?.company}
         statusColor={selectedItem ? getCompanyColor(selectedItem.company) : ''}
         icon={<Plane size={32} className="text-emerald-600" />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Company': selectedItem.company,
            'Date': selectedItem.date,
            'Code': selectedItem.code,
            'Passenger Name': selectedItem.name,
            'Route / Description': selectedItem.description,
            'Amount': `LKR ${selectedItem.amount.toLocaleString()}`
         } : undefined}
      />

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Ticket' : 'New Ticket'}</h3>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: OnlineTicketItem = {
                     id: editingItem?.id || `tkt-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     amount: Number(formData.get('amount')),
                  };
                  
                  if (!newItem.amount || !newItem.company) return alert('Company and Amount are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="TKT-..." />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Company / Airline</label>
                        <input name="company" type="text" defaultValue={editingItem?.company} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. SriLankan Airlines" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Passenger Name</label>
                        <input name="name" type="text" defaultValue={editingItem?.name} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. John Doe" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Description / Route</label>
                        <input name="description" type="text" defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. CMB to BKK" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Amount (LKR)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} className="w-full pl-12 p-3 bg-white border-2 border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" placeholder="0.00" />
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
