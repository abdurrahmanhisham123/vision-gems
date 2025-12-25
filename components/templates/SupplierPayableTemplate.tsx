import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  User, Tag, Scale, Building2,
  Filter, ChevronDown, Download, Printer,
  FileText, Briefcase, ChevronRight, Info
} from 'lucide-react';
import { PayableConfig } from '../../utils/payableConfig';

interface BuyingPaymentRecord {
  id: string;
  company: string;
  date: string;
  code: string;
  supplierName: string;
  description: string;
  weight: number;
  amount: number; 
}

const INITIAL_DATA: BuyingPaymentRecord[] = [
  { id: 'bp-1', company: 'Vision Gems', date: '2024-12-01', code: 'PUR-8821', supplierName: 'Mashaka', description: 'Rough Spinel Selection (Tanzania)', weight: 45.2, amount: 1250000 },
  { id: 'bp-2', company: 'Spinel Gallery', date: '2024-12-03', code: 'PUR-9902', supplierName: 'Juma', description: 'Mahenge Pink Lot', weight: 12.8, amount: 850000 },
  { id: 'bp-3', company: 'Vision Gems', date: '2024-12-05', code: 'PUR-1150', supplierName: 'Yusuph', description: 'Ruby Parcel', weight: 8.5, amount: 2100000 },
  { id: 'bp-4', company: 'Vision Gems', date: '2024-12-07', code: 'PUR-2210', supplierName: 'Halfan', description: 'Mixed Garnets', weight: 150.0, amount: 450000 },
  { id: 'bp-5', company: 'Spinel Gallery', date: '2024-12-10', code: 'PUR-3301', supplierName: 'Abubakkar', description: 'Tsavorite Rough', weight: 25.4, amount: 980000 },
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
  config: PayableConfig;
}

export const SupplierPayableTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly, config }) => {
  const [records, setRecords] = useState<BuyingPaymentRecord[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BuyingPaymentRecord | null>(null);

  const totalAmount = useMemo(() => records.reduce((sum, r) => sum + r.amount, 0), [records]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Payable <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Buying Payments Paid</h2>
           <p className="text-stone-500 text-sm mt-1">LKR {totalAmount.toLocaleString()} total settlements recorded</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> New Record
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by supplier or code..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0">
               <Download size={18} />
            </button>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-32">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 pl-8">Date</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Supplier</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right pr-10">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {records.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-mono text-stone-700 font-bold">{item.code}</td>
                     <td className="p-5 font-bold text-stone-900">{item.supplierName}</td>
                     <td className="p-5 text-stone-600 truncate max-w-xs">{item.description}</td>
                     <td className="p-5 text-right pr-10 font-bold text-stone-900">{item.amount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};