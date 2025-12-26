
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
  | 'CutPolishExpenses'
  | 'TicketsVisa'
  | 'PersonalShares'
  | 'SpecificServices'
  | 'HotelAccommodation'
  | 'ExportCharges'
  | 'UnifiedCapitalManagement'
  | 'UnifiedPaymentLedger';

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
  // Company Payment Summary Tabs (7 tabs) - Module: outstanding
  if (moduleId === 'outstanding') {
    if (tabNormal === 'sg.payment.received' || 
        tabNormal === 'madagascar.payment.received' || 
        tabNormal === 'k.payment.received' || 
        tabNormal === 'vg.r.payment.received' || 
        tabNormal === 'vg.payment.received' || 
        tabNormal === 'vg.t.payment.received' || 
        tabNormal === 'payment.received') {
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
    if (tabNormal === 'bkkexpenses') return 'BKKExpenses';
    if (tabNormal === 'export.charge') return 'BKKExportCharge';
    if (tabNormal === 'apartment') return 'HotelAccommodation';
    if (tabNormal === 'bkkcapital') return 'BKKCapital';
    if (tabNormal === 'bkk.statement') return 'BKKStatement';
  }

  // --- KENYA OVERRIDES ---
  if (moduleId === 'kenya') {
    if (tabNormal === 'instock') return 'VisionGemsSpinel';
    if (tabNormal === 'cutpolish') return 'CutPolish';
    if (tabNormal === 'export') return 'ExportCharges';
    if (tabNormal === 'traveling.ex') return 'TicketsVisa';
    if (tabNormal === 'bkkexpenses') return 'BKKExpenses'; 
    if (tabNormal === 'bkkhotel') return 'HotelAccommodation'; 
    if (tabNormal === 'kpurchasing') return 'KenyaPurchasing';
    if (tabNormal === 'kexpenses') return 'GeneralExpenses';
  }

  // --- EXPORT CHARGES MAPPING ---
  if (moduleId === 'madagascar' && tabNormal === 'mexport') {
    return 'ExportCharges';
  }
  if (moduleId === 'spinel-gallery' && tabNormal === 'bkkexport') {
    return 'ExportCharges';
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
    if (tabNormal === 'all stones') {
      return 'VisionGemsSpinel';
    }
  }

  if (moduleId === 'vision-gems') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
    const excludedTabs = ['dashboardgems', 'z', 'stone shape', 'approval'];
    if (tabNormal === 'v g old stock') return 'VGOldStock';
    if (!excludedTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'stone shape') return 'ReferenceData'; 
  }

  if (moduleId === 'spinel-gallery') {
    const spinelDesignTabs = ['mahenge', 'spinel', 'blue.sapphire'];
    if (spinelDesignTabs.includes(tabNormal)) return 'VisionGemsSpinel';
    if (tabNormal === 'cut.polish') return 'CutPolishExpenses';
    if (tabNormal === 'sl.expenses') return 'SLExpenses';
    if (tabNormal === 'bkkticket') return 'TicketsVisa';
    if (tabNormal === 'bkkhotel') return 'HotelAccommodation';
    if (tabNormal === 'texpenses') return 'GeneralExpenses';
  }

  // --- GENERAL EXPENSES TEMPLATE MAPPING (6 tabs) ---
  // Note: KExpenses is handled in Kenya overrides section above
  if (moduleId === 'dada') {
    if (tabNormal === 't.expense' || tabNormal === '202412texpense') {
      return 'GeneralExpenses';
    }
    if (tabNormal === 'tickets.visa') {
      return 'TicketsVisa';
    }
  }

  if (moduleId === 'vg-ramazan') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
    if (tabNormal === 't.expenses') {
      return 'GeneralExpenses';
    }
  }

  if (moduleId === 'madagascar') {
    if (tabNormal === 'cut.polish') {
      return 'CutPolishExpenses';
    }
    if (tabNormal === 'mexpenses') {
      return 'GeneralExpenses';
    }
    if (tabNormal === 'tickets.visa') {
      return 'TicketsVisa';
    }
  }

  if (moduleId === 'vgtz') {
    if (tabNormal === 'tz.expenses') {
      return 'GeneralExpenses';
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
    // Azeem in vgtz is handled above as PersonalShares
    if (tabLower === 'azeem' && moduleId !== 'vgtz') return 'PaymentTracking';
    if (tabLower.match(/^\d+/) || tabLower.includes('sheet')) return 'ExpenseLog';
  }
  if (tabLower.includes('stock')) return 'Inventory';
  if (tabLower.includes('payment')) return 'PaymentTracking';
  if (tabLower.includes('ticket')) return 'ExpenseLog'; 
  if (tabLower.includes('export')) return 'ExportInvoice';

  return 'Inventory'; 
};
