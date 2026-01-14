
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Filter, 
  X, Gem, DollarSign, Scale, Calendar, RefreshCw, Tag,
  MapPin, User, Briefcase, CreditCard, Layers, ArrowRight,
  ShoppingBag, FileText, Activity, Save, Printer, Building2,
  Palette, Camera, Upload, Image as ImageIcon, ChevronRight,
  MoreVertical, Info, Flame, FlameKindling, CheckCircle, Trash2, Edit,
  Calculator, Award, Scissors
} from 'lucide-react';
import { getVisionGemsSpinelData, saveExportedStone } from '../../services/dataService';
import { ExtendedSpinelStone, CutPolishRecord } from '../../types';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- CONSTANTS ---
const AVAILABLE_SHAPES = ['Round', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Marquise', 'Princess', 'Heart', 'Asscher', 'Radiant', 'Trillion', 'Baguette'];
const STATUS_OPTIONS = ['In Stock', 'Export', 'Approval In', 'Approval Out', 'Sold', 'Pending', 'Pending Payment', 'Partial Payment', 'Overdue Payment', 'BKK', 'Missing'];

const VARIETY_OPTIONS = [
  'Spinel', 'Mahenge Spinel', 'Pink Spinel', 'Red Spinel', 'TSV', 'Ruby', 
  'Blue Sapphire', 'Pink Sapphire', 'Yellow Sapphire', 'Violet Sapphire', 
  'Padparadscha', 'Garnet', 'Mandarin Garnet', 'Zircon', 'Tourmaline', 
  'Chrysoberyl', 'Aquamarine', 'Emerald'
];

const COLOR_OPTIONS = [
  'Red', 'Pink', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Lavender', 
  'Cornflower', 'Royal Blue', 'Pigeon Blood', 'Colorless', 'Bi-Color', 'Multi-Color'
];

// Currency options and exchange rates (matching Unified Payment Ledger)
const PURCHASE_CURRENCIES = ['USD', 'LKR', 'EUR', 'GBP', 'TZS', 'KES', 'THB'];
const PURCHASE_EXCHANGE_RATES: Record<string, number> = {
  'USD': 302.50,
  'LKR': 1.00,
  'EUR': 330.20,
  'GBP': 385.80,
  'TZS': 0.1251,
  'KES': 2.33,
  'THB': 8.50
};

// Format currency helper function (matching Unified Payment Ledger)
const formatCurrency = (amount: number, currency: string): string => {
  if (!amount && amount !== 0) return '-';
  const formatted = amount.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
  return `${formatted} ${currency}`;
};

// --- STANDARD SHAPE ICON COMPONENT ---
const ShapeIcon: React.FC<{ shape: string, className?: string }> = ({ shape, className = "w-full h-full" }) => {
  const s = shape ? shape.toLowerCase().trim() : 'round';
  const color = "currentColor";
  const strokeWidth = 1.5;

  const paths: Record<string, React.ReactNode> = {
    round: <><circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M12 3L12 21 M3 12L21 12 M6 6L18 18 M18 6L6 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    oval: <ellipse cx="12" cy="12" rx="7" ry="10" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    cushion: <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    emerald: <><rect x="5" y="3" width="14" height="18" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M5 6L19 6 M5 18L19 18" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    pear: <path d="M12 2C12 2 4 14 4 17C4 20.5 8 22 12 22C16 22 20 20.5 20 17C20 14 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    marquise: <path d="M12 2C12 2 4 12 12 22C20 12 12 2 12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    princess: <><rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M4 4L20 20 M20 4L4 20" stroke={color} strokeWidth={0.5} opacity="0.5" /></>,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth={strokeWidth} fill="none" transform="scale(0.8) translate(3,3)" />,
    asscher: <><rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth={strokeWidth} fill="none" /><path d="M4 8L8 4 M16 4L20 8 M20 16L16 20 M8 20L4 16" stroke={color} strokeWidth={strokeWidth} fill="none" /></>,
    radiant: <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    trillion: <path d="M12 3L21 19H3L12 3Z" stroke={color} strokeWidth={strokeWidth} fill="none" />,
    baguette: <rect x="6" y="3" width="12" height="18" stroke={color} strokeWidth={strokeWidth} fill="none" />,
  };

  return <svg viewBox="0 0 24 24" className={className}>{paths[s] || paths.round}</svg>;
};

const EMPTY_STONE: ExtendedSpinelStone = {
  id: '',
  company: 'Vision Gems',
  codeNo: '',
  weight: 0,
  shape: 'Round',
  variety: 'Spinel',
  treatment: 'N',
  photos: [],
  color: '',
  pieces: 1,
  dimensions: '',
  title: '',
  certificate: '',
  supplier: '',
  slCost: 0,
  payable: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchasePaymentMethod: 'Cash',
  purchasePaymentStatus: 'Paid',
  inventoryCategory: 'In Stock',
  purchasePrice: 0,
  purchaseExpectedSellingPrice: 0,
  purchasePriceCode: '',
  status: 'In Stock',
  location: '',
  originalCategory: undefined,
  holder: '',
  outstandingName: '',
  sellDate: '',
  buyer: '',
  soldBy: '',
  paymentDueDate: '',
  salesPaymentStatus: '',
  paymentReceivedDate: '',
  sellingPrice: 0,
  priceRMB: 0,
  priceTHB: 0,
  priceUSD: 0,
  exchangeRate: 0,
  amountLKR: 0,
  margin: 0,
  commission: 0,
  finalPrice: 0,
  profit: 0,
  shareAmount: 0,
  shareProfit: 0,
  salesPaymentMethod: 'Cash',
  paymentCleared: 'No',
  transactionAmount: 0,
  certificateImage: '',
  certificatePrice: 0,
  cutPolishRecords: [],
  purchaseCustomerName: '',
  purchaseDescription: '',
  purchaseDeal: '',
  purchaseCurrency: 'LKR',
  purchaseExchangeRate: 1,
  purchaseAmount: 0,
  purchaseOfficePercent: 0,
  purchaseCommission: 0,
  purchaseFinalAmount: 0,
  purchaseFinalAmountLKR: 0,
  purchasePaidAmount: 0,
  purchaseOutstandingAmount: 0,
  purchaseOutstandingAmountLKR: 0,
  purchasePaymentDate: '',
  purchaseDueDate: '',
  purchaseSourceOfFunds: '',
  purchaseIsJointPurchase: false,
  purchasePartnerName: '',
  purchasePartnerPercentage: 0,
  purchasePartnerInvestment: 0,
  purchaseJointPurchaseTripLocation: '',
  purchaseTripLocation: '',
  purchaseSalesLocation: '',
  purchasePayables: 0,
  salesCustomerName: '',
  salesDescription: '',
  salesDeal: '',
  salesCurrency: 'LKR',
  salesExchangeRate: 1,
  salesAmount: 0,
  salesAmountLKR: 0,
  salesAmountUSD: 0,
  salesAmountTHB: 0,
  salesAmountRMB: 0,
  salesOfficePercent: 0,
  salesCommission: 0,
  salesFinalAmount: 0,
  salesFinalAmountLKR: 0,
  salesPaidAmount: 0,
  salesOutstandingAmount: 0,
  salesOutstandingAmountLKR: 0,
  salesPaymentDate: '',
  salesDueDate: '',
  approvalOutTo: '',
  approvalInFrom: ''
};

// Trip/Location options for Purchase tab
const TRIP_LOCATION_OPTIONS = [
  'Kenya',
  'Mahenge (VGTZ)',
  'Madagascar',
  'Dada',
  'VG Ramazan',
  'BKK Operations',
  'SpinelGallery',
  'Vision Gems SL',
  'Sri Lanka',
  'Other'
];

// --- STABLE SUB-COMPONENTS ---

const Field: React.FC<{ 
  label: string, 
  value: any, 
  field: keyof ExtendedSpinelStone, 
  isEditing: boolean, 
  onInputChange: (key: keyof ExtendedSpinelStone, value: any) => void,
  type?: 'text' | 'number' | 'date', 
  highlight?: boolean, 
  isCurrency?: boolean, 
  options?: string[],
  useDatalist?: boolean 
}> = ({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options = [], useDatalist = false }) => {
  const datalistId = `datalist-${field}`;

  return (
    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
      {isEditing ? (
        useDatalist ? (
          <>
            <input 
              list={datalistId}
              type="text"
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10" 
              placeholder={`Select or type ${label.toLowerCase()}...`}
            />
            <datalist id={datalistId}>
              {options.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </>
        ) : options.length > 0 ? (
          <select 
            value={value === undefined || value === null ? '' : value.toString()} 
            onChange={(e) => onInputChange(field, e.target.value)} 
            className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none cursor-pointer appearance-none"
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            value={value === undefined || value === null ? '' : value.toString()} 
            onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10" 
          />
        )
      ) : (
        <span className={`text-sm ${highlight ? 'font-bold text-purple-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
          {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
        </span>
      )}
    </div>
  );
};

const TabButton: React.FC<{ 
  id: string, 
  activeTab: string, 
  label: string, 
  icon: any, 
  onClick: (id: any) => void 
}> = ({ id, activeTab, label, icon: Icon, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all border-b-2 ${activeTab === id ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}
  >
    <Icon size={18} className="mb-1" />
    <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
  </button>
);

const CutPolishRecordItem: React.FC<{
  record: CutPolishRecord;
  index: number;
  isEditing: boolean;
  onUpdate: (record: CutPolishRecord) => void;
  onDelete: () => void;
}> = ({ record, index, isEditing, onUpdate, onDelete }) => {
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editData, setEditData] = useState<CutPolishRecord>(record);

  useEffect(() => {
    setEditData(record);
    setIsEditingRecord(false);
  }, [record]);

  const handleSave = () => {
    if (!editData.worker.trim()) {
      alert('Worker/Cutter name is required');
      return;
    }
    onUpdate(editData);
    setIsEditingRecord(false);
  };

  if (!isEditing) {
    return (
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Worker/Cutter</span>
            <p className="text-stone-700 font-semibold mt-1">{record.worker || '-'}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Type</span>
            <p className="text-stone-700 font-semibold mt-1 capitalize">{record.type || '-'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Description</span>
            <p className="text-stone-700 font-medium mt-1">{record.description || '-'}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Amount (LKR)</span>
            <p className="text-stone-700 font-semibold mt-1 font-mono">{record.amount ? record.amount.toLocaleString() : '0'}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Payment Method</span>
            <p className="text-stone-700 font-semibold mt-1">{record.paymentMethod || '-'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditingRecord) {
    return (
      <div className="p-4 bg-purple-50/30 rounded-2xl border-2 border-purple-200">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Worker/Cutter</label>
              <input
                type="text"
                value={editData.worker}
                onChange={(e) => setEditData({ ...editData, worker: e.target.value })}
                className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                placeholder="Worker name"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Type</label>
              <select
                value={editData.type}
                onChange={(e) => setEditData({ ...editData, type: e.target.value as 'cut' | 'polish' | 'both' })}
                className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              >
                <option value="cut">Cut</option>
                <option value="polish">Polish</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 min-h-[80px]"
              placeholder="Description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Amount (LKR)</label>
              <input
                type="number"
                value={editData.amount || 0}
                onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })}
                className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 font-mono"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Payment Method</label>
              <select
                value={editData.paymentMethod}
                onChange={(e) => setEditData({ ...editData, paymentMethod: e.target.value })}
                className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setIsEditingRecord(false)}
              className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-purple-700 transition-all"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Record #{index + 1}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditingRecord(true)}
            className="p-1.5 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Worker/Cutter</span>
          <p className="text-stone-700 font-semibold mt-1">{record.worker || '-'}</p>
        </div>
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Type</span>
          <p className="text-stone-700 font-semibold mt-1 capitalize">{record.type || '-'}</p>
        </div>
        <div className="col-span-2">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Description</span>
          <p className="text-stone-700 font-medium mt-1">{record.description || '-'}</p>
        </div>
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Amount (LKR)</span>
          <p className="text-stone-700 font-semibold mt-1 font-mono">{record.amount ? record.amount.toLocaleString() : '0'}</p>
        </div>
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Payment Method</span>
          <p className="text-stone-700 font-semibold mt-1">{record.paymentMethod || '-'}</p>
        </div>
      </div>
    </div>
  );
};

const StoneDetailPanel: React.FC<{
  stone: ExtendedSpinelStone;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (stone: ExtendedSpinelStone) => void;
  onDelete: (id: string) => void;
}> = ({ stone: initialStone, initialIsEditing = false, onClose, onSave, onDelete }) => {
  
  const [activeTab, setActiveTab] = useState<'identity' | 'purchase' | 'sales' | 'financial' | 'certificate' | 'cutPolish'>('identity');
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<ExtendedSpinelStone>(initialStone);

  // Get unique companies from localStorage for datalist
  const getCompanyOptions = (): string[] => {
    try {
      const saved = localStorage.getItem('vg_stone_persistence_registry_v2');
      if (saved) {
        const allStones: ExtendedSpinelStone[] = JSON.parse(saved);
        const companies = Array.from(new Set(allStones.map(s => s.company).filter(Boolean))).sort();
        return companies.length > 0 ? companies : ['Vision Gems', 'SpinelGallery', 'Vision Gems SL'];
      }
    } catch (e) {
      console.error('Error loading companies', e);
    }
    return ['Vision Gems', 'SpinelGallery', 'Vision Gems SL'];
  };

  const companyOptions = useMemo(() => getCompanyOptions(), []);

  useEffect(() => {
    // First set from initialStone prop
    setFormData(initialStone);
    setIsEditing(initialIsEditing);
    
    // Then refresh from localStorage to get latest data (especially cut and polish records)
    try {
      const saved = localStorage.getItem('vg_stone_persistence_registry_v2');
      if (saved) {
        const allStones: ExtendedSpinelStone[] = JSON.parse(saved);
        const latestStone = allStones.find(s => s.id === initialStone.id);
        if (latestStone) {
          setFormData(latestStone);
        }
      }
    } catch (e) {
      console.error('Error loading latest stone data:', e);
    }
  }, [initialStone, initialIsEditing]);

  // Refresh stone data when switching to cut and polish tab to get latest synced records
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:499',message:'cutPolish useEffect triggered',data:{activeTab,formDataId:formData?.id,hasFormData:!!formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (activeTab === 'cutPolish') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:501',message:'Entering cutPolish refresh logic',data:{formDataId:formData?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Refresh stone data from localStorage to get latest cut and polish records
      try {
        const saved = localStorage.getItem('vg_stone_persistence_registry_v2');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:504',message:'localStorage retrieved',data:{hasSaved:!!saved,savedLength:saved?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        if (saved) {
          const allStones: ExtendedSpinelStone[] = JSON.parse(saved);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:507',message:'JSON parsed successfully',data:{stonesCount:allStones?.length,formDataId:formData?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          const updatedStone = allStones.find(s => s.id === formData.id);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:509',message:'find operation completed',data:{foundStone:!!updatedStone,updatedStoneId:updatedStone?.id,hasCutPolishRecords:!!updatedStone?.cutPolishRecords,recordsCount:updatedStone?.cutPolishRecords?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (updatedStone) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:511',message:'About to setFormData with updatedStone',data:{updatedStoneKeys:Object.keys(updatedStone || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            setFormData(updatedStone);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:512',message:'setFormData called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }
        }
      } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:515',message:'Error in cutPolish refresh',data:{errorMessage:e instanceof Error ? e.message : String(e),errorStack:e instanceof Error ? e.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Error refreshing stone data:', e);
      }
    }
  }, [activeTab, formData.id]);

  // Auto-calculate purchase amounts with currency conversion
  useEffect(() => {
    const currency = formData.purchaseCurrency || 'LKR';
    const rate = formData.purchaseExchangeRate || 1;
    const amount = formData.purchaseAmount || 0;
    const officePercent = formData.purchaseOfficePercent || 0;
    const commissionLKR = formData.purchaseCommission || 0;
    const paidAmount = formData.purchasePaidAmount || 0;
    
    // Calculate Office Percentage Deduction in chosen currency
    const officePercentageDeduction = amount && officePercent
      ? (amount * officePercent) / 100
      : 0;
    
    // Convert Commission from LKR to chosen currency (if not LKR)
    const commissionInCurrency = currency === 'LKR' 
      ? commissionLKR 
      : commissionLKR / rate;
    
    // Calculate Final Amount in chosen currency: amount - officePercentageDeduction - commissionInCurrency
    const finalAmount = amount - officePercentageDeduction - commissionInCurrency;
    
    // Calculate Final Amount in LKR
    const finalAmountLKR = currency === 'LKR' 
      ? finalAmount 
      : finalAmount * rate;
    
    // Calculate Outstanding Amount in chosen currency: amount - paidAmount
    const outstandingAmount = amount - paidAmount;
    
    // Calculate Outstanding Amount in LKR
    const outstandingAmountLKR = currency === 'LKR' 
      ? outstandingAmount 
      : outstandingAmount * rate;
    
    setFormData(prev => ({
      ...prev,
      purchaseFinalAmount: finalAmount,
      purchaseFinalAmountLKR: finalAmountLKR,
      purchaseOutstandingAmount: outstandingAmount,
      purchaseOutstandingAmountLKR: outstandingAmountLKR
    }));
  }, [formData.purchaseAmount, formData.purchaseOfficePercent, formData.purchaseCommission, formData.purchasePaidAmount, formData.purchaseCurrency, formData.purchaseExchangeRate]);

  // Auto-calculate sales amounts with currency conversion
  useEffect(() => {
    // Determine active currency based on priority
    const { currency, amount } = getActiveSalesCurrency(formData);
    const rate = formData.salesExchangeRate || 1;
    const officePercent = formData.salesOfficePercent || 0;
    const commissionLKR = formData.salesCommission || 0;
    const paidAmount = formData.salesPaidAmount || 0;
    
    // Calculate Office Percentage Deduction in chosen currency
    const officePercentageDeduction = amount && officePercent
      ? (amount * officePercent) / 100
      : 0;
    
    // Convert Commission from LKR to chosen currency (if not LKR)
    const commissionInCurrency = currency === 'LKR' 
      ? commissionLKR 
      : commissionLKR / rate;
    
    // Calculate Final Amount in chosen currency: amount - officePercentageDeduction - commissionInCurrency
    const finalAmount = amount - officePercentageDeduction - commissionInCurrency;
    
    // Calculate Final Amount in LKR
    const finalAmountLKR = currency === 'LKR' 
      ? finalAmount 
      : finalAmount * rate;
    
    // Calculate Outstanding Amount in chosen currency: amount - paidAmount
    const outstandingAmount = amount - paidAmount;
    
    // Calculate Outstanding Amount in LKR
    const outstandingAmountLKR = currency === 'LKR' 
      ? outstandingAmount 
      : outstandingAmount * rate;
    
    setFormData(prev => ({
      ...prev,
      salesCurrency: currency,
      salesAmount: amount,
      salesFinalAmount: finalAmount,
      salesFinalAmountLKR: finalAmountLKR,
      salesOutstandingAmount: outstandingAmount,
      salesOutstandingAmountLKR: outstandingAmountLKR
    }));
  }, [formData.salesAmountLKR, formData.salesAmountUSD, formData.salesAmountTHB, formData.salesAmountRMB, formData.salesOfficePercent, formData.salesCommission, formData.salesPaidAmount, formData.salesExchangeRate]);


  const handleInputChange = (key: keyof ExtendedSpinelStone, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePurchaseCurrencyChange = (currency: string) => {
    const rate = PURCHASE_EXCHANGE_RATES[currency] || 1;
    setFormData(prev => ({
      ...prev,
      purchaseCurrency: currency,
      purchaseExchangeRate: rate
    }));
  };

  // Helper function to determine active currency based on priority (LKR > USD > THB > RMB)
  const getActiveSalesCurrency = (data: ExtendedSpinelStone): { currency: string; amount: number } => {
    // Priority order: LKR > USD > THB > RMB
    if (data.salesAmountLKR && data.salesAmountLKR > 0) {
      return { currency: 'LKR', amount: data.salesAmountLKR };
    }
    if (data.salesAmountUSD && data.salesAmountUSD > 0) {
      return { currency: 'USD', amount: data.salesAmountUSD };
    }
    if (data.salesAmountTHB && data.salesAmountTHB > 0) {
      return { currency: 'THB', amount: data.salesAmountTHB };
    }
    if (data.salesAmountRMB && data.salesAmountRMB > 0) {
      return { currency: 'RMB', amount: data.salesAmountRMB };
    }
    // Default to LKR with 0 amount
    return { currency: 'LKR', amount: 0 };
  };

  const handleSalesCurrencyChange = (currency: string) => {
    const rate = PURCHASE_EXCHANGE_RATES[currency] || 1;
    setFormData(prev => ({
      ...prev,
      salesCurrency: currency,
      salesExchangeRate: rate
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [base64String] 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photos: [] }));
  };

  const handleSave = () => {
    if (!formData.codeNo) {
      alert('Code Number is required');
      return;
    }
    onSave(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this stone?')) {
      onDelete(formData.id);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <!DOCTYPE html><html><head><title>Stone Details - ${formData.codeNo}</title>
      <style>body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c1917; }.card { border: 2px solid #e7e5e4; border-radius: 12px; padding: 40px; }
      .label { font-size: 11px; font-weight: 800; color: #78716c; text-transform: uppercase; }.value { font-size: 16px; font-weight: 600; margin-bottom: 20px; }</style>
      </head><body><div class="card"><h1>${formData.codeNo}</h1><p class="label">Variety</p><p class="value">${formData.variety}</p><p class="label">Weight</p><p class="value">${formData.weight} ct</p></div><script>window.onload=function(){window.print();}</script></body></html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
        
        <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
          <div className="flex gap-3 md:gap-4 items-center min-w-0">
            {formData.photos && formData.photos.length > 0 ? (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border border-stone-200 overflow-hidden shrink-0 shadow-sm">
                <img src={formData.photos[0]} alt="Stone" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-300 shrink-0">
                <ImageIcon size={24} />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                  formData.status === 'Sold' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  formData.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {formData.status || 'New'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.id.startsWith('new-') ? 'NEW' : formData.id}</span>
              </div>
              {isEditing ? (
                 <input type="text" value={formData.codeNo} onChange={(e) => handleInputChange('codeNo', e.target.value)} className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-purple-200 focus:border-purple-500 outline-none w-full" placeholder="Code No" autoFocus />
              ) : (
                 <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.codeNo}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                 <div className="w-4 h-4 text-purple-600 shrink-0"><ShapeIcon shape={formData.shape} /></div>
                 <p className="truncate">{formData.variety || 'Variety'} • {formData.weight || 0} ct</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex border-b border-stone-200 bg-white shrink-0 overflow-x-auto hide-scrollbar">
          <TabButton id="identity" activeTab={activeTab} label="Identity" icon={Gem} onClick={setActiveTab} />
          <TabButton id="purchase" activeTab={activeTab} label="Purchase" icon={ShoppingBag} onClick={setActiveTab} />
          <TabButton id="sales" activeTab={activeTab} label="Sales" icon={User} onClick={setActiveTab} />
          <TabButton id="financial" activeTab={activeTab} label="Finance" icon={DollarSign} onClick={setActiveTab} />
          <TabButton id="certificate" activeTab={activeTab} label="Certificate" icon={Award} onClick={setActiveTab} />
          <TabButton id="cutPolish" activeTab={activeTab} label="Cut & Polish" icon={Scissors} onClick={setActiveTab} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          {activeTab === 'identity' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Camera size={14} className="text-purple-500" /> Media</h3>
                <div className="flex flex-col items-center">
                  {formData.photos && formData.photos.length > 0 ? (
                    <div className="relative group w-full aspect-square max-w-[280px] rounded-3xl border border-stone-200 overflow-hidden shadow-md">
                      <img src={formData.photos[0]} alt="Stone" className="w-full h-full object-cover" />
                      {isEditing && (
                        <button onClick={removePhoto} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    isEditing ? (
                      <label className="w-full aspect-square max-w-[280px] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50 hover:bg-stone-100 cursor-pointer group">
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3"><Upload size={28} className="text-purple-500" /></div>
                        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Tap to Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    ) : (
                      <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                        <ImageIcon size={40} className="text-stone-200 mb-2" />
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">No Media</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Gem size={14} className="text-purple-500" /> Identification</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Company" value={formData.company || ''} field="company" isEditing={isEditing} onInputChange={handleInputChange} useDatalist options={companyOptions} />
                  <Field label="Code No." value={formData.codeNo} field="codeNo" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                  <Field label="Title" value={formData.title || ''} field="title" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Variety" value={formData.variety} field="variety" isEditing={isEditing} onInputChange={handleInputChange} useDatalist options={VARIETY_OPTIONS} />
                  <Field label="C & P Weight" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Colour" value={formData.color} field="color" isEditing={isEditing} onInputChange={handleInputChange} useDatalist options={COLOR_OPTIONS} />
                  <Field label="N/H (Treatment)" value={formData.treatment} field="treatment" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Pieces" value={formData.pieces} field="pieces" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Dimension" value={formData.dimensions} field="dimensions" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Stones In (Location)" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Stone with (Holder)" value={formData.holder} field="holder" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Status" value={formData.status} field="status" isEditing={isEditing} onInputChange={handleInputChange} options={STATUS_OPTIONS} />
                  {formData.status === 'Approval Out' && (
                    <Field label="To Whom" value={formData.approvalOutTo || ''} field="approvalOutTo" isEditing={isEditing} onInputChange={handleInputChange} />
                  )}
                  {formData.status === 'Approval In' && (
                    <Field label="From Whom" value={formData.approvalInFrom || ''} field="approvalInFrom" isEditing={isEditing} onInputChange={handleInputChange} />
                  )}
                  <div className="col-span-2 py-2 border-b border-stone-50 min-h-[50px]">
                     <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">Shape Selection</span>
                     {isEditing ? (
                       <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                         {AVAILABLE_SHAPES.map(s => (
                           <button key={s} onClick={() => handleInputChange('shape', s)} className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${formData.shape === s ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50'}`}>
                             <div className="w-5 h-5 mb-1"><ShapeIcon shape={s} /></div>
                             <span className="text-[8px] uppercase font-bold truncate w-full px-0.5">{s}</span>
                           </button>
                         ))}
                       </div>
                     ) : (
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 text-stone-700 bg-stone-50 rounded-xl p-1.5 border border-stone-100"><ShapeIcon shape={formData.shape} /></div>
                          <span className="text-sm font-bold text-stone-700">{formData.shape}</span>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'purchase' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Existing Acquisition Fields */}
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={14} className="text-emerald-500" /> Acquisition</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Purchase Price" value={formData.purchasePrice || 0} field="purchasePrice" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Expected Selling Price" value={formData.purchaseExpectedSellingPrice || 0} field="purchaseExpectedSellingPrice" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Price Code" value={formData.purchasePriceCode || ''} field="purchasePriceCode" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Source of Funds" value={formData.purchaseSourceOfFunds || ''} field="purchaseSourceOfFunds" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Trip/Location" value={formData.purchaseTripLocation || ''} field="purchaseTripLocation" isEditing={isEditing} onInputChange={handleInputChange} options={TRIP_LOCATION_OPTIONS} />
                  <Field label="Payables (LKR)" value={formData.purchasePayables || 0} field="purchasePayables" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Joint Purchase</span>
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.purchaseIsJointPurchase || false}
                          onChange={(e) => handleInputChange('purchaseIsJointPurchase', e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-stone-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-stone-700">Purchased with a partner</span>
                      </label>
                    ) : (
                      <span className="text-sm font-medium text-stone-700">
                        {formData.purchaseIsJointPurchase ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>
                  {formData.purchaseIsJointPurchase && (
                    <>
                      <Field label="Partner Name" value={formData.purchasePartnerName || ''} field="purchasePartnerName" isEditing={isEditing} onInputChange={handleInputChange} />
                      <Field label="Partner Share (%)" value={formData.purchasePartnerPercentage || 0} field="purchasePartnerPercentage" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                      <Field label="Partner Investment" value={formData.purchasePartnerInvestment || 0} field="purchasePartnerInvestment" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                      <Field label="Trip Location (Shares)" value={formData.purchaseJointPurchaseTripLocation || ''} field="purchaseJointPurchaseTripLocation" isEditing={isEditing} onInputChange={handleInputChange} options={TRIP_LOCATION_OPTIONS} />
                    </>
                  )}
                </div>
              </div>

              {/* Payment Information Fields - Duplicated from Sales tab */}
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={14} className="text-emerald-500" /> Payment Information</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Purchase Date" value={formData.purchaseDate} field="purchaseDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Supplier" value={formData.salesCustomerName || ''} field="salesCustomerName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Description" value={formData.salesDescription || ''} field="salesDescription" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Deal" value={formData.salesDeal || ''} field="salesDeal" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="LKR Amount" value={formData.salesAmountLKR || 0} field="salesAmountLKR" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="USD Amount" value={formData.salesAmountUSD || 0} field="salesAmountUSD" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="THB Amount" value={formData.salesAmountTHB || 0} field="salesAmountTHB" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Tanzania Currency" value={formData.salesAmountRMB || 0} field="salesAmountRMB" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Rate" value={formData.salesExchangeRate || 1} field="salesExchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Cash or Bank" value={formData.purchasePaymentMethod} field="purchasePaymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Bank', 'NDB', 'NTB']} />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">OFFICE %</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={formData.salesOfficePercent === undefined || formData.salesOfficePercent === null ? '' : formData.salesOfficePercent.toString()} 
                          onChange={(e) => handleInputChange('salesOfficePercent', Number(e.target.value) || 0)} 
                          onFocus={(e) => {
                            if (formData.salesOfficePercent === 0 || formData.salesOfficePercent === undefined) {
                              e.target.select();
                            }
                          }}
                          className="w-24 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10" 
                          placeholder="%"
                        />
                        {(() => {
                          const { currency, amount } = getActiveSalesCurrency(formData);
                          if (formData.salesOfficePercent && amount) {
                            const officePercentageAddition = (amount * formData.salesOfficePercent) / 100;
                            return (
                              <span className="text-sm font-mono font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200 whitespace-nowrap">
                                +{officePercentageAddition.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                              </span>
                            );
                          }
                          return null;
                        })()}
                </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">
                          {formData.salesOfficePercent === undefined || formData.salesOfficePercent === null || formData.salesOfficePercent === 0 ? '-' : `${formData.salesOfficePercent}%`}
                        </span>
                        {(() => {
                          const { currency, amount } = getActiveSalesCurrency(formData);
                          if (formData.salesOfficePercent && amount) {
                            const officePercentageAddition = (amount * formData.salesOfficePercent) / 100;
                            return (
                              <span className="text-sm font-mono font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">
                                +{officePercentageAddition.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                              </span>
                            );
                          }
                          return null;
                        })()}
              </div>
                    )}
                  </div>
                  <Field label="Commission (LKR)" value={formData.salesCommission || 0} field="salesCommission" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Final Amount</span>
                    <div className="space-y-1">
                      {(() => {
                        const { currency, amount } = getActiveSalesCurrency(formData);
                        const rate = formData.salesExchangeRate || 1;
                        const officePercent = formData.salesOfficePercent || 0;
                        const commissionLKR = formData.salesCommission || 0;
                        
                        // Calculate Office Percentage Addition in chosen currency
                        const officePercentageAddition = amount && officePercent
                          ? (amount * officePercent) / 100
                          : 0;
                        
                        // Convert Commission from LKR to chosen currency (if not LKR)
                        const commissionInCurrency = currency === 'LKR' 
                          ? commissionLKR 
                          : commissionLKR / rate;
                        
                        // Calculate Final Amount in chosen currency: amount + officePercentageAddition + commissionInCurrency
                        const finalAmount = amount + officePercentageAddition + commissionInCurrency;
                        
                        // Calculate Final Amount in LKR
                        const finalAmountLKR = currency === 'LKR' 
                          ? finalAmount 
                          : finalAmount * rate;
                        
                        return (
                          <>
                            <div className="text-sm font-mono font-bold text-purple-700">
                              {formatCurrency(finalAmount, currency)}
                            </div>
                            {currency !== 'LKR' && (
                              <div className="text-xs font-mono text-stone-600">
                                {formatCurrency(finalAmountLKR, 'LKR')}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <Field label="Paid Amount" value={formData.salesPaidAmount || 0} field="salesPaidAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Outstanding Amount</span>
                    <div className="space-y-1">
                      {(() => {
                        const { currency, amount } = getActiveSalesCurrency(formData);
                        const rate = formData.salesExchangeRate || 1;
                        const officePercent = formData.salesOfficePercent || 0;
                        const commissionLKR = formData.salesCommission || 0;
                        const paidAmount = formData.salesPaidAmount || 0;
                        
                        // Calculate Office Percentage Addition in chosen currency
                        const officePercentageAddition = amount && officePercent
                          ? (amount * officePercent) / 100
                          : 0;
                        
                        // Convert Commission from LKR to chosen currency (if not LKR)
                        const commissionInCurrency = currency === 'LKR' 
                          ? commissionLKR 
                          : commissionLKR / rate;
                        
                        // Calculate Final Amount in chosen currency: amount + officePercentageAddition + commissionInCurrency
                        const finalAmount = amount + officePercentageAddition + commissionInCurrency;
                        
                        // Calculate Outstanding Amount in chosen currency: finalAmount - paidAmount
                        const outstandingAmount = finalAmount - paidAmount;
                        
                        // Calculate Outstanding Amount in LKR
                        const outstandingAmountLKR = currency === 'LKR' 
                          ? outstandingAmount 
                          : outstandingAmount * rate;
                        
                        return (
                          <>
                            <div className="text-sm font-mono font-bold text-purple-700">
                              {formatCurrency(outstandingAmount, currency)}
                            </div>
                            {currency !== 'LKR' && (
                              <div className="text-xs font-mono text-stone-600">
                                {formatCurrency(outstandingAmountLKR, 'LKR')}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Payment Information Fields */}
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={14} className="text-emerald-500" /> Payment Information</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Date (Selling)" value={formData.sellDate} field="sellDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Purchase Date" value={formData.purchaseDate} field="purchaseDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="BUYER" value={formData.salesCustomerName || ''} field="salesCustomerName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Description" value={formData.salesDescription || ''} field="salesDescription" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Deal" value={formData.salesDeal || ''} field="salesDeal" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="LKR Amount" value={formData.salesAmountLKR || 0} field="salesAmountLKR" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="USD Amount" value={formData.salesAmountUSD || 0} field="salesAmountUSD" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="THB Amount" value={formData.salesAmountTHB || 0} field="salesAmountTHB" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="RMB Amount" value={formData.salesAmountRMB || 0} field="salesAmountRMB" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Rate" value={formData.salesExchangeRate || 1} field="salesExchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">OFFICE %</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={formData.salesOfficePercent === undefined || formData.salesOfficePercent === null ? '' : formData.salesOfficePercent.toString()} 
                          onChange={(e) => handleInputChange('salesOfficePercent', Number(e.target.value) || 0)} 
                          onFocus={(e) => {
                            if (formData.salesOfficePercent === 0 || formData.salesOfficePercent === undefined) {
                              e.target.select();
                            }
                          }}
                          className="w-24 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10" 
                          placeholder="%"
                        />
                        {formData.salesOfficePercent && formData.salesAmount ? (
                          <span className="text-sm font-mono font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border-2 border-red-200 whitespace-nowrap">
                            -{((formData.salesAmount * formData.salesOfficePercent) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} {formData.salesCurrency || 'LKR'}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">
                          {formData.salesOfficePercent === undefined || formData.salesOfficePercent === null || formData.salesOfficePercent === 0 ? '-' : `${formData.salesOfficePercent}%`}
                        </span>
                        {formData.salesOfficePercent && formData.salesAmount ? (
                          <span className="text-sm font-mono font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border-2 border-red-200">
                            -{((formData.salesAmount * formData.salesOfficePercent) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} {formData.salesCurrency || 'LKR'}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <Field label="Commission (LKR)" value={formData.salesCommission || 0} field="salesCommission" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Final Amount</span>
                    <div className="space-y-1">
                      <div className="text-sm font-mono font-bold text-purple-700">
                        {formatCurrency(formData.salesFinalAmount || 0, formData.salesCurrency || 'LKR')}
                      </div>
                      {formData.salesCurrency && formData.salesCurrency !== 'LKR' && (
                        <div className="text-xs font-mono text-stone-600">
                          {formatCurrency(formData.salesFinalAmountLKR || 0, 'LKR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Field label="Paid Amount" value={formData.salesPaidAmount || 0} field="salesPaidAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Outstanding Amount</span>
                    <div className="space-y-1">
                      <div className="text-sm font-mono font-bold text-purple-700">
                        {formatCurrency(formData.salesOutstandingAmount || 0, formData.salesCurrency || 'LKR')}
                      </div>
                      {formData.salesCurrency && formData.salesCurrency !== 'LKR' && (
                        <div className="text-xs font-mono text-stone-600">
                          {formatCurrency(formData.salesOutstandingAmountLKR || 0, 'LKR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Existing Sales Information Fields */}
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} className="text-blue-500" /> Sales Information</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Sales Location" value={formData.purchaseSalesLocation || ''} field="purchaseSalesLocation" isEditing={isEditing} onInputChange={handleInputChange} options={['', 'Srilanka Sales', 'Bangkok Sales', 'China Sales']} />
                  <Field label="Outstanding Names" value={formData.outstandingName} field="outstandingName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Payment Due Date" value={formData.paymentDueDate} field="paymentDueDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Paid/Not Paid" value={formData.salesPaymentStatus} field="salesPaymentStatus" isEditing={isEditing} onInputChange={handleInputChange} options={['Paid', 'Not Paid', 'Partial']} />
                  <Field label="Payment method" value={formData.salesPaymentMethod} field="salesPaymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Credit', 'Slip', 'Cheque']} />
                  <Field label="Cleared" value={formData.paymentCleared} field="paymentCleared" isEditing={isEditing} onInputChange={handleInputChange} options={['Yes', 'No']} />
                </div>
              </div>

              {/* Paid Information Card */}
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14} className="text-green-500" /> Paid Information</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Payment paid Date" value={formData.paymentReceivedDate} field="paymentReceivedDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Cash or Bank" value={formData.salesPaymentMethod} field="salesPaymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Bank', 'NDB', 'NTB']} />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Calculator size={14} /> Profit & Share</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Profit / Loss" value={formData.profit} field="profit" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Each Share Amount" value={formData.shareAmount} field="shareAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Each Profit" value={formData.shareProfit} field="shareProfit" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Amount" value={formData.transactionAmount} field="transactionAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Total stones" value={formData.inventoryCategory} field="inventoryCategory" isEditing={isEditing} onInputChange={handleInputChange} />
                </div>
              </div>

              {/* Partner Share Section - Only show if Joint Purchase is enabled */}
              {formData.purchaseIsJointPurchase && (
                <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                  <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} /> Partner Share</h3>
                  <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Partner Name</span>
                      <span className="text-sm font-medium text-stone-700">
                        {formData.purchasePartnerName || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Partner Share</span>
                      <span className="text-sm font-medium text-stone-700">
                        {formData.purchasePartnerPercentage ? `${formData.purchasePartnerPercentage}%` : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center col-span-2">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Partner Amount (from Expected Selling Price)</span>
                      <span className="text-sm font-mono font-bold text-purple-700">
                        {(() => {
                          const expectedSellingPrice = formData.purchaseExpectedSellingPrice || 0;
                          const partnerPercentage = formData.purchasePartnerPercentage || 0;
                          if (expectedSellingPrice > 0 && partnerPercentage > 0) {
                            const partnerAmount = expectedSellingPrice * (partnerPercentage / 100);
                            return `${partnerAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} LKR`;
                          }
                          return '-';
                        })()}
                      </span>
                </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Award size={14} className="text-purple-500" /> Certificate Information</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Certificate Type" value={formData.certificate} field="certificate" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Certificate Price (LKR)" value={formData.certificatePrice || 0} field="certificatePrice" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                </div>
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Certificate Image</h4>
                  <div className="flex flex-col items-center">
                    {formData.certificateImage ? (
                      <div className="relative group w-full aspect-square max-w-[280px] rounded-3xl border border-stone-200 overflow-hidden shadow-md">
                        <img src={formData.certificateImage} alt="Certificate" className="w-full h-full object-cover" />
                        {isEditing && (
                          <button onClick={() => handleInputChange('certificateImage', '')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      isEditing ? (
                        <label className="w-full aspect-square max-w-[280px] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50 hover:bg-stone-100 cursor-pointer group">
                          <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3"><Upload size={28} className="text-purple-500" /></div>
                          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Upload Certificate</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                handleInputChange('certificateImage', base64String);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      ) : (
                        <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                          <ImageIcon size={40} className="text-stone-200 mb-2" />
                          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">No Certificate Image</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cutPolish' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* #region agent log */}
              {(() => { fetch('http://127.0.0.1:7242/ingest/71eaac38-ca19-4474-9603-a5a4029bf926',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VisionGemsSpinelTemplate.tsx:1252',message:'cutPolish tab rendering',data:{hasFormData:!!formData,formDataId:formData?.id,hasCutPolishRecords:!!formData?.cutPolishRecords,recordsCount:formData?.cutPolishRecords?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{}); return null; })()}
              {/* #endregion */}
              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2"><Scissors size={14} className="text-purple-500" /> Cut & Polish Records</h3>
                  {isEditing && (
                    <button 
                      onClick={() => {
                        const newRecord: CutPolishRecord = {
                          id: `cutpolish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          worker: '',
                          type: 'cut',
                          description: '',
                          amount: 0,
                          paymentMethod: 'Cash'
                        };
                        const currentRecords = formData.cutPolishRecords || [];
                        handleInputChange('cutPolishRecords', [...currentRecords, newRecord]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-purple-700 transition-all"
                    >
                      <Plus size={14} /> Add Record
                    </button>
                  )}
                </div>
                {(!formData.cutPolishRecords || formData.cutPolishRecords.length === 0) ? (
                  <div className="py-12 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                    <Scissors size={40} className="text-stone-200 mb-2" />
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">No Cut & Polish Records</span>
                    {isEditing && (
                      <button 
                        onClick={() => {
                          const newRecord: CutPolishRecord = {
                            id: `cutpolish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            worker: '',
                            type: 'cut',
                            description: '',
                            amount: 0,
                            paymentMethod: 'Cash'
                          };
                          handleInputChange('cutPolishRecords', [newRecord]);
                        }}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-purple-700 transition-all"
                      >
                        <Plus size={14} /> Add First Record
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.cutPolishRecords.map((record, index) => (
                      <CutPolishRecordItem
                        key={record.id}
                        record={record}
                        index={index}
                        isEditing={isEditing}
                        onUpdate={(updatedRecord) => {
                          const currentRecords = formData.cutPolishRecords || [];
                          const updatedRecords = currentRecords.map(r => r.id === record.id ? updatedRecord : r);
                          handleInputChange('cutPolishRecords', updatedRecords);
                        }}
                        onDelete={() => {
                          const currentRecords = formData.cutPolishRecords || [];
                          const updatedRecords = currentRecords.filter(r => r.id !== record.id);
                          handleInputChange('cutPolishRecords', updatedRecords);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
           {isEditing ? (
             <><button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button><button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all"><Save size={16} /> Save</button></>
           ) : (
             <><button onClick={handlePrint} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100"><Printer size={18} /></button><button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button><button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all"><Edit size={16} /> Edit Info</button></>
           )}
        </div>
      </div>
    </div>
  );
};

export const VisionGemsSpinelTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [stones, setStones] = useState<ExtendedSpinelStone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColor, setFilterColor] = useState('All');
  const [filterWeight, setFilterWeight] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterVariety, setFilterVariety] = useState('All');
  const [filterHolder, setFilterHolder] = useState('All');
  const [filterTitle, setFilterTitle] = useState('All');
  const [filterSalesLocation, setFilterSalesLocation] = useState('All');
  const [selectedStone, setSelectedStone] = useState<ExtendedSpinelStone | null>(null);

  const loadData = () => {
    setLoading(true);
    getVisionGemsSpinelData(tabId, moduleId).then(data => {
      setStones(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    setSelectedStone(null);
  }, [tabId, moduleId]);

  const uniqueColors = useMemo(() => Array.from(new Set([...stones.map(s => s.color), ...COLOR_OPTIONS].filter(Boolean))).sort(), [stones]);
  const uniqueStatuses = useMemo(() => Array.from(new Set([...stones.map(s => s.status), ...STATUS_OPTIONS].filter(Boolean))).sort(), [stones]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(stones.map(s => s.company).filter(Boolean))).sort(), [stones]);
  const uniqueVarieties = useMemo(() => Array.from(new Set(stones.map(s => s.variety).filter(Boolean))).sort(), [stones]);
  const uniqueHolders = useMemo(() => Array.from(new Set(stones.map(s => s.holder).filter(Boolean))).sort(), [stones]);
  const uniqueTitles = useMemo(() => Array.from(new Set(stones.map(s => s.title).filter(Boolean))).sort(), [stones]);
  const uniqueSalesLocations = useMemo(() => Array.from(new Set(stones.map(s => s.purchaseSalesLocation).filter(Boolean))).sort(), [stones]);

  const filteredStones = useMemo(() => {
    return stones.filter(stone => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (stone.codeNo || '').toLowerCase().includes(q) || (stone.variety || '').toLowerCase().includes(q);
      const matchesColor = filterColor === 'All' || stone.color === filterColor;
      const matchesStatus = filterStatus === 'All' || stone.status === filterStatus;
      const matchesCompany = filterCompany === 'All' || stone.company === filterCompany;
      const matchesVariety = filterVariety === 'All' || stone.variety === filterVariety;
      const matchesHolder = filterHolder === 'All' || stone.holder === filterHolder;
      const matchesTitle = filterTitle === 'All' || stone.title === filterTitle;
      const matchesSalesLocation = filterSalesLocation === 'All' || stone.purchaseSalesLocation === filterSalesLocation;
      
      let matchesWeight = true;
      if (filterWeight !== 'All') {
        const w = stone.weight;
        if (filterWeight === '0-0.5') matchesWeight = w >= 0 && w < 0.5;
        else if (filterWeight === '0.5-1') matchesWeight = w >= 0.5 && w < 1;
        else if (filterWeight === '1-1.5') matchesWeight = w >= 1 && w < 1.5;
        else if (filterWeight === '1.5-2') matchesWeight = w >= 1.5 && w < 2;
        else if (filterWeight === '2-5') matchesWeight = w >= 2 && w < 5;
        else if (filterWeight === '5-10') matchesWeight = w >= 5 && w < 10;
        else if (filterWeight === '10+') matchesWeight = w >= 10;
      }
      return matchesSearch && matchesColor && matchesWeight && matchesStatus && matchesCompany && matchesVariety && matchesHolder && matchesTitle && matchesSalesLocation;
    });
  }, [stones, searchQuery, filterColor, filterWeight, filterStatus, filterCompany, filterVariety, filterHolder, filterTitle, filterSalesLocation]);

  const handleSaveStone = (updatedStone: ExtendedSpinelStone) => {
    let newLocation = updatedStone.location;
    const status = updatedStone.status;
    
    // Preserve originalCategory - don't overwrite it
    let preservedOriginalCategory = updatedStone.originalCategory;
    
    // If stone doesn't have originalCategory, infer it from location if it's a valid category
    if (!preservedOriginalCategory && updatedStone.location) {
      const normalizedLocation = updatedStone.location.toLowerCase().trim();
      if (normalizedLocation !== 'bkk' && normalizedLocation !== 'export') {
        preservedOriginalCategory = updatedStone.location;
      }
    }

    // Update location based on status (for display/logical purposes)
    if (status === 'Export') {
      newLocation = 'Export';
    } else if (status === 'BKK') {
      newLocation = 'BKK';
    } else if (status === 'In Stock' || status === 'Approval In' || status === 'Approval Out' || status === 'Sold') {
      if (newLocation === 'Export' || newLocation === 'BKK' || !newLocation) {
        // If we have an originalCategory, use it; otherwise fall back to variety
        newLocation = preservedOriginalCategory || updatedStone.variety || 'Spinel';
      }
    }

    // Preserve originalCategory in the final stone
    const finalStone = { 
      ...updatedStone, 
      location: newLocation,
      originalCategory: preservedOriginalCategory
    };
    saveExportedStone(finalStone);
    
    loadData();
    if (selectedStone && selectedStone.id === finalStone.id) {
       setSelectedStone(finalStone);
    }
  };

  const handleAddNewStone = () => {
    const isBkkTab = tabId.toUpperCase() === 'BKK';
    const isExportTab = tabId.toUpperCase() === 'EXPORT';
    const normalizedTab = tabId.toLowerCase().trim();
    
    // For BKK/Export tabs, don't set originalCategory (they're functional tabs)
    // For category tabs, set originalCategory to track where stone was originally added
    const originalCategory = (isBkkTab || isExportTab || normalizedTab === 'all stones') 
      ? undefined 
      : tabId;
    
    const newStone = { 
       ...EMPTY_STONE, 
       id: `new-${Date.now()}`, 
       status: isBkkTab ? 'BKK' : isExportTab ? 'Export' : 'In Stock',
       location: tabId, 
       originalCategory: originalCategory,
       variety: tabId.includes('.') ? tabId.split('.')[0] : (tabId.toLowerCase() === 'all stones' ? 'Spinel' : tabId)
    };
    setSelectedStone(newStone);
  };

  const handleDeleteStone = (id: string) => {
    if (confirm('Delete stone?')) {
      const item = stones.find(s => s.id === id);
      if (item) saveExportedStone({ ...item, status: 'Deleted' });
      setStones(prev => prev.filter(s => s.id !== id));
      if (selectedStone?.id === id) setSelectedStone(null);
    }
  };

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredStones.map(stone => {
      const codeNo = (stone.codeNo || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const variety = (stone.variety || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const shape = (stone.shape || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Get first photo if available
      const photoUrl = stone.photos && stone.photos.length > 0 ? stone.photos[0] : null;
      const photoCell = photoUrl 
        ? `<img src="${photoUrl}" alt="Gem Photo" style="max-width: 80px; max-height: 80px; width: auto; height: auto; object-fit: contain; display: block; margin: 0 auto;" />`
        : '<span style="color: #999;">-</span>';
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: center; vertical-align: middle;">${photoCell}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${codeNo}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${variety}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${stone.weight.toFixed(2)} ct</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${shape}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${stone.pieces}</td>
      </tr>
    `;
    }).join('');

    const safeTabId = tabId.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Create print overlay that covers the page
    const printOverlay = document.createElement('div');
    printOverlay.id = 'print-overlay';
    printOverlay.style.position = 'fixed';
    printOverlay.style.top = '0';
    printOverlay.style.left = '0';
    printOverlay.style.width = '100%';
    printOverlay.style.height = '100%';
    printOverlay.style.backgroundColor = '#ffffff';
    printOverlay.style.zIndex = '99999';
    printOverlay.style.overflow = 'auto';
    printOverlay.style.padding = '40px';
    printOverlay.style.fontFamily = 'Arial, sans-serif';
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-overlay,
        #print-overlay * {
          visibility: visible;
        }
        #print-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          background: white;
        }
        @page {
          size: landscape;
          margin: 0.5in;
        }
        .no-print {
          display: none !important;
        }
      }
      @media screen {
        #print-overlay {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);
    
    printOverlay.innerHTML = `
      <div style="max-width: 100%; margin: 0 auto;">
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #000000;">
          <h1 style="font-size: 24pt; font-weight: bold; margin-bottom: 5px; color: #000000; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Vision Gems</h1>
          <p style="font-size: 9pt; color: #333333; margin: 0;">Printed on: ${printDate} at ${printTime}</p>
        </div>
        <div style="font-size: 16pt; font-weight: bold; margin: 10px 0; text-transform: uppercase; color: #000000;">${safeTabId}</div>
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 10px; font-size: 8pt;">
          <colgroup>
            <col style="width: 12%;">
            <col style="width: 15%;">
            <col style="width: 15%;">
            <col style="width: 12%;">
            <col style="width: 15%;">
            <col style="width: 10%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: center; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Gem Photo</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code No</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Variety</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Shape</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Pieces</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="6" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No stones found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(printOverlay);

    // Wait for content to render, then trigger print
    setTimeout(() => {
      window.print();
    }, 100);

    // Clean up after print dialog closes
    const handleAfterPrint = () => {
      if (document.body.contains(printOverlay)) {
        document.body.removeChild(printOverlay);
      }
      const printStyles = document.getElementById('print-styles');
      if (printStyles) {
        printStyles.remove();
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-96 text-stone-400"><RefreshCw className="animate-spin mb-4" size={32} /><p className="text-sm font-bold uppercase tracking-widest">Loading Records...</p></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Rich Inventory (Template 1) in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap"><Printer size={16} /> Print List</button>
           {!isReadOnly && <button onClick={handleAddNewStone} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 active:scale-95 whitespace-nowrap"><Plus size={18} /> Add Stone</button>}
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
         <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
               <input type="text" placeholder="Search by code or variety..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 outline-none transition-all placeholder-stone-300 text-stone-700" />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Building2 size={14} className="text-stone-300" /><select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Company</option>{uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Gem size={14} className="text-stone-300" /><select value={filterVariety} onChange={(e) => setFilterVariety(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Variety</option>{uniqueVarieties.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Palette size={14} className="text-stone-300" /><select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Color</option>{uniqueColors.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Scale size={14} className="text-stone-300" /><select value={filterWeight} onChange={(e) => setFilterWeight(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Weight</option><option value="0-0.5">0-0.5ct</option><option value="0.5-1">0.5-1ct</option><option value="1-1.5">1-1.5ct</option><option value="1.5-2">1.5-2ct</option><option value="2-5">2-5ct</option><option value="5-10">5-10ct</option><option value="10+">10+ct</option></select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Tag size={14} className="text-stone-300" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Status</option>{uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><User size={14} className="text-stone-300" /><select value={filterHolder} onChange={(e) => setFilterHolder(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Holder</option>{uniqueHolders.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><FileText size={14} className="text-stone-300" /><select value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Title</option>{uniqueTitles.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
               {tabId && tabId.toLowerCase().trim() === 'outstanding receivables' && (
                 <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><MapPin size={14} className="text-stone-300" /><select value={filterSalesLocation} onChange={(e) => setFilterSalesLocation(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Country</option>{uniqueSalesLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
               )}
            </div>
         </div>
      </div>

      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Gem Photo</th>
                     <th className="p-6">Code No.</th>
                     <th className="p-6">Variety</th>
                     <th className="p-6 text-right">Weight</th>
                     <th className="p-6 text-center">Shape</th>
                     <th className="p-6 text-center">Status</th>
                     <th className="p-6 text-right pr-10">Price (USD)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredStones.map(stone => (
                     <tr key={stone.id} onClick={() => setSelectedStone(stone)} className="hover:bg-purple-50/5 transition-colors cursor-pointer group">
                        <td className="p-4 pl-10">
                           <div className="w-14 h-14 rounded-2xl border border-stone-100 overflow-hidden bg-stone-50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                              {stone.photos && stone.photos.length > 0 ? <img src={stone.photos[0]} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-stone-200" />}
                           </div>
                        </td>
                        <td className="p-6 font-mono font-black text-stone-900 tracking-tight">{stone.codeNo}</td>
                        <td className="p-6 font-bold text-stone-800">{stone.variety}</td>
                        <td className="p-6 text-right font-mono font-bold text-stone-700">{stone.weight.toFixed(2)}ct</td>
                        <td className="p-6">
                           <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <div className="w-6 h-6 text-stone-50 group-hover:text-purple-600"><ShapeIcon shape={stone.shape} /></div>
                              <span className="text-[8px] uppercase font-black text-stone-400">{stone.shape}</span>
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${stone.status === 'Sold' ? 'bg-blue-50 text-blue-700 border-blue-100' : stone.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{stone.status}</span>
                        </td>
                        <td className="p-6 text-right font-black text-stone-900 text-base pr-10">${(stone.priceUSD || 0).toLocaleString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-40">
         {filteredStones.map(stone => (
            <div key={stone.id} onClick={() => setSelectedStone(stone)} className="bg-white rounded-[32px] border border-stone-200 p-5 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group">
               <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl border border-stone-100 overflow-hidden bg-stone-50 flex items-center justify-center shrink-0">
                     {stone.photos && stone.photos.length > 0 ? <img src={stone.photos[0]} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-stone-200" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{stone.company}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${stone.status === 'Sold' ? 'bg-blue-50 text-blue-700 border-blue-100' : stone.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{stone.status}</span>
                     </div>
                     <h3 className="text-lg font-black text-stone-900 leading-tight truncate">{stone.codeNo}</h3>
                     <div className="text-sm font-bold text-stone-50 flex items-center gap-1.5 mt-0.5">
                        <span className="truncate text-stone-500">{stone.variety}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-200"></span>
                        <span className="font-mono text-stone-800">{stone.weight.toFixed(2)}ct</span>
                     </div>
                  </div>
               </div>
               <div className="mt-4 pt-3 border-t border-stone-50 flex justify-between items-center text-stone-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tap for Details</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         ))}
      </div>

      {selectedStone && (
         <StoneDetailPanel 
            stone={selectedStone} 
            initialIsEditing={selectedStone.id.startsWith('new-')} 
            onClose={() => setSelectedStone(null)} 
            onSave={handleSaveStone} 
            onDelete={handleDeleteStone} 
         />
      )}
    </div>
  );
};
