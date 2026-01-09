
import { DashboardConfig } from '../utils/dashboardConfig';
import { getVisionGemsSpinelData } from './dataService';
import { APP_MODULES } from '../constants';

interface DashboardData {
  metrics: Record<string, number | string>;
  breakdowns?: {
    expenses?: { category: string; value: number; currency?: string }[];
    varieties?: { variety: string; cost: number | string; sales: number | string; profit?: number; received?: number; outstanding?: number; weight?: number; count?: number }[];
    suppliers?: { supplier: string; amount: number | string; payable?: number }[];
    shares?: { category: string; amount: number }[];
    monthly?: { month: string; [key: string]: number | string }[];
    
    // New fields for Rich Dashboard
    statusDist?: { name: string; value: number; color: string }[];
    topItems?: any[];
    
    // New fields for All Expenses Dashboard
    categories?: { name: string; amount: number; payable?: number; trend?: 'up' | 'down' | 'stable'; id: string }[];
    recent?: { date: string; category: string; description: string; amount: number; status: string }[];

    // New fields for Outstanding Dashboard
    customerSummary?: {
      id: string;
      name: string;
      slAmount: number;
      rmb: number;
      bath: number;
      usd: number;
      finalAmount: number;
      received: number;
      balance: number;
      status: 'Cleared' | 'Pending' | 'Overdue';
    }[];
    paymentTracking?: {
      source: string;
      total: number;
      count: number;
      lastDate: string;
    }[];
    currencyBreakdown?: {
      name: string;
      value: number;
      color: string;
    }[];
    titleBreakdowns?: {
      title: string;
      sourceTabs: string[];
      slAmountTotal: number;
      slAmountOutstanding: number;
      rmbTotal: number;
      rmbOutstanding: number;
      bathTotal: number;
      bathOutstanding: number;
      usdTotal: number;
      usdOutstanding: number;
      finalAmount: number;
      totalAmounts: number;
      receivedPayments: number;
      cleared: 'Cleared' | 'Pending' | 'Overdue';
      transactionCount: number;
      transactions: any[];
    }[];
  };
}

// Helper function to load all expenses from a module
const loadModuleExpenses = (moduleId: string): number => {
  let totalExpenses = 0;
  const module = APP_MODULES.find(m => m.id === moduleId);
  if (!module) return 0;

  module.tabs.forEach(tabId => {
    // Skip dashboard tabs
    if (tabId.toLowerCase().includes('dashboard')) return;

    // UnifiedExpense - check multiple possible key patterns
    const expenseKeys = [
      `unified_expense_${moduleId}_${tabId}`,
      `expense_${moduleId}_${tabId}`,
      `unified_expenses_${moduleId}_${tabId}`
    ];
    for (const expenseKey of expenseKeys) {
      const expenseData = localStorage.getItem(expenseKey);
      if (expenseData) {
        try {
          const items: any[] = JSON.parse(expenseData);
          items.forEach(item => {
            totalExpenses += item.convertedAmount || item.amount || 0;
          });
          break; // Found data, no need to check other keys
        } catch (e) {
          console.error(`Failed to parse unified_expense for ${moduleId}/${tabId}:`, e);
        }
      }
    }

    // CutPolishExpenses
    const cutPolishKey = `cut_polish_expenses_${moduleId}_${tabId}`;
    const cutPolishData = localStorage.getItem(cutPolishKey);
    if (cutPolishData) {
      try {
        const items: any[] = JSON.parse(cutPolishData);
        items.forEach(item => {
          totalExpenses += item.convertedAmount || item.amount || 0;
        });
      } catch (e) {
        console.error(`Failed to parse cut_polish_expenses for ${moduleId}/${tabId}:`, e);
      }
    }

    // TicketsVisa - check multiple possible key patterns
    const ticketsKeys = [
      `tickets_visa_${moduleId}_${tabId}`,
      `ticket_visa_${moduleId}_${tabId}`,
      `tickets_${moduleId}_${tabId}`
    ];
    for (const ticketsKey of ticketsKeys) {
      const ticketsData = localStorage.getItem(ticketsKey);
      if (ticketsData) {
        try {
          const items: any[] = JSON.parse(ticketsData);
          items.forEach(item => {
            totalExpenses += item.convertedAmount || item.amount || 0;
          });
          break; // Found data, no need to check other keys
        } catch (e) {
          console.error(`Failed to parse tickets_visa for ${moduleId}/${tabId}:`, e);
        }
      }
    }

    // HotelAccommodation
    const hotelKey = `hotel_accommodation_${moduleId}_${tabId}`;
    const hotelData = localStorage.getItem(hotelKey);
    if (hotelData) {
      try {
        const items: any[] = JSON.parse(hotelData);
        items.forEach(item => {
          totalExpenses += item.convertedAmount || item.amount || 0;
        });
      } catch (e) {
        console.error(`Failed to parse hotel_accommodation for ${moduleId}/${tabId}:`, e);
      }
    }

    // UnifiedExport (export charges are expenses)
    const exportKey = `unified_export_${moduleId}_${tabId}`;
    const exportData = localStorage.getItem(exportKey);
    if (exportData) {
      try {
        const items: any[] = JSON.parse(exportData);
        items.forEach(item => {
          totalExpenses += item.convertedAmount || item.amount || 0;
        });
      } catch (e) {
        console.error(`Failed to parse unified_export for ${moduleId}/${tabId}:`, e);
      }
    }
  });

  return totalExpenses;
};

// Helper function to calculate profit from inventory data
const calculateProfitFromInventory = async (
  moduleId: string,
  tabsToAggregate: string[]
): Promise<{ salesRevenue: number; inventoryCost: number; profit: number }> => {
  let salesRevenue = 0;
  let inventoryCost = 0;

  // Fetch data from all inventory tabs
  const results = await Promise.all(
    tabsToAggregate.map(tab => getVisionGemsSpinelData(tab, moduleId))
  );

  results.flat().forEach(stone => {
    const cost = stone.slCost || 0;
    const price = stone.finalPrice || stone.amountLKR || 0;
    const status = stone.status || 'In Stock';

    // Add to inventory cost (all stones)
    inventoryCost += cost;

    // Add to sales revenue (only sold stones)
    if (status.toLowerCase().includes('sold')) {
      salesRevenue += price;
    }
  });

  return { salesRevenue, inventoryCost, profit: salesRevenue - inventoryCost };
};

export const getDashboardData = async (config: DashboardConfig): Promise<DashboardData> => {
  
  // --- SPECIAL LOGIC FOR VISION GEMS MAIN DASHBOARD ---
  if (config.dataKey === "vision_gems_dashboard") {
    // 1. Define tabs to aggregate
    const tabsToAggregate = [
      'spinel', 'tsv', 'mandarin.garnet', 'garnet', 'ruby', 
      'blue.sapphire', 'green.sapphire', 'chrysoberyl'
    ];

    let totalCost = 0;
    let totalSalesLKR = 0;
    let totalSalesRMB = 0;
    let totalProfit = 0;
    let totalItems = 0;
    let totalWeight = 0;

    const varietyMap: Record<string, { cost: number, sales: number, count: number, weight: number }> = {};
    const statusMap: Record<string, number> = { 'In Stock': 0, 'Sold': 0, 'Export': 0, 'Memo': 0 };
    let allItems: any[] = [];

    // 2. Fetch data in parallel
    const results = await Promise.all(tabsToAggregate.map(tab => getVisionGemsSpinelData(tab)));

    // 3. Process Data
    results.flat().forEach(stone => {
      totalItems++;
      const cost = stone.slCost || 0;
      const price = stone.finalPrice || 0;
      const weight = stone.weight || 0;
      const profit = stone.profit || 0;
      const status = stone.status || 'In Stock';

      // Aggregates
      totalCost += cost;
      if (status.toLowerCase().includes('sold')) {
        totalSalesLKR += price; // Assuming LKR for main tally
        totalProfit += profit;
      }
      
      if (stone.priceRMB) {
        totalSalesRMB += stone.priceRMB;
      }

      totalWeight += weight;

      // Status Distribution
      if (status.toLowerCase().includes('sold')) statusMap['Sold']++;
      else if (status.toLowerCase().includes('stock')) statusMap['In Stock']++;
      else if (status.toLowerCase().includes('export')) statusMap['Export']++;
      else statusMap['Memo']++; // Approval/Other

      // Variety Breakdown
      const vKey = stone.variety || 'Other';
      if (!varietyMap[vKey]) varietyMap[vKey] = { cost: 0, sales: 0, count: 0, weight: 0 };
      varietyMap[vKey].cost += cost;
      varietyMap[vKey].weight += weight;
      varietyMap[vKey].count += 1;
      if (status.toLowerCase().includes('sold')) {
        varietyMap[vKey].sales += price;
      }

      allItems.push({
        ...stone,
        displayVariety: vKey
      });
    });

    // 4. Format Breakdown for Charts
    const varietyBreakdown = Object.entries(varietyMap).map(([v, stats]) => ({
      variety: v,
      cost: stats.cost,
      sales: stats.sales,
      weight: stats.weight,
      count: stats.count
    })).sort((a,b) => b.cost - a.cost);

    const statusDist = [
      { name: 'In Stock', value: statusMap['In Stock'], color: '#10B981' }, // Emerald
      { name: 'Sold', value: statusMap['Sold'], color: '#3B82F6' },     // Blue
      { name: 'Export', value: statusMap['Export'], color: '#F59E0B' }, // Amber
      { name: 'Memo/Other', value: statusMap['Memo'], color: '#6B7280' } // Gray
    ].filter(i => i.value > 0);

    // Top 5 High Value Items (In Stock)
    const topItems = allItems
      .filter(i => i.status === 'In Stock')
      .sort((a, b) => (b.slCost || 0) - (a.slCost || 0))
      .slice(0, 5);

    // Calculate expenses from vision-gems and all-expenses modules
    const visionGemsExpenses = loadModuleExpenses('vision-gems');
    const allExpensesExpenses = loadModuleExpenses('all-expenses');
    const totalExpenses = visionGemsExpenses + allExpensesExpenses;

    // Calculate net profit: Sales Revenue - Inventory Cost - Expenses
    const netProfit = totalSalesLKR - totalCost - totalExpenses;

    return {
      metrics: {
        cost: totalCost,
        rsSales: totalSalesLKR,
        rmbSales: totalSalesRMB,
        profit: totalProfit,
        netProfit: netProfit,
        totalExpenses: totalExpenses,
        weight: totalWeight,
        count: totalItems
      },
      breakdowns: {
        varieties: varietyBreakdown,
        statusDist: statusDist,
        topItems: topItems
      }
    };
  }

  // --- OUTSTANDING DASHBOARD (Aggregating 35 Tabs) ---
  if (config.dataKey === "outstanding_dashboard") {
    
    // Normalize tabId to handle spaces and ensure consistency
    const normalizeTabId = (tabId: string): string => {
      return tabId.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    };

    // Helper function to load data from localStorage
    const loadTabData = (tabId: string): any[] => {
      try {
        const normalizedTabId = normalizeTabId(tabId);
        const storageKey = `unified_payment_ledger_outstanding_${normalizedTabId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error(`Error loading data for tab ${tabId}:`, e);
      }
      return [];
    };

    // Payment Received Tabs (1 tab)
    const paymentTabs = [
      "Payment Received"
    ];

    const paymentData: { source: string; total: number; count: number; lastDate: string }[] = [];
    let totalReceived = 0;

    paymentTabs.forEach(tabId => {
      const items = loadTabData(tabId);
      if (items.length > 0) {
        const total = items.reduce((sum: number, item: any) => {
          // Sum paidAmount, converting to LKR if needed
          const paid = item.paidAmount || 0;
          const currency = item.currency || 'LKR';
          if (currency === 'LKR') {
            return sum + paid;
          } else if (currency === 'USD') {
            return sum + (paid * (item.exchangeRate || 300));
          } else if (currency === 'THB') {
            return sum + (paid * (item.exchangeRate || 8.5));
          } else if (currency === 'RMB') {
            return sum + (paid * (item.exchangeRate || 42));
          }
          return sum + paid;
        }, 0);

        // Find last payment date
        const dates = items
          .filter((item: any) => item.paymentDate)
          .map((item: any) => new Date(item.paymentDate).getTime())
          .sort((a: number, b: number) => b - a);
        
        const lastDate = dates.length > 0 
          ? new Date(dates[0]).toISOString().split('T')[0]
          : '';

        paymentData.push({
          source: tabId,
          total,
          count: items.length,
          lastDate
        });

        totalReceived += total;
      }
    });

    // Customer Ledger Tabs (27 tabs)
    const customerTabs = [
      "Zahran", "SrilankaSales", "SajithOnline", "Ziyam",
      "InfazHaji", "NusrathAli", "Binara", "MikdarHaji", "RameesNana",
      "Shimar", "Ruqshan", "FaizeenHaj", "SharikHaj", "Fazeel",
      "AzeemColo", "Kadarhaj.colo", "AlthafHaj", "BangkokSales",
      "ChinaSales", "Bangkok", "Name", "Name1"
    ];

    const customerRows: {
      id: string;
      name: string;
      slAmount: number;
      rmb: number;
      bath: number;
      usd: number;
      finalAmount: number;
      received: number;
      balance: number;
      status: 'Cleared' | 'Pending' | 'Overdue';
    }[] = [];

    customerTabs.forEach((tabId, index) => {
      const items = loadTabData(tabId);
      if (items.length > 0) {
        let totalInvoice = 0;
        let totalPaid = 0;
        let totalOutstanding = 0;
        let rmb = 0;
        let bath = 0;
        let usd = 0;

        items.forEach((item: any) => {
          const invoice = item.invoiceAmount || item.finalAmount || 0;
          const paid = item.paidAmount || 0;
          const outstanding = item.outstandingAmount || (invoice - paid);
          const currency = item.currency || 'LKR';

          totalInvoice += invoice;
          totalPaid += paid;
          totalOutstanding += outstanding;

          // Track currency amounts
          if (currency === 'USD') {
            usd += outstanding;
          } else if (currency === 'RMB') {
            rmb += outstanding;
          } else if (currency === 'THB') {
            bath += outstanding;
          }
        });

        const balance = totalOutstanding;
        let status: 'Cleared' | 'Pending' | 'Overdue' = 'Cleared';
        if (balance > 0) {
          status = balance > 5000000 ? 'Overdue' : 'Pending';
        }

        customerRows.push({
          id: `cust-${index}`,
          name: tabId,
          slAmount: totalInvoice,
          rmb,
          bath,
          usd,
          finalAmount: totalInvoice,
          received: totalPaid,
          balance,
          status
        });
      }
    });

    // Calculate totals
    const totalOutstandingLKR = customerRows.reduce((acc, curr) => {
      // Convert all currencies to LKR for total
      return acc + curr.balance + (curr.usd * 300) + (curr.bath * 8.5) + (curr.rmb * 42);
    }, 0);
    
    const totalOutstandingUSD = customerRows.reduce((acc, curr) => acc + curr.usd, 0);
    const activeCustomers = customerRows.filter(c => c.balance > 0).length;

    // Currency Breakdown
    const lkrTotal = customerRows.reduce((acc, curr) => acc + curr.balance, 0);
    const usdTotal = customerRows.reduce((acc, curr) => acc + (curr.usd * 300), 0);
    const rmbTotal = customerRows.reduce((acc, curr) => acc + (curr.rmb * 42), 0);
    const thbTotal = customerRows.reduce((acc, curr) => acc + (curr.bath * 8.5), 0);

    const currencyBreakdown = [
      { name: 'LKR', value: lkrTotal, color: '#3B82F6' },
      { name: 'USD', value: usdTotal, color: '#10B981' },
      { name: 'RMB', value: rmbTotal, color: '#EF4444' },
      { name: 'THB', value: thbTotal, color: '#F59E0B' }
    ].filter(item => item.value > 0);

    // Title Breakdowns - Aggregate all titles from specific tabs
    const titleTabs = ['BangkokSales', 'ChinaSales', 'SrilankaSales'];
    
    // Map to aggregate titles across all tabs: title -> { transactions[], sourceTabs[] }
    const titleMap = new Map<string, { transactions: any[]; sourceTabs: string[] }>();
    
    // Collect all transactions grouped by title
    titleTabs.forEach(tabId => {
      const items = loadTabData(tabId);
      items.forEach((item: any) => {
        const title = item.title?.trim() || '';
        if (!title) return; // Skip items without titles
        
        if (!titleMap.has(title)) {
          titleMap.set(title, { transactions: [], sourceTabs: [] });
        }
        const titleData = titleMap.get(title)!;
        titleData.transactions.push(item);
        if (!titleData.sourceTabs.includes(tabId)) {
          titleData.sourceTabs.push(tabId);
        }
      });
    });

    // Calculate currency breakdowns for each title
    const titleBreakdowns: {
      title: string;
      sourceTabs: string[];
      // Currency-specific amounts (in original currency)
      slAmountTotal: number;      // LKR total invoice
      slAmountOutstanding: number; // LKR outstanding
      rmbTotal: number;            // RMB total invoice
      rmbOutstanding: number;      // RMB outstanding
      bathTotal: number;           // THB total invoice
      bathOutstanding: number;     // THB outstanding
      usdTotal: number;             // USD total invoice
      usdOutstanding: number;       // USD outstanding
      // Converted totals (all in LKR)
      finalAmount: number;          // Total invoice amount in LKR
      totalAmounts: number;        // Same as finalAmount
      receivedPayments: number;     // Total paid in LKR
      cleared: 'Cleared' | 'Pending' | 'Overdue';
      transactionCount: number;
      transactions: any[];
    }[] = [];

    const today = new Date().toISOString().split('T')[0];
    const exchangeRates = { USD: 300, RMB: 42, THB: 8.5 };

    titleMap.forEach((titleData, title) => {
      let slAmountTotal = 0;
      let slAmountOutstanding = 0;
      let rmbTotal = 0;
      let rmbOutstanding = 0;
      let bathTotal = 0;
      let bathOutstanding = 0;
      let usdTotal = 0;
      let usdOutstanding = 0;
      let totalPaidLKR = 0;
      let hasOverdue = false;

      titleData.transactions.forEach((item: any) => {
        const invoice = item.invoiceAmount || item.finalAmount || 0;
        const paid = item.paidAmount || 0;
        const outstanding = item.outstandingAmount || (invoice - paid);
        const currency = item.currency || 'LKR';
        const exchangeRate = item.exchangeRate || exchangeRates[currency as keyof typeof exchangeRates] || 1;

        // Accumulate by currency
        if (currency === 'LKR') {
          slAmountTotal += invoice;
          slAmountOutstanding += outstanding;
          totalPaidLKR += paid;
        } else if (currency === 'RMB') {
          rmbTotal += invoice;
          rmbOutstanding += outstanding;
          totalPaidLKR += paid * exchangeRate;
        } else if (currency === 'THB') {
          bathTotal += invoice;
          bathOutstanding += outstanding;
          totalPaidLKR += paid * exchangeRate;
        } else if (currency === 'USD') {
          usdTotal += invoice;
          usdOutstanding += outstanding;
          totalPaidLKR += paid * exchangeRate;
        }

        // Check for overdue
        if (!hasOverdue && outstanding > 0 && item.dueDate) {
          hasOverdue = item.dueDate < today;
        }
      });

      // Calculate final amounts (all converted to LKR)
      const finalAmount = 
        slAmountTotal + 
        (rmbTotal * exchangeRates.RMB) + 
        (bathTotal * exchangeRates.THB) + 
        (usdTotal * exchangeRates.USD);
      
      const totalOutstandingLKR = 
        slAmountOutstanding + 
        (rmbOutstanding * exchangeRates.RMB) + 
        (bathOutstanding * exchangeRates.THB) + 
        (usdOutstanding * exchangeRates.USD);

      // Determine status
      let cleared: 'Cleared' | 'Pending' | 'Overdue' = 'Cleared';
      if (totalOutstandingLKR > 0) {
        cleared = hasOverdue ? 'Overdue' : 'Pending';
      }

      titleBreakdowns.push({
        title,
        sourceTabs: titleData.sourceTabs,
        slAmountTotal,
        slAmountOutstanding,
        rmbTotal,
        rmbOutstanding,
        bathTotal,
        bathOutstanding,
        usdTotal,
        usdOutstanding,
        finalAmount,
        totalAmounts: finalAmount,
        receivedPayments: totalPaidLKR,
        cleared,
        transactionCount: titleData.transactions.length,
        transactions: titleData.transactions
      });
    });

    // Sort by final amount descending
    titleBreakdowns.sort((a, b) => b.finalAmount - a.finalAmount);

    return {
      metrics: {
        totalOutstandingLKR,
        totalOutstandingUSD,
        customerCount: activeCustomers,
        totalReceived
      },
      breakdowns: {
        customerSummary: customerRows.sort((a, b) => b.balance - a.balance),
        paymentTracking: paymentData,
        currencyBreakdown,
        titleBreakdowns: titleBreakdowns.length > 0 ? titleBreakdowns : undefined
      }
    };
  }

  // --- MOCK DATA FOR SPINEL GALLERY DASHBOARD (Exact Replica of Vision Gems Design) ---
  if (config.dataKey === "spinel_main_dashboard") {
    return {
      metrics: {
        cost: 45000000,
        rsSales: 62000000,
        rmbSales: 150000,
        profit: 17000000,
        weight: 1250.5,
        count: 342
      },
      breakdowns: {
        varieties: [
          { variety: "Mahenge Spinel", cost: 25000000, sales: 38000000, weight: 500, count: 120 },
          { variety: "Blue Sapphire", cost: 10000000, sales: 15000000, weight: 200, count: 50 },
          { variety: "Pink Spinel", cost: 5000000, sales: 6000000, weight: 300, count: 100 },
          { variety: "Ruby", cost: 5000000, sales: 3000000, weight: 250.5, count: 72 }
        ],
        statusDist: [
          { name: 'In Stock', value: 150, color: '#10B981' },
          { name: 'Sold', value: 100, color: '#3B82F6' },
          { name: 'Export', value: 50, color: '#F59E0B' },
          { name: 'Memo/Other', value: 42, color: '#6B7280' }
        ],
        topItems: [
          { codeNo: 'SG-SP001', variety: 'Mahenge', weight: 5.2, slCost: 2500000 },
          { codeNo: 'SG-BS005', variety: 'Blue Sapphire', weight: 3.1, slCost: 1800000 },
          { codeNo: 'SG-RB012', variety: 'Ruby', weight: 2.5, slCost: 1500000 },
          { codeNo: 'SG-SP045', variety: 'Pink Spinel', weight: 4.0, slCost: 1200000 },
          { codeNo: 'SG-MZ001', variety: 'Mixed Lot', weight: 15.0, slCost: 950000 }
        ]
      }
    };
  }

  // --- ALL EXPENSES DASHBOARD ---
  if (config.dataKey === "all_expenses_dashboard") {
    // Aggregated mock totals based on prompt
    const totalExpenses = 9564733 + 7564700 + 4102000 + 3983175 + 1263500 + 1249175 + 687782 + 560000 + 205630;
    const totalPayable = 546200 + 69800 + 0.21;
    const totalShares = 2700000 + 13134360 + 5250000 + 580000;

    return {
      metrics: {
        totalExpenses: totalExpenses,
        totalPayable: totalPayable,
        totalShares: totalShares,
        activeCategories: 12
      },
      breakdowns: {
        categories: [
          { name: "Classictravel", amount: 9564733, payable: 546200, trend: "up", id: "Classictravel" },
          { name: "Personal Ticket Visa", amount: 7564700, trend: "up", id: "Personal Ticket Visa" },
          { name: "Ziyam", amount: 4102000, payable: 69800, trend: "stable", id: "Ziyam" },
          { name: "Z Car", amount: 3983175, trend: "stable", id: "Zcar" },
          { name: "VGExpenses", amount: 1263500, trend: "down", id: "VGExpenses" },
          { name: "Online Ticket", amount: 1249175, trend: "up", id: "Online.Ticket" },
          { name: "Audit Accounts", amount: 687782, payable: 0.21, trend: "stable", id: "Audit.Accounts" },
          { name: "Office", amount: 560000, trend: "stable", id: "Office" },
          { name: "Gem License", amount: 205630, trend: "stable", id: "Gem.license" },
          { name: "Cut & Polish", amount: 0, trend: "stable", id: "Cut.polish" }, // Value not specified in prompt summary, defaulting
          { name: "Zahran", amount: 0, trend: "stable", id: "Zahran" },
          { name: "DAD", amount: 0, trend: "stable", id: "DAD" }
        ],
        shares: [
          { category: "Fawazwife", amount: 13134360 },
          { category: "Ramzanhaji", amount: 5250000 },
          { category: "Abdullah & Ramzan", amount: 2700000 },
          { category: "Azeem", amount: 580000 }
        ],
        recent: [
          { date: "2024-12-08", category: "VGExpenses", description: "Tanzania Visa Fees", amount: 100000, status: "Paid" },
          { date: "2024-12-07", category: "Z Car", description: "Fuel & Maintenance", amount: 45000, status: "Paid" },
          { date: "2024-12-05", category: "Office", description: "Monthly Rent", amount: 85000, status: "Paid" },
          { date: "2024-12-04", category: "Classictravel", description: "Flight Booking DXB", amount: 245000, status: "Pending" },
          { date: "2024-12-02", category: "Gem License", description: "Renewal Fee", amount: 15000, status: "Paid" },
          { date: "2024-11-28", category: "Ziyam", description: "Personal Withdrawal", amount: 500000, status: "Paid" },
          { date: "2024-11-25", category: "Online Ticket", description: "AirAsia Booking", amount: 68000, status: "Paid" },
          { date: "2024-11-20", category: "VGExpenses", description: "Yellow Card", amount: 11000, status: "Paid" },
        ]
      }
    };
  }

  // Simulate network delay for other tabs
  await new Promise(resolve => setTimeout(resolve, 600));

  // --- Data Mocks for Other Dashboards ---

  if (config.dataKey === "dada_dashboard") {
    // Load inventory data
    const inventoryData = await calculateProfitFromInventory('dada', ['Instock']);
    const moduleExpenses = loadModuleExpenses('dada');
    const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

    return {
      metrics: {
        inStockCost: inventoryData.inventoryCost || 4673217,
        totalSales: inventoryData.salesRevenue || 10840000,
        outstanding: 6840000,
        received: 4000000,
        netProfit: netProfit,
        totalExpenses: moduleExpenses
      },
      breakdowns: {
        expenses: [
          { category: "Tanzania Expenses", value: 2074300, currency: "TZS" },
          { category: "Export Charges", value: 2882500, currency: "TZS" },
          { category: "Purchases", value: 27863500, currency: "TZS" },
          { category: "Visa & Tickets", value: 1050000, currency: "TZS" }
        ]
      }
    };
  }

  if (config.dataKey === "vgtz_dashboard") {
    // Load inventory data
    const inventoryData = await calculateProfitFromInventory('vgtz', ['VG.T.Instock']);
    const moduleExpenses = loadModuleExpenses('vgtz');
    const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

    return {
      metrics: {
        inStockCost: inventoryData.inventoryCost || 12500000,
        totalSales: inventoryData.salesRevenue || 8900000,
        outstanding: 4200000,
        received: 4700000,
        netProfit: netProfit,
        totalExpenses: moduleExpenses
      },
      breakdowns: {
        expenses: [
          { category: "Tanzania Expenses", value: 2310800, currency: "TZS" },
          { category: "Export Charges", value: 2940000, currency: "TZS" },
          { category: "Azeem Shares", value: 18733499.72, currency: "TZS" },
          { category: "Visa & Tickets", value: 1050000, currency: "TZS" }
        ]
      }
    };
  }

  if (config.dataKey === "kenya_dashboard") {
    // Load inventory data
    const inventoryData = await calculateProfitFromInventory('kenya', ['Instock']);
    const moduleExpenses = loadModuleExpenses('kenya');
    const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

    return {
      metrics: {
        inStockCost: inventoryData.inventoryCost || 4673217.39,
        totalSales: inventoryData.salesRevenue || 10835050.33,
        received: 10835050.33,
        commission: 9751545.30,
        netProfit: netProfit,
        totalExpenses: moduleExpenses
      },
      breakdowns: {
        expenses: [
          { category: "Cut & Polish", value: 254765 },
          { category: "Flight Tickets", value: 560650 },
          { category: "Export Charges", value: 359500 },
          { category: "BKK Expenses", value: 198950 },
          { category: "BKK Hotel", value: 260675 }
        ],
        shares: [
          { category: "Partner A (50%)", amount: 4875772 },
          { category: "Partner B (50%)", amount: 4875772 }
        ]
      }
    };
  }

  if (config.dataKey === "spinel_dash") {
    return {
      metrics: {
        totalSales: 36585305.20,
        totalCost: 20784982.24,
        outstanding: 6844606.16,
        received: 29740699.04,
        totalProfit: 15800322.95
      },
      breakdowns: {
        varieties: [
          { variety: "Mahenge", cost: 19439982.24, sales: 27807027.22, received: 21072569.92, profit: 8367044.97 },
          { variety: "Spinel", cost: 6418277.98, sales: 90148.86, received: 6328129.11, profit: 6418277.98 },
          { variety: "Sapphire", cost: 1345000, sales: 2360000, received: 2340000, profit: 1015000 }
        ],
        shares: [
          { category: "Partner A Share", amount: 7900161.48 },
          { category: "Partner B Share", amount: 7900161.47 }
        ]
      }
    };
  }

  if (config.dataKey === "bkk_dashboard") {
    
    // Helper function to load data from localStorage
    const loadTabData = (tabId: string, storagePrefix: string): any[] => {
      try {
        const storageKey = `${storagePrefix}_bkk_${tabId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error(`Error loading data for tab ${tabId}:`, e);
      }
      return [];
    };

    // Load data from all BKK tabs
    const expenseItems = loadTabData('BkkExpenses', 'unified_expense');
    const ticketItems = loadTabData('BKKTickets', 'tickets_visa');
    const exportItems = loadTabData('Export.Charge', 'unified_export');
    const apartmentItems = loadTabData('Apartment', 'hotel_accommodation');
    const capitalItems = loadTabData('Bkkcapital', 'unified_capital_management');
    const paymentItems = loadTabData('BKK.Payment', 'unified_payment_ledger');
    const statementItems = loadTabData('BKK.statement', 'unified_statement');
    
    // Aggregate Expenses
    const totalExpenses = expenseItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);
    
    const expensesByCategory: Record<string, number> = {};
    expenseItems.forEach((item: any) => {
      const category = item.category || 'Other';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + (item.convertedAmount || item.amount || 0);
    });

    // Aggregate Tickets
    const totalTickets = ticketItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);
    
    const ticketsByRoute: Record<string, number> = {};
    ticketItems.forEach((item: any) => {
      const route = item.route || 'Other';
      ticketsByRoute[route] = (ticketsByRoute[route] || 0) + (item.convertedAmount || item.amount || 0);
    });

    // Aggregate Export Charges
    const totalExport = exportItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);
    
    const exportByAuthority: Record<string, number> = {};
    exportItems.forEach((item: any) => {
      const authority = item.authority || item.name || 'Other';
      exportByAuthority[authority] = (exportByAuthority[authority] || 0) + (item.convertedAmount || item.amount || 0);
    });

    // Aggregate Apartment
    const totalApartment = apartmentItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);
    
    const apartmentByLocation: Record<string, number> = {};
    apartmentItems.forEach((item: any) => {
      const location = item.location || 'Other';
      apartmentByLocation[location] = (apartmentByLocation[location] || 0) + (item.convertedAmount || item.amount || 0);
    });

    // Aggregate Capital
    const totalCapital = capitalItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);

    // Aggregate Payments
    const totalPayments = paymentItems.reduce((sum: number, item: any) => {
      return sum + (item.paidAmount || 0);
    }, 0);
    const totalOutstanding = paymentItems.reduce((sum: number, item: any) => {
      return sum + (item.outstandingAmount || 0);
    }, 0);

    // Aggregate Statements
    const totalStatements = statementItems.reduce((sum: number, item: any) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);

    // Format expense breakdown
    const expenseBreakdown = Object.entries(expensesByCategory)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);

    // Format ticket breakdown
    const ticketBreakdown = Object.entries(ticketsByRoute)
      .map(([route, value]) => ({ route, value }))
      .sort((a, b) => b.value - a.value);

    // Format export breakdown
    const exportBreakdown = Object.entries(exportByAuthority)
      .map(([authority, value]) => ({ authority, value }))
      .sort((a, b) => b.value - a.value);

    // Recent activity (last 10 items from all tabs)
    const recentActivity = [
      ...expenseItems.map((item: any) => ({ type: 'Expense', date: item.date, description: item.vendorName || item.description, amount: item.convertedAmount || item.amount })),
      ...ticketItems.map((item: any) => ({ type: 'Ticket', date: item.date, description: item.route || item.description, amount: item.convertedAmount || item.amount })),
      ...exportItems.map((item: any) => ({ type: 'Export', date: item.date, description: item.description || item.name, amount: item.convertedAmount || item.amount })),
      ...apartmentItems.map((item: any) => ({ type: 'Apartment', date: item.date, description: item.location || item.description, amount: item.convertedAmount || item.amount }))
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      metrics: {
        totalExpenses,
        tickets: totalTickets,
        apartment: totalApartment,
        export: totalExport,
        capital: totalCapital,
        payments: totalPayments,
        outstanding: totalOutstanding,
        statements: totalStatements
      },
      breakdowns: {
        expenses: expenseBreakdown,
        tickets: ticketBreakdown,
        export: exportBreakdown,
        apartment: Object.entries(apartmentByLocation).map(([location, value]) => ({ location, value })),
        recent: recentActivity
      }
    };
  }

  if (config.dataKey === "madagascar_dashboard") {
    // Load inventory data
    const inventoryData = await calculateProfitFromInventory('madagascar', ['Instock']);
    const moduleExpenses = loadModuleExpenses('madagascar');
    const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

    return {
      metrics: {
        inStockCost: inventoryData.inventoryCost || 0,
        totalSales: inventoryData.salesRevenue || 0,
        outstanding: 0,
        received: 0,
        netProfit: netProfit,
        totalExpenses: moduleExpenses
      },
      breakdowns: {
        expenses: []
      }
    };
  }

  if (config.dataKey === "vgrz_dashboard") {
    // Load inventory data
    const inventoryData = await calculateProfitFromInventory('vg-ramazan', ['Instock']);
    const moduleExpenses = loadModuleExpenses('vg-ramazan');
    const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

    return {
      metrics: {
        inStockCost: inventoryData.inventoryCost || 0,
        totalSales: inventoryData.salesRevenue || 0,
        outstanding: 0,
        received: 0,
        netProfit: netProfit,
        totalExpenses: moduleExpenses
      },
      breakdowns: {
        expenses: []
      }
    };
  }

  if (config.dataKey === "payable_dashboard") {
    return {
      metrics: {
        totalPurchasing: 33967955,
        paidAmount: 30413500,
        payableAmount: 3554455,
        activeSuppliers: 12
      },
      breakdowns: {
        suppliers: [
          { supplier: "Tanzania Capital", amount: 36866882.68 },
          { supplier: "Beruwala", payable: 310000, amount: 310000 },
          { supplier: "Galle", payable: 3255000, amount: 3255000 }
        ]
      }
    };
  }

  // Fallback / Generic - for in-stocks and other dashboards
  // Try to calculate profit if it's an inventory module
  if (config.module && ['in-stocks', 'vision-gems'].includes(config.module)) {
    const moduleId = config.module === 'in-stocks' ? 'in-stocks' : 'vision-gems';
    const tabsToAggregate = config.module === 'in-stocks' ? ['All Stones'] : ['Spinel', 'TSV'];
    
    try {
      const inventoryData = await calculateProfitFromInventory(moduleId, tabsToAggregate);
      const moduleExpenses = loadModuleExpenses(moduleId);
      const netProfit = inventoryData.salesRevenue - inventoryData.inventoryCost - moduleExpenses;

      return {
        metrics: {
          inStockCost: inventoryData.inventoryCost || 1500000,
          totalSales: inventoryData.salesRevenue || 2200000,
          outstanding: 500000,
          received: 1700000,
          netProfit: netProfit,
          totalExpenses: moduleExpenses
        },
        breakdowns: {
          expenses: [
            { category: "Operations", value: 150000 },
            { category: "Travel", value: 75000 }
          ]
        }
      };
    } catch (e) {
      console.error('Error calculating profit for fallback:', e);
    }
  }

  // Fallback / Generic
  return {
    metrics: {
      inStockCost: 1500000,
      totalSales: 2200000,
      outstanding: 500000,
      received: 1700000,
      netProfit: 0,
      totalExpenses: 0
    },
    breakdowns: {
      expenses: [
        { category: "Operations", value: 150000 },
        { category: "Travel", value: 75000 }
      ]
    }
  };
};
