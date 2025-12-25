import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Truck, ArrowDownLeft, ArrowUpRight, Building2, User, 
  Tag, Scale, CreditCard, ChevronRight, Info, Plane, 
  BarChart3, Globe, ShieldCheck, MoreHorizontal, FileText,
  Layers, Package, ChevronDown
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface ExportChargeItem {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  method: string;
  amount: number;
}

const KENYA_IMPORT_DATA: ExportChargeItem[] = [
  { id: 'ki-1', company: 'Vision Gems', date: '2024-11-20', code: 'IMP-K-01', name: 'Kenya Customs', description: 'Import Duty for Rough Parcel', weight: 45.2, method: 'Cash', amount: 150000 },
  { id: 'ki-2', company: 'Vision Gems', date: '2024-11-22', code: 'IMP-K-02', name: 'Logistics Agent', description: 'Ground Handling & Clearance', weight: 0, method: 'Bank', amount: 162000 }
];

const SL_EXPORT_DATA: ExportChargeItem[] = [
  { id: 'sle-1', company: 'Spinel Gallery', date: '2024-11-25', code: 'EXP-SL-01', name: 'NGJA SL', description: 'Export Valuation & Tax', weight: 12.8, method: 'Cash', amount: 12500 }
];

export const KenyaExportTemplate: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExportChargeItem | null>(null);

  const SectionTitle = ({ title, icon: Icon, themeColor }: any) => (
    <div className="flex items-center gap-3 mb-6 mt-8 ml-2">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: themeColor }}></div>
      <Icon size={18} style={{ color: themeColor }} />
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">{title}</h3>
    </div>
  );

  const RenderTable = ({ data, themeColor }: { data: ExportChargeItem[], themeColor: string }) => (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
       <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                   <th className="p-5 pl-8">Company</th>
                   <th className="p-5">Date</th>
                   <th className="p-5">Code</th>
                   <th className="p-5">Authority</th>
                   <th className="p-5 text-right pr-10">Amount (LKR)</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-stone-100 text-sm">
                {data.map(item => (
                   <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                      <td className="p-5 pl-8"><span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 uppercase tracking-wide">{item.company}</span></td>
                      <td className="p-5 font-mono text-stone-400 text-xs">{item.date}</td>
                      <td className="p-5 font-mono font-bold text-stone-700 tracking-tight">{item.code}</td>
                      <td className="p-5 font-bold text-stone-900">{item.name}</td>
                      <td className="p-5 text-right pr-10 font-bold text-stone-900" style={{color: themeColor}}>{item.amount.toLocaleString()}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Kenya <span className="text-stone-300">/</span> Export
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Logistics Overview</h2>
           <p className="text-stone-500 text-sm mt-1">Import and export charge management</p>
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
        >
          <Plus size={18} /> New Record
        </button>
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by authority, company, or code..." 
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

      <div className="pb-32">
        <SectionTitle title="Kenya Import Charge" icon={Truck} themeColor="#D97706" />
        <RenderTable data={KENYA_IMPORT_DATA} themeColor="#D97706" />
        <SectionTitle title="SL Export Charge" icon={Plane} themeColor="#4F46E5" />
        <RenderTable data={SL_EXPORT_DATA} themeColor="#4F46E5" />
      </div>

      {selectedItem && (
         <DetailModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem.name} subtitle={selectedItem.description} status="Logistics Settled" statusColor="bg-emerald-50 text-emerald-700 border-emerald-100" icon={<ShieldCheck size={32} className="text-emerald-600" />} data={{'Transaction Date': selectedItem.date, 'Associated Company': selectedItem.company, 'Reference Code': selectedItem.code, 'Amount': `LKR ${selectedItem.amount.toLocaleString()}`}} />
      )}
    </div>
  );
};