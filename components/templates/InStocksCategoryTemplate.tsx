
import React, { useState } from 'react';
import { 
  ArrowLeft, Gem, Diamond, Layers, Star
} from 'lucide-react';
import { VisionGemsSpinelTemplate } from './VisionGemsSpinelTemplate';

interface StoneCategory {
  id: string;
  name: string;
  count: number;
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

const PRECIOUS_STONES: StoneCategory[] = [
  { id: 'Ruby', name: 'Ruby', count: 45, color: 'text-red-600', gradient: 'from-red-50 to-red-100', icon: <Gem /> },
  { id: 'Blue.Sapphire', name: 'Blue Sapphire', count: 82, color: 'text-blue-600', gradient: 'from-blue-50 to-blue-100', icon: <Diamond /> },
  { id: 'Yellow.Sapphire', name: 'Yellow Sapphire', count: 12, color: 'text-yellow-600', gradient: 'from-yellow-50 to-yellow-100', icon: <Star /> },
  { id: 'Padparadscha', name: 'Padparadscha', count: 8, color: 'text-orange-500', gradient: 'from-orange-50 to-orange-100', icon: <Gem /> },
  { id: 'Emerald', name: 'Emerald', count: 5, color: 'text-emerald-600', gradient: 'from-emerald-50 to-emerald-100', icon: <Diamond /> },
];

const SEMI_PRECIOUS_STONES: StoneCategory[] = [
  { id: 'Spinel', name: 'Spinel', count: 120, color: 'text-pink-600', gradient: 'from-pink-50 to-pink-100', icon: <Layers /> },
  { id: 'TSV', name: 'Tsavorite', count: 34, color: 'text-green-600', gradient: 'from-green-50 to-green-100', icon: <Gem /> },
  { id: 'Garnet', name: 'Garnet', count: 65, color: 'text-red-700', gradient: 'from-red-100 to-red-200', icon: <Diamond /> },
  { id: 'Zircon', name: 'Zircon', count: 28, color: 'text-cyan-600', gradient: 'from-cyan-50 to-cyan-100', icon: <Star /> },
  { id: 'Tourmaline', name: 'Tourmaline', count: 42, color: 'text-fuchsia-600', gradient: 'from-fuchsia-50 to-fuchsia-100', icon: <Layers /> },
  { id: 'Chrysoberyl', name: 'Chrysoberyl', count: 15, color: 'text-lime-600', gradient: 'from-lime-50 to-lime-100', icon: <Gem /> },
  { id: 'Aquamarine', name: 'Aquamarine', count: 18, color: 'text-sky-500', gradient: 'from-sky-50 to-sky-100', icon: <Diamond /> },
  { id: 'Mandarin.Garnet', name: 'Mandarin', count: 22, color: 'text-orange-600', gradient: 'from-orange-100 to-orange-200', icon: <Star /> },
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const InStocksCategoryTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [selectedStone, setSelectedStone] = useState<string | null>(null);

  const categories = tabId.toLowerCase().includes('semi') ? SEMI_PRECIOUS_STONES : PRECIOUS_STONES;
  const title = tabId.toLowerCase().includes('semi') ? 'Semi-Precious Collection' : 'Precious Collection';
  const subtitle = tabId.toLowerCase().includes('semi') ? 'Vibrant varieties for every design' : 'High-value investment stones';

  if (selectedStone) {
    return (
      <div className="flex flex-col min-h-screen bg-stone-50/50">
        {/* Sticky Back Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setSelectedStone(null)}
            className="group flex items-center gap-2 px-3 py-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-all"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Back to Categories</span>
          </button>
          <div className="h-6 w-px bg-stone-200"></div>
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-stone-400">Viewing:</span>
             <h3 className="text-lg font-bold text-stone-900">
               {categories.find(c => c.id === selectedStone)?.name}
             </h3>
          </div>
        </div>
        
        {/* Render the rich Spinel/Mahenge style template */}
        <div className="flex-1">
           <VisionGemsSpinelTemplate 
             moduleId={moduleId} 
             tabId={selectedStone} 
             isReadOnly={isReadOnly} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen">
      
      <div className="text-center mb-12 py-8">
        <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">{title}</h2>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => setSelectedStone(cat.id)}
            className={`
              relative group cursor-pointer rounded-3xl p-6 
              bg-gradient-to-br ${cat.gradient} border border-white/50 shadow-sm 
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300
              flex flex-col items-center text-center overflow-hidden
            `}
          >
            {/* Background Icon Decoration */}
            <div className={`absolute -right-4 -bottom-4 opacity-10 transform rotate-12 scale-150 transition-transform group-hover:scale-125 ${cat.color}`}>
               {/* Fixed Error: Cast icon to React.ReactElement<any> to avoid prop validation issues on size */}
               {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 100 })}
            </div>

            <div className={`w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center mb-4 ${cat.color}`}>
               {/* Fixed Error: Cast icon to React.ReactElement<any> to avoid prop validation issues on size */}
               {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 32 })}
            </div>
            
            <h3 className="text-lg font-bold text-stone-800 mb-1 z-10">{cat.name}</h3>
            <span className="text-xs font-semibold text-stone-500 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm z-10">
              {cat.count} items
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
