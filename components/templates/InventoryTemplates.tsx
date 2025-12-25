
import React, { useEffect, useState } from 'react';
import { Stone } from '../../types';
import { getStones } from '../../services/dataService';
import { Filter, Plus, Download, MoreHorizontal, ChevronRight, Search, List, Grid, Loader2 } from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- TEMPLATE 1: INVENTORY TEMPLATE ---
export const InventoryTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [stones, setStones] = useState<Stone[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    // Fetch data asynchronously
    getStones(tabId).then(data => {
      if (mounted) {
        setStones(data);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [tabId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sold': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Export': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Missing': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading inventory from Vision Gems...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Filters Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
           <input 
             type="text" 
             placeholder="Search code, stone type..." 
             className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gem-purple/20 focus:border-gem-purple"
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600">
            <Filter size={18} />
          </button>
          <div className="flex bg-stone-100 rounded-xl p-1 border border-stone-200">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gem-purple' : 'text-stone-400'}`}><Grid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gem-purple' : 'text-stone-400'}`}><List size={18} /></button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 text-sm">
            <Download size={16} /> Export
          </button>
          {!isReadOnly && (
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gem-purple text-white rounded-xl text-sm font-semibold shadow-purple hover:bg-gem-purple-dark transition-all">
              <Plus size={18} /> Add Stone
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!loading && stones.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
          <p className="text-stone-500 font-medium">No stones found in this section.</p>
          <p className="text-stone-400 text-sm mt-1">Check your Google Sheet data or add a new stone.</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && stones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stones.map(stone => (
            <div 
              key={stone.id} 
              onClick={() => setSelectedStone(stone)}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-gem-gold/50 hover:shadow-gold transition-all duration-300 relative cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 border-b border-stone-100">
                <img src={stone.imgUrl} alt={stone.code} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${getStatusColor(stone.status)}`}>
                  {stone.status}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-gem-purple text-lg tracking-tight">{stone.code}</h3>
                   <div className="text-stone-300 group-hover:text-gem-purple transition-colors"><MoreHorizontal size={20} /></div>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-4">
                   <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600">{stone.type}</span>
                   <span>•</span>
                   <span>{stone.weight}ct</span>
                   <span>•</span>
                   <span>{stone.shape}</span>
                </div>
                
                <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-0.5">Price</div>
                    <div className="text-stone-900 font-bold text-lg leading-none">
                      {stone.price.toLocaleString()} <span className="text-[10px] text-stone-500 font-normal">LKR</span>
                    </div>
                  </div>
                  {!isReadOnly && <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center group-hover:bg-gem-purple group-hover:border-gem-purple group-hover:text-white transition-all"><ChevronRight size={16} /></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'list' && stones.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-semibold border-b border-stone-200">
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Color</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Price (LKR)</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {stones.map((stone, idx) => (
                <tr 
                  key={stone.id} 
                  onClick={() => setSelectedStone(stone)}
                  className={`border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'}`}
                >
                  <td className="p-4 font-medium text-gem-purple">{stone.code}</td>
                  <td className="p-4 text-stone-600">{stone.type}</td>
                  <td className="p-4 text-stone-600">{stone.weight} ct</td>
                  <td className="p-4 text-stone-600">{stone.color}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(stone.status)}`}>
                      {stone.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-stone-900">{stone.price.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="text-stone-400 hover:text-gem-purple"><ChevronRight size={18} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailModal
        isOpen={!!selectedStone}
        onClose={() => setSelectedStone(null)}
        title={selectedStone?.code || ''}
        subtitle={`${selectedStone?.weight}ct ${selectedStone?.color} ${selectedStone?.shape} ${selectedStone?.type}`}
        data={selectedStone || {}}
        image={selectedStone?.imgUrl}
        status={selectedStone?.status}
        statusColor={selectedStone ? getStatusColor(selectedStone.status) : ''}
      />
    </div>
  );
};

// --- TEMPLATE 10: SIMPLE LIST TEMPLATE ---
export const SimpleListTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const items = Array.from({length: 12}).map((_, i) => ({
    id: i,
    name: ['Oval', 'Cushion', 'Round', 'Emerald', 'Heart'][i % 5] + (i > 4 ? ` ${i}` : ''),
    description: 'Standard cut shape',
    category: 'Gem Shape',
    addedDate: '2025-01-15'
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">Reference List: {tabId}</h2>
        {!isReadOnly && (
          <button className="flex items-center gap-2 px-4 py-2 bg-gem-purple text-white rounded-lg text-sm font-medium hover:bg-gem-purple-dark">
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="p-4 flex justify-between items-center border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">{idx + 1}</span>
              <div>
                <div className="font-semibold text-stone-900">{item.name}</div>
                <div className="text-xs text-stone-500">{item.description}</div>
              </div>
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                <button className="text-stone-400 hover:text-gem-purple text-xs font-medium px-3 py-1 border border-stone-200 rounded-lg hover:border-gem-purple" onClick={(e) => {e.stopPropagation();}}>Edit</button>
                <button className="text-stone-400 hover:text-red-600 text-xs font-medium px-3 py-1 border border-stone-200 rounded-lg hover:border-red-600" onClick={(e) => {e.stopPropagation();}}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
        data={selectedItem || {}}
        icon={<List size={32} />}
      />
    </div>
  );
};
