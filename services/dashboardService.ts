
import { DashboardConfig } from '../utils/dashboardConfig';
import { getVisionGemsSpinelData } from './dataService';

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
  };
}

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

    return {
      metrics: {
        cost: totalCost,
        rsSales: totalSalesLKR,
        rmbSales: totalSalesRMB,
        profit: totalProfit,
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
    
    // Simulate aggregating payment tabs (Tabs 2-7, 35)
    const paymentData = [
      { source: "SG Payment Received", total: 37372045.85, count: 287, lastDate: "2025-08-25" },
      { source: "Madagascar Payment Received", total: 6323122.74, count: 45, lastDate: "2025-08-20" },
      { source: "K Payment Received", total: 10835050.33, count: 120, lastDate: "2025-08-22" },
      { source: "VG.R payment received", total: 18885926.00, count: 156, lastDate: "2025-08-18" },
      { source: "VG Payment Received", total: 10640846.66, count: 98, lastDate: "2025-08-24" },
      { source: "VG.T.Payment.Received", total: 12835260.31, count: 110, lastDate: "2025-08-21" },
      { source: "General Payment Received", total: 1582200.00, count: 15, lastDate: "2025-08-10" }
    ];
    
    const totalReceived = paymentData.reduce((acc, curr) => acc + curr.total, 0);

    // Simulate aggregating customer tabs (Tabs 8-33)
    // We generate some mock data based on names provided in constants.tsx
    const customerNames = [
      "Zahran", "RuzaikSales", "BeruwalaSales", "SajithOnline", "Ziyam",
      "InfazHaji", "NusrathAli", "Binara", "MikdarHaji", "RameesNana",
      "Shimar", "Ruqshan", "FaizeenHaj", "SharikHaj", "Fazeel",
      "AzeemColo", "Kadarhaj.colo", "AlthafHaj", "BangkokSales", "Sadam bkk",
      "ChinaSales", "Eleven", "AndyBuyer", "FlightBuyer", "Bangkok", "Name", "Name1"
    ];

    const customerRows = customerNames.map((name, i) => {
      // Create somewhat realistic diverse data
      const hasBalance = i % 3 !== 0; // 2/3 have balance
      const baseAmount = Math.floor(Math.random() * 20000000) + 500000;
      const received = hasBalance ? Math.floor(baseAmount * (Math.random() * 0.8)) : baseAmount;
      const rmb = i === 20 ? 35000 : 0; // ChinaSales
      const bath = i === 18 ? 450000 : 0; // Bangkok
      const usd = i % 5 === 0 ? Math.floor(Math.random() * 5000) : 0;
      
      const balance = baseAmount - received;
      let status: 'Cleared' | 'Pending' | 'Overdue' = 'Cleared';
      if (balance > 0) status = 'Pending';
      if (balance > 5000000) status = 'Overdue';

      return {
        id: `cust-${i}`,
        name: name,
        slAmount: baseAmount,
        rmb,
        bath,
        usd,
        finalAmount: baseAmount + (usd * 300) + (bath * 8.5) + (rmb * 42), // rough conversion for total
        received,
        balance,
        status
      };
    });

    const totalOutstandingLKR = customerRows.reduce((acc, curr) => acc + curr.balance, 0);
    const totalOutstandingUSD = customerRows.reduce((acc, curr) => acc + curr.usd, 0);
    const activeCustomers = customerRows.filter(c => c.balance > 100).length;

    // Currency Breakdown Pie Chart Data
    const currencyBreakdown = [
        { name: 'LKR', value: totalOutstandingLKR, color: '#3B82F6' },
        { name: 'USD', value: totalOutstandingUSD * 300, color: '#10B981' }, // Converted to LKR for pie scale
        { name: 'RMB', value: 35000 * 42, color: '#EF4444' },
        { name: 'THB', value: 450000 * 8.5, color: '#F59E0B' }
    ];

    return {
      metrics: {
        totalOutstandingLKR,
        totalOutstandingUSD,
        customerCount: activeCustomers,
        totalReceived
      },
      breakdowns: {
        customerSummary: customerRows.sort((a,b) => b.balance - a.balance), // Sort by highest outstanding
        paymentTracking: paymentData,
        currencyBreakdown
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
    return {
      metrics: {
        inStockCost: 4673217,
        totalSales: 10840000,
        outstanding: 6840000,
        received: 4000000
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
    return {
      metrics: {
        inStockCost: 12500000,
        totalSales: 8900000,
        outstanding: 4200000,
        received: 4700000
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
    return {
      metrics: {
        inStockCost: 4673217.39,
        totalSales: 10835050.33,
        received: 10835050.33,
        commission: 9751545.30
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
    return {
      metrics: {
        totalExpenses: 5050425,
        tickets: 1798475,
        apartment: 1590250,
        export: 557000
      },
      breakdowns: {
        expenses: [
          { category: "Bkk Ticket", value: 1798475 },
          { category: "Bkk Expenses", value: 1104700 },
          { category: "Export Charge", value: 557000 },
          { category: "Apartment", value: 1590250 }
        ],
        monthly: [
          { month: "May 2024", capital: 550000, tickets: 64100, expenses: 50000 },
          { month: "Aug 2024", capital: 136500, tickets: 133800, export: 32000 },
          { month: "Sep 2024", capital: 434800, expenses: 200000, export: 75000 }
        ]
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

  // Fallback / Generic
  return {
    metrics: {
      inStockCost: 1500000,
      totalSales: 2200000,
      outstanding: 500000,
      received: 1700000
    },
    breakdowns: {
      expenses: [
        { category: "Operations", value: 150000 },
        { category: "Travel", value: 75000 }
      ]
    }
  };
};
