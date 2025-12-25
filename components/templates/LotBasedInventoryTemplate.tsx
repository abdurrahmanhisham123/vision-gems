
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Filter, ChevronDown, ChevronUp, Edit, Trash2, 
  Package, Save, X, Eye, FolderPlus, Download, Info
} from 'lucide-react';
import { DetailModal } from '../DetailModal';
import { InventoryConfig, GenericLot, GenericStone } from '../../types';
import { getLotBasedData } from '../../services/dataService';

// --- Shape Component ---
const ShapeIcon: React.FC<{ shape: string, className?: string, color?: string }> = ({ shape, className = "w-full h-full", color = "currentColor" }) => {
  const s = shape.toLowerCase();
  const strokeWidth = 1.5;

  const paths: Record<string, React.ReactNode> = {
    round: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M12 3L12 21 M3 12L21 12 M6 6L18 18 M18 6L6 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    oval: <ellipse cx="12" cy="12" rx="7" ry="10" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    cushion: <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    emerald: <><rect x="5" y="3" width="14" height="18" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M5 6L19 6 M5 18L19 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    pear: <path d="M12 2C12 2 4 14 4 17C4 20.5 8 22 12 22C16 22 20 20.5 20 17C20 14 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    marquise: <path d="M12 2C12 2 4 12 12 22C20 12 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    princess: <><rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M4 4L20 20 M20 4L4 20" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth={strokeWidth} fill="none" transform="scale(0.8) translate(3,3)" />,
    asscher: <><rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M4 8L8 4 M16 4L20 8 M20 16L16 20 M8 20L4 16" stroke={color} strokeWidth={strokeWidth} fill="none" /></>,
    radiant: <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    trillion: <path d="M12 3L21 19H3L12 3Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    baguette: <rect x="6" y="3" width="12" height="18" stroke={color} strokeWidth={strokeWidth} fill="none" />,
  };

  return <svg viewBox="0 0 24 24" className={className}>{paths[s] || paths.round}</svg>;
};

const SHAPES = ['round', 'oval', 'cushion', 'emerald', 'pear', 'marquise', 'princess', 'heart', 'asscher', 'radiant', 'trillion', 'baguette'];

interface Props {
  config: InventoryConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const LotBasedInventoryTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [lots, setLots] = useState<GenericLot[]>([]);
  const [stones, setStones] = useState<GenericStone[]>([]);
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShape, setFilterShape] = useState('all');
  
  const [isAddStoneOpen, setIsAddStoneOpen] = useState(false);
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [editingStone, setEditingStone] = useState<GenericStone | null>(null);
  const [selectedStone, setSelectedStone] = useState<GenericStone | null>(null);

  // Initialize Data
  useEffect(() => {
    setLoading(true);
    getLotBasedData(config).then(data => {
      setLots(data.lots);
      setStones(data.stones);
      setExpandedLots(new Set(data.lots.map(l => l.id))); // Default expand all
      setLoading(false);
    });
  }, [config]);

  // Actions
  const toggleLot = (lotId: string) => {
    const newSet = new Set(expandedLots);
    if (newSet.has(lotId)) newSet.delete(lotId);
    else newSet.add(lotId);
    setExpandedLots(newSet);
  };

  const getLotSummary = (lotId: string) => {
    const lotStones = stones.filter(s => s.lotId === lotId);
    return {
      totalWeight: lotStones.reduce((sum, s) => sum + s.weight, 0),
      count: lotStones.length,
      sold: lotStones.filter(s => s.status === 'sold').length,
      available: lotStones.filter(s => s.status === 'available').length,
    };
  };

  const filteredStones = (lotId: string) => {
    return stones.filter(s => {
      if (s.lotId !== lotId) return false;
      if (searchQuery && !s.code.toLowerCase().includes(searchQuery.toLowerCase()) && !s.variety.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (filterShape !== 'all' && s.shape !== filterShape) return false;
      return true;
    });
  };

  const handleDeleteStone = (id: string) => {
    if (confirm('Delete stone?')) {
      setStones(prev => prev.filter(s => s.id !== id));
      if (selectedStone?.id === id) setSelectedStone(null);
    }
  };

  const handleSaveStone = (stone: GenericStone) => {
    if (editingStone) {
      setStones(prev => prev.map(s => s.id === stone.id ? stone : s));
    } else {
      setStones(prev => [...prev, stone]);
    }
    setIsAddStoneOpen(false);
    setEditingStone(null);
  };

  const handleSaveLot = (lot: GenericLot) => {
    setLots(prev => [lot, ...prev]);
    setIsAddLotOpen(false);
    setExpandedLots(prev => new Set(prev).add(lot.id));
  };

  // Styles based on themeColor
  const bgThemeStyle = {
    backgroundColor: config.themeColor,
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{color: config.themeColor}}>
               {config.module} / {config.gemType}
             </span>
             {config.showOriginFlag && <span className="text-lg">{config.showOriginFlag}</span>}
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{config.tabName}</h2>
          {config.note && <p className="text-stone-500 text-xs mt-1">{config.note}</p>}
        </div>
        {!isReadOnly && (
          <div className="flex gap-3">
             <button 
              onClick={() => setIsAddLotOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-stone-50 transition-all"
              style={{borderColor: `${config.themeColor}30`}} // 30% opacity hex
            >
              <FolderPlus size={18} style={{color: config.themeColor}} /> New Lot
            </button>
            <button 
              onClick={() => { setEditingStone(null); setIsAddStoneOpen(true); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-md transition-all opacity-90 hover:opacity-100"
              style={bgThemeStyle}
            >
              <Plus size={18} /> Add Stone
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
           <input 
             type="text" 
             placeholder="Search code..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
             style={{caretColor: config.themeColor}} // Just a subtle touch
           />
        </div>
        <div className="flex w-full md:w-auto gap-3 overflow-x-auto hide-scrollbar">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-600 outline-none focus:border-opacity-50"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
          <select 
            value={filterShape} 
            onChange={(e) => setFilterShape(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-600 outline-none focus:border-opacity-50"
          >
            <option value="all">All Shapes</option>
            {SHAPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Lots */}
      <div className="space-y-6">
        {loading ? (
           <div className="text-center py-12 text-stone-400">Loading inventory...</div>
        ) : lots.length === 0 ? (
           <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              <p className="text-stone-500 font-medium mb-2">No lots found for {config.tabName}</p>
              {!isReadOnly && <button onClick={() => setIsAddLotOpen(true)} className="text-sm font-bold underline" style={{color: config.themeColor}}>Create First Lot</button>}
           </div>
        ) : (
          lots.map(lot => {
            const summary = getLotSummary(lot.id);
            const isExpanded = expandedLots.has(lot.id);
            const displayStones = filteredStones(lot.id);

            return (
              <div key={lot.id} className="bg-white rounded-2xl border-2 overflow-hidden shadow-card" style={{borderColor: isExpanded ? `${config.themeColor}20` : '#F5F5F4'}}>
                <div 
                  className="p-4 sm:p-6 cursor-pointer hover:bg-stone-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4"
                  onClick={() => toggleLot(lot.id)}
                  style={{background: isExpanded ? `linear-gradient(to right, ${config.themeColor}05, white)` : ''}}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{borderColor: `${config.themeColor}20`, backgroundColor: `${config.themeColor}10`}}>
                      <Package size={24} style={{color: config.themeColor}} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        {lot.name}
                        {isExpanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                      </h3>
                      <div className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="font-medium text-stone-700">{summary.totalWeight.toFixed(2)} ct</span>
                        <span>•</span>
                        <span>{summary.count} stones</span>
                        <span>•</span>
                        <span style={{color: config.themeColor}}>{summary.available} Available</span>
                        {summary.sold > 0 && <span className="text-stone-400">• {summary.sold} Sold</span>}
                        {config.origin && <span>• {config.origin}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                     {!isExpanded && <button className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-stone-100 text-stone-500">View</button>}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-stone-100">
                    {displayStones.length === 0 ? (
                      <div className="p-8 text-center text-stone-400">No stones matching filters in this lot.</div>
                    ) : (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-stone-50 text-stone-500 font-bold text-xs uppercase tracking-wider border-b border-stone-200">
                              <tr>
                                <th className="px-6 py-3 w-16">No.</th>
                                <th className="px-6 py-3">Variety</th>
                                <th className="px-6 py-3">Weight</th>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3 text-center">Shape</th>
                                <th className="px-6 py-3 text-center">Pcs</th>
                                <th className="px-6 py-3 text-right">Price</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 w-24"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {displayStones.sort((a,b) => a.number - b.number).map(stone => (
                                <tr key={stone.id} className="hover:bg-stone-50/50 transition-colors group">
                                  <td className="px-6 py-3 font-mono text-stone-400 text-xs">{stone.number}</td>
                                  <td className="px-6 py-3 font-medium text-stone-900">{stone.variety}</td>
                                  <td className="px-6 py-3 text-stone-700">{stone.weight} <span className="text-stone-400 text-xs">ct</span></td>
                                  <td className="px-6 py-3 font-mono text-stone-500 text-xs bg-stone-50 rounded px-2 py-1 w-fit">{stone.code}</td>
                                  <td className="px-6 py-3 text-center">
                                    <div className="w-6 h-6 mx-auto opacity-70">
                                      <ShapeIcon shape={stone.shape} color={config.themeColor} />
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 text-center text-stone-600">{stone.pieces}</td>
                                  <td className="px-6 py-3 text-right font-medium">{stone.sellingPrice ? `$${stone.sellingPrice}` : '-'}</td>
                                  <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stone.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                                      {stone.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setSelectedStone(stone)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"><Eye size={16} /></button>
                                      {!isReadOnly && (
                                        <>
                                          <button onClick={() => { setEditingStone(stone); setIsAddStoneOpen(true); }} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"><Edit size={16} /></button>
                                          <button onClick={() => handleDeleteStone(stone.id)} className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Mobile List */}
                        <div className="md:hidden grid grid-cols-1 gap-3 p-4">
                           {displayStones.map(stone => (
                             <div key={stone.id} onClick={() => setSelectedStone(stone)} className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex gap-4">
                                <div className="flex flex-col items-center justify-center gap-1 min-w-[3rem] border-r border-stone-200 pr-3">
                                   <div className="w-8 h-8" style={{color: config.themeColor}}><ShapeIcon shape={stone.shape} /></div>
                                   <span className="text-[10px] font-mono text-stone-400">#{stone.number}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-bold text-stone-900 text-sm truncate">{stone.variety}</h4>
                                      <span className="text-[10px] font-bold text-stone-500 uppercase">{stone.status}</span>
                                   </div>
                                   <div className="flex justify-between items-end">
                                      <div className="text-xs text-stone-500">
                                         <span className="font-semibold text-stone-700">{stone.weight} ct</span> • {stone.code}
                                      </div>
                                      {stone.sellingPrice && <div className="text-sm font-bold text-stone-800">${stone.sellingPrice}</div>}
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal 
        isOpen={!!selectedStone}
        onClose={() => setSelectedStone(null)}
        title={selectedStone?.variety || ''}
        subtitle={`${selectedStone?.weight} ct • ${selectedStone?.code}`}
        status={selectedStone?.status}
        statusColor={selectedStone?.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}
        icon={<div className="w-12 h-12" style={{color: config.themeColor}}><ShapeIcon shape={selectedStone?.shape || 'round'} /></div>}
        onEdit={!isReadOnly ? () => { setEditingStone(selectedStone); setIsAddStoneOpen(true); setSelectedStone(null); } : undefined}
        data={selectedStone ? {
           'Stone Number': `#${selectedStone.number}`,
           'Lot': lots.find(l => l.id === selectedStone.lotId)?.name,
           'Pieces': selectedStone.pieces,
           'Selling Price': selectedStone.sellingPrice ? `$${selectedStone.sellingPrice}` : undefined,
           'Buyer': selectedStone.buyerName,
           'Created': selectedStone.createdAt.split('T')[0]
        } : undefined}
      />

      {/* Forms */}
      {isAddLotOpen && <LotFormModal config={config} isOpen={isAddLotOpen} onClose={() => setIsAddLotOpen(false)} onSave={handleSaveLot} />}
      {isAddStoneOpen && <StoneFormModal config={config} isOpen={isAddStoneOpen} onClose={() => setIsAddStoneOpen(false)} onSave={handleSaveStone} initialData={editingStone} lots={lots} nextNumber={(lotId) => {
         const lotStones = stones.filter(s => s.lotId === lotId);
         return (Math.max(0, ...lotStones.map(s => s.number)) || 0) + 1;
      }} />}

    </div>
  );
};

// --- Sub-Components ---

const LotFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (l: GenericLot) => void, config: InventoryConfig }> = ({ isOpen, onClose, onSave, config }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const handleSubmit = () => {
    if (!name) return alert('Name required');
    onSave({ id: `lot-${Date.now()}`, name, purchaseDate: date, createdAt: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
       <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Create New Lot</h3>
          <div className="space-y-4">
             <div><label className="block text-xs font-bold mb-1">Lot Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-xl" autoFocus /></div>
             <div><label className="block text-xs font-bold mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-xl" /></div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg">Cancel</button>
             <button onClick={handleSubmit} className="px-4 py-2 text-white font-bold rounded-lg" style={{backgroundColor: config.themeColor}}>Create</button>
          </div>
       </div>
    </div>
  );
};

const StoneFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (s: GenericStone) => void, initialData: GenericStone | null, lots: GenericLot[], nextNumber: (id: string) => number, config: InventoryConfig }> = ({ isOpen, onClose, onSave, initialData, lots, nextNumber, config }) => {
  const [formData, setFormData] = useState<Partial<GenericStone>>(initialData || {
    lotId: lots[0]?.id || '',
    variety: config.varieties[0],
    shape: 'round',
    pieces: config.piecesFixed ? config.piecesRange.min : 1,
    status: 'available',
    weight: 0,
  });

  const calculatedNumber = initialData ? initialData.number : (formData.lotId ? nextNumber(formData.lotId) : 1);

  const handleSubmit = () => {
    if (!formData.lotId || !formData.weight || !formData.code) return alert('Fill required fields');
    if (!config.codeFormat.test(formData.code)) return alert('Invalid Code Format');
    
    onSave({
      id: initialData?.id || `st-${Date.now()}`,
      lotId: formData.lotId,
      number: calculatedNumber,
      variety: formData.variety!,
      weight: Number(formData.weight),
      code: formData.code,
      shape: formData.shape || 'round',
      pieces: Number(formData.pieces),
      status: formData.status as any,
      sellingPrice: formData.sellingPrice,
      buyerName: formData.buyerName,
      photos: formData.photos || [],
      createdAt: initialData?.createdAt || new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
       <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between mb-6"><h3 className="text-xl font-bold">{initialData ? 'Edit' : 'Add'} Stone</h3><button onClick={onClose}><X size={20}/></button></div>
          <div className="space-y-4">
             <div><label className="block text-xs font-bold mb-1">Lot</label><select value={formData.lotId} onChange={e => setFormData({...formData, lotId: e.target.value})} className="w-full p-2 border rounded-xl" disabled={!!initialData}>{lots.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-xs font-bold mb-1">Number</label><input value={`#${calculatedNumber}`} disabled className="w-full p-2 bg-stone-100 border rounded-xl" /></div>
               <div>
                 <label className="block text-xs font-bold mb-1">Variety</label>
                 {config.varietyFixed ? (
                   <input value={config.varieties[0]} disabled className="w-full p-2 bg-stone-100 border rounded-xl" />
                 ) : (
                   <select value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} className="w-full p-2 border rounded-xl">{config.varieties.map(v => <option key={v} value={v}>{v}</option>)}</select>
                 )}
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-xs font-bold mb-1">Weight</label><input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full p-2 border rounded-xl" /></div>
               <div><label className="block text-xs font-bold mb-1">Code</label><input type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 border rounded-xl" placeholder="Format matched" /></div>
             </div>
             <div>
               <label className="block text-xs font-bold mb-1">Shape</label>
               <div className="grid grid-cols-6 gap-2">
                 {SHAPES.map(s => <button key={s} onClick={() => setFormData({...formData, shape: s})} className={`p-1 border rounded hover:bg-stone-50 ${formData.shape === s ? 'ring-2 ring-offset-1' : ''}`}><ShapeIcon shape={s} color={formData.shape === s ? config.themeColor : '#ccc'} /></button>)}
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold mb-1">Pieces</label><input type="number" value={formData.pieces} onChange={e => setFormData({...formData, pieces: Number(e.target.value)})} disabled={config.piecesFixed} className="w-full p-2 border rounded-xl" /></div>
                <div><label className="block text-xs font-bold mb-1">Price (USD)</label><input type="number" value={formData.sellingPrice || ''} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full p-2 border rounded-xl" /></div>
             </div>
             <div><label className="block text-xs font-bold mb-1">Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border rounded-xl"><option value="available">Available</option><option value="sold">Sold</option></select></div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg">Cancel</button>
             <button onClick={handleSubmit} className="px-4 py-2 text-white font-bold rounded-lg" style={{backgroundColor: config.themeColor}}>Save</button>
          </div>
       </div>
    </div>
  );
};
