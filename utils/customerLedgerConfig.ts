
export type LedgerType = 'company_summary' | 'individual_customer';

export interface CustomerLedgerConfig {
  tabName: string;
  moduleId: string;
  ledgerType: LedgerType;
  themeColor: string;
  
  // Type A (Company Summary)
  companyName?: string;
  companyCode?: string;
  totalReceived?: number;
  totalTransactions?: number;
  uniqueCustomers?: number;
  showTopCustomers?: boolean;
  
  // Type B (Individual Customer)
  customerName?: string;
  totalSold?: number;
  totalOutstanding?: number;
  hasMultiCompany?: boolean;
  hasMultiCurrency?: boolean;
  weight?: number; // Optional weight override for display
  
  // Shared
  breakdown?: { label: string; amount: number }[];
  isPlaceholder?: boolean;
  isTemplate?: boolean;
}

export const CUSTOMER_LEDGER_CONFIGS: CustomerLedgerConfig[] = [
  // --- TYPE A: COMPANY PAYMENT SUMMARIES (7 Tabs) ---
  {
    tabName: "Payment Received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "Spinel Gallery",
    companyCode: "SG",
    totalReceived: 37372045.85,
    totalTransactions: 287,
    uniqueCustomers: 18,
    showTopCustomers: true
  },
  {
    tabName: "Payment.received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "All Companies",
    totalReceived: 37118347.86,
    breakdown: [
      { label: "SG", amount: 25415168.57 },
      { label: "VG", amount: 1843217 },
      { label: "K", amount: 7113747.12 },
      { label: "SG-M", amount: 2746215.17 }
    ]
  },

  // --- TYPE B: INDIVIDUAL CUSTOMER LEDGERS ---
  {
    tabName: "SrilankaSales",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Srilanka Sales",
    totalSold: 7467471,
    hasMultiCompany: false
  },
  {
    tabName: "Outstanding Receivables",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Outstanding Receivables",
    totalSold: 559250,
    hasMultiCompany: true
  },
  {
    tabName: "BangkokSales",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Bangkok Sales",
    totalSold: 6283271
  },
  {
    tabName: "ChinaSales",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "China Sales",
    totalSold: 6237190
  },
  {
    tabName: "Name",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Template",
    totalSold: 0,
    isPlaceholder: true,
    isTemplate: true
  },
  {
    tabName: "Name1",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Template 2",
    totalSold: 0,
    isPlaceholder: true,
    isTemplate: true
  },
  {
    tabName: "Bangkok",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Bangkok Sales (Alt)",
    totalSold: 9277299.47,
    hasMultiCurrency: true
  },
  {
    tabName: "Dashboard", // Mapped via dashboard system but included here for completion if needed
    moduleId: "outstanding",
    ledgerType: "company_summary", // actually dashboard
    themeColor: "#DC2626",
    customerName: "Dashboard",
    isPlaceholder: true
  }
];

export const getCustomerLedgerConfig = (moduleId: string, tabId: string): CustomerLedgerConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return CUSTOMER_LEDGER_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
