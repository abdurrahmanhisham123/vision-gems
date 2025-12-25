import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, MapPin, Tag, 
  User, FileText, DollarSign, Edit, Trash2, 
  X, Save, Building2, Info, Briefcase, 
  ChevronRight, Truck, Download
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface BKKExportChargeItem {
  id: string;
  company: string;      
  date: string;         
  code: string;         
  name: string;         
  description: string;  
  location: string;     
  amountLKR: number;    
}

const MOCK_DATA: BKKExportChargeItem[] = [
  { id: '1', company: 'Vision Gems', date: '2024-11-20', code: 'EXP-BKK-402', name: 'Thai Customs Authority', description: 'Import Duty & Processing Fee', location: 'Bangkok Airport', amountLKR: 85400 },
  { id: '2', company: 'Vision Gems', date: '2024-11-22', code: 'SHIP-9921', name: 'Malca-Amit', description: 'Valuable Cargo Handling Fee', location: 'BKK Storage', amountLKR: 12500 }
];

export const BKKExportChargeTemplate: React.FC<{ moduleId: string, tabId: string, isReadOnly?: boolean }> = ({ moduleId, tabId, isReadOnly }) => {
  const [items] = useState<BKKExportChargeItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BKKExportChargeItem | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              BKK Operations <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Export Charges</h2>
           <p className="text-stone-500 text-sm mt-1">Regulatory and logistics fees in Bangkok</p>
        </div>
        {!isReadOnly && (
           <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
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
               placeholder="Search by authority or code..." 
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
                  <th className="p-5 pl-8">Company</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Authority</th>
                  <th className="p-5">Ref Code</th>
                  <th className="p-5 text-right pr-10">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {items.map(item => (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-bold text-stone-800">{item.company}</td>
                     <td className="p-5 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-bold text-stone-900">{item.name}</td>
                     <td className="p-5 font-mono text-orange-600 font-bold">{item.code}</td>
                     <td className="p-5 text-right pr-10 font-bold text-stone-900">{item.amountLKR.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {selectedItem && (
         <DetailModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem.name} subtitle={selectedItem.description} status="Logistics Cleared" statusColor="bg-orange-50 text-orange-700 border-orange-100" icon={<Truck size={32} className="text-orange-600" />} data={{'Company': selectedItem.company, 'Date': selectedItem.date, 'Code': selectedItem.code, 'Location': selectedItem.location, 'Amount': `LKR ${selectedItem.amountLKR.toLocaleString()}`}} />
      )}
    </div>
  );
};