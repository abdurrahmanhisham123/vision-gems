import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Briefcase, Wallet,
  Calculator, Download, Filter, 
  AlertTriangle, Percent, Scale, 
  Building2, Hash, User, FileText, Clock, ChevronRight,
  Info, ArrowRight
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface SupplierLedgerEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string; 
  description: string;
  weight: number;
  amount: number;      
  percent: number;     
  commission: number;  
  finalAmount: number; 
  payableAmount: number; 
  paidAmount: number;    
  paymentDue: string;    
  status: 'Paid' | 'Pending' | 'Overdue';
}

const BERUWALA_DEMO: SupplierLedgerEntry[] = [
  { id: 'ber-1', company: 'Vision Gems', date: '2024-11-20', code: 'PUR-BER-001', name: 'Shafras', description: 'Mixed Rough Spinel Lot', weight: 22.45, amount: 310000, percent: 0, commission: 0, finalAmount: 310000, payableAmount: 310000, paidAmount: 310000, paymentDue: '2024-11-20', status: 'Paid' },
  { id: 'ber-2', company: 'Spinel Gallery', date: '2024-12-05', code: 'PUR-BER-005', name: 'Mohamed', description: 'Blue Sapphire Selection', weight: 2.50, amount: 125000, percent: 5, commission: 6250, finalAmount: 131250, payableAmount: 131250, paidAmount: 50000, paymentDue: '2024-12-20', status: 'Pending' }
];

export const SupplierLedgerTemplate: React.FC<{ moduleId: string, tabId: string, isReadOnly?: boolean }> = ({ moduleId, tabId, isReadOnly }) => {
  const [entries] = useState<SupplierLedgerEntry[]>(BERUWALA_DEMO);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SupplierLedgerEntry | null>(null);

  const stats = useMemo(() => {
    const totalOwed = entries.reduce((sum, e) => sum + (e.payableAmount - e.paidAmount), 0);
    return { totalOwed };
  }, [entries]);

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header - Unified Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Payable <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{tabId} Ledger</h2>
           <p className="text-stone-500 text-sm mt-1">LKR {stats.totalOwed.toLocaleString()} outstanding for this supplier</p>
        </div>
        {!isReadOnly && (
           <button 
             className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95"
           >
             <Plus size={18} /> New Entry
           </button>
        )}
      </div>

      {/* Controls - Unified Design */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search entries..." 
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
                  <th className="p-5">Description</th>
                  <th className="p-5 text-right">Payable</th>
                  <th className="p-5 text-right pr-10">Paid</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
               {entries.map(item => (
                  <tr key={item.id} onClick={() => setSelectedEntry(item)} className="hover:bg-stone-50/50 transition-colors cursor-pointer group">
                     <td className="p-5 pl-8 font-mono text-stone-400 text-xs">{item.date}</td>
                     <td className="p-5 font-mono text-stone-700 font-bold">{item.code}</td>
                     <td className="p-5 text-stone-600 truncate max-w-xs">{item.description}</td>
                     <td className="p-5 text-right font-bold text-stone-900">{item.payableAmount.toLocaleString()}</td>
                     <td className="p-5 text-right pr-10 font-bold text-emerald-600">{item.paidAmount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {selectedEntry && (
         <DetailModal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={selectedEntry.name} subtitle={selectedEntry.description} status={selectedEntry.status} statusColor="bg-red-50 text-red-700 border-red-100" icon={<Wallet size={32} className="text-red-600" />} data={{'Ref Code': selectedEntry.code, 'Date': selectedEntry.date, 'Total Payable': `LKR ${selectedEntry.payableAmount.toLocaleString()}`, 'Total Paid': `LKR ${selectedEntry.paidAmount.toLocaleString()}`}} />
      )}
    </div>
  );
};