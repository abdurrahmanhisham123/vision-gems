import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Building2, CreditCard, Wallet, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

// --- Types ---
interface PaymentItem {
  id: string;
  date: string;
  code: string;
  customerName: string; // Customer/Entity Name
  description: string;
  invoiceAmount: number; // Original invoice/transaction amount
  currency: string; // USD, LKR, etc.
  paidAmount: number; // Amount paid
  outstandingAmount: number; // Outstanding amount (invoiceAmount - paidAmount)
  paymentMethod: string; // Cash, Cheque, Bank Transfer, etc.
  paymentDate?: string; // Date payment was received
  dueDate?: string; // Payment due date
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue'; // Payment status
  exchangeRate?: number; // Exchange rate if foreign currency
  convertedAmount?: number; // Amount converted to LKR
  company?: string; // Optional company
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): PaymentItem[] => {
  return [];
};

// Currency options and exchange rates
const currencies = ['USD', 'LKR', 'EUR', 'GBP', 'TZS', 'KES', 'THB'];
const exchangeRates: Record<string, number> = {
  'USD': 302.50,
  'LKR': 1.00,
  'EUR': 330.20,
  'GBP': 385.80,
  'TZS': 0.1251,
  'KES': 2.33,
  'THB': 8.50
};

const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'Online Payment', 'Other'];

// --- Side Panel Component ---
const PaymentDetailPanel: React.FC<{
  item: PaymentItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: PaymentItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<PaymentItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  useEffect(() => {
    // Auto-calculate outstanding amount
    const outstanding = formData.invoiceAmount - formData.paidAmount;
    setFormData(prev => ({ ...prev, outstandingAmount: outstanding }));
    
    // Auto-update status based on amounts
    let newStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue' = 'Pending';
    if (outstanding <= 0) {
      newStatus = 'Paid';
    } else if (formData.paidAmount > 0) {
      newStatus = 'Partial';
    } else {
      // Check if overdue
      if (formData.dueDate) {
        const due = new Date(formData.dueDate);
        const today = new Date();
        if (due < today) {
          newStatus = 'Overdue';
        }
      }
    }
    setFormData(prev => ({ ...prev, status: newStatus }));

    // Auto-calculate converted amount if currency is not LKR
    if (formData.currency && formData.currency !== 'LKR' && formData.exchangeRate) {
      const converted = formData.paidAmount * formData.exchangeRate;
      setFormData(prev => ({ ...prev, convertedAmount: converted }));
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({ ...prev, convertedAmount: formData.paidAmount }));
    }
  }, [formData.invoiceAmount, formData.paidAmount, formData.currency, formData.exchangeRate, formData.dueDate]);

  const handleInputChange = (key: keyof PaymentItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    const converted = formData.paidAmount * rate;
    setFormData(prev => ({ 
      ...prev, 
      currency, 
      exchangeRate: currency !== 'LKR' ? rate : undefined,
      convertedAmount: converted 
    }));
  };

  const handleInvoiceAmountChange = (amount: number) => {
    const outstanding = amount - formData.paidAmount;
    setFormData(prev => ({ ...prev, invoiceAmount: amount, outstandingAmount: outstanding }));
  };

  const handlePaidAmountChange = (amount: number) => {
    const outstanding = formData.invoiceAmount - amount;
    setFormData(prev => ({ ...prev, paidAmount: amount, outstandingAmount: outstanding }));
  };

  const handleExchangeRateChange = (rate: number) => {
    const converted = formData.paidAmount * rate;
    setFormData(prev => ({ ...prev, exchangeRate: rate, convertedAmount: converted }));
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.invoiceAmount || !formData.currency) {
      return alert('Customer Name, Invoice Amount, and Currency are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this payment record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Partial': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof PaymentItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof PaymentItem, value: any) => void,
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
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
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
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
        
        <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
          <div className="flex gap-3 md:gap-4 items-center min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <CreditCard size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-violet-50 text-violet-700 border-violet-100">
                  Payment
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.customerName} 
                  onChange={(e) => handleInputChange('customerName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-violet-200 focus:border-violet-500 outline-none w-full" 
                  placeholder="Customer Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.customerName}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <Wallet size={14} className="text-stone-400" />
                <p className="truncate">{formatCurrency(formData.paidAmount, formData.currency)} / {formatCurrency(formData.invoiceAmount, formData.currency)}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14} className="text-violet-500" /> Payment Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Customer/Entity Name *" value={formData.customerName} field="customerName" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleCurrencyChange} type="select" options={currencies} />
                <Field label="Payment Method" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={paymentMethods} />
                <Field label="Invoice Amount *" value={formData.invoiceAmount} field="invoiceAmount" isEditing={isEditing} onInputChange={handleInvoiceAmountChange} type="number" highlight isCurrency />
                <Field label="Paid Amount *" value={formData.paidAmount} field="paidAmount" isEditing={isEditing} onInputChange={handlePaidAmountChange} type="number" highlight isCurrency />
                <Field label="Outstanding Amount" value={formData.outstandingAmount} field="outstandingAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                <Field label="Payment Date" value={formData.paymentDate} field="paymentDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Due Date" value={formData.dueDate} field="dueDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Status" value={formData.status} field="status" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={['Paid', 'Partial', 'Pending', 'Overdue']} />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleExchangeRateChange} type="number" />
                    <Field label="Converted Amount (LKR)" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleInputChange} />
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
              <button onClick={() => window.print()} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100">
                <Printer size={18} />
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-violet-700 transition-all">
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

export const UnifiedPaymentLedgerTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<PaymentItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalInvoice = items.reduce((sum, item) => sum + item.invoiceAmount, 0);
    const totalPaid = items.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalOutstanding = items.reduce((sum, item) => sum + item.outstandingAmount, 0);
    const paidCount = items.filter(item => item.status === 'Paid').length;
    const pendingCount = items.filter(item => item.status === 'Pending' || item.status === 'Overdue').length;
    
    return { totalInvoice, totalPaid, totalOutstanding, paidCount, pendingCount };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase()));
        
      return matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this payment record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: PaymentItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: PaymentItem) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Partial': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-violet-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredItems.length} payment records currently tracked</p>
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
               <Plus size={18} /> Add Payment
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
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Paid</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Invoice</div>
           </div>
           <div className="text-lg font-black text-stone-900">LKR {stats.totalInvoice.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0">
                 <AlertCircle size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Outstanding</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              LKR {stats.totalOutstanding.toLocaleString()}
           </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <CheckCircle size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Paid</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.paidCount}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Paid</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalPaid.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Invoice</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalInvoice.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Outstanding</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalOutstanding.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <AlertCircle size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Paid Records</div>
              <div className="text-2xl font-black text-stone-900">{stats.paidCount}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle size={28} />
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
                  placeholder="Search by customer, code, description, company..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-violet-500/5 focus:border-violet-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1400px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Customer</th>
                     <th className="p-6">Status</th>
                     <th className="p-6">Invoice Amount</th>
                     <th className="p-6">Paid Amount</th>
                     <th className="p-6 text-right pr-10">Outstanding</th>
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
                        <td className="p-6 text-stone-600 font-medium">{item.customerName}</td>
                        <td className="p-6">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                              {item.status}
                           </span>
                        </td>
                        <td className="p-6 font-mono font-bold text-stone-900">{formatCurrency(item.invoiceAmount, item.currency)}</td>
                        <td className="p-6 font-mono font-bold text-violet-700">{formatCurrency(item.paidAmount, item.currency)}</td>
                        <td className="p-6 text-right pr-10">
                           <div className="font-black text-red-700">
                              {formatCurrency(item.outstandingAmount, item.currency)}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && (
               <div className="p-16 text-center text-stone-400">No payment records found.</div>
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
               <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CreditCard size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.customerName}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                     <span className="font-mono text-xs font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-100">
                        {item.code}
                     </span>
                     <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                        {item.status}
                     </span>
                  </div>
               </div>

               {item.description && (
                  <div className="mb-4 relative z-10">
                     <div className="text-sm text-stone-600">{item.description}</div>
                  </div>
               )}

               <div className="mb-4 relative z-10">
                  <div className="flex items-center justify-between text-sm mb-2">
                     <span className="text-stone-500">Invoice:</span>
                     <span className="font-bold text-stone-900">{formatCurrency(item.invoiceAmount, item.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                     <span className="text-stone-500">Paid:</span>
                     <span className="font-bold text-violet-700">{formatCurrency(item.paidAmount, item.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-stone-500">Outstanding:</span>
                     <span className="font-bold text-red-700">{formatCurrency(item.outstandingAmount, item.currency)}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <PaymentDetailPanel 
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
         <PaymentForm 
            initialData={editingItem}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const PaymentForm: React.FC<{
  initialData: PaymentItem | null;
  onSave: (item: PaymentItem) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PaymentItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    customerName: initialData?.customerName || '',
    description: initialData?.description || '',
    invoiceAmount: initialData?.invoiceAmount || 0,
    currency: initialData?.currency || 'LKR',
    paidAmount: initialData?.paidAmount || 0,
    outstandingAmount: initialData?.outstandingAmount || 0,
    paymentMethod: initialData?.paymentMethod || 'Cash',
    paymentDate: initialData?.paymentDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    status: initialData?.status || 'Pending',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
    company: initialData?.company || '',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    // Auto-calculate outstanding amount
    const outstanding = (formData.invoiceAmount || 0) - (formData.paidAmount || 0);
    setFormData(prev => ({ ...prev, outstandingAmount: outstanding }));
    
    // Auto-update status
    let newStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue' = 'Pending';
    if (outstanding <= 0) {
      newStatus = 'Paid';
    } else if ((formData.paidAmount || 0) > 0) {
      newStatus = 'Partial';
    } else if (formData.dueDate) {
      const due = new Date(formData.dueDate);
      const today = new Date();
      if (due < today) {
        newStatus = 'Overdue';
      }
    }
    setFormData(prev => ({ ...prev, status: newStatus }));

    // Auto-calculate converted amount
    if (formData.currency && formData.currency !== 'LKR' && formData.exchangeRate) {
      const converted = (formData.paidAmount || 0) * formData.exchangeRate;
      setFormData(prev => ({ ...prev, convertedAmount: converted }));
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({ ...prev, convertedAmount: formData.paidAmount }));
    }
  }, [formData.invoiceAmount, formData.paidAmount, formData.currency, formData.exchangeRate, formData.dueDate]);

  const handleCurrencyChange = (currency: string) => {
    const rate = exchangeRates[currency] || 1;
    const converted = (formData.paidAmount || 0) * rate;
    setFormData(prev => ({ 
      ...prev, 
      currency, 
      exchangeRate: currency !== 'LKR' ? rate : undefined,
      convertedAmount: converted 
    }));
  };

  const handleInvoiceAmountChange = (amount: number) => {
    const outstanding = amount - (formData.paidAmount || 0);
    setFormData(prev => ({ ...prev, invoiceAmount: amount, outstandingAmount: outstanding }));
  };

  const handlePaidAmountChange = (amount: number) => {
    const outstanding = (formData.invoiceAmount || 0) - amount;
    setFormData(prev => ({ ...prev, paidAmount: amount, outstandingAmount: outstanding }));
  };

  const handleExchangeRateChange = (rate: number) => {
    const converted = (formData.paidAmount || 0) * rate;
    setFormData(prev => ({ ...prev, exchangeRate: rate, convertedAmount: converted }));
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.invoiceAmount || !formData.currency) {
      return alert('Customer Name, Invoice Amount, and Currency are required');
    }
    
    onSave({
      id: initialData?.id || `payment-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `PAY-${Date.now().toString().slice(-4)}`,
      customerName: formData.customerName!,
      description: formData.description || '',
      invoiceAmount: Number(formData.invoiceAmount),
      currency: formData.currency!,
      paidAmount: Number(formData.paidAmount || 0),
      outstandingAmount: formData.outstandingAmount || 0,
      paymentMethod: formData.paymentMethod || 'Cash',
      paymentDate: formData.paymentDate,
      dueDate: formData.dueDate,
      status: formData.status || 'Pending',
      exchangeRate: formData.exchangeRate,
      convertedAmount: formData.convertedAmount,
      company: formData.company,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Payment' : 'New Payment Record'}</h3>
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="PAY-001"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Customer/Entity Name *</label>
                <input 
                   type="text" 
                   value={formData.customerName} 
                   onChange={e => setFormData({...formData, customerName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                   placeholder="Customer name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                <textarea 
                   rows={2}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none resize-none" 
                   placeholder="Payment description..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency *</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => handleCurrencyChange(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                   >
                      {currencies.map(curr => (
                         <option key={curr} value={curr}>{curr}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payment Method</label>
                   <select 
                      value={formData.paymentMethod} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                   >
                      {paymentMethods.map(method => (
                         <option key={method} value={method}>{method}</option>
                      ))}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Invoice Amount *</label>
                   <input 
                      type="number" 
                      value={formData.invoiceAmount} 
                      onChange={e => handleInvoiceAmountChange(Number(e.target.value))}
                      onFocus={(e) => {
                        if (formData.invoiceAmount === 0 || formData.invoiceAmount === null || formData.invoiceAmount === undefined) {
                          e.target.select();
                        }
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Paid Amount *</label>
                   <input 
                      type="number" 
                      value={formData.paidAmount} 
                      onChange={e => handlePaidAmountChange(Number(e.target.value))}
                      onFocus={(e) => {
                        if (formData.paidAmount === 0 || formData.paidAmount === null || formData.paidAmount === undefined) {
                          e.target.select();
                        }
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Outstanding Amount</label>
                <input 
                   type="number" 
                   value={formData.outstandingAmount} 
                   disabled
                   className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-bold text-stone-600" 
                   placeholder="Auto-calculated"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payment Date</label>
                   <input 
                      type="date" 
                      value={formData.paymentDate} 
                      onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Due Date</label>
                   <input 
                      type="date" 
                      value={formData.dueDate} 
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Status</label>
                <select 
                   value={formData.status} 
                   onChange={e => setFormData({...formData, status: e.target.value as any})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                >
                   <option value="Pending">Pending</option>
                   <option value="Partial">Partial</option>
                   <option value="Paid">Paid</option>
                   <option value="Overdue">Overdue</option>
                </select>
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
                         className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
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

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                <input 
                   type="text" 
                   value={formData.company || ''} 
                   onChange={e => setFormData({...formData, company: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                   placeholder="Optional"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg hover:bg-violet-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Payment
             </button>
          </div>
       </div>
    </div>
  );
};

