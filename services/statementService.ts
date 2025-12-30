import { APP_MODULES } from '../constants';
import { StatementEntry, ExtendedSpinelStone } from '../types';

// Template type interfaces (matching the actual template interfaces)
interface UnifiedExpenseItem {
  id: string;
  date: string;
  code: string;
  title?: string;
  vendorName?: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

interface CutPolishExpenseItem {
  id: string;
  date: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  [key: string]: any;
}

interface TicketsVisaItem {
  id: string;
  date: string;
  code: string;
  passengerName: string;
  description?: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

interface SpecificServiceItem {
  id: string;
  date: string;
  code: string;
  serviceName?: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

interface PaymentItem {
  id: string;
  date: string;
  code: string;
  customerName: string;
  description: string;
  invoiceAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  paymentDate?: string;
  [key: string]: any;
}

interface UnifiedPurchasingItem {
  id: string;
  date: string;
  code: string;
  supplierName: string;
  cost: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

interface CapitalItem {
  id: string;
  date: string;
  code: string;
  transactionType: 'purchased' | 'exchange' | 'shares';
  amount: number;
  currency: string;
  convertedAmount: number;
  exchangeRate: number;
  [key: string]: any;
}

interface UnifiedExportItem {
  id: string;
  date: string;
  code: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

interface UnifiedStatementItem {
  id: string;
  date: string;
  code: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  type: 'Bank' | 'Cash' | 'Transfer' | 'Cheque' | 'Online' | 'Other';
  [key: string]: any;
}

interface DealRecordItem {
  id: string;
  date: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  [key: string]: any;
}

interface HotelAccommodationItem {
  id: string;
  checkInDate: string;
  code: string;
  hotelName: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
  [key: string]: any;
}

// Helper function to convert amount to LKR
const convertToLKR = (amount: number, currency: string, convertedAmount?: number, exchangeRate?: number): number => {
  if (currency === 'LKR') return amount;
  if (convertedAmount !== undefined && convertedAmount !== null) return convertedAmount;
  if (exchangeRate && exchangeRate > 0) return amount * exchangeRate;
  return amount; // Fallback to original amount if no conversion available
};

// Helper function to get module name
const getModuleName = (moduleId: string): string => {
  const module = APP_MODULES.find(m => m.id === moduleId);
  return module?.name || moduleId;
};

// Extract UnifiedExpense items
const extractUnifiedExpense = (items: UnifiedExpenseItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `expense-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Expense' as const,
      description: item.description || item.title || '',
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0, // Will be calculated later
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract CutPolishExpenses items
const extractCutPolishExpenses = (items: CutPolishExpenseItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency || 'LKR', undefined, undefined);
    return {
      id: `cutpolish-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Expense' as const,
      description: item.description || `Cut & Polish - ${item.name}`,
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract TicketsVisa items
const extractTicketsVisa = (items: TicketsVisaItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `ticket-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Expense' as const,
      description: item.description || `Ticket/Visa - ${item.passengerName}`,
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract SpecificServices items
const extractSpecificServices = (items: SpecificServiceItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `service-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Expense' as const,
      description: item.description || item.serviceName || '',
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract UnifiedPaymentLedger items
const extractPaymentLedger = (items: PaymentItem[], moduleId: string, tabId: string): StatementEntry[] => {
  const entries: StatementEntry[] = [];
  
  items.forEach(item => {
    // Paid amounts are credits (money in)
    if (item.paidAmount > 0) {
      const lkrAmount = convertToLKR(item.paidAmount, item.currency, item.convertedAmount, item.exchangeRate);
      entries.push({
        id: `payment-credit-${item.id}`,
        date: item.paymentDate || item.date,
        moduleId,
        moduleName: getModuleName(moduleId),
        tabId,
        tabName: tabId,
        transactionType: 'Income' as const,
        description: `Payment Received - ${item.description}`,
        reference: item.code,
        debitLKR: 0,
        creditLKR: lkrAmount,
        balanceLKR: 0,
        originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
        originalAmount: item.currency !== 'LKR' ? item.paidAmount : undefined,
        metadata: item
      });
    }
    
    // Outstanding amounts in payable module are debits (money owed)
    if (moduleId === 'payable' && item.outstandingAmount > 0 && item.status === 'Paid') {
      const lkrAmount = convertToLKR(item.outstandingAmount, item.currency, item.convertedAmount, item.exchangeRate);
      entries.push({
        id: `payable-debit-${item.id}`,
        date: item.paymentDate || item.date,
        moduleId,
        moduleName: getModuleName(moduleId),
        tabId,
        tabName: tabId,
        transactionType: 'Expense' as const,
        description: `Payable Paid - ${item.description}`,
        reference: item.code,
        debitLKR: lkrAmount,
        creditLKR: 0,
        balanceLKR: 0,
        originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
        originalAmount: item.currency !== 'LKR' ? item.outstandingAmount : undefined,
        metadata: item
      });
    }
  });
  
  return entries;
};

// Extract UnifiedPurchasing items
const extractPurchasing = (items: UnifiedPurchasingItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.cost, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `purchase-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Purchase' as const,
      description: item.description || `Purchase - ${item.supplierName}`,
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.cost : undefined,
      metadata: item
    };
  });
};

// Extract Capital items
const extractCapital = (items: CapitalItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = item.convertedAmount || convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    const isDebit = item.transactionType === 'purchased' || item.transactionType === 'exchange';
    
    return {
      id: `capital-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Capital' as const,
      description: item.description || `Capital ${item.transactionType} - ${item.vendorName || ''}`,
      reference: item.code,
      debitLKR: isDebit ? lkrAmount : 0,
      creditLKR: isDebit ? 0 : lkrAmount,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract Export items
const extractExport = (items: UnifiedExportItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `export-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Export' as const,
      description: item.description,
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract Statement items
const extractStatement = (items: UnifiedStatementItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    // Bank/Cash deposits are credits, withdrawals are debits
    const isCredit = item.type === 'Bank' || item.type === 'Cash';
    
    return {
      id: `statement-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Statement' as const,
      description: item.description,
      reference: item.code,
      debitLKR: isCredit ? 0 : lkrAmount,
      creditLKR: isCredit ? lkrAmount : 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract DealRecord items (always credits - income)
const extractDealRecord = (items: DealRecordItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    return {
      id: `deal-${item.id}`,
      date: item.date,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Income' as const,
      description: item.description || `Deal - ${item.name}`,
      reference: item.code,
      debitLKR: 0,
      creditLKR: item.amount, // Assuming LKR for DealRecord
      balanceLKR: 0,
      metadata: item
    };
  });
};

// Extract HotelAccommodation items
const extractHotelAccommodation = (items: HotelAccommodationItem[], moduleId: string, tabId: string): StatementEntry[] => {
  return items.map(item => {
    const lkrAmount = convertToLKR(item.amount, item.currency, item.convertedAmount, item.exchangeRate);
    return {
      id: `hotel-${item.id}`,
      date: item.checkInDate,
      moduleId,
      moduleName: getModuleName(moduleId),
      tabId,
      tabName: tabId,
      transactionType: 'Expense' as const,
      description: `Hotel - ${item.hotelName}`,
      reference: item.code,
      debitLKR: lkrAmount,
      creditLKR: 0,
      balanceLKR: 0,
      originalCurrency: item.currency !== 'LKR' ? item.currency : undefined,
      originalAmount: item.currency !== 'LKR' ? item.amount : undefined,
      metadata: item
    };
  });
};

// Extract Stone Sales (from inventory)
const extractStoneSales = (stones: ExtendedSpinelStone[], moduleId: string, tabId: string): StatementEntry[] => {
  const entries: StatementEntry[] = [];
  
  stones.forEach(stone => {
    // Only include sold stones with sales information
    if (stone.status === 'Sold' && stone.finalPrice && stone.finalPrice > 0 && stone.sellDate) {
      const saleAmount = stone.finalPrice || stone.amountLKR || stone.sellingPrice || 0;
      
      // Create income entry for the sale
      entries.push({
        id: `stone-sale-${stone.id}`,
        date: stone.sellDate,
        moduleId,
        moduleName: getModuleName(moduleId),
        tabId,
        tabName: tabId,
        transactionType: 'Income' as const,
        description: `Stone Sale - ${stone.codeNo} (${stone.variety})`,
        reference: stone.codeNo,
        debitLKR: 0,
        creditLKR: saleAmount,
        balanceLKR: 0,
        metadata: {
          ...stone,
          buyer: stone.buyer,
          variety: stone.variety,
          weight: stone.weight,
          shape: stone.shape
        }
      });
      
      // If payment was received, create a separate payment received entry
      if (stone.salesPaymentStatus === 'Paid' && stone.paymentReceivedDate) {
        const paidAmount = stone.transactionAmount || saleAmount;
        entries.push({
          id: `stone-payment-${stone.id}`,
          date: stone.paymentReceivedDate,
          moduleId,
          moduleName: getModuleName(moduleId),
          tabId,
          tabName: tabId,
          transactionType: 'Income' as const,
          description: `Payment Received - ${stone.codeNo} (${stone.buyer || 'Buyer'})`,
          reference: `${stone.codeNo}-PAY`,
          debitLKR: 0,
          creditLKR: paidAmount,
          balanceLKR: 0,
          metadata: {
            ...stone,
            paymentMethod: stone.salesPaymentMethod
          }
        });
      }
    }
  });
  
  return entries;
};

// Main function to aggregate all statement data
export const getAllStatementEntries = (): StatementEntry[] => {
  const allEntries: StatementEntry[] = [];
  
  // Iterate through all modules and tabs
  APP_MODULES.forEach(module => {
    module.tabs.forEach(tabId => {
      // Skip dashboard tabs
      if (tabId.toLowerCase().includes('dashboard')) return;
      
      // UnifiedExpense - check multiple possible key patterns
      const expenseKeys = [
        `unified_expense_${module.id}_${tabId}`,
        `expense_${module.id}_${tabId}`,
        `unified_expenses_${module.id}_${tabId}`
      ];
      for (const expenseKey of expenseKeys) {
        const expenseData = localStorage.getItem(expenseKey);
        if (expenseData) {
          try {
            const items: UnifiedExpenseItem[] = JSON.parse(expenseData);
            allEntries.push(...extractUnifiedExpense(items, module.id, tabId));
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error(`Failed to parse unified_expense for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // CutPolishExpenses
      const cutPolishKey = `cut_polish_expenses_${module.id}_${tabId}`;
      const cutPolishData = localStorage.getItem(cutPolishKey);
      if (cutPolishData) {
        try {
          const items: CutPolishExpenseItem[] = JSON.parse(cutPolishData);
          allEntries.push(...extractCutPolishExpenses(items, module.id, tabId));
        } catch (e) {
          console.error(`Failed to parse cut_polish_expenses for ${module.id}/${tabId}:`, e);
        }
      }
      
      // TicketsVisa - check multiple possible key patterns
      const ticketsKeys = [
        `tickets_visa_${module.id}_${tabId}`,
        `ticket_visa_${module.id}_${tabId}`,
        `tickets_${module.id}_${tabId}`
      ];
      for (const ticketsKey of ticketsKeys) {
        const ticketsData = localStorage.getItem(ticketsKey);
        if (ticketsData) {
          try {
            const items: TicketsVisaItem[] = JSON.parse(ticketsData);
            allEntries.push(...extractTicketsVisa(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse tickets_visa for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // SpecificServices - check multiple possible key patterns
      const servicesKeys = [
        `specific_services_${module.id}_${tabId}`,
        `specific_service_${module.id}_${tabId}`,
        `services_${module.id}_${tabId}`
      ];
      for (const servicesKey of servicesKeys) {
        const servicesData = localStorage.getItem(servicesKey);
        if (servicesData) {
          try {
            const items: SpecificServiceItem[] = JSON.parse(servicesData);
            allEntries.push(...extractSpecificServices(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse specific_services for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // UnifiedPaymentLedger - check multiple possible key patterns
      const paymentKeys = [
        `unified_payment_ledger_${module.id}_${tabId}`,
        `payment_ledger_${module.id}_${tabId}`,
        `payment_${module.id}_${tabId}`
      ];
      for (const paymentKey of paymentKeys) {
        const paymentData = localStorage.getItem(paymentKey);
        if (paymentData) {
          try {
            const items: PaymentItem[] = JSON.parse(paymentData);
            allEntries.push(...extractPaymentLedger(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse unified_payment_ledger for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // UnifiedPurchasing - check multiple possible key patterns
      const purchasingKeys = [
        `unified_purchasing_${module.id}_${tabId}`,
        `purchasing_${module.id}_${tabId}`,
        `purchase_${module.id}_${tabId}`
      ];
      for (const purchasingKey of purchasingKeys) {
        const purchasingData = localStorage.getItem(purchasingKey);
        if (purchasingData) {
          try {
            const items: UnifiedPurchasingItem[] = JSON.parse(purchasingData);
            allEntries.push(...extractPurchasing(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse unified_purchasing for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // UnifiedCapitalManagement - check multiple possible key patterns
      const capitalKeys = [
        `unified_capital_${module.id}_${tabId}`,
        `capital_${module.id}_${tabId}`,
        `unified_capital_management_${module.id}_${tabId}`
      ];
      for (const capitalKey of capitalKeys) {
        const capitalData = localStorage.getItem(capitalKey);
        if (capitalData) {
          try {
            const items: CapitalItem[] = JSON.parse(capitalData);
            allEntries.push(...extractCapital(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse unified_capital for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // UnifiedExport - check multiple possible key patterns
      const exportKeys = [
        `unified_export_${module.id}_${tabId}`,
        `export_${module.id}_${tabId}`,
        `unified_export_records_${module.id}_${tabId}`
      ];
      for (const exportKey of exportKeys) {
        const exportData = localStorage.getItem(exportKey);
        if (exportData) {
          try {
            const items: UnifiedExportItem[] = JSON.parse(exportData);
            allEntries.push(...extractExport(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse unified_export for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // UnifiedStatement - check multiple possible key patterns
      const statementKeys = [
        `unified_statement_${module.id}_${tabId}`,
        `statement_${module.id}_${tabId}`
      ];
      for (const statementKey of statementKeys) {
        const statementData = localStorage.getItem(statementKey);
        if (statementData) {
          try {
            const items: UnifiedStatementItem[] = JSON.parse(statementData);
            allEntries.push(...extractStatement(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse unified_statement for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // DealRecord - check multiple possible key patterns
      const dealKeys = [
        `deal_record_${module.id}_${tabId}`,
        `deal_${module.id}_${tabId}`
      ];
      for (const dealKey of dealKeys) {
        const dealData = localStorage.getItem(dealKey);
        if (dealData) {
          try {
            const items: DealRecordItem[] = JSON.parse(dealData);
            allEntries.push(...extractDealRecord(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse deal_record for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // HotelAccommodation - check multiple possible key patterns
      const hotelKeys = [
        `hotel_accommodation_${module.id}_${tabId}`,
        `hotel_${module.id}_${tabId}`,
        `accommodation_${module.id}_${tabId}`
      ];
      for (const hotelKey of hotelKeys) {
        const hotelData = localStorage.getItem(hotelKey);
        if (hotelData) {
          try {
            const items: HotelAccommodationItem[] = JSON.parse(hotelData);
            allEntries.push(...extractHotelAccommodation(items, module.id, tabId));
            break;
          } catch (e) {
            console.error(`Failed to parse hotel_accommodation for ${module.id}/${tabId}:`, e);
          }
        }
      }
      
      // Stone Sales - check stone persistence registry
      // This applies to inventory modules (vision-gems, spinel-gallery, etc.)
      // We'll process stones once globally, not per tab, to avoid duplicates
      // This will be handled after the module loop
    });
  });
  
  // Extract Stone Sales from global registry (process once to avoid duplicates)
  const stoneRegistryKey = 'vg_stone_persistence_registry_v2';
  const stoneRegistryData = localStorage.getItem(stoneRegistryKey);
  if (stoneRegistryData) {
    try {
      const allStones: ExtendedSpinelStone[] = JSON.parse(stoneRegistryData);
      const soldStones = allStones.filter(stone => stone.status === 'Sold' && stone.finalPrice && stone.finalPrice > 0 && stone.sellDate);
      
      soldStones.forEach(stone => {
        // Determine module and tab from stone's location/originalCategory
        let targetModuleId = 'vision-gems'; // Default
        let targetTabId = stone.originalCategory || stone.location || 'Spinel'; // Default
        
        // Try to match to actual module/tab
        APP_MODULES.forEach(mod => {
          if (mod.type === 'inventory' || mod.id === 'vision-gems' || mod.id === 'spinel-gallery') {
            const matchingTab = mod.tabs.find(tab => {
              const tabLower = tab.toLowerCase();
              const stoneLocation = (stone.location || '').toLowerCase();
              const stoneCategory = (stone.originalCategory || '').toLowerCase();
              return stoneLocation.includes(tabLower) || 
                     stoneCategory.includes(tabLower) ||
                     tabLower.includes(stoneLocation) ||
                     tabLower.includes(stoneCategory);
            });
            if (matchingTab) {
              targetModuleId = mod.id;
              targetTabId = matchingTab;
            }
          }
        });
        
        const saleAmount = stone.finalPrice || stone.amountLKR || stone.sellingPrice || 0;
        
        // Create income entry for the sale
        allEntries.push({
          id: `stone-sale-${stone.id}`,
          date: stone.sellDate,
          moduleId: targetModuleId,
          moduleName: getModuleName(targetModuleId),
          tabId: targetTabId,
          tabName: targetTabId,
          transactionType: 'Income' as const,
          description: `Stone Sale - ${stone.codeNo} (${stone.variety || 'Stone'})`,
          reference: stone.codeNo,
          debitLKR: 0,
          creditLKR: saleAmount,
          balanceLKR: 0,
          metadata: {
            ...stone,
            buyer: stone.buyer,
            variety: stone.variety,
            weight: stone.weight,
            shape: stone.shape
          }
        });
        
        // If payment was received, create a separate payment received entry
        if (stone.salesPaymentStatus === 'Paid' && stone.paymentReceivedDate) {
          const paidAmount = stone.transactionAmount || saleAmount;
          allEntries.push({
            id: `stone-payment-${stone.id}`,
            date: stone.paymentReceivedDate,
            moduleId: targetModuleId,
            moduleName: getModuleName(targetModuleId),
            tabId: targetTabId,
            tabName: targetTabId,
            transactionType: 'Income' as const,
            description: `Payment Received - ${stone.codeNo} (${stone.buyer || 'Buyer'})`,
            reference: `${stone.codeNo}-PAY`,
            debitLKR: 0,
            creditLKR: paidAmount,
            balanceLKR: 0,
            metadata: {
              ...stone,
              paymentMethod: stone.salesPaymentMethod
            }
          });
        }
      });
    } catch (e) {
      console.error('Failed to parse stone registry:', e);
    }
  }
  
  // Sort by date (oldest first)
  allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate running balance
  let runningBalance = 0;
  allEntries.forEach(entry => {
    runningBalance += entry.creditLKR - entry.debitLKR;
    entry.balanceLKR = runningBalance;
  });
  
  return allEntries;
};

