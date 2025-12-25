
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, 
  Save, X, ChevronDown, ChevronUp, Layers,
  Gem, FolderPlus, Info, Tag, Package, ChevronRight
} from 'lucide-react';

// --- Types ---

export interface ChinaStone {
  id: string;
  number: number;
  code: string;
  weight: number;
  marker: string;
  section: string;
  pieces: number;
  variety: string;
  batchReference: string;
  batchDate: string;
  status: 'available' | 'sold' | 'reserved';
  photos: string[];
  createdAt: string;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data Generator ---

const generateChinaData = (): ChinaStone[] => {
  const stones: ChinaStone[] = [];
  let idCounter = 1;
  const batchRef = "china-exp-001";
  const batchDate = "15/11/2024";

  const spinelData = [
    { c: 'TM 225', w: 3.13 }, { c: 'TM 217', w: 3.02 }, 
    { c: 'TM 211*1', w: 3.04 }, { c: 'TM 258', w: 2.05 }
  ];
  spinelData.forEach((d, i) => {
    stones.push({ 
      id: `ch-${idCounter++}`, number: i+1, code: d.c, weight: d.w, marker: '•', 
      section: 'Spinel', variety: 'Spinel', pieces: 1, 
      batchReference: batchRef, batchDate: batchDate, status: 'available', photos: [], createdAt: new Date().toISOString() 
    });
  });
  for (let i = 5; i <= 65; i++) {
    stones.push({
      id: `ch-${idCounter++}`, number: i, code: `TM ${100 + i}`, weight: Number((0.5 + Math.random()).toFixed(2)), marker: Math.random() > 0.8 ? '*' : '•',
      section: 'Spinel', variety: 'Spinel', pieces: 1, 
      batchReference: batchRef, batchDate: batchDate, status: 'available', photos: [], createdAt: new Date().toISOString()
    });
  }
  return stones;
};

// --- Side Detail Panel ---

const StoneDetailPanel: React.FC<{
  stone: ChinaStone;
  onClose: () => void;
  isReadOnly?: boolean;
}> = ({ stone, onClose, isReadOnly }) => {
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
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">CHINA EXPORT</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{stone.code}</h2>
            <p className="text-sm text-stone-500 mt-1">{stone.section} • Stone #{stone.number}</p>
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
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Marker</div>
                <div className="text-lg font-bold text-stone-800">{stone.marker}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Tag size={14} /> Batch Information
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Batch Reference</span>
                  <span className="text-sm font-bold text-stone-800">{stone.batchReference}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Export Date</span>
                  <span className="text-sm font-bold text-stone-800">{stone.batchDate}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 sticky bottom-0 z-10">
           {!isReadOnly && (
             <button className="px-6 py-2 bg-[#D97706] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-amber-700 transition-all flex items-center gap-2">
                <Edit size={16} /> Edit Record
             </button>
           )}
        </div>
      </div>
    </>
  );
};

// --- MAIN TEMPLATE ---

export const ChinaTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const [stones, setStones] = useState<ChinaStone[]>(generateChinaData());
  const [categories] = useState(['Spinel', 'TSV', 'Sapphire', 'Mix Semi']);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Spinel']));
  const [selectedStone, setSelectedStone] = useState<ChinaStone | null>(null);

  const toggleSection = (v: string) => {
    const s = new Set(expandedSections);
    if (s.has(v)) s.delete(v); else s.add(v);
    setExpandedSections(s);
  };

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#D97706] shadow-sm"><Layers size={20} /></div>
           <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Batch View</span>
              <span className="text-sm font-semibold text-stone-800">China Export</span>
           </div>
        </div>
        {!isReadOnly && (
           <button className="flex items-center gap-2 px-5 py-2.5 bg-[#D97706] text-white rounded-xl text-sm font-bold shadow-md hover:bg-amber-700 transition-all active:scale-95">
             <Plus size={18} /> Add Stone
           </button>
        )}
      </div>

      {categories.map(section => (
         <div key={section} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-6">
            <div onClick={() => toggleSection(section)} className="p-6 flex justify-between items-center cursor-pointer hover:bg-stone-50 transition-colors">
               <h3 className="text-lg font-bold text-stone-900">{section} Category</h3>
               {expandedSections.has(section) ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
            </div>
            {expandedSections.has(section) && (
               <div className="border-t border-stone-100">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">
                           <th className="p-4 pl-10 w-20">No.</th>
                           <th className="p-4">Code</th>
                           <th className="p-4 text-right">Weight</th>
                           <th className="p-4 text-center">Status</th>
                           <th className="p-4 w-16"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-stone-100 text-sm">
                        {stones.filter(s => s.section === section).map(stone => (
                           <tr key={stone.id} onClick={() => setSelectedStone(stone)} className="hover:bg-amber-50/10 cursor-pointer group">
                              <td className="p-4 pl-10 font-mono text-stone-400 text-xs">{stone.number}</td>
                              <td className="p-4 font-bold text-stone-800">{stone.code}</td>
                              <td className="p-4 text-right font-mono">{stone.weight.toFixed(2)}</td>
                              <td className="p-4 text-center">
                                 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                                    {stone.status}
                                 </span>
                              </td>
                              <td className="p-4 text-center">
                                 <ChevronRight size={18} className="text-stone-300 group-hover:text-amber-600 transition-colors" />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      ))}

      {selectedStone && (
         <StoneDetailPanel 
            stone={selectedStone} 
            isReadOnly={isReadOnly} 
            onClose={() => setSelectedStone(null)} 
         />
      )}
    </div>
  );
};
