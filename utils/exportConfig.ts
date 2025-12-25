
export type ExportType = "tanzania_export" | "other_export";

export interface ExportConfig {
  tabName: string;
  module: string;
  exportType: ExportType;
  themeColor: string;
  location: string;
  currency: string;
  
  // Type A specific (Tanzania)
  convertTo?: string;
  exchangeRate?: number;
  hasCurrencyConversion?: boolean;
  hasWeightTracking?: boolean;
  hasExchangeRate?: boolean;
  showDualCurrency?: boolean;
  
  // Type B specific (Other)
  hasExportCode?: boolean;
  hasAuthorityName?: boolean;
  
  // Common
  description?: string;
  showTotal?: boolean;
}

export const EXPORT_CONFIGS: ExportConfig[] = [
  // --- Type A: Tanzania Export Charges ---
  {
    tabName: "T.export",
    module: "dada",
    exportType: "tanzania_export",
    themeColor: "#F59E0B",
    location: "Tanzania",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.1251,
    hasCurrencyConversion: true,
    hasWeightTracking: true, // grams
    hasExchangeRate: true,
    showDualCurrency: true
  },
  {
    tabName: "T.export",
    module: "vg-ramazan",
    exportType: "tanzania_export",
    themeColor: "#F59E0B",
    location: "Tanzania",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.1252,
    hasCurrencyConversion: true,
    hasWeightTracking: true,
    hasExchangeRate: true,
    showDualCurrency: true
  },
  {
    tabName: "T.export",
    module: "vgtz", // Mahenge
    exportType: "tanzania_export",
    themeColor: "#F59E0B",
    location: "Tanzania",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.1244,
    hasCurrencyConversion: true,
    hasWeightTracking: true,
    hasExchangeRate: true,
    showDualCurrency: true
  },
  
  // --- Type B: Other Export Charges ---
  {
    tabName: "Export",
    module: "kenya",
    exportType: "other_export",
    themeColor: "#F59E0B",
    location: "Kenya",
    currency: "LKR",
    description: "Import/Export Charges",
    hasExportCode: true,
    hasAuthorityName: true,
    showTotal: true
  },
  {
    tabName: "MExport",
    module: "madagascar",
    exportType: "other_export",
    themeColor: "#F59E0B",
    location: "Madagascar",
    currency: "LKR",
    description: "Madagascar Export Charges",
    hasExportCode: true,
    showTotal: true
  },
  {
    tabName: "BKKExport",
    module: "spinel-gallery",
    exportType: "other_export",
    themeColor: "#F59E0B",
    location: "Bangkok",
    currency: "LKR",
    description: "Bangkok Export Charges",
    hasExportCode: true,
    showTotal: true
  }
];

export const getExportConfig = (moduleId: string, tabId: string): ExportConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return EXPORT_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
