
import React, { useMemo, useState } from 'react';
import { generateCapitalEntries, generateMockTransactions } from '../../services/dataService';
import { DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, Plus, AlertCircle, CheckCircle, Clock, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { DetailModal } from '../DetailModal';
import { CapitalEntry, Transaction } from '../../types';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- TEMPLATE 3: FINANCIAL/CAPITAL ---
export const FinancialCapitalTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const entries = useMemo(() => generateCapitalEntries(20), []);
  const balance = entries[0]?.balanceAfter || 0;
  const [selectedEntry, setSelectedEntry] = useState<CapitalEntry | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gem-purple to-gem-purple-dark text-white p-6 rounded-2xl shadow-purple">
          <div className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Current Balance</div>
          <div className="text-3xl font-bold tracking-tight">{balance.toLocaleString()} <span className="text-base opacity-70 font-normal">LKR</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Money In (Month)</div>
            <div className="text-2xl font-bold text-emerald-600">+850,000</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUpRight size={20} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Money Out (Month)</div>
            <div className="text-2xl font-bold text-red-600">-620,000</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><ArrowDownRight size={20} /></div>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="font-bold text-stone-800 mb-4">Balance History</h3>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={entries.slice(0, 10).reverse()}>
               <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
               <Line type="monotone" dataKey="balanceAfter" stroke="#6B21A8" strokeWidth={3} dot={{fill: '#6B21A8'}} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-stone-700">Transaction History</h3>
          {!isReadOnly && <button className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg">Add Transaction</button>}
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-stone-500 font-medium bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {entries.map(e => (
              <tr key={e.id} onClick={() => setSelectedEntry(e)} className="hover:bg-stone-50 cursor-pointer transition-colors">
                <td className="p-4 text-stone-600 font-mono">{e.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${e.type === 'Addition' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {e.type}
                  </span>
                </td>
                <td className="p-4 text-stone-900 font-medium">{e.description}</td>
                <td className={`p-4 text-right font-bold ${e.type === 'Addition' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {e.type === 'Withdrawal' ? '-' : '+'}{e.amount.toLocaleString()}
                </td>
                <td className="p-4 text-right text-stone-600">{e.balanceAfter.toLocaleString()}</td>
                <td className="p-4 text-center"><span className="text-emerald-600 text-xs font-bold flex items-center justify-center gap-1"><CheckCircle size={12} /> {e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailModal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.description || 'Transaction'}
        subtitle={selectedEntry?.date}
        data={selectedEntry || {}}
        status={selectedEntry?.status}
        statusColor={selectedEntry?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
        icon={<DollarSign size={32} />}
      />
    </div>
  );
};

// --- TEMPLATE 4: EXPENSE TRACKING ---
export const ExpenseTrackingTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const expenses = useMemo(() => generateMockTransactions(20, 'Expense'), []);
  const [selectedExpense, setSelectedExpense] = useState<Transaction | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Expenses</h2>
          <div className="text-stone-500 text-sm mt-1">Total This Month: <span className="font-bold text-stone-900">125,500 LKR</span></div>
        </div>
        {!isReadOnly && (
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-red-700 transition-all">
            <Plus size={18} /> Add Expense
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {expenses.map(ex => (
          <div 
            key={ex.id} 
            onClick={() => setSelectedExpense(ex)}
            className="group bg-white p-4 rounded-xl border border-stone-200 flex justify-between items-center hover:shadow-md transition-all cursor-pointer hover:border-red-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm group-hover:bg-red-100 transition-colors">
                {new Date(ex.date).getDate()}
                <span className="text-[9px] uppercase block -mt-1">{new Date(ex.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div>
                <div className="font-bold text-stone-900 text-lg group-hover:text-red-700 transition-colors">{ex.description}</div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-medium">{ex.party}</span>
                  <span>•</span>
                  <span>{ex.paymentMethod || 'Cash'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-stone-900 text-lg">{ex.amount.toLocaleString()} <span className="text-xs text-stone-400 font-normal">LKR</span></div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{ex.status}</div>
            </div>
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={selectedExpense?.description || 'Expense'}
        subtitle={`Paid to ${selectedExpense?.party}`}
        data={selectedExpense || {}}
        status={selectedExpense?.status}
        statusColor={selectedExpense?.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
        icon={<Wallet size={32} />}
      />
    </div>
  );
};

// --- TEMPLATE 7: PAYMENT TRACKING ---
export const PaymentTrackingTemplate: React.FC<Props> = ({ tabId, isReadOnly }) => {
  const transactions = useMemo(() => generateMockTransactions(15, 'Receivable'), []);
  const outstanding = transactions.reduce((sum, t) => sum + t.amount, 0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">{tabId}</h2>
          <div className="text-stone-500 text-sm mt-1 flex items-center gap-4">
             <span>Contact: +94 77 123 4567</span>
             <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
             <span>Customer Since: 2024</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right px-6 py-2 bg-stone-50 rounded-xl border border-stone-100">
             <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Due</div>
             <div className="text-2xl font-bold text-stone-900">{outstanding.toLocaleString()} <span className="text-sm font-normal text-stone-400">LKR</span></div>
          </div>
          <div className="text-right px-6 py-2 bg-red-50 rounded-xl border border-red-100">
             <div className="text-xs font-bold text-red-400 uppercase tracking-widest">Overdue</div>
             <div className="text-2xl font-bold text-red-600">71,000 <span className="text-sm font-normal text-red-400">LKR</span></div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {transactions.map(t => (
           <div 
             key={t.id} 
             onClick={() => setSelectedTx(t)}
             className={`p-5 rounded-xl border-l-4 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all ${t.status === 'Overdue' ? 'border-l-red-500 hover:border-red-200' : 'border-l-gem-gold hover:border-amber-200'}`}
           >
             <div className="flex justify-between items-start mb-3">
               <div className="font-mono text-xs text-stone-400">{t.id}</div>
               {t.status === 'Overdue' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded">Overdue</span>}
             </div>
             <h3 className="font-bold text-lg text-stone-900 mb-1">{t.description}</h3>
             <div className="text-stone-500 text-sm mb-4">Due: {t.date}</div>
             
             <div className="flex justify-between items-end pt-4 border-t border-stone-100">
               <div>
                 <div className="text-[10px] uppercase text-stone-400 font-bold">Amount</div>
                 <div className="font-bold text-xl text-stone-800">{t.amount.toLocaleString()}</div>
               </div>
               {!isReadOnly && <button className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-gem-purple transition-colors" onClick={(e) => e.stopPropagation()}>Mark Paid</button>}
             </div>
           </div>
         ))}
      </div>

      <DetailModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.description || 'Transaction'}
        subtitle={`Party: ${selectedTx?.party}`}
        data={selectedTx || {}}
        status={selectedTx?.status}
        statusColor={selectedTx?.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
        icon={<TrendingUp size={32} />}
      />
    </div>
  );
};

// --- TEMPLATE 9: STATEMENT/REPORT ---
export const StatementReportTemplate: React.FC<Props> = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen shadow-lg my-8 rounded-none md:rounded-xl">
      <div className="text-center border-b border-stone-200 pb-8 mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">VISION GEMS</h1>
        <p className="text-stone-500 uppercase tracking-widest text-sm">Financial Statement</p>
        <p className="text-stone-400 text-xs mt-4">Period: November 2025</p>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
           <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 pb-2 border-b border-stone-100">Income Summary</h3>
           <div className="space-y-3">
             <div className="flex justify-between">
               <span className="text-stone-600">Sales Revenue</span>
               <span className="font-medium">2,200,000</span>
             </div>
             <div className="flex justify-between">
               <span className="text-stone-600">Export Income</span>
               <span className="font-medium">200,000</span>
             </div>
             <div className="flex justify-between pt-2 border-t border-stone-100 font-bold">
               <span>Total Income</span>
               <span className="text-emerald-600">2,400,000</span>
             </div>
           </div>
        </div>
        <div>
           <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 pb-2 border-b border-stone-100">Expense Summary</h3>
           <div className="space-y-3">
             <div className="flex justify-between">
               <span className="text-stone-600">Purchasing</span>
               <span className="font-medium">800,000</span>
             </div>
             <div className="flex justify-between">
               <span className="text-stone-600">Operations</span>
               <span className="font-medium">400,000</span>
             </div>
             <div className="flex justify-between pt-2 border-t border-stone-100 font-bold">
               <span>Total Expenses</span>
               <span className="text-red-600">1,200,000</span>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-stone-50 p-6 rounded-xl text-center mb-8 border border-stone-200">
        <div className="text-sm font-bold text-stone-500 uppercase mb-2">Net Profit</div>
        <div className="text-4xl font-bold text-stone-900">1,200,000 <span className="text-lg font-normal text-stone-400">LKR</span></div>
      </div>

      <div className="flex justify-center gap-4 print:hidden">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800">
           <Download size={16} /> Download PDF
        </button>
      </div>
    </div>
  );
};
