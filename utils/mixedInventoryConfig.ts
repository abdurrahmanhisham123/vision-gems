
export interface MixedInventoryConfig {
  moduleId: string;
  tabName: string;
  inventoryType: string;
  themeColor: string;
  varieties: string[];
  hasManualNumbering: boolean;
  allowsGaps: boolean;
  supportsLots: boolean;
  codeFormat?: RegExp | string;
  defaultStatus?: string;
  
  // Special columns
  hasCostColumn?: boolean;
  hasCutPolishColumn?: boolean;
}

export const MIXED_INVENTORY_CONFIGS: MixedInventoryConfig[] = [
  // 1. Approval (Vision Gems)
  {
    moduleId: "vision-gems",
    tabName: "Approval",
    inventoryType: "Approval/Pending Stones",
    themeColor: "#F59E0B", // Amber
    varieties: [
      "Spinel",
      "Ruby",
      "Lavender",
      "Garandilight",
      "Mixed",
      "Sapphire"
    ],
    hasManualNumbering: false, // Codes are usually AP01 etc, simpler to treat as code than sequential number
    allowsGaps: true,
    supportsLots: false,
    codeFormat: /^AP\d{2,}$/,
    defaultStatus: 'approval',
    hasCostColumn: true,
    hasCutPolishColumn: true
  }
];

export const getMixedInventoryConfig = (moduleId: string, tabId: string): MixedInventoryConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return MIXED_INVENTORY_CONFIGS.find(c => 
    c.moduleId === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
