import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, MapPin, Globe, Wallet, Building2, User
} from 'lucide-react';

// --- Types ---
interface GeneralExpenseItem {
  id: string;
  date: string;
  code: string;
  name: string; // Vendor/Payee
  description: string;
  amount: number;
  currency: string; // "LKR", "TZS", "KSH", "USD"
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  location?: string;
  company?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): GeneralExpenseItem[] => {
  return [
    { 
      id: '1', 
      date: '2024-11-20', 
      code: 'EXP-001', 
      name: 'Local Transport Co', 
      description: 'Stone transport from warehouse', 
      amount: 12500, 
      currency: 'LKR',
      location: 'Colombo'
    },
    { 
      id: '2', 
      date: '2024-11-22', 
      code: 'EXP-002', 
      name: 'Tanzania Logistics', 
      description: 'Freight charges', 
      amount: 50000, 
      currency: 'TZS',
      convertedAmount: 6250,
      exchangeRate: 0.125,
      location: 'Dar es Salaam'
    },
    { 
      id: '3', 
      date: '2024-11-25', 
      code: 'EXP-003', 
      name: 'Kenya Supplies', 
      description: 'Office supplies purchase', 
      amount: 15000, 
      currency: 'KSH',
      convertedAmount: 33750,
      exchangeRate: 2.25,
      location: 'Nairobi'
    },
    { 
      id: '4', 
      date: '2024-11-28', 
      code: 'EXP-004', 
      name: 'VG Services', 
      description: 'Monthly maintenance', 
      amount: 25000, 
      currency: 'LKR',
      company: 'Vision Gems'
    },
  ];
};

// --- Side Panel Component ---
const ExpenseDetailPanel: React.FC<{
  expense: GeneralExpenseItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (expense: GeneralExpenseItem) => void;
  onDelete: (id: string) => void;
  currencies: string[];
  exchangeRates: Record<string, number>;
  isReadOnly?: boolean;
}> = ({ expense: initialExpense, initialIsEditing = false, onClose, onSave, onDelete, currencies, exchangeRates, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<GeneralExpenseItem>(initialExpense);

  useEffect(() => {
    setFormData(initialExpense);
    setIsEditing(initialIsEditing);
  }, [initialExpense, initialIsEditing]);

  const handleInputChange = (key: keyof GeneralExpenseItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Auto-calculate converted amount for foreign currencies
    if (key === 'currency' || key === 'amount' || key === 'exchangeRate') {
      if (formData.currency && formData.currency !== 'LKR' && formData.amount) {
        const rate = exchangeRates[formData.currency] || formData.exchangeRate || 1;
        const converted = Math.floor(formData.amount * rate);
        setFormData(prev => ({ ...prev, convertedAmount: converted, exchangeRate: rate }));
      } else if (formData.currency === 'LKR') {
        setFormData(prev => ({ ...prev, convertedAmount: undefined, exchangeRate: undefined }));
      }
    }
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount || !formData.name) {
      return alert('Description, Amount, and Vendor Name are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this expense?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof GeneralExpenseItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof GeneralExpenseItem, value: any) => void,
    type?: 'text' | 'number' | 'date', 
    highlight?: boolean, 
    isCurrency?: boolean, 
    options?: string[]
  }> = ({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options = [] }) => {
    return (
      <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
        {isEditing ? (
          options.length > 0 ? (
            <select 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input 
              type={type} 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10" 
            />
          )
        ) : (
          <span className={`text-sm ${highlight ? 'font-bold text-red-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
            {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
        
        <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
          <div className="flex gap-3 md:gap-4 items-center min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Wallet size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                  Completed
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-red-200 focus:border-red-500 outline-none w-full" 
                  placeholder="Description" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.description}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <User size={14} className="text-stone-400" />
                <p className="truncate">{formData.name || 'Vendor'} • {formatCurrency(formData.amount, formData.currency)}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={14} className="text-red-500" /> Expense Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Vendor/Name" value={formData.name} field="name" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Currency" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleInputChange} options={currencies} />
                <Field label="Amount" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                    <Field label="LKR Equivalent" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                <Field label="Location" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 transition-all">
                <Save size={16} /> Save
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.print()} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100">
                <Printer size={18} />
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 transition-all">
                    <Edit size={16} /> Edit Expense
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const GeneralExpensesTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<GeneralExpenseItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GeneralExpenseItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GeneralExpenseItem | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalMain = items.reduce((sum, item) => sum + item.amount, 0);
    const totalLKR = items.reduce((sum, item) => 
      sum + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0)), 0
    );
    const foreignCount = items.filter(item => item.currency !== 'LKR').length;
    
    const dates = items.map(i => new Date(i.date));
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return { totalMain, totalLKR, count: items.length, foreignCount, minDate, maxDate };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = 
        (!dateRange.start || item.date >= dateRange.start) &&
        (!dateRange.end || item.date <= dateRange.end);
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
        
      return matchesSearch && matchesDate && matchesCurrency;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, dateRange, currencyFilter]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this expense?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: GeneralExpenseItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: GeneralExpenseItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    setSelectedItem(item);
  };

  const handleDeleteFromPanel = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  // --- Currency Options ---
  const currencies = ['LKR', 'TZS', 'KSH', 'USD'];
  const exchangeRates: Record<string, number> = {
    'TZS': 0.125,
    'KSH': 2.25,
    'USD': 300
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section - More Modern */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-red-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredItems.length} expenses currently tracked</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Expense
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - More Curvy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Expenses</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalLKR.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Transactions</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Foreign Currency</div>
              <div className="text-2xl font-black text-stone-900">{stats.foreignCount}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Globe size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Date Range</div>
              <div className="text-lg font-black text-stone-900">
                {stats.minDate ? stats.minDate.toLocaleDateString() : '-'} 
                {stats.minDate && stats.maxDate ? ' - ' : ''}
                {stats.maxDate ? stats.maxDate.toLocaleDateString() : ''}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Calendar size={28} />
           </div>
        </div>
      </div>

      {/* Toolbar - More Curvy */}
      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
         <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by description, vendor, code, location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Calendar size={14} className="text-stone-300" />
                  <input 
                     type="date" 
                     value={dateRange.start} 
                     onChange={e => setDateRange({...dateRange, start: e.target.value})}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]" 
                  />
                  <span className="text-stone-300 mx-1">-</span>
                  <input 
                     type="date" 
                     value={dateRange.end} 
                     onChange={e => setDateRange({...dateRange, end: e.target.value})}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]" 
                  />
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Globe size={14} className="text-stone-300" />
                  <select 
                     value={currencyFilter}
                     onChange={(e) => setCurrencyFilter(e.target.value)}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">All Currencies</option>
                     {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                     ))}
                  </select>
               </div>
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Desktop Table - More Curvy */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Vendor/Name</th>
                     <th className="p-6">Description</th>
                     <th className="p-6">Location</th>
                     <th className="p-6 text-right">Amount</th>
                     <th className="p-6 text-right pr-10">LKR Equivalent</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-red-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
                              {item.code}
                           </span>
                        </td>
                        <td className="p-6 font-bold text-stone-800">{item.name}</td>
                        <td className="p-6 text-stone-600 max-w-xs truncate" title={item.description}>
                           {item.description}
                        </td>
                        <td className="p-6">
                           {item.location ? (
                              <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                                 <MapPin size={14} />
                                 {item.location}
                              </div>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        <td className="p-6 text-right">
                           <div className="font-black" style={{color: item.currency === 'LKR' ? '#dc2626' : '#7c3aed'}}>
                              {formatCurrency(item.amount, item.currency)}
                           </div>
                        </td>
                        <td className="p-6 text-right pr-10">
                           {item.convertedAmount ? (
                              <div className="font-black text-stone-900">
                                 LKR {item.convertedAmount.toLocaleString()}
                              </div>
                           ) : item.currency === 'LKR' ? (
                              <div className="font-black text-stone-900">
                                 LKR {item.amount.toLocaleString()}
                              </div>
                           ) : (
                              <span className="text-stone-300 text-xs">-</span>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && (
               <div className="p-16 text-center text-stone-400">No expenses found.</div>
            )}
         </div>
      </div>

      {/* Mobile/Tablet Cards - More Curvy */}
      <div className="lg:hidden space-y-4 mb-24">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.description}</h3>
                  </div>
                  <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
                     {item.code}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                     <User size={14} className="text-stone-400" />
                     <span className="truncate font-medium">{item.name}</span>
                  </div>
                  {item.location && (
                     <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-stone-400" />
                        <span className="truncate">{item.location}</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Original Amount</div>
                     <div className="text-lg font-black" style={{color: item.currency === 'LKR' ? '#dc2626' : '#7c3aed'}}>
                        {formatCurrency(item.amount, item.currency)}
                     </div>
                  </div>
                  {item.convertedAmount && (
                     <div className="text-right">
                        <div className="text-xs text-stone-400 font-medium mb-1">LKR Equivalent</div>
                        <div className="text-xl font-black text-stone-900">LKR {item.convertedAmount.toLocaleString()}</div>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <ExpenseDetailPanel 
            expense={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            currencies={currencies}
            exchangeRates={exchangeRates}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <GeneralExpenseForm 
            initialData={editingItem}
            currencies={currencies}
            exchangeRates={exchangeRates}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const GeneralExpenseForm: React.FC<{
  initialData: GeneralExpenseItem | null;
  currencies: string[];
  exchangeRates: Record<string, number>;
  onSave: (item: GeneralExpenseItem) => void;
  onCancel: () => void;
}> = ({ initialData, currencies, exchangeRates, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<GeneralExpenseItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    location: initialData?.location || '',
    company: initialData?.company || '',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
  });

  // Auto-calculate converted amount
  useEffect(() => {
    if (formData.currency && formData.amount && formData.currency !== 'LKR') {
      const rate = exchangeRates[formData.currency] || formData.exchangeRate || 1;
      const converted = Math.floor(formData.amount * rate);
      if (converted !== formData.convertedAmount) {
        setFormData(prev => ({...prev, convertedAmount: converted, exchangeRate: rate}));
      }
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({...prev, convertedAmount: undefined, exchangeRate: undefined}));
    }
  }, [formData.amount, formData.currency, exchangeRates]);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.name) {
      return alert('Description, Amount, and Vendor Name are required');
    }
    
    onSave({
      id: initialData?.id || `exp-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `EXP-${Date.now().toString().slice(-4)}`,
      name: formData.name!,
      description: formData.description!,
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      convertedAmount: formData.convertedAmount,
      exchangeRate: formData.exchangeRate,
      location: formData.location,
      company: formData.company,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Expense' : 'New Expense'}</h3>
             <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={20}/></button>
          </div>

          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Date</label>
                   <input 
                      type="date" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="EXP-001"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Vendor/Name *</label>
                <input 
                   type="text" 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   placeholder="Vendor or payee name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description *</label>
                <textarea 
                   rows={3}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none" 
                   placeholder="Expense description..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                   >
                      {currencies.map(curr => (
                         <option key={curr} value={curr}>{curr}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount *</label>
                   <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.currency !== 'LKR' && formData.convertedAmount && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                   <div className="text-xs font-bold text-red-600 uppercase mb-2">Currency Conversion</div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">Exchange Rate</label>
                         <input 
                            type="number" 
                            step="0.0001" 
                            value={formData.exchangeRate} 
                            onChange={e => setFormData({...formData, exchangeRate: Number(e.target.value)})}
                            className="w-full p-2 border rounded-lg bg-white text-sm" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">LKR Equivalent</label>
                         <input 
                            type="number" 
                            value={formData.convertedAmount} 
                            disabled 
                            className="w-full p-2 border rounded-lg bg-stone-100 text-stone-500 text-sm" 
                         />
                      </div>
                   </div>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location</label>
                   <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                   <input 
                      type="text" 
                      value={formData.company} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Expense
             </button>
          </div>
       </div>
    </div>
  );
};
