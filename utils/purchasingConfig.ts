
export interface PurchasingConfig {
  tabName: string;
  module: string;
  location: string;
  themeColor: string;
  
  // Stats Targets (for mock generation)
  targetTotalCost?: number;
  targetTotalWeight?: number;
  targetTotalStones?: number;
  
  // Defaults & Settings
  primaryVariety: string;
  primarySupplier?: string; // If single supplier
  codePrefix: string;
  currency: string;
  
  // Feature Flags
  hasPaymentStatus: boolean;
  hasColorGrade: boolean;
  
  // Display Options
  showTotal: boolean;
  groupBySupplier: boolean;
  isLargePurchases?: boolean;
}

export const PURCHASING_CONFIGS: PurchasingConfig[] = [
  // 1. Kenya Purchasing (KPurchasing)
  {
    tabName: "KPurchasing",
    module: "kenya",
    location: "Kenya",
    themeColor: "#8B5CF6", // Purple
    targetTotalCost: 2292700,
    targetTotalStones: 161,
    targetTotalWeight: 505.72,
    primaryVariety: "TSV",
    codePrefix: "K-TS",
    currency: "LKR",
    hasPaymentStatus: true,
    hasColorGrade: false,
    showTotal: true,
    groupBySupplier: true
  },
  
  // 2. Madagascar Purchasing (MPurchasing)
  {
    tabName: "MPurchasing",
    module: "madagascar",
    location: "Madagascar",
    themeColor: "#8B5CF6",
    targetTotalWeight: 226.95,
    primaryVariety: "Moonstone",
    primarySupplier: "Azeem",
    codePrefix: "SPM",
    currency: "LKR",
    hasPaymentStatus: false,
    hasColorGrade: true,
    showTotal: true,
    groupBySupplier: false
  },
  
  // 3. Spinel Gallery Purchasing (Purchasing)
  {
    tabName: "Purchasing",
    module: "spinel-gallery",
    location: "Spinel Gallery",
    themeColor: "#8B5CF6",
    targetTotalCost: 167108000,
    primaryVariety: "Mahenge Spinel",
    codePrefix: "SG-PUR",
    currency: "LKR",
    hasPaymentStatus: false,
    hasColorGrade: false,
    showTotal: true,
    groupBySupplier: true,
    isLargePurchases: true
  }
];

export const getPurchasingConfig = (moduleId: string, tabId: string): PurchasingConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return PURCHASING_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
