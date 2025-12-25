
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Calendar, User, FileText, 
  Trash2, Edit, X, Briefcase, 
  Filter, Tag, TrendingUp, AlertCircle, CheckCircle,
  ArrowUpCircle, ArrowDownCircle, CheckSquare, Save
} from 'lucide-react';

// --- Types ---
interface ExpenseItem {
  id: string;
  company: string;
  category: 'IN' | 'OUT' | 'CHECKS';
  date: string; // YYYY-MM-DD
  code: string;
  name: string;
  description: string;
  amount: number;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const VGExpensesTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  // UNIQUE KEY: Ensures "Ziyam" data is never shared with "Zahran"
  const STORAGE_KEY = `vg_ledger_data_${moduleId}_${tabId.replace(/\s+/g, '_').toLowerCase()}`;
  
  /**
   * DATA INITIALIZATION
   * Every tab starts as a PURE BLANK array []
   */
  const getInitialData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return []; // Blank start for every single tab
  };

  // --- State ---
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getInitialData());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'IN' | 'OUT' | 'CHECKS'>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseItem>>({
    company: 'VG',
    category: 'OUT',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    code: '',
    name: ''
  });
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * FORCE RESET ON TAB SWITCH
   * When the user clicks a different navigation item, we wipe the current view 
   * and load the specific "locker" for the new tab.
   */
  useEffect(() => {
    setExpenses(getInitialData());
    setSearchQuery('');
    setFilterCategory('All');
  }, [tabId, moduleId]);

  // Persistence: Save to the specific Tab Key
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, STORAGE_KEY]);

  // --- Metrics ---
  const metrics = useMemo(() => {
    const totalIn = expenses.filter(e => e.category === 'IN').reduce((sum, e) => sum + e.amount, 0);
    const totalOut = expenses.filter(e => e.category === 'OUT').reduce((sum, e) => sum + e.amount, 0);
    const totalChecks = expenses.filter(e => e.category === 'CHECKS').reduce((sum, e) => sum + e.amount, 0);
    return { totalIn, totalOut, totalChecks };
  }, [expenses]);

  // --- Filtered Data ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.description.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);

      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, filterCategory]);

  // --- Handlers ---
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      company: 'VG',
      category: 'OUT',
      date: new Date().toISOString().split('T')[0],
      amount: '' as any,
      description: '',
      code: '',
      name: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Record deleted', 'success');
    }
  };

  const handleSave = () => {
    if (!formData.date || !formData.description || !formData.amount || formData.amount <= 0) {
      showToast('Please enter a description and amount.', 'error');
      return;
    }

    const newItem: ExpenseItem = {
      id: editingId || `exp-${Date.now()}`,
      company: formData.company || 'VG',
      category: formData.category || 'OUT',
      date: formData.date,
      description: formData.description,
      amount: Number(formData.amount),
      code: formData.code || '',
      name: formData.name || ''
    };

    if (editingId) {
      setExpenses(prev => prev.map(e => e.id === editingId ? newItem : e));
      showToast('Updated successfully', 'success');
    } else {
      setExpenses(prev => [newItem, ...prev]);
      showToast('Record added', 'success');
    }
    
    setIsModalOpen(false);
  };

  const getCategoryStyles = (category: string) => {
    switch(category) {
      case 'IN': return { border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-800', icon: <ArrowDownCircle size={16} />, text: 'text-emerald-700' };
      case 'OUT': return { border: 'border-l-red-500', badge: 'bg-red-100 text-red-800', icon: <ArrowUpCircle size={16} />, text: 'text-red-700' };
      case 'CHECKS': return { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-800', icon: <CheckSquare size={16} />, text: 'text-blue-700' };
      default: return { border: 'border-l-stone-300', badge: 'bg-stone-100 text-stone-800', icon: <Briefcase size={16} />, text: 'text-stone-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-stone-800">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B46C1] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{moduleId} Ledger</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{tabId} Dashboard</h1>
            </div>
            {!isReadOnly && (
              <button onClick={handleAddNew} className="flex items-center gap-2 px-6 py-3 bg-[#6B46C1] text-white rounded-2xl font-black text-sm shadow-xl hover:bg-[#5839ad] transition-all transform active:scale-95">
                <Plus size={20} /> Add Record
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: 'Total In', val: metrics.totalIn, icon: ArrowDownCircle, color: 'emerald' },
               { label: 'Total Out', val: metrics.totalOut, icon: ArrowUpCircle, color: 'red' },
               { label: 'Total Checks', val: metrics.totalChecks, icon: CheckSquare, color: 'blue' }
            ].map(m => (
              <div key={m.label} className={`bg-white p-6 rounded-3xl border border-${m.color}-100 shadow-sm border-b-4 border-b-${m.color}-500 group hover:shadow-md transition-all`}>
                <div className={`text-[10px] font-black text-${m.color}-600 uppercase tracking-widest mb-2 flex items-center gap-2`}>
                   <m.icon size={14}/> {m.label}
                </div>
                <div className="text-2xl font-black text-gray-900">LKR {m.val.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search descriptions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar">
             <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
               {(['All', 'IN', 'OUT', 'CHECKS'] as const).map(opt => (
                 <button key={opt} onClick={() => setFilterCategory(opt)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${filterCategory === opt ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>{opt}</button>
               ))}
             </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-200">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Empty Ledger</h3>
            <p className="text-stone-400 text-sm mt-1 max-w-xs mx-auto">This tab is currently empty. Records added here are private to this tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map(item => {
              const styles = getCategoryStyles(item.category);
              return (
                <div key={item.id} className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 ${styles.border}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5 ${styles.badge}`}>
                      {styles.icon} {item.category}
                    </span>
                    <span className={`text-xl font-black font-mono ${styles.text}`}>
                      {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><Calendar size={12}/> {item.date}</div><div className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.company}</div></div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.description}</h4>
                    {item.name && <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><User size={14}/> {item.name}</div>}
                  </div>
                  <div className="pt-5 border-t border-gray-100 flex justify-between items-center">
                    <div className="font-mono text-[10px] text-gray-400 font-bold uppercase">{item.code || 'NO-REF'}</div>
                    <div className="flex gap-2">
                       {!isReadOnly && (
                         <><button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><Edit size={16}/></button><button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button></>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-8">{editingId ? 'Edit Record' : 'New Entry'}</h2>
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-2">
                 {(['IN', 'OUT', 'CHECKS'] as const).map(c => (
                   <button key={c} type="button" onClick={() => setFormData({...formData, category: c})} className={`py-3 rounded-2xl border-2 font-black text-xs transition-all ${formData.category === c ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-400'}`}>{c}</button>
                 ))}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Code</label><input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm" placeholder="Ref No" /></div>
               </div>
               <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label><input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold" placeholder="Required" /></div>
               <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount (LKR)</label><input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-4 bg-white border-2 border-purple-100 rounded-2xl text-2xl font-black text-purple-700 focus:border-purple-500 outline-none" placeholder="0" /></div>
            </div>
            <div className="mt-10 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-stone-500 font-bold uppercase tracking-widest hover:bg-stone-100 rounded-2xl">Cancel</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-stone-900 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl hover:bg-stone-800">Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
