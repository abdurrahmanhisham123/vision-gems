
export type ReferenceType = 'shape_catalog' | 'important_notes';

export interface ReferenceDataConfig {
  tabName: string;
  module: string;
  referenceType: ReferenceType;
  themeColor: string;
  isEmpty: boolean;
  isPlaceholder: boolean;
  emptyStateMessage?: string;
  suggestedShapes?: { name: string; abbr: string }[];
}

export const REFERENCE_DATA_CONFIGS: ReferenceDataConfig[] = [
  // Type A: Empty Shape Catalogs
  {
    tabName: "Stone Shapes",
    module: "spinel-gallery",
    referenceType: "shape_catalog",
    themeColor: "#6366F1",
    isEmpty: true,
    isPlaceholder: true,
    emptyStateMessage: "This tab is ready for stone shape reference data.",
    suggestedShapes: [
      { name: "Round", abbr: "RD" },
      { name: "Oval", abbr: "OV" },
      { name: "Cushion", abbr: "CU" },
      { name: "Emerald Cut", abbr: "EM" },
      { name: "Pear", abbr: "PR" },
      { name: "Heart", abbr: "HT" },
      { name: "Marquise", abbr: "MQ" },
      { name: "Princess", abbr: "PC" }
    ]
  },
  {
    tabName: "Stone Shape",
    module: "vision-gems",
    referenceType: "shape_catalog",
    themeColor: "#6366F1",
    isEmpty: true,
    isPlaceholder: true,
    emptyStateMessage: "This tab is ready for stone shape reference data.",
    suggestedShapes: [
      { name: "Round", abbr: "RD" },
      { name: "Oval", abbr: "OV" },
      { name: "Cushion", abbr: "CU" },
      { name: "Emerald Cut", abbr: "EM" },
      { name: "Pear", abbr: "PR" },
      { name: "Heart", abbr: "HT" },
      { name: "Marquise", abbr: "MQ" },
      { name: "Princess", abbr: "PC" }
    ]
  },
  
  // Type B: Important Notes
  {
    tabName: "Important",
    module: "spinel-gallery",
    referenceType: "important_notes",
    themeColor: "#6366F1",
    isEmpty: false,
    isPlaceholder: false
  }
];

export const getReferenceDataConfig = (moduleId: string, tabId: string): ReferenceDataConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return REFERENCE_DATA_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
