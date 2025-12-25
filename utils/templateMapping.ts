
import { getInventoryConfig } from './inventoryConfig';
import { getBatchConfig } from './batchPurchaseConfig';
import { getMixedInventoryConfig } from './mixedInventoryConfig';
import { getExpenseConfig } from './expenseConfig';
import { getFinancialConfig } from './financialConfig';
import { getDashboardConfig } from './dashboardConfig';
import { getCustomerLedgerConfig } from './customerLedgerConfig';
import { getPayableConfig } from './payableConfig';
import { getExportConfig } from './exportConfig';
import { getPurchasingConfig } from './purchasingConfig';
import { getReferenceDataConfig } from './referenceDataConfig';
import { getWorkingSheetConfig } from './workingSheetConfig';
import { getSpecializedRecordConfig } from './specializedRecordConfig';
import { APP_MODULES } from '../constants';

export type TemplateType = 
  | 'Inventory' 
  | 'Dashboard' 
  | 'FinancialCapital' 
  | 'ExpenseTracking' 
  | 'PurchaseJob' 
  | 'ExportInvoice' 
  | 'PaymentTracking' 
  | 'TravelTickets' 
  | 'StatementReport' 
  | 'SimpleList'
  | 'LotBasedInventory' 
  | 'BatchPurchase' 
  | 'MixedInventory'
  | 'TsvSold'
  | 'TsvBKK'
  | 'MixSemiBKK'
  | 'SpinelBKK'
  | 'SapphireBKK'
  | 'RuBkk1'
  | 'RuBkk2'
  | 'RuBkk160425'
  | 'China'
  | 'ExportInvoiceMaster'
  | 'ExpenseLog'
  | 'CapitalManagement'
  | 'KPIDashboard'
  | 'CustomerLedger'
  | 'SupplierPayable'
  | 'ExportRecords'
  | 'PurchasingRecords'
  | 'ReferenceData'
  | 'WorkingSheet'
  | 'SpecializedRecord'
  | 'VisionGemsSpinel'
  | 'VGOldStock'
  | 'CutPolish'
  | 'VGExpenses'
  | 'AllExpensesDashboard'
  | 'ClassicTravel'
  | 'SLExpenses'
  | 'BKKTickets'
  | 'BKKExpenses'
  | 'BKKApartment'
  | 'BKKExportCharge'
  | 'BKKCapital'
  | 'BKKPayment'
  | 'BKKStatement'
  | 'OnlineTickets'
  | 'OfficeExpenses'
  | 'SGPaymentReceived'
  | 'InStocksCategory'
  | 'PayableDashboard'
  | 'GemLicense'
  | 'AuditAccounts'
  | 'PartnerShares'
  | 'ZahranLedger'
  | 'BangkokLedger'
  | 'PaymentReceived'
  | 'SupplierLedger'
  | 'KenyaExport'
  | 'KenyaTraveling'
  | 'KenyaPurchasing'
  | 'KenyaExpense'
  | 'KenyaCapital'
  | 'PaymentDueDate'
  | 'GeneralExpenses'
  | 'CutPolishExpenses';

/**
 * Persists a template assignment for a custom-added tab.
 */
export const saveCustomTabTemplate = (moduleId: string, tabId: string, template: TemplateType) => {
  try {
    const key = `custom_tab_templates_${moduleId}`;
    const saved = localStorage.getItem(key);
    const map = saved ? JSON.parse(saved) : {};
    map[tabId] = template;
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save custom tab template", e);
  }
};

export const getTemplateForTab = (moduleId: string, tabId: string): TemplateType => {
  const tabLower = tabId.toLowerCase();
  const tabNormal = tabId.trim().toLowerCase().replace(/\s+/g, ' '); 

  // --- CHECK CUSTOM DYNAMIC REGISTRY FIRST ---
  try {
    const customMapKey = `custom_tab_templates_${moduleId}`;
    const customMapJson = localStorage.getItem(customMapKey);
    if (customMapJson) {
      const customMap = JSON.parse(customMapJson);
      if (customMap[tabId]) return customMap[tabId];
    }
  } catch (e) {}

  // --- VG EXPORTING MAPPING (ALL BKK TABS NOW USE TEMPLATE 1) ---
  if (moduleId === 'vg-exporting') {
    const template1Tabs = [
      'export', 
      'spinel bkk', 
      'tsv bkk', 
      'tsv sold', 
      'mix semi bkk', 
      'sapphire bkk', 
      'ru- bkk 1', 
      'ru-bkk2', 
      'ru-bkk-16042025'
    ];
    if (template1Tabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabLower === 'china') return 'China';
    if (tabNormal === 'export -invoice') return 'ExportInvoiceMaster';
  }

  // --- BKK FRESH MAPPING ---
  if (moduleId === 'bkk') {
    if (tabNormal === 'dashboard') return 'KPIDashboard';
    if (tabNormal === 'bkk') return 'VisionGemsSpinel';
    if (tabNormal === 'bkktickets') return 'BKKTickets';
    if (tabNormal === 'bkkexpenses') return 'BKKExpenses';
    if (tabNormal === 'export.charge') return 'BKKExportCharge';
    if (tabNormal === 'apartment') return 'BKKApartment';
    if (tabNormal === 'bkkcapital') return 'BKKCapital';
    if (tabNormal === 'bkk.payment') return 'BKKPayment';
    if (tabNormal === 'bkk.statement') return 'BKKStatement';
  }

  // --- KENYA OVERRIDES ---
  if (moduleId === 'kenya') {
    if (tabNormal === 'instock') return 'VisionGemsSpinel';
    if (tabNormal === 'cutpolish') return 'CutPolish';
    if (tabNormal === 'export') return 'KenyaExport';
    if (tabNormal === 'traveling.ex') return 'KenyaTraveling';
    if (tabNormal === 'bkkexpenses') return 'BKKExpenses'; 
    if (tabNormal === 'bkkhotel') return 'BKKApartment'; 
    if (tabNormal === 'kpurchasing') return 'KenyaPurchasing';
    if (tabNormal === 'kexpenses') return 'GeneralExpenses';
    if (tabNormal === 'capital') return 'KenyaCapital';
  }

  // --- TOP PRIORITY OVERRIDES ---

  if (moduleId === 'payable') {
    if (tabNormal === 'beruwala' || tabNormal === 'bayer ruler') {
      return 'SupplierLedger';
    }
  }
  
  if (moduleId === 'outstanding' && tabNormal === 'payment.received') {
    return 'PaymentReceived';
  }

  if (moduleId === 'outstanding' && tabNormal === 'bangkok') {
    return 'BangkokLedger';
  }

  if (moduleId === 'outstanding') {
    if (tabNormal === 'dashboard') return 'KPIDashboard';
    if (tabNormal === 'payment due date') return 'PaymentDueDate'; 
    
    const tabs = APP_MODULES.find(m => m.id === 'outstanding')?.tabs || [];
    const zahranIdx = tabs.findIndex(t => t.toLowerCase() === 'zahran');
    const currentIdx = tabs.findIndex(t => t.toLowerCase() === tabNormal);
    
    if (zahranIdx !== -1 && currentIdx >= zahranIdx) {
      return 'ZahranLedger';
    }
    
    return 'SGPaymentReceived';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'fawazwife.shares') {
    return 'PartnerShares';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'audit.accounts') {
    return 'AuditAccounts';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'gem.license') {
    return 'GemLicense';
  }

  if (moduleId === 'payable' && tabNormal === 'dashboard') {
    return 'PayableDashboard';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'classictravel') {
    return 'ClassicTravel';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'exdashboard') {
    return 'AllExpensesDashboard';
  }

  const vgStyleTabs = [
    'vgexpenses', 
    'ziyam', 
    'zahran', 
    'dad', 
    'ramzanhaji.shares', 
    'azeem.shares', 
    'others.shares'
  ];
  
  if (moduleId === 'all-expenses' && vgStyleTabs.includes(tabNormal)) {
    return 'VGExpenses';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'cut.polish') {
    return 'CutPolish';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'office') {
    return 'OfficeExpenses';
  }

  if (moduleId === 'all-expenses' && (tabNormal === 'online.ticket' || tabNormal === 'personal ticket visa')) {
    return 'OnlineTickets';
  }

  if (moduleId === 'in-stocks') {
    if (tabNormal === 'all stones') {
      return 'VisionGemsSpinel';
    }
  }

  if (moduleId === 'vision-gems') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolish';
    }
    const excludedTabs = ['dashboardgems', 'z', 'stone shape', 'approval'];
    if (tabNormal === 'v g old stock') return 'VGOldStock';
    if (!excludedTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'stone shape') return 'ReferenceData'; 
  }

  if (moduleId === 'spinel-gallery') {
    const spinelDesignTabs = ['mahenge', 'spinel', 'blue.sapphire'];
    if (spinelDesignTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'cut.polish') return 'CutPolish';
    if (tabNormal === 'sl.expenses') return 'SLExpenses';
    if (tabNormal === 'bkkticket') return 'BKKTickets';
    if (tabNormal === 'texpenses') return 'GeneralExpenses';
  }

  // --- GENERAL EXPENSES TEMPLATE MAPPING (6 tabs) ---
  // Note: KExpenses is handled in Kenya overrides section above
  if (moduleId === 'dada') {
    if (tabNormal === 't.expense' || tabNormal === '202412texpense') {
      return 'GeneralExpenses';
    }
  }

  if (moduleId === 'vg-ramazan') {
    if (tabNormal === 't.expenses') {
      return 'GeneralExpenses';
    }
  }

  if (moduleId === 'madagascar') {
    if (tabNormal === 'mexpenses') {
      return 'GeneralExpenses';
    }
  }

  if (moduleId === 'vgtz') {
    if (tabNormal === 'tz.expenses') {
      return 'GeneralExpenses';
    }
  }

  const specializedConfig = getSpecializedRecordConfig(moduleId, tabId);
  if (specializedConfig) return 'SpecializedRecord';

  const workingSheetConfig = getWorkingSheetConfig(moduleId, tabId);
  if (workingSheetConfig) return 'WorkingSheet';

  const referenceConfig = getReferenceDataConfig(moduleId, tabId);
  if (referenceConfig) return 'ReferenceData';

  const dashboardConfig = getDashboardConfig(moduleId, tabId);
  if (dashboardConfig) return 'KPIDashboard';

  const ledgerConfig = getCustomerLedgerConfig(moduleId, tabId);
  if (ledgerConfig) return 'CustomerLedger';

  const payableConfig = getPayableConfig(moduleId, tabId);
  if (payableConfig) return 'SupplierPayable';

  const exportConfig = getExportConfig(moduleId, tabId);
  if (exportConfig) return 'ExportRecords';

  const purchasingConfig = getPurchasingConfig(moduleId, tabId);
  if (purchasingConfig) return 'PurchasingRecords';

  const financialConfig = getFinancialConfig(moduleId, tabId);
  if (financialConfig) return 'CapitalManagement';

  const expenseConfig = getExpenseConfig(moduleId, tabId);
  if (expenseConfig) return 'ExpenseLog';

  if (moduleId === 'madagascar' && (tabNormal === 'invoice' || tabNormal === 'invoice bkk')) {
    return 'ExportInvoiceMaster';
  }

  const mixedConfig = getMixedInventoryConfig(moduleId, tabId);
  if (mixedConfig) return 'MixedInventory';

  const batchConfig = getBatchConfig(moduleId, tabId);
  if (batchConfig) return 'BatchPurchase';

  const inventoryConfig = getInventoryConfig(moduleId, tabId);
  if (inventoryConfig) return 'LotBasedInventory';

  if (tabLower.includes('dashboard') || tabLower === 'dash') return 'Dashboard';
  if (moduleId === 'spinel-gallery') {
    if (tabLower === 'stone shapes' || tabLower.includes('important')) return 'ReferenceData'; 
    return 'Inventory';
  }
  if (moduleId === 'all-expenses') return 'ExpenseLog';
  if (moduleId === 'payable') {
    if (tabLower === 'name') return 'SimpleList';
    return 'PaymentTracking';
  }
  const isTripModule = ['kenya', 'vgtz', 'madagascar', 'dada', 'vg-ramazan'].includes(moduleId);
  if (isTripModule) {
    if (tabLower === 'azeem') return 'PaymentTracking';
    if (tabLower.match(/^\d+/) || tabLower.includes('sheet')) return 'ExpenseLog';
  }
  if (tabLower.includes('stock')) return 'Inventory';
  if (tabLower.includes('payment')) return 'PaymentTracking';
  if (tabLower.includes('ticket')) return 'ExpenseLog'; 
  if (tabLower.includes('export')) return 'ExportInvoice';

  return 'Inventory'; 
};
