import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Download, Printer,
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Building2, MapPin, User, Tag, ArrowRightLeft, Calendar
} from 'lucide-react';

// --- Types ---
interface UnifiedStatementItem {
  id: string;
  date: string;
  code: string;
  company: string;
  name: string; // Name/Account
  description: string;
  location: string;
  person: string; // Person/Responsible
  amount: number;
  currency: string; // LKR, TZS, KSH, USD, THB, etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  type: 'Bank' | 'Cash' | 'Transfer' | 'Cheque' | 'Online' | 'Other'; // Type
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): UnifiedStatementItem[] => {
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

const transactionTypes: UnifiedStatementItem['type'][] = ['Bank', 'Cash', 'Transfer', 'Cheque', 'Online', 'Other'];

// --- Field Component (moved outside to prevent recreation) ---
interface FieldProps {
  label: string;
  value: any;
  field: keyof UnifiedStatementItem;
  isEditing: boolean;
  onInputChange: (key: keyof UnifiedStatementItem, value: any) => void;
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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-violet-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
});

Field.displayName = 'Field';

// --- Detail Panel Component ---
const StatementDetailPanel: React.FC<{
  item: UnifiedStatementItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: UnifiedStatementItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<UnifiedStatementItem>(initialItem);

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

  const handleFieldChange = useCallback((field: keyof UnifiedStatementItem, value: any) => {
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
    if (!formData.description || !formData.amount || !formData.company || !formData.name || !formData.person) {
      return alert('Description, Amount, Company, Name, and Person are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this statement entry?')) {
      onDelete(formData.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-violet-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileText size={20} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Statement Entry</h3>
              <p className="text-xs text-stone-500">{formData.code || 'New Entry'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-violet-500" /> Transaction Information</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date *" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleFieldChange} type="date" />
                <Field label="Code *" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleFieldChange} highlight />
                <Field label="Company *" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Name/Account *" value={formData.name} field="name" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Description *" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Location" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Person/Responsible *" value={formData.person} field="person" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Type *" value={formData.type} field="type" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={transactionTypes} />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={currencies} />
                <Field label="Amount *" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleFieldChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleFieldChange} highlight isCurrency />
                  </>
                )}
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleFieldChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-violet-700 transition-all">
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
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-violet-700 transition-all">
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
export const UnifiedStatementTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly = false }) => {
  const [items, setItems] = useState<UnifiedStatementItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UnifiedStatementItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedStatementItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [personFilter, setPersonFilter] = useState<string>('All');

  const createNewItem = (): UnifiedStatementItem => ({
    id: `stmt-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    code: `ST-${Date.now().toString().slice(-6)}`,
    company: '',
    name: '',
    description: '',
    location: '',
    person: '',
    amount: 0,
    currency: 'LKR',
    convertedAmount: undefined,
    exchangeRate: undefined,
    type: 'Cash',
    notes: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const storageKey = `unified_statement_${moduleId}_${tabId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load statement data:', e);
      }
    }
  }, [moduleId, tabId]);

  // Save data to localStorage
  useEffect(() => {
    const storageKey = `unified_statement_${moduleId}_${tabId}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, moduleId, tabId]);

  const handleSave = (item: UnifiedStatementItem) => {
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

  // Get unique locations and persons for filters
  const locations = useMemo(() => {
    const unique = Array.from(new Set(items.map(i => i.location).filter(Boolean)));
    return unique.sort();
  }, [items]);

  const persons = useMemo(() => {
    const unique = Array.from(new Set(items.map(i => i.person).filter(Boolean)));
    return unique.sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesLocation = locationFilter === 'All' || item.location === locationFilter;
      const matchesPerson = personFilter === 'All' || item.person === personFilter;

      return matchesSearch && matchesType && matchesLocation && matchesPerson;
    });
  }, [items, searchQuery, typeFilter, locationFilter, personFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = filteredItems.length;
    const totalAmount = filteredItems.reduce((sum, item) => {
      const amount = item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0);
      return sum + amount;
    }, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTransactions = filteredItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    const thisMonthAmount = thisMonthTransactions.reduce((sum, item) => {
      const amount = item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0);
      return sum + amount;
    }, 0);
    
    // By Location
    const byLocation: Record<string, number> = {};
    filteredItems.forEach(item => {
      if (item.location) {
        byLocation[item.location] = (byLocation[item.location] || 0) + item.amount;
      }
    });

    // By Person
    const byPerson: Record<string, number> = {};
    filteredItems.forEach(item => {
      if (item.person) {
        byPerson[item.person] = (byPerson[item.person] || 0) + item.amount;
      }
    });

    return {
      totalTransactions,
      totalAmount,
      thisMonthTransactions: thisMonthTransactions.length,
      thisMonthAmount,
      byLocation,
      byPerson
    };
  }, [filteredItems]);

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-violet-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredItems.length} transactions currently tracked</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-900/20 hover:bg-violet-700 active:scale-95 whitespace-nowrap"
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
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Transactions</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.totalTransactions}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Calendar size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">This Month</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.thisMonthTransactions}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <ArrowRightLeft size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Month Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.thisMonthAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Transactions</div>
              <div className="text-2xl font-black text-stone-900">{stats.totalTransactions}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">This Month</div>
              <div className="text-2xl font-black text-stone-900">{stats.thisMonthTransactions}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Calendar size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Month Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.thisMonthAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <ArrowRightLeft size={28} />
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
                  placeholder="Search by company, code, name, description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-violet-500/5 focus:border-violet-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Tag size={14} className="text-stone-300" />
                  <select 
                     value={typeFilter} 
                     onChange={(e) => setTypeFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Type</option>
                     {transactionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                     ))}
                  </select>
               </div>
               {locations.length > 0 && (
                  <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                     <MapPin size={14} className="text-stone-300" />
                     <select 
                        value={locationFilter} 
                        onChange={(e) => setLocationFilter(e.target.value)} 
                        className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                     >
                        <option value="All">Location</option>
                        {locations.map(loc => (
                           <option key={loc} value={loc}>{loc}</option>
                        ))}
                     </select>
                  </div>
               )}
               {persons.length > 0 && (
                  <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                     <User size={14} className="text-stone-300" />
                     <select 
                        value={personFilter} 
                        onChange={(e) => setPersonFilter(e.target.value)} 
                        className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                     >
                        <option value="All">Person</option>
                        {persons.map(person => (
                           <option key={person} value={person}>{person}</option>
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
            <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center mb-4">
              <FileText size={40} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No transactions found</h3>
            <p className="text-stone-500 mb-6">Get started by adding your first statement entry</p>
            {!isReadOnly && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-violet-700 transition-all"
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
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                      <th className="p-6 pl-10">Date</th>
                      <th className="p-6">Code</th>
                      <th className="p-6">Company</th>
                      <th className="p-6">Name/Account</th>
                      <th className="p-6">Description</th>
                      <th className="p-6">Location</th>
                      <th className="p-6">Person</th>
                      <th className="p-6">Type</th>
                      <th className="p-6 text-right">Amount</th>
                      <th className="p-6 text-right pr-10">LKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-violet-50/5 transition-colors cursor-pointer group"
                      >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                          <span className="font-mono text-xs font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100">
                            {item.code}
                          </span>
                        </td>
                        <td className="p-6 font-medium text-stone-700">{item.company}</td>
                        <td className="p-6 font-medium text-stone-800">{item.name}</td>
                        <td className="p-6 text-stone-600">{item.description}</td>
                        <td className="p-6 text-stone-500 text-xs">{item.location || '-'}</td>
                        <td className="p-6 text-stone-700">{item.person}</td>
                        <td className="p-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-700">{item.type}</span>
                        </td>
                        <td className="p-6 text-right font-mono text-stone-700">{item.amount.toLocaleString()} {item.currency}</td>
                        <td className="p-6 text-right pr-10 font-mono font-bold text-violet-700">
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
                      <div className="font-mono font-black text-violet-700 text-sm mb-1 truncate">{item.code}</div>
                      <div className="text-xs text-stone-600 mb-1">{item.company}</div>
                      <div className="text-sm font-bold text-stone-800 truncate">{item.description}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 bg-violet-50 text-violet-700">
                      {item.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-stone-500">Name:</span>
                      <span className="font-bold text-stone-900 ml-1">{item.name}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Location:</span>
                      <span className="font-bold text-stone-900 ml-1">{item.location || '-'}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Person:</span>
                      <span className="font-bold text-stone-900 ml-1">{item.person}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Amount:</span>
                      <span className="font-mono font-bold text-stone-900 ml-1">{item.amount.toLocaleString()} {item.currency}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">LKR:</span>
                      <span className="font-mono font-bold text-violet-700 ml-1">
                        {item.convertedAmount ? item.convertedAmount.toLocaleString() : (item.currency === 'LKR' ? item.amount.toLocaleString() : '-')}
                      </span>
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
        <StatementDetailPanel
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
        <StatementDetailPanel
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

