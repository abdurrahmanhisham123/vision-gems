import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gem, DollarSign, Package, TrendingUp, TrendingDown, 
  RefreshCw, Download, Printer, BarChart2, PieChart,
  Building2, Tag, MapPin, Calendar, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Layers, Scale, ShoppingBag
} from 'lucide-react';
import { getVisionGemsSpinelData } from '../../services/dataService';
import { ExtendedSpinelStone } from '../../types';
import { APP_MODULES } from '../../constants';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const UnifiedDashboardTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [stones, setStones] = useState<ExtendedSpinelStone[]>([]);
  const [loading, setLoading] = useState(true);

  // Get tabs to aggregate from current module
  const getTabsToAggregate = useMemo(() => {
    const module = APP_MODULES.find(m => m.id === moduleId);
    if (!module) return [];

    // Exclude dashboard tabs and non-inventory tabs
    const excludedTabs = [
      'dashboard', 'dashboardgems', 'dashboardgems', 'dash', 'exdashboard', 
      'kdashboard', 'vg.t dashboard', 'mdashboard', 'vgrz.dashboard',
      'z', 'stone shape', 'approval', 'v g old stock'
    ];

    return module.tabs
      .filter(tab => {
        const tabNormal = tab.toLowerCase().trim();
        return !excludedTabs.includes(tabNormal);
      })
      .map(tab => tab.toLowerCase().trim());
  }, [moduleId]);

  // Fetch all stones data from all relevant tabs in the module
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // For in-stocks module, use "All Stones" tab
        if (moduleId === 'in-stocks') {
          const allStonesData = await getVisionGemsSpinelData('All Stones', 'in-stocks');
          setStones(allStonesData);
        } else {
          // For other modules, aggregate data from all inventory tabs
          const tabsToFetch = getTabsToAggregate;
          if (tabsToFetch.length > 0) {
            const allDataPromises = tabsToFetch.map(tab => 
              getVisionGemsSpinelData(tab, moduleId)
            );
            const allResults = await Promise.all(allDataPromises);
            const combinedData = allResults.flat();
            setStones(combinedData);
          } else {
            setStones([]);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setStones([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [moduleId, getTabsToAggregate]);

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">Unified Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">
             Comprehensive overview of all inventory from {moduleId.replace('-', ' ')} module
           </p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
             <Printer size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Print</span>
           </button>
           <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
             <RefreshCw size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Refresh</span>
           </button>
           <button className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
             <Download size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>

      {/* Main KPI Cards - Mobile: Compact 2x2, Desktop: 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
           <div className="flex-1">
              <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Stones</div>
              <div className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 leading-tight">{stats.totalStones}</div>
              <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">All inventory items</div>
           </div>
           <div className="w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0 mt-2 md:mt-0">
              <Gem size={20} className="md:w-7 md:h-7" />
           </div>
        </div>
        <div className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
           <div className="flex-1">
              <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Weight</div>
              <div className="text-lg md:text-2xl lg:text-3xl font-black text-stone-900 leading-tight truncate">{formatWeight(stats.totalWeight)}</div>
              <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">Combined carats</div>
           </div>
           <div className="w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0 mt-2 md:mt-0">
              <Scale size={20} className="md:w-7 md:h-7" />
           </div>
        </div>
        <div className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
           <div className="flex-1 min-w-0">
              <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Cost</div>
              <div className="text-lg md:text-2xl lg:text-3xl font-black text-stone-900 leading-tight truncate">{formatCurrency(stats.totalCost)}</div>
              <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">Inventory value</div>
           </div>
           <div className="w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0 mt-2 md:mt-0">
              <DollarSign size={20} className="md:w-7 md:h-7" />
           </div>
        </div>
        <div className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
           <div className="flex-1 min-w-0">
              <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Sales Value</div>
              <div className="text-lg md:text-2xl lg:text-3xl font-black text-stone-900 leading-tight truncate">{formatCurrency(stats.totalValue)}</div>
              <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">Potential revenue</div>
           </div>
           <div className="w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0 mt-2 md:mt-0">
              <TrendingUp size={20} className="md:w-7 md:h-7" />
           </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <CheckCircle size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Available</div>
           </div>
           <div className="text-base md:text-lg font-black text-stone-900">{stats.availableCount}</div>
           <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">{formatCurrency(stats.valueByStatus['In Stock'] || stats.valueByStatus['Approval'] || 0)}</div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                 <ShoppingBag size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Sold</div>
           </div>
           <div className="text-base md:text-lg font-black text-stone-900">{stats.soldCount}</div>
           <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">{formatCurrency(stats.valueByStatus['Sold'] || 0)}</div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Package size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Export</div>
           </div>
           <div className="text-base md:text-lg font-black text-stone-900">{stats.exportCount}</div>
           <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">{formatCurrency(stats.valueByStatus['Export'] || 0)}</div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <MapPin size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">BKK</div>
           </div>
           <div className="text-base md:text-lg font-black text-stone-900">{stats.bkkCount}</div>
           <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">{formatCurrency(stats.valueByStatus['BKK'] || 0)}</div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
           <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Status Breakdown
           </h3>
           <div className="space-y-2.5 md:space-y-3">
              {Object.entries(stats.statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const percentage = stats.totalStones > 0 ? ((count / stats.totalStones) * 100).toFixed(1) : 0;
                  return (
                    <div key={status} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                       <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                          <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{status}</span>
                       </div>
                       <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-stone-900 w-10 sm:w-12 text-right shrink-0">{count}</span>
                          <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>

        {/* Variety Breakdown */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
           <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
              <Tag size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Top Varieties
           </h3>
           <div className="space-y-2.5 md:space-y-3">
              {Object.entries(stats.varietyCounts)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 8)
                .map(([variety, data]) => {
                  const percentage = stats.totalStones > 0 ? ((data.count / stats.totalStones) * 100).toFixed(1) : 0;
                  return (
                    <div key={variety} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                       <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{variety}</span>
                       </div>
                       <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-stone-900 w-10 sm:w-12 text-right shrink-0">{data.count}</span>
                          <span className="text-[10px] md:text-xs text-stone-500 w-14 sm:w-16 text-right shrink-0">{formatWeight(data.weight)}</span>
                       </div>
                    </div>
                  );
                })}
           </div>
        </div>
      </div>

      {/* Company & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Company Breakdown */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
           <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
              <Building2 size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Companies
           </h3>
           <div className="space-y-1.5 md:space-y-2">
              {Object.entries(stats.companyCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([company, count]) => (
                  <div key={company} className="flex items-center justify-between py-1.5 md:py-2 border-b border-stone-100 last:border-0">
                     <span className="text-xs md:text-sm font-medium text-stone-700 truncate pr-2">{company}</span>
                     <span className="text-xs md:text-sm font-bold text-stone-900 shrink-0">{count}</span>
                  </div>
                ))}
           </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
           <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
              <MapPin size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Locations
           </h3>
           <div className="space-y-1.5 md:space-y-2">
              {Object.entries(stats.locationCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between py-1.5 md:py-2 border-b border-stone-100 last:border-0">
                     <span className="text-xs md:text-sm font-medium text-stone-700 truncate pr-2">{location}</span>
                     <span className="text-xs md:text-sm font-bold text-stone-900 shrink-0">{count}</span>
                  </div>
                ))}
           </div>
        </div>
      </div>

      {/* Recent Stones */}
      <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
         <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
            <Calendar size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Recent Additions
         </h3>
         
         {/* Mobile: Card Layout */}
         <div className="lg:hidden space-y-3">
            {stats.recentStones.map((stone) => (
               <div key={stone.id} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <div className="flex items-start justify-between mb-2">
                     <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-stone-900 text-sm mb-1 truncate">{stone.codeNo}</div>
                        <div className="text-xs text-stone-600">{stone.variety}</div>
                     </div>
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 ${
                        stone.status === 'Sold' ? 'bg-green-50 text-green-700' :
                        stone.status === 'In Stock' ? 'bg-blue-50 text-blue-700' :
                        stone.status === 'Export' ? 'bg-purple-50 text-purple-700' :
                        stone.status === 'BKK' ? 'bg-amber-50 text-amber-700' :
                        'bg-stone-50 text-stone-700'
                     }`}>
                        {stone.status || 'Unknown'}
                     </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div>
                        <span className="text-stone-500">Weight:</span>
                        <span className="font-mono font-bold text-stone-900 ml-1">{formatWeight(stone.weight || 0)}</span>
                     </div>
                     <div>
                        <span className="text-stone-500">Cost:</span>
                        <span className="font-mono font-bold text-stone-900 ml-1">{formatCurrency(stone.slCost || 0)}</span>
                     </div>
                     <div>
                        <span className="text-stone-500">Company:</span>
                        <span className="text-stone-700 ml-1 truncate">{stone.company}</span>
                     </div>
                     <div>
                        <span className="text-stone-500">Date:</span>
                        <span className="text-stone-700 ml-1">{stone.purchaseDate || '-'}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Desktop: Table Layout */}
         <div className="hidden lg:block overflow-x-auto">
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

