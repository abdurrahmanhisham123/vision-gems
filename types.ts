
export type ModuleType = 'inventory' | 'financial' | 'readonly' | 'export' | 'receivable' | 'payable' | 'mixed';

export interface ModuleConfig {
  id: string;
  name: string;
  type: ModuleType;
  description: string;
  icon: string;
  tabs: string[];
}

export interface Stone {
  id: string;
  code: string;
  weight: number;
  shape: string;
  color: string;
  type: string;
  status: 'In Stock' | 'Sold' | 'Export' | 'Missing';
  cost: number;
  price: number;
  location: string;
  certificate?: string;
  imgUrl: string;
  buyer?: string;
}

// Strictly updated to match user's 41-column list for Spinel Tab
export interface ExtendedSpinelStone {
  id: string;
  
  // Section 0: Company Info
  company: string; // Added as requested

  // Section 1: Stone Identification (10)
  codeNo: string;
  weight: number; // C & P Weight
  shape: string;
  variety: string;
  treatment: string; // N/H
  photos: string[];
  color: string; // Colour
  pieces: number;
  dimensions: string;
  title?: string; // Title

  // Section 2: Documentation (2)
  certificate: string;
  supplier: string;

  // Section 3: Purchase Information (6)
  slCost: number;
  payable: number | string; // Updated to allow string values (e.g. location names)
  purchaseDate: string;
  purchasePaymentMethod: string; // Cash or Bank
  purchasePaymentStatus: string; // paid / notpaid
  inventoryCategory: string; // Total stones (Stock category)
  purchaseSourceOfFunds?: string; // Source of Funds - where the money came from
  purchasePrice?: number; // Purchase Price
  purchaseExpectedSellingPrice?: number; // Expected Selling Price
  purchasePriceCode?: string; // Price Code
  
  // Section 3a: Purchase Payment Ledger Fields (13)
  purchaseCustomerName?: string; // Customer/Entity Name
  purchaseDescription?: string; // Description
  purchaseDeal?: string; // Deal
  purchaseCurrency?: string; // Currency (USD, LKR, etc.)
  purchaseExchangeRate?: number; // Exchange Rate
  purchaseAmount?: number; // Base Amount (equivalent to invoiceAmount)
  purchaseOfficePercent?: number; // OFFICE %
  purchaseCommission?: number; // Commission (LKR)
  purchaseFinalAmount?: number; // Final Amount in chosen currency (auto-calculated)
  purchaseFinalAmountLKR?: number; // Final Amount in LKR (auto-calculated)
  purchasePaidAmount?: number; // Paid Amount in chosen currency
  purchaseOutstandingAmount?: number; // Outstanding Amount in chosen currency (auto-calculated)
  purchaseOutstandingAmountLKR?: number; // Outstanding Amount in LKR (auto-calculated)
  purchasePaymentDate?: string; // Payment Date
  purchaseDueDate?: string; // Due Date
  purchaseIsJointPurchase?: boolean; // Whether stone was bought with a partner
  purchasePartnerName?: string; // Partner name (if joint purchase)
  purchasePartnerPercentage?: number; // Partner's percentage share
  purchasePartnerInvestment?: number; // Partner's investment amount
  purchaseJointPurchaseTripLocation?: string; // Trip location for joint purchase shares
  purchaseTripLocation?: string; // Trip/Location where stone was purchased from
  purchaseSalesLocation?: string; // Sales location selection (Srilanka Sales, Bangkok Sales, China Sales)
  purchasePayables?: number; // Payables amount in LKR

  // Section 4: Status & Location (5)
  status: string;
  location: string; // Stones in
  holder: string; // Stone with
  originalCategory?: string; // Original tab where stone was added (for filtering)
  approvalOutTo?: string; // To whom (when status is Approval Out)
  approvalInFrom?: string; // From whom (when status is Approval In)

  // Section 5: Sales Information (8)
  outstandingName: string; // Outstanding Names
  sellDate: string; // Date (Selling)
  buyer: string;
  soldBy: string;
  paymentDueDate: string;
  salesPaymentStatus: string; // Paid/Not Paid
  paymentReceivedDate: string; // Payment paid Date
  sellingPrice?: number; // Selling Price
  
  // Section 5a: Sales Payment Ledger Fields (13)
  salesCustomerName?: string; // Customer/Entity Name
  salesDescription?: string; // Description
  salesDeal?: string; // Deal
  salesCurrency?: string; // Currency (USD, LKR, etc.) - auto-determined from priority
  salesExchangeRate?: number; // Exchange Rate (applies to USD, THB, RMB)
  salesAmount?: number; // Base Amount - auto-determined from priority
  salesAmountLKR?: number; // LKR Amount
  salesAmountUSD?: number; // USD Amount
  salesAmountTHB?: number; // THB Amount
  salesAmountRMB?: number; // RMB Amount
  salesOfficePercent?: number; // OFFICE %
  salesCommission?: number; // Commission (LKR)
  salesFinalAmount?: number; // Final Amount in chosen currency (auto-calculated)
  salesFinalAmountLKR?: number; // Final Amount in LKR (auto-calculated)
  salesPaidAmount?: number; // Paid Amount in chosen currency
  salesOutstandingAmount?: number; // Outstanding Amount in chosen currency (auto-calculated)
  salesOutstandingAmountLKR?: number; // Outstanding Amount in LKR (auto-calculated)
  salesPaymentDate?: string; // Payment Date
  salesDueDate?: string; // Due Date

  // Section 6: Multi-Currency Pricing (5)
  priceRMB: number; // RMB Currency
  priceTHB: number; // Bath Currency
  priceUSD: number; // $ Currency
  exchangeRate: number; // Rate
  currencyValuationLKR?: number; // LKR Amount (auto-calculated from currency × rate)

  // Section 7: Financial Calculations (7)
  amountLKR: number; // RS Amount
  margin: number; // %
  commission: number;
  finalPrice: number; // Final Amount
  profit: number; // Profit / Loss
  shareAmount: number; // Each Share Amount
  shareProfit: number; // Each Profit

  // Section 8: Payment Tracking (3)
  salesPaymentMethod: string; // Cash or Bank
  paymentCleared: string; // Cleared
  transactionAmount: number; // Amount

  // Section 9: Certificate Information (3)
  certificateImage?: string; // Base64 encoded certificate image (stored separately from photos)
  certificatePrice?: number; // Price of the certificate

  // Section 10: Cut & Polish Records
  cutPolishRecords?: CutPolishRecord[]; // Array of cut & polish records
}

export interface CutPolishRecord {
  id: string;
  worker: string; // Worker/Cutter name
  type: 'cut' | 'polish' | 'both';
  description: string;
  amount: number; // Amount in LKR
  paymentMethod: string; // Cash or Bank
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'LKR' | 'USD' | 'THB' | 'RMB';
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Income' | 'Expense' | 'Payable' | 'Receivable';
  party: string;
  paymentMethod?: 'Cash' | 'Bank';
}

export interface CapitalEntry {
  id: string;
  date: string;
  type: 'Addition' | 'Withdrawal';
  description: string;
  amount: number;
  balanceAfter: number;
  status: 'Completed' | 'Pending';
}

export interface JobEntry {
  id: string;
  code: string;
  description: string;
  company: string;
  worker: string;
  startDate: string;
  dueDate: string;
  cost: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid';
}

// Legacy Export Entry
export interface ExportEntry {
  id: string;
  date: string;
  invoiceNo: string;
  buyer: string;
  destination: string;
  stoneCount: number;
  totalWeight: number;
  valueUSD: number;
  exchangeRate: number;
  valueLKR: number;
  exportExpenses: number;
  trackingNo?: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Paid';
  documents: string[];
}

export interface InvoiceItem {
  sn: number;
  description: string;
  lotOrPcs: string; 
  weight: number;
  pricePerPc: number;
}

export interface InvoiceDocument {
  id: string;
  name: string;
  url: string;
  type: 'invoice' | 'packing_list' | 'certificate' | 'other';
  uploadedAt: string;
}

export interface DetailedExportInvoice {
  id: string;
  invoiceNumber: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdDate: string;
  shipDate: string;
  destination: string;
  destinationFlag: string;
  exportCharges: number;
  trackingNumber?: string;
  items: InvoiceItem[];
  documents: InvoiceDocument[];
  notes?: string;
}

export interface TicketEntry {
  id: string;
  type: 'Flight' | 'Visa' | 'Other';
  date: string;
  description: string; 
  passenger: string;
  cost: number;
  status: 'Booked' | 'Completed' | 'Processing';
}

export interface KPI {
  label: string;
  value: string;
  trend: number; 
  trendUp: boolean;
}

// --- Generic Lot-Based Inventory Types ---

export interface InventoryConfig {
  tabName: string;
  module: string;
  gemType: string;
  themeColor: string; // Hex code
  varieties: string[];
  varietyFixed?: boolean;
  codeFormat: RegExp;
  piecesRange: { min: number; max: number };
  piecesFixed?: boolean;
  hasLots: boolean;
  lotNames?: string[];
  origin?: string;
  showOriginFlag?: string;
  note?: string;
}

export interface GenericLot {
  id: string;
  name: string;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
}

export interface GenericStone {
  id: string;
  lotId: string;
  number: number;
  variety: string;
  weight: number;
  code: string;
  shape: string;
  pieces: number;
  sellingPrice?: number;
  status: 'available' | 'sold' | 'reserved';
  buyerName?: string;
  photos: string[];
  createdAt: string;
}

export interface StatementEntry {
  id: string;
  date: string;
  moduleId: string;
  moduleName: string;
  tabId: string;
  tabName: string;
  transactionType: 'Expense' | 'Income' | 'Purchase' | 'Capital' | 'Export' | 'Statement' | 'Other';
  description: string;
  reference: string;
  debitLKR: number; // 0 if credit transaction
  creditLKR: number; // 0 if debit transaction
  balanceLKR: number; // Running balance
  originalCurrency?: string;
  originalAmount?: number;
  metadata?: Record<string, any>; // Additional fields for detail view
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[]; // Base64 image data
  stoneData?: ExtendedSpinelStone[]; // Stone information when relevant
  profitData?: {
    salesRevenue: number;
    inventoryCost: number;
    expenses: number;
    profit: number;
    netProfit: number;
    moduleId?: string;
    tabId?: string;
  };
}
