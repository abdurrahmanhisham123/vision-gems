import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Download, Printer,
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Building2, Package, Scale, Plane, MapPin, FileCheck, Tag
} from 'lucide-react';

// --- Types ---
interface UnifiedExportItem {
  id: string;
  date: string;
  code: string;
  company: string;
  exportType: 'Export Charges' | 'Export Records' | 'Export Invoice';
  description: string;
  weight?: number; // Optional weight
  amount: number;
  currency: string; // LKR, TZS, KSH, USD, etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  method: string; // Payment method (Cash, Bank Transfer, etc.)
  referenceNumber: string;
  destination: string;
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): UnifiedExportItem[] => {
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
const exportTypes: UnifiedExportItem['exportType'][] = ['Export Charges', 'Export Records', 'Export Invoice'];

// --- Field Component (moved outside to prevent recreation) ---
interface FieldProps {
  label: string;
  value: any;
  field: keyof UnifiedExportItem;
  isEditing: boolean;
  onInputChange: (key: keyof UnifiedExportItem, value: any) => void;
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
            className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 appearance-none"
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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-sky-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
});

Field.displayName = 'Field';

// --- Detail Panel Component ---
const ExportDetailPanel: React.FC<{
  item: UnifiedExportItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: UnifiedExportItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<UnifiedExportItem>(initialItem);

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

  const handleFieldChange = useCallback((field: keyof UnifiedExportItem, value: any) => {
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
    if (!formData.description || !formData.amount || !formData.company || !formData.referenceNumber) {
      return alert('Description, Amount, Company, and Reference Number are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this export record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-stone-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Package size={20} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Export Details</h3>
              <p className="text-xs text-stone-500">{formData.code || 'New Export'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={14} className="text-sky-500" /> Export Information</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date *" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleFieldChange} type="date" />
                <Field label="Code *" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleFieldChange} highlight />
                <Field label="Company *" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Export Type *" value={formData.exportType} field="exportType" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={exportTypes} />
                <Field label="Description *" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Weight (ct)" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={currencies} />
                <Field label="Amount *" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleFieldChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleFieldChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleFieldChange} highlight isCurrency />
                  </>
                )}
                <Field label="Payment Method *" value={formData.method} field="method" isEditing={isEditing} onInputChange={handleFieldChange} type="select" options={paymentMethods} />
                <Field label="Reference Number *" value={formData.referenceNumber} field="referenceNumber" isEditing={isEditing} onInputChange={handleFieldChange} highlight />
                <Field label="Destination *" value={formData.destination} field="destination" isEditing={isEditing} onInputChange={handleFieldChange} />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleFieldChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-sky-700 transition-all">
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
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-sky-700 transition-all">
                    <Edit size={16} /> Edit Export
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
export const UnifiedExportTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly = false }) => {
  const [items, setItems] = useState<UnifiedExportItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UnifiedExportItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedExportItem | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const createNewItem = (): UnifiedExportItem => ({
    id: `export-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    code: `EXP-${Date.now().toString().slice(-6)}`,
    company: '',
    exportType: 'Export Records',
    description: '',
    weight: undefined,
    amount: 0,
    currency: 'LKR',
    convertedAmount: undefined,
    exchangeRate: undefined,
    method: 'Cash',
    referenceNumber: '',
    destination: '',
    notes: ''
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCurrency = currencyFilter === 'all' || item.currency === currencyFilter;
      const matchesType = typeFilter === 'all' || item.exportType === typeFilter;
      
      return matchesSearch && matchesCurrency && matchesType;
    });
  }, [items, searchQuery, currencyFilter, typeFilter]);

  const summaryStats = useMemo(() => {
    const totalExports = filteredItems.length;
    const totalAmount = filteredItems.reduce((sum, item) => {
      const amount = item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0);
      return sum + amount;
    }, 0);
    const totalWeight = filteredItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const exportsThisMonth = filteredItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
    }).length;
    const averageValue = totalExports > 0 ? totalAmount / totalExports : 0;

    return {
      totalExports,
      totalAmount,
      totalWeight,
      exportsThisMonth,
      averageValue
    };
  }, [filteredItems]);

  const handleSave = (item: UnifiedExportItem) => {
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

  const handleEdit = (item: UnifiedExportItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatWeight = (weight?: number) => {
    if (!weight) return '-';
    return `${weight.toLocaleString()} ct`;
  };

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const exportType = (item.exportType || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (item.description || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const referenceNumber = (item.referenceNumber || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const destination = (item.destination || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const method = (item.method || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${exportType}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${description}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.weight ? item.weight.toFixed(2) + ' ct' : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${referenceNumber}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${destination}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${method}</td>
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
            <col style="width: 9%;">
            <col style="width: 10%;">
            <col style="width: 12%;">
            <col style="width: 7%;">
            <col style="width: 10%;">
            <col style="width: 10%;">
            <col style="width: 9%;">
            <col style="width: 9%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Description</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Reference</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Destination</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Method</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="13" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No exports found</td></tr>'}
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
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-sky-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Unified Export in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-900/20 hover:bg-sky-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Export
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {summaryStats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <Package size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Exports</div>
           </div>
           <div className="text-lg font-black text-stone-900">{summaryStats.totalExports}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Scale size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Weight</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">{formatWeight(summaryStats.totalWeight)}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">This Month</div>
           </div>
           <div className="text-lg font-black text-stone-900">{summaryStats.exportsThisMonth}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {summaryStats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Exports</div>
              <div className="text-2xl font-black text-stone-900">{summaryStats.totalExports}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <Package size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Weight</div>
              <div className="text-2xl font-black text-stone-900">{formatWeight(summaryStats.totalWeight)}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Scale size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">This Month</div>
              <div className="text-2xl font-black text-stone-900">{summaryStats.exportsThisMonth}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <FileText size={28} />
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
                  placeholder="Search by company, code, reference, destination..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
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
                     <option value="all">Currency</option>
                     {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Tag size={14} className="text-stone-300" />
                  <select 
                     value={typeFilter} 
                     onChange={(e) => setTypeFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">Type</option>
                     {exportTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                     ))}
                  </select>
               </div>
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
            <div className="w-20 h-20 rounded-3xl bg-sky-100 flex items-center justify-center mb-4">
              <Package size={40} className="text-sky-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No exports found</h3>
            <p className="text-stone-500 mb-6">Get started by adding your first export record</p>
            {!isReadOnly && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-sky-700 transition-all"
              >
                <Plus size={18} /> Add Export
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
                      <th className="p-6">Type</th>
                      <th className="p-6">Reference</th>
                      <th className="p-6">Destination</th>
                      <th className="p-6 text-right">Amount</th>
                      <th className="p-6 text-right pr-10">LKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-sky-50/5 transition-colors cursor-pointer group"
                      >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                          <span className="font-mono text-xs font-black text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100">
                            {item.code}
                          </span>
                        </td>
                        <td className="p-6 font-medium text-stone-700">{item.company}</td>
                        <td className="p-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700">{item.exportType}</span>
                        </td>
                        <td className="p-6 font-mono text-xs text-stone-600">{item.referenceNumber}</td>
                        <td className="p-6 text-stone-700">{item.destination}</td>
                        <td className="p-6 text-right font-mono text-stone-700">{formatCurrency(item.amount, item.currency)}</td>
                        <td className="p-6 text-right pr-10 font-mono font-bold text-sky-700">
                          {item.convertedAmount ? formatCurrency(item.convertedAmount, 'LKR') : (item.currency === 'LKR' ? formatCurrency(item.amount, 'LKR') : '-')}
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
                      <div className="font-mono font-black text-sky-700 text-sm mb-1 truncate">{item.code}</div>
                      <div className="text-xs text-stone-600 mb-1">{item.company}</div>
                      <div className="text-sm font-bold text-stone-800 truncate">{item.description}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 bg-sky-50 text-sky-700">
                      {item.exportType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div>
                      <span className="text-stone-500">Reference:</span>
                      <span className="font-mono font-bold text-stone-900 ml-1">{item.referenceNumber}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Destination:</span>
                      <span className="font-bold text-stone-900 ml-1">{item.destination}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Amount:</span>
                      <span className="font-mono font-bold text-stone-900 ml-1">{formatCurrency(item.amount, item.currency)}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">LKR:</span>
                      <span className="font-mono font-bold text-sky-700 ml-1">
                        {item.convertedAmount ? formatCurrency(item.convertedAmount, 'LKR') : (item.currency === 'LKR' ? formatCurrency(item.amount, 'LKR') : '-')}
                      </span>
                    </div>
                    {item.weight && (
                      <div>
                        <span className="text-stone-500">Weight:</span>
                        <span className="font-mono font-bold text-stone-900 ml-1">{formatWeight(item.weight)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <ExportDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <ExportDetailPanel
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


