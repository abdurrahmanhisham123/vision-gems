import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, AlertCircle, CheckCircle, 
  Search, Filter, ArrowRight, User, DollarSign,
  Tag, Gem, Info, CheckSquare, MoreHorizontal,
  Wallet, TrendingUp, HandCoins, ExternalLink,
  RefreshCw, ChevronRight, X, AlertTriangle,
  ArrowUpRight, BarChart3,
  Printer, Activity, Users, Save, CreditCard
} from 'lucide-react';
import { getVisionGemsSpinelData, saveExportedStone } from '../../services/dataService';
import { ExtendedSpinelStone } from '../../types';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- PARTIAL PAYMENT MODAL COMPONENT ---
const RecordPaymentModal: React.FC<{
  deal: ExtendedSpinelStone;
  onClose: () => void;
  onSave: (updated: ExtendedSpinelStone) => void;
}> = ({ deal, onClose, onSave }) => {
  const balance = deal.finalPrice - (deal.transactionAmount || 0);
  const [payAmount, setPayAmount] = useState<number>(balance);
  const [nextDate, setNextDate] = useState<string>(deal.paymentDueDate);
  const [method, setMethod] = useState<string>(deal.salesPaymentMethod || 'Bank Transfer');

  const handleConfirm = () => {
    if (payAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const updatedStone: ExtendedSpinelStone = {
      ...deal,
      transactionAmount: (deal.transactionAmount || 0) + payAmount,
      paymentDueDate: nextDate, // Reschedule for the next payment to come
      salesPaymentMethod: method,
      salesPaymentStatus: ((deal.transactionAmount || 0) + payAmount) >= deal.finalPrice ? 'Paid' : 'Partial'
    };

    onSave(updatedStone);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
          <div>
            <h3 className="text-2xl font-bold text-stone-900">Process Payment</h3>
            <p className="text-stone-500 text-sm mt-1">Recording installment for {deal.codeNo}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={24}/></button>
        </div>

        <div className="space-y-6">
          {/* Summary of Deal */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-6">
             <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Total Deal</span>
                <div className="text-sm font-bold text-stone-800">LKR {deal.finalPrice.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Current Balance</span>
                <div className="text-sm font-bold text-red-600">LKR {balance.toLocaleString()}</div>
             </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Payment Amount (LKR)</label>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs</span>
               <input 
                  type="number" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full pl-12 p-4 bg-white border-2 border-emerald-100 rounded-2xl text-xl font-bold text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" 
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Next Payment Date</label>
              <input 
                type="date" 
                value={nextDate} 
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-gem-purple/20 focus:border-gem-purple transition-all" 
              />
              <p className="text-[10px] text-stone-400 mt-1.5 ml-1">Update if another payment is to come.</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-800 outline-none appearance-none cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-10">
          <button onClick={onClose} className="flex-1 py-4 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-colors">Cancel</button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-stone-900 text-white font-bold rounded-2xl shadow-xl hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} /> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN TEMPLATE ---

export const PaymentDueDateTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const [stones, setStones] = useState<ExtendedSpinelStone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Overdue' | 'Today' | 'Upcoming'>('All');
  const [paymentDeal, setPaymentDeal] = useState<ExtendedSpinelStone | null>(null);

  const fetchData = () => {
    setLoading(true);
    getVisionGemsSpinelData('payment due date').then(data => {
      // Show Sold items with outstanding balances
      setStones(data.filter(s => s.status === 'Sold' && s.finalPrice > (s.transactionAmount || 0)));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Logic ---
  const today = new Date().toISOString().split('T')[0];

  const filteredDeals = useMemo(() => {
    return stones.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        s.codeNo.toLowerCase().includes(q) || 
        s.buyer.toLowerCase().includes(q) || 
        s.outstandingName.toLowerCase().includes(q);
      
      const dueDate = s.paymentDueDate;
      if (activeFilter === 'Overdue') return matchesSearch && dueDate < today && dueDate !== '-';
      if (activeFilter === 'Today') return matchesSearch && dueDate === today;
      if (activeFilter === 'Upcoming') return matchesSearch && dueDate > today;
      
      return matchesSearch;
    }).sort((a,b) => (a.paymentDueDate || '').localeCompare(b.paymentDueDate || ''));
  }, [stones, searchQuery, activeFilter, today]);

  const metrics = useMemo(() => {
    const overdue = stones.filter(s => s.paymentDueDate < today && s.paymentDueDate !== '-');
    const dueToday = stones.filter(s => s.paymentDueDate === today);
    const totalOutstanding = stones.reduce((sum, s) => sum + (s.finalPrice - (s.transactionAmount || 0)), 0);
    
    return {
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, s) => sum + (s.finalPrice - (s.transactionAmount || 0)), 0),
      todayCount: dueToday.length,
      todayAmount: dueToday.reduce((sum, s) => sum + (s.finalPrice - (s.transactionAmount || 0)), 0),
      totalOutstanding
    };
  }, [stones, today]);

  const handleSavePayment = (updatedStone: ExtendedSpinelStone) => {
    saveExportedStone(updatedStone); // Save to local storage registry
    setPaymentDeal(null);
    fetchData(); // Refresh list
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p className="font-medium animate-pulse">Synchronizing Payment Schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-stone-50/50">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-gem-purple">
             Outstanding <span className="text-stone-300">/</span> Collection Center
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Payment Worklist</h2>
          <p className="text-stone-500 text-sm mt-1">Priority list of accounts requiring collection or follow-up.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-all shadow-sm">
             <Printer size={16} /> Print List
           </button>
        </div>
      </div>

      {/* Hero Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-premium border-l-4 border-red-500 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-red-500">
            <AlertTriangle size={80} />
          </div>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Overdue Collection</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">LKR {metrics.overdueAmount.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
             <AlertCircle size={14} /> {metrics.overdueCount} Critical Cases
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border-l-4 border-gem-gold relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-gem-gold">
            <Clock size={80} />
          </div>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Due Today</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">LKR {metrics.todayAmount.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gem-gold">
             <Activity size={14} /> {metrics.todayCount} Settlements Expected
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border-l-4 border-emerald-500 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-500">
            <Wallet size={80} />
          </div>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-stone-900 mb-1">LKR {metrics.totalOutstanding.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
             <Users size={14} /> Across {stones.length} Clients
          </div>
        </div>

        <div className="bg-gradient-to-br from-gem-purple to-gem-purple-dark p-6 rounded-2xl shadow-purple text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-white">
            <TrendingUp size={80} />
          </div>
          <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Collection Status</div>
          <div className="text-2xl font-bold mb-1">Active</div>
          <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
             <CheckCircle size={14} /> System Healthy
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="flex bg-stone-100 p-1 rounded-xl w-full xl:w-auto shrink-0">
            {[
              { id: 'All', label: 'All', color: 'text-stone-600' },
              { id: 'Overdue', label: 'Overdue', color: 'text-red-600' },
              { id: 'Today', label: 'Today', color: 'text-gem-gold' },
              { id: 'Upcoming', label: 'Upcoming', color: 'text-blue-600' }
            ].map(f => (
               <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`flex-1 lg:px-8 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                    ${activeFilter === f.id ? 'bg-white text-stone-900 shadow-sm' : `hover:text-stone-900 ${f.color}`}
                  `}
               >
                  {f.label}
               </button>
            ))}
         </div>

         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by buyer name or stone code..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gem-purple/10 focus:border-gem-purple transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
      </div>

      {/* Task-Based Action List */}
      <div className="space-y-4 mb-24">
         {filteredDeals.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-stone-200">
               <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-200">
                  <CheckSquare size={40} />
               </div>
               <h3 className="text-xl font-bold text-stone-800">No Pending Tasks</h3>
               <p className="text-stone-500 mt-2 max-w-sm mx-auto">Excellent! Your collection list is clear for this category.</p>
            </div>
         ) : filteredDeals.map(deal => {
            const balance = deal.finalPrice - (deal.transactionAmount || 0);
            const isOverdue = deal.paymentDueDate < today && deal.paymentDueDate !== '-';
            const isToday = deal.paymentDueDate === today;
            const progress = Math.round(((deal.transactionAmount || 0) / deal.finalPrice) * 100);

            return (
               <div key={deal.id} className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-card hover:shadow-premium hover:border-gem-purple/30 transition-all duration-300 relative overflow-hidden group">
                  {/* Left Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isOverdue ? 'bg-red-500' : isToday ? 'bg-gem-gold' : 'bg-blue-400'}`}></div>
                  
                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                     
                     {/* Client & Gem Identity */}
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${isOverdue ? 'bg-red-50 border-red-100 text-red-500' : 'bg-stone-50 border-stone-100 text-stone-400'}`}>
                           {isOverdue ? <AlertCircle size={32} /> : <Calendar size={32} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1.5">
                              <h3 className="text-xl font-bold text-stone-900 tracking-tight group-hover:text-gem-purple transition-colors">{deal.buyer || deal.outstandingName}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                isOverdue ? 'bg-red-50 text-red-700 border-red-100' : 
                                isToday ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                'bg-stone-50 text-stone-500 border-stone-200'
                              }`}>
                                 {isOverdue ? 'Overdue' : isToday ? 'Due Today' : 'Upcoming'}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="font-mono text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-500 tracking-tight">{deal.codeNo}</span>
                              <span className="text-stone-400 font-medium">{deal.variety}</span>
                           </div>
                        </div>
                     </div>

                     {/* Right Side Actions & Financials */}
                     <div className="flex flex-wrap items-end lg:items-center gap-8 lg:gap-16 w-full lg:w-auto">
                        
                        <div className="text-left lg:text-right flex-1 lg:flex-none">
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Next Payment</div>
                           <div className={`text-lg font-bold font-mono ${isOverdue ? 'text-red-600' : 'text-stone-800'}`}>{deal.paymentDueDate}</div>
                        </div>

                        <div className="text-left lg:text-right flex-1 lg:flex-none">
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Balance</div>
                           <div className="text-2xl font-bold text-stone-900 tracking-tight">LKR {fmt(balance)}</div>
                           <div className="text-[10px] font-medium text-stone-400">of LKR {fmt(deal.finalPrice)}</div>
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                           {!isReadOnly && (
                              <button 
                                onClick={() => setPaymentDeal(deal)}
                                className="flex-1 lg:flex-none px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                              >
                                 <HandCoins size={18} /> <span className="whitespace-nowrap">Record Payment</span>
                              </button>
                           )}
                           <button className="p-3 bg-stone-100 text-stone-400 hover:text-stone-800 rounded-2xl hover:bg-stone-200 transition-all">
                              <MoreHorizontal size={20} />
                           </button>
                        </div>

                     </div>
                  </div>
                  
                  {/* Progress Visualization Strip */}
                  <div className="mt-8 flex flex-col gap-2">
                     <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-1000 ${isOverdue ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-emerald-500'}`} 
                           style={{ width: `${progress}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        <span>Collection Progress</span>
                        <span className={progress >= 50 ? 'text-emerald-600' : 'text-stone-500'}>{progress}% Collected</span>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>

      {/* Record Payment Modal */}
      {paymentDeal && (
        <RecordPaymentModal 
          deal={paymentDeal} 
          onClose={() => setPaymentDeal(null)} 
          onSave={handleSavePayment} 
        />
      )}

    </div>
  );
};

const fmt = (val: number) => val.toLocaleString();
