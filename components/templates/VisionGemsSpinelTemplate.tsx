
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Filter, 
  X, Gem, DollarSign, Scale, Calendar, RefreshCw, Tag,
  MapPin, User, Briefcase, CreditCard, Layers, ArrowRight,
  ShoppingBag, FileText, Activity, Save, Printer, Building2,
  Palette, Camera, Upload, Image as ImageIcon, ChevronRight,
  MoreVertical, Info, Flame, FlameKindling, CheckCircle, Trash2, Edit,
  Calculator
} from 'lucide-react';
import { getVisionGemsSpinelData, saveExportedStone } from '../../services/dataService';
import { ExtendedSpinelStone } from '../../types';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- CONSTANTS ---
const AVAILABLE_SHAPES = ['Round', 'Oval', 'Cushion', 'Emerald', 'Pear', 'Marquise', 'Princess', 'Heart', 'Asscher', 'Radiant', 'Trillion', 'Baguette'];
const STATUS_OPTIONS = ['In Stock', 'Export', 'Approval', 'Sold', 'Pending', 'BKK', 'Missing'];

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
  certificate: '',
  supplier: '',
  slCost: 0,
  payable: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchasePaymentMethod: 'Cash',
  purchasePaymentStatus: 'Paid',
  inventoryCategory: 'In Stock',
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
  transactionAmount: 0
};

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
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none cursor-pointer"
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

const StoneDetailPanel: React.FC<{
  stone: ExtendedSpinelStone;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (stone: ExtendedSpinelStone) => void;
  onDelete: (id: string) => void;
}> = ({ stone: initialStone, initialIsEditing = false, onClose, onSave, onDelete }) => {
  
  const [activeTab, setActiveTab] = useState<'identity' | 'purchase' | 'sales' | 'financial'>('identity');
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<ExtendedSpinelStone>(initialStone);

  useEffect(() => {
    setFormData(initialStone);
    setIsEditing(initialIsEditing);
  }, [initialStone, initialIsEditing]);

  const handleInputChange = (key: keyof ExtendedSpinelStone, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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

        <div className="flex border-b border-stone-200 bg-white shrink-0">
          <TabButton id="identity" activeTab={activeTab} label="Identity" icon={Gem} onClick={setActiveTab} />
          <TabButton id="purchase" activeTab={activeTab} label="Purchase" icon={ShoppingBag} onClick={setActiveTab} />
          <TabButton id="sales" activeTab={activeTab} label="Sales" icon={User} onClick={setActiveTab} />
          <TabButton id="financial" activeTab={activeTab} label="Finance" icon={DollarSign} onClick={setActiveTab} />
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
                  <Field label="Code No." value={formData.codeNo} field="codeNo" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                  <Field label="Variety" value={formData.variety} field="variety" isEditing={isEditing} onInputChange={handleInputChange} useDatalist options={VARIETY_OPTIONS} />
                  <Field label="C & P Weight" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Colour" value={formData.color} field="color" isEditing={isEditing} onInputChange={handleInputChange} useDatalist options={COLOR_OPTIONS} />
                  <Field label="N/H (Treatment)" value={formData.treatment} field="treatment" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Pieces" value={formData.pieces} field="pieces" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Dimension" value={formData.dimensions} field="dimensions" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Certificate" value={formData.certificate} field="certificate" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Stones In (Location)" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Stone with (Holder)" value={formData.holder} field="holder" isEditing={isEditing} onInputChange={handleInputChange} />
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
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={14} className="text-emerald-500" /> Acquisition</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Supplier" value={formData.supplier} field="supplier" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Purchase Date" value={formData.purchaseDate} field="purchaseDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="SL Cost (LKR)" value={formData.slCost} field="slCost" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Payable" value={formData.payable} field="payable" isEditing={isEditing} onInputChange={handleInputChange} type="text" />
                  <Field label="Cash or Bank" value={formData.purchasePaymentMethod} field="purchasePaymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Bank']} />
                  <Field label="paid / notpaid" value={formData.purchasePaymentStatus} field="purchasePaymentStatus" isEditing={isEditing} onInputChange={handleInputChange} options={['paid', 'notpaid']} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} className="text-blue-500" /> Sales & Status</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="Status" value={formData.status} field="status" isEditing={isEditing} onInputChange={handleInputChange} options={STATUS_OPTIONS} />
                  <Field label="Date (Selling)" value={formData.sellDate} field="sellDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Buyer" value={formData.buyer} field="buyer" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Sold by" value={formData.soldBy} field="soldBy" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Outstanding Names" value={formData.outstandingName} field="outstandingName" isEditing={isEditing} onInputChange={handleInputChange} />
                  <Field label="Payment Due Date" value={formData.paymentDueDate} field="paymentDueDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Paid/Not Paid" value={formData.salesPaymentStatus} field="salesPaymentStatus" isEditing={isEditing} onInputChange={handleInputChange} options={['Paid', 'Not Paid', 'Partial']} />
                  <Field label="Payment paid Date" value={formData.paymentReceivedDate} field="paymentReceivedDate" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                  <Field label="Cash or Bank (Sales)" value={formData.salesPaymentMethod} field="salesPaymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Bank']} />
                  <Field label="Cleared" value={formData.paymentCleared} field="paymentCleared" isEditing={isEditing} onInputChange={handleInputChange} options={['Yes', 'No']} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={14} /> Currency & Valuation</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="RMB Currency" value={formData.priceRMB} field="priceRMB" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Bath Currency" value={formData.priceTHB} field="priceTHB" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="$ Currency" value={formData.priceUSD} field="priceUSD" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Calculator size={14} /> Profit & Share</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                  <Field label="RS Amount" value={formData.amountLKR} field="amountLKR" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="%" value={formData.margin} field="margin" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                  <Field label="Commission" value={formData.commission} field="commission" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Final Amount" value={formData.finalPrice} field="finalPrice" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                  <Field label="Profit / Loss" value={formData.profit} field="profit" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Each Share Amount" value={formData.shareAmount} field="shareAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Each Profit" value={formData.shareProfit} field="shareProfit" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Amount" value={formData.transactionAmount} field="transactionAmount" isEditing={isEditing} onInputChange={handleInputChange} type="number" isCurrency />
                  <Field label="Total stones" value={formData.inventoryCategory} field="inventoryCategory" isEditing={isEditing} onInputChange={handleInputChange} />
                </div>
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

  const filteredStones = useMemo(() => {
    return stones.filter(stone => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (stone.codeNo || '').toLowerCase().includes(q) || (stone.variety || '').toLowerCase().includes(q);
      const matchesColor = filterColor === 'All' || stone.color === filterColor;
      const matchesStatus = filterStatus === 'All' || stone.status === filterStatus;
      const matchesCompany = filterCompany === 'All' || stone.company === filterCompany;
      const matchesVariety = filterVariety === 'All' || stone.variety === filterVariety;
      
      let matchesWeight = true;
      if (filterWeight !== 'All') {
        const w = stone.weight;
        if (filterWeight === '0-1') matchesWeight = w < 1;
        else if (filterWeight === '1-2') matchesWeight = w >= 1 && w < 2;
        else if (filterWeight === '2-5') matchesWeight = w >= 2 && w < 5;
        else if (filterWeight === '5+') matchesWeight = w >= 5;
      }
      return matchesSearch && matchesColor && matchesWeight && matchesStatus && matchesCompany && matchesVariety;
    });
  }, [stones, searchQuery, filterColor, filterWeight, filterStatus, filterCompany, filterVariety]);

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
    } else if (status === 'In Stock' || status === 'Approval' || status === 'Sold') {
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

  if (loading) return <div className="flex flex-col items-center justify-center h-96 text-stone-400"><RefreshCw className="animate-spin mb-4" size={32} /><p className="text-sm font-bold uppercase tracking-widest">Loading Records...</p></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredStones.length} items currently in worklist</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap"><Printer size={16} /> Print List</button>
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
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Scale size={14} className="text-stone-300" /><select value={filterWeight} onChange={(e) => setFilterWeight(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Weight</option><option value="0-1">0-1ct</option><option value="1-2">1-2ct</option><option value="2-5">2-5ct</option><option value="5+">5+ct</option></select></div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0"><Tag size={14} className="text-stone-300" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"><option value="All">Status</option>{uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
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
