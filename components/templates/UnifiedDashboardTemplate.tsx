import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gem, DollarSign, Package, TrendingUp, TrendingDown, 
  RefreshCw, Download, Printer, BarChart2, PieChart,
  Building2, Tag, MapPin, Calendar, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Layers, Scale, ShoppingBag
} from 'lucide-react';
import { getVisionGemsSpinelData } from '../../services/dataService';
import { ExtendedSpinelStone } from '../../types';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const UnifiedDashboardTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [stones, setStones] = useState<ExtendedSpinelStone[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all stones data from "All Stones" tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch data from "All Stones" tab
        const allStonesData = await getVisionGemsSpinelData('All Stones', 'in-stocks');
        setStones(allStonesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalStones = stones.length;
    const totalWeight = stones.reduce((sum, s) => sum + (s.weight || 0), 0);
    const totalCost = stones.reduce((sum, s) => sum + (s.slCost || 0), 0);
    const totalValue = stones.reduce((sum, s) => sum + (s.amountLKR || s.finalPrice || 0), 0);
    
    // Status breakdown
    const statusCounts: Record<string, number> = {};
    stones.forEach(s => {
      const status = s.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Variety breakdown
    const varietyCounts: Record<string, { count: number; weight: number; value: number }> = {};
    stones.forEach(s => {
      const variety = s.variety || 'Unknown';
      if (!varietyCounts[variety]) {
        varietyCounts[variety] = { count: 0, weight: 0, value: 0 };
      }
      varietyCounts[variety].count++;
      varietyCounts[variety].weight += s.weight || 0;
      varietyCounts[variety].value += s.slCost || 0;
    });

    // Company breakdown
    const companyCounts: Record<string, number> = {};
    stones.forEach(s => {
      const company = s.company || 'Unknown';
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    // Location breakdown
    const locationCounts: Record<string, number> = {};
    stones.forEach(s => {
      const location = s.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    // Sold vs Available
    const soldCount = stones.filter(s => s.status === 'Sold').length;
    const availableCount = stones.filter(s => s.status === 'In Stock' || s.status === 'Approval').length;
    const exportCount = stones.filter(s => s.status === 'Export').length;
    const bkkCount = stones.filter(s => s.status === 'BKK').length;

    // Value by status
    const valueByStatus: Record<string, number> = {};
    stones.forEach(s => {
      const status = s.status || 'Unknown';
      valueByStatus[status] = (valueByStatus[status] || 0) + (s.slCost || 0);
    });

    // Recent stones (last 10)
    const recentStones = [...stones]
      .sort((a, b) => new Date(b.purchaseDate || '').getTime() - new Date(a.purchaseDate || '').getTime())
      .slice(0, 10);

    return {
      totalStones,
      totalWeight,
      totalCost,
      totalValue,
      statusCounts,
      varietyCounts,
      companyCounts,
      locationCounts,
      soldCount,
      availableCount,
      exportCount,
      bkkCount,
      valueByStatus,
      recentStones
    };
  }, [stones]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)}ct`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">Unified Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">
             Comprehensive overview of all inventory from All Stones
           </p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print Dashboard
           </button>
           <button onClick={() => window.location.reload()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <RefreshCw size={16} /> Refresh
           </button>
           <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Stones</div>
              <div className="text-2xl md:text-3xl font-black text-stone-900">{stats.totalStones}</div>
              <div className="text-xs text-stone-500 mt-1">All inventory items</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Gem size={28} />
           </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Weight</div>
              <div className="text-2xl md:text-3xl font-black text-stone-900">{formatWeight(stats.totalWeight)}</div>
              <div className="text-xs text-stone-500 mt-1">Combined carats</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Scale size={28} />
           </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Cost</div>
              <div className="text-2xl md:text-3xl font-black text-stone-900">{formatCurrency(stats.totalCost)}</div>
              <div className="text-xs text-stone-500 mt-1">Inventory value</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Sales Value</div>
              <div className="text-2xl md:text-3xl font-black text-stone-900">{formatCurrency(stats.totalValue)}</div>
              <div className="text-xs text-stone-500 mt-1">Potential revenue</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <TrendingUp size={28} />
           </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <CheckCircle size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Available</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.availableCount}</div>
           <div className="text-xs text-stone-500 mt-1">{formatCurrency(stats.valueByStatus['In Stock'] || stats.valueByStatus['Approval'] || 0)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                 <ShoppingBag size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Sold</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.soldCount}</div>
           <div className="text-xs text-stone-500 mt-1">{formatCurrency(stats.valueByStatus['Sold'] || 0)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Package size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Export</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.exportCount}</div>
           <div className="text-xs text-stone-500 mt-1">{formatCurrency(stats.valueByStatus['Export'] || 0)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <MapPin size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">BKK</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.bkkCount}</div>
           <div className="text-xs text-stone-500 mt-1">{formatCurrency(stats.valueByStatus['BKK'] || 0)}</div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-6">
           <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-purple-600" /> Status Breakdown
           </h3>
           <div className="space-y-3">
              {Object.entries(stats.statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const percentage = stats.totalStones > 0 ? ((count / stats.totalStones) * 100).toFixed(1) : 0;
                  return (
                    <div key={status} className="flex items-center justify-between">
                       <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm font-medium text-stone-700">{status}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                          <span className="text-sm font-bold text-stone-900 w-12 text-right">{count}</span>
                          <span className="text-xs text-stone-500 w-12 text-right">{percentage}%</span>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>

        {/* Variety Breakdown */}
        <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-6">
           <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-purple-600" /> Top Varieties
           </h3>
           <div className="space-y-3">
              {Object.entries(stats.varietyCounts)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 8)
                .map(([variety, data]) => {
                  const percentage = stats.totalStones > 0 ? ((data.count / stats.totalStones) * 100).toFixed(1) : 0;
                  return (
                    <div key={variety} className="flex items-center justify-between">
                       <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-sm font-medium text-stone-700">{variety}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                          <span className="text-sm font-bold text-stone-900 w-12 text-right">{data.count}</span>
                          <span className="text-xs text-stone-500 w-16 text-right">{formatWeight(data.weight)}</span>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>
      </div>

      {/* Company & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Company Breakdown */}
        <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-6">
           <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-purple-600" /> Companies
           </h3>
           <div className="space-y-2">
              {Object.entries(stats.companyCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([company, count]) => (
                  <div key={company} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                     <span className="text-sm font-medium text-stone-700">{company}</span>
                     <span className="text-sm font-bold text-stone-900">{count}</span>
                  </div>
                ))}
           </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-6">
           <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-purple-600" /> Locations
           </h3>
           <div className="space-y-2">
              {Object.entries(stats.locationCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                     <span className="text-sm font-medium text-stone-700">{location}</span>
                     <span className="text-sm font-bold text-stone-900">{count}</span>
                  </div>
                ))}
           </div>
        </div>
      </div>

      {/* Recent Stones */}
      <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-6 mb-8">
         <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" /> Recent Additions
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-3">Code</th>
                     <th className="p-3">Variety</th>
                     <th className="p-3">Weight</th>
                     <th className="p-3">Status</th>
                     <th className="p-3">Company</th>
                     <th className="p-3">Cost</th>
                     <th className="p-3">Date</th>
                  </tr>
               </thead>
               <tbody>
                  {stats.recentStones.map((stone) => (
                     <tr key={stone.id} className="border-b border-stone-100 hover:bg-purple-50/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-900 text-sm">{stone.codeNo}</td>
                        <td className="p-3 font-medium text-stone-700 text-sm">{stone.variety}</td>
                        <td className="p-3 font-mono text-stone-600 text-sm">{formatWeight(stone.weight || 0)}</td>
                        <td className="p-3">
                           <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              stone.status === 'Sold' ? 'bg-green-50 text-green-700' :
                              stone.status === 'In Stock' ? 'bg-blue-50 text-blue-700' :
                              stone.status === 'Export' ? 'bg-purple-50 text-purple-700' :
                              stone.status === 'BKK' ? 'bg-amber-50 text-amber-700' :
                              'bg-stone-50 text-stone-700'
                           }`}>
                              {stone.status || 'Unknown'}
                           </span>
                        </td>
                        <td className="p-3 text-stone-600 text-sm">{stone.company}</td>
                        <td className="p-3 font-mono font-bold text-stone-900 text-sm">{formatCurrency(stone.slCost || 0)}</td>
                        <td className="p-3 text-stone-500 text-xs">{stone.purchaseDate || '-'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

