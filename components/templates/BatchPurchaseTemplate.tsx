
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, 
  Save, X, ChevronDown, Download, Layers, Calendar, RefreshCcw
} from 'lucide-react';
import { DetailModal } from '../DetailModal';
import { BatchPurchaseConfig } from '../../utils/batchPurchaseConfig';
import { getBatchPurchaseData, BatchStone } from '../../services/dataService';

interface Props {
  config: BatchPurchaseConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

const SummaryCard: React.FC<{ stones: BatchStone[], config: BatchPurchaseConfig }> = ({ stones, config }) => {
  const summary = useMemo(() => {
    const breakdown: Record<string, { weight: number, pieces: number }> = {};
    let totalWeight = 0;
    let totalPieces = 0;

    stones.forEach(s => {
      if (!breakdown[s.variety]) {
        breakdown[s.variety] = { weight: 0, pieces: 0 };
      }
      breakdown[s.variety].weight += s.weight;
      breakdown[s.variety].pieces += s.pieces;
      totalWeight += s.weight;
      totalPieces += s.pieces;
    });

    return { breakdown, totalWeight, totalPieces };
  }, [stones]);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm mb-8 relative overflow-hidden border-l-4" style={{borderLeftColor: config.themeColor}}>
      
      <div className="flex flex-col lg:flex-row justify-between gap-8 mb-8">
        <div>
           {config.isMultiBatch ? (
             <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{color: config.themeColor}}>PURCHASE HISTORY</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold uppercase tracking-widest" style={{color: config.themeColor}}>BATCH REF: {config.batchReference}</span>
               {config.batchDate && (
                 <>
                   <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">•</span>
                   <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">{config.batchDate}</span>
                 </>
               )}
             </div>
           )}
           <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{config.batchType}</h3>
           <p className="text-stone-500 mt-2 text-sm max-w-xl">
             {config.isMultiBatch ? "Comprehensive record of all purchasing activities." : "Single batch inventory record."}
           </p>
        </div>
        
        <div className="flex gap-8 shrink-0">
           <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Weight</div>
              <div className="text-2xl font-bold font-mono" style={{color: config.themeColor}}>{summary.totalWeight.toFixed(2)} <span className="text-xs font-sans font-medium text-stone-500">ct</span></div>
           </div>
           <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Pieces</div>
              <div className="text-2xl font-bold text-stone-800 font-mono">{summary.totalPieces}</div>
           </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="w-full overflow-hidden rounded-lg border border-stone-200">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-stone-50">
                    <th className="p-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">Variety</th>
                    <th className="p-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">Weight</th>
                    <th className="p-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">Pieces</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
                {Object.entries(summary.breakdown).map(([variety, stats]: [string, { weight: number, pieces: number }]) => (
                    <tr key={variety} className="bg-white">
                        <td className="p-3 text-sm font-medium text-stone-800">{variety}</td>
                        <td className="p-3 text-sm font-mono text-stone-600">{stats.weight.toFixed(2)} ct</td>
                        <td className="p-3 text-sm font-mono text-stone-600">{stats.pieces}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="bg-stone-50">
                    <td className="p-3 text-xs font-bold uppercase border-t border-stone-200" style={{color: config.themeColor}}>Total</td>
                    <td className="p-3 text-xs font-bold border-t border-stone-200" style={{color: config.themeColor}}>{summary.totalWeight.toFixed(2)} ct</td>
                    <td className="p-3 text-xs font-bold border-t border-stone-200" style={{color: config.themeColor}}>{summary.totalPieces}</td>
                </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
};

export const BatchPurchaseTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [stones, setStones] = useState<BatchStone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVariety, setFilterVariety] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStone, setEditingStone] = useState<BatchStone | null>(null);
  const [selectedStone, setSelectedStone] = useState<BatchStone | null>(null);

  useEffect(() => {
    setLoading(true);
    getBatchPurchaseData(config).then(data => {
      setStones(data);
      setLoading(false);
    });
  }, [config]);

  // Filtering
  const filteredStones = useMemo(() => {
    return stones.filter(s => {
      const matchesSearch = 
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.number.toString().includes(searchQuery);
      
      const matchesVariety = filterVariety === 'All' || s.variety === filterVariety;
      
      return matchesSearch && matchesVariety;
    }).sort((a,b) => a.number - b.number);
  }, [stones, searchQuery, filterVariety]);

  // CRUD
  const handleSave = (stone: BatchStone) => {
    if (editingStone) {
      setStones(prev => prev.map(s => s.id === stone.id ? stone : s));
    } else {
      setStones(prev => [stone, ...prev]);
    }
    setIsFormOpen(false);
    setEditingStone(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this stone?')) {
      setStones(prev => prev.filter(s => s.id !== id));
      if (selectedStone?.id === id) setSelectedStone(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading batch data...</div>;

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm" style={{color: config.themeColor}}>
              <Layers size={20} />
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{config.isMultiBatch ? 'Timeline' : 'Batch View'}</span>
              <span className="text-sm font-semibold text-stone-800">{config.tabName}</span>
           </div>
        </div>
        {!isReadOnly && (
           <button 
             onClick={() => { setEditingStone(null); setIsFormOpen(true); }}
             className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
             style={{backgroundColor: config.themeColor}}
           >
             <Plus size={18} /> Add Entry
           </button>
        )}
      </div>

      <SummaryCard stones={stones} config={config} />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search code or number..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 shadow-sm transition-all"
               style={{caretColor: config.themeColor}} // Just a nice touch, inline style doesn't support focus ring color easily without class
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none min-w-[180px]">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
               <select 
                 value={filterVariety} 
                 onChange={(e) => setFilterVariety(e.target.value)}
                 className="w-full pl-10 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm appearance-none focus:outline-none cursor-pointer shadow-sm transition-all"
               >
                 <option value="All">All Varieties</option>
                 {config.varieties.map(v => <option key={v} value={v}>{v}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={14} />
            </div>
            
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 hover:border-stone-400 transition-colors shadow-sm">
              <Download size={18} />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-stone-50/80 border-b-2 border-stone-200">
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider w-16 text-center">No.</th>
                      {config.isMultiBatch && <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Date</th>}
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Weight</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider pl-8">Variety</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center">Marker</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center">Pcs</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right w-24">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                   {filteredStones.map(stone => (
                      <tr 
                        key={stone.id} 
                        onClick={() => setSelectedStone(stone)}
                        className="hover:bg-stone-50 transition-colors cursor-pointer group"
                      >
                         <td className="px-4 py-3 font-mono text-stone-400 text-sm text-center">{stone.number}</td>
                         {config.isMultiBatch && (
                           <td className="px-4 py-3 text-xs text-stone-500 font-mono">{stone.purchaseDate}</td>
                         )}
                         <td className="px-4 py-3">
                            <span className="font-mono font-medium text-stone-900 text-sm">{stone.code}</span>
                         </td>
                         <td className="px-4 py-3 font-mono font-bold text-stone-700 text-sm text-right">
                           {stone.weight.toFixed(2)}<span className="text-stone-400 text-[10px] font-sans font-normal ml-0.5">ct</span>
                         </td>
                         <td className="px-4 py-3 pl-8">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                              {stone.variety}
                            </span>
                         </td>
                         <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-50 text-stone-500 text-sm font-bold border border-stone-200">
                              {stone.marker}
                            </span>
                         </td>
                         <td className="px-4 py-3 text-center text-stone-600 text-sm font-medium">{stone.pieces}</td>
                         <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               {!isReadOnly && (
                                  <>
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); setEditingStone(stone); setIsFormOpen(true); }}
                                       className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                                     >
                                        <Edit size={14} />
                                     </button>
                                     <button 
                                       onClick={(e) => handleDelete(stone.id, e)}
                                       className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                     >
                                        <Trash2 size={14} />
                                     </button>
                                  </>
                               )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
            </table>
         </div>
      </div>

      <DetailModal 
         isOpen={!!selectedStone}
         onClose={() => setSelectedStone(null)}
         title={selectedStone?.variety || 'Stone'}
         subtitle={`${selectedStone?.weight} ct • ${selectedStone?.code}`}
         status={selectedStone?.status}
         statusColor={selectedStone?.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}
         icon={<div className="text-3xl text-stone-300"><Layers /></div>}
         onEdit={!isReadOnly ? () => { setEditingStone(selectedStone); setIsFormOpen(true); setSelectedStone(null); } : undefined}
         data={selectedStone ? {
            'Number': `#${selectedStone.number}`,
            'Code': selectedStone.code,
            'Marker': selectedStone.marker,
            'Batch': config.batchReference || 'General',
            'Purchase Date': selectedStone.purchaseDate,
            'Pieces': selectedStone.pieces
         } : undefined}
      />

      {isFormOpen && (
         <BatchForm 
            initialData={editingStone}
            config={config}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

const BatchForm: React.FC<{
  initialData: BatchStone | null;
  config: BatchPurchaseConfig;
  onSave: (stone: BatchStone) => void;
  onCancel: () => void;
}> = ({ initialData, config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<BatchStone>>(initialData || {
    number: undefined,
    code: '',
    weight: undefined,
    variety: config.varieties[0],
    marker: config.markers[0] || '•',
    pieces: 1,
    purchaseDate: config.batchDate || new Date().toISOString().split('T')[0],
    status: 'available'
  });

  const handleSubmit = () => {
    if (!formData.number || !formData.code || !formData.weight) {
       alert('Fill all fields');
       return;
    }
    onSave({
      id: initialData?.id || `bp-${Date.now()}`,
      number: Number(formData.number),
      code: formData.code!,
      weight: Number(formData.weight),
      variety: formData.variety!,
      marker: formData.marker!,
      pieces: Number(formData.pieces),
      purchaseDate: formData.purchaseDate!,
      status: formData.status as any,
      photos: []
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCancel} />
       <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit' : 'Add'} Stone</h3>
             <button onClick={onCancel}><X size={20}/></button>
          </div>
          <div className="space-y-4">
             {config.isMultiBatch && (
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Date</label><input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full p-2 border rounded-xl" /></div>
             )}
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">No.</label><input type="number" value={formData.number} onChange={e => setFormData({...formData, number: Number(e.target.value)})} className="w-full p-2 border rounded-xl" autoFocus /></div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Code</label><input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 border rounded-xl" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Weight</label><input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2 border rounded-xl" /></div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Pieces</label><input type="number" value={formData.pieces} onChange={e => setFormData({...formData, pieces: Number(e.target.value)})} className="w-full p-2 border rounded-xl" /></div>
             </div>
             <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Variety</label>
                <select value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} className="w-full p-2 border rounded-xl">
                   {config.varieties.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">Marker</label>
                <div className="flex gap-2">
                   {config.markers.map(m => (
                      <button key={m} onClick={() => setFormData({...formData, marker: m})} className={`flex-1 p-2 border rounded-lg ${formData.marker === m ? 'bg-stone-100 border-stone-400 font-bold' : ''}`}>{m}</button>
                   ))}
                </div>
             </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg">Cancel</button>
             <button onClick={handleSubmit} className="px-4 py-2 text-white font-bold rounded-lg" style={{backgroundColor: config.themeColor}}>Save</button>
          </div>
       </div>
    </div>
  );
};
