
import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Printer, Filter, 
  ChevronDown, ChevronUp, Package, Calendar, 
  DollarSign, TrendingUp, Users, FileText,
  BarChart2, ArrowUpRight, X, Info, ChevronRight, Scale, Gem
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// --- Types ---

interface SoldStone {
  id: string;
  no: number;
  variety: string;
  weight: number;
  codeNo: string;
  shape: string;
  pieces: number;
  dateSold: string; // YYYY-MM-DD
  buyer: string;
  pricePerCarat: number;
  totalValue: number;
  originalLot: string;
}

interface SalesMetrics {
  totalStones: number;
  totalWeight: number;
  totalRevenue: number;
  avgPricePerCarat: number;
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Shape Component ---

const ShapeIcon: React.FC<{ shape: string, className?: string }> = ({ shape, className = "w-full h-full" }) => {
  const s = shape.toLowerCase();
  const color = "currentColor";
  const strokeWidth = 1.5;

  const paths: Record<string, React.ReactNode> = {
    round: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M12 3L12 21 M3 12L21 12 M6 6L18 18 M18 6L6 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    oval: <ellipse cx="12" cy="12" rx="7" ry="10" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    cushion: <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    emerald: <><rect x="5" y="3" width="14" height="18" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M5 6L19 6 M5 18L19 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    pear: <path d="M12 2C12 2 4 14 4 17C4 20.5 8 22 12 22C16 22 20 20.5 20 17C20 14 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    princess: <><rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M4 4L20 20 M20 4L4 20" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth={strokeWidth} fill="none" transform="scale(0.8) translate(3,3)" />,
  };

  return <svg viewBox="0 0 24 24" className={className}>{paths[s] || paths.round}</svg>;
};

// --- Mock Data ---

const generateMockSoldData = (): SoldStone[] => {
  const stones: SoldStone[] = [];
  const buyers = ['John', 'Sarah', 'Mike', 'Royal Gems', 'China Jewelry Co', 'Bangkok Trader'];
  const shapes = ['Round', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Princess', 'Heart'];
  const lots = ['Tsv Lot 1', 'Tsv Lot 2'];

  for (let i = 1; i <= 57; i++) {
    const weight = Number((0.8 + Math.random() * 2.5).toFixed(2));
    const pricePerCarat = 350 + Math.floor(Math.random() * 300); // 350 - 650
    const totalValue = weight * pricePerCarat;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    stones.push({
      id: `sold-${i}`,
      no: i,
      variety: 'TSV',
      weight,
      codeNo: `K-TS-${String(i).padStart(3, '0')}${Math.random() > 0.5 ? '*' + Math.floor(Math.random()*9) : ''}`,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      pieces: 1,
      dateSold: date.toISOString().split('T')[0],
      buyer: buyers[Math.floor(Math.random() * buyers.length)],
      pricePerCarat,
      totalValue,
      originalLot: lots[Math.floor(Math.random() * lots.length)]
    });
  }
  return stones.sort((a,b) => new Date(b.dateSold).getTime() - new Date(a.dateSold).getTime());
};

const calculateMetrics = (stones: SoldStone[]): SalesMetrics => {
  const totalStones = stones.length;
  const totalWeight = stones.reduce((sum, s) => sum + s.weight, 0);
  const totalRevenue = stones.reduce((sum, s) => sum + s.totalValue, 0);
  const avgPricePerCarat = totalWeight > 0 ? totalRevenue / totalWeight : 0;
  return { totalStones, totalWeight, totalRevenue, avgPricePerCarat };
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- Side Detail Panel ---

const StoneDetailPanel: React.FC<{
  stone: SoldStone;
  onClose: () => void;
}> = ({ stone, onClose }) => {
  const fmt = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                SOLD ARCHIVE
              </span>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">#{stone.no}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">{stone.codeNo}</h2>
            <p className="text-sm text-stone-500 mt-1">{stone.variety} • {stone.shape}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} /> Stone Specifications
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
                <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Original Lot</div>
                <div className="text-sm font-bold text-stone-800 truncate">{stone.originalLot}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <DollarSign size={14} /> Sales Records
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Buyer</span>
                  <span className="text-sm font-bold text-stone-800">{stone.buyer}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Date Sold</span>
                  <span className="text-sm font-bold text-stone-800">{formatDate(stone.dateSold)}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-stone-500">Price Per Carat</span>
                  <span className="text-sm font-bold text-stone-800 font-mono">${stone.pricePerCarat}</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-700">Total Revenue</span>
                  <span className="text-lg font-bold text-emerald-900 font-mono">${fmt(stone.totalValue)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Main Template ---

export const TsvSoldTemplate: React.FC<Props> = () => {
  const [stones] = useState<SoldStone[]>(generateMockSoldData());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('All');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [selectedStone, setSelectedStone] = useState<SoldStone | null>(null);

  const filteredStones = useMemo(() => {
    return stones.filter(stone => {
      const matchesSearch = 
        stone.codeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stone.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stone.no.toString().includes(searchQuery);
      const matchesBuyer = selectedBuyer === 'All' || stone.buyer === selectedBuyer;
      let matchesDate = true;
      if (dateRange.start) matchesDate = matchesDate && stone.dateSold >= dateRange.start;
      if (dateRange.end) matchesDate = matchesDate && stone.dateSold <= dateRange.end;
      return matchesSearch && matchesBuyer && matchesDate;
    });
  }, [stones, searchQuery, selectedBuyer, dateRange]);

  const metrics = calculateMetrics(filteredStones);

  const topBuyers = useMemo(() => {
    const stats: Record<string, { count: number, revenue: number }> = {};
    filteredStones.forEach(s => {
      if (!stats[s.buyer]) stats[s.buyer] = { count: 0, revenue: 0 };
      stats[s.buyer].count += 1;
      stats[s.buyer].revenue += s.totalValue;
    });
    return Object.entries(stats).map(([name, val]) => ({ name, ...val })).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [filteredStones]);

  const uniqueBuyers = useMemo(() => Array.from(new Set(stones.map(s => s.buyer))).sort(), [stones]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-white pb-44 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 print:hidden">
        <div>
           <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">
              VG Exporting <span className="text-stone-300">/</span> Archive
           </div>
           <h2 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
             Sold Tsavorite Archive
             <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold uppercase">Read Only</span>
           </h2>
           <p className="text-stone-500 text-sm mt-1">Historical sales records and revenue analytics for Tsavorite.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
             <Download size={16} /> Export CSV
           </button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10">
             <Printer size={16} /> Print Report
           </button>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm relative overflow-hidden print:border-stone-200 print:shadow-none">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Sold Count</span>
               <div className="text-2xl font-bold text-stone-900">{metrics.totalStones} <span className="text-xs font-medium text-stone-400">stones</span></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Total Weight</span>
               <div className="text-2xl font-bold text-stone-900">{metrics.totalWeight.toFixed(2)} <span className="text-xs font-medium text-stone-400">ct</span></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Avg Price</span>
               <div className="text-2xl font-bold text-stone-900">${metrics.avgPricePerCarat.toFixed(0)} <span className="text-xs font-medium text-stone-400">/ct</span></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Total Revenue</span>
               <div className="text-2xl font-bold text-emerald-600">${metrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center print:hidden">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code, buyer, number..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-20">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider w-16 text-center">No.</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Variety</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Weight</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Code</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Date Sold</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Buyer</th>
                     <th className="p-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Total</th>
                     <th className="p-4 w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                  {filteredStones.map(stone => (
                     <tr key={stone.id} onClick={() => setSelectedStone(stone)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                        <td className="p-4 font-mono text-stone-400 text-xs text-center">{stone.no}</td>
                        <td className="p-4 font-bold text-stone-800 text-sm">{stone.variety}</td>
                        <td className="p-4 font-mono font-bold text-stone-700 text-sm text-right">{stone.weight.toFixed(2)}</td>
                        <td className="p-4 font-mono text-stone-600 text-sm">{stone.codeNo}</td>
                        <td className="p-4 text-stone-600 text-sm">{formatDate(stone.dateSold)}</td>
                        <td className="p-4 text-stone-600 text-sm">{stone.buyer}</td>
                        <td className="p-4 text-right font-bold text-emerald-600 text-sm">${stone.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-center">
                           <ChevronRight size={18} className="text-stone-300 group-hover:text-blue-600 transition-colors" />
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
            onClose={() => setSelectedStone(null)} 
         />
      )}
    </div>
  );
};
