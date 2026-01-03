import { getAllStatementEntries } from './statementService';
import { getExportedStones } from './dataService';
import { APP_MODULES } from '../constants';
import { StatementEntry, ExtendedSpinelStone } from '../types';

export interface CompanyMetrics {
  financial: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
    expenseBreakdown: { category: string; amount: number }[];
    revenueTrends: { month: string; revenue: number; expenses: number }[];
    moduleExpenses: { module: string; amount: number }[];
  };
  inventory: {
    totalStones: number;
    inStockCount: number;
    soldCount: number;
    inventoryValue: number;
    soldValue: number;
    statusDistribution: { status: string; count: number; value: number }[];
    varietyBreakdown: { variety: string; count: number; value: number }[];
  };
  outstanding: {
    totalOutstanding: number;
    totalPayables: number;
    paymentsReceived: number;
    outstandingByCustomer: { customer: string; amount: number }[];
  };
  operations: {
    totalPurchases: number;
    totalExports: number;
    capitalTransactions: number;
    expenseByCategory: { category: string; amount: number }[];
  };
}

// Helper to format month from date string
const getMonthKey = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Helper to get month name
const getMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const getCompanyMetrics = async (): Promise<CompanyMetrics> => {
  // Get all statement entries for financial data
  const allEntries = getAllStatementEntries();
  
  // Get all stones for inventory data
  const allStones = getExportedStones();
  
  // Initialize metrics
  let totalRevenue = 0;
  let totalExpenses = 0;
  const expenseByCategory: Record<string, number> = {};
  const expenseByModule: Record<string, number> = {};
  const revenueByMonth: Record<string, { revenue: number; expenses: number }> = {};
  
  // Process financial entries
  allEntries.forEach(entry => {
    totalRevenue += entry.creditLKR;
    totalExpenses += entry.debitLKR;
    
    // Track by transaction type (category)
    if (entry.debitLKR > 0) {
      const category = entry.transactionType;
      expenseByCategory[category] = (expenseByCategory[category] || 0) + entry.debitLKR;
    }
    
    // Track by module
    if (entry.debitLKR > 0) {
      expenseByModule[entry.moduleName] = (expenseByModule[entry.moduleName] || 0) + entry.debitLKR;
    }
    
    // Track monthly trends
    const monthKey = getMonthKey(entry.date);
    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = { revenue: 0, expenses: 0 };
    }
    revenueByMonth[monthKey].revenue += entry.creditLKR;
    revenueByMonth[monthKey].expenses += entry.debitLKR;
  });
  
  // Process inventory data
  let totalStones = 0;
  let inStockCount = 0;
  let soldCount = 0;
  let inventoryValue = 0;
  let soldValue = 0;
  const statusMap: Record<string, { count: number; value: number }> = {};
  const varietyMap: Record<string, { count: number; value: number }> = {};
  
  allStones.forEach(stone => {
    totalStones++;
    const cost = stone.slCost || 0;
    const price = stone.finalPrice || 0;
    const status = stone.status || 'In Stock';
    
    // Status distribution
    if (!statusMap[status]) {
      statusMap[status] = { count: 0, value: 0 };
    }
    statusMap[status].count++;
    statusMap[status].value += cost;
    
    // Variety breakdown
    const variety = stone.variety || 'Other';
    if (!varietyMap[variety]) {
      varietyMap[variety] = { count: 0, value: 0 };
    }
    varietyMap[variety].count++;
    varietyMap[variety].value += cost;
    
    if (status === 'Sold') {
      soldCount++;
      soldValue += price;
    } else if (status === 'In Stock' || status === 'Approval') {
      inStockCount++;
      inventoryValue += cost;
    } else {
      inventoryValue += cost;
    }
  });
  
  // Process outstanding/payables from payment ledgers
  let totalOutstanding = 0;
  let totalPayables = 0;
  let paymentsReceived = 0;
  const outstandingByCustomer: Record<string, number> = {};
  
  APP_MODULES.forEach(module => {
    module.tabs.forEach(tabId => {
      // Check payment ledger
      const paymentKeys = [
        `unified_payment_ledger_${module.id}_${tabId}`,
        `payment_ledger_${module.id}_${tabId}`,
        `payment_${module.id}_${tabId}`
      ];
      
      for (const key of paymentKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const items: any[] = JSON.parse(data);
            items.forEach(item => {
              const outstanding = item.outstandingAmount || 0;
              const paid = item.paidAmount || 0;
              const customer = item.customerName || 'Unknown';
              
              if (module.id === 'outstanding') {
                totalOutstanding += outstanding;
                outstandingByCustomer[customer] = (outstandingByCustomer[customer] || 0) + outstanding;
                paymentsReceived += paid;
              } else if (module.id === 'payable') {
                totalPayables += outstanding;
                paymentsReceived += paid;
              }
            });
            break;
          } catch (e) {
            console.error(`Failed to parse ${key}:`, e);
          }
        }
      }
    });
  });
  
  // Process operations data
  let totalPurchases = 0;
  let totalExports = 0;
  let capitalTransactions = 0;
  const expenseByOpCategory: Record<string, number> = {};
  
  allEntries.forEach(entry => {
    if (entry.transactionType === 'Purchase') {
      totalPurchases += entry.debitLKR;
    } else if (entry.transactionType === 'Export') {
      totalExports += entry.debitLKR;
    } else if (entry.transactionType === 'Capital') {
      capitalTransactions += Math.abs(entry.creditLKR - entry.debitLKR);
    }
    
    // Categorize expenses
    if (entry.debitLKR > 0) {
      const category = entry.transactionType;
      expenseByOpCategory[category] = (expenseByOpCategory[category] || 0) + entry.debitLKR;
    }
  });
  
  // Format monthly trends
  const revenueTrends = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months
    .map(([monthKey, data]) => ({
      month: getMonthName(monthKey),
      revenue: data.revenue,
      expenses: data.expenses
    }));
  
  // Format expense breakdown
  const expenseBreakdown = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  // Format module expenses
  const moduleExpenses = Object.entries(expenseByModule)
    .map(([module, amount]) => ({ module, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  // Format status distribution
  const statusDistribution = Object.entries(statusMap)
    .map(([status, data]) => ({ status, count: data.count, value: data.value }))
    .sort((a, b) => b.count - a.count);
  
  // Format variety breakdown
  const varietyBreakdown = Object.entries(varietyMap)
    .map(([variety, data]) => ({ variety, count: data.count, value: data.value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 varieties
  
  // Format outstanding by customer
  const outstandingByCustomerList = Object.entries(outstandingByCustomer)
    .map(([customer, amount]) => ({ customer, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Top 10 customers
  
  // Format expense by category
  const expenseByCategoryList = Object.entries(expenseByOpCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  
  const netProfit = totalRevenue - totalExpenses;
  const cashBalance = allEntries.length > 0 ? allEntries[allEntries.length - 1].balanceLKR : 0;
  
  return {
    financial: {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashBalance,
      expenseBreakdown,
      revenueTrends,
      moduleExpenses
    },
    inventory: {
      totalStones,
      inStockCount,
      soldCount,
      inventoryValue,
      soldValue,
      statusDistribution,
      varietyBreakdown
    },
    outstanding: {
      totalOutstanding,
      totalPayables,
      paymentsReceived,
      outstandingByCustomer: outstandingByCustomerList
    },
    operations: {
      totalPurchases,
      totalExports,
      capitalTransactions,
      expenseByCategory: expenseByCategoryList
    }
  };
};



