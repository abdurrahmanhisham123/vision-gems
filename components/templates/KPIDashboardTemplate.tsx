import React, { useState, useEffect, useMemo } from 'react';
import { DashboardConfig } from '../../utils/dashboardConfig';
import { getDashboardData } from '../../services/dashboardService';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Download, 
  Printer, DollarSign, Wallet, Package, AlertCircle,
  BarChart2, PieChart, ArrowUpRight, ArrowDownRight,
  Share2, Users, ShoppingCart, Globe, Gem, LayoutGrid,
  CheckCircle, Clock, CreditCard, Filter, Search, Plane,
  Building2, Calendar
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

  const getTrendIcon = (trend?: string, value?: number | string) => {
    // Auto trend: determine based on value (positive = up, negative = down)
    if (trend === 'auto' && value !== undefined) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        return numValue >= 0 
          ? <TrendingUp size={16} className="text-emerald-500" />
          : <TrendingDown size={16} className="text-red-500" />;
      }
    }
    if (trend === 'up') return <TrendingUp size={16} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-stone-400" />;
  };

  const isRichDashboard = ['vision_gems_dashboard', 'spinel_main_dashboard'].includes(config.dataKey);
  const isOutstandingDashboard = config.dataKey === 'outstanding_dashboard';
  const isBKKDashboard = config.dataKey === 'bkk_dashboard';

  if (isOutstandingDashboard) {
    const customerSummary = data?.breakdowns?.customerSummary || [];
    const currencyBreakdown = data?.breakdowns?.currencyBreakdown || [];
    const paymentTracking = data?.breakdowns?.paymentTracking || [];
    
    // Calculate status breakdowns
    const paidCount = customerSummary.filter((c: any) => c.status === 'Cleared').length;
    const pendingCount = customerSummary.filter((c: any) => c.status === 'Pending').length;
    const overdueCount = customerSummary.filter((c: any) => c.status === 'Overdue').length;
    
    const hasData = customerSummary.length > 0 || paymentTracking.length > 0;

    return (
      <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">Outstanding Summary</h2>
            <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">
              Comprehensive overview of all outstanding amounts and payments received
            </p>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
            <button onClick={handleRefresh} className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
              <RefreshCw size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
              <Download size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          {config.kpiCards.map((card, idx) => {
            const value = data?.metrics?.[card.key] || 0;
            const currency = card.currency || (card.title.includes('USD') ? '$' : 'LKR');
            const iconColors = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
            const icons = [DollarSign, Users, TrendingUp, Wallet, TrendingUp];
            const Icon = icons[idx] || DollarSign;
            
            // Special styling for profit cards
            const isProfitCard = card.key === 'netProfit' || card.key === 'totalProfit' || card.title.toLowerCase().includes('profit');
            const profitValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
            const isPositive = profitValue >= 0;
            
            return (
              <div 
                key={idx} 
                className={`bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between ${
                  isProfitCard 
                    ? isPositive 
                      ? 'border-emerald-200' 
                      : 'border-red-200'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">{card.title}</div>
                  <div className={`text-lg md:text-2xl lg:text-3xl font-black leading-tight truncate ${
                    isProfitCard 
                      ? isPositive 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                      : 'text-stone-900'
                  }`}>
                    {fmt(value, currency)}
                  </div>
                  {card.note && <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">{card.note}</div>}
                </div>
                <div 
                  className={`w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border shrink-0 mt-2 md:mt-0 ${
                    isProfitCard
                      ? isPositive
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-red-50 border-red-100 text-red-600'
                      : ''
                  }`}
                  style={!isProfitCard ? { 
                    backgroundColor: `${iconColors[idx]}15`, 
                    borderColor: `${iconColors[idx]}30`, 
                    color: iconColors[idx] 
                  } : {}}
                >
                  {isProfitCard ? (
                    isPositive ? <TrendingUp size={20} className="md:w-7 md:h-7" /> : <TrendingDown size={20} className="md:w-7 md:h-7" />
                  ) : (
                    <Icon size={20} className="md:w-7 md:h-7" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                <CheckCircle size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Cleared</div>
            </div>
            <div className="text-base md:text-lg font-black text-stone-900">{paidCount}</div>
            <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">No outstanding</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                <Clock size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Pending</div>
            </div>
            <div className="text-base md:text-lg font-black text-stone-900">{pendingCount}</div>
            <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">Awaiting payment</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0">
                <AlertCircle size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Overdue</div>
            </div>
            <div className="text-base md:text-lg font-black text-stone-900">{overdueCount}</div>
            <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">Requires attention</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                <Users size={14} className="md:w-4 md:h-4" />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Customers</div>
            </div>
            <div className="text-base md:text-lg font-black text-stone-900">{customerSummary.length}</div>
            <div className="text-[10px] md:text-xs text-stone-500 mt-1 truncate">All customers</div>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-stone-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-2">No Outstanding Data Available</h3>
              <p className="text-sm md:text-base text-stone-500 mb-6">
                Add payment records in the payment received tabs and customer ledger tabs to see data here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Breakdown Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Payment Source Breakdown */}
              {paymentTracking.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Payment Sources
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {paymentTracking
                      .sort((a: any, b: any) => b.total - a.total)
                      .map((source: any) => {
                        const percentage = data?.metrics?.totalReceived > 0 
                          ? ((source.total / data.metrics.totalReceived) * 100).toFixed(1) 
                          : 0;
                        return (
                          <div key={source.source} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                              <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{source.source}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(source.total, 'LKR')}</span>
                              <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Currency Breakdown */}
              {currencyBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <PieChart size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Currency Breakdown
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {currencyBreakdown
                      .sort((a, b) => b.value - a.value)
                      .map((currency) => {
                        const total = currencyBreakdown.reduce((sum, c) => sum + c.value, 0);
                        const percentage = total > 0 ? ((currency.value / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={currency.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currency.color }}></div>
                              <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{currency.name}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${percentage}%`, backgroundColor: currency.color }}
                                ></div>
                              </div>
                              <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(currency.value, 'LKR')}</span>
                              <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Summary Table */}
            {customerSummary.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Users size={16} className="md:w-[18px] md:h-[18px] text-purple-600" /> Customer Summary
                </h3>
                
                {/* Mobile: Card Layout */}
                <div className="lg:hidden space-y-3">
                  {customerSummary.slice(0, 10).map((customer: any) => (
                    <div key={customer.id} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-stone-900 text-sm mb-1 truncate">{customer.name}</div>
                          <div className="text-xs text-stone-600">Invoice: {fmt(customer.slAmount, 'LKR')}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 ${
                          customer.status === 'Cleared' ? 'bg-emerald-50 text-emerald-700' :
                          customer.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-stone-500">Received:</span>
                          <span className="font-mono font-bold text-stone-900 ml-1">{fmt(customer.received, 'LKR')}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Outstanding:</span>
                          <span className="font-mono font-bold text-stone-900 ml-1">{fmt(customer.balance, 'LKR')}</span>
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
                        <th className="p-3">Customer</th>
                        <th className="p-3">Invoice Amount</th>
                        <th className="p-3">Received</th>
                        <th className="p-3">Outstanding</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSummary.map((customer: any) => (
                        <tr key={customer.id} className="border-b border-stone-100 hover:bg-purple-50/5 transition-colors">
                          <td className="p-3 font-bold text-stone-900 text-sm">{customer.name}</td>
                          <td className="p-3 font-mono text-stone-600 text-sm">{fmt(customer.slAmount, 'LKR')}</td>
                          <td className="p-3 font-mono text-stone-600 text-sm">{fmt(customer.received, 'LKR')}</td>
                          <td className="p-3 font-mono font-bold text-stone-900 text-sm">{fmt(customer.balance, 'LKR')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                              customer.status === 'Cleared' ? 'bg-emerald-50 text-emerald-700' :
                              customer.status === 'Overdue' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (isBKKDashboard) {
    const expenseBreakdown = data?.breakdowns?.expenses || [];
    const ticketBreakdown = data?.breakdowns?.tickets || [];
    const exportBreakdown = data?.breakdowns?.export || [];
    const apartmentBreakdown = data?.breakdowns?.apartment || [];
    const recentActivity = data?.breakdowns?.recent || [];
    
    const hasData = expenseBreakdown.length > 0 || ticketBreakdown.length > 0 || 
                    exportBreakdown.length > 0 || apartmentBreakdown.length > 0;

    return (
      <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-red-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">BKK Operations Summary</h2>
            <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">
              Comprehensive overview of all Bangkok operations and expenses
            </p>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
            <button onClick={handleRefresh} className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
              <RefreshCw size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-white border border-stone-200 text-stone-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap shrink-0">
              <Download size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          {config.kpiCards.map((card, idx) => {
            const value = data?.metrics?.[card.key] || 0;
            const iconColors = ['#DC2626', '#0891B2', '#EC4899', '#F59E0B'];
            const icons = [DollarSign, Plane, Building2, Package];
            const Icon = icons[idx] || DollarSign;
            
            return (
              <div key={idx} className="bg-white p-3 md:p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">{card.title}</div>
                  <div className="text-lg md:text-2xl lg:text-3xl font-black text-stone-900 leading-tight truncate">{fmt(value, 'LKR')}</div>
                  {card.note && <div className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 hidden md:block">{card.note}</div>}
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border shrink-0 mt-2 md:mt-0`}
                     style={{ backgroundColor: `${iconColors[idx]}15`, borderColor: `${iconColors[idx]}30`, color: iconColors[idx] }}>
                  <Icon size={20} className="md:w-7 md:h-7" />
                </div>
              </div>
            );
          })}
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-stone-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-2">No BKK Operations Data Available</h3>
              <p className="text-sm md:text-base text-stone-500 mb-6">
                Add expense records, tickets, export charges, and apartment bookings in the respective tabs to see data here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Breakdown Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Expense Breakdown */}
              {expenseBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="md:w-[18px] md:h-[18px] text-red-600" /> Expense Categories
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {expenseBreakdown.slice(0, 8).map((item: any) => {
                      const total = expenseBreakdown.reduce((sum: number, e: any) => sum + e.value, 0);
                      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={item.category} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(item.value, 'LKR')}</span>
                            <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ticket Routes Breakdown */}
              {ticketBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Plane size={16} className="md:w-[18px] md:h-[18px] text-red-600" /> Ticket Routes
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {ticketBreakdown.slice(0, 8).map((item: any) => {
                      const total = ticketBreakdown.reduce((sum: number, t: any) => sum + t.value, 0);
                      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={item.route} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{item.route}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(item.value, 'LKR')}</span>
                            <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Export & Apartment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Export Charges Breakdown */}
              {exportBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Package size={16} className="md:w-[18px] md:h-[18px] text-red-600" /> Export Charges
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {exportBreakdown.slice(0, 6).map((item: any) => {
                      const total = exportBreakdown.reduce((sum: number, e: any) => sum + e.value, 0);
                      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={item.authority} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{item.authority}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(item.value, 'LKR')}</span>
                            <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Apartment Breakdown */}
              {apartmentBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6">
                  <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Building2 size={16} className="md:w-[18px] md:h-[18px] text-red-600" /> Apartment Locations
                  </h3>
                  <div className="space-y-2.5 md:space-y-3">
                    {apartmentBreakdown.slice(0, 6).map((item: any) => {
                      const total = apartmentBreakdown.reduce((sum: number, a: any) => sum + a.value, 0);
                      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={item.location} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></div>
                            <span className="text-xs md:text-sm font-medium text-stone-700 truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 sm:w-20 md:w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-pink-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-stone-900 w-20 sm:w-24 text-right shrink-0">{fmt(item.value, 'LKR')}</span>
                            <span className="text-[10px] md:text-xs text-stone-500 w-10 sm:w-12 text-right shrink-0">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Table */}
            {recentActivity.length > 0 && (
              <div className="bg-white rounded-2xl md:rounded-[32px] border border-stone-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-xs md:text-sm font-black text-stone-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Calendar size={16} className="md:w-[18px] md:h-[18px] text-red-600" /> Recent Activity
                </h3>
                
                {/* Mobile: Card Layout */}
                <div className="lg:hidden space-y-3">
                  {recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-stone-900 text-sm mb-1 truncate">{activity.description || '-'}</div>
                          <div className="text-xs text-stone-600">{activity.type} • {activity.date}</div>
                        </div>
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2 bg-red-50 text-red-700">
                          {activity.type}
                        </span>
                      </div>
                      <div className="text-sm font-mono font-bold text-stone-900">{fmt(activity.amount, 'LKR')}</div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table Layout */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                        <th className="p-3">Type</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity: any, idx: number) => (
                        <tr key={idx} className="border-b border-stone-100 hover:bg-red-50/5 transition-colors">
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                              {activity.type}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600 text-sm">{activity.date || '-'}</td>
                          <td className="p-3 font-medium text-stone-900 text-sm">{activity.description || '-'}</td>
                          <td className="p-3 font-mono font-bold text-stone-900 text-sm">{fmt(activity.amount, 'LKR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {config.kpiCards.map((card, idx) => {
          const value = data?.metrics?.[card.key] || 0;
          const isProfitCard = card.key === 'netProfit' || card.key === 'totalProfit' || card.title.toLowerCase().includes('profit');
          const profitValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
          const isPositive = profitValue >= 0;
          
          return (
            <div 
              key={idx} 
              className={`bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
                isProfitCard 
                  ? isPositive 
                    ? 'border-emerald-200' 
                    : 'border-red-200'
                  : 'border-stone-200'
              }`}
            >
               <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: config.themeColor, opacity: 0.7}}></div>
               <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{card.title}</span>
                  {getTrendIcon(card.trend, value)}
               </div>
               <div className={`text-2xl font-bold mb-1 truncate ${
                 isProfitCard 
                   ? isPositive 
                     ? 'text-emerald-600' 
                     : 'text-red-600'
                   : 'text-stone-900'
               }`}>
                 {fmt(value, card.currency)}
               </div>
               {card.note && <div className="text-[10px] text-stone-400 font-medium">{card.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};