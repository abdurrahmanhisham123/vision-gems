
export type DashboardType = "inventory" | "financial" | "expenses" | "mixed" | "payable";

export interface KPICardConfig {
  title: string;
  key: string; // Data key
  currency?: string;
  sourceTab?: string;
  trend?: "up" | "down" | "stable";
  change?: string;
  note?: string;
  value?: string;
  color?: string; // Hex color for specific styling
}

export interface DashboardConfig {
  tabName: string;
  module: string;
  dashboardType: DashboardType;
  themeColor: string;
  location?: string;
  
  kpiCards: KPICardConfig[];
  
  // Feature Flags
  hasInventoryMetrics?: boolean;
  hasExpenseBreakdown?: boolean;
  hasProfitCalculation?: boolean;
  hasShareDistribution?: boolean;
  hasMonthlyTrends?: boolean;
  hasOutstandingTracking?: boolean;
  hasPayableTracking?: boolean;
  hasSupplierBreakdown?: boolean;
  hasMultiCurrency?: boolean;
  
  dataKey: string; // For mock service mapping
}

export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  // --- Type A: Inventory Dashboards (5 tabs) ---
  {
    tabName: "Dashboard",
    module: "dada",
    dashboardType: "inventory",
    themeColor: "#7C3AED",
    location: "Tanzania Mahenge",
    dataKey: "dada_dashboard",
    hasInventoryMetrics: true,
    hasExpenseBreakdown: true,
    hasMultiCurrency: true,
    hasProfitCalculation: true,
    kpiCards: [
      { title: "In Stock Cost", key: "inStockCost", sourceTab: "Instock" },
      { title: "Total Sales", key: "totalSales", sourceTab: "Sold" },
      { title: "Outstanding", key: "outstanding", sourceTab: "Outstanding" },
      { title: "Payment Received", key: "received", sourceTab: "Payment" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" }
    ]
  },
  {
    tabName: "VG.T Dashboard",
    module: "vgtz",
    dashboardType: "inventory",
    themeColor: "#7C3AED",
    location: "Tanzania",
    dataKey: "vgtz_dashboard",
    hasInventoryMetrics: true,
    hasExpenseBreakdown: true,
    hasMultiCurrency: true,
    hasProfitCalculation: true,
    kpiCards: [
      { title: "In Stock Cost", key: "inStockCost", sourceTab: "VG.T.Instock" },
      { title: "Total Sales", key: "totalSales", sourceTab: "Sold" },
      { title: "Outstanding", key: "outstanding", sourceTab: "Outstanding" },
      { title: "Payment Received", key: "received", sourceTab: "Payment" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" }
    ]
  },
  {
    tabName: "KDashboard",
    module: "kenya",
    dashboardType: "inventory",
    themeColor: "#7C3AED",
    location: "Kenya",
    dataKey: "kenya_dashboard",
    hasInventoryMetrics: true,
    hasExpenseBreakdown: true,
    hasShareDistribution: true,
    hasProfitCalculation: true,
    kpiCards: [
      { title: "In Stock Cost", key: "inStockCost", currency: "LKR" },
      { title: "Total Sales", key: "totalSales", currency: "LKR" },
      { title: "Payment Received", key: "received", currency: "LKR" },
      { title: "VG Commission", key: "commission", currency: "LKR", note: "10%" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" }
    ]
  },
  {
    tabName: "VGRZ.Dashboard",
    module: "vg-ramazan",
    dashboardType: "inventory",
    themeColor: "#7C3AED",
    location: "VG Ramazan",
    dataKey: "vgrz_dashboard",
    hasInventoryMetrics: true,
    hasExpenseBreakdown: true,
    hasProfitCalculation: true,
    kpiCards: [
      { title: "Cost (In Stock)", key: "inStockCost", sourceTab: "Instock" },
      { title: "Total Sales", key: "totalSales", sourceTab: "Sold" },
      { title: "Outstanding", key: "outstanding", sourceTab: "Outstanding" },
      { title: "Payment Received", key: "received", sourceTab: "Payment" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" }
    ]
  },
  {
    tabName: "MDashboard",
    module: "madagascar",
    dashboardType: "inventory",
    themeColor: "#7C3AED",
    location: "Madagascar",
    dataKey: "madagascar_dashboard",
    hasInventoryMetrics: true,
    hasExpenseBreakdown: true,
    hasProfitCalculation: true,
    kpiCards: [
      { title: "Cost (In Stock)", key: "inStockCost", currency: "LKR" },
      { title: "Total Sales", key: "totalSales", currency: "LKR" },
      { title: "Outstanding", key: "outstanding", sourceTab: "Outstanding" },
      { title: "Payment Received", key: "received", currency: "LKR" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" }
    ]
  },

  // --- Type B: Financial Dashboards (4 tabs) ---
  {
    tabName: "DashboardGEMS",
    module: "spinel-gallery",
    dashboardType: "financial",
    themeColor: "#059669",
    dataKey: "spinel_main_dashboard",
    hasProfitCalculation: true,
    hasShareDistribution: true,
    kpiCards: [
      { title: "Total Cost", key: "totalCost", sourceTab: "Multiple" },
      { title: "Total Sales", key: "totalSales", sourceTab: "Multiple" },
      { title: "Total Profit", key: "totalProfit", trend: "up", change: "+12%" },
      { title: "Each Share", key: "eachShare", note: "50/50 split" }
    ]
  },
  {
    tabName: "Dash",
    module: "spinel-gallery",
    dashboardType: "financial",
    themeColor: "#059669",
    dataKey: "spinel_dash",
    hasProfitCalculation: true,
    hasShareDistribution: true,
    hasExpenseBreakdown: true,
    kpiCards: [
      { title: "Revenue", key: "totalSales", change: "+12% vs prev" },
      { title: "Expenses", key: "totalCost", note: "43% of rev" },
      { title: "Outstanding", key: "outstanding", note: "23% pending" },
      { title: "Profit", key: "totalProfit", trend: "up", note: "41% margin" }
    ]
  },
  {
    tabName: "DashboardGems",
    module: "vision-gems",
    dashboardType: "financial",
    themeColor: "#059669",
    dataKey: "vision_gems_dashboard",
    hasMultiCurrency: true,
    hasProfitCalculation: true,
    hasInventoryMetrics: true, // Enabled Rich features
    kpiCards: [
      { title: "Inventory Cost", key: "cost", currency: "LKR" },
      { title: "Sales Revenue", key: "rsSales", currency: "LKR" },
      { title: "Est. Profit", key: "profit", currency: "LKR", trend: "up" },
      { title: "Net Profit", key: "netProfit", currency: "LKR", trend: "auto" },
      { title: "Volume", key: "weight", note: "Total Carats" }
    ]
  },
  {
    tabName: "Dashboard",
    module: "outstanding",
    dashboardType: "financial",
    themeColor: "#6366F1", // Primary Purple from Prompt
    dataKey: "outstanding_dashboard",
    hasOutstandingTracking: true,
    hasMultiCurrency: true,
    kpiCards: [
      { title: "Total Outstanding (LKR)", key: "totalOutstandingLKR", color: "#3B82F6", note: "Aggregated from 27 Customers" }, // Blue
      { title: "Total Outstanding (USD)", key: "totalOutstandingUSD", color: "#10B981", note: "Combined $ Columns" }, // Green
      { title: "Customers with Balance", key: "customerCount", color: "#F59E0B", note: "Active Debtors" }, // Orange
      { title: "Total Payments Received", key: "totalReceived", color: "#6366F1", note: "Across all Payment Tabs" } // Purple
    ]
  },

  // --- Type C: Expense Dashboards (2 tabs) ---
  {
    tabName: "ExDashboard",
    module: "all-expenses",
    dashboardType: "expenses",
    themeColor: "#DC2626",
    dataKey: "all_expenses_dashboard",
    hasShareDistribution: true,
    hasExpenseBreakdown: true,
    kpiCards: [
      { title: "Total Expenses", key: "totalExpenses" },
      { title: "Travel", key: "travelExpenses" },
      { title: "Shares Paid", key: "sharesPaid" },
      { title: "Operational", key: "operationalExpenses" }
    ]
  },
  {
    tabName: "Dashboard",
    module: "bkk",
    dashboardType: "expenses",
    themeColor: "#DC2626",
    dataKey: "bkk_dashboard",
    hasMonthlyTrends: true,
    hasExpenseBreakdown: true,
    kpiCards: [
      { title: "Total Expenses", key: "totalExpenses" },
      { title: "Tickets", key: "tickets", note: "36% of total" },
      { title: "Apartment", key: "apartment", note: "31% of total" },
      { title: "Export", key: "export", note: "11% of total" }
    ]
  },

  // --- Type D: Payable Dashboard (1 tab) ---
  {
    tabName: "Dashboard",
    module: "payable",
    dashboardType: "payable",
    themeColor: "#F59E0B",
    dataKey: "payable_dashboard",
    hasPayableTracking: true,
    hasSupplierBreakdown: true,
    kpiCards: [
      { title: "Total Buying", key: "totalPurchasing" },
      { title: "Amount Owed", key: "payableAmount", trend: "up", note: "89% pending" },
      { title: "Amount Paid", key: "paidAmount", note: "11% paid" },
      { title: "Active Suppliers", key: "activeSuppliers", value: "12" } // value overridden in service if needed
    ]
  }
];

export const getDashboardConfig = (moduleId: string, tabId: string): DashboardConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return DASHBOARD_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
