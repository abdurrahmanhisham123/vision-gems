
export type WorkingSheetType = 
  | "capital_tracking" 
  | "statement" 
  | "inventory_backup" 
  | "transaction_log" 
  | "expense_template" 
  | "export_list";

export interface WorkingSheetConfig {
  tabName: string;
  moduleId: string;
  sheetType: WorkingSheetType;
  themeColor: string;
  
  // Content
  title?: string;
  description?: string;
  
  // Features
  hasRunningBalance?: boolean;
  hasCurrencyConversion?: boolean;
  hasInventoryDetails?: boolean;
  hasInOutColumns?: boolean;
  isTemplate?: boolean;
  isEmpty?: boolean;
  
  // Display
  showTotal: boolean;
  isReadOnly?: boolean; // Some might be backups (read-only)
}

export const WORKING_SHEET_CONFIGS: WorkingSheetConfig[] = [
  // 1. Sheet19 (AllExpenses) - Capital Tracking + Statement
  {
    tabName: "Sheet19",
    moduleId: "all-expenses",
    sheetType: "capital_tracking",
    themeColor: "#64748B", // Slate
    title: "Capital Tracking & Statement",
    description: "Track capital sources and daily transactions with running balance.",
    hasRunningBalance: true,
    showTotal: true
  },
  
  // 2. Sheet21 (AllExpenses) - Transaction Log
  {
    tabName: "Sheet21",
    moduleId: "all-expenses",
    sheetType: "transaction_log",
    themeColor: "#64748B",
    title: "Transaction Log",
    description: "General log of financial transactions.",
    hasRunningBalance: false,
    showTotal: true
  },
  
  // 3. Sheet23 (AllExpenses) - Financial Statement (IN/OUT)
  {
    tabName: "Sheet23",
    moduleId: "all-expenses",
    sheetType: "statement",
    themeColor: "#64748B",
    title: "Financial Statement",
    description: "Comprehensive IN/OUT statement with running balance calculation.",
    hasRunningBalance: true,
    hasInOutColumns: true,
    showTotal: true
  },
  
  // 4. Sheet19 (Kenya) - Expense Template
  {
    tabName: "Sheet19",
    moduleId: "kenya",
    sheetType: "expense_template",
    themeColor: "#64748B",
    title: "Kenya Expenses Template",
    description: "Template for tracking Kenya-specific operational expenses.",
    hasCurrencyConversion: true,
    isTemplate: true,
    isEmpty: true,
    showTotal: false
  },
  
  // 5. Copy of Mahenge (SpinelGallery) - Inventory Backup
  {
    tabName: "Copy of Mahenge",
    moduleId: "spinel-gallery",
    sheetType: "inventory_backup",
    themeColor: "#64748B",
    title: "Mahenge Inventory Backup",
    description: "Complete backup of Mahenge spinel inventory stocks.",
    hasInventoryDetails: true,
    showTotal: true,
    isReadOnly: true
  },
  
  // 6. Sheet10 (VG_Exporting) - Export Inventory List
  {
    tabName: "Sheet10",
    moduleId: "vg-exporting",
    sheetType: "export_list",
    themeColor: "#64748B",
    title: "Export Inventory List",
    description: "Stone list prepared for export.",
    showTotal: true
  }
];

export const getWorkingSheetConfig = (moduleId: string, tabId: string): WorkingSheetConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return WORKING_SHEET_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
