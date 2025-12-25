import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, 
  Save, X, ChevronDown, Download, Layers, Tag, Gem, ChevronRight
} from 'lucide-react';
import { DetailModal } from '../DetailModal';
import { MixedInventoryConfig } from '../../utils/mixedInventoryConfig';
import { getMixedInventoryData, MixedStone } from '../../services/dataService';

interface Props {
  config: MixedInventoryConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const MixedInventoryTemplate: React.FC<Props> = ({ config, isReadOnly, moduleId, tabId }) => {
  const [stones, setStones] = useState<MixedStone[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVariety, setFilterVariety] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStone, setEditingStone] = useState<MixedStone | null>(null);
  const [selectedStone, setSelectedStone] = useState<MixedStone | null>(null);

  useEffect(() => {
    setLoading(true);
    getMixedInventoryData(config).then(data => {
      setStones(data);
      setLoading(false);
    });
  }, [config]);

  const filteredStones = useMemo(() => {
    return stones.filter(s => {
      const matchesSearch = s.code.toLowerCase().includes(searchQuery.toLowerCase()) || (s.variety && s.variety.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVariety = filterVariety === 'All' || s.variety === filterVariety;
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesVariety && matchesStatus;
    });
  }, [stones, searchQuery, filterVariety, filterStatus]);

  const handleSave = (stone: MixedStone) => {
    if (editingStone) setStones(prev => prev.map(s => s.id === stone.id ? stone : s));
    else setStones(prev => [stone, ...prev]);
    setIsFormOpen(false);
    setEditingStone(null);
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading inventory...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{config.inventoryType}</h2>
           <p className="text-stone-500 text-sm mt-1">{filteredStones.length} items found</p>
        </div>
        {!isReadOnly && (
           <button onClick={() => { setEditingStone(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
             <Plus size={18} /> Add New Item
           </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code or variety..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0"><Download size={18} /></button>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Code</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Weight</th>
                  <th className="p-4 text-center">Shape</th>
                  <th className="p-4 text-center">Status</th>
                  {!isReadOnly && <th className="p-4 w-20"></th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredStones.map(stone => (
                  <tr key={stone.id} onClick={() => setSelectedStone(stone)} className="hover:bg-purple-50/10 transition-colors cursor-pointer group">
                     <td className="p-4 pl-6 font-mono font-bold text-stone-700">{stone.code}</td>
                     <td className="p-4 font-bold text-stone-800">{stone.variety}</td>
                     <td className="p-4 text-right font-mono text-stone-600">{stone.weight.toFixed(2)}ct</td>
                     <td className="p-4 text-center text-stone-500">{stone.shape}</td>
                     <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stone.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                           {stone.status}
                        </span>
                     </td>
                     {!isReadOnly && <td className="p-4 text-right pr-6"><ChevronRight size={18} className="text-stone-300 group-hover:text-purple-600 transition-all"/></td>}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isFormOpen && (
         <MixedStoneForm initialData={editingStone} config={config} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      )}
    </div>
  );
};

const MixedStoneForm: React.FC<{
  initialData: MixedStone | null;
  config: MixedInventoryConfig;
  onSave: (stone: MixedStone) => void;
  onCancel: () => void;
}> = ({ initialData, config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MixedStone>>(initialData || { code: '', weight: 0, variety: config.varieties[0], shape: 'Round', pieces: 1, status: config.defaultStatus as any || 'available' });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Stone' : 'Add New Item'}</h3>
             <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
          </div>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Code</label><input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2.5 bg-white border border-stone-200 rounded-xl" /></div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Variety</label><select value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} className="w-full p-2.5 bg-white border border-stone-200 rounded-xl">{config.varieties.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Weight (ct)</label><input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2.5 bg-white border border-stone-200 rounded-xl" /></div>
                <div><label className="block text-xs font-bold text-stone-500 mb-1">Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2.5 bg-white border border-stone-200 rounded-xl"><option value="available">Available</option><option value="sold">Sold</option><option value="approval">Approval</option></select></div>
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-stone-100">
             <button onClick={onCancel} className="px-6 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl">Cancel</button>
             <button onClick={() => onSave(formData as MixedStone)} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg">Save Item</button>
          </div>
       </div>
    </div>
  );
};