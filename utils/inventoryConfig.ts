
import { InventoryConfig } from '../types';

export const INVENTORY_CONFIGS: InventoryConfig[] = [
  // --- VGTZ (Mahenge) ---
  {
    tabName: "VG.T.Instock",
    module: "vgtz",
    gemType: "Mixed Gems",
    themeColor: "#0891B2",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    codeFormat: /^VG-T\d+$/,
    piecesRange: { min: 1, max: 10 },
    hasLots: true,
    origin: "Tanzania",
    lotNames: ["Tanzania Lot 1", "Tanzania Lot 2"]
  },

  // --- Spinel Gallery ---
  {
    tabName: "Mahenge",
    module: "spinel-gallery",
    gemType: "Mahenge Spinel",
    themeColor: "#A855F7",
    varieties: ["Mahenge Spinel", "Pink Spinel", "Red Spinel", "Purple Spinel"],
    codeFormat: /^(SG-|M-)\d+(\*\d+)?$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true,
    lotNames: ["Mahenge Lot 1"]
  },
  {
    tabName: "Spinel",
    module: "spinel-gallery",
    gemType: "Spinel",
    themeColor: "#9333EA",
    varieties: ["Spinel", "Pink Spinel", "Blue Spinel", "Purple Spinel"],
    codeFormat: /^SG-SP\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true,
    lotNames: ["Spinel Lot 1"]
  },
  {
    tabName: "Blue.Sapphire",
    module: "spinel-gallery",
    gemType: "Blue Sapphire",
    themeColor: "#2563EB",
    varieties: ["Blue Sapphire"],
    varietyFixed: true,
    codeFormat: /^SG-BS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true,
    lotNames: ["Sapphire Lot 1"]
  },

  // --- Vision Gems ---
  // Spinel removed from here to allow Specialized Template
  {
    tabName: "TSV",
    module: "vision-gems",
    gemType: "Tsavorite",
    themeColor: "#059669",
    varieties: ["TSV"],
    varietyFixed: true,
    codeFormat: /^VG-TS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "Mandarin.Garnet",
    module: "vision-gems",
    gemType: "Mandarin Garnet",
    themeColor: "#EA580C",
    varieties: ["Mandarin Garnet"],
    varietyFixed: true,
    codeFormat: /^VG-MG\d+$/,
    piecesRange: { min: 1, max: 3 },
    hasLots: true
  },
  {
    tabName: "Garnet",
    module: "vision-gems",
    gemType: "Garnet",
    themeColor: "#991B1B",
    varieties: ["Garnet", "Rhodolite Garnet", "Pyrope Garnet", "Almandine Garnet"],
    codeFormat: /^VG-G\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true
  },
  {
    tabName: "Ruby",
    module: "vision-gems",
    gemType: "Ruby",
    themeColor: "#DC2626",
    varieties: ["Ruby"],
    varietyFixed: true,
    codeFormat: /^VG-R\d+$/,
    piecesRange: { min: 1, max: 3 },
    hasLots: true
  },
  {
    tabName: "Blue.Sapphire",
    module: "vision-gems",
    gemType: "Blue Sapphire",
    themeColor: "#2563EB",
    varieties: ["Blue Sapphire"],
    varietyFixed: true,
    codeFormat: /^VG-BS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "Green.Sapphire",
    module: "vision-gems",
    gemType: "Green Sapphire",
    themeColor: "#10B981",
    varieties: ["Green Sapphire"],
    varietyFixed: true,
    codeFormat: /^VG-GS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "Chrysoberyl",
    module: "vision-gems",
    gemType: "Chrysoberyl",
    themeColor: "#FCD34D",
    varieties: ["Chrysoberyl", "Alexandrite", "Cat's Eye Chrysoberyl"],
    codeFormat: /^VG-CH\d+$/,
    piecesRange: { min: 1, max: 3 },
    hasLots: true
  },
  {
    tabName: "Zircon",
    module: "vision-gems",
    gemType: "Zircon",
    themeColor: "#60A5FA",
    varieties: ["Blue Zircon", "White Zircon", "Yellow Zircon", "Orange Zircon"],
    codeFormat: /^VG-Z\d+$/,
    piecesRange: { min: 1, max: 3 },
    hasLots: true
  },
  {
    tabName: "Tourmaline",
    module: "vision-gems",
    gemType: "Tourmaline",
    themeColor: "#EC4899",
    varieties: ["Pink Tourmaline", "Green Tourmaline", "Blue Tourmaline", "Watermelon Tourmaline"],
    codeFormat: /^VG-TM\d+$/,
    piecesRange: { min: 1, max: 3 },
    hasLots: true
  },
  {
    tabName: "Aquamarine",
    module: "vision-gems",
    gemType: "Aquamarine",
    themeColor: "#22D3EE",
    varieties: ["Aquamarine"],
    varietyFixed: true,
    codeFormat: /^VG-AQ\d+$/,
    piecesRange: { min: 1, max: 10 },
    hasLots: true
  },
  {
    tabName: "Padparadscha",
    module: "vision-gems",
    gemType: "Padparadscha Sapphire",
    themeColor: "#FB923C",
    varieties: ["Padparadscha"],
    varietyFixed: true,
    codeFormat: /^VG-PAD\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "Pink.Sapphire",
    module: "vision-gems",
    gemType: "Pink Sapphire",
    themeColor: "#F472B6",
    varieties: ["Pink Sapphire"],
    varietyFixed: true,
    codeFormat: /^VG-PS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "Violet.Sapphire",
    module: "vision-gems",
    gemType: "Violet Sapphire",
    themeColor: "#A855F7",
    varieties: ["Violet Sapphire"],
    varietyFixed: true,
    codeFormat: /^VG-VS\d+$/,
    piecesRange: { min: 1, max: 1 },
    piecesFixed: true,
    hasLots: true
  },
  {
    tabName: "V G Old stock", // Trimmed in logic
    module: "vision-gems",
    gemType: "Mixed Old Stock",
    themeColor: "#6B7280",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    codeFormat: /^VG-OLD\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true,
    note: "Old inventory from previous years"
  },

  // --- Dad ---
  {
    tabName: "Instock", // Matches 'Instock' if normalized
    module: "dada", // 'dada' in constants
    gemType: "Mixed Gems",
    themeColor: "#0891B2",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    codeFormat: /^DAD-\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true
  },

  // --- Kenya ---
  {
    tabName: "Instock",
    module: "kenya",
    gemType: "Mixed Gems",
    themeColor: "#10B981",
    varieties: ["TSV", "Spinel", "Ruby", "Sapphire", "Other"],
    codeFormat: /^K-\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true,
    origin: "Kenya",
    showOriginFlag: "🇰🇪"
  },

  // --- VG Ramazan ---
  {
    tabName: "Instock",
    module: "vg-ramazan",
    gemType: "Mixed Gems",
    themeColor: "#8B5CF6",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    codeFormat: /^VGRZ-\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true
  },

  // --- Madagascar ---
  {
    tabName: "Instock",
    module: "madagascar",
    gemType: "Mixed Gems",
    themeColor: "#EC4899",
    varieties: ["Spinel", "TSV", "Ruby", "Sapphire", "Garnet", "Other"],
    codeFormat: /^SGM-\d+$/,
    piecesRange: { min: 1, max: 5 },
    hasLots: true,
    origin: "Madagascar"
  }
];

export const getInventoryConfig = (moduleId: string, tabId: string): InventoryConfig | undefined => {
  const normTab = tabId.trim().toLowerCase();
  // Custom normalization for multi-space tabs if needed, but simple trim usually works
  const searchName = normTab.replace(/\s+/g, ' '); 

  return INVENTORY_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === searchName
  );
};
