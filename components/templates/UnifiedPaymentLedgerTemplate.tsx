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
  invoiceAmount: number; // Original invoice/transaction amount (Rs amount)
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
  weight?: number; // Weight
  deal?: string; // Deal information
  percent?: number; // Percentage (%)
  commission?: number; // Commission amount
  finalAmount?: number; // Final Amount (separate from invoiceAmount)
  payableAmount?: number; // Payable Amount
  halfPaid?: boolean; // Half Paid indicator
  cleared?: boolean; // Cleared? indicator
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
    
    // Auto-calculate commission if percent and invoiceAmount are provided
    if (formData.percent && formData.invoiceAmount) {
      const commission = (formData.invoiceAmount * formData.percent) / 100;
      setFormData(prev => ({ ...prev, commission }));
    }
    
    // Auto-calculate final amount (invoiceAmount + commission if commission exists)
    if (formData.commission !== undefined) {
      const finalAmount = formData.invoiceAmount + (formData.commission || 0);
      setFormData(prev => ({ ...prev, finalAmount }));
    } else {
      setFormData(prev => ({ ...prev, finalAmount: formData.invoiceAmount }));
    }
    
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
  }, [formData.invoiceAmount, formData.paidAmount, formData.currency, formData.exchangeRate, formData.dueDate, formData.percent, formData.commission]);

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

  const handlePercentChange = (percent: number) => {
    const commission = formData.invoiceAmount * (percent / 100);
    const finalAmount = formData.invoiceAmount + commission;
    setFormData(prev => ({ ...prev, percent, commission, finalAmount }));
  };

  const handleCommissionChange = (commission: number) => {
    const finalAmount = formData.invoiceAmount + commission;
    setFormData(prev => ({ ...prev, commission, finalAmount }));
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
              value={
                typeof value === 'boolean' 
                  ? (value ? 'Yes' : 'No')
                  : (value === undefined || value === null ? '' : value.toString())
              }
              onChange={(e) => {
                // Handle boolean fields specially
                if (field === 'halfPaid' || field === 'cleared') {
                  onInputChange(field, e.target.value === 'Yes');
                } else {
                  onInputChange(field, e.target.value);
                }
              }}
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
            {value === undefined || value === null || value === '' ? '-' : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (typeof value === 'number' ? value.toLocaleString() : value))}
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
                <Field label="Weight" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                <Field label="Deal" value={formData.deal} field="deal" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Currency *" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleCurrencyChange} type="select" options={currencies} />
                <Field label="Payment Method" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={paymentMethods} />
                <Field label="Rs Amount *" value={formData.invoiceAmount} field="invoiceAmount" isEditing={isEditing} onInputChange={handleInvoiceAmountChange} type="number" highlight isCurrency />
                <Field label="% (Percent)" value={formData.percent} field="percent" isEditing={isEditing} onInputChange={handlePercentChange} type="number" />
                <Field label="Commission" value={formData.commission} field="commission" isEditing={isEditing} onInputChange={handleCommissionChange} type="number" highlight isCurrency />
                <Field label="Final Amount" value={formData.finalAmount} field="finalAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                <Field label="Payable Amount" value={formData.payableAmount} field="payableAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                <Field label="Outstanding Amount" value={formData.outstandingAmount} field="outstandingAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                <Field label="Half Paid" value={formData.halfPaid} field="halfPaid" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={['No', 'Yes']} />
                <Field label="Payment Date" value={formData.paymentDate} field="paymentDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Due Date" value={formData.dueDate} field="dueDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Paid / Not Paid" value={formData.status} field="status" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={['Paid', 'Partial', 'Pending', 'Overdue']} />
                <Field label="Cleared?" value={formData.cleared} field="cleared" isEditing={isEditing} onInputChange={handleInputChange} type="select" options={['No', 'Yes']} />
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
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.deal && item.deal.toLowerCase().includes(searchQuery.toLowerCase()));
        
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

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const customerName = (item.customerName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (item.description || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentMethod = (item.paymentMethod || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentDate = (item.paymentDate || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const dueDate = (item.dueDate || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const status = (item.status || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const deal = (item.deal || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${customerName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${description}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.invoiceAmount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.finalAmount ? formatCurrency(item.finalAmount, item.currency) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.payableAmount ? formatCurrency(item.payableAmount, item.currency) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.paidAmount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.outstandingAmount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${paymentMethod}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${paymentDate}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${dueDate}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${status}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.weight ? item.weight.toFixed(2) + ' ct' : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${deal}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.percent ? item.percent.toFixed(2) + '%' : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.commission ? formatCurrency(item.commission, item.currency) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.halfPaid ? 'Yes' : 'No'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.cleared ? 'Yes' : 'No'}</td>
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
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 10px; font-size: 7pt;">
          <colgroup>
            <col style="width: 5%;">
            <col style="width: 5%;">
            <col style="width: 8%;">
            <col style="width: 10%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 7%;">
            <col style="width: 6%;">
            <col style="width: 5%;">
            <col style="width: 5%;">
            <col style="width: 5%;">
            <col style="width: 5%;">
            <col style="width: 6%;">
            <col style="width: 5%;">
            <col style="width: 4%;">
            <col style="width: 5%;">
            <col style="width: 4%;">
            <col style="width: 3%;">
            <col style="width: 3%;">
            <col style="width: 6%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Customer</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Description</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Invoice Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Final Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payable Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Paid Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Outstanding</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Method</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Due Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Status</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Deal</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Percent</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Commission</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: center; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Half Paid</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: center; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Cleared</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 6pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="22" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No payment records found</td></tr>'}
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
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-violet-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Unified Payment Ledger in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
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
                  placeholder="Search by customer, code, description, company, deal..." 
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
            <table className="w-full text-left border-collapse min-w-[2200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Customer</th>
                     <th className="p-6">Weight</th>
                     <th className="p-6">Deal</th>
                     <th className="p-6">Rs Amount</th>
                     <th className="p-6">%</th>
                     <th className="p-6">Commission</th>
                     <th className="p-6">Final Amount</th>
                     <th className="p-6">Payable Amount</th>
                     <th className="p-6">Outstanding</th>
                     <th className="p-6">Half Paid</th>
                     <th className="p-6">Status</th>
                     <th className="p-6">Cleared?</th>
                     <th className="p-6 text-right pr-10">Paid Amount</th>
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
                        <td className="p-6 text-stone-600">{item.weight ? `${item.weight.toFixed(2)}ct` : <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 text-stone-600 max-w-xs truncate" title={item.deal}>{item.deal || <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-mono font-bold text-stone-900">{formatCurrency(item.invoiceAmount, item.currency)}</td>
                        <td className="p-6 font-mono text-stone-600">{item.percent ? `${item.percent}%` : <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-mono font-bold text-stone-700">{item.commission ? formatCurrency(item.commission, item.currency) : <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-mono font-bold text-indigo-700">{item.finalAmount ? formatCurrency(item.finalAmount, item.currency) : formatCurrency(item.invoiceAmount, item.currency)}</td>
                        <td className="p-6 font-mono font-bold text-blue-700">{item.payableAmount ? formatCurrency(item.payableAmount, item.currency) : <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-mono font-bold text-red-700">{formatCurrency(item.outstandingAmount, item.currency)}</td>
                        <td className="p-6">
                           {item.halfPaid ? (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Yes</span>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        <td className="p-6">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                              {item.status}
                           </span>
                        </td>
                        <td className="p-6">
                           {item.cleared ? (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Yes</span>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        <td className="p-6 text-right pr-10 font-mono font-bold text-violet-700">{formatCurrency(item.paidAmount, item.currency)}</td>
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

               <div className="mb-4 relative z-10 space-y-2">
                  {item.weight && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="text-stone-500">Weight:</span>
                        <span className="font-medium">{item.weight.toFixed(2)}ct</span>
                     </div>
                  )}
                  {item.deal && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="text-stone-500">Deal:</span>
                        <span className="font-medium">{item.deal}</span>
                     </div>
                  )}
                  {item.percent && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="text-stone-500">%:</span>
                        <span className="font-medium">{item.percent}%</span>
                     </div>
                  )}
                  {item.commission && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="text-stone-500">Commission:</span>
                        <span className="font-medium">{formatCurrency(item.commission, item.currency)}</span>
                     </div>
                  )}
                  {item.halfPaid && (
                     <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Half Paid</span>
                     </div>
                  )}
                  {item.cleared && (
                     <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Cleared</span>
                     </div>
                  )}
               </div>

               <div className="mb-4 relative z-10">
                  <div className="flex items-center justify-between text-sm mb-2">
                     <span className="text-stone-500">Rs Amount:</span>
                     <span className="font-bold text-stone-900">{formatCurrency(item.invoiceAmount, item.currency)}</span>
                  </div>
                  {item.finalAmount && item.finalAmount !== item.invoiceAmount && (
                     <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-stone-500">Final Amount:</span>
                        <span className="font-bold text-indigo-700">{formatCurrency(item.finalAmount, item.currency)}</span>
                     </div>
                  )}
                  {item.payableAmount && (
                     <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-stone-500">Payable Amount:</span>
                        <span className="font-bold text-blue-700">{formatCurrency(item.payableAmount, item.currency)}</span>
                     </div>
                  )}
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
    payableAmount: initialData?.payableAmount,
    paymentMethod: initialData?.paymentMethod || 'Cash',
    paymentDate: initialData?.paymentDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    status: initialData?.status || 'Pending',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
    company: initialData?.company || '',
    weight: initialData?.weight,
    deal: initialData?.deal || '',
    percent: initialData?.percent,
    commission: initialData?.commission,
    finalAmount: initialData?.finalAmount,
    halfPaid: initialData?.halfPaid || false,
    cleared: initialData?.cleared || false,
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    // Auto-calculate outstanding amount
    const outstanding = (formData.invoiceAmount || 0) - (formData.paidAmount || 0);
    setFormData(prev => ({ ...prev, outstandingAmount: outstanding }));
    
    // Auto-calculate commission if percent and invoiceAmount are provided
    if (formData.percent && formData.invoiceAmount) {
      const commission = (formData.invoiceAmount * formData.percent) / 100;
      setFormData(prev => ({ ...prev, commission }));
    }
    
    // Auto-calculate final amount (invoiceAmount + commission if commission exists)
    if (formData.commission !== undefined) {
      const finalAmount = (formData.invoiceAmount || 0) + (formData.commission || 0);
      setFormData(prev => ({ ...prev, finalAmount }));
    } else {
      setFormData(prev => ({ ...prev, finalAmount: formData.invoiceAmount }));
    }
    
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
  }, [formData.invoiceAmount, formData.paidAmount, formData.currency, formData.exchangeRate, formData.dueDate, formData.percent, formData.commission]);

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

  const handlePercentChange = (percent: number) => {
    const commission = (formData.invoiceAmount || 0) * (percent / 100);
    const finalAmount = (formData.invoiceAmount || 0) + commission;
    setFormData(prev => ({ ...prev, percent, commission, finalAmount }));
  };

  const handleCommissionChange = (commission: number) => {
    const finalAmount = (formData.invoiceAmount || 0) + commission;
    setFormData(prev => ({ ...prev, commission, finalAmount }));
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
      weight: formData.weight,
      deal: formData.deal,
      percent: formData.percent,
      commission: formData.commission,
      finalAmount: formData.finalAmount,
      payableAmount: formData.payableAmount,
      halfPaid: formData.halfPaid || false,
      cleared: formData.cleared || false,
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
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Weight</label>
                   <input 
                      type="number" 
                      step="0.01"
                      value={formData.weight || ''} 
                      onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Deal</label>
                   <input 
                      type="text" 
                      value={formData.deal || ''} 
                      onChange={e => setFormData({...formData, deal: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
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
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Rs Amount *</label>
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
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">% (Percent)</label>
                   <input 
                      type="number" 
                      step="0.01"
                      value={formData.percent || ''} 
                      onChange={e => handlePercentChange(Number(e.target.value))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Commission</label>
                   <input 
                      type="number" 
                      value={formData.commission || ''} 
                      onChange={e => handleCommissionChange(Number(e.target.value))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                      placeholder="Auto-calculated"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Final Amount</label>
                   <input 
                      type="number" 
                      value={formData.finalAmount || ''} 
                      disabled
                      className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-bold text-indigo-600" 
                      placeholder="Auto-calculated"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payable Amount</label>
                   <input 
                      type="number" 
                      value={formData.payableAmount || ''} 
                      onChange={e => setFormData({...formData, payableAmount: Number(e.target.value)})}
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
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Half Paid</label>
                   <select 
                      value={formData.halfPaid ? 'Yes' : 'No'} 
                      onChange={e => setFormData({...formData, halfPaid: e.target.value === 'Yes'})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                   >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Cleared?</label>
                   <select 
                      value={formData.cleared ? 'Yes' : 'No'} 
                      onChange={e => setFormData({...formData, cleared: e.target.value === 'Yes'})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                   >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                   </select>
                </div>
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



