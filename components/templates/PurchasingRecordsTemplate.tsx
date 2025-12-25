
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Wallet, Users, 
  ShoppingBag, CheckCircle, AlertCircle, Clock, ChevronDown
} from 'lucide-react';
import { PurchasingConfig } from '../../utils/purchasingConfig';
import { getPurchasingData, PurchaseRecord } from '../../services/dataService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: PurchasingConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Components ---

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Paid') return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center w-fit"><CheckCircle size={10} className="mr-1"/> Paid</span>;
  if (status === 'Owed') return <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center w-fit"><AlertCircle size={10} className="mr-1"/> Owed</span>;
  return <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center w-fit"><Clock size={10} className="mr-1"/> Partial</span>;
};

const SummaryCard: React.FC<{ records: PurchaseRecord[], config: PurchasingConfig }> = ({ records, config }) => {
  const stats = useMemo(() => {
    let totalCost = 0;
    let totalStones = 0;
    let totalWeight = 0;
    const suppliers = new Set();

    records.forEach(r => {
      totalCost += r.cost;
      totalStones += r.pieces;
      totalWeight += r.weight;
      suppliers.add(r.supplier);
    });

    const dates = records.map(r => new Date(r.date));
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return { 
      totalCost, totalStones, totalWeight, 
      uniqueSuppliers: suppliers.size, 
      minDate: minDate ? minDate.toLocaleDateString() : 'N/A',
      maxDate: maxDate ? maxDate.toLocaleDateString() : 'N/A'
    };
  }, [records]);

  return (
    <div 
      className="bg-gradient-to-br from-white to-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 border-l-4 relative overflow-hidden" 
      style={{borderLeftColor: config.themeColor}}
    >
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        <div>
           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <ShoppingBag size={14} style={{color: config.themeColor}} /> Purchasing Summary
           </h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex justify-between w-48">
                 <span className="text-sm text-stone-500 font-medium">Total Purchased:</span>
                 <span className="text-sm font-bold text-stone-800" style={{color: config.themeColor}}>
                    {config.currency} {stats.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                 </span>
              </div>
              <div className="flex justify-between w-48">
                 <span className="text-sm text-stone-500 font-medium">Total Stones:</span>
                 <span className="text-sm font-bold text-stone-800">{stats.totalStones} pieces</span>
              </div>
              <div className="flex justify-between w-48">
                 <span className="text-sm text-stone-500 font-medium">Total Weight:</span>
                 <span className="text-sm font-bold text-stone-800">{stats.totalWeight.toFixed(2)} ct</span>
              </div>
           </div>
        </div>

        <div className="lg:text-right flex flex-col justify-end gap-1">
           <div className="text-sm font-medium text-stone-600">
              <span className="font-bold text-stone-800">{stats.uniqueSuppliers}</span> Unique Suppliers
           </div>
           <div className="text-sm font-medium text-stone-600">
              Primary: <span className="font-bold text-stone-800">{config.primaryVariety}</span>
           </div>
           <div className="text-xs text-stone-400 mt-2">
              {stats.minDate} - {stats.maxDate}
           </div>
        </div>
      </div>
    </div>
  );
};

const SupplierBreakdown: React.FC<{ records: PurchaseRecord[], config: PurchasingConfig }> = ({ records, config }) => {
  const breakdown = useMemo(() => {
    const map = new Map<string, {purchases: number, stones: number, weight: number, cost: number}>();
    
    records.forEach(r => {
      const current = map.get(r.supplier) || { purchases: 0, stones: 0, weight: 0, cost: 0 };
      current.purchases += 1;
      current.stones += r.pieces;
      current.weight += r.weight;
      current.cost += r.cost;
      map.set(r.supplier, current);
    });
    
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a,b) => b.cost - a.cost);
  }, [records]);

  if (!config.groupBySupplier || breakdown.length <= 1) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
       <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
             <Users size={16} /> Supplier Breakdown
          </h3>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead>
                <tr className="border-b border-stone-100 text-stone-500 text-xs font-bold uppercase">
                   <th className="p-4">Supplier</th>
                   <th className="p-4 text-center">Purchases</th>
                   <th className="p-4 text-center">Stones</th>
                   <th className="p-4 text-right">Weight</th>
                   <th className="p-4 text-right">Cost ({config.currency})</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-stone-50">
                {breakdown.map((s, i) => (
                   <tr key={i} className="hover:bg-stone-50 transition-colors">
                      <td className="p-4 font-medium text-stone-800">{s.name}</td>
                      <td className="p-4 text-center text-stone-600">{s.purchases}</td>
                      <td className="p-4 text-center text-stone-600">{s.stones}</td>
                      <td className="p-4 text-right font-mono text-stone-600">{s.weight.toFixed(2)}ct</td>
                      <td className="p-4 text-right font-bold text-stone-800">{s.cost.toLocaleString()}</td>
                   </tr>
                ))}
                <tr className="bg-stone-50 font-bold text-stone-800 border-t border-stone-200">
                   <td className="p-4 uppercase text-xs">Total</td>
                   <td className="p-4 text-center">{breakdown.reduce((a,b) => a+b.purchases, 0)}</td>
                   <td className="p-4 text-center">{breakdown.reduce((a,b) => a+b.stones, 0)}</td>
                   <td className="p-4 text-right">{breakdown.reduce((a,b) => a+b.weight, 0).toFixed(2)}ct</td>
                   <td className="p-4 text-right" style={{color: config.themeColor}}>{breakdown.reduce((a,b) => a+b.cost, 0).toLocaleString()}</td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
  );
};

export const PurchasingRecordsTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterVariety, setFilterVariety] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseRecord | null>(null);
  const [selectedItem, setSelectedItem] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    getPurchasingData(config).then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, [config]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.variety.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSupplier = filterSupplier === 'All' || r.supplier === filterSupplier;
      const matchesVariety = filterVariety === 'All' || r.variety === filterVariety;
      
      return matchesSearch && matchesSupplier && matchesVariety;
    });
  }, [records, searchQuery, filterSupplier, filterVariety]);

  const uniqueSuppliers = useMemo(() => Array.from(new Set(records.map(r => r.supplier))).sort(), [records]);
  const uniqueVarieties = useMemo(() => Array.from(new Set(records.map(r => r.variety))).sort(), [records]);

  // CRUD
  const handleSave = (item: PurchaseRecord) => {
    if (editingItem) {
      setRecords(prev => prev.map(r => r.id === item.id ? item : r));
    } else {
      setRecords(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this purchase record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading purchasing records...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 opacity-70" style={{color: config.themeColor}}>
              {config.module} <span className="text-stone-300">/</span> {config.location}
           </div>
           <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{config.tabName}</h2>
           <p className="text-stone-500 text-sm mt-1">Track all stone acquisitions from suppliers</p>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
             style={{backgroundColor: config.themeColor}}
           >
             <Plus size={18} /> Add Purchase
           </button>
        )}
      </div>

      {config.showTotal && <SummaryCard records={filteredRecords} config={config} />}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search purchases..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 shadow-sm transition-all"
               style={{caretColor: config.themeColor}}
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {config.groupBySupplier && (
               <div className="relative min-w-[160px]">
                  <select 
                    value={filterSupplier} 
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    className="w-full pl-4 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm appearance-none focus:outline-none cursor-pointer shadow-sm"
                  >
                     <option value="All">All Suppliers</option>
                     {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} />
               </div>
            )}
            <div className="relative min-w-[160px]">
               <select 
                 value={filterVariety} 
                 onChange={(e) => setFilterVariety(e.target.value)}
                 className="w-full pl-4 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm appearance-none focus:outline-none cursor-pointer shadow-sm"
               >
                  <option value="All">All Varieties</option>
                  {uniqueVarieties.map(v => <option key={v} value={v}>{v}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} />
            </div>
            
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
              <Download size={18} />
            </button>
            <button className="px-4 py-3 bg-stone-900 text-white rounded-xl shadow-lg hover:bg-stone-800 transition-colors">
              <Printer size={18} />
            </button>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-4 w-24">Date</th>
                     <th className="p-4">Code</th>
                     <th className="p-4">Variety</th>
                     <th className="p-4">Supplier</th>
                     <th className="p-4 text-right">Weight</th>
                     <th className="p-4 text-right">Pieces</th>
                     <th className="p-4 text-right">Cost ({config.currency})</th>
                     {(config.hasPaymentStatus || config.hasColorGrade) && <th className="p-4">Info</th>}
                     {!isReadOnly && <th className="p-4 w-20"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredRecords.map(r => (
                     <tr 
                        key={r.id} 
                        onClick={() => setSelectedItem(r)}
                        className="hover:bg-stone-50 transition-colors cursor-pointer"
                     >
                        <td className="p-4 font-mono text-stone-500 text-xs whitespace-nowrap">{r.date}</td>
                        <td className="p-4 font-mono text-stone-600 font-bold text-xs">{r.code}</td>
                        <td className="p-4">
                           <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border" style={{borderColor: `${config.themeColor}40`, backgroundColor: `${config.themeColor}10`, color: config.themeColor}}>
                              {r.variety}
                           </span>
                        </td>
                        <td className="p-4 font-medium text-stone-700">{r.supplier}</td>
                        <td className="p-4 text-right font-mono text-stone-600">{r.weight.toFixed(2)}ct</td>
                        <td className="p-4 text-right font-mono text-stone-600">{r.pieces}</td>
                        <td className="p-4 text-right font-bold text-stone-800">{r.cost.toLocaleString()}</td>
                        {(config.hasPaymentStatus || config.hasColorGrade) && (
                           <td className="p-4">
                              {config.hasPaymentStatus && r.paymentStatus && <StatusBadge status={r.paymentStatus} />}
                              {config.hasColorGrade && r.color && <span className="text-xs text-stone-500 italic">{r.color}</span>}
                           </td>
                        )}
                        {!isReadOnly && (
                           <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => { setEditingItem(r); setIsFormOpen(true); }}
                                   className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                                 >
                                    <Edit size={14} />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(r.id)}
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

      {/* Supplier Analysis Table */}
      <SupplierBreakdown records={filteredRecords} config={config} />

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.variety || 'Stone'}
         subtitle={`${selectedItem?.code} • ${selectedItem?.supplier}`}
         status={selectedItem?.paymentStatus}
         statusColor={selectedItem?.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}
         icon={<ShoppingBag size={32} style={{color: config.themeColor}} />}
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            'Date': selectedItem.date,
            'Code': selectedItem.code,
            'Variety': selectedItem.variety,
            'Supplier': selectedItem.supplier,
            'Weight': `${selectedItem.weight} ct`,
            'Pieces': selectedItem.pieces,
            'Cost': `${config.currency} ${selectedItem.cost.toLocaleString()}`,
            ...(selectedItem.color ? { 'Color': selectedItem.color } : {}),
            ...(selectedItem.notes ? { 'Notes': selectedItem.notes } : {}),
         } : undefined}
      />

      {/* Form Modal */}
      {isFormOpen && (
         <PurchaseForm 
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

const PurchaseForm: React.FC<{
  initialData: PurchaseRecord | null;
  config: PurchasingConfig;
  onSave: (item: PurchaseRecord) => void;
  onCancel: () => void;
}> = ({ initialData, config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PurchaseRecord>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    variety: config.primaryVariety,
    supplier: config.primarySupplier || '',
    weight: 0,
    pieces: 1,
    cost: 0,
    code: '',
    paymentStatus: config.hasPaymentStatus ? 'Owed' : undefined,
    color: ''
  });

  // Generate Code on variety change if new
  useEffect(() => {
    if (!initialData && !formData.code) {
       // Simple random suffix for demo
       setFormData(prev => ({ ...prev, code: `${config.codePrefix}-${Math.floor(Math.random() * 1000)}` }));
    }
  }, [config.codePrefix, initialData]);

  const handleSubmit = () => {
    if (!formData.supplier || !formData.weight || !formData.cost || !formData.code) {
       alert('Please fill required fields');
       return;
    }
    
    onSave({
      id: initialData?.id || `pur-${Date.now()}`,
      date: formData.date!,
      code: formData.code!,
      variety: formData.variety!,
      supplier: formData.supplier!,
      weight: Number(formData.weight),
      pieces: Number(formData.pieces),
      cost: Number(formData.cost),
      paymentStatus: formData.paymentStatus,
      color: formData.color,
      notes: formData.notes
    });
  };

  const suppliers = ['Joonathan', 'Cassim', 'Payas', 'Junior', 'Pepper Maluki', 'Azeem', 'Mashaka'];
  const varieties = [config.primaryVariety, 'Blue Sapphire', 'Ruby', 'Spinel', 'Moonstone', 'Garnet'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
       <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit' : 'Add'} Purchase Record</h3>
             <button onClick={onCancel}><X size={20} className="text-stone-400"/></button>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
                   <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Code</label>
                   <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2.5 border rounded-xl font-mono" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Variety</label>
                   <input type="text" list="varieties" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                   <datalist id="varieties">{varieties.map(v => <option key={v} value={v} />)}</datalist>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Supplier</label>
                   <input type="text" list="suppliers" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full p-2.5 border rounded-xl" />
                   <datalist id="suppliers">{suppliers.map(s => <option key={s} value={s} />)}</datalist>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Weight (ct)</label>
                   <input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Pieces</label>
                   <input type="number" value={formData.pieces} onChange={e => setFormData({...formData, pieces: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Cost ({config.currency})</label>
                   <input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full p-2.5 border rounded-xl font-bold" />
                </div>
             </div>

             {config.hasColorGrade && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Color Grade</label>
                   <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full p-2.5 border rounded-xl" placeholder="e.g. Blue Sheen" />
                </div>
             )}

             {config.hasPaymentStatus && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Payment Status</label>
                   <div className="flex gap-4">
                      {['Paid', 'Owed', 'Partial'].map(s => (
                         <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="status" 
                              checked={formData.paymentStatus === s} 
                              onChange={() => setFormData({...formData, paymentStatus: s as any})}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-stone-700">{s}</span>
                         </label>
                      ))}
                   </div>
                </div>
             )}

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Notes</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2.5 border rounded-xl h-20 resize-none" placeholder="Optional notes..." />
             </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
             <button onClick={onCancel} className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl">Cancel</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg hover:opacity-90" style={{backgroundColor: config.themeColor}}>Save Record</button>
          </div>
       </div>
    </div>
  );
};
