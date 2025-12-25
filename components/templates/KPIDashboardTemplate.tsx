import React, { useState, useEffect, useMemo } from 'react';
import { DashboardConfig } from '../../utils/dashboardConfig';
import { getDashboardData } from '../../services/dashboardService';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Download, 
  Printer, DollarSign, Wallet, Package, AlertCircle,
  BarChart2, PieChart, ArrowUpRight, ArrowDownRight,
  Share2, Users, ShoppingCart, Globe, Gem, LayoutGrid,
  CheckCircle, Clock, CreditCard, Filter, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Pie, Cell, Legend, AreaChart, Area,
  PieChart as RePieChart
} from 'recharts';

interface Props {
  config: DashboardConfig;
  moduleId: string;
  tabId: string;
}

export const KPIDashboardTemplate: React.FC<Props> = ({ config, moduleId, tabId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    getDashboardData(config).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [config, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="font-medium animate-pulse">Aggregating Dashboard Metrics...</p>
      </div>
    );
  }

  const fmt = (val: number | string | undefined, currency: string = "LKR") => {
    if (val === undefined || val === null || val === "Auto") return "—";
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    return `${currency} ${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-stone-400" />;
  };

  const isRichDashboard = ['vision_gems_dashboard', 'spinel_main_dashboard'].includes(config.dataKey);
  const isOutstandingDashboard = config.dataKey === 'outstanding_dashboard';

  if (isOutstandingDashboard) {
    const customerSummary = data?.breakdowns?.customerSummary || [];
    const currencyBreakdown = data?.breakdowns?.currencyBreakdown || [];

    return (
      <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">Overview</div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Outstanding Summary</h2>
           </div>
           <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
              <button className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold">Monthly</button>
              <button onClick={handleRefresh} className="p-2 text-stone-400 hover:text-stone-600"><RefreshCw size={18} /></button>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
           {config.kpiCards.map((card, idx) => (
               <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm group hover:shadow-md transition-all">
                  <h3 className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.title}</h3>
                  <div className="text-2xl font-bold text-stone-900 tracking-tight">{fmt(data.metrics[card.key], card.title.includes('USD') ? '$' : 'LKR')}</div>
               </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
             {moduleId.replace('-', ' ').replace('bkk', 'BKK')} <span className="text-stone-300">/</span> {tabId}
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
            {config.tabName}
          </h2>
        </div>
        <div className="flex gap-3">
           <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 shadow-sm transition-all"><RefreshCw size={16} /></button>
           <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all shadow-lg"><Download size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {config.kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: config.themeColor, opacity: 0.7}}></div>
             <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{card.title}</span>
                {getTrendIcon(card.trend)}
             </div>
             <div className="text-2xl font-bold text-stone-900 mb-1 truncate">{fmt(data.metrics[card.key], card.currency)}</div>
             {card.note && <div className="text-[10px] text-stone-400 font-medium">{card.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};