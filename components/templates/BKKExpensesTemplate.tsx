import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, MapPin, Tag, 
  CreditCard, User, FileText, DollarSign, 
  Edit, Trash2, X, Save, Building2, 
  Info, Briefcase, ChevronRight, Globe, TrendingUp, Download
} from 'lucide-react';

interface BKKExpenseItem {
  id: string;
  company: string;      
  date: string;         
  code: string;         
  name: string;         
  description: string;  
  location: string;     
  amountLKR: number;    
  amountTHB: number;    
  bathRate: number;     
}

const MOCK_DATA: BKKExpenseItem[] = [
  { id: '1', company: 'Vision Gems', date: '2024-11-20', code: 'BKK-EXP-101', name: 'Somchai Logistics', description: 'Local stone transport', location: 'Bangkok Office', amountLKR: 12500, amountTHB: 1500, bathRate: 8.33 }
];

export const BKKExpensesTemplate: React.FC<{ isReadOnly?: boolean, moduleId: string, tabId: string }> = ({ tabId, isReadOnly, moduleId }) => {
  const [items] = useState<BKKExpenseItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ').replace('bkk', 'BKK')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{tabId}</h2>
           <p className="text-stone-500 text-sm mt-1">Operational cost tracking</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> Add Entry
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search records..." 
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

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 pl-8">Company</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Name</th>
                  <th className="p-5 text-right pr-10">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-bold text-stone-800">{item.company}</td>
                     <td className="p-5 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-mono text-red-600 text-xs font-bold">{item.code}</td>
                     <td className="p-5 font-medium text-stone-700">{item.name}</td>
                     <td className="p-5 text-right font-bold text-stone-900 pr-10">{item.amountLKR.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};