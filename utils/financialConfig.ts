
export type FinancialType = 'usd_capital' | 'supplier_payments' | 'financial_statement';

export interface FinancialConfig {
  tabName: string;
  module: string;
  type: FinancialType;
  themeColor: string;
  currency: string;
  location?: string;
  
  // Type A specific
  tracksCurrency?: boolean;
  hasExchangeRate?: boolean;
  showTotalUSD?: boolean;
  showTotalLKR?: boolean;
  tracksByVendor?: boolean;
  hasKSHTracking?: boolean;
  hasExchangeColumn?: boolean;
  hasUndiyalTracking?: boolean;
  hasCompanyColumn?: boolean;
  hasPaymentMethodColumn?: boolean; // Added
  
  // Type B specific
  hasSupplierTracking?: boolean;
  hasPaymentCode?: boolean;
  hasWeight?: boolean;
  hasStatus?: boolean;
  showTotalPaid?: boolean;
  groupBySupplier?: boolean;
  
  // Type C specific
  hasTransactionType?: boolean; // IN/OUT
  calculatesBalance?: boolean;
  hasRunningTotal?: boolean;
  
  // General
  description?: string;
  month?: string;
  note?: string;
}

export const FINANCIAL_CONFIGS: FinancialConfig[] = [
  // --- Type A: USD Capital Purchases ---
  {
    tabName: "Capital", // Matches "Capital " (trimmed)
    module: "dada", // Copy_of_Dad.xlsx -> dada
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Tanzania",
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true,
    tracksByVendor: true
  },
  {
    tabName: "202412Capital",
    module: "dada",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Tanzania",
    month: "December 2024",
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true,
    tracksByVendor: true
  },
  {
    tabName: "Capital",
    module: "kenya",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Kenya",
    tracksCurrency: true,
    hasKSHTracking: true,
    showTotalUSD: true,
    showTotalLKR: true
  },
  {
    tabName: "T.Capital",
    module: "vg-ramazan",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Tanzania",
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true
  },
  {
    tabName: "MCapital",
    module: "madagascar",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Madagascar",
    hasExchangeColumn: true,
    tracksByVendor: true,
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true
  },
  {
    tabName: "Capital",
    module: "spinel-gallery",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Mixed",
    hasExchangeColumn: true,
    hasUndiyalTracking: true,
    tracksByVendor: true,
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true
  },
  {
    tabName: "T.Capital",
    module: "vgtz",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Tanzania",
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true,
    tracksByVendor: true
  },
  {
    tabName: "Tanzania.Capital",
    module: "payable",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Tanzania",
    hasCompanyColumn: true,
    tracksByVendor: true,
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true,
    hasPaymentMethodColumn: true
  },
  {
    tabName: "Bkkcapital",
    module: "bkk",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Bangkok",
    hasCompanyColumn: true,
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true
  },
  {
    tabName: "BKK.Capital",
    module: "payable",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Bangkok",
    hasCompanyColumn: true,
    tracksCurrency: true,
    hasExchangeRate: true,
    showTotalUSD: true,
    showTotalLKR: true,
    hasPaymentMethodColumn: true
  },

  // --- Type C: Financial Statements ---
  {
    tabName: "BKK.statement",
    module: "bkk",
    type: "financial_statement",
    themeColor: "#7C3AED",
    currency: "LKR",
    hasTransactionType: true,
    calculatesBalance: false,
    location: "Bangkok"
  },
  {
    tabName: "VG.Statement", // Placeholder if it existed
    module: "outstanding", // Guessing or generic
    type: "financial_statement",
    themeColor: "#7C3AED",
    currency: "LKR",
    hasTransactionType: true,
    calculatesBalance: true,
    hasRunningTotal: true
  },

  // --- Type D: Payment Tracking (Variant of Type A) ---
  {
    tabName: "BKK.Payment",
    module: "bkk",
    type: "usd_capital",
    themeColor: "#059669",
    currency: "LKR",
    location: "Bangkok",
    hasCompanyColumn: true,
    tracksCurrency: true,
    description: "Payments made in Bangkok"
  }
];

export const getFinancialConfig = (moduleId: string, tabId: string): FinancialConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return FINANCIAL_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
