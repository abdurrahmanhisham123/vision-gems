import React, { useState } from 'react';
import { 
  Search, Plus, Download, Filter, 
  Scissors, Sparkles, Calendar, User, 
  Tag, Scale, DollarSign, Briefcase, 
  ArrowRight, CheckCircle, Clock, MoreHorizontal
} from 'lucide-react';

interface CutPolishItem {
  id: string;
  type: 'Cutting' | 'Polishing';
  company: string;
  date: string;
  code: string;
  name: string; 
  description: string;
  weight: number;
  cashAmount: number;
  status: 'In Progress' | 'Completed';
}

const MOCK_DATA: CutPolishItem[] = [
  { id: 'cut-1', type: 'Cutting', company: 'Vision Gems', date: '2024-10-01', code: 'R-001', name: 'Kamal', description: 'Rough sawing', weight: 5.25, cashAmount: 5000, status: 'Completed' }
];

export const CutPolishTemplate: React.FC<{ moduleId: string, tabId: string, isReadOnly?: boolean }> = ({ moduleId, tabId, isReadOnly }) => {
  const [activeTab, setActiveTab] = useState<'Cutting' | 'Polishing'>('Cutting');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Cut & Polish</h2>
           <p className="text-stone-500 text-sm mt-1">Stones currently being processed</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> New Job
           </button>
        )}
      </div>

      {/* Controls - Tab Switcher & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="flex bg-stone-100 p-1 rounded-xl shrink-0">
            <button 
               onClick={() => setActiveTab('Cutting')} 
               className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Cutting' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               Cutting
            </button>
            <button 
               onClick={() => setActiveTab('Polishing')} 
               className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'Polishing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
               Polishing
            </button>
         </div>

         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code or worker..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="p-5 pl-8">Code</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Worker</th>
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right pr-10">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {MOCK_DATA.filter(i=>i.type === activeTab).map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-all cursor-pointer">
                     <td className="p-5 pl-8 font-mono font-bold text-stone-700">{item.code}</td>
                     <td className="p-5 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-bold text-stone-800">{item.name}</td>
                     <td className="p-5 text-stone-600">{item.description}</td>
                     <td className="p-5 text-right pr-10 font-bold text-stone-900">{item.cashAmount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};