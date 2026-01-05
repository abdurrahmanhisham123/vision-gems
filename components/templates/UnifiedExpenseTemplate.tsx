import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer,
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Building2, Wallet, MapPin, Tag, Filter
} from 'lucide-react';

// --- Types ---
interface UnifiedExpenseItem {
  id: string;
  date: string;
  code: string;
  title: string; // Required title for categorization
  vendorName: string; // Vendor/Payee Name
  description: string;
  amount: number;
  currency: string; // LKR, TZS, KSH, USD, THB, etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  location?: string; // Optional, configurable
  company?: string; // Optional, configurable
  category?: string; // Optional, configurable (Category/Type)
  paymentMethod?: string; // Optional payment method
  weight?: number; // Optional weight (for SLExpenses)
  inOutCheque?: string; // IN, OUT, or CHEQUES
  notes?: string;
  sourceTab?: string; // Track which tab the data came from (for payment received tabs)
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): UnifiedExpenseItem[] => {
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

const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'Online Payment', 'Other'];
const expenseCategories = ['Transport', 'Office', 'Service', 'Material', 'Food', 'Utilities', 'Personal', 'Car', 'Other'];
const inOutChequeOptions = ['IN', 'OUT', 'CHEQUES'];

// --- Side Panel Component ---
const ExpenseDetailPanel: React.FC<{
  item: UnifiedExpenseItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: UnifiedExpenseItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<UnifiedExpenseItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  useEffect(() => {
    // Auto-calculate converted amount for foreign currencies
    if (formData.currency && formData.currency !== 'LKR' && formData.amount && formData.exchangeRate) {
      const converted = formData.amount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, convertedAmount: converted }));
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({ ...prev, convertedAmount: undefined, exchangeRate: undefined }));
    }
  }, [formData.amount, formData.exchangeRate, formData.currency]);

  const handleInputChange = (key: keyof UnifiedExpenseItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    if (currency !== 'LKR' && formData.amount) {
      const converted = formData.amount * rate;
      setFormData(prev => ({ 
        ...prev, 
        currency, 
        exchangeRate: rate,
        convertedAmount: converted 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        currency, 
        exchangeRate: undefined,
        convertedAmount: undefined 
      }));
    }
  };

  const handleAmountChange = (amount: number) => {
    if (formData.currency && formData.currency !== 'LKR' && formData.exchangeRate) {
      const converted = amount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, amount, convertedAmount: converted }));
    } else {
      setFormData(prev => ({ ...prev, amount }));
    }
  };

  const handleExchangeRateChange = (rate: number) => {
    if (formData.amount) {
      const converted = formData.amount * rate;
      setFormData(prev => ({ ...prev, exchangeRate: rate, convertedAmount: converted }));
    }
  };

  const handleSave = () => {
    if (!formData.vendorName || !formData.amount || !formData.currency || !formData.title) {
      return alert('Title, Vendor Name, Amount, and Currency are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this expense record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof UnifiedExpenseItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof UnifiedExpenseItem, value: any) => void,
    type?: 'text' | 'number' | 'date' | 'select', 
    highlight?: boolean, 
    isCurrency?: boolean,
    options?: string[]
  }> = ({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options }) => {
    return (
      <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
        {isEditing ? (
          type === 'select' && options ? (
            <select
              value={value === undefined || value === null ? '' : value.toString()}
              onChange={(e) => onInputChange(field, e.target.value)}
              className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/10 appearance-none"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input 
              type={type} 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
              onFocus={(e) => {
                if (type === 'number' && (value === 0 || value === '0' || value === '')) {
                  e.target.select();
                }
              }}
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
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-red-50 text-red-700 border-red-100">
                  Expense
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.vendorName} 
                  onChange={(e) => handleInputChange('vendorName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-red-200 focus:border-red-500 outline-none w-full" 
                  placeholder="Vendor Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.vendorName}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <DollarSign size={14} className="text-stone-400" />
                <p className="truncate">{formatCurrency(formData.amount, formData.currency)} {formData.convertedAmount && formData.currency !== 'LKR' && `• LKR ${formData.convertedAmount.toLocaleString()}`}</p>
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
                <Field label="Title *" value={formData.title} field="title" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Vendor/Payee Name *" value={formData.vendorName} field="vendorName" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleCurrencyChange} type="select" options={currencies} />
                <Field label="Amount *" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleAmountChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleExchangeRateChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                <Field label="Location" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Category/Type" value={formData.category} field="category" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={expenseCategories} />
                <Field label="Payment Method" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={paymentMethods} />
                <Field label="IN / OUT / CHEQUES" value={formData.inOutCheque} field="inOutCheque" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={inOutChequeOptions} />
                <Field label="Weight" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleInputChange} />
                {formData.sourceTab && (
                  <Field label="Source Tab" value={formData.sourceTab} field="sourceTab" isEditing={false} onInputChange={handleInputChange} />
                )}
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
                    <Edit size={16} /> Edit Record
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

// Payment Received Tabs - these should load data from all tabs
const PAYMENT_RECEIVED_TABS = [
  'Payment Received'
];

const isPaymentReceivedTab = (tabId: string): boolean => {
  const tabNormal = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return PAYMENT_RECEIVED_TABS.some(tab => tabNormal === tab.toLowerCase());
};

const loadAllPaymentReceivedData = (): UnifiedExpenseItem[] => {
  const allItems: UnifiedExpenseItem[] = [];
  PAYMENT_RECEIVED_TABS.forEach(tabId => {
    const storageKey = `unified_expense_outstanding_${tabId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const items = JSON.parse(saved);
        items.forEach((item: UnifiedExpenseItem) => {
          allItems.push({ ...item, sourceTab: item.sourceTab || tabId });
        });
      } catch (e) {
        console.error(`Error loading data for ${tabId}:`, e);
      }
    }
  });
  return allItems;
};

const loadSingleTabData = (moduleId: string, tabId: string): UnifiedExpenseItem[] => {
  const storageKey = `unified_expense_${moduleId}_${tabId}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading data for ${moduleId}/${tabId}:`, e);
    }
  }
  return [];
};

export const UnifiedExpenseTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<UnifiedExpenseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter State
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [titleFilter, setTitleFilter] = useState<string>('All');
  const [sourceTabFilter, setSourceTabFilter] = useState<string>('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('All');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<UnifiedExpenseItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedExpenseItem | null>(null);

  // Load data on mount
  useEffect(() => {
    if (isPaymentReceivedTab(tabId)) {
      // Load from all 6 payment received tabs
      const loadedItems = loadAllPaymentReceivedData();
      setItems(loadedItems);
    } else {
      // Load from single tab
      const loadedItems = loadSingleTabData(moduleId, tabId);
      setItems(loadedItems);
    }
  }, [moduleId, tabId]);

  // Save data when items change
  useEffect(() => {
    if (isPaymentReceivedTab(tabId)) {
      // Group items by sourceTab and save to respective storage keys
      const itemsBySource: Record<string, UnifiedExpenseItem[]> = {};
      items.forEach(item => {
        const source = item.sourceTab || tabId;
        if (!itemsBySource[source]) {
          itemsBySource[source] = [];
        }
        itemsBySource[source].push(item);
      });
      
      Object.keys(itemsBySource).forEach(sourceTab => {
        const storageKey = `unified_expense_outstanding_${sourceTab}`;
        localStorage.setItem(storageKey, JSON.stringify(itemsBySource[sourceTab]));
      });
    } else {
      // Save to single tab storage
      const storageKey = `unified_expense_${moduleId}_${tabId}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, moduleId, tabId]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => sum + (item.convertedAmount || item.amount), 0);
    const expenseCount = items.length;
    const avgExpense = expenseCount > 0 ? Math.floor(totalAmount / expenseCount) : 0;
    
    // Expenses this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const expensesThisMonth = items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
    
    // Foreign currency transactions
    const foreignCurrencyCount = items.filter(item => item.currency !== 'LKR').length;
    
    return { totalAmount, count: expenseCount, avgExpense, expensesThisMonth, foreignCurrencyCount };
  }, [items]);

  // --- Filter Options ---
  const uniqueCurrencies = useMemo(() => Array.from(new Set(items.map(i => i.currency))).sort(), [items]);
  const uniqueCategories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort(), [items]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(items.map(i => i.company).filter(Boolean))).sort(), [items]);
  const uniqueTitles = useMemo(() => Array.from(new Set(items.map(i => i.title).filter(Boolean))).sort(), [items]);
  const uniqueSourceTabs = useMemo(() => Array.from(new Set(items.map(i => i.sourceTab).filter(Boolean))).sort(), [items]);
  const uniquePaymentMethods = useMemo(() => Array.from(new Set(items.map(i => i.paymentMethod).filter(Boolean))).sort(), [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = currencyFilter === 'All' || item.currency === currencyFilter;
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesCompany = companyFilter === 'All' || item.company === companyFilter;
      const matchesTitle = titleFilter === 'All' || item.title === titleFilter;
      const matchesSourceTab = sourceTabFilter === 'All' || item.sourceTab === sourceTabFilter;
      const matchesPaymentMethod = paymentMethodFilter === 'All' || item.paymentMethod === paymentMethodFilter;
        
      return matchesSearch && matchesCurrency && matchesCategory && matchesCompany && matchesTitle && 
             matchesSourceTab && matchesPaymentMethod;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, currencyFilter, categoryFilter, companyFilter, titleFilter, sourceTabFilter, paymentMethodFilter]);

  const hasActiveFilters = currencyFilter !== 'All' || categoryFilter !== 'All' || companyFilter !== 'All' || 
                           titleFilter !== 'All' || sourceTabFilter !== 'All' || paymentMethodFilter !== 'All';

  const handleClearFilters = () => {
    setCurrencyFilter('All');
    setCategoryFilter('All');
    setCompanyFilter('All');
    setTitleFilter('All');
    setSourceTabFilter('All');
    setPaymentMethodFilter('All');
    setSearchQuery('');
  };


  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this expense record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: UnifiedExpenseItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: UnifiedExpenseItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    setSelectedItem(item);
  };

  const handleDeleteFromPanel = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const title = (item.title || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const vendorName = (item.vendorName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (item.description || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const location = (item.location || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const category = (item.category || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentMethod = (item.paymentMethod || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const inOutCheque = (item.inOutCheque || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${title}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${vendorName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${description}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${location}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${category}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${paymentMethod}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.weight ? item.weight.toFixed(2) + ' ct' : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${inOutCheque}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${notes}</td>
      </tr>
    `;
    }).join('');

    const safeTabId = tabId.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const printOverlay = document.createElement('div');
    printOverlay.id = 'print-overlay';
    printOverlay.style.position = 'fixed';
    printOverlay.style.top = '0';
    printOverlay.style.left = '0';
    printOverlay.style.width = '100%';
    printOverlay.style.height = '100%';
    printOverlay.style.backgroundColor = '#ffffff';
    printOverlay.style.zIndex = '99999';
    printOverlay.style.overflow = 'auto';
    printOverlay.style.padding = '40px';
    printOverlay.style.fontFamily = 'Arial, sans-serif';
    
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-overlay,
        #print-overlay * {
          visibility: visible;
        }
        #print-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          background: white;
        }
        @page {
          size: landscape;
          margin: 0.5in;
        }
        .no-print {
          display: none !important;
        }
      }
      @media screen {
        #print-overlay {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);
    
    printOverlay.innerHTML = `
      <div style="max-width: 100%; margin: 0 auto;">
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #000000;">
          <h1 style="font-size: 24pt; font-weight: bold; margin-bottom: 5px; color: #000000; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Vision Gems</h1>
          <p style="font-size: 9pt; color: #333333; margin: 0;">Printed on: ${printDate} at ${printTime}</p>
        </div>
        <div style="font-size: 16pt; font-weight: bold; margin: 10px 0; text-transform: uppercase; color: #000000;">${safeTabId}</div>
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 10px; font-size: 8pt;">
          <colgroup>
            <col style="width: 6%;">
            <col style="width: 6%;">
            <col style="width: 8%;">
            <col style="width: 9%;">
            <col style="width: 11%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 6%;">
            <col style="width: 6%;">
            <col style="width: 5%;">
            <col style="width: 6%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 6%;">
            <col style="width: 7%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Title</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Vendor</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Description</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Location</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Category</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Method</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">IN/OUT/CHEQUES</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="15" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No expenses found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(printOverlay);

    setTimeout(() => {
      window.print();
    }, 100);

    const handleAfterPrint = () => {
      if (document.body.contains(printOverlay)) {
        document.body.removeChild(printOverlay);
      }
      const printStyles = document.getElementById('print-styles');
      if (printStyles) {
        printStyles.remove();
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-red-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Unified Expense in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
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

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0">
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
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Expenses</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.count}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Globe size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Foreign Currency</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              {stats.foreignCurrencyCount}
           </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Wallet size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">This Month</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.expensesThisMonth}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Expenses</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Avg Expense Amount</div>
              <div className="text-2xl font-black text-stone-900">
                {stats.count > 0 ? `LKR ${stats.avgExpense.toLocaleString()}` : '-'}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Globe size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Expenses This Month</div>
              <div className="text-2xl font-black text-stone-900">{stats.expensesThisMonth}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Wallet size={28} />
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
                  placeholder="Search by title, vendor, code, description, location, company, category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
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
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Building2 size={14} className="text-stone-300" />
                  <select 
                     value={companyFilter} 
                     onChange={(e) => setCompanyFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Company</option>
                     {uniqueCompanies.map(comp => (
                        <option key={comp} value={comp}>{comp}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <FileText size={14} className="text-stone-300" />
                  <select 
                     value={titleFilter} 
                     onChange={(e) => setTitleFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Title</option>
                     {uniqueTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                     ))}
                  </select>
               </div>
               {isPaymentReceivedTab(tabId) && uniqueSourceTabs.length > 0 && (
                  <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                     <MapPin size={14} className="text-stone-300" />
                     <select 
                        value={sourceTabFilter} 
                        onChange={(e) => setSourceTabFilter(e.target.value)} 
                        className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
                     >
                        <option value="All">Source Tab</option>
                        {uniqueSourceTabs.map(tab => (
                           <option key={tab} value={tab}>{tab}</option>
                        ))}
                     </select>
                  </div>
               )}
               {uniquePaymentMethods.length > 0 && (
                  <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                     <Wallet size={14} className="text-stone-300" />
                     <select 
                        value={paymentMethodFilter} 
                        onChange={(e) => setPaymentMethodFilter(e.target.value)} 
                        className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
                     >
                        <option value="All">Payment Method</option>
                        {uniquePaymentMethods.map(method => (
                           <option key={method} value={method}>{method}</option>
                        ))}
                     </select>
                  </div>
               )}
               {hasActiveFilters && (
                  <button
                     onClick={handleClearFilters}
                     className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-[20px] text-xs font-bold hover:bg-red-100 transition-all shrink-0 flex items-center gap-2"
                  >
                     <X size={14} /> Clear Filters
                  </button>
               )}
            </div>
         </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Vendor</th>
                     <th className="p-6">Description</th>
                     <th className="p-6">Location</th>
                     <th className="p-6">Company</th>
                     {isPaymentReceivedTab(tabId) && <th className="p-6">Source Tab</th>}
                     <th className="p-6">IN/OUT/CHEQUES</th>
                     <th className="p-6 text-right pr-10">Amount</th>
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
                        <td className="p-6 text-stone-600 font-medium">{item.vendorName}</td>
                        <td className="p-6 text-stone-600 max-w-xs truncate" title={item.description}>
                           {item.description}
                        </td>
                        <td className="p-6 text-stone-600">{item.location || <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 text-stone-600">{item.company || <span className="text-stone-300">-</span>}</td>
                        {isPaymentReceivedTab(tabId) && (
                           <td className="p-6">
                              {item.sourceTab ? (
                                 <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    {item.sourceTab}
                                 </span>
                              ) : (
                                 <span className="text-stone-300">-</span>
                              )}
                           </td>
                        )}
                        <td className="p-6">
                           {item.inOutCheque ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                 item.inOutCheque === 'IN' ? 'bg-green-50 text-green-700 border border-green-200' :
                                 item.inOutCheque === 'OUT' ? 'bg-red-50 text-red-700 border border-red-200' :
                                 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                 {item.inOutCheque}
                              </span>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="font-black text-red-700">
                              {formatCurrency(item.amount, item.currency)}
                              {item.convertedAmount && item.currency !== 'LKR' && (
                                 <span className="text-xs text-stone-500 ml-2">(LKR {item.convertedAmount.toLocaleString()})</span>
                              )}
                           </div>
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

      {/* Mobile/Tablet Cards */}
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
                        <Wallet size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.vendorName}</h3>
                  </div>
                  <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
                     {item.code}
                  </span>
               </div>

               {item.description && (
                  <div className="mb-4 relative z-10">
                     <div className="text-sm text-stone-600">{item.description}</div>
                  </div>
               )}

               <div className="mb-4 relative z-10 space-y-2">
                  {item.location && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <MapPin size={14} className="text-stone-400" />
                        <span>{item.location}</span>
                     </div>
                  )}
                  {item.company && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Building2 size={14} className="text-stone-400" />
                        <span>{item.company}</span>
                     </div>
                  )}
                  {item.category && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Tag size={14} className="text-stone-400" />
                        <span>{item.category}</span>
                     </div>
                  )}
                  {item.inOutCheque && (
                     <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                           item.inOutCheque === 'IN' ? 'bg-green-50 text-green-700 border border-green-200' :
                           item.inOutCheque === 'OUT' ? 'bg-red-50 text-red-700 border border-red-200' :
                           'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                           {item.inOutCheque}
                        </span>
                     </div>
                  )}
                  {item.sourceTab && (
                     <div className="flex items-center gap-2 text-sm">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                           Source: {item.sourceTab}
                        </span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Amount</div>
                     <div className="text-xl font-black text-red-700">
                        {formatCurrency(item.amount, item.currency)}
                        {item.convertedAmount && item.currency !== 'LKR' && (
                           <span className="text-sm text-stone-500 ml-2">(LKR {item.convertedAmount.toLocaleString()})</span>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <ExpenseDetailPanel 
            item={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <ExpenseForm 
            initialData={editingItem}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
            moduleId={moduleId}
            tabId={tabId}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const ExpenseForm: React.FC<{
  initialData: UnifiedExpenseItem | null;
  onSave: (item: UnifiedExpenseItem) => void;
  onCancel: () => void;
  moduleId: string;
  tabId: string;
}> = ({ initialData, onSave, onCancel, moduleId, tabId }) => {
  const [formData, setFormData] = useState<Partial<UnifiedExpenseItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    title: initialData?.title || '',
    vendorName: initialData?.vendorName || '',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
    location: initialData?.location || '',
    company: initialData?.company || '',
    category: initialData?.category || '',
    paymentMethod: initialData?.paymentMethod || '',
    weight: initialData?.weight,
    inOutCheque: initialData?.inOutCheque || '',
    notes: initialData?.notes || '',
    sourceTab: initialData?.sourceTab || (isPaymentReceivedTab(tabId) ? tabId : undefined),
  });

  useEffect(() => {
    // Auto-calculate converted amount for foreign currencies
    if (formData.currency && formData.currency !== 'LKR' && formData.amount && formData.exchangeRate) {
      const converted = formData.amount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, convertedAmount: converted }));
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({ ...prev, convertedAmount: undefined, exchangeRate: undefined }));
    }
  }, [formData.amount, formData.exchangeRate, formData.currency]);

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    if (currency !== 'LKR' && formData.amount) {
      const converted = (formData.amount || 0) * rate;
      setFormData(prev => ({ 
        ...prev, 
        currency, 
        exchangeRate: rate,
        convertedAmount: converted 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        currency, 
        exchangeRate: undefined,
        convertedAmount: undefined 
      }));
    }
  };

  const handleAmountChange = (amount: number) => {
    if (formData.currency && formData.currency !== 'LKR' && formData.exchangeRate) {
      const converted = amount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, amount, convertedAmount: converted }));
    } else {
      setFormData(prev => ({ ...prev, amount }));
    }
  };

  const handleExchangeRateChange = (rate: number) => {
    if (formData.amount) {
      const converted = (formData.amount || 0) * rate;
      setFormData(prev => ({ ...prev, exchangeRate: rate, convertedAmount: converted }));
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.vendorName || !formData.amount || !formData.currency) {
      return alert('Title, Vendor Name, Amount, and Currency are required');
    }
    
    onSave({
      id: initialData?.id || `expense-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `EXP-${Date.now().toString().slice(-4)}`,
      title: formData.title!,
      vendorName: formData.vendorName!,
      description: formData.description || '',
      amount: Number(formData.amount),
      currency: formData.currency!,
      exchangeRate: formData.exchangeRate,
      convertedAmount: formData.convertedAmount,
      location: formData.location,
      company: formData.company,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      weight: formData.weight,
      inOutCheque: formData.inOutCheque,
      notes: formData.notes,
      sourceTab: formData.sourceTab || (isPaymentReceivedTab(tabId) ? tabId : undefined),
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
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Title *</label>
                <input 
                   type="text" 
                   value={formData.title || ''} 
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   placeholder="Enter expense title"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Vendor/Payee Name *</label>
                <input 
                   type="text" 
                   value={formData.vendorName} 
                   onChange={e => setFormData({...formData, vendorName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   placeholder="Vendor or payee name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                <textarea 
                   rows={2}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none" 
                   placeholder="Expense description..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency *</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => handleCurrencyChange(e.target.value)}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
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
                      onChange={e => handleAmountChange(Number(e.target.value))}
                      onFocus={(e) => {
                        if (formData.amount === 0 || formData.amount === null || formData.amount === undefined) {
                          e.target.select();
                        }
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.currency !== 'LKR' && (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Exchange Rate</label>
                      <input 
                         type="number" 
                         step="0.0001"
                         value={formData.exchangeRate || ''} 
                         onChange={e => handleExchangeRateChange(Number(e.target.value))}
                         onFocus={(e) => {
                           if (formData.exchangeRate === 0 || formData.exchangeRate === null || formData.exchangeRate === undefined) {
                             e.target.select();
                           }
                         }}
                         className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                         placeholder="0.0000"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Converted Amount (LKR)</label>
                      <input 
                         type="number" 
                         value={formData.convertedAmount || ''} 
                         disabled
                         className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-bold text-stone-600" 
                         placeholder="Auto-calculated"
                      />
                   </div>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location</label>
                   <input 
                      type="text" 
                      value={formData.location || ''} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                   <input 
                      type="text" 
                      value={formData.company || ''} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Category/Type</label>
                   <select 
                      value={formData.category || ''} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
                   >
                      <option value="">Select category</option>
                      {expenseCategories.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payment Method</label>
                   <select 
                      value={formData.paymentMethod || ''} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
                   >
                      <option value="">Select method</option>
                      {paymentMethods.map(method => (
                         <option key={method} value={method}>{method}</option>
                      ))}
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">IN / OUT / CHEQUES</label>
                <select 
                   value={formData.inOutCheque || ''} 
                   onChange={e => setFormData({...formData, inOutCheque: e.target.value})}
                   className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
                >
                   <option value="">Select option</option>
                   {inOutChequeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                   ))}
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Weight</label>
                <input 
                   type="number" 
                   step="0.01"
                   value={formData.weight || ''} 
                   onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   placeholder="Optional (for weight-based expenses)"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
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

