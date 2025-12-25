import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Building2,
  ChevronRight, ArrowRight, Wallet,
  ShieldCheck, Calculator, Download, Filter,
  Gem, Scale, Tag, CreditCard, Globe,
  Layers, AlertTriangle, Info
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---

interface PaymentRecord {
  id: string;
  category: 'SG' | 'VG' | 'Kenya' | 'Madagascar' | 'VG Tanzania';
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  method?: string; // Cash / Cheque
  amount: number;
}

// --- Mock Data ---

const INITIAL_DATA: PaymentRecord[] = [
  { id: 'p-1', category: 'SG', company: 'Spinel Gallery', date: '2024-11-25', code: 'SG-8821', name: 'Zahran', description: 'Lot 5 Pink Spinel', weight: 12.45, method: 'Cash', amount: 450000 },
  { id: 'p-2', category: 'SG', company: 'Spinel Gallery', date: '2024-12-05', code: 'SG-9932', name: 'Nusrath Ali', description: '3ct Blue Sapphire', weight: 3.10, method: 'Cheque', amount: 1250000 },
  { id: 'p-3', category: 'VG', company: 'Vision Gems', date: '2024-11-30', code: 'VG-240', name: 'Rimsan', description: 'Garnet Parcel', weight: 45.5, method: 'Bank Transfer', amount: 320000 },
  { id: 'p-4', category: 'VG', company: 'Vision Gems', date: '2024-12-10', code: 'VG-255', name: 'Ihfas', description: 'Mahenge Lot', weight: 15.2, method: 'Cash', amount: 850000 },
  { id: 'p-5', category: 'Kenya', company: 'Kenya Branch', date: '2024-11-20', code: 'K-055', name: 'Local Buyer', description: 'TSV Rough', weight: 88.4, amount: 210000 },
  { id: 'p-6', category: 'Madagascar', company: 'Madagascar', date: '2024-12-01', code: 'M-012', name: 'Overseas Client', description: 'Moonstone Lot', weight: 150.0, amount: 95000 },
  { id: 'p-7', category: 'VG Tanzania', company: 'VG-T', date: '2024-12-08', code: 'VGT-882', name: 'TZ Merchant', description: 'Rough Spinel', weight: 25.4, amount: 480000 },
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- SIDE PANEL COMPONENT ---
const PaymentDetailPanel: React.FC<{
  item: PaymentRecord;
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-200">
                 {item.category} RECEIVED
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
               <Info size={14} /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Date</div>
                <div className="text-sm font-bold text-stone-800">{item.date}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Weight</div>
                <div className="text-sm font-bold text-stone-800">{item.weight > 0 ? `${item.weight} ct` : '-'}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 col-span-2">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Description</div>
                <div className="text-sm font-medium text-stone-700">{item.description}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={14} /> Amount Details
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Received Amount</div>
                <div className="text-3xl font-black text-emerald-600">LKR {fmt(item.amount)}</div>
                
                {item.method && (
                  <div className="mt-6 pt-4 border-t border-stone-50 flex justify-between items-center">
                    <div className="text-[10px] text-stone-400 font-bold uppercase">Payment Method</div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
                       <CreditCard size={14} className="text-stone-400"/>
                       {item.method}
                    </div>
                  </div>
                )}
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

export const PaymentReceivedTemplate: React.FC<Props> = ({ isReadOnly, moduleId, tabId }) => {
  const [records, setRecords] = useState<PaymentRecord[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Modal/Panel State
  const [selectedItem, setSelectedItem] = useState<PaymentRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentRecord | null>(null);
  const [formCategory, setFormCategory] = useState<PaymentRecord['category']>('SG');

  // --- Statistics ---
  const stats = useMemo(() => {
    const total = records.reduce((sum, r) => sum + r.amount, 0);
    const count = records.length;
    return { total, count };
  }, [records]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        r.name.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) || 
        r.code.toLowerCase().includes(q);
      
      const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, searchQuery, filterCategory]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    if (confirm('Delete this record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: PaymentRecord) => {
    if (editingItem) {
      setRecords(prev => prev.map(r => r.id === item.id ? item : r));
    } else {
      setRecords(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const fmt = (val: number) => val.toLocaleString();

  const CATEGORIES: PaymentRecord['category'][] = ['SG', 'VG', 'Kenya', 'Madagascar', 'VG Tanzania'];

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Standard Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Outstanding <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Global Payments Received</h2>
           <p className="text-stone-500 max-w-xl">Centralized tracking of received payments across all branches and locations.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Calculator size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Entries</div>
                 <div className="text-xl font-bold text-stone-800">{stats.count}</div>
              </div>
           </div>
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <Wallet size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Grand Total</div>
                 <div className="text-xl font-bold text-emerald-600">LKR {fmt(stats.total)}</div>
              </div>
           </div>
        </div>
      </div>

      {/* Standard Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm mb-10 flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by name, code, or description..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
         
         <div className="flex gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl shadow-sm shrink-0">
               <Filter size={16} className="text-stone-400" />
               <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-sm font-bold text-stone-600 outline-none cursor-pointer"
               >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
            </div>
            
            <button className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 shadow-sm transition-all shrink-0">
               <Download size={18} />
            </button>

            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setFormCategory('SG'); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
               >
                  <Plus size={18} /> Add Payment Received
               </button>
            )}
         </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">
         {CATEGORIES.map(category => {
            const sectionItems = filteredData.filter(item => item.category === category);
            if (filterCategory !== 'All' && filterCategory !== category) return null;
            if (sectionItems.length === 0 && filterCategory === 'All') return null;

            return (
               <div key={category} className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                     <h3 className="text-xl font-bold text-stone-800 flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${
                           category === 'SG' ? 'bg-purple-600' :
                           category === 'VG' ? 'bg-pink-600' :
                           category === 'Kenya' ? 'bg-emerald-600' :
                           category === 'Madagascar' ? 'bg-amber-600' :
                           'bg-blue-600'
                        }`}>
                           {category.substring(0, 2)}
                        </span>
                        {category} Payment Received
                     </h3>
                     <div className="text-right">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Subtotal</span>
                        <div className="font-bold text-stone-800">LKR {fmt(sectionItems.reduce((s, i) => s + i.amount, 0))}</div>
                     </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block bg-white rounded-[32px] border border-stone-200 shadow-sm overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                 <th className="p-5 pl-8">Company</th>
                                 <th className="p-5">Date</th>
                                 <th className="p-5">Code</th>
                                 <th className="p-5">Name</th>
                                 <th className="p-5">Description</th>
                                 <th className="p-5 text-right">Weight</th>
                                 <th className="p-5 text-right pr-8">Amount (LKR)</th>
                                 {!isReadOnly && <th className="p-5 w-24"></th>}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-stone-100 text-sm">
                              {sectionItems.map(item => (
                                 <tr 
                                    key={item.id} 
                                    onClick={() => setSelectedItem(item)}
                                    className="hover:bg-purple-50/10 transition-colors cursor-pointer group"
                                 >
                                    <td className="p-5 pl-8">
                                       <span className="font-bold text-[10px] text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 uppercase tracking-wide">
                                          {item.company}
                                       </span>
                                    </td>
                                    <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                                       <Calendar size={14} className="text-stone-300" />
                                       {item.date}
                                    </td>
                                    <td className="p-5 font-mono text-stone-700 font-bold">{item.code}</td>
                                    <td className="p-5 font-bold text-stone-800">{item.name}</td>
                                    <td className="p-5 text-stone-600 max-w-xs truncate">{item.description}</td>
                                    <td className="p-5 text-right font-mono text-stone-600">{item.weight > 0 ? `${item.weight.toFixed(2)} ct` : '-'}</td>
                                    <td className="p-5 text-right font-bold text-emerald-700 pr-8 text-lg">
                                       {fmt(item.amount)}
                                    </td>
                                    {!isReadOnly && (
                                       <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                               onClick={() => { setEditingItem(item); setFormCategory(item.category); setIsFormOpen(true); }}
                                               className="p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                             >
                                                <Edit size={16} />
                                             </button>
                                             <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                     {sectionItems.map(item => (
                        <div 
                           key={item.id}
                           onClick={() => setSelectedItem(item)}
                           className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                    <Calendar size={10} /> {item.date}
                                 </span>
                                 <h4 className="font-bold text-stone-900 text-lg leading-tight">{item.name}</h4>
                                 <div className="text-[10px] font-bold uppercase text-stone-400 mt-1">{item.company}</div>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded border border-stone-200">{item.code}</span>
                           </div>
                           <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Amount</div>
                              <div className="text-2xl font-bold text-emerald-700">LKR {fmt(item.amount)}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            );
         })}
      </div>

      {/* Side Detail Panel */}
      {selectedItem && (
         <PaymentDetailPanel 
            item={selectedItem}
            isReadOnly={isReadOnly}
            onClose={() => setSelectedItem(null)}
            onEdit={() => { setEditingItem(selectedItem); setFormCategory(selectedItem.category); setIsFormOpen(true); setSelectedItem(null); }}
            onDelete={handleDelete}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                  <div>
                     <h3 className="text-2xl font-bold text-stone-900">{editingItem ? 'Edit Payment' : 'Add Payment Received'}</h3>
                     <p className="text-stone-500 text-sm mt-1">Log an incoming payment into the global ledger.</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={24}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: PaymentRecord = {
                     id: editingItem?.id || `pay-${Date.now()}`,
                     category: formCategory,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     weight: Number(formData.get('weight')),
                     method: formData.get('method') as string,
                     amount: Number(formData.get('amount')),
                  };
                  if (!newItem.amount || !newItem.name) return alert('Name and Amount are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3 ml-1">Branch / Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                           {CATEGORIES.map(cat => (
                              <button 
                                 key={cat} 
                                 type="button" 
                                 onClick={() => setFormCategory(cat)}
                                 className={`px-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${formCategory === cat ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'}`}
                              >
                                 {cat}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono outline-none" placeholder="REF-..." />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Company</label>
                           <input name="company" type="text" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Payer Name</label>
                           <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold outline-none" placeholder="Customer Name" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                        <input name="description" type="text" defaultValue={editingItem?.description} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none" placeholder="Payment details..." />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Weight (ct)</label>
                           <input name="weight" type="number" step="0.01" defaultValue={editingItem?.weight} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono outline-none" placeholder="0.00" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Amount (LKR)</label>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
                              <input name="amount" type="number" defaultValue={editingItem?.amount} required className="w-full pl-12 p-4 bg-white border-2 border-stone-200 rounded-2xl text-xl font-bold text-stone-900 focus:border-purple-500 outline-none transition-all" placeholder="0" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-10">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-colors">Cancel</button>
                     <button type="submit" className="px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl shadow-xl hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-2">
                        <Save size={20} /> Save Payment Entry
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};