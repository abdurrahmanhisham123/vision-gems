
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, User, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Building2,
  ChevronRight, ArrowRight, Wallet,
  ShieldCheck, Calculator, Download, Printer
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---

interface ShareEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  amount: number;
}

// --- Mock Data ---

const INITIAL_DATA: ShareEntry[] = [
  { 
    id: 'shr-1', 
    company: 'Vision Gems', 
    date: '2024-11-20', 
    code: 'DIS-01', 
    name: "Fawaz's Wife", 
    description: 'Monthly Dividend Distribution', 
    amount: 1500000 
  },
  { 
    id: 'shr-2', 
    company: 'Spinel Gallery', 
    date: '2024-12-05', 
    code: 'SHR-22', 
    name: "Fawaz's Wife", 
    description: 'Profit Share - BKK Batch 4', 
    amount: 2850000 
  },
  { 
    id: 'shr-3', 
    company: 'Vision Gems', 
    date: '2025-01-10', 
    code: 'PAY-102', 
    name: "Fawaz's Wife", 
    description: 'Quarterly Investment Returns', 
    amount: 5450000 
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const PartnerSharesTemplate: React.FC<Props> = ({ isReadOnly, moduleId, tabId }) => {
  const [shares, setShares] = useState<ShareEntry[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedShare, setSelectedShare] = useState<ShareEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShareEntry | null>(null);

  // --- Calculations ---
  const totalShares = useMemo(() => shares.reduce((sum, s) => sum + s.amount, 0), [shares]);

  // --- Filtered Data ---
  const filteredShares = useMemo(() => {
    return shares.filter(s => 
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shares, searchQuery]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this share record?')) {
      setShares(prev => prev.filter(s => s.id !== id));
      if (selectedShare?.id === id) setSelectedShare(null);
    }
  };

  const handleSave = (item: ShareEntry) => {
    if (editingItem) {
      setShares(prev => prev.map(s => s.id === item.id ? item : s));
    } else {
      setShares(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Standard Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> Partner Distribution
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Partner Shares</h2>
           <p className="text-stone-500 max-w-xl">Detailed record of profit distribution, capital returns, and dividend payments.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Wallet size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Distributed</div>
                 <div className="text-xl font-bold text-stone-800">LKR {totalShares.toLocaleString()}</div>
              </div>
           </div>
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <CheckCircle size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Entries</div>
                 <div className="text-xl font-bold text-stone-800">{shares.length}</div>
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
               placeholder="Search by name, code, description..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
         
         <div className="flex gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 transition-all" title="Download Report">
               <Download size={18} />
            </button>
            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
               >
                  <Plus size={18} /> Add Record
               </button>
            )}
         </div>
      </div>

      {/* Grid View for Mobile/Tablet & Table for Desktop */}
      
      {/* 1. Cards Grid (Mobile/Tablet) */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
         {filteredShares.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedShare(item)}
               className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 uppercase border border-stone-200">{item.company}</span>
                     </div>
                     <h3 className="text-xl font-bold text-stone-900 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                  </div>
                  <div className="font-mono text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md border border-stone-200">{item.code}</div>
               </div>
               
               <p className="text-sm text-stone-600 mb-6 line-clamp-2 min-h-[40px] leading-relaxed italic">"{item.description}"</p>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
                  <div>
                     <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Amount Paid</div>
                     <div className="text-2xl font-bold text-stone-900">LKR {item.amount.toLocaleString()}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110">
                     <ChevronRight size={20} />
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* 2. Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 pl-8">Company</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right">Amount (LKR)</th>
                  {!isReadOnly && <th className="p-5 w-24"></th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredShares.map(item => (
                  <tr 
                     key={item.id} 
                     onClick={() => setSelectedShare(item)}
                     className="hover:bg-purple-50/10 transition-colors cursor-pointer group"
                  >
                     <td className="p-5 pl-8">
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
                     <td className="p-5 text-stone-600 truncate max-w-xs">{item.description}</td>
                     <td className="p-5 text-right">
                        <span className="font-bold text-stone-900 text-base">
                           {item.amount.toLocaleString()}
                        </span>
                     </td>
                     {!isReadOnly && (
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}
                                className="p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
         {filteredShares.length === 0 && (
            <div className="p-20 text-center text-stone-400 flex flex-col items-center">
               <Briefcase size={48} className="mb-4 text-stone-200" />
               <p>No share records found matching your filters.</p>
            </div>
         )}
      </div>

      {/* Detail Modal */}
      {selectedShare && (
         <DetailModal 
            isOpen={!!selectedShare}
            onClose={() => setSelectedShare(null)}
            title={selectedShare.name}
            subtitle={selectedShare.description}
            status="Processed"
            statusColor="bg-emerald-50 text-emerald-700 border-emerald-100"
            icon={<Briefcase size={32} className="text-purple-600" />}
            onEdit={!isReadOnly ? () => { setEditingItem(selectedShare); setIsFormOpen(true); setSelectedShare(null); } : undefined}
            data={{
               'Company': selectedShare.company,
               'Date': selectedShare.date,
               'Code': selectedShare.code,
               'Recipient': selectedShare.name,
               'Description': selectedShare.description,
               'Amount Paid': `LKR ${selectedShare.amount.toLocaleString()}`
            }}
         />
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <div>
                     <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Share' : 'New Share Record'}</h3>
                     <p className="text-stone-500 text-xs mt-1">Enter distribution details below</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: ShareEntry = {
                     id: editingItem?.id || `shr-${Date.now()}`,
                     company: formData.get('company') as string,
                     date: formData.get('date') as string,
                     code: formData.get('code') as string,
                     name: formData.get('name') as string,
                     description: formData.get('description') as string,
                     amount: Number(formData.get('amount')),
                  };
                  
                  if (!newItem.amount || !newItem.name) return alert('Name and Amount are required');
                  handleSave(newItem);
               }}>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Date</label>
                           <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                           <input name="code" type="text" defaultValue={editingItem?.code} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" placeholder="SHR-..." />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                        <select name="company" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all cursor-pointer">
                           <option>Vision Gems</option>
                           <option>Spinel Gallery</option>
                           <option>BKK Office</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Recipient Name</label>
                        <input name="name" type="text" defaultValue={editingItem?.name || "Fawaz's Wife"} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                        <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none" placeholder="e.g. Profit share for Batch X" />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount (LKR)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} className="w-full pl-12 p-3 bg-white border-2 border-stone-200 rounded-xl text-xl font-bold text-stone-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" placeholder="0.00" />
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
