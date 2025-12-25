
export type ExpenseType = 
  | "general_expenses" 
  | "cut_polish" 
  | "tickets_visa" 
  | "hotel_accommodation" 
  | "export_charges" 
  | "personal_shares" 
  | "specific_services";

export interface ExpenseConfig {
  tabName: string;
  module: string;
  expenseType: ExpenseType;
  themeColor: string;
  currency: string; // "LKR", "TZS", "KSH", "USD"
  
  // Optional overrides
  convertTo?: string; // e.g. "LKR"
  exchangeRate?: number; // Default mock rate
  
  // Features
  hasCompanyColumn?: boolean;
  hasWeightColumn?: boolean;
  calculatesPerCarat?: boolean; // For cut & polish
  hasRouteInfo?: boolean;
  hasAirline?: boolean;
  hasVisaType?: boolean;
  hasLocation?: boolean; // Column or just context
  hasDuration?: boolean;
  hasExportReference?: boolean;
  hasAuthority?: boolean;
  hasShareType?: boolean;
  hasOutIndicator?: boolean; // Shows "OUT" at top
  hasVendor?: boolean;
  
  personName?: string;
  serviceName?: string;
  
  showTotal?: boolean; // Defaults true
  note?: string;
}

export const EXPENSE_CONFIGS: ExpenseConfig[] = [
  // --- AllExpenses.xlsx (15 tabs) ---
  {
    tabName: "VGExpenses",
    module: "all-expenses",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasCompanyColumn: true
  },
  {
    tabName: "Cut.polish",
    module: "all-expenses",
    expenseType: "cut_polish",
    themeColor: "#8B5CF6",
    currency: "LKR",
    hasWeightColumn: true,
    calculatesPerCarat: true
  },
  {
    tabName: "Ziyam",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#DC2626",
    currency: "LKR",
    personName: "Ziyam",
    hasOutIndicator: true
  },
  {
    tabName: "Zahran",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#DC2626",
    currency: "LKR",
    personName: "Zahran",
    hasOutIndicator: true
  },
  {
    tabName: "DAD",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#DC2626",
    currency: "LKR",
    personName: "DAD",
    hasOutIndicator: true
  },
  {
    tabName: "Ramzanhaji.Shares",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#059669",
    currency: "LKR",
    personName: "Ramzan Haji"
  },
  {
    tabName: "Azeem.Shares",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#059669",
    currency: "LKR",
    personName: "Azeem",
    hasLocation: true
  },
  {
    tabName: "Others.Shares",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#059669",
    currency: "LKR",
    personName: "Others"
  },
  {
    tabName: "Classictravel",
    module: "all-expenses",
    expenseType: "specific_services",
    themeColor: "#0891B2",
    currency: "LKR",
    serviceName: "Classic Travel Agency"
  },
  {
    tabName: "Online.Ticket",
    module: "all-expenses",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR",
    hasRouteInfo: true,
    hasAirline: true
  },
  {
    tabName: "Personal Ticket Visa",
    module: "all-expenses",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR",
    hasRouteInfo: true,
    hasVisaType: true
  },
  {
    tabName: "Office",
    module: "all-expenses",
    expenseType: "specific_services",
    themeColor: "#DC2626",
    currency: "LKR",
    serviceName: "Office Rent & Utilities"
  },
  {
    tabName: "Gem.license",
    module: "all-expenses",
    expenseType: "specific_services",
    themeColor: "#7C3AED",
    currency: "LKR",
    hasCompanyColumn: true,
    serviceName: "Gem License Fees"
  },
  {
    tabName: "Audit.Accounts",
    module: "all-expenses",
    expenseType: "specific_services",
    themeColor: "#7C3AED",
    currency: "LKR",
    serviceName: "Audit & Accounting"
  },
  {
    tabName: "Fawazwife.Shares",
    module: "all-expenses",
    expenseType: "personal_shares",
    themeColor: "#059669",
    currency: "LKR",
    personName: "Fawaz Wife"
  },

  // --- Bkk.xlsx (4 tabs) ---
  {
    tabName: "BKKTickets",
    module: "bkk",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR",
    hasRouteInfo: true,
    hasAirline: true
  },
  {
    tabName: "BkkExpenses",
    module: "bkk",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasCompanyColumn: true,
    hasLocation: true
  },
  {
    tabName: "Export.Charge",
    module: "bkk",
    expenseType: "export_charges",
    themeColor: "#F59E0B",
    currency: "LKR",
    hasExportReference: true,
    hasAuthority: true
  },
  {
    tabName: "Apartment",
    module: "bkk",
    expenseType: "hotel_accommodation",
    themeColor: "#EC4899",
    currency: "LKR",
    hasLocation: true,
    hasDuration: true
  },

  // --- Copy_of_Dad.xlsx (3 tabs) ---
  {
    tabName: "T.Expense",
    module: "dada",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125,
    hasLocation: true
  },
  {
    tabName: "Tickets.visa",
    module: "dada",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125,
    hasVisaType: true
  },
  {
    tabName: "202412TExpense",
    module: "dada",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125,
    note: "December 2024"
  },

  // --- Copy_of_Kenya.xlsx (4 tabs) ---
  {
    tabName: "Traveling.EX",
    module: "kenya",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR",
    hasRouteInfo: true
  },
  {
    tabName: "BkkExpenses",
    module: "kenya",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasLocation: true
  },
  {
    tabName: "BkkHotel",
    module: "kenya",
    expenseType: "hotel_accommodation",
    themeColor: "#EC4899",
    currency: "LKR",
    hasLocation: true
  },
  {
    tabName: "KExpenses",
    module: "kenya",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "KSH",
    convertTo: "LKR",
    exchangeRate: 2.25
  },

  // --- Copy_of_VG_Ramazan.xlsx (2 tabs) ---
  {
    tabName: "Cut.polish",
    module: "vg-ramazan",
    expenseType: "cut_polish",
    themeColor: "#8B5CF6",
    currency: "LKR",
    hasWeightColumn: true
  },
  {
    tabName: "T.Expenses",
    module: "vg-ramazan",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125
  },

  // --- SG_Madagascar.xlsx (4 tabs) ---
  {
    tabName: "MExpenses",
    module: "madagascar",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasCompanyColumn: true,
    hasLocation: true
  },
  {
    tabName: "Cut.polish",
    module: "madagascar",
    expenseType: "cut_polish",
    themeColor: "#8B5CF6",
    currency: "LKR",
    hasWeightColumn: true
  },
  {
    tabName: "Tickets.visa",
    module: "madagascar",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR",
    hasCompanyColumn: true
  },
  {
    tabName: "SLExpenses",
    module: "madagascar",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasCompanyColumn: true
  },

  // --- SpinelGallery.xlsx (6 tabs) ---
  {
    tabName: "Cut.polish",
    module: "spinel-gallery",
    expenseType: "cut_polish",
    themeColor: "#8B5CF6",
    currency: "LKR",
    hasWeightColumn: true
  },
  {
    tabName: "SL.Expenses",
    module: "spinel-gallery",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasLocation: true
  },
  {
    tabName: "BKkticket",
    module: "spinel-gallery",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "LKR"
  },
  {
    tabName: "BKKExpenses",
    module: "spinel-gallery",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasLocation: true
  },
  {
    tabName: "BKKHotel",
    module: "spinel-gallery",
    expenseType: "hotel_accommodation",
    themeColor: "#EC4899",
    currency: "LKR",
    hasLocation: true
  },
  {
    tabName: "TExpenses",
    module: "spinel-gallery",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125
  },

  // --- VGTZ.xlsx (4 tabs) ---
  {
    tabName: "TZ.Expenses",
    module: "vgtz",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125
  },
  {
    tabName: "Azeem",
    module: "vgtz",
    expenseType: "personal_shares",
    themeColor: "#059669",
    currency: "USD",
    convertTo: "LKR",
    exchangeRate: 300,
    personName: "Azeem",
    note: "$ Purchased in Tanzania"
  },
  {
    tabName: "Tickets.visa",
    module: "vgtz",
    expenseType: "tickets_visa",
    themeColor: "#0891B2",
    currency: "TZS",
    convertTo: "LKR",
    exchangeRate: 0.125
  },
  {
    tabName: "SLExpenses",
    module: "vgtz",
    expenseType: "general_expenses",
    themeColor: "#DC2626",
    currency: "LKR",
    hasCompanyColumn: true
  },

  // --- VisionGems.xlsx (1 tab) ---
  {
    tabName: "Cut.polish",
    module: "vision-gems",
    expenseType: "cut_polish",
    themeColor: "#8B5CF6",
    currency: "LKR",
    hasWeightColumn: true,
    hasCompanyColumn: true
  }
];

export const getExpenseConfig = (moduleId: string, tabId: string): ExpenseConfig | undefined => {
  const normTab = tabId.trim().toLowerCase().replace(/\s+/g, ' ');
  return EXPENSE_CONFIGS.find(c => 
    c.module === moduleId && 
    c.tabName.toLowerCase().trim().replace(/\s+/g, ' ') === normTab
  );
};
