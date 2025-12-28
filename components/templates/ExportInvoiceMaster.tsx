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
              ${isFull ? '<th class="text-right">Unit Price</th><th class="text-right">Total (USD)</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.lotPcs}</td>
                <td class="text-right">${item.weight.toFixed(2)}</td>
                ${isFull ? `
                <td class="text-right">$${item.price.toFixed(2)}</td>
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
  const [pricePerPc, setPricePerPc] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const allExported = getExportedStones();
      const stagedForExport = allExported.filter(s => s.status === 'Export');
      setStones(stagedForExport.map(s => ({ ...s, selected: false })));
      setStep(1); 
    }
  }, [isOpen]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const toggleStone = (id: string) => {
    setStones(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleFinish = () => {
    const selected = stones.filter(s => s.selected);
    const totalWeight = selected.reduce((sum, s) => sum + s.weight, 0);
    const totalPieces = selected.length;
    
    const lotItem: InvoiceItem = {
      id: `item-lot-${Date.now()}`,
      sn: 1,
      description: formData.description || 'Mixed Lot',
      lotPcs: totalPieces,
      weight: totalWeight,
      price: pricePerPc, 
      value: totalPieces * pricePerPc
    };

    const finalInvoice: ExportInvoice = {
      id: `exp-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
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
      items: [lotItem], 
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
              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                 {stones.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 flex flex-col items-center"><Gem size={32} className="mb-2 opacity-20" /><p className="text-sm font-medium">No stones found in Export tab.</p></div>
                 ) : (
                    <table className="w-full text-left text-sm">
                       <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold sticky top-0 z-10 border-b border-stone-200">
                          <tr><th className="p-3 w-10"></th><th className="p-3">Code</th><th className="p-3 text-right">Weight</th></tr>
                       </thead>
                       <tbody className="divide-y divide-stone-100">
                          {stones.map(s => (
                             <tr key={s.id} onClick={() => toggleStone(s.id)} className={`cursor-pointer transition-colors ${s.selected ? 'bg-purple-50' : 'hover:bg-stone-50'}`}>
                                <td className="p-3 text-center"><div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${s.selected ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-300 bg-white'}`}>{s.selected && <CheckCircle size={12} />}</div></td>
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
               <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Price per Piece (USD) *</label>
                  <input type="number" className="w-full p-3 bg-white border border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:border-purple-500 outline-none" value={pricePerPc || ''} onChange={e => setPricePerPc(Number(e.target.value))} placeholder="0.00" autoFocus />
               </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-stone-200 flex justify-between bg-stone-50 rounded-b-2xl">
           <button onClick={step === 1 ? onClose : handleBack} className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-all">{step === 1 ? 'Cancel' : 'Back'}</button>
           <button onClick={step === 3 ? handleFinish : handleNext} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50" disabled={(step === 1 && (!formData.description || !formData.destination)) || (step === 2 && stones.filter(s => s.selected).length === 0)}>{step === 3 ? 'Create Export' : 'Next Step'} <ArrowRight size={16} /></button>
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
  isReadOnly?: boolean 
}> = ({ invoice, onBack, onEdit, isReadOnly }) => {
  const { total, totalWeight, totalItems } = calculateInvoiceTotals(invoice);
  
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
                onClick={() => generateInvoicePDF(invoice, 'partial')}
                className="flex items-center gap-2 px-5 py-2 bg-stone-100 text-stone-700 border border-stone-200 rounded-2xl text-sm font-bold hover:bg-stone-200 shadow-sm transition-all active:scale-95"
              >
                <ClipboardList size={18}/> Generate Partial
              </button>

             {/* Mode 1 Button: Full Invoice */}
             <button 
                onClick={() => generateInvoicePDF(invoice, 'full')}
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
                      <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">{invoice.description}</h2>
                      <div className="flex items-center gap-3 text-sm font-bold text-stone-400">
                         <span className="flex items-center gap-1">{invoice.destinationFlag} {invoice.destination}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                         <span className="font-mono text-stone-500">{invoice.invoiceNumber}</span>
                      </div>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(invoice.status)}`}>{invoice.status}</div>
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
                            <th className="p-6 text-right">Unit Price</th>
                            <th className="p-6 text-right">Value</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                         {invoice.items.map((item, i) => (
                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                               <td className="p-6 text-center text-stone-300 font-mono text-xs">{item.sn}</td>
                               <td className="p-6 font-bold text-stone-800">{item.description}</td>
                               <td className="p-6 text-center text-stone-600">{item.lotPcs}</td>
                               <td className="p-6 text-right font-mono font-bold text-stone-700">{item.weight.toFixed(2)}</td>
                               <td className="p-6 text-right font-mono text-stone-500">${item.price.toFixed(2)}</td>
                               <td className="p-6 text-right font-black text-stone-900 font-mono">${(item.value || (item.weight * item.price)).toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="md:hidden space-y-4 p-6">
                   {invoice.items.map((item, i) => (
                      <div key={i} className="bg-stone-50 rounded-2xl border border-stone-200 p-5">
                         <div className="flex justify-between items-start mb-4 border-b border-stone-200 pb-3">
                            <h4 className="font-bold text-stone-900">{item.description}</h4>
                            <span className="text-[10px] font-bold text-stone-300 uppercase">Entry #{item.sn}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-y-4 text-xs font-bold uppercase tracking-tight text-stone-500">
                            <div><span className="text-stone-300 block text-[9px] mb-1">Lot/Pcs</span><span className="text-stone-800">{item.lotPcs}</span></div>
                            <div className="text-right"><span className="text-stone-300 block text-[9px] mb-1">Weight</span><span className="text-stone-800">{item.weight.toFixed(2)} ct</span></div>
                            <div><span className="text-stone-300 block text-[9px] mb-1">Unit Price</span><span className="text-stone-800">${item.price}</span></div>
                            <div className="text-right"><span className="text-stone-300 block text-[9px] mb-1">Total</span><span className="text-emerald-600 text-base font-black font-mono">${(item.value || (item.weight * item.price)).toLocaleString()}</span></div>
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
                      <span className="font-black text-stone-800">{invoice.shippingMethod || '-'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400 uppercase tracking-tight text-xs">Tracking</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">{invoice.trackingNumber || 'Pending'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="font-bold text-stone-400 uppercase tracking-tight text-xs">Est. Arrival</span>
                      <span className="font-bold text-stone-800">{invoice.estDelivery || 'TBA'}</span>
                   </div>
                   <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className="font-black text-stone-800 uppercase tracking-tighter">Shipping Cost</span>
                      <span className="font-mono font-black text-stone-900 text-lg">${invoice.shippingCost}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <MapPin size={16} className="text-orange-500"/> Consignee
                </h3>
                <div className="text-sm">
                   <div className="font-black text-stone-900 text-lg mb-2">{invoice.customerName || 'Pending Recipient'}</div>
                   <div className="text-stone-500 leading-relaxed font-medium mb-4">{invoice.address || '-'}</div>
                   {invoice.phone && <div className="text-stone-800 font-bold flex items-center gap-2 text-xs"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {invoice.phone}</div>}
                </div>
             </div>

             {(invoice.notes || invoice.customerNotes) && (
                <div className="bg-white rounded-[32px] border border-stone-200 p-6 shadow-sm">
                   <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info size={16} className="text-stone-300"/> Documentation Notes
                   </h3>
                   {invoice.notes && <p className="text-xs text-stone-600 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-3 leading-relaxed">{invoice.notes}</p>}
                   {invoice.customerNotes && <p className="text-xs text-stone-400 italic font-medium px-2">" {invoice.customerNotes} "</p>}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
