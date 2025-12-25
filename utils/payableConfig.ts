
export interface PayableConfig {
  tabName: string;
  moduleId: string;
  location: string;
  themeColor: string;
  currency: string;
  
  // Stats (Mock targets)
  totalPurchased?: number;
  totalPaid?: number;
  totalOwed?: number;
  
  // Features
  hasMultipleSuppliers: boolean;
  hasCompanyColumn: boolean;
  showSupplierBreakdown: boolean;
  
  // Specific Data
  suppliers?: { name: string; purchased: number; owed: number }[];
  
  isTemplate?: boolean;
  isEmpty?: boolean;
}

export const PAYABLE_CONFIGS: PayableConfig[] = [
  // --- Buying Payments Paid (New) ---
  {
    tabName: "Buying.Payments.Paid",
    moduleId: "payable",
    location: "Buying Payments",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 45000000,
    totalPaid: 45000000,
    totalOwed: 0,
    hasMultipleSuppliers: true,
    hasCompanyColumn: true,
    showSupplierBreakdown: true,
    suppliers: [
      { name: "Mashaka", purchased: 15000000, owed: 0 },
      { name: "Juma", purchased: 12000000, owed: 0 }
    ]
  },
  {
    tabName: "Beruwala",
    moduleId: "payable",
    location: "Beruwala (Sri Lanka)",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 310000,
    totalPaid: 310000,
    totalOwed: 0,
    hasMultipleSuppliers: false,
    hasCompanyColumn: true,
    showSupplierBreakdown: false,
    suppliers: [{ name: "Shafras", purchased: 310000, owed: 0 }]
  },
  {
    tabName: "Colombo",
    moduleId: "payable",
    location: "Colombo (Sri Lanka)",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 0,
    totalPaid: 0,
    totalOwed: 0,
    hasMultipleSuppliers: false,
    hasCompanyColumn: true,
    showSupplierBreakdown: false,
    isEmpty: true
  },
  {
    tabName: "Galle",
    moduleId: "payable",
    location: "Galle (Sri Lanka)",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 3255000,
    totalPaid: 3255000,
    totalOwed: 0,
    hasMultipleSuppliers: true,
    hasCompanyColumn: true,
    showSupplierBreakdown: true,
    suppliers: [
      { name: "Muhdeen moulavi", purchased: 2850000, owed: 0 },
      { name: "Rismy", purchased: 250000, owed: 0 },
      { name: "Rizvi papa", purchased: 155000, owed: 0 }
    ]
  },
  {
    tabName: "Kisu",
    moduleId: "payable",
    location: "Kisu (Tanzania)",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 29277955,
    totalPaid: 26427955,
    totalOwed: 2850000,
    hasMultipleSuppliers: true,
    hasCompanyColumn: false,
    showSupplierBreakdown: true,
    suppliers: [
      { name: "Mashaka", purchased: 8250000, owed: 750000 },
      { name: "Halfan", purchased: 6180000, owed: 0 },
      { name: "Abubakkar", purchased: 4520000, owed: 420000 },
      { name: "Salum", purchased: 3890000, owed: 0 },
      { name: "Yusuph", purchased: 2650000, owed: 650000 },
      { name: "Omari", purchased: 1850000, owed: 350000 },
      { name: "Juma", purchased: 1200000, owed: 680000 },
      { name: "Daniel", purchased: 737955, owed: 0 }
    ]
  },
  {
    tabName: "Bangkok",
    moduleId: "payable",
    location: "Bangkok (Thailand)",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 1125000,
    totalPaid: 1125000,
    totalOwed: 0,
    hasMultipleSuppliers: false,
    hasCompanyColumn: false,
    showSupplierBreakdown: false,
    suppliers: [
      { name: "Imran Shinna Haj", purchased: 1125000, owed: 0 }
    ]
  },
  {
    tabName: "Name",
    moduleId: "payable",
    location: "Template Location",
    themeColor: "#DC2626",
    currency: "LKR",
    totalPurchased: 0,
    totalPaid: 0,
    totalOwed: 0,
    hasMultipleSuppliers: false,
    hasCompanyColumn: true,
    showSupplierBreakdown: false,
    isEmpty: true,
    isTemplate: true
  }
];

export const getPayableConfig = (moduleId: string, tabId: string): PayableConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return PAYABLE_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
