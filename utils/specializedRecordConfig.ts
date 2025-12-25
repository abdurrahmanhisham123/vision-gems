
export type SpecializedRecordType = 
  | "car_expenses" 
  | "purchasing_record" 
  | "cut_polish" 
  | "bangkok_export" 
  | "inventory_template";

export interface SpecializedRecordConfig {
  tabName: string;
  moduleId: string;
  recordType: SpecializedRecordType;
  themeColor: string;
  
  // Features
  hasPaymentStatus?: boolean;
  hasCurrencyConversion?: boolean;
  hasSellingStatus?: boolean;
  isEmpty?: boolean;
  isTemplate?: boolean;
  showTotal?: boolean;
  
  // Specific Data Context
  currency?: string;
  targetCurrency?: string;
  exchangeRate?: number;
  
  // Totals (for header)
  totalAmount?: number;
  projectedTotal?: number;
  totalWeight?: number;
  totalPieces?: number;
  
  // Metadata
  primaryEntity?: string; // Payer, Supplier, etc.
  description?: string;
}

export const SPECIALIZED_RECORD_CONFIGS: SpecializedRecordConfig[] = [
  // 1. Zcar (AllExpenses)
  {
    tabName: "Zcar",
    moduleId: "all-expenses",
    recordType: "car_expenses",
    themeColor: "#EC4899",
    totalAmount: 3983175, // Calculated from non-projected items
    projectedTotal: 5551393, // Full total
    primaryEntity: "Ziyam",
    description: "Car expense tracking for A3",
    currency: "LKR",
    showTotal: true
  },
  // 2. 202412 (Dada)
  {
    tabName: "202412",
    moduleId: "dada",
    recordType: "purchasing_record",
    themeColor: "#EC4899",
    currency: "TZS",
    targetCurrency: "LKR",
    exchangeRate: 0.126, 
    totalAmount: 15330000, 
    totalPieces: 12,
    hasPaymentStatus: true,
    hasCurrencyConversion: true,
    showTotal: true
  },
  // 3. CutPolish (Kenya)
  {
    tabName: "CutPolish",
    moduleId: "kenya",
    recordType: "cut_polish",
    themeColor: "#EC4899",
    totalAmount: 95525,
    totalWeight: 191,
    primaryEntity: "Azeem",
    currency: "LKR",
    description: "TSV Cutting Services",
    showTotal: true
  },
  // 4. Cut.and.polish (VGTZ)
  {
    tabName: "Cut.and.polish",
    moduleId: "vgtz",
    recordType: "cut_polish",
    themeColor: "#EC4899",
    currency: "TZS",
    isEmpty: true,
    isTemplate: true,
    description: "No cut & polish records yet. Click + Add Expense to start."
  },
  // 5. Z (Vision Gems)
  {
    tabName: "Z",
    moduleId: "vision-gems",
    recordType: "inventory_template",
    themeColor: "#EC4899",
    isEmpty: true,
    isTemplate: true,
    description: "No inventory records yet. This is a template tab."
  }
];

export const getSpecializedRecordConfig = (moduleId: string, tabId: string): SpecializedRecordConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return SPECIALIZED_RECORD_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
