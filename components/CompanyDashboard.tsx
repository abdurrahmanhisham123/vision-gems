import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw, FileText, DollarSign, TrendingUp, Package, 
  ShoppingCart, Users, ArrowLeft, Gem, Wallet, CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { getCompanyMetrics, CompanyMetrics } from '../services/companyDashboardService';
import { MetricCard } from './charts/MetricCard';
import { ChartCard } from './charts/ChartCard';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];

export const CompanyDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, [refreshKey]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await getCompanyMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load company metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="font-medium animate-pulse">Loading Company Dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <p>No data available</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight uppercase">
            Vision Gems Company Dashboard
          </h1>
          <p className="text-stone-500 mt-2 text-sm md:text-base">
            Comprehensive overview of all operations, finances, and inventory
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <Link 
            to="/statement"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:from-purple-700 hover:to-purple-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <FileText size={18} /> View Complete Statement
          </Link>
          <button 
            onClick={handleRefresh} 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Financial Overview Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Financial Overview</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.financial.totalRevenue}
            currency="LKR"
            trend={metrics.financial.totalRevenue > 0 ? 'up' : 'stable'}
            icon={DollarSign}
            iconColor="#10B981"
            valueColor="#10B981"
          />
          <MetricCard
            title="Total Expenses"
            value={metrics.financial.totalExpenses}
            currency="LKR"
            trend={metrics.financial.totalExpenses > 0 ? 'down' : 'stable'}
            icon={TrendingUp}
            iconColor="#EF4444"
            valueColor="#EF4444"
          />
          <MetricCard
            title="Net Profit"
            value={metrics.financial.netProfit}
            currency="LKR"
            trend={metrics.financial.netProfit > 0 ? 'up' : metrics.financial.netProfit < 0 ? 'down' : 'stable'}
            icon={TrendingUp}
            iconColor={metrics.financial.netProfit >= 0 ? "#10B981" : "#EF4444"}
            valueColor={metrics.financial.netProfit >= 0 ? "#10B981" : "#EF4444"}
          />
          <MetricCard
            title="Cash Balance"
            value={metrics.financial.cashBalance}
            currency="LKR"
            icon={Wallet}
            iconColor="#6366F1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Revenue vs Expenses Trend" subtitle="Last 12 months">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.financial.revenueTrends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Expense Breakdown" subtitle="By category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.financial.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {metrics.financial.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Expenses by Module" subtitle="Module-wise breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.financial.moduleExpenses}>
              <XAxis dataKey="module" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Inventory Metrics Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Inventory Metrics</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Stones"
            value={metrics.inventory.totalStones}
            icon={Gem}
            iconColor="#6366F1"
          />
          <MetricCard
            title="In Stock"
            value={metrics.inventory.inStockCount}
            icon={Package}
            iconColor="#10B981"
          />
          <MetricCard
            title="Sold"
            value={metrics.inventory.soldCount}
            icon={ShoppingCart}
            iconColor="#3B82F6"
          />
          <MetricCard
            title="Inventory Value"
            value={metrics.inventory.inventoryValue}
            currency="LKR"
            icon={DollarSign}
            iconColor="#F59E0B"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Status Distribution" subtitle="Stone status breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.inventory.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.inventory.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Varieties" subtitle="By inventory value">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.inventory.varietyBreakdown}>
                <XAxis dataKey="variety" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Outstanding & Payables Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Outstanding & Payables</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Outstanding"
            value={metrics.outstanding.totalOutstanding}
            currency="LKR"
            icon={Users}
            iconColor="#3B82F6"
          />
          <MetricCard
            title="Total Payables"
            value={metrics.outstanding.totalPayables}
            currency="LKR"
            icon={CreditCard}
            iconColor="#EF4444"
          />
          <MetricCard
            title="Payments Received"
            value={metrics.outstanding.paymentsReceived}
            currency="LKR"
            icon={Wallet}
            iconColor="#10B981"
          />
        </div>

        {metrics.outstanding.outstandingByCustomer.length > 0 && (
          <ChartCard title="Top Customers with Outstanding" subtitle="Top 10 customers">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.outstanding.outstandingByCustomer}>
                <XAxis dataKey="customer" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Operations Overview Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Operations Overview</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <MetricCard
            title="Total Purchases"
            value={metrics.operations.totalPurchases}
            currency="LKR"
            icon={ShoppingCart}
            iconColor="#F59E0B"
          />
          <MetricCard
            title="Total Exports"
            value={metrics.operations.totalExports}
            currency="LKR"
            icon={Package}
            iconColor="#8B5CF6"
          />
          <MetricCard
            title="Capital Transactions"
            value={metrics.operations.capitalTransactions}
            currency="LKR"
            icon={TrendingUp}
            iconColor="#14B8A6"
          />
        </div>

        {metrics.operations.expenseByCategory.length > 0 && (
          <ChartCard title="Expenses by Category" subtitle="Operational expense breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.operations.expenseByCategory}>
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
};



