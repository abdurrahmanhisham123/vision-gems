
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Layers, Package, Eye, Scale, Gem, Tag, X, Info, Edit, ChevronRight
} from 'lucide-react';

// --- Types ---
interface BatchStone {
  id: string;
  code: string;
  weight: number;
  variety: string;
  shape: string;
  status: string;
}

const generateMockData = (): BatchStone[] => {
  return Array.from({length: 30}).map((_, i) => ({
    id: `ru-bkk1-${i}`,
    code: `RB1-${String(i+1).padStart(3, '0')}`,
    weight: Number((0.5 + Math.random()).toFixed(2)),
    variety: 'Ruby',
    shape: ['Oval', 'Cushion', 'Round'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.4 ? 'Available' : 'Sold'
  }));
};

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Side Detail Panel ---

const StoneDetailPanel: React.FC<{
  stone: BatchStone;
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
                stone.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {stone.status}
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">RUBY BATCH</span>
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
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Shape</div>
                <div className="text-lg font-bold text-stone-800">{stone.shape}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Tag size={14} /> Batch Information
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Batch Code</span>
                  <span className="text-sm font-bold text-stone-800">RB1-2024</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Status</span>
                  <span className="text-sm font-bold text-stone-800">{stone.status}</span>
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

export const RuBkk1Template: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [stones, setStones] = useState<BatchStone[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShape, setFilterShape] = useState('all');
  const [filterWeight, setFilterWeight] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedStone, setSelectedStone] = useState<BatchStone | null>(null);

  const weightOptions = ['All', '0-1', '1-2', '2+'];

  const filteredStones = useMemo(() => {
    return stones.filter(s => {
      const matchSearch = s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchShape = filterShape === 'all' || s.shape.toLowerCase() === filterShape.toLowerCase();
      let matchWeight = true;
      if (filterWeight !== 'All') {
        if (filterWeight === '0-1') matchWeight = s.weight < 1;
        else if (filterWeight === '1-2') matchWeight = s.weight >= 1 && s.weight < 2;
        else matchWeight = s.weight >= 2;
      }
      const matchStatus = filterStatus === 'All' || s.status.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchShape && matchWeight && matchStatus;
    });
  }, [stones, searchQuery, filterShape, filterWeight, filterStatus]);

  const totalWeight = filteredStones.reduce((acc, s) => acc + s.weight, 0);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200"><Layers size={24} /></div>
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Ruby Batch</div>
              <h2 className="text-2xl font-bold text-stone-900">{tabId}</h2>
           </div>
        </div>
        {!isReadOnly && (
           <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 transition-all">
             <Plus size={18} /> Add Stone
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
               <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Stones</div>
               <div className="text-2xl font-bold text-stone-800">{filteredStones.length}</div>
            </div>
            <Package size={24} className="text-stone-300" />
         </div>
         <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
               <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Weight</div>
               <div className="text-2xl font-bold text-red-600">{totalWeight.toFixed(2)} <span className="text-sm text-stone-400 font-medium">ct</span></div>
            </div>
            <Layers size={24} className="text-red-200" />
         </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
        <div className="relative w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
           <input 
             type="text" 
             placeholder="Search codes..." 
             value={searchQuery} 
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
           />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-20">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-6 pl-10">Code</th>
                     <th className="p-6">Variety</th>
                     <th className="p-6">Shape</th>
                     <th className="p-6 text-right">Weight</th>
                     <th className="p-6 text-center">Status</th>
                     <th className="p-6 w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-[14px]">
                  {filteredStones.map(stone => (
                     <tr key={stone.id} className="hover:bg-red-50/20 transition-colors cursor-pointer group" onClick={() => setSelectedStone(stone)}>
                        <td className="p-6 pl-10 font-mono font-bold text-stone-800">{stone.code}</td>
                        <td className="p-6 text-stone-600">{stone.variety}</td>
                        <td className="p-6 text-stone-600">{stone.shape}</td>
                        <td className="p-6 text-right font-mono font-medium">{stone.weight.toFixed(2)} ct</td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${stone.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {stone.status}
                           </span>
                        </td>
                        <td className="p-6 text-center">
                           <ChevronRight size={18} className="text-stone-300 group-hover:text-red-600 transition-colors" />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

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
