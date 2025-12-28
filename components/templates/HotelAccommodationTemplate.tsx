import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Globe, Hotel, MapPin, Calendar, Moon
} from 'lucide-react';

// --- Types ---
interface HotelAccommodationItem {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  code: string;
  hotelName: string;
  location: string; // Required
  amount: number;
  currency: string; // "LKR", "TZS", "USD", etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  nights?: number; // Auto-calculated
  costPerNight?: number; // Auto-calculated: amount / nights
  notes?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): HotelAccommodationItem[] => {
  return [];
};

// Helper function to calculate nights between two dates
const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// --- Side Panel Component ---
const HotelAccommodationDetailPanel: React.FC<{
  item: HotelAccommodationItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: HotelAccommodationItem) => void;
  onDelete: (id: string) => void;
  currencies: string[];
  exchangeRates: Record<string, number>;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, currencies, exchangeRates, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<HotelAccommodationItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  // Auto-calculate nights and cost per night
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
      const costPerNight = nights > 0 && formData.amount ? Number((formData.amount / nights).toFixed(2)) : undefined;
      setFormData(prev => ({ ...prev, nights, costPerNight }));
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.amount]);

  const handleInputChange = (key: keyof HotelAccommodationItem, value: any) => {
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
    if (!formData.hotelName || !formData.amount || !formData.location || !formData.checkInDate || !formData.checkOutDate) {
      return alert('Hotel Name, Amount, Location, Check-in Date, and Check-out Date are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this hotel/accommodation record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof HotelAccommodationItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof HotelAccommodationItem, value: any) => void,
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
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10"
            >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10" 
            />
          )
        ) : (
          <span className={`text-sm ${highlight ? 'font-bold text-pink-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
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
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
              <Hotel size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                  {formData.nights ? `${formData.nights} Nights` : 'Stay'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.hotelName} 
                  onChange={(e) => handleInputChange('hotelName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-pink-200 focus:border-pink-500 outline-none w-full" 
                  placeholder="Hotel Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.hotelName}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <MapPin size={14} className="text-stone-400" />
                <p className="truncate">{formData.location} • {formatCurrency(formData.amount, formData.currency)}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Hotel size={14} className="text-pink-500" /> Accommodation Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Check-in Date" value={formData.checkInDate} field="checkInDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Check-out Date" value={formData.checkOutDate} field="checkOutDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Hotel Name" value={formData.hotelName} field="hotelName" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Location" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Number of Nights" value={formData.nights} field="nights" isEditing={false} onInputChange={handleInputChange} highlight />
                <Field label="Currency" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleInputChange} options={currencies} />
                <Field label="Amount" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                    <Field label="LKR Equivalent" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                <Field label="Cost Per Night" value={formData.costPerNight} field="costPerNight" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-pink-700 transition-all">
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
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-pink-700 transition-all">
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

export const HotelAccommodationTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<HotelAccommodationItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<HotelAccommodationItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotelAccommodationItem | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => 
      sum + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0)), 0
    );
    const stayCount = items.length;
    const totalNights = items.reduce((sum, item) => sum + (item.nights || 0), 0);
    const avgCostPerNight = totalNights > 0 ? Math.floor(totalAmount / totalNights) : 0;
    
    return { totalAmount, count: stayCount, totalNights, avgCostPerNight };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
        
      return matchesSearch && matchesCurrency;
    }).sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
  }, [items, searchQuery, currencyFilter]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this hotel/accommodation record?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: HotelAccommodationItem) => {
    // Ensure nights and cost per night are calculated
    const nights = calculateNights(item.checkInDate, item.checkOutDate);
    const costPerNight = nights > 0 && item.amount ? Number((item.amount / nights).toFixed(2)) : undefined;
    const updatedItem = { ...item, nights, costPerNight };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    } else {
      setItems(prev => [updatedItem, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: HotelAccommodationItem) => {
    const nights = calculateNights(item.checkInDate, item.checkOutDate);
    const costPerNight = nights > 0 && item.amount ? Number((item.amount / nights).toFixed(2)) : undefined;
    const updatedItem = { ...item, nights, costPerNight };
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setSelectedItem(updatedItem);
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
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-pink-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredItems.length} stays currently tracked</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-900/20 hover:bg-pink-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Stay
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <Hotel size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Stays</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.count}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Moon size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Nights</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.totalNights}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Avg Cost/Night</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              {stats.totalNights > 0 ? `LKR ${stats.avgCostPerNight.toLocaleString()}` : '-'}
           </div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Stays</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <Hotel size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Nights</div>
              <div className="text-2xl font-black text-stone-900">{stats.totalNights}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Moon size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Avg Cost Per Night</div>
              <div className="text-2xl font-black text-stone-900">
                {stats.totalNights > 0 ? `LKR ${stats.avgCostPerNight.toLocaleString()}` : '-'}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign size={28} />
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
                  placeholder="Search by hotel, location, code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-pink-500/5 focus:border-pink-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
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
                     <th className="p-6 pl-10">Check-in</th>
                     <th className="p-6">Check-out</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Hotel</th>
                     <th className="p-6">Location</th>
                     <th className="p-6">Nights</th>
                     <th className="p-6 text-right">Amount</th>
                     <th className="p-6 text-right pr-10">LKR Equivalent</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-pink-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.checkInDate}</td>
                        <td className="p-6 font-mono text-stone-500 text-xs whitespace-nowrap">{item.checkOutDate}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-100">
                              {item.code}
                           </span>
                        </td>
                        <td className="p-6 font-bold text-stone-800">{item.hotelName}</td>
                        <td className="p-6">
                           <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                              <MapPin size={14} />
                              {item.location}
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {item.nights || 0} nights
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="font-black" style={{color: item.currency === 'LKR' ? '#ec4899' : '#7c3aed'}}>
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
               <div className="p-16 text-center text-stone-400">No stays found.</div>
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
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {item.checkInDate} - {item.checkOutDate}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.hotelName}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="font-mono text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-100">
                        {item.code}
                     </span>
                     {item.nights && (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                           {item.nights} nights
                        </span>
                     )}
                  </div>
               </div>

               <div className="mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                     <MapPin size={14} className="text-stone-400" />
                     <span className="font-medium">{item.location}</span>
                  </div>
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Original Amount</div>
                     <div className="text-lg font-black" style={{color: item.currency === 'LKR' ? '#ec4899' : '#7c3aed'}}>
                        {formatCurrency(item.amount, item.currency)}
                     </div>
                     {item.costPerNight && (
                        <div className="text-xs text-stone-500 mt-1">
                           {formatCurrency(item.costPerNight, item.currency)}/night
                        </div>
                     )}
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
         <HotelAccommodationDetailPanel 
            item={selectedItem} 
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
         <HotelAccommodationForm 
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
const HotelAccommodationForm: React.FC<{
  initialData: HotelAccommodationItem | null;
  currencies: string[];
  exchangeRates: Record<string, number>;
  onSave: (item: HotelAccommodationItem) => void;
  onCancel: () => void;
}> = ({ initialData, currencies, exchangeRates, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<HotelAccommodationItem>>({
    checkInDate: initialData?.checkInDate || new Date().toISOString().split('T')[0],
    checkOutDate: initialData?.checkOutDate || '',
    code: initialData?.code || '',
    hotelName: initialData?.hotelName || '',
    location: initialData?.location || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    notes: initialData?.notes || '',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
  });

  // Auto-calculate nights and cost per night
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
      const costPerNight = nights > 0 && formData.amount ? Number((formData.amount / nights).toFixed(2)) : undefined;
      setFormData(prev => ({ ...prev, nights, costPerNight }));
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.amount]);

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
    if (!formData.hotelName || !formData.amount || !formData.location || !formData.checkInDate || !formData.checkOutDate) {
      return alert('Hotel Name, Amount, Location, Check-in Date, and Check-out Date are required');
    }
    
    const nights = calculateNights(formData.checkInDate!, formData.checkOutDate!);
    const costPerNight = nights > 0 && formData.amount ? Number((formData.amount / nights).toFixed(2)) : undefined;
    
    onSave({
      id: initialData?.id || `hotel-${Date.now()}`,
      checkInDate: formData.checkInDate!,
      checkOutDate: formData.checkOutDate!,
      code: formData.code || `HTL-${Date.now().toString().slice(-4)}`,
      hotelName: formData.hotelName!,
      location: formData.location!,
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      convertedAmount: formData.convertedAmount,
      exchangeRate: formData.exchangeRate,
      nights,
      costPerNight,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Stay' : 'New Stay'}</h3>
             <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={20}/></button>
          </div>

          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Check-in Date *</label>
                   <input 
                      type="date" 
                      value={formData.checkInDate} 
                      onChange={e => setFormData({...formData, checkInDate: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Check-out Date *</label>
                   <input 
                      type="date" 
                      value={formData.checkOutDate} 
                      onChange={e => setFormData({...formData, checkOutDate: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                   />
                </div>
             </div>

             {formData.nights !== undefined && formData.nights > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                   <div className="text-xs font-bold text-blue-600 uppercase mb-1">Duration</div>
                   <div className="text-sm text-blue-700 font-medium">{formData.nights} night{formData.nights !== 1 ? 's' : ''}</div>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                      placeholder="HTL-001"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                   >
                      {currencies.map(curr => (
                         <option key={curr} value={curr}>{curr}</option>
                      ))}
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Hotel/Accommodation Name *</label>
                <input 
                   type="text" 
                   value={formData.hotelName} 
                   onChange={e => setFormData({...formData, hotelName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                   placeholder="Hotel or accommodation name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location *</label>
                <input 
                   type="text" 
                   value={formData.location} 
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                   placeholder="Location"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount *</label>
                <input 
                   type="number" 
                   value={formData.amount} 
                   onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                   onFocus={(e) => {
                     if (formData.amount === 0 || formData.amount === null || formData.amount === undefined) {
                       e.target.select();
                     }
                   }}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" 
                   placeholder="0.00"
                />
             </div>

             {formData.currency !== 'LKR' && formData.convertedAmount && (
                <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                   <div className="text-xs font-bold text-pink-600 uppercase mb-2">Currency Conversion</div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">Exchange Rate</label>
                         <input 
                            type="number" 
                            step="0.0001" 
                            value={formData.exchangeRate} 
                            onChange={e => setFormData({...formData, exchangeRate: Number(e.target.value)})}
                            onFocus={(e) => {
                              if (formData.exchangeRate === 0 || formData.exchangeRate === null || formData.exchangeRate === undefined) {
                                e.target.select();
                              }
                            }}
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

             {formData.costPerNight && formData.nights && formData.nights > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                   <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Cost Per Night</div>
                   <div className="text-lg text-emerald-700 font-bold">
                      {formData.currency} {formData.costPerNight.toLocaleString()}
                   </div>
                </div>
             )}

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Stay
             </button>
          </div>
       </div>
    </div>
  );
};



