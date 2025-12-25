
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, FileText, 
  Trash2, Edit, Save, X, DollarSign, 
  CheckCircle, Calculator, CreditCard,
  Printer, Download, Filter, ArrowLeftRight,
  ShieldCheck, ArrowRight, Building2, Clock
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---

interface AuditPayment {
  id: string;
  date: string;
  code: string;
  name: string;
  description: string;
  amount: number;
  payableAmount: number;
  method: string;
}

interface AuditStatement {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  amount: number;
}

// --- Mock Data (Updated with User Provided Info) ---

const INITIAL_PAYMENTS: AuditPayment[] = [
  { 
    id: 'pay-1', 
    date: '2023-03-20', 
    code: '5110', 
    name: 'Audit Service', 
    description: 'Audit & CIT Fee 2021/22', 
    amount: 80000, 
    payableAmount: 0, 
    method: 'Zah Bank' 
  },
  {
    id: 'pay-2',
    date: '2023-05-15',
    code: '5110',
    name: 'Audit Service',
    description: 'CIT Final Settlement 21/22',
    amount: 607783,
    payableAmount: 0,
    method: 'Zah Bank'
  }
];

const INITIAL_STATEMENTS: AuditStatement[] = [
  { 
    id: 'stmt-1', 
    company: 'Zah Bank', 
    date: '2023-02-01', 
    code: '368', 
    name: 'Audit Service', 
    description: 'Audit & CIT Fee 2021/22', 
    amount: 80000 
  },
  { 
    id: 'stmt-2', 
    company: 'Zah Bank', 
    date: '2023-04-10', 
    code: '412', 
    name: 'Audit Service', 
    description: 'CIT Final Settlement 21/22', 
    amount: 607783 
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const AuditAccountsTemplate: React.FC<Props> = ({ isReadOnly, tabId, moduleId }) => {
  const [payments, setPayments] = useState<AuditPayment[]>(INITIAL_PAYMENTS);
  const [statements, setStatements] = useState<AuditStatement[]>(INITIAL_STATEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'Comparison' | 'Payments' | 'Statements'>('Comparison');

  // --- Calculations ---
  // Updated totals to match user requested "687,783" (80,000 + 607,783)
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const totalStatement = useMemo(() => statements.reduce((sum, s) => sum + s.amount, 0), [statements]);
  const totalPayable = useMemo(() => payments.reduce((sum, p) => sum + p.payableAmount, 0), [payments]);

  // Reconciliation Logic
  const isBalanced = totalPaid === totalStatement;

  // --- Filtered Data ---
  const filteredPayments = useMemo(() => 
    payments.filter(p => 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [payments, searchQuery]
  );

  const filteredStatements = useMemo(() => 
    statements.filter(s => 
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [statements, searchQuery]
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Area - Standardized UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> Governance
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-2">Audit & Accounts</h2>
           <p className="text-stone-500 max-w-xl">Official audit documentation, CIT compliance tracking, and bank reconciliation statements.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Calculator size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Audit Paid</div>
                 <div className="text-xl font-bold text-stone-800">LKR {totalPaid.toLocaleString()}</div>
              </div>
           </div>
           <div className={`flex-1 bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 ${isBalanced ? 'border-emerald-100' : 'border-amber-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Statement Match</div>
                 <div className="text-xl font-bold text-stone-800">LKR {totalStatement.toLocaleString()}</div>
              </div>
           </div>
        </div>
      </div>

      {/* Toolbar & View Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm mb-10 flex flex-col lg:flex-row gap-4 items-center">
         
         {/* View Toggle */}
         <div className="flex bg-stone-100 p-1 rounded-xl w-full lg:w-auto shrink-0">
            {['Comparison', 'Payments', 'Statements'].map((view: any) => (
               <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`flex-1 lg:px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeView === view ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                  {view}
               </button>
            ))}
         </div>

         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by description, code, or passenger..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
         
         <div className="flex gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 transition-all" title="Download Report">
               <Download size={18} />
            </button>
            {!isReadOnly && (
               <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0">
                  <Plus size={18} /> Add Entry
               </button>
            )}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-10">
         
         {/* 1. COMPARISON VIEW (Balanced dual list) */}
         {activeView === 'Comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
               
               {/* Center Link Icon (Desktop Only) */}
               <div className="hidden lg:flex absolute left-1/2 top-20 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-md items-center justify-center text-stone-400">
                  <ArrowLeftRight size={20} />
               </div>

               {/* Left side: Payments */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between pl-4">
                     <h3 className="font-bold text-lg text-stone-800 flex items-center gap-3">
                        <CreditCard size={18} className="text-purple-600" /> Audit Change Paid
                     </h3>
                     <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full uppercase">Payments</span>
                  </div>

                  <div className="space-y-4">
                     {filteredPayments.map(item => (
                        <div key={item.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100">
                                    <FileText size={20} />
                                 </div>
                                 <div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                       <Calendar size={10} /> {item.date}
                                    </div>
                                    <h4 className="font-bold text-stone-900 leading-tight">{item.description}</h4>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 mb-1">{item.code}</span>
                                 <span className="text-[10px] font-bold text-stone-400 uppercase">{item.method}</span>
                              </div>
                           </div>
                           
                           <div className="flex justify-between items-end border-t border-stone-50 pt-4 mt-2">
                              <div>
                                 <div className="text-[9px] font-bold text-stone-400 uppercase mb-0.5">Payable Amount</div>
                                 <div className={`text-sm font-bold ${item.payableAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {item.payableAmount > 0 ? `LKR ${item.payableAmount.toLocaleString()}` : 'Cleared (0)'}
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-[9px] font-bold text-stone-400 uppercase mb-0.5">Paid Amount</div>
                                 <div className="text-xl font-bold text-stone-900">LKR {item.amount.toLocaleString()}</div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right side: Statement */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between pl-4">
                     <h3 className="font-bold text-lg text-stone-800 flex items-center gap-3">
                        <Building2 size={18} className="text-blue-600" /> Audit Change Statement
                     </h3>
                     <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full uppercase">Bank Ledger</span>
                  </div>

                  <div className="space-y-4">
                     {filteredStatements.map(item => (
                        <div key={item.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                                    <CheckCircle size={20} />
                                 </div>
                                 <div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                       <Calendar size={10} /> {item.date}
                                    </div>
                                    <h4 className="font-bold text-stone-900 leading-tight">{item.description}</h4>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 mb-1">{item.code}</span>
                                 <span className="text-[10px] font-bold text-stone-400 uppercase">{item.company}</span>
                              </div>
                           </div>
                           
                           <div className="flex justify-between items-end border-t border-stone-50 pt-4 mt-2">
                              <div>
                                 <div className="text-[9px] font-bold text-stone-400 uppercase mb-0.5">Service Name</div>
                                 <div className="text-sm font-bold text-stone-700">{item.name}</div>
                              </div>
                              <div className="text-right">
                                 <div className="text-[9px] font-bold text-stone-400 uppercase mb-0.5">Statement Amount</div>
                                 <div className="text-xl font-bold text-stone-900">LKR {item.amount.toLocaleString()}</div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         )}

         {/* 2. FULL LIST VIEW FOR PAYMENTS */}
         {activeView === 'Payments' && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                           <th className="p-6">Date</th>
                           <th className="p-6">Code</th>
                           <th className="p-6">Name</th>
                           <th className="p-6">Description</th>
                           <th className="p-6 text-right">Payable</th>
                           <th className="p-6 text-right">Amount (LKR)</th>
                           <th className="p-6 text-center">Bank/Method</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-stone-100 text-sm">
                        {filteredPayments.map(p => (
                           <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                              <td className="p-6 font-mono text-stone-500 text-xs whitespace-nowrap">{p.date}</td>
                              <td className="p-6 font-mono font-bold text-stone-700">{p.code}</td>
                              <td className="p-6 font-bold text-stone-900">{p.name}</td>
                              <td className="p-6 text-stone-600">{p.description}</td>
                              <td className="p-6 text-right font-mono text-stone-400">{p.payableAmount.toLocaleString()}</td>
                              <td className="p-6 text-right font-bold text-purple-600 font-mono text-base">{p.amount.toLocaleString()}</td>
                              <td className="p-6 text-center">
                                 <span className="px-3 py-1 bg-stone-100 rounded-lg text-[10px] font-bold uppercase text-stone-500 border border-stone-200">{p.method}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 3. FULL LIST VIEW FOR STATEMENTS */}
         {activeView === 'Statements' && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                           <th className="p-6">Company</th>
                           <th className="p-6">Date</th>
                           <th className="p-6">Code</th>
                           <th className="p-6">Service Name</th>
                           <th className="p-6">Description</th>
                           <th className="p-6 text-right">Amount (LKR)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-stone-100 text-sm">
                        {filteredStatements.map(s => (
                           <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                              <td className="p-6">
                                 <span className="px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-bold uppercase text-blue-600 border border-blue-100">{s.company}</span>
                              </td>
                              <td className="p-6 font-mono text-stone-500 text-xs whitespace-nowrap">{s.date}</td>
                              <td className="p-6 font-mono font-bold text-stone-700">{s.code}</td>
                              <td className="p-6 font-bold text-stone-900">{s.name}</td>
                              <td className="p-6 text-stone-600">{s.description}</td>
                              <td className="p-6 text-right font-bold text-stone-900 font-mono text-base">{s.amount.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Empty State */}
         {filteredPayments.length === 0 && filteredStatements.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6 text-stone-300">
                  <Calculator size={40} />
               </div>
               <h3 className="text-xl font-bold text-stone-800">No matching audit records</h3>
               <p className="text-stone-500 mt-2 max-w-sm">Adjust your filters or add a new entry to track audit compliance.</p>
            </div>
         )}
      </div>

    </div>
  );
};
