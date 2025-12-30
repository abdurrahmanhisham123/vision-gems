
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Wallet, Layers,
  ArrowUpRight, ArrowDownRight, Archive, FileText
} from 'lucide-react';
import { WorkingSheetConfig } from '../../utils/workingSheetConfig';
import { getWorkingSheetData, WorkingItem } from '../../services/workingSheetService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: WorkingSheetConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- SUB-COMPONENTS ---

const CapitalHeader: React.FC<{ sources: WorkingItem[], items: WorkingItem[] }> = ({ sources, items }) => {
  const totalCapital = sources.reduce((sum, s) => sum + (s.amount || 0), 0);
  const currentBalance = items.length > 0 ? (items[0].balance || 0) : 0; // Assuming items are newest first

  return (
    <div className="bg-gradient-to-br from-white to-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 border-l-4 border-l-slate-500">
       <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
             <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Capital Sources</h3>
             <div className="space-y-2">
                {sources.map(s => (
                   <div key={s.id} className="flex justify-between w-64 text-sm">
                      <span className="font-medium text-stone-700">{s.name}</span>
                      <span className="font-mono font-bold text-stone-900">LKR {s.amount?.toLocaleString()}</span>
                   </div>
                ))}
                <div className="h-px bg-stone-300 w-64 my-2"></div>
                <div className="flex justify-between w-64 text-sm font-bold">
                   <span className="text-stone-800">Total Capital</span>
                   <span className="text-emerald-600">LKR {totalCapital.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <div className="flex flex-col items-end justify-center">
             <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Current Balance</div>
             <div className={`text-4xl font-bold font-mono ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentBalance.toLocaleString()} <span className="text-lg text-stone-400 font-sans font-medium">LKR</span>
             </div>
          </div>
       </div>
    </div>
  );
};

const StatementSummary: React.FC<{ items: WorkingItem[] }> = ({ items }) => {
  const stats = useMemo(() => {
    const totalIn = items.reduce((sum, i) => sum + (i.amountIn || 0), 0);
    const totalOut = items.reduce((sum, i) => sum + (i.amountOut || 0), 0);
    const balance = totalIn - totalOut;
    return { totalIn, totalOut, balance };
  }, [items]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
       <div className="flex-1 w-full text-center md:text-left">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total IN</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.totalIn.toLocaleString()}</div>
       </div>
       <div className="h-12 w-px bg-stone-200 hidden md:block"></div>
       <div className="flex-1 w-full text-center md:text-left">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total OUT</div>
          <div className="text-2xl font-bold text-red-600 font-mono">{stats.totalOut.toLocaleString()}</div>
       </div>
       <div className="h-12 w-px bg-stone-200 hidden md:block"></div>
       <div className="flex-1 w-full text-center md:text-left bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Net Balance</div>
          <div className={`text-2xl font-bold font-mono ${stats.balance >= 0 ? 'text-stone-800' : 'text-red-600'}`}>{stats.balance.toLocaleString()}</div>
       </div>
    </div>
  );
};

const InventorySummary: React.FC<{ items: WorkingItem[] }> = ({ items }) => {
  const stats = useMemo(() => {
    const totalCost = items.reduce((sum, i) => sum + (i.cost || 0), 0);
    const cutItems = items.filter(i => i.status === 'C');
    const roughItems = items.filter(i => i.status === 'R' || i.status === 'R/B');
    
    const cutWeight = cutItems.reduce((sum, i) => sum + (i.weight || 0), 0);
    const roughWeight = roughItems.reduce((sum, i) => sum + (i.weight || 0), 0);
    
    return { totalCost, cutWeight, roughWeight, totalCount: items.length };
  }, [items]);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8">
       <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Archive size={16} className="text-slate-500" /> Inventory Backup Summary
       </h3>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
             <div className="text-[10px] text-stone-400 font-bold uppercase">Total Cost</div>
             <div className="text-lg font-bold text-stone-800">LKR {stats.totalCost.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
             <div className="text-[10px] text-blue-400 font-bold uppercase">Cut Weight (C)</div>
             <div className="text-lg font-bold text-blue-700">{stats.cutWeight.toFixed(2)} ct</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
             <div className="text-[10px] text-amber-500 font-bold uppercase">Rough Weight (R)</div>
             <div className="text-lg font-bold text-amber-800">{stats.roughWeight.toFixed(2)} ct</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
             <div className="text-[10px] text-stone-400 font-bold uppercase">Total Stones</div>
             <div className="text-lg font-bold text-stone-800">{stats.totalCount}</div>
          </div>
       </div>
    </div>
  );
};

// --- MAIN TEMPLATE ---

export const WorkingSheetTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [data, setData] = useState<{ items: WorkingItem[], sources?: WorkingItem[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkingItem | null>(null);
  const [editingItem, setEditingItem] = useState<WorkingItem | null>(null);

  useEffect(() => {
    setLoading(true);
    getWorkingSheetData(config).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [config]);

  // Filtering
  const filteredItems = useMemo(() => {
    if (!searchQuery) return data.items;
    const q = searchQuery.toLowerCase();
    return data.items.filter(item => 
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.variety && item.variety.toLowerCase().includes(q))
    );
  }, [data.items, searchQuery]);

  // CRUD
  const handleSave = (item: WorkingItem) => {
    if (editingItem) {
      setData(prev => ({ ...prev, items: prev.items.map(i => i.id === item.id ? item : i) }));
    } else {
      setData(prev => ({ ...prev, items: [item, ...prev.items] }));
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this record?')) {
      setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading working sheet...</div>;

  // Handle Empty Template State
  if (config.isEmpty && data.items.length === 0) {
     return (
        <div className="p-10 max-w-4xl mx-auto flex flex-col items-center text-center">
           <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
              <FileText size={32} />
           </div>
           <h2 className="text-2xl font-bold text-stone-800 mb-2">{config.title}</h2>
           <p className="text-stone-500 mb-8 max-w-md">{config.description}</p>
           {!isReadOnly && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors"
              >
                 Start New Sheet
              </button>
           )}
        </div>
     );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">
              {config.moduleId} <span className="text-stone-300">/</span> {config.sheetType.replace('_', ' ')}
           </div>
           <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{config.title || config.tabName}</h2>
           <p className="text-stone-500 text-sm mt-1">{config.description}</p>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-700 transition-all active:scale-95"
           >
             <Plus size={18} /> Add Entry
           </button>
        )}
      </div>

      {/* Dynamic Summary Cards */}
      {config.sheetType === 'capital_tracking' && <CapitalHeader sources={data.sources || []} items={data.items} />}
      {config.sheetType === 'statement' && <StatementSummary items={data.items} />}
      {config.sheetType === 'inventory_backup' && <InventorySummary items={data.items} />}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 shadow-sm transition-all"
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
              <Download size={18} />
            </button>
            <button className="px-4 py-3 bg-stone-900 text-white rounded-xl shadow-lg hover:bg-stone-800 transition-colors">
              <Printer size={18} />
            </button>
         </div>
      </div>

      {/* Dynamic Table Layouts */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <div className="overflow-x-auto">
            {/* 1. STATEMENT & CAPITAL TABLE */}
            {(config.sheetType === 'statement' || config.sheetType === 'capital_tracking' || config.sheetType === 'transaction_log') && (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                        <th className="p-4 w-28">Date</th>
                        {config.sheetType === 'statement' && <th className="p-4 w-16">Co.</th>}
                        <th className="p-4">Name</th>
                        <th className="p-4">Description</th>
                        {config.hasInOutColumns ? (
                           <>
                              <th className="p-4 text-right text-emerald-600">IN</th>
                              <th className="p-4 text-right text-red-600">OUT</th>
                           </>
                        ) : (
                           <th className="p-4 text-right">Amount</th>
                        )}
                        {config.hasRunningBalance && <th className="p-4 text-right">Balance</th>}
                        {!isReadOnly && <th className="p-4 w-20"></th>}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                     {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                           <td className="p-4 font-mono text-stone-500 text-xs">{item.date}</td>
                           {config.sheetType === 'statement' && <td className="p-4 font-mono text-stone-400 text-xs">{item.company || '-'}</td>}
                           <td className="p-4 font-medium text-stone-700">{item.name}</td>
                           <td className="p-4 text-stone-600">{item.description}</td>
                           
                           {config.hasInOutColumns ? (
                              <>
                                 <td className="p-4 text-right font-medium text-emerald-600">{item.amountIn ? item.amountIn.toLocaleString() : '-'}</td>
                                 <td className="p-4 text-right font-medium text-red-600">{item.amountOut ? item.amountOut.toLocaleString() : '-'}</td>
                              </>
                           ) : (
                              <td className={`p-4 text-right font-bold ${(item.amount || 0) < 0 ? 'text-red-600' : 'text-stone-800'}`}>
                                 {(item.amount || 0).toLocaleString()}
                              </td>
                           )}
                           
                           {config.hasRunningBalance && (
                              <td className="p-4 text-right font-mono font-bold text-stone-700">{item.balance?.toLocaleString()}</td>
                           )}
                           
                           {!isReadOnly && (
                              <td className="p-4 text-right">
                                 <button onClick={(e) => handleDelete(item.id, e)} className="text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                              </td>
                           )}
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {/* 2. INVENTORY BACKUP TABLE */}
            {(config.sheetType === 'inventory_backup') && (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                        <th className="p-4">Code</th>
                        <th className="p-4 text-right">SL Cost</th>
                        <th className="p-4 text-right">Weight</th>
                        <th className="p-4 text-center">Pcs</th>
                        <th className="p-4 text-center">C/R</th>
                        <th className="p-4">Variety</th>
                        <th className="p-4">Color</th>
                        <th className="p-4 text-center">Shape</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                     {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                           <td className="p-4 font-mono font-bold text-stone-700">{item.code}</td>
                           <td className="p-4 text-right font-mono text-stone-600">{item.cost ? item.cost.toLocaleString() : '-'}</td>
                           <td className="p-4 text-right font-mono text-stone-800 font-bold">{item.weight} ct</td>
                           <td className="p-4 text-center text-stone-500">{item.pieces}</td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {item.status}
                              </span>
                           </td>
                           <td className="p-4 text-stone-700">{item.variety}</td>
                           <td className="p-4 text-stone-500">{item.color}</td>
                           <td className="p-4 text-center text-stone-500">{item.shape}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {/* 3. EXPORT LIST TABLE */}
            {(config.sheetType === 'export_list') && (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                        <th className="p-4">Code</th>
                        <th className="p-4">Variety</th>
                        <th className="p-4 text-right">Weight</th>
                        <th className="p-4 text-center">Shape</th>
                        <th className="p-4 text-center">Pcs</th>
                        <th className="p-4 text-right">Selling Price</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                     {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                           <td className="p-4 font-mono font-bold text-stone-700">{item.code}</td>
                           <td className="p-4 text-stone-700">{item.variety}</td>
                           <td className="p-4 text-right font-mono text-stone-800">{item.weight} ct</td>
                           <td className="p-4 text-center text-stone-500">{item.shape}</td>
                           <td className="p-4 text-center text-stone-500">{item.pieces}</td>
                           <td className="p-4 text-right font-bold text-emerald-600">{item.amount ? `$${item.amount}` : '-'}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedItem}
         onClose={() => setSelectedItem(null)}
         title={selectedItem?.name || selectedItem?.code || 'Item'}
         subtitle={selectedItem?.description || selectedItem?.variety}
         status={selectedItem?.status || 'Active'}
         statusColor='bg-stone-100 text-stone-600'
         onEdit={!isReadOnly ? () => { setEditingItem(selectedItem); setIsFormOpen(true); setSelectedItem(null); } : undefined}
         data={selectedItem ? {
            ...(selectedItem.date ? {'Date': selectedItem.date} : {}),
            ...(selectedItem.company ? {'Company': selectedItem.company} : {}),
            ...(selectedItem.amount ? {'Amount': selectedItem.amount.toLocaleString()} : {}),
            ...(selectedItem.balance ? {'Balance': selectedItem.balance.toLocaleString()} : {}),
            ...(selectedItem.weight ? {'Weight': `${selectedItem.weight} ct`} : {}),
            ...(selectedItem.cost ? {'Cost': selectedItem.cost.toLocaleString()} : {}),
         } : undefined}
      />

      {/* Generic Form Modal */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-stone-900">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
                  <button onClick={() => setIsFormOpen(false)}><X size={20} className="text-stone-400"/></button>
               </div>
               
               {/* Simplified Generic Form Fields */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
                     <input type="date" className="w-full p-2.5 border rounded-xl" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name / Title</label>
                     <input type="text" className="w-full p-2.5 border rounded-xl" defaultValue={editingItem?.name} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                     <input type="text" className="w-full p-2.5 border rounded-xl" defaultValue={editingItem?.description} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount</label>
                        <input type="number" className="w-full p-2.5 border rounded-xl" defaultValue={editingItem?.amount} />
                     </div>
                     {config.hasInOutColumns && (
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Type</label>
                           <select className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm border rounded-xl outline-none transition-all appearance-none">
                              <option value="IN">Money IN</option>
                              <option value="OUT">Money OUT</option>
                           </select>
                        </div>
                     )}
                  </div>
               </div>

               <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl">Cancel</button>
                  <button onClick={() => { handleSave({...editingItem, id: editingItem?.id || `new-${Date.now()}`}); }} className="px-6 py-2.5 bg-slate-600 text-white font-bold rounded-xl hover:bg-slate-700">Save</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
