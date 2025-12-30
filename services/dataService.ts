
import { Stone, Transaction, KPI, CapitalEntry, JobEntry, ExportEntry, TicketEntry, DetailedExportInvoice, InventoryConfig, GenericLot, GenericStone, ExtendedSpinelStone } from '../types';
import { BatchPurchaseConfig } from '../utils/batchPurchaseConfig';
import { MixedInventoryConfig } from '../utils/mixedInventoryConfig';
import { ExpenseConfig } from '../utils/expenseConfig';
import { FinancialConfig } from '../utils/financialConfig';
import { CustomerLedgerConfig } from '../utils/customerLedgerConfig';
import { PayableConfig } from '../utils/payableConfig';
import { ExportConfig } from '../utils/exportConfig';
import { PurchasingConfig } from '../utils/purchasingConfig';

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
const GOOG_API_KEY = 'AIzaSyCgaabBcBF_qBKngPckNhY8kfhSgaIShcE'; 
const SPREADSHEET_ID = '1mnE_sW8-CfgN2Stxv2fuPPpKgeGjjy2zWcO0MazSENM'; 
const STONE_PERSISTENCE_KEY = 'vg_stone_persistence_registry_v2'; 

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

// ============================================================================
// 2. EXPORTED INTERFACES
// ============================================================================

export interface BatchStone {
  id: string;
  number: number;
  code: string;
  weight: number;
  variety: string;
  marker: string;
  pieces: number;
  purchaseDate: string;
  status: 'available' | 'sold';
  photos: string[];
}

export interface MixedStone {
  id: string;
  code: string;
  weight: number;
  variety: string;
  shape: string;
  pieces: number;
  status: 'available' | 'sold' | 'approval';
}

export interface ExpenseTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  company?: string;
  code?: string;
  name?: string;
  exchangeRate?: number;
  lkrAmount?: number;
  weight?: number;
  route?: string;
  airline?: string;
  visaType?: string;
  location?: string;
  duration?: string;
  foreignCurrency?: string;
}

export interface USDCapitalTransaction {
  id: string;
  date: string;
  name: string;
  description: string;
  usdAmount: number;
  slRate: number;
  rsAmount: number;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  company: string;
  code: string;
  description: string;
  name?: string;
  weight: number;
  amount: number;
  paidAmount?: number;
  paymentStatus: 'Paid' | 'Outstanding' | 'Partial';
}

export interface ExportRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  weight?: number;
  exchangeRate?: number;
  lkrAmount?: number;
  code?: string;
  name?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  code: string;
  variety: string;
  supplier: string;
  weight: number;
  pieces: number;
  cost: number;
  paymentStatus?: 'Paid' | 'Owed' | 'Partial';
  color?: string;
  notes?: string;
}

// ============================================================================
// 3. DATA PERSISTENCE UTILITIES
// ============================================================================

export const saveExportedStone = (stone: ExtendedSpinelStone) => {
  try {
    const saved = localStorage.getItem(STONE_PERSISTENCE_KEY);
    const registry: ExtendedSpinelStone[] = saved ? JSON.parse(saved) : [];
    
    const index = registry.findIndex(s => s.id === stone.id);
    
    if (index > -1) {
      registry[index] = stone;
    } else {
      registry.push(stone);
    }
    
    localStorage.setItem(STONE_PERSISTENCE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error("Failed to sync stone state", e);
  }
};

export const getExportedStones = (tabId?: string): ExtendedSpinelStone[] => {
  try {
    const saved = localStorage.getItem(STONE_PERSISTENCE_KEY);
    let allStones: ExtendedSpinelStone[] = saved ? JSON.parse(saved) : [];
    let needsMigration = false;
    
    // Migration: Infer originalCategory from location for existing stones without it
    allStones = allStones.map(stone => {
      if (!stone.originalCategory && stone.location) {
        const normalizedLocation = stone.location.toLowerCase().trim();
        // Only set originalCategory if location is a category name (not BKK or Export)
        if (normalizedLocation !== 'bkk' && normalizedLocation !== 'export') {
          needsMigration = true;
          return { ...stone, originalCategory: stone.location };
        }
      }
      return stone;
    });
    
    // Persist migrated stones back to localStorage
    if (needsMigration) {
      localStorage.setItem(STONE_PERSISTENCE_KEY, JSON.stringify(allStones));
    }
    
    if (!tabId) return allStones;
    
    const normalizedTab = tabId.toLowerCase().trim();

    // 1. GLOBAL VIEW: All Stones tab shows everything in the system
    if (normalizedTab === 'all stones') {
      return allStones;
    }

    // 2. FUNCTIONAL VIEW: Export tab only shows stones with 'Export' status
    if (normalizedTab === 'export') {
      return allStones.filter(s => s.status === 'Export');
    }

    // 3. FUNCTIONAL VIEW: BKK tab only shows stones with 'BKK' status
    if (normalizedTab === 'bkk') {
      return allStones.filter(s => s.status === 'BKK');
    }

    // 4. FUNCTIONAL VIEW: Approval tab shows all stones with Approval status
    // This allows stones from any tab to appear in Approval tab when their status is Approval
    if (normalizedTab === 'approval') {
      return allStones.filter(s => s.status === 'Approval');
    }

    // 5. CATEGORY VIEW: Variety tabs (e.g. Spinel) show stones based on originalCategory
    // This allows stones to remain visible in their original tab regardless of status
    return allStones.filter(s => {
      const stoneOriginalCategory = s.originalCategory?.toLowerCase().trim();
      const stoneLocation = s.location?.toLowerCase().trim();
      
      // Match by originalCategory if available, otherwise fall back to location for backward compatibility
      return (stoneOriginalCategory === normalizedTab) || 
             (!stoneOriginalCategory && stoneLocation === normalizedTab);
    });
  } catch (e) {
    return [];
  }
};

// ============================================================================
// 4. VISION GEMS DATA FETCHER
// ============================================================================

const SPINEL_LANDING_MOCK = [
    { "Code No.": "VG-SPD01*1", "SL Cost": "51136", "C & P Weight": "1.28", "Variety": "Spinel", "Colour": "red", "paid /  notpaid": "Not Paid", "Status": "In Stock", "Stones in": "Spinel", "Date (Selling)": "2024-01-05", "Buyer": "kadar haj col", "Sold by": "zah", "RS Amount": "196500", "Final Amount": "196500", "Paid/Not Paid": "Paid", "Total stones": "In Stock", "Amount": "396500" },
];

export const getVisionGemsSpinelData = async (tabId?: string, moduleId?: string): Promise<ExtendedSpinelStone[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const cleanNum = (val: any): number => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const cleaned = val.toString().replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const mapToStone = (item: any, idx: number, tab: string): ExtendedSpinelStone => {
    const normalizedTab = tab.toLowerCase().trim();
    // Set originalCategory for category tabs (not BKK/Export/All Stones)
    const originalCategory = (normalizedTab !== 'bkk' && normalizedTab !== 'export' && normalizedTab !== 'all stones')
      ? tab
      : undefined;
    
    return {
      id: item.id || `mock-${tab}-${idx}`,
      company: item["Company"] || 'Vision Gems',
      codeNo: item["Code No."] || `UNKNOWN-${idx}`,
      slCost: cleanNum(item["SL Cost"]),
      weight: cleanNum(item["C & P Weight"]),
      shape: item["Shape"] || 'Round',
      variety: item["Variety"] || 'Gemstone',
      treatment: item["N/H"] || 'N',
      photos: item.photos || [],
      color: item["Colour"] || '-',
      pieces: cleanNum(item["Pieces"]) || 1,
      dimensions: item["Dimension"] || '-',
      certificate: item["Certificate"] || '-',
      supplier: item["Supplier"] || '-',
      payable: item["Payable"] || 0,
      purchaseDate: item["Purchase Date"] || '-',
      purchasePaymentMethod: item["Cash or Bank"] || '-', 
      purchasePaymentStatus: item["paid /  notpaid"] || '-',
      inventoryCategory: item["Total stones"] || '-', 
      status: item["Status"] || 'In Stock',
      location: tab,
      originalCategory: originalCategory,
      holder: item["Stone with"] || '-',
      outstandingName: item["Outstanding Names"] || '-',
      sellDate: item["Date (Selling)"] || '-',
      buyer: item["Buyer"] || '-',
      soldBy: item["Sold by"] || '-',
      paymentDueDate: item["Payment Due"] || '-',
      salesPaymentStatus: item["Paid/Not Paid"] || '-',
      paymentReceivedDate: item["Payment paid Date"] || '-',
      priceRMB: cleanNum(item["RMB Currency"]),
      priceTHB: cleanNum(item["Bath Currency"]),
      priceUSD: cleanNum(item["$ Currency"]),
      exchangeRate: cleanNum(item["Rate"]),
      amountLKR: cleanNum(item["RS Amount"]),
      commission: cleanNum(item["Commission"]),
      finalPrice: cleanNum(item["Final Amount"]),
      profit: cleanNum(item["Profit / Loss"]),
      margin: 0, 
      shareAmount: 0,
      shareProfit: 0,
      salesPaymentMethod: '-', 
      paymentCleared: 'No',
      transactionAmount: 0
    };
  };

  const tabStones = getExportedStones(tabId);

  // If this is a category tab and it's empty, and it's the primary 'Spinel' tab, show mock
  if (tabId === 'Spinel' && tabStones.length === 0) {
      return SPINEL_LANDING_MOCK.map((item, idx) => mapToStone(item, idx, 'Spinel'));
  }

  return tabStones;
};

// ============================================================================
// 5. REMAINING SERVICES
// ============================================================================
export const getStones = async (tabId: string): Promise<Stone[]> => [];
export const generateKPIs = (type: string): KPI[] => [];
export const generateMockTransactions = (count: number, type: any): Transaction[] => [];
export const generateCapitalEntries = (count: number): CapitalEntry[] => [];
export const generateJobs = (count: number): JobEntry[] => [];
export const generateTickets = (count: number): TicketEntry[] => [];
export const getDetailedExportInvoices = async (tabId: string): Promise<DetailedExportInvoice[]> => [];
export const getLotBasedData = async (config: InventoryConfig): Promise<{ lots: GenericLot[], stones: GenericStone[] }> => ({ lots: [], stones: [] });
export const getBatchPurchaseData = async (config: BatchPurchaseConfig): Promise<BatchStone[]> => [];
export const getMixedInventoryData = async (config: MixedInventoryConfig): Promise<MixedStone[]> => [];
export const getExpenseTransactions = async (config: ExpenseConfig): Promise<ExpenseTransaction[]> => [];
export const getExportRecords = async (config: ExportConfig): Promise<ExportRecord[]> => [];
export const getPurchasingData = async (config: PurchasingConfig): Promise<PurchaseRecord[]> => [];
export const getCustomerTransactions = async (config: CustomerLedgerConfig): Promise<CustomerTransaction[]> => [];
export const getFinancialData = async (config: FinancialConfig): Promise<USDCapitalTransaction[]> => [];
