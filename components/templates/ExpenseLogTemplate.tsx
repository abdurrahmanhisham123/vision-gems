
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Briefcase, Plane, 
  BedDouble, FileText, User, ArrowRight, Wallet
} from 'lucide-react';
import { ExpenseConfig } from '../../utils/expenseConfig';
import { getExpenseTransactions, ExpenseTransaction } from '../../services/dataService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: ExpenseConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Components ---

const SummaryCard: React.FC<{ transactions: ExpenseTransaction[], config: ExpenseConfig }> = ({ transactions, config }) => {
  const summary = useMemo(() => {
    let totalMain = 0;
    let totalLkr = 0;
    const isForeign = !!config.convertTo;

    transactions.forEach(t => {
      totalMain += t.amount || 0;
      if (isForeign && t.lkrAmount) totalLkr += t.lkrAmount;
    });

    const dates = transactions.map(t => new Date(t.date));
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return { totalMain, totalLkr, count: transactions.length, minDate, maxDate };
  }, [transactions, config]);

  const formatDate = (d: Date | null) => d ? d.toLocaleDateString() : '-';

  return (
    <div className="expense-summary-card mb-8">
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Wallet size={18} style={{color: config.themeColor}} /> Financial Overview
      </h3>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="total-amount" style={{color: config.themeColor}}>
             {config.currency} {summary.totalMain.toLocaleString()}
           </div>
           {config.convertTo && (
             <div className="text-xl font-bold text-stone-600 mt-1">
               = {config.convertTo} {summary.totalLkr.toLocaleString()}
             </div>
           )}
           {config.exchangeRate && (
             <div className="exchange-info mt-2">
               Exchange Rate: 1 {config.currency} = {config.exchangeRate} {config.convertTo}
             </div>
           )}
        </div>
        
        <div className="text-right text-stone-600 text-sm">
           <div className="font-bold">{summary.count} Transactions</div>
           <div className="mt-1 text-stone-500">
             {formatDate(summary.minDate)} - {formatDate(summary.maxDate)}
           </div>
        </div>
      </div>
    </div>
  );
};

export const ExpenseLogTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseTransaction | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExpenseTransaction | null>(null);

  useEffect(() => {
    setLoading(true);
    getExpenseTransactions(config).then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, [config]);

  // Filtering
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = 
        (!dateRange.start || t.date >= dateRange.start) &&
        (!dateRange.end || t.date <= dateRange.end);
        
      return matchesSearch && matchesDate;
    });
  }, [transactions, searchQuery, dateRange]);

  // CRUD
  const handleSave = (item: ExpenseTransaction) => {
    if (editingItem) {
      setTransactions(prev => prev.map(t => t.id === item.id ? item : t));
    } else {
      setTransactions(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading expense log...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 opacity-70" style={{color: config.themeColor}}>
              {config.module} <span className="text-stone-300">/</span> {config.expenseType.replace('_', ' ')}
           </div>
           <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{config.tabName}</h2>
           {config.note && <p className="text-stone-500 text-sm mt-1">{config.note}</p>}
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
             style={{backgroundColor: config.themeColor}}
           >
             <Plus size={18} /> Add Expense
           </button>
        )}
      </div>

      {config.hasOutIndicator && (
        <div className="out-indicator mb-6">OUT</div>
      )}

      {config.showTotal !== false && (
        <SummaryCard transactions={filteredData} config={config} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search transactions..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 shadow-sm transition-all"
               style={{caretColor: config.themeColor}}
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 gap-2 shadow-sm whitespace-nowrap">
               <span className="text-xs font-bold text-stone-400 uppercase">Date:</span>
               <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent text-sm text-stone-700 outline-none w-24 sm:w-auto" 
               />
               <span className="text-stone-300">-</span>
               <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent text-sm text-stone-700 outline-none w-24 sm:w-auto" 
               />
            </div>
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
              <Download size={18} />
            </button>
            <button className="px-4 py-3 bg-stone-900 text-white rounded-xl shadow-lg hover:bg-stone-800 transition-colors">
              <Printer size={18} />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <div className="overflow-x-auto">
            <table className="expense-table">
               <thead>
                  <tr>
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Date</th>
                     {config.hasCompanyColumn && <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Company</th>}
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Code</th>
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Name/Vendor</th>
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Description</th>
                     {config.expenseType === 'cut_polish' && <th style={{color: config.themeColor, borderBottomColor: config.themeColor}} className="text-right">Weight</th>}
                     {config.expenseType === 'tickets_visa' && <th style={{color: config.themeColor, borderBottomColor: config.themeColor}}>Route/Details</th>}
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}} className="text-right">Amount ({config.currency})</th>
                     {config.convertTo && <th style={{color: config.themeColor, borderBottomColor: config.themeColor}} className="text-right">Amount ({config.convertTo})</th>}
                     <th style={{color: config.themeColor, borderBottomColor: config.themeColor}} className="w-24"></th>
                  </tr>
               </thead>
               <tbody>
                  {filteredData.map(t => (
                     <tr 
                        key={t.id} 
                        onClick={() => setSelectedItem(t)}
                        className="cursor-pointer transition-colors"
                     >
                        <td className="font-mono text-stone-500 text-xs whitespace-nowrap">{t.date}</td>
                        {config.hasCompanyColumn && <td><span className="category-badge">{t.company}</span></td>}
                        <td className="text-stone-500 text-xs font-mono">{t.code || '-'}</td>
                        <td className="font-medium text-stone-700">{t.name || '-'}</td>
                        <td className="text-stone-600">{t.description}</td>
                        {config.expenseType === 'cut_polish' && <td className="text-right font-mono text-stone-600">{t.weight?.toFixed(2)} ct</td>}
                        {config.expenseType === 'tickets_visa' && (
                           <td className="text-xs text-stone-500">
                              {t.route && <div>{t.route}</div>}
                              {t.airline && <div>{t.airline}</div>}
                              {t.visaType && <div>{t.visaType}</div>}
                           </td>
                        )}
                        <td className="text-right amount-display" style={{color: config.themeColor}}>
                           {t.amount.toLocaleString()}
                        </td>
                        {config.convertTo && (
                           <td className="text-right font-bold text-stone-500 text-sm">
                              {t.lkrAmount?.toLocaleString()}
                           </td>
                        )}
                        <td className="text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isReadOnly && (
                                 <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setEditingItem(t); setIsFormOpen(true); }}
                                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                                    >
                                       <Edit size={14} />
                                    </button>
                                    <button 
                                      onClick={(e) => handleDelete(t.id, e)}
                                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
                  {filteredData.length === 0 && (
                     <tr>
                        <td colSpan={10} className="p-8 text-center text-stone-400">No transactions found.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Transaction'}
         subtitle={`${selectedItem?.date} • ${selectedItem?.code || ''}`}
         status="Completed"
         statusColor="bg-stone-100 text-stone-600"
         icon={<DollarSign size={32} style={{color: config.themeColor}} />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Date': selectedItem.date,
            'Amount': `${config.currency} ${selectedItem.amount.toLocaleString()}`,
            ...(selectedItem.lkrAmount ? { [`Amount (${config.convertTo})`]: selectedItem.lkrAmount.toLocaleString() } : {}),
            ...(selectedItem.exchangeRate ? { 'Exchange Rate': selectedItem.exchangeRate } : {}),
            ...(selectedItem.company ? { 'Company': selectedItem.company } : {}),
            'Name': selectedItem.name,
            ...(selectedItem.weight ? { 'Weight': `${selectedItem.weight} ct` } : {}),
            ...(selectedItem.route ? { 'Route': selectedItem.route } : {}),
            ...(selectedItem.location ? { 'Location': selectedItem.location } : {}),
            ...(selectedItem.duration ? { 'Duration': selectedItem.duration } : {}),
         } : undefined}
      />

      {/* Form Modal */}
      {isFormOpen && (
         <ExpenseForm 
            initialData={editingItem}
            config={config}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}

    </div>
  );
};

// --- Form Component ---

const ExpenseForm: React.FC<{
  initialData: ExpenseTransaction | null;
  config: ExpenseConfig;
  onSave: (item: ExpenseTransaction) => void;
  onCancel: () => void;
}> = ({ initialData, config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ExpenseTransaction>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    company: 'VG',
    name: config.personName || '',
    exchangeRate: config.exchangeRate,
  });

  // Auto-calc converted amount
  useEffect(() => {
    if (config.convertTo && formData.amount && formData.exchangeRate) {
      const converted = Math.floor(formData.amount * formData.exchangeRate);
      if (converted !== formData.lkrAmount) {
         setFormData(prev => ({...prev, lkrAmount: converted}));
      }
    }
  }, [formData.amount, formData.exchangeRate, config.convertTo]);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) return alert('Required fields missing');
    
    onSave({
      id: initialData?.id || `new-exp-${Date.now()}`,
      date: formData.date!,
      description: formData.description!,
      amount: Number(formData.amount),
      company: formData.company,
      code: formData.code,
      name: formData.name,
      exchangeRate: Number(formData.exchangeRate),
      lkrAmount: Number(formData.lkrAmount),
      weight: Number(formData.weight),
      route: formData.route,
      airline: formData.airline,
      visaType: formData.visaType,
      location: formData.location,
      duration: formData.duration,
      foreignCurrency: config.currency
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCancel} />
       <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit' : 'Add'} Expense</h3>
             <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Date</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
                {config.hasCompanyColumn && <div><label className="block text-xs font-bold text-stone-500 mb-1">Company</label><select value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-2.5 border rounded-xl"><option>VG</option><option>SG</option><option>Kenya</option><option>Dad</option></select></div>}
             </div>

             <div><label className="block text-xs font-bold text-stone-500 mb-1">Description</label><input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="What was paid for?" /></div>

             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Amount ({config.currency})</label><input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-bold" /></div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Name/Vendor</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
             </div>

             {config.convertTo && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                   <div className="text-xs font-bold text-stone-400 uppercase mb-2">Currency Conversion</div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs text-stone-500 mb-1">Exchange Rate</label><input type="number" step="0.0001" value={formData.exchangeRate} onChange={e => setFormData({...formData, exchangeRate: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-white" /></div>
                      <div><label className="block text-xs text-stone-500 mb-1">Amount ({config.convertTo})</label><input type="number" value={formData.lkrAmount} disabled className="w-full p-2 border rounded-lg bg-stone-100 text-stone-500" /></div>
                   </div>
                </div>
             )}

             {/* Type Specific Fields */}
             {config.expenseType === 'cut_polish' && (
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Weight (ct)</label><input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl" /></div>
             )}
             
             {config.expenseType === 'tickets_visa' && (
                <div className="space-y-3">
                   <div><label className="block text-xs font-bold text-stone-500 mb-1">Route</label><input type="text" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="CMB-BKK" /></div>
                   <div className="grid grid-cols-2 gap-4">
                      {config.hasAirline && <div><label className="block text-xs font-bold text-stone-500 mb-1">Airline</label><input type="text" value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>}
                      {config.hasVisaType && <div><label className="block text-xs font-bold text-stone-500 mb-1">Visa Type</label><input type="text" value={formData.visaType} onChange={e => setFormData({...formData, visaType: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>}
                   </div>
                </div>
             )}

             {config.expenseType === 'hotel_accommodation' && (
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-xs font-bold text-stone-500 mb-1">Location</label><input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 border rounded-xl" /></div>
                   <div><label className="block text-xs font-bold text-stone-500 mb-1">Duration</label><input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="e.g. 3 Nights" /></div>
                </div>
             )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
             <button onClick={onCancel} className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl">Cancel</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg hover:opacity-90" style={{backgroundColor: config.themeColor}}>Save Expense</button>
          </div>
       </div>
    </div>
  );
};
