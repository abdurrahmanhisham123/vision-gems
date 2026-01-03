import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, Download, Save, Plus, Trash2, Edit, 
  MapPin, Truck, Calendar, FileText, MoreVertical, 
  CheckCircle, AlertCircle, Package, Search, Filter, 
  Copy, ArrowRight, ArrowLeft, Upload, X, DollarSign,
  File, Gem, Globe, ChevronRight, PieChart, Info,
  User, ClipboardList
} from 'lucide-react';
import { DetailModal } from '../DetailModal';
import { getExportedStones } from '../../services/dataService';
import { ExtendedSpinelStone } from '../../types';

// --- Types ---

interface InvoiceItem {
  id: string;
  sn: number | string;
  description: string;
  lotPcs: string | number;
  weight: number;
  price: number;
  value?: number | null;
}

interface InvoiceAttachment {
  id: string;
  name: string;
  type: string;
  url?: string;
}

interface ExportInvoice {
  id: string;
  invoiceNumber: string;
  exportCategory?: 'kana' | 'export';
  description: string; 
  date: string;
  status: 'Draft' | 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  
  // Destination
  destination: string;
  destinationFlag?: string; 
  customerName: string;
  address: string;
  phone: string;
  
  // Shipping
  shippingMethod: string;
  trackingNumber: string;
  estDelivery: string;
  
  // Financials
  items: InvoiceItem[];
  shippingCost: number;
  
  // Meta
  notes: string;
  customerNotes: string;
  attachments: InvoiceAttachment[];

  customTotals?: {
    totalWeight?: number;
    totalItems?: number;
    totalValue?: number;
  };
}

interface Lot {
  id: string;
  name: string;
  stoneIds: string[];
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Initial Data ---

const INITIAL_INVOICES: ExportInvoice[] = [
  {
    id: 'vg-exp-001',
    invoiceNumber: 'INV-2024-001',
    description: 'Mixed Spinel Lot 1',
    date: '2024-10-15',
    status: 'Shipped',
    destination: 'Bangkok, Thailand',
    destinationFlag: '🇹🇭',
    customerName: 'John Smith',
    address: '123 Business St, Bangkok 10330',
    phone: '+66 123 456 789',
    shippingMethod: 'DHL Express',
    trackingNumber: 'TH-2024-001',
    estDelivery: '2024-10-20',
    shippingCost: 150.00,
    items: [
      { id: '1', sn: 1, description: 'Mixed Spinel Lot 1', lotPcs: 74, weight: 129.95, price: 6.00, value: 779.70 },
      { id: '2', sn: 2, description: 'Tsavorite Lot 1', lotPcs: 86, weight: 95.75, price: 4.00, value: 383.00 },
    ],
    notes: 'Handle with care. High value shipment.',
    customerNotes: 'Thank you for your business.',
    attachments: []
  },
  {
    id: 'vg-exp-002',
    invoiceNumber: 'INV-2024-002',
    description: 'Ruby Bangkok Batch 1',
    date: '2024-10-24',
    status: 'Pending',
    destination: 'Bangkok, Thailand',
    destinationFlag: '🇹🇭',
    customerName: 'Royal Gems',
    address: 'Silom Road, Bangkok',
    phone: '+66 987 654 321',
    shippingMethod: 'FedEx',
    trackingNumber: '',
    estDelivery: '',
    shippingCost: 200.00,
    items: [
      { id: '1', sn: 1, description: 'Ruby Lot A', lotPcs: 45, weight: 52.40, price: 150.00, value: 7860.00 },
    ],
    notes: '',
    customerNotes: '',
    attachments: []
  }
];

// --- Helpers ---

const calculateInvoiceTotals = (invoice: ExportInvoice) => {
  if (invoice.customTotals) {
    return {
      subtotal: invoice.customTotals.totalValue || 0,
      totalWeight: invoice.customTotals.totalWeight || 0,
      totalItems: invoice.customTotals.totalItems || 0,
      total: (invoice.customTotals.totalValue || 0) + invoice.shippingCost
    };
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.value || (item.weight * item.price)), 0);
  const totalWeight = invoice.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalItems = invoice.items.reduce((sum, item) => {
     const pcs = Number(item.lotPcs);
     return sum + (isNaN(pcs) ? 1 : pcs);
  }, 0);
  
  const total = subtotal + invoice.shippingCost;
  return { subtotal, totalWeight, totalItems, total };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Draft': return 'bg-stone-100 text-stone-600 border-stone-200';
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-stone-100 text-stone-600';
  }
};

/**
 * Generates a professional printable invoice HTML document.
 * @param invoice The invoice data
 * @param mode 'full' (with prices) or 'partial' (only description, lot, weight)
 */
const generateInvoicePDF = (invoice: ExportInvoice, mode: 'full' | 'partial' = 'full') => {
  const { total, totalWeight, totalItems, subtotal } = calculateInvoiceTotals(invoice);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const isFull = mode === 'full';

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${isFull ? 'Invoice' : 'Packing List'} - ${invoice.invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; color: #1c1917; margin: 0; padding: 40px; line-height: 1.5; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e7e5e4; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6B21A8; padding-bottom: 20px; margin-bottom: 40px; }
        .header .brand { font-size: 24px; font-weight: 800; color: #6B21A8; text-transform: uppercase; letter-spacing: -0.02em; }
        .header .invoice-title { text-align: right; }
        .header .invoice-title h1 { margin: 0; font-size: 28px; font-weight: 800; color: #1c1917; }
        .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
        .details-grid div { flex: 1; }
        .details-grid h3 { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #a8a29e; margin-bottom: 12px; }
        .details-grid p { margin: 0; font-size: 14px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        table thead th { text-align: left; padding: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; border-bottom: 1px solid #e7e5e4; }
        table tbody td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f5f5f4; }
        .text-right { text-align: right; }
        .totals { float: right; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.grand-total { border-top: 2px solid #1c1917; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: 800; }
        .footer { margin-top: 100px; font-size: 10px; color: #a8a29e; text-align: center; border-top: 1px solid #f5f5f4; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div class="brand">Vision Gems</div>
          <div class="invoice-title">
            <h1>${isFull ? 'INVOICE' : 'PACKING LIST'}</h1>
            <p style="font-size: 12px; color: #78716c; margin-top: 5px;"># ${invoice.invoiceNumber}</p>
          </div>
        </div>
        
        <div class="details-grid">
          <div>
            <h3>Bill To</h3>
            <p style="font-weight: 800;">${invoice.customerName || 'Pending Recipient'}</p>
            <p>${invoice.address || '-'}</p>
            <p>${invoice.phone || '-'}</p>
          </div>
          <div style="text-align: right;">
            <h3>Document Details</h3>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <p><strong>Destination:</strong> ${invoice.destination}</p>
            <p><strong>Shipping:</strong> ${invoice.shippingMethod || 'Standard'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty/Pcs</th>
              <th class="text-right">Weight (ct)</th>
              ${isFull ? '<th class="text-right">Total (USD)</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.lotPcs}</td>
                <td class="text-right">${item.weight.toFixed(2)}</td>
                ${isFull ? `
                <td class="text-right">$${(item.value || (item.weight * item.price)).toFixed(2)}</td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="clear: both;">
          ${isFull ? `
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="totals-row">
              <span>Shipping Fee</span>
              <span>$${invoice.shippingCost.toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total USD</span>
              <span>$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="margin-top: 20px; font-size: 11px; color: #78716c; text-align: right;">
              <p>Total Weight: ${totalWeight.toFixed(2)} ct</p>
              <p>Total Pieces: ${totalItems}</p>
            </div>
          </div>
          ` : `
          <div style="text-align: right; border-top: 1px solid #e7e5e4; padding-top: 15px;">
             <p style="font-weight: 800; font-size: 16px;">Summary Totals</p>
             <p style="font-size: 14px; color: #57534E;">Total Pieces: <strong>${totalItems}</strong></p>
             <p style="font-size: 14px; color: #57534E;">Total Weight: <strong>${totalWeight.toFixed(2)} ct</strong></p>
          </div>
          `}
        </div>

        <div class="footer">
          <p>Vision Gems Operations • International Gem Trading</p>
          ${isFull ? '<p>Payment due within 30 days. Standard terms apply.</p>' : '<p>Document for logistics and customs identification only.</p>'}
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
};

// --- View Components ---

const ExportOverview: React.FC<{ invoices: ExportInvoice[] }> = ({ invoices }) => {
  const stats = useMemo(() => {
    let weight = 0;
    let pieces = 0;
    let value = 0;
    let active = 0;

    invoices.forEach(inv => {
      const t = calculateInvoiceTotals(inv);
      weight += t.totalWeight;
      pieces += t.totalItems;
      value += t.total;
      if (inv.status !== 'Delivered' && inv.status !== 'Cancelled') active++;
    });

    return { weight, pieces, value, active };
  }, [invoices]);

  return (
    <>
      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <Truck size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Active</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.active}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Gem size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Weight</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">{stats.weight.toFixed(2)} <span className="text-xs text-stone-400">ct</span></div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0">
                 <Package size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Pieces</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.pieces}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Value</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">${stats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Active</div>
              <div className="text-2xl font-black text-stone-900">{stats.active}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Truck size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Weight</div>
              <div className="text-2xl font-black text-stone-900">{stats.weight.toFixed(2)} <span className="text-sm font-medium text-stone-400">ct</span></div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Gem size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Pieces</div>
              <div className="text-2xl font-black text-stone-900">{stats.pieces}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Package size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Value</div>
              <div className="text-2xl font-black text-emerald-600">${stats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign size={28} />
           </div>
        </div>
      </div>
    </>
  );
};

const ExportCard: React.FC<{ invoice: ExportInvoice, onClick: () => void }> = ({ invoice, onClick }) => {
  const { total, totalWeight, totalItems } = calculateInvoiceTotals(invoice);
  const avgPrice = totalWeight > 0 ? total / totalWeight : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-stone-200 rounded-2xl p-0 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center text-lg shadow-sm border border-stone-100">
               {invoice.destinationFlag || '📦'}
             </div>
             <div>
               <h3 className="font-bold text-stone-900 leading-tight group-hover:text-purple-600 transition-colors text-sm md:text-base">{invoice.description}</h3>
               <div className="text-xs text-stone-500 mt-0.5">{invoice.destination}</div>
             </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
           <div className="text-center border-r border-stone-200 last:border-0">
              <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Weight</div>
              <div className="font-bold text-stone-800 text-sm">{totalWeight.toFixed(1)} <span className="text-[10px] text-stone-400">ct</span></div>
           </div>
           <div className="text-center border-r border-stone-200 last:border-0">
              <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Pieces</div>
              <div className="font-bold text-stone-800 text-sm">{totalItems}</div>
           </div>
           <div className="text-center">
              <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Avg/Ct</div>
              <div className="font-bold text-stone-800 text-sm">${avgPrice.toFixed(0)}</div>
           </div>
        </div>
      </div>
      
      <div className="bg-stone-50/80 p-4 border-t border-stone-100 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-stone-500">
           <Calendar size={12} /> {invoice.date}
        </div>
        <div className="font-bold text-emerald-600 text-lg">
           ${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
};

// --- Wizard & Modal Components ---

const CreateExportWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: ExportInvoice) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ExportInvoice>>({
    exportCategory: 'export',
    description: '',
    destination: '',
    destinationFlag: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Draft',
    shippingCost: 0,
    items: []
  });

  const PRESET_DESTINATIONS = [
    { name: 'Bangkok, Thailand', flag: '🇹🇭' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'Tanzania', flag: '🇹🇿' },
    { name: 'Kenya', flag: '🇰🇪' },
    { name: 'Mahenge', flag: '🇹🇿' },
    { name: 'Sri Lanka', flag: '🇱🇰' },
    { name: 'Madagascar', flag: '🇲🇬' },
  ];

  const [stones, setStones] = useState<(ExtendedSpinelStone & { selected: boolean })[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [weightMin, setWeightMin] = useState<number | ''>('');
  const [weightMax, setWeightMax] = useState<number | ''>('');

  // Lot management state
  const [lots, setLots] = useState<Lot[]>([]);
  const [newLotName, setNewLotName] = useState<string>('');
  const DEFAULT_LOT_ID = 'default-mixed-lot';

  useEffect(() => {
    if (isOpen) {
      const allExported = getExportedStones();
      const stagedForExport = allExported.filter(s => s.status === 'Export');
      setStones(stagedForExport.map(s => ({ ...s, selected: false })));
      setStep(1);
      // Reset filters
      setSearchQuery('');
      setSelectedVariety('all');
      setSelectedCompany('all');
      setWeightMin('');
      setWeightMax('');
      // Reset lots
      setLots([{ id: DEFAULT_LOT_ID, name: 'Mixed Lot', stoneIds: [] }]);
      setNewLotName('');
    }
  }, [isOpen]);

  // Initialize default lot and auto-assign unassigned stones when entering step 3
  useEffect(() => {
    if (step === 3) {
      setLots(prev => {
        // Ensure default lot exists
        const hasDefault = prev.find(l => l.id === DEFAULT_LOT_ID);
        let updatedLots = hasDefault ? prev : [...prev, { id: DEFAULT_LOT_ID, name: 'Mixed Lot', stoneIds: [] }];
        
        // Auto-assign unassigned selected stones to default lot
        const selectedStoneIds = stones.filter(s => s.selected).map(s => s.id);
        const assignedStoneIds = new Set(updatedLots.flatMap(lot => lot.stoneIds));
        const unassignedStoneIds = selectedStoneIds.filter(id => !assignedStoneIds.has(id));
        
        if (unassignedStoneIds.length > 0) {
          updatedLots = updatedLots.map(lot => 
            lot.id === DEFAULT_LOT_ID 
              ? { ...lot, stoneIds: [...new Set([...lot.stoneIds, ...unassignedStoneIds])] }
              : lot
          );
        }
        
        return updatedLots;
      });
    }
  }, [step]);

  // Extract unique filter values
  const uniqueVarieties = useMemo(() => {
    const varieties = new Set<string>();
    stones.forEach(s => {
      if (s.variety && s.variety.trim()) {
        varieties.add(s.variety);
      }
    });
    return Array.from(varieties).sort();
  }, [stones]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    stones.forEach(s => {
      if (s.company && s.company.trim()) {
        companies.add(s.company);
      }
    });
    return Array.from(companies).sort();
  }, [stones]);

  // Filter stones based on all criteria
  const filteredStones = useMemo(() => {
    return stones.filter(stone => {
      // Code search
      const matchesSearch = searchQuery === '' || 
        stone.codeNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Variety filter
      const matchesVariety = selectedVariety === 'all' || stone.variety === selectedVariety;
      
      // Company filter
      const matchesCompany = selectedCompany === 'all' || stone.company === selectedCompany;
      
      // Weight range
      const matchesWeightMin = weightMin === '' || stone.weight >= weightMin;
      const matchesWeightMax = weightMax === '' || stone.weight <= weightMax;
      
      return matchesSearch && matchesVariety && matchesCompany && matchesWeightMin && matchesWeightMax;
    });
  }, [stones, searchQuery, selectedVariety, selectedCompany, weightMin, weightMax]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const toggleStone = (id: string) => {
    setStones(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleSelectAll = () => {
    const filteredIds = new Set(filteredStones.map(s => s.id));
    setStones(prev => prev.map(s => 
      filteredIds.has(s.id) ? { ...s, selected: true } : s
    ));
  };

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredStones.map(s => s.id));
    setStones(prev => prev.map(s => 
      filteredIds.has(s.id) ? { ...s, selected: false } : s
    ));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedVariety('all');
    setSelectedCompany('all');
    setWeightMin('');
    setWeightMax('');
  };

  const hasActiveFilters = searchQuery !== '' || selectedVariety !== 'all' || selectedCompany !== 'all' || weightMin !== '' || weightMax !== '';
  
  const selectedCount = stones.filter(s => s.selected).length;
  const filteredSelectedCount = filteredStones.filter(s => s.selected).length;

  // Lot management functions
  const handleCreateLot = () => {
    if (newLotName.trim()) {
      const newLot: Lot = {
        id: `lot-${Date.now()}`,
        name: newLotName.trim(),
        stoneIds: []
      };
      setLots(prev => [...prev, newLot]);
      setNewLotName('');
    }
  };

  const handleDeleteLot = (lotId: string) => {
    if (lotId === DEFAULT_LOT_ID) return; // Cannot delete default lot
    
    const lotToDelete = lots.find(l => l.id === lotId);
    if (lotToDelete) {
      // Reassign stones to default lot
      setLots(prev => prev.map(lot => 
        lot.id === DEFAULT_LOT_ID
          ? { ...lot, stoneIds: [...lot.stoneIds, ...lotToDelete.stoneIds] }
          : lot
      ).filter(l => l.id !== lotId));
    }
  };

  const handleAssignStone = (stoneId: string, lotId: string) => {
    setLots(prev => prev.map(lot => {
      if (lot.id === lotId) {
        // Add stone to this lot if not already there
        if (!lot.stoneIds.includes(stoneId)) {
          return { ...lot, stoneIds: [...lot.stoneIds, stoneId] };
        }
        return lot;
      } else {
        // Remove stone from other lots
        return { ...lot, stoneIds: lot.stoneIds.filter(id => id !== stoneId) };
      }
    }));
  };

  const handleUnassignStone = (stoneId: string) => {
    // Remove from current lot and add to default
    setLots(prev => prev.map(lot => {
      if (lot.id === DEFAULT_LOT_ID) {
        if (!lot.stoneIds.includes(stoneId)) {
          return { ...lot, stoneIds: [...lot.stoneIds, stoneId] };
        }
        return lot;
      } else {
        return { ...lot, stoneIds: lot.stoneIds.filter(id => id !== stoneId) };
      }
    }));
  };

  const handleRenameLot = (lotId: string, newName: string) => {
    if (newName.trim()) {
      setLots(prev => prev.map(lot => 
        lot.id === lotId ? { ...lot, name: newName.trim() } : lot
      ));
    }
  };

  // Get lot for a stone
  const getStoneLot = (stoneId: string): Lot | undefined => {
    return lots.find(lot => lot.stoneIds.includes(stoneId));
  };

  // Get selected stones
  const selectedStones = useMemo(() => {
    return stones.filter(s => s.selected);
  }, [stones]);

  // Calculate lot statistics
  const getLotStats = (lot: Lot) => {
    const lotStones = stones.filter(s => lot.stoneIds.includes(s.id));
    const totalWeight = lotStones.reduce((sum, s) => sum + s.weight, 0);
    const totalPieces = lotStones.length;
    return { totalWeight, totalPieces };
  };

  const handleFinish = () => {
    const selected = stones.filter(s => s.selected);
    
    // Check if lots are being used
    // Use lots if: any custom lots exist with stones, OR multiple lots have stones
    const lotsWithStones = lots.filter(lot => lot.stoneIds.length > 0);
    const hasCustomLots = lots.some(lot => lot.id !== DEFAULT_LOT_ID && lot.stoneIds.length > 0);
    const useLots = hasCustomLots || lotsWithStones.length > 1;
    
    let invoiceItems: InvoiceItem[] = [];

    if (useLots) {
      // Create one item per lot that has stones (including default if it has stones)
      lotsWithStones.forEach((lot, index) => {
        const lotStones = stones.filter(s => lot.stoneIds.includes(s.id));
        const totalWeight = lotStones.reduce((sum, s) => sum + s.weight, 0);
        const totalPieces = lotStones.length;
        
        invoiceItems.push({
          id: `item-lot-${lot.id}-${Date.now()}`,
          sn: index + 1,
          description: lot.name,
          lotPcs: totalPieces,
          weight: totalWeight,
          price: 0,
          value: 0
        });
      });
    } else {
      // Use existing logic: single lot item with all selected stones
      const totalWeight = selected.reduce((sum, s) => sum + s.weight, 0);
      const totalPieces = selected.length;
      
      invoiceItems.push({
        id: `item-lot-${Date.now()}`,
        sn: 1,
        description: formData.description || 'Mixed Lot',
        lotPcs: totalPieces,
        weight: totalWeight,
        price: 0,
        value: 0
      });
    }

    const finalInvoice: ExportInvoice = {
      id: `exp-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      exportCategory: formData.exportCategory || 'export',
      description: formData.description!,
      date: formData.date!,
      status: 'Draft',
      destination: formData.destination!,
      destinationFlag: formData.destinationFlag || '📍',
      customerName: '',
      address: '',
      phone: '',
      shippingMethod: '',
      trackingNumber: '',
      estDelivery: '',
      shippingCost: formData.shippingCost || 0,
      items: invoiceItems,
      notes: '',
      customerNotes: '',
      attachments: []
    };

    onSave(finalInvoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-stone-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-stone-900">Create New Export</h3>
            <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-stone-600" /></button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-purple-600' : 'bg-stone-100'}`}></div>
            ))}
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Type *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, exportCategory: 'kana'})}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      formData.exportCategory === 'kana'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    Kana
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, exportCategory: 'export'})}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      formData.exportCategory === 'export'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    Export
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Description *</label>
                <input type="text" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-purple-500 outline-none" placeholder="e.g. Mixed Spinel Lot 3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Destination Presets</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESET_DESTINATIONS.map((dest) => (
                    <button key={dest.name} onClick={() => setFormData({...formData, destination: dest.name, destinationFlag: dest.flag})} className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all text-sm font-bold ${formData.destination === dest.name ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-stone-200 hover:bg-stone-50 text-stone-600'}`}>
                      <span>{dest.flag}</span><span>{dest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Export Date *</label>
                <input type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                    <Filter size={14} /> Filters
                  </h4>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search by Code */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search by code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        searchQuery ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' : 'border-stone-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                    />
                  </div>

                  {/* Variety Filter */}
                  <div>
                    <select
                      value={selectedVariety}
                      onChange={(e) => setSelectedVariety(e.target.value)}
                      className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        selectedVariety !== 'all' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' : 'border-stone-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                    >
                      <option value="all">All Varieties</option>
                      {uniqueVarieties.map(variety => (
                        <option key={variety} value={variety}>{variety}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company Filter */}
                  <div>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        selectedCompany !== 'all' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' : 'border-stone-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                    >
                      <option value="all">All Companies</option>
                      {uniqueCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>

                  {/* Weight Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Min ct"
                        value={weightMin}
                        onChange={(e) => setWeightMin(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          weightMin !== '' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' : 'border-stone-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Max ct"
                        value={weightMax}
                        onChange={(e) => setWeightMax(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className={`w-full px-3 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          weightMax !== '' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' : 'border-stone-200 focus:border-purple-500 focus:ring-purple-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Selection Controls */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="text-xs font-bold text-stone-600">
                  {filteredSelectedCount > 0 ? (
                    <span>
                      <span className="text-purple-600">{filteredSelectedCount}</span> of <span>{filteredStones.length}</span> selected
                      {selectedCount > filteredSelectedCount && (
                        <span className="text-stone-400 ml-1">({selectedCount} total)</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-stone-400">No items selected</span>
                  )}
                </div>
              </div>

              {/* Stones Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                 {stones.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 flex flex-col items-center">
                      <Gem size={32} className="mb-2 opacity-20" />
                      <p className="text-sm font-medium">No stones found in Export tab.</p>
                    </div>
                 ) : filteredStones.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 flex flex-col items-center">
                      <Filter size={32} className="mb-2 opacity-20" />
                      <p className="text-sm font-medium">No stones match your filters.</p>
                      <button
                        onClick={handleClearFilters}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-bold"
                      >
                        Clear filters
                      </button>
                    </div>
                 ) : (
                    <table className="w-full text-left text-sm">
                       <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold sticky top-0 z-10 border-b border-stone-200">
                          <tr>
                            <th className="p-3 w-10"></th>
                            <th className="p-3">Code</th>
                            <th className="p-3 text-right">Weight</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-stone-100">
                          {filteredStones.map(s => (
                             <tr key={s.id} onClick={() => toggleStone(s.id)} className={`cursor-pointer transition-colors ${s.selected ? 'bg-purple-50' : 'hover:bg-stone-50'}`}>
                                <td className="p-3 text-center">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${s.selected ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-300 bg-white'}`}>
                                    {s.selected && <CheckCircle size={12} />}
                                  </div>
                                </td>
                                <td className="p-3 font-mono font-bold text-stone-800">{s.codeNo}</td>
                                <td className="p-3 text-right font-mono font-bold text-stone-600">{s.weight.toFixed(2)}ct</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              {/* Lot Creation Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                    <Package size={14} /> Organize into Lots
                  </h4>
                  <span className="text-xs text-stone-400 font-medium">Optional</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter lot name (e.g., Lot A, Premium, etc.)"
                    value={newLotName}
                    onChange={(e) => setNewLotName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateLot();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                  />
                  <button
                    onClick={handleCreateLot}
                    disabled={!newLotName.trim()}
                    className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Lot
                  </button>
                </div>

                {/* Lots List */}
                {lots.length > 0 && (
                  <div className="space-y-2">
                    {lots.map(lot => {
                      const stats = getLotStats(lot);
                      const isDefault = lot.id === DEFAULT_LOT_ID;
                      return (
                        <div
                          key={lot.id}
                          className={`p-4 rounded-xl border ${
                            isDefault ? 'bg-purple-50 border-purple-200' : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isDefault ? 'bg-purple-100 text-purple-700' : 'bg-stone-200 text-stone-700'
                              }`}>
                                {lot.name}
                              </span>
                              <span className="text-xs text-stone-500 font-medium">
                                {stats.totalPieces} {stats.totalPieces === 1 ? 'stone' : 'stones'} • {stats.totalWeight.toFixed(2)}ct
                              </span>
                            </div>
                            {!isDefault && (
                              <button
                                onClick={() => handleDeleteLot(lot.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                title="Delete lot"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Stone Assignment Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                  <Gem size={14} /> Assign Selected Stones
                </h4>
                
                {selectedStones.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <p className="text-sm font-medium">No stones selected. Go back to step 2 to select stones.</p>
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold sticky top-0 z-10 border-b border-stone-200">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3 text-right">Weight</th>
                          <th className="p-3">Lot Assignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {selectedStones.map(stone => {
                          const currentLot = getStoneLot(stone.id);
                          return (
                            <tr key={stone.id} className="hover:bg-stone-50 transition-colors">
                              <td className="p-3 font-mono font-bold text-stone-800">{stone.codeNo}</td>
                              <td className="p-3 text-right font-mono font-bold text-stone-600">{stone.weight.toFixed(2)}ct</td>
                              <td className="p-3">
                                <select
                                  value={currentLot?.id || ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignStone(stone.id, e.target.value);
                                    } else {
                                      handleUnassignStone(stone.id);
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                                >
                                  <option value="">Unassigned</option>
                                  {lots.map(lot => (
                                    <option key={lot.id} value={lot.id}>
                                      {lot.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary */}
                {selectedStones.length > 0 && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-stone-600">Summary:</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-stone-600">
                          <span className="font-bold text-purple-600">{selectedStones.length}</span> stones selected
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600">
                          <span className="font-bold text-purple-600">{lots.filter(l => l.stoneIds.length > 0).length}</span> lots with stones
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600">
                          <span className="font-bold text-purple-600">
                            {selectedStones.filter(s => !getStoneLot(s.id)).length}
                          </span> unassigned
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-stone-200 flex justify-between bg-stone-50 rounded-b-2xl">
           <button onClick={step === 1 ? onClose : handleBack} className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all">{step === 1 ? 'Cancel' : 'Back'}</button>
           <button 
             onClick={step === 3 ? handleFinish : handleNext} 
             className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50" 
             disabled={
               (step === 1 && (!formData.description || !formData.destination)) || 
               (step === 2 && selectedCount === 0)
             }
           >
             {step === 3 ? 'Create Export' : 'Next Step'} 
             {step !== 3 && <ArrowRight size={16} />}
           </button>
        </div>
      </div>
    </div>
  );
};

const EditExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: ExportInvoice) => void;
  invoice: ExportInvoice;
}> = ({ isOpen, onClose, onSave, invoice }) => {
  const [formData, setFormData] = useState<ExportInvoice>({...invoice});

  useEffect(() => {
    if (isOpen) setFormData({...invoice});
  }, [isOpen, invoice]);

  const handleUpdate = (field: keyof ExportInvoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-900">Edit Export Record</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={20} className="text-stone-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Invoice Number</label>
                 <input type="text" value={formData.invoiceNumber} onChange={e => handleUpdate('invoiceNumber', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Date</label>
                 <input type="date" value={formData.date} onChange={e => handleUpdate('date', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Description</label>
                 <input type="text" value={formData.description} onChange={e => handleUpdate('description', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Status</label>
                 <select value={formData.status} onChange={e => handleUpdate('status', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm">
                    {['Draft', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Shipping Method</label>
                 <input type="text" value={formData.shippingMethod} onChange={e => handleUpdate('shippingMethod', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Recipient Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Customer Name</label>
                    <input type="text" value={formData.customerName} onChange={e => handleUpdate('customerName', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 ml-1">Address</label>
                    <textarea value={formData.address} onChange={e => handleUpdate('address', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none" rows={2} />
                 </div>
              </div>
           </div>
        </form>

        <div className="p-6 border-t border-stone-200 flex justify-end gap-3 bg-stone-50 rounded-b-3xl">
           <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50">Cancel</button>
           <button type="button" onClick={handleSubmit} className="px-8 py-2.5 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 flex items-center gap-2">
              <Save size={18} /> Update Record
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const ExportInvoiceMaster: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [invoices, setInvoices] = useState<ExportInvoice[]>(INITIAL_INVOICES);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<ExportInvoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<ExportInvoice | null>(null);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateExport = (invoice: ExportInvoice) => {
    setInvoices([invoice, ...invoices]);
    setSelectedInvoice(invoice);
    setView('detail');
  };

  const handleUpdateInvoice = (updated: ExportInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    if (selectedInvoice?.id === updated.id) {
       setSelectedInvoice(updated);
    }
  };

  const openEdit = (invoice: ExportInvoice) => {
    setInvoiceToEdit(invoice);
    setIsEditModalOpen(true);
  };

  const handleBack = () => {
    setView('list');
    setSelectedInvoice(null);
  };

  // --- Main Render Branch ---
  return (
    <div className="min-h-screen bg-stone-50/50">
      
      {view === 'detail' && selectedInvoice ? (
        <ExportDetailView 
          invoice={selectedInvoice} 
          onBack={handleBack} 
          isReadOnly={isReadOnly}
          onEdit={() => openEdit(selectedInvoice)}
          onUpdate={(updated) => {
            handleUpdateInvoice(updated);
            setSelectedInvoice(updated);
          }}
        />
      ) : (
        <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-full lg:w-auto">
               <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
                 {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
               </div>
               <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
               <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredInvoices.length} exports currently tracked</p>
            </div>
            <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
               <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
                 <Printer size={16} /> Print List
               </button>
               {!isReadOnly && (
                 <button 
                   onClick={() => setIsWizardOpen(true)}
                   className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 active:scale-95 whitespace-nowrap"
                 >
                   <Plus size={18} /> Create New Export
                 </button>
               )}
            </div>
          </div>

          <ExportOverview invoices={filteredInvoices} />

          {/* Toolbar */}
          <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
             <div className="flex flex-col xl:flex-row gap-4">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search exports..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
                   />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
                   <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                     <Filter size={18} />
                   </button>
                   <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                     <Download size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* Invoice List - Card Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-3xl bg-purple-100 flex items-center justify-center mb-4">
                  <Package size={40} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No exports found</h3>
                <p className="text-stone-500 mb-6">Get started by adding your first export invoice</p>
                {!isReadOnly && (
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all"
                  >
                    <Plus size={18} /> Create New Export
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map(inv => (
                  <ExportCard 
                     key={inv.id} 
                     invoice={inv} 
                     onClick={() => { setSelectedInvoice(inv); setView('detail'); }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Modals rendered outside conditional view logic to ensure mounting */}
      {isWizardOpen && (
         <CreateExportWizard 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)} 
            onSave={handleCreateExport} 
         />
      )}

      {isEditModalOpen && invoiceToEdit && (
         <EditExportModal 
            isOpen={isEditModalOpen}
            invoice={invoiceToEdit}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdateInvoice}
         />
      )}

    </div>
  );
};

// --- Sub-View Component: Detail View ---

const ExportDetailView: React.FC<{ 
  invoice: ExportInvoice, 
  onBack: () => void, 
  onEdit: () => void,
  onUpdate?: (updatedInvoice: ExportInvoice) => void,
  isReadOnly?: boolean 
}> = ({ invoice, onBack, onEdit, onUpdate, isReadOnly }) => {
  const [localInvoice, setLocalInvoice] = useState<ExportInvoice>(invoice);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  const handleValueEdit = (itemId: string, currentValue: number) => {
    setEditingItemId(itemId);
    setEditingValue(currentValue.toString());
  };

  const handleValueSave = (itemId: string) => {
    const newValue = parseFloat(editingValue) || 0;
    const updatedItems = localInvoice.items.map(item => 
      item.id === itemId ? { ...item, value: newValue } : item
    );
    const updatedInvoice = { ...localInvoice, items: updatedItems };
    setLocalInvoice(updatedInvoice);
    setEditingItemId(null);
    if (onUpdate) {
      onUpdate(updatedInvoice);
    }
  };

  const handleValueCancel = () => {
    setEditingItemId(null);
    setEditingValue('');
  };

  const handleValueKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      handleValueSave(itemId);
    } else if (e.key === 'Escape') {
      handleValueCancel();
    }
  };

  const { total, totalWeight, totalItems } = calculateInvoiceTotals(localInvoice);
  
  return (
    <div className="p-4 md:p-10 max-w-[1200px] mx-auto min-h-screen pb-40 md:pb-8 animate-in fade-in duration-300">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 font-bold transition-colors group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Exports
          </button>
          
          <div className="flex flex-wrap gap-2 justify-end">
             {!isReadOnly && (
                <button 
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-100 shadow-sm transition-all"
                >
                  <Edit size={16}/> Edit
                </button>
             )}
             
             {/* Mode 2 Button: Packing List / Partial */}
             <button 
                onClick={() => generateInvoicePDF(localInvoice, 'partial')}
                className="flex items-center gap-2 px-5 py-2 bg-stone-100 text-stone-700 border border-stone-200 rounded-2xl text-sm font-bold hover:bg-stone-200 shadow-sm transition-all active:scale-95"
              >
                <ClipboardList size={18}/> Generate Partial
              </button>

             {/* Mode 1 Button: Full Invoice */}
             <button 
                onClick={() => generateInvoicePDF(localInvoice, 'full')}
                className="flex items-center gap-2 px-6 py-2 bg-stone-900 text-white rounded-2xl text-sm font-bold hover:bg-stone-800 shadow-md transition-all active:scale-95"
              >
                <FileText size={18}/> Generate Invoice
              </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             
             <div className="bg-white rounded-[32px] border border-stone-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-purple-600"><Globe size={120} /></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div>
                      <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">{localInvoice.description}</h2>
                      <div className="flex items-center gap-3 text-sm font-bold text-stone-400">
                         <span className="flex items-center gap-1">{localInvoice.destinationFlag} {localInvoice.destination}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                         <span className="font-mono text-stone-500">{localInvoice.invoiceNumber}</span>
                      </div>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(localInvoice.status)}`}>{localInvoice.status}</div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-stone-50 rounded-3xl border border-stone-100 relative z-10">
                   <div>
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Weight</div>
                      <div className="text-xl font-bold text-stone-800 font-mono">{totalWeight.toFixed(2)} <span className="text-xs font-sans text-stone-400">ct</span></div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Pieces</div>
                      <div className="text-xl font-bold text-stone-800 font-mono">{totalItems}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Avg Price</div>
                      <div className="text-xl font-bold text-stone-800 font-mono">${totalItems > 0 ? (total/totalItems).toFixed(0) : '0'}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Invoice Total</div>
                      <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">${total.toLocaleString()}</div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                   <h3 className="font-bold text-stone-800 text-sm uppercase tracking-widest flex items-center gap-2"><Gem size={18} className="text-purple-500"/> Shipment Items</h3>
                </div>
                
                <div className="hidden md:block overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-white text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100">
                         <tr>
                            <th className="p-6 w-16 text-center">#</th>
                            <th className="p-6">Description</th>
                            <th className="p-6 text-center">Lot/Pcs</th>
                            <th className="p-6 text-right">Weight</th>
                            <th className="p-6 text-right">Value</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                         {localInvoice.items.map((item, i) => (
                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                               <td className="p-6 text-center text-stone-300 font-mono text-xs">{item.sn}</td>
                               <td className="p-6 font-bold text-stone-800">{item.description}</td>
                               <td className="p-6 text-center text-stone-600">{item.lotPcs}</td>
                               <td className="p-6 text-right font-mono font-bold text-stone-700">{item.weight.toFixed(2)}</td>
                               <td className="p-6 text-right">
                                 {editingItemId === item.id ? (
                                   <div className="flex items-center gap-2 justify-end">
                                     <span className="text-stone-400">$</span>
                                     <input
                                       type="number"
                                       value={editingValue}
                                       onChange={(e) => setEditingValue(e.target.value)}
                                       onBlur={() => handleValueSave(item.id)}
                                       onKeyDown={(e) => handleValueKeyDown(e, item.id)}
                                       className="w-32 p-2 border border-purple-300 rounded-lg text-right font-mono font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                       autoFocus
                                     />
                                   </div>
                                 ) : (
                                   <button
                                     onClick={() => handleValueEdit(item.id, item.value || (item.weight * item.price))}
                                     className="font-black text-stone-900 font-mono hover:text-purple-600 hover:underline transition-colors"
                                     disabled={isReadOnly}
                                   >
                                     ${(item.value || (item.weight * item.price)).toLocaleString()}
                                   </button>
                                 )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="md:hidden space-y-4 p-6">
                   {localInvoice.items.map((item, i) => (
                      <div key={i} className="bg-stone-50 rounded-2xl border border-stone-200 p-5">
                         <div className="flex justify-between items-start mb-4 border-b border-stone-200 pb-3">
                            <h4 className="font-bold text-stone-900">{item.description}</h4>
                            <span className="text-[10px] font-bold text-stone-300 uppercase">Entry #{item.sn}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-y-4 text-xs font-bold uppercase tracking-tight text-stone-500">
                            <div><span className="text-stone-300 block text-[9px] mb-1">Lot/Pcs</span><span className="text-stone-800">{item.lotPcs}</span></div>
                            <div className="text-right"><span className="text-stone-300 block text-[9px] mb-1">Weight</span><span className="text-stone-800">{item.weight.toFixed(2)} ct</span></div>
                            <div className="text-right col-span-2">
                               <span className="text-stone-300 block text-[9px] mb-1">Total</span>
                               {editingItemId === item.id ? (
                                 <div className="flex items-center gap-2 justify-end">
                                   <span className="text-stone-400">$</span>
                                   <input
                                     type="number"
                                     value={editingValue}
                                     onChange={(e) => setEditingValue(e.target.value)}
                                     onBlur={() => handleValueSave(item.id)}
                                     onKeyDown={(e) => handleValueKeyDown(e, item.id)}
                                     className="w-32 p-2 border border-purple-300 rounded-lg text-right font-mono font-black text-emerald-600 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                                     autoFocus
                                   />
                                 </div>
                               ) : (
                                 <button
                                   onClick={() => handleValueEdit(item.id, item.value || (item.weight * item.price))}
                                   className="text-emerald-600 text-base font-black font-mono hover:text-purple-600 hover:underline transition-colors"
                                   disabled={isReadOnly}
                                 >
                                   ${(item.value || (item.weight * item.price)).toLocaleString()}
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Truck size={16} className="text-blue-500"/> Shipping Details
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400 uppercase tracking-tight text-xs">Method</span>
                      <span className="font-black text-stone-800">{localInvoice.shippingMethod || '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400 uppercase tracking-tight text-xs">Tracking</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">{localInvoice.trackingNumber || 'Pending'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400 uppercase tracking-tight text-xs">Est. Arrival</span>
                      <span className="font-bold text-stone-800">{localInvoice.estDelivery || 'TBA'}</span>
                   </div>
                   <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className="font-black text-stone-800 uppercase tracking-tighter">Shipping Cost</span>
                      <span className="font-mono font-black text-stone-900 text-lg">${localInvoice.shippingCost}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <MapPin size={16} className="text-orange-500"/> Consignee
                </h3>
                <div className="text-sm">
                   <div className="font-black text-stone-900 text-lg mb-2">{localInvoice.customerName || 'Pending Recipient'}</div>
                   <div className="text-stone-500 leading-relaxed font-medium mb-4">{localInvoice.address || '-'}</div>
                   {localInvoice.phone && <div className="text-stone-800 font-bold flex items-center gap-2 text-xs"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {localInvoice.phone}</div>}
                </div>
             </div>

             {(localInvoice.notes || localInvoice.customerNotes) && (
                <div className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm">
                   <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info size={16} className="text-stone-300"/> Documentation Notes
                   </h3>
                   {localInvoice.notes && <p className="text-xs text-stone-600 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-3 leading-relaxed">{localInvoice.notes}</p>}
                   {localInvoice.customerNotes && <p className="text-xs text-stone-400 italic font-medium px-2">" {localInvoice.customerNotes} "</p>}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
