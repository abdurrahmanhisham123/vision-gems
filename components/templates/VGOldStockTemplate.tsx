import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Download, Filter, 
  X, FileText, ShoppingBag, User, 
  MapPin, Calendar, CreditCard, Gem,
  TrendingUp, Save, Edit, ChevronRight, Printer
} from 'lucide-react';

interface OldStockItem {
  id: string;
  codeNo: string;
  slCost: number;
  cutPolishWeight: number;
  shape: string;
  variety: string;
  colour: string;
  certificate: string;
  status: string;
  stoneWith: string;
  dateSelling: string;
  buyer: string;
  soldBy: string;
  paymentDue: string;
  sellingPrice: number;
  profit: number;
  paidStatus: string;
}

const INITIAL_DATA: OldStockItem[] = [
  { id: 'old-1', codeNo: 'VG-OLD-001', slCost: 150000, cutPolishWeight: 2.15, shape: 'Oval', variety: 'Blue Sapphire', colour: 'Cornflower', certificate: 'GIA', status: 'In Stock', stoneWith: 'Office', dateSelling: '', buyer: '', soldBy: '', paymentDue: '', sellingPrice: 0, profit: 0, paidStatus: 'Not Paid' },
  { id: 'old-2', codeNo: 'VG-OLD-002', slCost: 85000, cutPolishWeight: 1.05, shape: 'Cushion', variety: 'Ruby', colour: 'Pigeon Blood', certificate: 'GRS', status: 'Sold', stoneWith: 'Customer', dateSelling: '2024-10-15', buyer: 'John Doe', soldBy: 'Zahran', paymentDue: 'Cash', sellingPrice: 120000, profit: 35000, paidStatus: 'Paid' },
  { id: 'old-3', codeNo: 'VG-OLD-003', slCost: 45000, cutPolishWeight: 1.80, shape: 'Round', variety: 'Spinel', colour: 'Red', certificate: '-', status: 'In Stock', stoneWith: 'Cutter', dateSelling: '', buyer: '', soldBy: '', paymentDue: '', sellingPrice: 0, profit: 0, paidStatus: 'Not Paid' }
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let style = 'bg-stone-100 text-stone-600 border-stone-200';
  const s = status ? status.toLowerCase() : '';
  if (s.includes('sold')) style = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (s.includes('stock')) style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

const DetailPanel: React.FC<{
  item: OldStockItem;
  onClose: () => void;
  onSave: (updated: OldStockItem) => void;
}> = ({ item, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'financial' | 'sales'>('info');
  const [formData, setFormData] = useState<OldStockItem>(item);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof OldStockItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const Field = ({ label, value, field, type = 'text' }: { label: string, value: any, field: keyof OldStockItem, type?: string }) => {
    if (isEditing) {
      return (
        <div className="flex flex-col py-2 border-b border-stone-50 last:border-0 min-h-[60px] justify-center">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</label>
          <input 
            type={type} 
            value={formData[field]} 
            onChange={e => handleChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
            className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col py-2 border-b border-stone-50 last:border-0 min-h-[60px] justify-center">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</label>
        <div className="font-medium text-stone-800 text-sm truncate">
          {type === 'number' ? value?.toLocaleString() : (value || '-')}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200">
        <div className="px-6 py-5 bg-white border-b border-stone-200 flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={formData.status} />
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{formData.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 leading-tight">{formData.codeNo}</h2>
            <p className="text-sm text-stone-500 font-medium mt-1">{formData.variety} • {formData.cutPolishWeight} ct</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="flex border-b border-stone-200 bg-white">
          {['info', 'financial', 'sales'].map((tab: any) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === tab ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{tab}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30 custom-scrollbar">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            {activeTab === 'info' && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <Field label="Variety" value={formData.variety} field="variety" />
                <Field label="Weight" value={formData.cutPolishWeight} field="cutPolishWeight" type="number" />
                <Field label="Shape" value={formData.shape} field="shape" />
                <Field label="Colour" value={formData.colour} field="colour" />
                <Field label="Certificate" value={formData.certificate} field="certificate" />
                <Field label="Stone With" value={formData.stoneWith} field="stoneWith" />
              </div>
            )}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <Field label="SL Cost (LKR)" value={formData.slCost} field="slCost" type="number" />
                <Field label="Selling Price" value={formData.sellingPrice} field="sellingPrice" type="number" />
                <Field label="Profit / Loss" value={formData.profit} field="profit" type="number" />
              </div>
            )}
            {activeTab === 'sales' && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <Field label="Buyer" value={formData.buyer} field="buyer" />
                <Field label="Sold By" value={formData.soldBy} field="soldBy" />
                <Field label="Date Selling" value={formData.dateSelling} field="dateSelling" type="date" />
                <Field label="Payment Status" value={formData.paidStatus} field="paidStatus" />
                <Field label="Payment Due" value={formData.paymentDue} field="paymentDue" />
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3 z-10 sticky bottom-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={() => { onSave(formData); setIsEditing(false); }} className="px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700">Save Changes</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700"><Edit size={16} /> Edit Info</button>
          )}
        </div>
      </div>
    </div>
  );
};

export const VGOldStockTemplate: React.FC = () => {
  const [items, setItems] = useState<OldStockItem[]>(INITIAL_DATA);
  const [selectedItem, setSelectedItem] = useState<OldStockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => items.filter(i => 
    i.codeNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.variety.toLowerCase().includes(searchTerm.toLowerCase())
  ), [items, searchTerm]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Vision Gems SL <span className="text-stone-300">/</span> V G Old stock
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">V G Old Stock</h2>
           <p className="text-stone-500 text-sm mt-1">{filteredItems.length} items found</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
          <Plus size={18} /> Add Old Stock
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code or variety..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0"><Download size={18} /></button>
         </div>
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Code</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Weight</th>
                  <th className="p-4 text-center">Shape</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Cost (LKR)</th>
                  <th className="p-4 w-10"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredItems.map(item => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-purple-50/10 transition-colors cursor-pointer group">
                     <td className="p-4 pl-6 font-mono font-bold text-stone-700">{item.codeNo}</td>
                     <td className="p-4 font-bold text-stone-800">{item.variety}</td>
                     <td className="p-4 text-right font-mono text-stone-600">{item.cutPolishWeight.toFixed(2)}ct</td>
                     <td className="p-4 text-center text-stone-500">{item.shape}</td>
                     <td className="p-4 text-center"><StatusBadge status={item.status} /></td>
                     <td className="p-4 text-right font-mono font-bold text-stone-900">{item.slCost.toLocaleString()}</td>
                     <td className="p-4"><ChevronRight size={18} className="text-stone-300 group-hover:text-purple-600 transition-all"/></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      <div className="lg:hidden space-y-4">
         {filteredItems.map(item => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm active:scale-95 transition-transform">
               <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-stone-900 text-lg">{item.codeNo}</span>
                  <StatusBadge status={item.status} />
               </div>
               <div className="text-sm font-bold text-stone-800 mb-1">{item.variety}</div>
               <div className="flex justify-between items-end border-t border-stone-100 pt-3 mt-3">
                  <div><span className="text-[10px] text-stone-400 uppercase font-bold">Weight</span><div className="font-mono text-stone-800 font-bold">{item.cutPolishWeight} ct</div></div>
                  <div className="text-right"><span className="text-[10px] text-stone-400 uppercase font-bold">Cost</span><div className="font-bold text-stone-900">LKR {item.slCost.toLocaleString()}</div></div>
               </div>
            </div>
         ))}
      </div>

      {selectedItem && (
        <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} onSave={(upd) => setItems(prev => prev.map(i => i.id === upd.id ? upd : i))} />
      )}
    </div>
  );
};