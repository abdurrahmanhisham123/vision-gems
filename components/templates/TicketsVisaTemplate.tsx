import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Plane, Globe, Ticket, User, Building2
} from 'lucide-react';

// --- Types ---
interface TicketsVisaItem {
  id: string;
  date: string;
  code: string;
  passengerName: string;
  route?: string; // From → To
  airline?: string;
  ticketType?: 'One-way' | 'Round-trip' | 'Multi-city';
  visaType?: string; // Tourist, Business, Transit, etc.
  amount: number;
  currency: string; // "LKR", "TZS", "USD", etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  company?: string;
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): TicketsVisaItem[] => {
  return [];
};

// --- Side Panel Component ---
const TicketsVisaDetailPanel: React.FC<{
  item: TicketsVisaItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: TicketsVisaItem) => void;
  onDelete: (id: string) => void;
  currencies: string[];
  exchangeRates: Record<string, number>;
  hasRouteInfo?: boolean;
  hasAirline?: boolean;
  hasVisaType?: boolean;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, currencies, exchangeRates, hasRouteInfo = false, hasAirline = false, hasVisaType = false, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<TicketsVisaItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  const handleInputChange = (key: keyof TicketsVisaItem, value: any) => {
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
    if (!formData.passengerName || !formData.amount) {
      return alert('Passenger Name and Amount are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this ticket/visa record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof TicketsVisaItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof TicketsVisaItem, value: any) => void,
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
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
            >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input 
              type={type} 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10" 
            />
          )
        ) : (
          <span className={`text-sm ${highlight ? 'font-bold text-cyan-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
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
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
              <Ticket size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                  {formData.ticketType || 'Ticket'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.passengerName} 
                  onChange={(e) => handleInputChange('passengerName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-cyan-200 focus:border-cyan-500 outline-none w-full" 
                  placeholder="Passenger Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.passengerName}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <Plane size={14} className="text-stone-400" />
                <p className="truncate">{formData.route || 'No route'} • {formatCurrency(formData.amount, formData.currency)}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Ticket size={14} className="text-cyan-500" /> Ticket/Visa Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Passenger Name" value={formData.passengerName} field="passengerName" isEditing={isEditing} onInputChange={handleInputChange} />
                {hasRouteInfo && (
                  <Field label="Route (From → To)" value={formData.route} field="route" isEditing={isEditing} onInputChange={handleInputChange} />
                )}
                {hasAirline && (
                  <Field label="Airline" value={formData.airline} field="airline" isEditing={isEditing} onInputChange={handleInputChange} />
                )}
                <Field 
                  label="Ticket Type" 
                  value={formData.ticketType} 
                  field="ticketType" 
                  isEditing={isEditing} 
                  onInputChange={handleInputChange} 
                  options={['One-way', 'Round-trip', 'Multi-city']}
                />
                {hasVisaType && (
                  <Field 
                    label="Visa Type" 
                    value={formData.visaType} 
                    field="visaType" 
                    isEditing={isEditing} 
                    onInputChange={handleInputChange}
                    options={['Tourist', 'Business', 'Transit', 'Work', 'Student', 'Other']}
                  />
                )}
                <Field label="Currency" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleInputChange} options={currencies} />
                <Field label="Amount" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                    <Field label="LKR Equivalent" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                {formData.company && (
                  <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                )}
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-cyan-700 transition-all">
                <Save size={16} /> Save
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrint} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100">
                <Printer size={18} />
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-cyan-700 transition-all">
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

export const TicketsVisaTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<TicketsVisaItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<TicketsVisaItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TicketsVisaItem | null>(null);

  // Determine tab-specific requirements
  const tabConfig = useMemo(() => {
    const tabLower = tabId.toLowerCase();
    return {
      hasRouteInfo: tabLower.includes('ticket') || tabLower.includes('traveling') || tabLower === 'bkkticket',
      hasAirline: tabLower.includes('online') || tabLower === 'bkktickets',
      hasVisaType: tabLower.includes('visa') || tabLower.includes('personal ticket visa')
    };
  }, [tabId]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalMain = items.reduce((sum, item) => sum + item.amount, 0);
    const totalLKR = items.reduce((sum, item) => 
      sum + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0)), 0
    );
    const foreignCount = items.filter(item => item.currency !== 'LKR').length;
    const ticketCount = items.length;
    
    return { totalMain, totalLKR, count: ticketCount, foreignCount };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.route && item.route.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.airline && item.airline.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
        
      return matchesSearch && matchesCurrency;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, currencyFilter]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this ticket/visa record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: TicketsVisaItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: TicketsVisaItem) => {
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

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const passengerName = (item.passengerName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const route = (item.route || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const airline = (item.airline || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const ticketType = (item.ticketType || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const visaType = (item.visaType || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${passengerName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${route}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${airline}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${ticketType}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${visaType}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${notes}</td>
      </tr>
    `;
    }).join('');

    const safeTabId = tabId.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Create print overlay that covers the page
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
    
    // Add print-specific styles
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
            <col style="width: 10%;">
            <col style="width: 10%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 10%;">
            <col style="width: 10%;">
            <col style="width: 7%;">
            <col style="width: 8%;">
            <col style="width: 7%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Passenger</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Route</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Airline</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Ticket Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Visa Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="12" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No tickets/visas found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(printOverlay);

    // Wait for content to render, then trigger print
    setTimeout(() => {
      window.print();
    }, 100);

    // Clean up after print dialog closes
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
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-cyan-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Tickets & Visa in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-900/20 hover:bg-cyan-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Ticket/Visa
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalLKR.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <Ticket size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Tickets Issued</div>
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
           <div className="text-lg font-black text-stone-900">{stats.foreignCount}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Plane size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Avg Ticket Cost</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              {stats.count > 0 ? `LKR ${Math.floor(stats.totalLKR / stats.count).toLocaleString()}` : '-'}
           </div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalLKR.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Tickets Issued</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <Ticket size={28} />
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
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Avg Ticket Cost</div>
              <div className="text-2xl font-black text-stone-900">
                {stats.count > 0 ? `LKR ${Math.floor(stats.totalLKR / stats.count).toLocaleString()}` : '-'}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Plane size={28} />
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
                  placeholder="Search by passenger, route, code, airline..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Globe size={14} className="text-stone-900" />
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

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Passenger</th>
                     {tabConfig.hasRouteInfo && <th className="p-6">Route</th>}
                     {tabConfig.hasAirline && <th className="p-6">Airline</th>}
                     <th className="p-6">Type</th>
                     {tabConfig.hasVisaType && <th className="p-6">Visa Type</th>}
                     <th className="p-6 text-right">Amount</th>
                     <th className="p-6 text-right pr-10">LKR Equivalent</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-cyan-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-100">
                              {item.code}
                           </span>
                        </td>
                        <td className="p-6 font-bold text-stone-800">{item.passengerName}</td>
                        {tabConfig.hasRouteInfo && (
                          <td className="p-6 text-stone-600">
                            {item.route ? (
                              <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                                <Plane size={14} />
                                {item.route}
                              </div>
                            ) : (
                              <span className="text-stone-300">-</span>
                            )}
                          </td>
                        )}
                        {tabConfig.hasAirline && (
                          <td className="p-6 text-stone-600">{item.airline || <span className="text-stone-300">-</span>}</td>
                        )}
                        <td className="p-6">
                          {item.ticketType && (
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                              {item.ticketType}
                            </span>
                          )}
                        </td>
                        {tabConfig.hasVisaType && (
                          <td className="p-6 text-stone-600">{item.visaType || <span className="text-stone-300">-</span>}</td>
                        )}
                        <td className="p-6 text-right">
                           <div className="font-black" style={{color: item.currency === 'LKR' ? '#0891b2' : '#7c3aed'}}>
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
               <div className="p-16 text-center text-stone-400">No tickets/visas found.</div>
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
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Plane size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.passengerName}</h3>
                  </div>
                  <span className="font-mono text-xs font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-xl border border-cyan-100">
                     {item.code}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 relative z-10">
                  {item.route && (
                     <div className="flex items-center gap-2">
                        <Plane size={14} className="text-stone-400" />
                        <span className="truncate font-medium">{item.route}</span>
                     </div>
                  )}
                  {item.airline && (
                     <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-stone-400" />
                        <span className="truncate">{item.airline}</span>
                     </div>
                  )}
                  {item.ticketType && (
                     <div className="flex items-center gap-2">
                        <FileText size={14} className="text-stone-400" />
                        <span className="truncate">{item.ticketType}</span>
                     </div>
                  )}
                  {item.visaType && (
                     <div className="flex items-center gap-2">
                        <User size={14} className="text-stone-400" />
                        <span className="truncate">{item.visaType}</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Original Amount</div>
                     <div className="text-lg font-black" style={{color: item.currency === 'LKR' ? '#0891b2' : '#7c3aed'}}>
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
         <TicketsVisaDetailPanel 
            item={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            currencies={currencies}
            exchangeRates={exchangeRates}
            hasRouteInfo={tabConfig.hasRouteInfo}
            hasAirline={tabConfig.hasAirline}
            hasVisaType={tabConfig.hasVisaType}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <TicketsVisaForm 
            initialData={editingItem}
            currencies={currencies}
            exchangeRates={exchangeRates}
            hasRouteInfo={tabConfig.hasRouteInfo}
            hasAirline={tabConfig.hasAirline}
            hasVisaType={tabConfig.hasVisaType}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const TicketsVisaForm: React.FC<{
  initialData: TicketsVisaItem | null;
  currencies: string[];
  exchangeRates: Record<string, number>;
  hasRouteInfo?: boolean;
  hasAirline?: boolean;
  hasVisaType?: boolean;
  onSave: (item: TicketsVisaItem) => void;
  onCancel: () => void;
}> = ({ initialData, currencies, exchangeRates, hasRouteInfo = false, hasAirline = false, hasVisaType = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TicketsVisaItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    passengerName: initialData?.passengerName || '',
    route: initialData?.route || '',
    airline: initialData?.airline || '',
    ticketType: initialData?.ticketType || 'One-way',
    visaType: initialData?.visaType || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    company: initialData?.company || '',
    notes: initialData?.notes || '',
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
    if (!formData.passengerName || !formData.amount) {
      return alert('Passenger Name and Amount are required');
    }
    
    onSave({
      id: initialData?.id || `ticket-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `TKT-${Date.now().toString().slice(-4)}`,
      passengerName: formData.passengerName!,
      route: formData.route,
      airline: formData.airline,
      ticketType: formData.ticketType,
      visaType: formData.visaType,
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      convertedAmount: formData.convertedAmount,
      exchangeRate: formData.exchangeRate,
      company: formData.company,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Ticket/Visa' : 'New Ticket/Visa'}</h3>
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="TKT-001"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Passenger Name *</label>
                <input 
                   type="text" 
                   value={formData.passengerName} 
                   onChange={e => setFormData({...formData, passengerName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="Passenger name"
                />
             </div>

             {hasRouteInfo && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Route (From → To)</label>
                   <input 
                      type="text" 
                      value={formData.route} 
                      onChange={e => setFormData({...formData, route: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="e.g., CMB → BKK"
                   />
                </div>
             )}

             {hasAirline && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Airline</label>
                   <input 
                      type="text" 
                      value={formData.airline} 
                      onChange={e => setFormData({...formData, airline: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="Airline name"
                   />
                </div>
             )}

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Ticket Type</label>
                <select 
                   value={formData.ticketType} 
                   onChange={e => setFormData({...formData, ticketType: e.target.value as any})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                >
                   <option value="One-way">One-way</option>
                   <option value="Round-trip">Round-trip</option>
                   <option value="Multi-city">Multi-city</option>
                </select>
             </div>

             {hasVisaType && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Visa Type</label>
                   <select 
                      value={formData.visaType} 
                      onChange={e => setFormData({...formData, visaType: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                   >
                      <option value="">Select visa type</option>
                      <option value="Tourist">Tourist</option>
                      <option value="Business">Business</option>
                      <option value="Transit">Transit</option>
                      <option value="Work">Work</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                   </select>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.currency !== 'LKR' && formData.convertedAmount && (
                <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                   <div className="text-xs font-bold text-cyan-600 uppercase mb-2">Currency Conversion</div>
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

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                <input 
                   type="text" 
                   value={formData.company || ''} 
                   onChange={e => setFormData({...formData, company: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="Optional"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Ticket/Visa
             </button>
          </div>
       </div>
    </div>
  );
};

