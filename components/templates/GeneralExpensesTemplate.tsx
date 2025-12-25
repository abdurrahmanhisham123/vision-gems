import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, MapPin, Globe, Wallet
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---
interface GeneralExpenseItem {
  id: string;
  date: string;
  code: string;
  name: string; // Vendor/Payee
  description: string;
  amount: number;
  currency: string; // "LKR", "TZS", "KSH", "USD"
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  location?: string;
  company?: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): GeneralExpenseItem[] => {
  return [
    { 
      id: '1', 
      date: '2024-11-20', 
      code: 'EXP-001', 
      name: 'Local Transport Co', 
      description: 'Stone transport from warehouse', 
      amount: 12500, 
      currency: 'LKR',
      location: 'Colombo'
    },
    { 
      id: '2', 
      date: '2024-11-22', 
      code: 'EXP-002', 
      name: 'Tanzania Logistics', 
      description: 'Freight charges', 
      amount: 50000, 
      currency: 'TZS',
      convertedAmount: 6250,
      exchangeRate: 0.125,
      location: 'Dar es Salaam'
    },
    { 
      id: '3', 
      date: '2024-11-25', 
      code: 'EXP-003', 
      name: 'Kenya Supplies', 
      description: 'Office supplies purchase', 
      amount: 15000, 
      currency: 'KSH',
      convertedAmount: 33750,
      exchangeRate: 2.25,
      location: 'Nairobi'
    },
    { 
      id: '4', 
      date: '2024-11-28', 
      code: 'EXP-004', 
      name: 'VG Services', 
      description: 'Monthly maintenance', 
      amount: 25000, 
      currency: 'LKR',
      company: 'Vision Gems'
    },
  ];
};

export const GeneralExpensesTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<GeneralExpenseItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GeneralExpenseItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<GeneralExpenseItem | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalMain = items.reduce((sum, item) => sum + item.amount, 0);
    const totalLKR = items.reduce((sum, item) => 
      sum + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0)), 0
    );
    const foreignCount = items.filter(item => item.currency !== 'LKR').length;
    
    const dates = items.map(i => new Date(i.date));
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return { totalMain, totalLKR, count: items.length, foreignCount, minDate, maxDate };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = 
        (!dateRange.start || item.date >= dateRange.start) &&
        (!dateRange.end || item.date <= dateRange.end);
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
        
      return matchesSearch && matchesDate && matchesCurrency;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, dateRange, currencyFilter]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this expense?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: GeneralExpenseItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
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
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-red-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> General Expenses
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{tabId}</h2>
           <p className="text-stone-500 text-sm mt-1">Track operational expenses with multi-currency support.</p>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95"
           >
             <Plus size={18} /> Add Expense
           </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-stone-900">LKR {stats.totalLKR.toLocaleString()}</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <DollarSign size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Transactions</div>
              <div className="text-2xl font-bold text-stone-900">{stats.count}</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-500">
              <FileText size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Foreign Currency</div>
              <div className="text-2xl font-bold text-stone-900">{stats.foreignCount}</div>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe size={24} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Date Range</div>
              <div className="text-lg font-bold text-stone-900">
                {stats.minDate ? stats.minDate.toLocaleDateString() : '-'} 
                {stats.minDate && stats.maxDate ? ' - ' : ''}
                {stats.maxDate ? stats.maxDate.toLocaleDateString() : ''}
              </div>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Calendar size={24} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search description, vendor, code, location..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 gap-2 whitespace-nowrap">
               <span className="text-xs font-bold text-stone-400 uppercase">Date:</span>
               <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent text-sm text-stone-700 outline-none w-28" 
               />
               <span className="text-stone-300">-</span>
               <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent text-sm text-stone-700 outline-none w-28" 
               />
            </div>
            <select 
               value={currencyFilter}
               onChange={(e) => setCurrencyFilter(e.target.value)}
               className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
               <option value="all">All Currencies</option>
               {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
               ))}
            </select>
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
              <Download size={18} />
            </button>
            <button className="px-4 py-3 bg-stone-900 text-white rounded-xl shadow-lg hover:bg-stone-800 transition-colors">
              <Printer size={18} />
            </button>
         </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5">Date</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Vendor/Name</th>
                  <th className="p-5">Description</th>
                  <th className="p-5">Location</th>
                  <th className="p-5 text-right">Amount</th>
                  <th className="p-5 text-right">LKR Equivalent</th>
                  {!isReadOnly && <th className="p-5 w-24"></th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredItems.map(item => (
                  <tr 
                     key={item.id} 
                     onClick={() => setSelectedItem(item)}
                     className="hover:bg-red-50/30 transition-colors cursor-pointer group"
                  >
                     <td className="p-5 font-mono text-stone-500 text-xs whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-stone-300" />
                        {item.date}
                     </td>
                     <td className="p-5">
                        <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                           {item.code}
                        </span>
                     </td>
                     <td className="p-5 font-medium text-stone-800">{item.name}</td>
                     <td className="p-5 text-stone-600 max-w-xs truncate" title={item.description}>
                        {item.description}
                     </td>
                     <td className="p-5">
                        {item.location ? (
                           <div className="flex items-center gap-1 text-stone-500 text-xs">
                              <MapPin size={12} />
                              {item.location}
                           </div>
                        ) : (
                           <span className="text-stone-300">-</span>
                        )}
                     </td>
                     <td className="p-5 text-right">
                        <div className="font-bold" style={{color: item.currency === 'LKR' ? '#dc2626' : '#7c3aed'}}>
                           {formatCurrency(item.amount, item.currency)}
                        </div>
                     </td>
                     <td className="p-5 text-right">
                        {item.convertedAmount ? (
                           <div className="font-bold text-stone-900">
                              LKR {item.convertedAmount.toLocaleString()}
                           </div>
                        ) : item.currency === 'LKR' ? (
                           <div className="font-bold text-stone-900">
                              LKR {item.amount.toLocaleString()}
                           </div>
                        ) : (
                           <span className="text-stone-300 text-xs">-</span>
                        )}
                     </td>
                     
                     {!isReadOnly && (
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsFormOpen(true); }}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                 <Edit size={14} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </td>
                     )}
                  </tr>
               ))}
            </tbody>
         </table>
         {filteredItems.length === 0 && (
            <div className="p-12 text-center text-stone-400">No expenses found.</div>
         )}
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 opacity-50 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                     </span>
                     <h3 className="font-bold text-stone-900 text-lg">{item.description}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                     {item.code}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-stone-400 uppercase">Vendor:</span>
                     <span className="truncate">{item.name}</span>
                  </div>
                  {item.location && (
                     <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-stone-400" />
                        <span className="truncate">{item.location}</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Original Amount</div>
                     <div className="text-lg font-bold" style={{color: item.currency === 'LKR' ? '#dc2626' : '#7c3aed'}}>
                        {formatCurrency(item.amount, item.currency)}
                     </div>
                  </div>
                  {item.convertedAmount && (
                     <div className="text-right">
                        <div className="text-xs text-stone-400 font-medium mb-1">LKR Equivalent</div>
                        <div className="text-xl font-bold text-stone-900">LKR {item.convertedAmount.toLocaleString()}</div>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Expense Details'}
         subtitle={`${selectedItem?.code} • ${selectedItem?.name}`}
         status="Completed"
         statusColor="bg-emerald-100 text-emerald-700"
         icon={<Wallet size={32} className="text-red-600" />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Date': selectedItem.date,
            'Code': selectedItem.code,
            'Vendor/Name': selectedItem.name,
            'Description': selectedItem.description,
            'Amount': formatCurrency(selectedItem.amount, selectedItem.currency),
            ...(selectedItem.convertedAmount ? { 'LKR Equivalent': `LKR ${selectedItem.convertedAmount.toLocaleString()}` } : {}),
            ...(selectedItem.exchangeRate ? { 'Exchange Rate': `1 ${selectedItem.currency} = ${selectedItem.exchangeRate} LKR` } : {}),
            ...(selectedItem.location ? { 'Location': selectedItem.location } : {}),
            ...(selectedItem.company ? { 'Company': selectedItem.company } : {}),
         } : undefined}
      />

      {/* Form Modal */}
      {isFormOpen && (
         <GeneralExpenseForm 
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
const GeneralExpenseForm: React.FC<{
  initialData: GeneralExpenseItem | null;
  currencies: string[];
  exchangeRates: Record<string, number>;
  onSave: (item: GeneralExpenseItem) => void;
  onCancel: () => void;
}> = ({ initialData, currencies, exchangeRates, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<GeneralExpenseItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    location: initialData?.location || '',
    company: initialData?.company || '',
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
    if (!formData.description || !formData.amount || !formData.name) {
      return alert('Description, Amount, and Vendor Name are required');
    }
    
    onSave({
      id: initialData?.id || `exp-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `EXP-${Date.now().toString().slice(-4)}`,
      name: formData.name!,
      description: formData.description!,
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      convertedAmount: formData.convertedAmount,
      exchangeRate: formData.exchangeRate,
      location: formData.location,
      company: formData.company,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Vendor/Name *</label>
                <input 
                   type="text" 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                   placeholder="Vendor or payee name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description *</label>
                <textarea 
                   rows={3}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none" 
                   placeholder="Expense description..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.currency !== 'LKR' && formData.convertedAmount && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                   <div className="text-xs font-bold text-red-600 uppercase mb-2">Currency Conversion</div>
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

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location</label>
                   <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                   <input 
                      type="text" 
                      value={formData.company} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
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

