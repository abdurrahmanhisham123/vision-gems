import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Download, Printer,
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Building2, ShoppingBag, Scale, Gem, Tag, CreditCard, CheckCircle, AlertCircle
} from 'lucide-react';

// --- Types ---
interface UnifiedPurchasingItem {
  id: string;
  date: string;
  code: string;
  variety: string; // Variety/Stone Type
  supplierName: string; // Supplier Name (required)
  weight: number; // Weight in carats
  pieces: number; // Number of pieces
  cost: number; // Cost/Amount (required)
  currency: string; // LKR, KSH, TZS, USD, etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  status: 'Paid' | 'Not Paid' | 'Partial' | 'Owed'; // Payment status
  paymentMethod?: string; // Payment method
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): UnifiedPurchasingItem[] => {
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
const paymentStatuses: UnifiedPurchasingItem['status'][] = ['Paid', 'Not Paid', 'Partial', 'Owed'];
const stoneVarieties = ['Spinel', 'Ruby', 'Blue Sapphire', 'Pink Sapphire', 'Yellow Sapphire', 'Garnet', 'Zircon', 'Tourmaline', 'Aquamarine', 'Emerald', 'Other'];

// --- Field Component (moved outside to prevent recreation) ---
interface FieldProps {
  label: string;
  value: any;
  field: keyof UnifiedPurchasingItem;
  isEditing: boolean;
  onInputChange: (key: keyof UnifiedPurchasingItem, value: any) => void;
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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-blue-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
});

Field.displayName = 'Field';

// --- Side Panel Component ---
const PurchasingDetailPanel: React.FC<{
  item: UnifiedPurchasingItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: UnifiedPurchasingItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<UnifiedPurchasingItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  useEffect(() => {
    // Auto-calculate converted amount for foreign currencies
    // Use functional updates to avoid dependency on formData.convertedAmount
    setFormData(prev => {
      if (prev.currency && prev.currency !== 'LKR' && prev.cost && prev.exchangeRate) {
        const converted = prev.cost * prev.exchangeRate;
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (prev.convertedAmount !== converted) {
          return { ...prev, convertedAmount: converted };
        }
        return prev;
      } else if (prev.currency === 'LKR' && prev.convertedAmount !== undefined) {
        return { ...prev, convertedAmount: undefined, exchangeRate: undefined };
      }
      return prev;
    });
  }, [formData.cost, formData.exchangeRate, formData.currency]);

  const handleInputChange = (key: keyof UnifiedPurchasingItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCurrencyChange = useCallback((currency: string) => {
    const rate = exchangeRates[currency] || 1;
    setFormData(prev => {
      if (currency !== 'LKR' && prev.cost) {
        const converted = prev.cost * rate;
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


  const handleSave = () => {
    if (!formData.supplierName || !formData.cost || !formData.currency) {
      return alert('Supplier Name, Cost, and Currency are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this purchasing record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Stable handler that uses functional state updates - memoized to prevent recreation
  const handleFieldChange = useCallback((field: keyof UnifiedPurchasingItem, value: any) => {
    if (field === 'cost') {
      setFormData(prev => {
        if (prev.currency && prev.currency !== 'LKR' && prev.exchangeRate) {
          const converted = value * prev.exchangeRate;
          return { ...prev, cost: value, convertedAmount: converted };
        }
        return { ...prev, cost: value };
      });
    } else if (field === 'exchangeRate') {
      setFormData(prev => {
        if (prev.cost) {
          const converted = prev.cost * value;
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Purchase Details</h3>
              <p className="text-xs text-stone-500">{formData.code || 'New Purchase'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Gem size={14} className="text-blue-500" /> Purchase Information</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date *" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleFieldChange} type="date" />
                <Field label="Code *" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleFieldChange} highlight />
                <Field label="Variety/Stone Type *" value={formData.variety} field="variety" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={stoneVarieties} />
                <Field label="Supplier Name *" value={formData.supplierName} field="supplierName" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Weight (ct) *" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                <Field label="Pieces *" value={formData.pieces} field="pieces" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={currencies} />
                <Field label="Cost/Amount *" value={formData.cost} field="cost" isEditing={isEditing} onInputChange={handleFieldChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleFieldChange} highlight isCurrency />
                  </>
                )}
                <Field label="Payment Status *" value={formData.status} field="status" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={paymentStatuses} />
                <Field label="Payment Method" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={paymentMethods} />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleFieldChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
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
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
                    <Edit size={16} /> Edit Purchase
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

export const UnifiedPurchasingTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<UnifiedPurchasingItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter State
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [supplierFilter, setSupplierFilter] = useState<string>('All');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<UnifiedPurchasingItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedPurchasingItem | null>(null);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalPurchases = items.length;
    const totalAmount = items.reduce((sum, item) => sum + (item.convertedAmount || (item.currency === 'LKR' ? item.cost : 0)), 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalPieces = items.reduce((sum, item) => sum + (item.pieces || 0), 0);
    const uniqueSuppliers = new Set(items.map(i => i.supplierName)).size;
    const pendingPayments = items.filter(i => i.status === 'Not Paid' || i.status === 'Owed' || i.status === 'Partial').length;
    
    return {
      totalPurchases,
      totalAmount,
      totalWeight,
      totalPieces,
      uniqueSuppliers,
      pendingPayments
    };
  }, [items]);

  // --- Filter Options ---
  const uniqueCurrencies = useMemo(() => Array.from(new Set(items.map(i => i.currency))).sort(), [items]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(items.map(i => i.status))).sort(), [items]);
  const uniqueSuppliers = useMemo(() => Array.from(new Set(items.map(i => i.supplierName))).sort(), [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.variety && item.variety.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = currencyFilter === 'All' || item.currency === currencyFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSupplier = supplierFilter === 'All' || item.supplierName === supplierFilter;
        
      return matchesSearch && matchesCurrency && matchesStatus && matchesSupplier;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, currencyFilter, statusFilter, supplierFilter]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this purchase?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: UnifiedPurchasingItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: UnifiedPurchasingItem) => {
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

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)}ct`;
  };

  const getStatusColor = (status: UnifiedPurchasingItem['status']) => {
    switch (status) {
      case 'Paid': return 'bg-green-50 text-green-700';
      case 'Not Paid': return 'bg-red-50 text-red-700';
      case 'Partial': return 'bg-amber-50 text-amber-700';
      case 'Owed': return 'bg-orange-50 text-orange-700';
      default: return 'bg-stone-50 text-stone-700';
    }
  };

  const generateCode = () => {
    const prefix = tabId.substring(0, 3).toUpperCase();
    return `${prefix}-${Date.now().toString().slice(-6)}`;
  };

  const createNewItem = (): UnifiedPurchasingItem => ({
    id: `new-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    code: generateCode(),
    variety: 'Spinel',
    supplierName: '',
    weight: 0,
    pieces: 1,
    cost: 0,
    currency: 'LKR',
    status: 'Not Paid',
    paymentMethod: undefined,
    notes: undefined
  });

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const variety = (item.variety || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const supplierName = (item.supplierName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const status = (item.status || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentMethod = (item.paymentMethod || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${variety}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${supplierName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.weight.toFixed(2)} ct</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.pieces}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.cost, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${status}</td>
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
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 10%;">
            <col style="width: 12%;">
            <col style="width: 8%;">
            <col style="width: 6%;">
            <col style="width: 10%;">
            <col style="width: 10%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Variety</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Supplier</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Pieces</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Cost</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Status</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Method</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="12" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No purchases found</td></tr>'}
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-blue-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Unified Purchasing in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Purchase
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <ShoppingBag size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Purchases</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.totalPurchases}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Scale size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Weight</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">{formatWeight(stats.totalWeight)}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <AlertCircle size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Pending</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.pendingPayments}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Purchases</div>
              <div className="text-2xl font-black text-stone-900">{stats.totalPurchases}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <ShoppingBag size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Weight</div>
              <div className="text-2xl font-black text-stone-900">{formatWeight(stats.totalWeight)}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Scale size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Pending Payments</div>
              <div className="text-2xl font-black text-stone-900">{stats.pendingPayments}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <AlertCircle size={28} />
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
                  placeholder="Search by supplier, code, variety..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
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
                     value={statusFilter} 
                     onChange={(e) => setStatusFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Status</option>
                     {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Building2 size={14} className="text-stone-300" />
                  <select 
                     value={supplierFilter} 
                     onChange={(e) => setSupplierFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="All">Supplier</option>
                     {uniqueSuppliers.map(supplier => (
                        <option key={supplier} value={supplier}>{supplier}</option>
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
                     <th className="p-6">Variety</th>
                     <th className="p-6">Supplier</th>
                     <th className="p-6 text-right">Weight</th>
                     <th className="p-6 text-right">Pieces</th>
                     <th className="p-6 text-right">Cost</th>
                     <th className="p-6">Currency</th>
                     <th className="p-6 text-right">LKR Amount</th>
                     <th className="p-6">Status</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredItems.map((item) => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-blue-50/5 transition-colors cursor-pointer group border-b border-stone-100"
                     >
                        <td className="p-6 pl-10 font-medium text-stone-700">{item.date}</td>
                        <td className="p-6 font-mono font-bold text-stone-900">{item.code}</td>
                        <td className="p-6 font-medium text-stone-700">{item.variety}</td>
                        <td className="p-6 font-medium text-stone-800">{item.supplierName}</td>
                        <td className="p-6 text-right font-mono text-stone-600">{formatWeight(item.weight)}</td>
                        <td className="p-6 text-right font-mono text-stone-600">{item.pieces}</td>
                        <td className="p-6 text-right font-mono font-bold text-stone-900">{formatCurrency(item.cost, item.currency)}</td>
                        <td className="p-6 text-stone-600 text-sm">{item.currency}</td>
                        <td className="p-6 text-right font-mono font-bold text-blue-700">
                           {item.convertedAmount ? formatCurrency(item.convertedAmount, 'LKR') : (item.currency === 'LKR' ? formatCurrency(item.cost, 'LKR') : '-')}
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(item.status)}`}>
                              {item.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3 mb-24">
         {filteredItems.map((item) => (
            <div 
               key={item.id} 
               onClick={() => setSelectedItem(item)}
               className="bg-white rounded-[32px] border border-stone-200 p-5 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-stone-100 overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
                     <Gem size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                           <div className="font-mono font-black text-stone-900 text-sm mb-1 truncate">{item.code}</div>
                           <div className="text-xs text-stone-600 mb-1">{item.variety}</div>
                           <div className="text-sm font-bold text-stone-800 truncate">{item.supplierName}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 ${getStatusColor(item.status)}`}>
                           {item.status}
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                        <div>
                           <span className="text-stone-500">Weight:</span>
                           <span className="font-mono font-bold text-stone-900 ml-1">{formatWeight(item.weight)}</span>
                        </div>
                        <div>
                           <span className="text-stone-500">Pieces:</span>
                           <span className="font-bold text-stone-900 ml-1">{item.pieces}</span>
                        </div>
                        <div>
                           <span className="text-stone-500">Cost:</span>
                           <span className="font-mono font-bold text-stone-900 ml-1">{formatCurrency(item.cost, item.currency)}</span>
                        </div>
                        <div>
                           <span className="text-stone-500">LKR:</span>
                           <span className="font-mono font-bold text-blue-700 ml-1">
                              {item.convertedAmount ? formatCurrency(item.convertedAmount, 'LKR') : (item.currency === 'LKR' ? formatCurrency(item.cost, 'LKR') : '-')}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <PurchasingDetailPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSave={handleSaveFromPanel}
            onDelete={handleDeleteFromPanel}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Add/Edit Form - Centered Modal */}
      {isFormOpen && (
         <PurchasingDetailPanel
            item={editingItem || createNewItem()}
            initialIsEditing={true}
            onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
            onSave={handleSave}
            onDelete={() => {}}
            isReadOnly={false}
         />
      )}

    </div>
  );
};

