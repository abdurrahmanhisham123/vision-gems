import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Download, Printer,
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Building2, Tag, Calendar, List
} from 'lucide-react';

// --- Types ---
interface UnifiedSheetItem {
  id: string;
  date: string;
  code: string;
  description: string;
  amount: number;
  currency: string; // LKR, TZS, KSH, USD, etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  category?: string; // Category/Type
  vendor?: string; // Vendor/Payee
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): UnifiedSheetItem[] => {
  return [];
};

// Currency options and exchange rates
const currencies = ['LKR', 'USD', 'TZS', 'KES', 'THB', 'EUR', 'GBP'];
const exchangeRates: Record<string, number> = {
  'LKR': 1.00,
  'USD': 302.50,
  'TZS': 0.1251,
  'KES': 2.33,
  'THB': 8.50,
  'EUR': 330.20,
  'GBP': 385.80
};

const categories = ['Transport', 'Office', 'Service', 'Material', 'Food', 'Utilities', 'Other'];

// --- Field Component (moved outside to prevent recreation) ---
interface FieldProps {
  label: string;
  value: any;
  field: keyof UnifiedSheetItem;
  isEditing: boolean;
  onInputChange: (key: keyof UnifiedSheetItem, value: any) => void;
  type?: 'text' | 'number' | 'date' | 'select';
  highlight?: boolean;
  isCurrency?: boolean;
  options?: string[] | { value: string; label: string }[];
}

const Field: React.FC<FieldProps> = React.memo(({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options }) => {
  return (
    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
      {isEditing ? (
        type === 'select' ? (
          <select 
            value={value === undefined || value === null ? '' : value.toString()} 
            onChange={(e) => onInputChange(field, e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10"
          >
            {options?.map(opt => {
              const optionValue = typeof opt === 'string' ? opt : opt.value;
              const optionLabel = typeof opt === 'string' ? opt : opt.label;
              return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
            })}
          </select>
        ) : (
          <input 
            type={type} 
            value={value === undefined || value === null ? '' : value.toString()} 
            onChange={(e) => {
              const val = type === 'number' ? Number(e.target.value) : e.target.value;
              onInputChange(field, val);
            }}
            onFocus={(e) => {
              if (type === 'number' && (value === 0 || value === null || value === undefined)) {
                e.target.select();
              }
            }}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-slate-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
});

Field.displayName = 'Field';

// --- Detail Panel Component ---
const SheetDetailPanel: React.FC<{
  item: UnifiedSheetItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: UnifiedSheetItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<UnifiedSheetItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  useEffect(() => {
    // Auto-calculate converted amount for foreign currencies
    setFormData(prev => {
      if (prev.currency && prev.currency !== 'LKR' && prev.amount && prev.exchangeRate) {
        const converted = prev.amount * prev.exchangeRate;
        if (prev.convertedAmount !== converted) {
          return { ...prev, convertedAmount: converted };
        }
        return prev;
      } else if (prev.currency === 'LKR' && prev.convertedAmount !== undefined) {
        return { ...prev, convertedAmount: undefined, exchangeRate: undefined };
      }
      return prev;
    });
  }, [formData.amount, formData.exchangeRate, formData.currency]);

  const handleCurrencyChange = useCallback((currency: string) => {
    const rate = exchangeRates[currency] || 1;
    setFormData(prev => {
      if (currency !== 'LKR' && prev.amount) {
        const converted = prev.amount * rate;
        return { 
          ...prev, 
          currency, 
          exchangeRate: rate,
          convertedAmount: converted 
        };
      } else {
        return { 
          ...prev, 
          currency, 
          exchangeRate: undefined,
          convertedAmount: undefined 
        };
      }
    });
  }, []);

  const handleFieldChange = useCallback((field: keyof UnifiedSheetItem, value: any) => {
    if (field === 'amount') {
      setFormData(prev => {
        if (prev.currency && prev.currency !== 'LKR' && prev.exchangeRate) {
          const converted = value * prev.exchangeRate;
          return { ...prev, amount: value, convertedAmount: converted };
        }
        return { ...prev, amount: value };
      });
    } else if (field === 'exchangeRate') {
      setFormData(prev => {
        if (prev.amount) {
          const converted = prev.amount * value;
          return { ...prev, exchangeRate: value, convertedAmount: converted };
        }
        return { ...prev, exchangeRate: value };
      });
    } else if (field === 'currency') {
      handleCurrencyChange(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, [handleCurrencyChange]);

  const handleSave = () => {
    if (!formData.description || !formData.amount) {
      return alert('Description and Amount are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this entry?')) {
      onDelete(formData.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <List size={20} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Sheet Entry</h3>
              <p className="text-xs text-stone-500">{formData.code || 'New Entry'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><List size={14} className="text-slate-500" /> Entry Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date *" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleFieldChange} type="date" />
                <Field label="Code *" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleFieldChange} highlight />
                <Field label="Description *" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={currencies} />
                <Field label="Amount *" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleFieldChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleFieldChange} highlight isCurrency />
                  </>
                )}
                <Field label="Category/Type" value={formData.category} field="category" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={categories} />
                <Field label="Vendor/Payee" value={formData.vendor} field="vendor" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleFieldChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 transition-all">
                <Save size={16} /> Save
              </button>
            </>
          ) : (
            <>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 transition-all">
                    <Edit size={16} /> Edit Entry
                  </button>
                </>
              )}
              <button onClick={onClose} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Template Component ---
export const UnifiedSheetTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly = false }) => {
  const [items, setItems] = useState<UnifiedSheetItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UnifiedSheetItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedSheetItem | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const createNewItem = (): UnifiedSheetItem => ({
    id: `sheet-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    code: `SH-${Date.now().toString().slice(-6)}`,
    description: '',
    amount: 0,
    currency: 'LKR',
    convertedAmount: undefined,
    exchangeRate: undefined,
    category: undefined,
    vendor: undefined,
    notes: undefined
  });

  // Load data from localStorage
  useEffect(() => {
    const storageKey = `unified_sheet_${moduleId}_${tabId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load sheet data:', e);
      }
    }
  }, [moduleId, tabId]);

  // Save data to localStorage
  useEffect(() => {
    const storageKey = `unified_sheet_${moduleId}_${tabId}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, moduleId, tabId]);

  const handleSave = (item: UnifiedSheetItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
      setEditingItem(null);
    } else {
      setItems(prev => [...prev, item]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  // Get unique currencies and categories for filters
  const uniqueCurrencies = useMemo(() => Array.from(new Set(items.map(i => i.currency))).sort(), [items]);
  const uniqueCategories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort(), [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = currencyFilter === 'All' || item.currency === currencyFilter;
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

      return matchesSearch && matchesCurrency && matchesCategory;
    });
  }, [items, searchQuery, currencyFilter, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = filteredItems.length;
    const totalAmount = filteredItems.reduce((sum, item) => {
      const amount = item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0);
      return sum + amount;
    }, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthEntries = filteredItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
    
    // By Category
    const byCategory: Record<string, number> = {};
    filteredItems.forEach(item => {
      if (item.category) {
        byCategory[item.category] = (byCategory[item.category] || 0) + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0));
      }
    });

    return {
      totalEntries,
      totalAmount,
      thisMonthEntries,
      byCategory
    };
  }, [filteredItems]);

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-slate-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredItems.length} entries currently tracked</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Entry
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <List size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Entries</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.totalEntries}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Calendar size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">This Month</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.thisMonthEntries}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <Tag size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Categories</div>
           </div>
           <div className="text-lg font-black text-stone-900">{Object.keys(stats.byCategory).length}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Entries</div>
              <div className="text-2xl font-black text-stone-900">{stats.totalEntries}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <List size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">This Month</div>
              <div className="text-2xl font-black text-stone-900">{stats.thisMonthEntries}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Calendar size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Categories</div>
              <div className="text-2xl font-black text-stone-900">{Object.keys(stats.byCategory).length}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Tag size={28} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
         <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by description, code, vendor, category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-slate-500/5 focus:border-slate-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <DollarSign size={14} className="text-stone-300" />
                  <select 
                     value={currencyFilter} 
                     onChange={(e) => setCurrencyFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Currency</option>
                     {uniqueCurrencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                     ))}
                  </select>
               </div>
               {uniqueCategories.length > 0 && (
                  <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                     <Tag size={14} className="text-stone-300" />
                     <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)} 
                        className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                     >
                        <option value="All">Category</option>
                        {uniqueCategories.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                     </select>
                  </div>
               )}
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Data Table / Cards */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <List size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No entries found</h3>
            <p className="text-stone-500 mb-6">Get started by adding your first sheet entry</p>
            {!isReadOnly && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 transition-all"
              >
                <Plus size={18} /> Add Entry
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                      <th className="p-6 pl-10">Date</th>
                      <th className="p-6">Code</th>
                      <th className="p-6">Description</th>
                      <th className="p-6">Category</th>
                      <th className="p-6">Vendor</th>
                      <th className="p-6 text-right">Amount</th>
                      <th className="p-6 text-right pr-10">LKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-slate-50/5 transition-colors cursor-pointer group"
                      >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                          <span className="font-mono text-xs font-black text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                            {item.code}
                          </span>
                        </td>
                        <td className="p-6 font-medium text-stone-700">{item.description}</td>
                        <td className="p-6">
                          {item.category ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 text-slate-700">{item.category}</span>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                        <td className="p-6 text-stone-600">{item.vendor || '-'}</td>
                        <td className="p-6 text-right font-mono text-stone-700">{item.amount.toLocaleString()} {item.currency}</td>
                        <td className="p-6 text-right pr-10 font-mono font-bold text-slate-700">
                          {item.convertedAmount ? item.convertedAmount.toLocaleString() : (item.currency === 'LKR' ? item.amount.toLocaleString() : '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-black text-slate-700 text-sm mb-1 truncate">{item.code}</div>
                      <div className="text-sm font-bold text-stone-800 truncate">{item.description}</div>
                    </div>
                    {item.category && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 bg-slate-50 text-slate-700">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-stone-500">Vendor:</span>
                      <span className="font-bold text-stone-900 ml-1">{item.vendor || '-'}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Amount:</span>
                      <span className="font-mono font-bold text-stone-900 ml-1">{item.amount.toLocaleString()} {item.currency}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">LKR:</span>
                      <span className="font-mono font-bold text-slate-700 ml-1">
                        {item.convertedAmount ? item.convertedAmount.toLocaleString() : (item.currency === 'LKR' ? item.amount.toLocaleString() : '-')}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500">Date:</span>
                      <span className="font-mono font-bold text-stone-900 ml-1">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <SheetDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={(item) => {
            setItems(prev => prev.map(i => i.id === item.id ? item : i));
            setSelectedItem(item);
          }}
          onDelete={(id) => {
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedItem(null);
          }}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <SheetDetailPanel
          item={editingItem || createNewItem()}
          initialIsEditing={true}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            handleSave(item);
          }}
          onDelete={(id) => {
            handleDelete(id);
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};

