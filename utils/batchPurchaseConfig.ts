
export interface BatchPurchaseConfig {
  moduleId: string;
  tabName: string;
  batchType: string; // Header title e.g. "Ruby Bangkok Batch"
  themeColor: string; // Hex color
  varieties: string[];
  markers: string[]; // ["•", "*", "x", "-"]
  
  // Type A (Single Batch) Specifics
  batchDate?: string;
  batchReference?: string;
  
  // Type B (Multi-Batch) Specifics
  isMultiBatch?: boolean; // If true, shows date column and implies purchase history
}

export const BATCH_PURCHASE_CONFIGS: BatchPurchaseConfig[] = [
  // --- VGTZ (Mahenge) (Type B) ---
  {
    moduleId: "vgtz",
    tabName: "Purchase",
    batchType: "Tanzania Purchase Records",
    isMultiBatch: true,
    themeColor: "#0891B2", // Teal
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    markers: ["•", "*", "x", "-"]
  },

  // --- Dad (Type B & A) ---
  {
    moduleId: "dada",
    tabName: "Purchase",
    batchType: "Dad Brand Purchase Records",
    isMultiBatch: true,
    themeColor: "#0891B2",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    markers: ["•", "*", "x", "-"]
  },
  {
    moduleId: "dada",
    tabName: "202412",
    batchType: "December 2024 Batch",
    batchDate: "December 2024",
    batchReference: "dad-202412",
    themeColor: "#0891B2",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    markers: ["•", "*", "x", "-"]
  },

  // --- VG Ramazan (Type B) ---
  {
    moduleId: "vg-ramazan",
    tabName: "VGR.purchase",
    batchType: "VG Ramazan Purchase Records",
    isMultiBatch: true,
    themeColor: "#8B5CF6", // Purple
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    markers: ["•", "*", "x", "-"]
  }
];

export const getBatchConfig = (moduleId: string, tabId: string): BatchPurchaseConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return BATCH_PURCHASE_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
