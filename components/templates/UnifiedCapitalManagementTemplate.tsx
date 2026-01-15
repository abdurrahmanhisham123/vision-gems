import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Plus, Download, Printer, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Building2, TrendingUp, Wallet, Coins, Calendar, Filter,
  ShoppingBag, RefreshCw, Users
} from 'lucide-react';
import { APP_MODULES } from '../../constants';

// --- Types ---
interface CapitalItem {
  id: string;
  date: string;
  code: string;
  transactionType: 'purchased' | 'exchange' | 'shares'; // Transaction type
  vendorName: string; // Vendor/Entity Name
  currency: string; // USD, LKR, etc.
  amount: number; // Amount for Purchased tab
  exchangeAmount?: number; // Amount for Exchanged tab (separate from purchased amount)
  exchangeRate: number;
  convertedAmount: number; // Amount in LKR for Purchased tab
  exchangeConvertedAmount?: number; // Amount in LKR for Exchanged tab (separate from purchased converted amount)
  location?: string; // Optional location
  company?: string; // Optional company
  description?: string; // Optional description
  paymentMethod?: string; // Payment method (Cash, Card, Bank Transfer, Cheque, etc.)
  notes?: string;
  sourceModule?: string; // For aggregated data: which module this came from
  sourceTab?: string; // For aggregated data: which tab this came from
  // For Exchanged tab
  exchangeName?: string; // Exchange Name
  tanzaniaRate?: number; // Tanzania Rate
  tShiling?: number; // T Shiling
  dividedTSL?: number; // Devided T / SL
  // For Shares tab
  dollarEachAmount?: number; // $ Each Amount
  rsEachAmount?: number; // Rs Each Amount
  shiEachAmount?: number; // Shi Each Amount
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): CapitalItem[] => {
  return [];
};

// Currency options and exchange rates
const currencies = ['USD', 'LKR', 'EUR', 'GBP', 'TZS', 'KES'];
const exchangeRates: Record<string, number> = {
  'USD': 302.50,
  'LKR': 1.00,
  'EUR': 330.20,
  'GBP': 385.80,
  'TZS': 0.1251,
  'KES': 2.33
};

// Payment method options
const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Online Payment', 'Other'];

// --- TabButton Component ---
const TabButton: React.FC<{ 
  id: string, 
  activeTab: string, 
  label: string, 
  icon: any, 
  onClick: (id: any) => void 
}> = ({ id, activeTab, label, icon: Icon, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all border-b-2 ${activeTab === id ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
  >
    <Icon size={18} className="mb-1" />
    <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
  </button>
);

// --- Field Component (moved outside to prevent recreation on every render) ---
const Field: React.FC<{ 
  label: string, 
  value: any, 
  field: keyof CapitalItem, 
  isEditing: boolean, 
  onInputChange: (key: keyof CapitalItem, value: any) => void,
  type?: 'text' | 'number' | 'date' | 'select', 
  highlight?: boolean, 
  isCurrency?: boolean,
  options?: string[]
}> = React.memo(({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options }) => {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const wasFocused = useRef(false);
  const cursorPosition = useRef<number | null>(null);
  
  useEffect(() => {
    // Restore focus if it was previously focused
    if (wasFocused.current && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
      // For text inputs, restore cursor position
      if (inputRef.current instanceof HTMLInputElement && inputRef.current.type !== 'number' && cursorPosition.current !== null) {
        inputRef.current.setSelectionRange(cursorPosition.current, cursorPosition.current);
      }
    }
  });
  
  return (
    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
      {isEditing ? (
        type === 'select' && options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value === undefined || value === null ? '' : value.toString()}
            onChange={(e) => onInputChange(field, e.target.value)}
            onFocus={() => { wasFocused.current = true; }}
            onBlur={() => { wasFocused.current = false; }}
            className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none"
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input 
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type} 
            value={value === undefined || value === null ? '' : value.toString()} 
            onChange={(e) => {
              if (e.target instanceof HTMLInputElement) {
                cursorPosition.current = e.target.selectionStart;
              }
              onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value);
            }} 
            onFocus={(e) => {
              wasFocused.current = true;
              if (type === 'number' && (value === 0 || value === '0' || value === '')) {
                e.target.select();
              } else if (e.target instanceof HTMLInputElement) {
                cursorPosition.current = e.target.selectionStart;
              }
            }}
            onBlur={() => { wasFocused.current = false; }}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-indigo-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually changed
  return (
    prevProps.label === nextProps.label &&
    prevProps.value === nextProps.value &&
    prevProps.field === nextProps.field &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.type === nextProps.type &&
    prevProps.highlight === nextProps.highlight &&
    prevProps.isCurrency === nextProps.isCurrency &&
    prevProps.onInputChange === nextProps.onInputChange &&
    JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
  );
});

// --- Side Panel Component ---
const CapitalDetailPanel: React.FC<{
  item: CapitalItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: CapitalItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = React.memo(({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<CapitalItem>(initialItem);
  const [activeTab, setActiveTab] = useState<'purchased' | 'exchange' | 'shares'>(
    initialItem.transactionType || 'purchased'
  );

  useEffect(() => {
    // Only update formData if the item ID actually changed (not just object reference)
    if (initialItem.id !== formData.id) {
      setFormData(initialItem);
      setActiveTab(initialItem.transactionType || 'purchased');
    }
    setIsEditing(initialIsEditing);
  }, [initialItem.id, initialIsEditing]);

  useEffect(() => {
    setActiveTab(formData.transactionType || 'purchased');
  }, [formData.transactionType]);

  // Removed useEffect for convertedAmount - handleAmountChange and handleExchangeRateChange handle it directly
  // This prevents double updates that cause re-renders and focus loss

  const handleInputChange = useCallback((key: keyof CapitalItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    setFormData(prev => {
      // Use the appropriate amount field based on active tab
      const amount = activeTab === 'exchange' ? (prev.exchangeAmount || 0) : (prev.amount || 0);
      const converted = amount * rate;
      // Update the appropriate converted amount field based on active tab
      if (activeTab === 'exchange') {
        return { 
          ...prev, 
          currency, 
          exchangeRate: rate,
          exchangeConvertedAmount: converted 
        };
      } else {
        return { 
          ...prev, 
          currency, 
          exchangeRate: rate,
          convertedAmount: converted 
        };
      }
    });
  };

  const handleAmountChange = useCallback((key: keyof CapitalItem, value: any) => {
    const amount = typeof value === 'number' ? value : (value === '' ? 0 : Number(value) || 0);
    setFormData(prev => {
      const exchangeRate = prev.exchangeRate || 1;
      const converted = amount * exchangeRate;
      // Use the appropriate fields based on active tab
      if (activeTab === 'exchange') {
        // Calculate T Shiling = exchangeAmount × tanzaniaRate
        const tShiling = amount * (prev.tanzaniaRate || 0);
        // Calculate $ Each Amount for Shares tab = exchangeAmount ÷ 2
        const dollarEachAmount = amount / 2;
        // Calculate Rs Each Amount for Shares tab = exchangeConvertedAmount ÷ 2
        const rsEachAmount = converted / 2;
        // Calculate Shi Each Amount for Shares tab = tShiling ÷ 2
        const shiEachAmount = tShiling / 2;
        return { ...prev, exchangeAmount: amount, exchangeConvertedAmount: converted, tShiling, dollarEachAmount, rsEachAmount, shiEachAmount };
      } else {
        return { ...prev, amount, convertedAmount: converted };
      }
    });
  }, [activeTab]);

  const handleExchangeRateChange = useCallback((key: keyof CapitalItem, value: any) => {
    const rate = typeof value === 'number' ? value : (value === '' ? 0 : Number(value) || 0);
    setFormData(prev => {
      // Use the appropriate amount field based on active tab
      const amount = activeTab === 'exchange' ? (prev.exchangeAmount || 0) : (prev.amount || 0);
      const converted = amount * rate;
      // Update the appropriate converted amount field based on active tab
      if (activeTab === 'exchange') {
        // Calculate Divided T / SL = $ SL Rate ÷ Tanzania Rate
        const tanzaniaRate = prev.tanzaniaRate || 0;
        const dividedTSL = tanzaniaRate > 0 ? rate / tanzaniaRate : 0;
        // Calculate Rs Each Amount for Shares tab = exchangeConvertedAmount ÷ 2
        const rsEachAmount = converted / 2;
        return { ...prev, exchangeRate: rate, exchangeConvertedAmount: converted, dividedTSL, rsEachAmount };
      } else {
        return { ...prev, exchangeRate: rate, convertedAmount: converted };
      }
    });
  }, [activeTab]);

  const handleTanzaniaRateChange = useCallback((key: keyof CapitalItem, value: any) => {
    const tanzaniaRate = typeof value === 'number' ? value : (value === '' ? 0 : Number(value) || 0);
    setFormData(prev => {
      // Calculate T Shiling = exchangeAmount × tanzaniaRate
      const exchangeAmount = prev.exchangeAmount || 0;
      const tShiling = exchangeAmount * tanzaniaRate;
      // Calculate Divided T / SL = $ SL Rate ÷ Tanzania Rate
      const exchangeRate = prev.exchangeRate || 0;
      const dividedTSL = tanzaniaRate > 0 ? exchangeRate / tanzaniaRate : 0;
      return { ...prev, tanzaniaRate, tShiling, dividedTSL };
    });
  }, []);

  const handleSave = () => {
    // Validate based on active tab
    if (activeTab === 'exchange') {
      if (!formData.vendorName || (formData.exchangeAmount === undefined || formData.exchangeAmount === null) || !formData.currency || !formData.transactionType) {
        return alert('Vendor Name, Amount, Currency, and Transaction Type are required');
      }
    } else {
      if (!formData.vendorName || !formData.amount || !formData.currency || !formData.transactionType) {
        return alert('Vendor Name, Amount, Currency, and Transaction Type are required');
      }
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this capital entry?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
        
        <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
          <div className="flex gap-3 md:gap-4 items-center min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                  formData.transactionType === 'purchased' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  formData.transactionType === 'exchange' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {formData.transactionType === 'purchased' ? 'Purchase' : formData.transactionType === 'exchange' ? 'Exchange' : 'Shares'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-indigo-50 text-indigo-700 border-indigo-100">
                  Capital Entry
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.vendorName} 
                  onChange={(e) => handleInputChange('vendorName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-indigo-200 focus:border-indigo-500 outline-none w-full" 
                  placeholder="Vendor Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.vendorName}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <Coins size={14} className="text-stone-400" />
                <p className="truncate">{formatCurrency(activeTab === 'exchange' ? (formData.exchangeAmount || 0) : formData.amount, formData.currency)} • LKR {(activeTab === 'exchange' ? (formData.exchangeConvertedAmount || 0) : formData.convertedAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex border-b border-stone-200 bg-white shrink-0 overflow-x-auto hide-scrollbar">
          <TabButton id="purchased" activeTab={activeTab} label="Purchased" icon={ShoppingBag} onClick={(id) => { setActiveTab(id as any); if (isEditing) handleInputChange('transactionType', id); }} />
          <TabButton id="exchange" activeTab={activeTab} label="Exchanged" icon={RefreshCw} onClick={(id) => { setActiveTab(id as any); if (isEditing) handleInputChange('transactionType', id); }} />
          <TabButton id="shares" activeTab={activeTab} label="Shares" icon={Users} onClick={(id) => { setActiveTab(id as any); if (isEditing) handleInputChange('transactionType', id); }} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {activeTab === 'purchased' && (
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={14} className="text-indigo-500" /> Purchased Details</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="$/U" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Name" value={formData.vendorName} field="vendorName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="$ amount" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleAmountChange} type="number" highlight isCurrency />
                  <Field label="$ SL Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleExchangeRateChange} type="number" />
                  <Field label="Rs amount" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  <Field label="Payment Method" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={paymentMethods} />
                </div>
              </div>
            )}
            {activeTab === 'exchange' && (
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><RefreshCw size={14} className="text-indigo-500" /> Exchange Details</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Exchange Name" value={formData.exchangeName} field="exchangeName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="$ amount" value={formData.exchangeAmount || 0} field="exchangeAmount" isEditing={isEditing} onInputChange={handleAmountChange} type="number" highlight isCurrency />
                  <Field label="$ SL Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleExchangeRateChange} type="number" />
                  <Field label="Rs amount" value={formData.exchangeConvertedAmount || 0} field="exchangeConvertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  <Field label="Tanzania Rate" value={formData.tanzaniaRate} field="tanzaniaRate" isEditing={isEditing} onInputChange={handleTanzaniaRateChange} type="number" />
                  <Field label="T Shiling" value={formData.tShiling || 0} field="tShiling" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  <Field label="Devided T / SL" value={formData.dividedTSL || 0} field="dividedTSL" isEditing={false} onInputChange={handleInputChange} highlight />
                </div>
              </div>
            )}
            {activeTab === 'shares' && (
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14} className="text-indigo-500" /> Shares Details</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="$ Each Amount" value={formData.dollarEachAmount || 0} field="dollarEachAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  <Field label="Rs Each Amount" value={formData.rsEachAmount || 0} field="rsEachAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  <Field label="Shi Each Amount" value={formData.shiEachAmount} field="shiEachAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
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
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
                    <Edit size={16} /> Edit Entry
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the item ID or editing state actually changed
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.initialIsEditing === nextProps.initialIsEditing &&
    prevProps.isReadOnly === nextProps.isReadOnly &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onDelete === nextProps.onDelete
  );
});

export const UnifiedCapitalManagementTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<CapitalItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Filter states
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<CapitalItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CapitalItem | null>(null);

  // Check if this is the mother tab (payable / Capital)
  const isMotherTab = moduleId === 'payable' && tabId.toLowerCase() === 'capital';

  // Define all capital tabs to aggregate from (memoized to avoid dependency issues)
  const capitalTabs = useMemo(() => [
    { moduleId: 'payable', tabId: 'BKK.Capital' },
    { moduleId: 'dada', tabId: 'Capital' },
    { moduleId: 'dada', tabId: '202412Capital' },
    { moduleId: 'kenya', tabId: 'Capital' },
    { moduleId: 'vg-ramazan', tabId: 'T.Capital' },
    { moduleId: 'madagascar', tabId: 'MCapital' },
    { moduleId: 'spinel-gallery', tabId: 'Capital' },
    { moduleId: 'vgtz', tabId: 'T.Capital' },
    { moduleId: 'bkk', tabId: 'Bkkcapital' },
  ], []);

  // --- Filter Options ---
  const uniqueCurrencies = useMemo(() => Array.from(new Set(items.map(i => i.currency).filter(Boolean))).sort(), [items]);
  const uniqueTransactionTypes = useMemo(() => Array.from(new Set(items.map(i => i.transactionType).filter(Boolean))).sort(), [items]);
  const uniquePaymentMethods = useMemo(() => Array.from(new Set(items.map(i => i.paymentMethod).filter(Boolean))).sort(), [items]);
  const uniqueLocations = useMemo(() => Array.from(new Set(items.map(i => i.location).filter(Boolean))).sort(), [items]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(items.map(i => i.company).filter(Boolean))).sort(), [items]);

  // Load data from localStorage
  useEffect(() => {
    if (isMotherTab) {
      // Aggregate data from all capital tabs
      const allItems: CapitalItem[] = [];
      
      capitalTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const storageKey = `unified_capital_${sourceModule}_${sourceTab}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const sourceItems: CapitalItem[] = JSON.parse(saved);
            // Add source information to each item
            const itemsWithSource = sourceItems.map(item => ({
              ...item,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load capital data from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      
      // Also load data from the mother tab itself
      const motherTabKey = `unified_capital_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CapitalItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      
      setItems(allItems);
      setIsDataLoaded(true);
    } else {
      // Load data for individual tabs
      const storageKey = `unified_capital_${moduleId}_${tabId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load capital data:', e);
        }
      }
      // Set flag to true even if no data was found, to allow future saves
      setIsDataLoaded(true);
    }
  }, [moduleId, tabId, isMotherTab, capitalTabs]);

  // Save data to localStorage (only for non-mother tabs, and only after initial load)
  useEffect(() => {
    if (!isMotherTab && isDataLoaded) {
      const storageKey = `unified_capital_${moduleId}_${tabId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
        console.log(`Saved ${items.length} items to localStorage: ${storageKey}`);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [items, moduleId, tabId, isMotherTab, isDataLoaded]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalLKR = items.reduce((sum, item) => sum + item.convertedAmount, 0);
    const totalUSD = items.filter(item => item.currency === 'USD').reduce((sum, item) => sum + item.amount, 0);
    const entryCount = items.length;
    
    // Entries this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const entriesThisMonth = items.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
    
    return { totalLKR, totalUSD, count: entryCount, entriesThisMonth };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
      
      const matchesTransactionType = 
        transactionTypeFilter === 'all' || item.transactionType === transactionTypeFilter;
      
      const matchesPaymentMethod = 
        paymentMethodFilter === 'all' || item.paymentMethod === paymentMethodFilter;
      
      const matchesLocation = 
        locationFilter === 'all' || item.location === locationFilter;
      
      const matchesCompany = 
        companyFilter === 'all' || item.company === companyFilter;
        
      return matchesSearch && matchesCurrency && matchesTransactionType && matchesPaymentMethod && matchesLocation && matchesCompany;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, currencyFilter, transactionTypeFilter, paymentMethodFilter, locationFilter, companyFilter]);

  // Helper function to save item to the correct localStorage location
  const saveItemToStorage = (item: CapitalItem, isNew: boolean = false) => {
    const targetModule = item.sourceModule || moduleId;
    const targetTab = item.sourceTab || tabId;
    const storageKey = `unified_capital_${targetModule}_${targetTab}`;
    
    // Load existing items from that location
    const saved = localStorage.getItem(storageKey);
    let existingItems: CapitalItem[] = [];
    if (saved) {
      try {
        existingItems = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load existing items:', e);
      }
    }
    
    if (isNew) {
      existingItems.push(item);
      console.log(`Adding new item to localStorage: ${storageKey}`, item);
    } else {
      existingItems = existingItems.map(i => i.id === item.id ? item : i);
      console.log(`Updating item in localStorage: ${storageKey}`, item);
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(existingItems));
      console.log(`Successfully saved ${existingItems.length} items to localStorage: ${storageKey}`);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    
    // If we're in the mother tab, reload all aggregated data
    if (isMotherTab) {
      const allItems: CapitalItem[] = [];
      capitalTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKey = `unified_capital_${sourceModule}_${sourceTab}`;
        const sourceSaved = localStorage.getItem(sourceKey);
        if (sourceSaved) {
          try {
            const sourceItems: CapitalItem[] = JSON.parse(sourceSaved);
            const itemsWithSource = sourceItems.map(i => ({
              ...i,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      
      const motherTabKey = `unified_capital_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CapitalItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      
      setItems(allItems);
    }
  };

  // Helper function to delete item from the correct localStorage location
  const deleteItemFromStorage = (id: string, sourceModule?: string, sourceTab?: string) => {
    const targetModule = sourceModule || moduleId;
    const targetTab = sourceTab || tabId;
    const storageKey = `unified_capital_${targetModule}_${targetTab}`;
    
    // Load existing items from that location
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const existingItems: CapitalItem[] = JSON.parse(saved);
        const filteredItems = existingItems.filter(i => i.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filteredItems));
        console.log(`Deleted item from localStorage: ${storageKey}`);
      } catch (e) {
        console.error('Failed to delete from localStorage:', e);
      }
    }
    
    // If we're in the mother tab, reload all aggregated data
    if (isMotherTab) {
      const allItems: CapitalItem[] = [];
      capitalTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKey = `unified_capital_${sourceModule}_${sourceTab}`;
        const sourceSaved = localStorage.getItem(sourceKey);
        if (sourceSaved) {
          try {
            const sourceItems: CapitalItem[] = JSON.parse(sourceSaved);
            const itemsWithSource = sourceItems.map(i => ({
              ...i,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      
      const motherTabKey = `unified_capital_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CapitalItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      
      setItems(allItems);
    }
  };

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this capital entry?')) {
      const item = items.find(i => i.id === id);
      if (item) {
        deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
      }
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: CapitalItem) => {
    const isNew = !editingItem;
    
    // If in mother tab and item has source info, save to source location
    // Otherwise, save to current location
    if (isMotherTab && item.sourceModule && item.sourceTab) {
      // Item is from another tab, save to that location
      saveItemToStorage(item, isNew);
    } else if (!isMotherTab) {
      // Regular tab, save normally (will be handled by useEffect)
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === item.id ? item : i));
      } else {
        setItems(prev => [item, ...prev]);
      }
    } else {
      // Mother tab, new item without source - save to mother tab
      saveItemToStorage({ ...item, sourceModule: moduleId, sourceTab: tabId }, isNew);
    }
    
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: CapitalItem) => {
    const isNew = item.id.startsWith('new-');
    
    // Generate a proper ID for new items
    const finalItem = isNew ? { ...item, id: `capital-${Date.now()}` } : item;
    
    // If in mother tab and item has source info, save to source location
    if (isMotherTab && finalItem.sourceModule && finalItem.sourceTab) {
      saveItemToStorage(finalItem, isNew);
    } else if (!isMotherTab) {
      // Regular tab, save normally
      if (isNew) {
        setItems(prev => [finalItem, ...prev]);
      } else {
        setItems(prev => prev.map(i => i.id === finalItem.id ? finalItem : i));
      }
    } else {
      // Mother tab, item without source - save to mother tab
      saveItemToStorage({ ...finalItem, sourceModule: moduleId, sourceTab: tabId }, isNew);
    }
    setSelectedItem(finalItem);
  };

  const handleDeleteFromPanel = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
    }
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
      const transactionType = (item.transactionType || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const vendorName = (item.vendorName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const currency = (item.currency || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const location = (item.location || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (item.description || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentMethod = (item.paymentMethod || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${transactionType}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${vendorName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${currency}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate.toFixed(4)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">LKR ${item.convertedAmount.toLocaleString()}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${location}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${description}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${paymentMethod}</td>
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
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 8%;">
            <col style="width: 10%;">
            <col style="width: 6%;">
            <col style="width: 9%;">
            <col style="width: 7%;">
            <col style="width: 9%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 10%;">
            <col style="width: 8%;">
            <col style="width: 7%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Vendor</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Currency</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Location</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Description</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Method</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="13" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No capital entries found</td></tr>'}
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
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-indigo-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Unified Capital Management in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => {
                 const newItem: CapitalItem = {
                   id: `new-${Date.now()}`,
                   date: new Date().toISOString().split('T')[0],
                   code: '',
                   transactionType: 'purchased',
                   vendorName: '',
                   currency: 'USD',
                   amount: 0,
                   exchangeAmount: 0,
                   exchangeRate: exchangeRates['USD'],
                   convertedAmount: 0,
                   exchangeConvertedAmount: 0,
                   location: '',
                   company: '',
                   description: '',
                   paymentMethod: '',
                   notes: '',
                   exchangeName: '',
                   tanzaniaRate: 0,
                   tShiling: 0,
                   dividedTSL: 0,
                   dollarEachAmount: 0,
                   rsEachAmount: 0,
                   shiEachAmount: 0
                 };
                 setSelectedItem(newItem);
               }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 active:scale-95 whitespace-nowrap"
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
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total LKR</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalLKR.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Entries</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.count}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <TrendingUp size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total USD</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              {stats.totalUSD > 0 ? `$ ${stats.totalUSD.toLocaleString()}` : '-'}
           </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Globe size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">This Month</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.entriesThisMonth}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total LKR</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalLKR.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Entries</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total USD</div>
              <div className="text-2xl font-black text-stone-900">
                {stats.totalUSD > 0 ? `$ ${stats.totalUSD.toLocaleString()}` : '-'}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <TrendingUp size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Entries This Month</div>
              <div className="text-2xl font-black text-stone-900">{stats.entriesThisMonth}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Globe size={28} />
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
                  placeholder="Search by vendor, code, location, company, description, payment method..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Globe size={14} className="text-stone-300" />
                  <select 
                     value={currencyFilter}
                     onChange={(e) => setCurrencyFilter(e.target.value)}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">All Currencies</option>
                     {uniqueCurrencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <TrendingUp size={14} className="text-stone-300" />
                  <select 
                     value={transactionTypeFilter} 
                     onChange={(e) => setTransactionTypeFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
                  >
                     <option value="all">All Types</option>
                     {uniqueTransactionTypes.map(type => (
                        <option key={type} value={type}>{type === 'purchased' ? 'Purchase' : type === 'exchange' ? 'Exchange' : 'Shares'}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Wallet size={14} className="text-stone-300" />
                  <select 
                     value={paymentMethodFilter} 
                     onChange={(e) => setPaymentMethodFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[130px]"
                  >
                     <option value="all">Payment Method</option>
                     {uniquePaymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Globe size={14} className="text-stone-300" />
                  <select 
                     value={locationFilter} 
                     onChange={(e) => setLocationFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">Location</option>
                     {uniqueLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
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
                     <option value="all">Company</option>
                     {uniqueCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                     ))}
                  </select>
               </div>
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                 <Download size={18} />
               </button>
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
                     <th className="p-6">Type</th>
                     <th className="p-6">Vendor/Entity</th>
                     <th className="p-6">Currency</th>
                     <th className="p-6">Amount</th>
                     <th className="p-6">Rate</th>
                     <th className="p-6">Payment Method</th>
                     {isMotherTab && <th className="p-6">Source</th>}
                     <th className="p-6 text-right pr-10">LKR Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-indigo-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                              {item.code}
                           </span>
                        </td>
                        <td className="p-6">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                             item.transactionType === 'purchased' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             item.transactionType === 'exchange' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             'bg-emerald-50 text-emerald-700 border-emerald-100'
                           }`}>
                              {item.transactionType === 'purchased' ? 'Purchase' : item.transactionType === 'exchange' ? 'Exchange' : 'Shares'}
                           </span>
                        </td>
                        <td className="p-6 text-stone-600 font-medium">{item.vendorName}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-bold text-stone-700 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">
                              {item.currency}
                           </span>
                        </td>
                        <td className="p-6 font-mono font-bold text-stone-900">{formatCurrency(item.amount, item.currency)}</td>
                        <td className="p-6 font-mono text-stone-500">{item.exchangeRate.toFixed(4)}</td>
                        <td className="p-6">
                           {item.paymentMethod ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                 {item.paymentMethod}
                              </span>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        {isMotherTab && (
                           <td className="p-6">
                              {item.sourceModule && item.sourceTab ? (
                                 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100" title={`${APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / ${item.sourceTab}`}>
                                    {APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / {item.sourceTab}
                                 </span>
                              ) : (
                                 <span className="text-stone-300">-</span>
                              )}
                           </td>
                        )}
                        <td className="p-6 text-right pr-10">
                           <div className="font-black text-indigo-700">
                              LKR {item.convertedAmount.toLocaleString()}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && (
               <div className="p-16 text-center text-stone-400">No capital entries found.</div>
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
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <TrendingUp size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.vendorName}</h3>
                     {isMotherTab && item.sourceModule && item.sourceTab && (
                        <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100 inline-block w-fit">
                           {APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / {item.sourceTab}
                        </span>
                     )}
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                     <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                        {item.code}
                     </span>
                     <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border ${
                       item.transactionType === 'purchased' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                       item.transactionType === 'exchange' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                       'bg-emerald-50 text-emerald-700 border-emerald-100'
                     }`}>
                        {item.transactionType === 'purchased' ? 'Purchase' : item.transactionType === 'exchange' ? 'Exchange' : 'Shares'}
                     </span>
                  </div>
               </div>

               <div className="mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                     <Coins size={14} className="text-stone-400" />
                     <span className="font-medium">{formatCurrency(item.amount, item.currency)}</span>
                     <span className="text-stone-400">@</span>
                     <span className="font-mono text-xs">{item.exchangeRate.toFixed(4)}</span>
                  </div>
               </div>

               {item.location && (
                  <div className="mb-4 relative z-10">
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Globe size={14} className="text-stone-400" />
                        <span>{item.location}</span>
                     </div>
                  </div>
               )}

               {item.paymentMethod && (
                  <div className="mb-4 relative z-10">
                     <div className="flex items-center gap-2 text-sm">
                        <Wallet size={14} className="text-stone-400" />
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                           {item.paymentMethod}
                        </span>
                     </div>
                  </div>
               )}

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">LKR Amount</div>
                     <div className="text-xl font-black text-indigo-700">
                        LKR {item.convertedAmount.toLocaleString()}
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <CapitalDetailPanel 
            item={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            isReadOnly={isReadOnly}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const CapitalForm: React.FC<{
  initialData: CapitalItem | null;
  onSave: (item: CapitalItem) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CapitalItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    transactionType: initialData?.transactionType || 'purchased',
    vendorName: initialData?.vendorName || '',
    currency: initialData?.currency || 'USD',
    amount: initialData?.amount || 0,
    exchangeRate: initialData?.exchangeRate || exchangeRates['USD'],
    convertedAmount: initialData?.convertedAmount || 0,
    location: initialData?.location || '',
    company: initialData?.company || '',
    description: initialData?.description || '',
    paymentMethod: initialData?.paymentMethod || '',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    if (formData.currency && formData.amount && formData.exchangeRate) {
      const converted = formData.amount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, convertedAmount: converted }));
    }
  }, [formData.amount, formData.exchangeRate, formData.currency]);

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    const converted = (formData.amount || 0) * rate;
    setFormData(prev => ({ 
      ...prev, 
      currency, 
      exchangeRate: rate,
      convertedAmount: converted 
    }));
  };

  const handleAmountChange = (amount: number) => {
    const converted = amount * (formData.exchangeRate || 1);
    setFormData(prev => ({ ...prev, amount, convertedAmount: converted }));
  };

  const handleExchangeRateChange = (rate: number) => {
    const converted = (formData.amount || 0) * rate;
    setFormData(prev => ({ ...prev, exchangeRate: rate, convertedAmount: converted }));
  };

  const handleSubmit = () => {
    if (!formData.vendorName || !formData.amount || !formData.currency) {
      return alert('Vendor Name, Amount, and Currency are required');
    }
    
    onSave({
      id: initialData?.id || `capital-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `CAP-${Date.now().toString().slice(-4)}`,
      transactionType: formData.transactionType || 'purchased',
      vendorName: formData.vendorName!,
      currency: formData.currency!,
      amount: Number(formData.amount),
      exchangeRate: formData.exchangeRate || exchangeRates[formData.currency!] || 1,
      convertedAmount: formData.convertedAmount || 0,
      location: formData.location,
      company: formData.company,
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Entry' : 'New Capital Entry'}</h3>
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                      placeholder="CAP-001"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Transaction Type *</label>
                <select 
                   value={formData.transactionType} 
                   onChange={e => setFormData({...formData, transactionType: e.target.value as 'purchased' | 'exchange' | 'shares'})}
                   className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                >
                   <option value="purchased">Purchased</option>
                   <option value="exchange">Exchange</option>
                   <option value="shares">Shares</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Vendor/Entity Name *</label>
                <input 
                   type="text" 
                   value={formData.vendorName} 
                   onChange={e => setFormData({...formData, vendorName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                   placeholder="Vendor or entity name"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency *</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => handleCurrencyChange(e.target.value)}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Exchange Rate</label>
                   <input 
                      type="number" 
                      step="0.0001"
                      value={formData.exchangeRate} 
                      onChange={e => handleExchangeRateChange(Number(e.target.value))}
                      onFocus={(e) => {
                        if (formData.exchangeRate === 0 || formData.exchangeRate === null || formData.exchangeRate === undefined) {
                          e.target.select();
                        }
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                      placeholder="0.0000"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Converted Amount (LKR)</label>
                   <input 
                      type="number" 
                      value={formData.convertedAmount} 
                      disabled
                      className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-bold text-stone-600" 
                      placeholder="Auto-calculated"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location</label>
                <input 
                   type="text" 
                   value={formData.location || ''} 
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                   placeholder="Optional"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                <input 
                   type="text" 
                   value={formData.company || ''} 
                   onChange={e => setFormData({...formData, company: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                   placeholder="Optional"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payment Method</label>
                <select 
                   value={formData.paymentMethod || ''} 
                   onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                   className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                >
                   <option value="">Select payment method</option>
                   {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                   ))}
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                <textarea 
                   rows={3}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" 
                   placeholder="Optional description..."
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Entry
             </button>
          </div>
       </div>
    </div>
  );
};

