
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
    tabName: "SG.Payment.Received",
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
    tabName: "Madagascar.Payment.Received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "Madagascar",
    companyCode: "SG-M",
    totalReceived: 6323122.74,
    showTopCustomers: true
  },
  {
    tabName: "K.Payment.Received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "Kenya",
    companyCode: "K",
    totalReceived: 10835050.33,
    showTopCustomers: true
  },
  {
    tabName: "VG.R.payment.received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "VG Ramazan",
    companyCode: "VGR",
    totalReceived: 18885926,
    showTopCustomers: true
  },
  {
    tabName: "VG.Payment.Received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "Vision Gems",
    companyCode: "VG",
    totalReceived: 10640846.66,
    showTopCustomers: true
  },
  {
    tabName: "VG.T.Payment.Received",
    moduleId: "outstanding",
    ledgerType: "company_summary",
    themeColor: "#059669",
    companyName: "VG Tanzania",
    companyCode: "VG-T",
    totalReceived: 12835260.31,
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

  // --- TYPE B: INDIVIDUAL CUSTOMER LEDGERS (27 Tabs) ---
  {
    tabName: "Zahran",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Zahran",
    totalSold: 19400584,
    totalOutstanding: 37540,
    hasMultiCompany: true,
    breakdown: [
       { label: "SG", amount: 12580000 },
       { label: "VG", amount: 4320584 },
       { label: "VG-T", amount: 2500000 }
    ]
  },
  {
    tabName: "RuzaikSales",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Ruzaik Sales",
    totalSold: 7467471,
    hasMultiCompany: false
  },
  {
    tabName: "BeruwalaSales",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Beruwala Sales",
    totalSold: 957000
  },
  {
    tabName: "SajithOnline",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Sajith Online",
    totalSold: 1485500
  },
  {
    tabName: "Ziyam",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Ziyam",
    totalSold: 16141500,
    hasMultiCompany: true
  },
  {
    tabName: "InfazHaji",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Infaz Haji",
    totalSold: 2930000
  },
  {
    tabName: "NusrathAli",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Nusrath Ali",
    totalSold: 3065000,
    hasMultiCompany: true
  },
  {
    tabName: "Binara",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Binara",
    totalSold: 1687000
  },
  {
    tabName: "MikdarHaji",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Mikdar Haji",
    totalSold: 1584995,
    hasMultiCompany: true
  },
  {
    tabName: "RameesNana",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Ramees Nana",
    totalSold: 0,
    isPlaceholder: true
  },
  {
    tabName: "Shimar",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Shimar",
    totalSold: 225000
  },
  {
    tabName: "Ruqshan",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Ruqshan",
    totalSold: 400000,
    hasMultiCompany: true
  },
  {
    tabName: "FaizeenHaj",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Faizeen Haj",
    totalSold: 2025000
  },
  {
    tabName: "SharikHaj",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Sharik Haj",
    totalSold: 0,
    isPlaceholder: true
  },
  {
    tabName: "Fazeel",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Fazeel",
    totalSold: 2515000,
    hasMultiCompany: true
  },
  {
    tabName: "AzeemColo",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Azeem Colo",
    totalSold: 0,
    isPlaceholder: true
  },
  {
    tabName: "Kadarhaj.colo",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Kadar Haj Colo",
    totalSold: 1424500
  },
  {
    tabName: "AlthafHaj",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Althaf Haj",
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
    tabName: "Sadam bkk",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Sadam BKK",
    totalSold: 107450,
    weight: 21.98
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
    tabName: "Eleven",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Eleven",
    totalSold: 495000
  },
  {
    tabName: "AndyBuyer",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Andy Buyer",
    totalSold: 0,
    isPlaceholder: true
  },
  {
    tabName: "FlightBuyer",
    moduleId: "outstanding",
    ledgerType: "individual_customer",
    themeColor: "#059669",
    customerName: "Flight Buyer",
    totalSold: 0,
    isPlaceholder: true
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
