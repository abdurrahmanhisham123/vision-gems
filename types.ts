
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

  // Section 1: Stone Identification (9)
  codeNo: string;
  weight: number; // C & P Weight
  shape: string;
  variety: string;
  treatment: string; // N/H
  photos: string[];
  color: string; // Colour
  pieces: number;
  dimensions: string;

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

  // Section 4: Status & Location (3)
  status: string;
  location: string; // Stones in
  holder: string; // Stone with
  originalCategory?: string; // Original tab where stone was added (for filtering)

  // Section 5: Sales Information (7)
  outstandingName: string; // Outstanding Names
  sellDate: string; // Date (Selling)
  buyer: string;
  soldBy: string;
  paymentDueDate: string;
  salesPaymentStatus: string; // Paid/Not Paid
  paymentReceivedDate: string; // Payment paid Date

  // Section 6: Multi-Currency Pricing (4)
  priceRMB: number; // RMB Currency
  priceTHB: number; // Bath Currency
  priceUSD: number; // $ Currency
  exchangeRate: number; // Rate

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
