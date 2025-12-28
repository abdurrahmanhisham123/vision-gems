
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
  | 'VGExpenses'
  | 'AllExpensesDashboard'
  | 'BKKExportCharge'
  | 'BKKCapital'
  | 'PayableDashboard'
  | 'SupplierLedger'
  | 'PaymentDueDate'
  | 'CutPolishExpenses'
  | 'TicketsVisa'
  | 'PersonalShares'
  | 'SpecificServices'
  | 'HotelAccommodation'
  | 'UnifiedCapitalManagement'
  | 'UnifiedPaymentLedger'
  | 'UnifiedExpense'
  | 'UnifiedDashboard'
  | 'UnifiedPurchasing'
  | 'UnifiedExport'
  | 'UnifiedStatement'
  | 'UnifiedSheet'
  | 'DealRecord';

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

  // --- UNIFIED PAYMENT LEDGER MAPPING (36 tabs) ---
  // Company Payment Summary Tabs - Module: outstanding
  // Deal Record tabs (5 tabs) - using DealRecord template
  if (moduleId === 'outstanding') {
    if (tabNormal === 'sg.payment.received' || 
        tabNormal === 'madagascar.payment.received' || 
        tabNormal === 'k.payment.received' || 
        tabNormal === 'vg.r.payment.received' || 
        tabNormal === 'vg.payment.received') {
      return 'DealRecord';
    }
    // VG.T.Payment.Received still uses VGExpenses
    if (tabNormal === 'vg.t.payment.received') {
      return 'VGExpenses';
    }
    // Other payment received tabs still use UnifiedPaymentLedger
    if (tabNormal === 'payment.received') {
      return 'UnifiedPaymentLedger';
    }
  }

  // Individual Customer Ledger Tabs (27 tabs) - Module: outstanding
  if (moduleId === 'outstanding') {
    const customerLedgerTabs = [
      'zahran', 'ruzaiksales', 'beruwalasales', 'sajithonline', 'ziyam', 
      'infazhaji', 'nusrathali', 'binara', 'mikdarhaji', 'rameesnana', 
      'shimar', 'ruqshan', 'faizeenhaj', 'sharikhaj', 'fazeel', 
      'azeemcolo', 'kadarhaj.colo', 'althafhaj', 'bangkoksales', 'sadam bkk', 
      'chinasales', 'eleven', 'andybuyer', 'flightbuyer', 'name', 
      'name1', 'bangkok'
    ];
    if (customerLedgerTabs.includes(tabNormal)) {
      return 'UnifiedPaymentLedger';
    }
  }

  // Other Payment Tabs (2 tabs)
  if (moduleId === 'bkk' && tabNormal === 'bkk.payment') {
    return 'UnifiedPaymentLedger';
  }
  if (moduleId === 'payable' && tabNormal === 'buying.payments.paid') {
    return 'UnifiedPaymentLedger';
  }

  // --- BKK FRESH MAPPING ---
  if (moduleId === 'bkk') {
    if (tabNormal === 'dashboard') return 'KPIDashboard';
    if (tabNormal === 'bkk') return 'VisionGemsSpinel';
    if (tabNormal === 'bkktickets') return 'TicketsVisa';
    if (tabNormal === 'export.charge') return 'UnifiedExport';
    if (tabNormal === 'apartment') return 'HotelAccommodation';
    if (tabNormal === 'bkkcapital') return 'BKKCapital';
    // bkk.statement now uses UnifiedStatement (mapped above)
  }

  // --- UNIFIED PURCHASING MAPPING (6 tabs) ---
  if (moduleId === 'kenya' && tabNormal === 'kpurchasing') {
    return 'UnifiedPurchasing';
  }
  if (moduleId === 'vgtz' && tabNormal === 'purchase') {
    return 'UnifiedPurchasing';
  }
  if (moduleId === 'madagascar' && tabNormal === 'mpurchasing') {
    return 'UnifiedPurchasing';
  }
  if (moduleId === 'dada' && tabNormal === 'purchase') {
    return 'UnifiedPurchasing';
  }
  if (moduleId === 'vg-ramazan' && tabNormal === 'vgr.purchase') {
    return 'UnifiedPurchasing';
  }
  if (moduleId === 'spinel-gallery' && tabNormal === 'purchasing') {
    return 'UnifiedPurchasing';
  }

  // --- UNIFIED STATEMENT MAPPING (2 tabs) ---
  if (moduleId === 'bkk' && tabNormal === 'bkk.statement') {
    return 'UnifiedStatement';
  }
  // Note: StatementReport template is legacy and not actively mapped to any tabs

  // --- UNIFIED SHEET/EXPENSE LOG MAPPING (5-8 tabs) ---
  if (moduleId === 'all-expenses' && (tabNormal === 'sheet19' || tabNormal === 'sheet21' || tabNormal === 'sheet23')) {
    return 'UnifiedSheet';
  }
  if (moduleId === 'kenya' && tabNormal === 'sheet19') {
    return 'UnifiedSheet';
  }

  // --- UNIFIED EXPORT MAPPING (8-10 tabs) ---
  if (moduleId === 'kenya' && tabNormal === 'export') {
    return 'UnifiedExport';
  }
  if (moduleId === 'madagascar' && tabNormal === 'mexport') {
    return 'UnifiedExport';
  }
  if (moduleId === 'spinel-gallery' && tabNormal === 'bkkexport') {
    return 'UnifiedExport';
  }
  if (moduleId === 'vgtz' && tabNormal === 't.export') {
    return 'UnifiedExport';
  }
  if (moduleId === 'dada' && tabNormal === 't.export') {
    return 'UnifiedExport';
  }
  if (moduleId === 'vg-ramazan' && tabNormal === 't.export') {
    return 'UnifiedExport';
  }
  // ExportRecords via exportConfig will be handled below, but we'll override it
  // ExportInvoiceMaster tabs (export -invoice, invoice, invoice bkk) - keeping separate as they're more detailed

  // --- KENYA OVERRIDES ---
  if (moduleId === 'kenya') {
    if (tabNormal === 'instock') return 'VisionGemsSpinel';
    if (tabNormal === 'cutpolish') return 'CutPolishExpenses';
    // export tab now uses UnifiedExport (mapped above)
    if (tabNormal === 'traveling.ex') return 'TicketsVisa';
    if (tabNormal === 'bkkhotel') return 'HotelAccommodation'; 
    if (tabNormal === 'kexpenses') return 'UnifiedExpense';
  }

  // --- INSTOCK MAPPINGS (Rich Inventory Template) ---
  if (moduleId === 'vgtz' && tabNormal === 'vg.t.instock') {
    return 'VisionGemsSpinel';
  }
  if (moduleId === 'madagascar' && tabNormal === 'instock') {
    return 'VisionGemsSpinel';
  }
  if (moduleId === 'dada' && tabNormal === 'instock') {
    return 'VisionGemsSpinel';
  }
  if (moduleId === 'vg-ramazan' && tabNormal === 'instock') {
    return 'VisionGemsSpinel';
  }

  // --- EXPORT CHARGES MAPPING (only for bkk module now) ---
  // Note: madagascar/mexport and spinel-gallery/bkkexport now use UnifiedExport

  // --- UNIFIED EXPENSE MAPPING (8 tabs) ---
  if (moduleId === 'bkk' && tabNormal === 'bkkexpenses') {
    return 'UnifiedExpense';
  }
  if (moduleId === 'kenya' && tabNormal === 'bkkexpenses') {
    return 'UnifiedExpense';
  }
  if (moduleId === 'spinel-gallery' && tabNormal === 'sl.expenses') {
    return 'UnifiedExpense';
  }
  if (moduleId === 'vgtz') {
    if (tabNormal === 'slexpenses' || tabNormal === 'tz.expenses') {
      return 'UnifiedExpense';
    }
  }
  if (moduleId === 'madagascar') {
    if (tabNormal === 'mexpenses' || tabNormal === 'slexpenses') {
      return 'UnifiedExpense';
    }
  }
  if (moduleId === 'dada') {
    if (tabNormal === 't.expense' || tabNormal === '202412texpense') {
      return 'UnifiedExpense';
    }
  }
  if (moduleId === 'vg-ramazan' && tabNormal === 't.expenses') {
    return 'UnifiedExpense';
  }

  // --- UNIFIED CAPITAL MANAGEMENT MAPPING ---
  if (moduleId === 'dada') {
    if (tabNormal === 'capital' || tabNormal === '202412capital') {
      return 'UnifiedCapitalManagement';
    }
  }
  if (moduleId === 'kenya' && tabNormal === 'capital') {
    return 'UnifiedCapitalManagement';
  }
  if (moduleId === 'vg-ramazan' && tabNormal === 't.capital') {
    return 'UnifiedCapitalManagement';
  }
  if (moduleId === 'madagascar' && tabNormal === 'mcapital') {
    return 'UnifiedCapitalManagement';
  }
  if (moduleId === 'spinel-gallery' && tabNormal === 'capital') {
    return 'UnifiedCapitalManagement';
  }
  if (moduleId === 'vgtz' && tabNormal === 't.capital') {
    return 'UnifiedCapitalManagement';
  }
  if (moduleId === 'payable') {
    if (tabNormal === 'tanzania.capital' || tabNormal === 'bkk.capital') {
      return 'UnifiedCapitalManagement';
    }
  }

  // --- TOP PRIORITY OVERRIDES ---

  if (moduleId === 'payable') {
    if (tabNormal === 'beruwala' || tabNormal === 'bayer ruler') {
      return 'SupplierLedger';
    }
  }

  if (moduleId === 'outstanding') {
    if (tabNormal === 'dashboard') return 'KPIDashboard';
    if (tabNormal === 'payment due date') return 'PaymentDueDate'; 
  }

  if (moduleId === 'all-expenses' && tabNormal === 'fawazwife.shares') {
    return 'PersonalShares';
  }

  if (moduleId === 'payable' && tabNormal === 'dashboard') {
    return 'PayableDashboard';
  }

  // --- UNIFIED EXPENSE MAPPING FOR ALL-EXPENSES MODULE ---
  if (moduleId === 'all-expenses') {
    if (tabNormal === 'vgexpenses' || 
        tabNormal === 'ziyam' || 
        tabNormal === 'zcar' || 
        tabNormal === 'zahran' || 
        tabNormal === 'dad' || 
        tabNormal === 'ramzanhaji.shares' || 
        tabNormal === 'azeem.shares' ||
        tabNormal === 'others.shares') {
      return 'UnifiedExpense';
    }
  }

  // --- SPECIFIC SERVICES TEMPLATE MAPPING (4 tabs) ---
  if (moduleId === 'all-expenses') {
    if (tabNormal === 'classictravel' || tabNormal === 'office' || tabNormal === 'gem.license' || tabNormal === 'audit.accounts') {
      return 'SpecificServices';
    }
  }

  if (moduleId === 'all-expenses' && tabNormal === 'exdashboard') {
    return 'AllExpensesDashboard';
  }

  // --- PERSONAL SHARES TEMPLATE MAPPING (9 tabs) ---
  if (moduleId === 'all-expenses') {
    if (tabNormal === 'ziyam' || tabNormal === 'zahran' || tabNormal === 'dad' || tabNormal === 'zcar') {
      return 'PersonalShares';
    }
    if (tabNormal === 'ramzanhaji.shares' || tabNormal === 'azeem.shares' || tabNormal === 'others.shares') {
      return 'PersonalShares';
    }
  }

  const vgStyleTabs = [
    'vgexpenses'
  ];
  
  if (moduleId === 'all-expenses' && vgStyleTabs.includes(tabNormal)) {
    return 'VGExpenses';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'cut.polish') {
    return 'CutPolishExpenses';
  }

  if (moduleId === 'all-expenses' && (tabNormal === 'online.ticket' || tabNormal === 'personal ticket visa')) {
    return 'TicketsVisa';
  }

  if (moduleId === 'in-stocks') {
    if (tabNormal === 'dashboard') {
      return 'UnifiedDashboard';
    }
    if (tabNormal === 'all stones') {
      return 'VisionGemsSpinel';
    }
  }

  if (moduleId === 'vision-gems') {
    if (tabNormal === 'dashboardgems') {
      return 'UnifiedDashboard';
    }
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
    const excludedTabs = ['dashboardgems', 'z', 'stone shape', 'approval'];
    if (tabNormal === 'v g old stock') return 'VGOldStock';
    if (!excludedTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'stone shape') return 'ReferenceData'; 
  }

  if (moduleId === 'spinel-gallery') {
    if (tabNormal === 'dashboardgems' || tabNormal === 'dash') {
      return 'UnifiedDashboard';
    }
    const spinelDesignTabs = ['mahenge', 'spinel', 'blue.sapphire'];
    if (spinelDesignTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'cut.polish') return 'CutPolishExpenses';
    if (tabNormal === 'bkkticket') return 'TicketsVisa';
    if (tabNormal === 'bkkhotel') return 'HotelAccommodation';
    if (tabNormal === 'texpenses') return 'UnifiedExpense';
  }

  if (moduleId === 'all-expenses' && tabNormal === 'exdashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'outstanding' && tabNormal === 'dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'payable' && tabNormal === 'dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'bkk' && tabNormal === 'dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'kenya' && tabNormal === 'kdashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'vgtz' && tabNormal === 'vg.t dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'madagascar' && tabNormal === 'mdashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'dada' && tabNormal === 'dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'vg-ramazan' && tabNormal === 'vgrz.dashboard') {
    return 'UnifiedDashboard';
  }

  if (moduleId === 'spinel-gallery') {
    const spinelDesignTabs = ['mahenge', 'spinel', 'blue.sapphire'];
    if (spinelDesignTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'cut.polish') return 'CutPolishExpenses';
    if (tabNormal === 'bkkticket') return 'TicketsVisa';
    if (tabNormal === 'bkkhotel') return 'HotelAccommodation';
    if (tabNormal === 'texpenses') return 'UnifiedExpense';
  }

  // --- ADDITIONAL TEMPLATE MAPPINGS ---
  if (moduleId === 'dada') {
    if (tabNormal === 'tickets.visa') {
      return 'TicketsVisa';
    }
  }

  if (moduleId === 'vg-ramazan') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
  }

  if (moduleId === 'madagascar') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
    if (tabNormal === 'tickets.visa') {
      return 'TicketsVisa';
    }
  }

  if (moduleId === 'vgtz') {
    if (tabNormal === 'cut.and.polish') {
      return 'CutPolishExpenses';
    }
    if (tabNormal === 'tickets.visa') {
      return 'TicketsVisa';
    }
    if (tabNormal === 'azeem') {
      return 'PersonalShares';
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

  // Check if this should use UnifiedExport instead of ExportRecords
  const exportConfig = getExportConfig(moduleId, tabId);
  if (exportConfig) {
    // Use UnifiedExport for all export config tabs to consolidate
    return 'UnifiedExport';
  }

  const purchasingConfig = getPurchasingConfig(moduleId, tabId);
  if (purchasingConfig) return 'PurchasingRecords';

  const financialConfig = getFinancialConfig(moduleId, tabId);
  if (financialConfig) return 'CapitalManagement';

  // Check if this should use UnifiedSheet instead of ExpenseLog
  const expenseConfig = getExpenseConfig(moduleId, tabId);
  if (expenseConfig) {
    // Use UnifiedSheet for all expense config tabs to consolidate
    return 'UnifiedSheet';
  }

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
  // all-expenses module tabs now use UnifiedSheet
  if (moduleId === 'all-expenses') return 'UnifiedSheet';
  if (moduleId === 'payable') {
    if (tabLower === 'name') return 'SimpleList';
    return 'PaymentTracking';
  }
  const isTripModule = ['kenya', 'vgtz', 'madagascar', 'dada', 'vg-ramazan'].includes(moduleId);
  if (isTripModule) {
    // Azeem in vgtz is handled above as PersonalShares
    if (tabLower === 'azeem' && moduleId !== 'vgtz') return 'PaymentTracking';
    // Sheet tabs and numeric tabs now use UnifiedSheet
    if (tabLower.match(/^\d+/) || tabLower.includes('sheet')) return 'UnifiedSheet';
  }
  if (tabLower.includes('stock')) return 'Inventory';
  if (tabLower.includes('payment')) return 'PaymentTracking';
  if (tabLower.includes('ticket')) return 'ExpenseLog'; 
  // Note: Most export tabs are now handled by UnifiedExport mappings above
  // Only use ExportInvoice as fallback for very specific cases not covered
  if (tabLower.includes('export') && !tabLower.includes('t.export')) return 'ExportInvoice';

  return 'Inventory'; 
};
