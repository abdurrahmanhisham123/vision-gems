
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, ChevronDown, ChevronUp, Edit, Trash2, 
  Package, Save, X, Eye, FolderPlus, Scale, Gem, Tag, Info, Calendar, ChevronRight
} from 'lucide-react';

// --- Types ---

interface MixLot {
  id: string;
  name: string;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MixStone {
  id: string;
  lotId: string;
  number: number;
  variety: string;
  weight: number;
  code: string;
  shape: string;
  pieces: number;
  sellingPrice?: number;
  status: 'available' | 'sold' | 'reserved';
  buyerName?: string;
  photos: string[];
  createdAt: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

const ShapeIcon: React.FC<{ shape: string, className?: string }> = ({ shape, className = "w-full h-full" }) => {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

// --- Side Detail Panel ---

const StoneDetailPanel: React.FC<{
  stone: MixStone;
  onClose: () => void;
  isReadOnly?: boolean;
  lotName?: string;
}> = ({ stone, onClose, isReadOnly, lotName }) => {
  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                stone.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {stone.status}
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">STONE #{stone.number}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{stone.code}</h2>
            <p className="text-sm text-stone-500 mt-1">{stone.variety} • {stone.shape}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} /> Physical Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Weight</div>
                <div className="text-lg font-bold text-stone-800 font-mono">{stone.weight.toFixed(2)} ct</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Pieces</div>
                <div className="text-lg font-bold text-stone-800">{stone.pieces}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Package size={14} /> Lot Information
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Origin Lot</span>
                  <span className="text-sm font-bold text-stone-800">{lotName || 'N/A'}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Price (Est)</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">{stone.sellingPrice ? `$${stone.sellingPrice.toLocaleString()}` : '-'}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 z-10">
           {!isReadOnly && (
             <button className="px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                <Edit size={16} /> Edit Record
             </button>
           )}
        </div>
      </div>
    </>
  );
};

// --- MAIN TEMPLATE ---

export const MixSemiBKKTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const [lots, setLots] = useState<MixLot[]>([
    { id: 'lot-1', name: 'Mix Semi Lot 1', purchaseDate: '2025-11-20', notes: 'Garnet, Zircon, etc.', createdAt: '2025-11-20', updatedAt: '2025-11-20' }
  ]);
  const [stones, setStones] = useState<MixStone[]>(() => {
    return Array.from({length: 30}).map((_, i) => ({
      id: `mix-${i+1}`,
      lotId: 'lot-1',
      number: i+1,
      variety: ['Garnet', 'Zircon', 'Tourmaline', 'Chrysoberyl'][i % 4],
      weight: Number((1.5 + Math.random() * 3).toFixed(2)),
      code: `VG-MX${100+i}`,
      shape: ['Oval', 'Cushion', 'Round'][Math.floor(Math.random() * 3)],
      pieces: 1,
      status: 'available',
      photos: [],
      createdAt: new Date().toISOString()
    }));
  });
  const [expandedLots, setExpandedLots] = useState<Set<string>>(new Set(['lot-1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShape, setFilterShape] = useState('all');
  const [selectedStone, setSelectedStone] = useState<MixStone | null>(null);

  const toggleLot = (id: string) => {
    const newSet = new Set(expandedLots);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
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

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto pb-44 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Mixed Semi Bangkok</h2>
          <p className="text-stone-500 text-sm mt-1">Garnet, Zircon, Tourmaline organized by lots</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-all shadow-sm">
               <FolderPlus size={18} /> New Lot
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-all shadow-md">
               <Plus size={18} /> Add Stone
             </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
        <div className="relative w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
           <input 
             type="text" 
             placeholder="Search code, variety..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
           />
        </div>
      </div>

      <div className="space-y-6">
        {lots.map(lot => {
          const summary = getLotSummary(lot.id);
          const isExpanded = expandedLots.has(lot.id);
          const lotStones = stones.filter(s => s.lotId === lot.id && (s.code.toLowerCase().includes(searchQuery.toLowerCase()) || s.variety.toLowerCase().includes(searchQuery.toLowerCase())));

          return (
            <div key={lot.id} className="bg-white rounded-3xl border-2 border-stone-100 overflow-hidden shadow-card">
              <div className="bg-cyan-50/30 p-6 cursor-pointer hover:bg-cyan-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4" onClick={() => toggleLot(lot.id)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-200"><Package size={24} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">{lot.name} {isExpanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}</h3>
                    <div className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="font-medium text-stone-700">{summary.totalWeight.toFixed(2)} ct</span>
                      <span>•</span>
                      <span>{summary.count} stones</span>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-stone-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-stone-500 font-bold text-[10px] uppercase tracking-wider border-b border-stone-200">
                        <tr>
                          <th className="p-5 pl-10 w-16">No.</th>
                          <th className="p-5">Variety</th>
                          <th className="p-5">Code</th>
                          <th className="p-5 text-right">Weight</th>
                          <th className="p-5 text-center">Status</th>
                          <th className="p-5 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {lotStones.map(stone => (
                          <tr key={stone.id} className="hover:bg-cyan-50/20 transition-colors group cursor-pointer" onClick={() => setSelectedStone(stone)}>
                            <td className="p-5 pl-10 font-mono text-stone-400 text-xs">{stone.number}</td>
                            <td className="p-5 font-bold text-stone-900">{stone.variety}</td>
                            <td className="p-5 font-mono text-stone-500 text-xs bg-stone-50 rounded px-2 py-1 w-fit">{stone.code}</td>
                            <td className="p-5 text-right font-mono font-bold text-stone-700">{stone.weight.toFixed(2)} ct</td>
                            <td className="p-5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stone.status === 'available' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>{stone.status}</span>
                            </td>
                            <td className="p-5 text-center">
                               <ChevronRight size={18} className="text-stone-300 group-hover:text-cyan-600 transition-colors" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedStone && (
         <StoneDetailPanel 
            stone={selectedStone} 
            isReadOnly={isReadOnly} 
            onClose={() => setSelectedStone(null)} 
            lotName={lots.find(l => l.id === selectedStone.lotId)?.name}
         />
      )}
    </div>
  );
};
