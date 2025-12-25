
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, Anchor, FileText, Weight, ArrowRight, Truck, AlertCircle
} from 'lucide-react';
import { ExportConfig } from '../../utils/exportConfig';
import { getExportRecords, ExportRecord } from '../../services/dataService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: ExportConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Summary Card ---
const ExportSummary: React.FC<{ records: ExportRecord[], config: ExportConfig }> = ({ records, config }) => {
  const stats = useMemo(() => {
    let totalMain = 0; // TZS or LKR
    let totalLKR = 0; // Calculated LKR if type A
    let totalWeight = 0;
    
    records.forEach(r => {
      totalMain += r.amount;
      if (config.exportType === 'tanzania_export' && r.lkrAmount) {
        totalLKR += r.lkrAmount;
      }
      if (r.weight) {
        totalWeight += r.weight;
      }
    });

    const avgRate = config.exportType === 'tanzania_export' && totalMain > 0 ? totalLKR / totalMain : config.exchangeRate;

    return { totalMain, totalLKR, totalWeight, avgRate, count: records.length };
  }, [records, config]);

  return (
    <div 
      className="bg-gradient-to-br from-white to-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 border-l-4 relative overflow-hidden" 
      style={{borderLeftColor: config.themeColor}}
    >
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                 {config.exportType === 'tanzania_export' ? 'TANZANIA EXPORT CHARGES' : 'EXPORT FEES'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-500 uppercase">
                 {config.location}
              </span>
           </div>
           
           <h3 className="text-3xl font-bold text-stone-800 mb-1" style={{color: config.themeColor}}>
              {config.currency} {stats.totalMain.toLocaleString()}
           </h3>
           
           {config.exportType === 'tanzania_export' && (
             <div className="text-lg font-medium text-stone-600 flex items-center gap-2 mt-1">
                = LKR {stats.totalLKR.toLocaleString()}
             </div>
           )}
           
           <div className="text-sm font-medium text-stone-500 mt-3 flex gap-4">
              <span>{stats.count} Exports</span>
              {stats.totalWeight > 0 && <span>• {stats.totalWeight}g Total Weight</span>}
           </div>
        </div>

        <div className="flex flex-col items-end justify-center gap-4 text-right">
           {config.exportType === 'tanzania_export' && (
             <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm w-48">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Avg Rate</div>
                <div className="text-xl font-bold text-stone-800">{stats.avgRate?.toFixed(4)}</div>
             </div>
           )}
           
           <div className="flex items-center gap-2 text-stone-400 text-xs">
              <Calendar size={14} />
              <span>Latest: {records[0]?.date || 'N/A'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Form Modal ---
const ExportForm: React.FC<{ 
  initialData: ExportRecord | null,
  config: ExportConfig, 
  onSave: (record: ExportRecord) => void,
  onClose: () => void 
}> = ({ initialData, config, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<ExportRecord>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    weight: 0,
    exchangeRate: config.exchangeRate,
    code: '',
    name: ''
  });

  const [lkrPreview, setLkrPreview] = useState(0);

  useEffect(() => {
    if (config.exportType === 'tanzania_export' && formData.amount && formData.exchangeRate) {
      setLkrPreview(Math.floor(formData.amount * formData.exchangeRate));
    }
  }, [formData.amount, formData.exchangeRate, config.exportType]);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount) {
      alert('Please fill required fields');
      return;
    }
    
    onSave({
      id: initialData?.id || `exp-${Date.now()}`,
      date: formData.date!,
      description: formData.description!,
      amount: Number(formData.amount),
      weight: Number(formData.weight),
      exchangeRate: Number(formData.exchangeRate),
      lkrAmount: config.exportType === 'tanzania_export' ? Math.floor(Number(formData.amount) * Number(formData.exchangeRate)) : undefined,
      code: formData.code,
      name: formData.name
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
       <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit' : 'Add'} Export Fee</h3>
             <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-stone-600"/></button>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
                   <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                </div>
                {config.hasExportCode && (
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Code</label>
                      <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="EXP-..." />
                   </div>
                )}
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="e.g. Arusha Export, Customs" />
             </div>

             {config.hasAuthorityName && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Authority / Name</label>
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount ({config.currency})</label>
                   <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-bold" />
                </div>
                {config.hasWeightTracking && (
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Weight (g)</label>
                      <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl" />
                   </div>
                )}
             </div>

             {config.exportType === 'tanzania_export' && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                   <div className="text-xs font-bold text-stone-400 uppercase mb-2">Currency Conversion</div>
                   <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">Rate (1 {config.currency} = ? LKR)</label>
                         <input type="number" step="0.0001" value={formData.exchangeRate} onChange={e => setFormData({...formData, exchangeRate: Number(e.target.value)})} className="w-full p-2 border rounded-lg bg-white" />
                      </div>
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">LKR Equivalent</label>
                         <input type="text" value={lkrPreview.toLocaleString()} disabled className="w-full p-2 border rounded-lg bg-stone-100 text-stone-600 font-bold" />
                      </div>
                   </div>
                </div>
             )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-colors" style={{backgroundColor: config.themeColor}}>
                Save Record
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Main Template ---
export const ExportRecordsTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [records, setRecords] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExportRecord | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExportRecord | null>(null);

  useEffect(() => {
    if (config) {
      setLoading(true);
      getExportRecords(config).then(data => {
        setRecords(data);
        setLoading(false);
      });
    }
  }, [config]);

  // Safety Check
  if (!config) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center text-stone-400">
        <AlertCircle size={32} className="mb-2 text-red-400" />
        <h3 className="text-lg font-bold text-stone-700">Configuration Error</h3>
        <p>Export configuration not found for this tab.</p>
      </div>
    );
  }

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.code && r.code.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = 
        (!dateRange.start || r.date >= dateRange.start) &&
        (!dateRange.end || r.date <= dateRange.end);
        
      return matchesSearch && matchesDate;
    });
  }, [records, searchQuery, dateRange]);

  // CRUD
  const handleSave = (record: ExportRecord) => {
    if (editingItem) {
      setRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } else {
      setRecords(prev => [record, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this export record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading export records...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 opacity-70" style={{color: config.themeColor}}>
              {config.module} <span className="text-stone-300">/</span> {config.tabName}
           </div>
           <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{config.description || 'Export Records'}</h2>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
             style={{backgroundColor: config.themeColor}}
           >
             <Plus size={18} /> Add Fee
           </button>
        )}
      </div>

      <ExportSummary records={filteredRecords} config={config} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search descriptions..." 
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
            <table className="w-full text-left border-collapse export-table">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-4 w-28">Date</th>
                     {config.hasExportCode && <th className="p-4">Code</th>}
                     <th className="p-4">Description</th>
                     {config.hasAuthorityName && <th className="p-4">Authority</th>}
                     {config.hasWeightTracking && <th className="p-4 text-right">Weight (g)</th>}
                     <th className="p-4 text-right">Amount ({config.currency})</th>
                     {config.exportType === 'tanzania_export' && (
                        <>
                           <th className="p-4 text-right">Rate</th>
                           <th className="p-4 text-right">LKR</th>
                        </>
                     )}
                     {!isReadOnly && <th className="p-4 w-24"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredRecords.map(r => (
                     <tr 
                        key={r.id} 
                        onClick={() => setSelectedItem(r)}
                        className="hover:bg-stone-50 transition-colors cursor-pointer"
                     >
                        <td className="p-4 font-mono text-stone-500 text-xs">{r.date}</td>
                        {config.hasExportCode && <td className="p-4 font-mono text-stone-600 text-xs">{r.code || '-'}</td>}
                        <td className="p-4 font-medium text-stone-800">{r.description}</td>
                        {config.hasAuthorityName && <td className="p-4 text-stone-600">{r.name || '-'}</td>}
                        {config.hasWeightTracking && <td className="p-4 text-right text-stone-600 font-mono">{r.weight ? `${r.weight}g` : '-'}</td>}
                        <td className="p-4 text-right font-bold text-stone-800">{r.amount.toLocaleString()}</td>
                        {config.exportType === 'tanzania_export' && (
                           <>
                              <td className="p-4 text-right text-stone-500 text-xs">{r.exchangeRate?.toFixed(4)}</td>
                              <td className="p-4 text-right font-medium text-stone-600">{r.lkrAmount?.toLocaleString()}</td>
                           </>
                        )}
                        {!isReadOnly && (
                           <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setEditingItem(r); setIsFormOpen(true); }}
                                   className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                                 >
                                    <Edit size={14} />
                                 </button>
                                 <button 
                                   onClick={(e) => handleDelete(r.id, e)}
                                   className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md"
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
         </div>
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.description || 'Export Fee'}
         subtitle={selectedItem?.date}
         status="Recorded"
         statusColor="bg-stone-100 text-stone-600"
         icon={<Truck size={32} style={{color: config.themeColor}} />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Date': selectedItem.date,
            'Description': selectedItem.description,
            ...(selectedItem.code ? {'Code': selectedItem.code} : {}),
            ...(selectedItem.name ? {'Authority': selectedItem.name} : {}),
            'Amount': `${config.currency} ${selectedItem.amount.toLocaleString()}`,
            ...(selectedItem.lkrAmount ? {'LKR Amount': selectedItem.lkrAmount.toLocaleString()} : {}),
            ...(selectedItem.weight ? {'Weight': `${selectedItem.weight} g`} : {}),
            ...(selectedItem.exchangeRate ? {'Exchange Rate': selectedItem.exchangeRate} : {}),
         } : undefined}
      />

      {/* Form Modal */}
      {isFormOpen && (
         <ExportForm 
            initialData={editingItem}
            config={config}
            onSave={handleSave}
            onClose={() => setIsFormOpen(false)}
         />
      )}

    </div>
  );
};
