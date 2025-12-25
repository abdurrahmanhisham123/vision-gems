import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Car, ShoppingBag, 
  Scissors, Package, FileText, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { SpecializedRecordConfig } from '../../utils/specializedRecordConfig';
import { getSpecializedData, SpecializedItem } from '../../services/specializedRecordService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: SpecializedRecordConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

const HeaderCard: React.FC<{ items: SpecializedItem[], config: SpecializedRecordConfig }> = ({ items, config }) => {
  const stats = useMemo(() => {
    let totalAmt = 0;
    let totalSecAmt = 0;
    let totalWt = 0;
    let totalPcs = 0;
    items.forEach(i => {
      totalAmt += i.amount || 0;
      if (i.slCost) totalSecAmt += i.slCost;
      totalWt += i.weight || 0;
      totalPcs += i.pieces || (config.recordType === 'bangkok_export' ? 1 : 0);
    });
    return { totalAmt, totalSecAmt, totalWt, totalPcs, count: items.length };
  }, [items, config]);

  const renderContent = () => {
    switch (config.recordType) {
      case 'car_expenses':
        return (
          <div className="flex justify-between items-start mb-4">
             <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Expenses</div>
                <div className="text-3xl font-bold text-purple-600">{config.currency} {stats.totalAmt.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 mb-2"><Car size={14} /> {config.description}</div>
                <div className="text-xs text-stone-400 font-medium">{stats.count} Payments</div>
             </div>
          </div>
        );
      case 'purchasing_record':
        return (
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
             <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Cost</div>
                <div className="text-3xl font-bold text-purple-600">{stats.totalAmt.toLocaleString()}</div>
             </div>
             <div className="flex gap-6 text-sm">
                <div><span className="block text-xs text-stone-400 font-bold uppercase">Weight</span><span className="font-bold text-stone-800">{stats.totalWt.toFixed(2)} ct</span></div>
             </div>
          </div>
        );
      default:
        return (
          <div className="flex justify-between items-center">
             <div><div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Weight</div><div className="text-3xl font-bold text-purple-600">{stats.totalWt.toFixed(2)} ct</div></div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-stone-200 border-l-4 border-l-purple-600 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
       {renderContent()}
    </div>
  );
};

export const SpecializedRecordTemplate: React.FC<Props> = ({ config, isReadOnly, moduleId, tabId }) => {
  const [items, setItems] = useState<SpecializedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SpecializedItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<SpecializedItem | null>(null);

  useEffect(() => {
    setLoading(true);
    getSpecializedData(config).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [config]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(i => (i.code && i.code.toLowerCase().includes(q)) || (i.name && i.name.toLowerCase().includes(q)) || (i.description && i.description.toLowerCase().includes(q)));
  }, [items, searchQuery]);

  if (loading) return <div className="p-10 text-center text-stone-400">Loading records...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{config.tabName}</h2>
           <p className="text-stone-500 text-sm mt-1">{config.description}</p>
        </div>
        {!isReadOnly && (
           <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
             <Plus size={18} /> Add New Entry
           </button>
        )}
      </div>

      {config.showTotal && items.length > 0 && <HeaderCard items={items} config={config} />}

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search records..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0"><Download size={18} /></button>
         </div>
      </div>

      {items.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-stone-200 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-stone-800 mb-2">Ready for Data</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs">{config.description}</p>
            <button onClick={() => setIsFormOpen(true)} className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm">Create Entry</button>
         </div>
      ) : (
         <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-4 pl-6">Identifier</th>
                     <th className="p-4">Description</th>
                     <th className="p-4 text-right">Value/Weight</th>
                     <th className="p-4 text-center">Status</th>
                     {!isReadOnly && <th className="p-4 w-20"></th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-purple-50/10 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                        <td className="p-4 pl-6 font-bold text-stone-700">{item.code || item.date || '-'}</td>
                        <td className="p-4 text-stone-600">{item.description || item.name}</td>
                        <td className="p-4 text-right font-mono font-medium">{item.amount?.toLocaleString() || item.weight?.toFixed(2)}</td>
                        <td className="p-4 text-center">
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-stone-50 text-stone-500 border-stone-200">{item.status || 'Active'}</span>
                        </td>
                        {!isReadOnly && <td className="p-4 text-right pr-6"><ChevronRight size={18} className="text-stone-300 group-hover:text-purple-600 transition-all"/></td>}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}
      {isFormOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">New Entry</h3><button onClick={() => setIsFormOpen(false)}><X size={20}/></button></div>
               <div className="space-y-4">
                  <div><label className="block text-xs font-bold mb-1">Code/Identifier</label><input type="text" className="w-full p-2.5 border rounded-xl" /></div>
                  <div><label className="block text-xs font-bold mb-1">Amount</label><input type="number" className="w-full p-2.5 border rounded-xl" /></div>
               </div>
               <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl">Cancel</button>
                  <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg">Save</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};