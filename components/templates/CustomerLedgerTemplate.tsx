
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Filter, Calendar, 
  Trash2, Edit, Save, X, DollarSign, Wallet, Users, 
  TrendingUp, TrendingDown, ArrowRight, BarChart2,
  CheckCircle, AlertCircle, Clock, Building2, User, Mail, Send
} from 'lucide-react';
import { CustomerLedgerConfig } from '../../utils/customerLedgerConfig';
import { getCustomerTransactions, CustomerTransaction } from '../../services/dataService';
import { DetailModal } from '../DetailModal';

interface Props {
  config: CustomerLedgerConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Status Badge ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Outstanding: 'bg-amber-100 text-amber-800 border-amber-200',
    Partial: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  const labels = {
    Paid: 'Paid',
    Outstanding: 'Due',
    Partial: 'Partial'
  };
  const icons = {
    Paid: <CheckCircle size={12} className="mr-1" />,
    Outstanding: <AlertCircle size={12} className="mr-1" />,
    Partial: <Clock size={12} className="mr-1" />
  };

  const s = status as keyof typeof styles;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${styles[s] || styles.Outstanding}`}>
      {icons[s]} {labels[s] || status}
    </span>
  );
};

// --- Summary Card ---
const CustomerSummary: React.FC<{ transactions: CustomerTransaction[], config: CustomerLedgerConfig }> = ({ transactions, config }) => {
  const stats = useMemo(() => {
    // Start with config totals if available, otherwise calc from mock data
    let totalSold = config.totalSold || 0;
    let totalPaid = 0;
    let totalOutstanding = config.totalOutstanding || 0;
    
    // In mock mode, we might want to sum up transactions to be consistent with the rows shown
    // but the prompt implies specific hardcoded totals in config.
    // Let's use config totals as primary source of truth for the header card.
    
    // If not provided in config (e.g. dynamic tabs), calculate from transactions
    if (!config.totalSold && transactions.length > 0) {
       totalSold = transactions.reduce((sum, t) => sum + t.amount, 0);
       totalPaid = transactions
         .filter(t => t.paymentStatus === 'Paid' || t.paymentStatus === 'Partial')
         .reduce((sum, t) => sum + (t.paidAmount || (t.paymentStatus === 'Paid' ? t.amount : 0)), 0);
       totalOutstanding = totalSold - totalPaid;
    } else if (config.totalSold) {
       // If totalSold is provided, assume totalOutstanding is also provided or can be derived
       // If totalOutstanding not provided, assume 0 or calc
       if (config.totalOutstanding === undefined) totalOutstanding = 0;
       totalPaid = totalSold - totalOutstanding;
    }

    // Type A specific (Total Received)
    if (config.ledgerType === 'company_summary') {
       totalPaid = config.totalReceived || 0;
       totalSold = totalPaid; // In receipt view, sold matches received roughly for summary context
       totalOutstanding = 0;
    }

    return { totalSold, totalPaid, totalOutstanding, count: transactions.length };
  }, [transactions, config]);

  return (
    <div className="bg-gradient-to-br from-white to-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 border-l-4 relative overflow-hidden" style={{borderLeftColor: config.themeColor}}>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                 {config.ledgerType === 'company_summary' ? 'COMPANY SUMMARY' : 'CUSTOMER LEDGER'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-500 uppercase">
                 {config.companyCode || config.customerName || 'General'}
              </span>
           </div>
           
           <h3 className="text-3xl font-bold text-stone-800 mb-1">
              {config.ledgerType === 'company_summary' ? config.companyName : config.customerName}
           </h3>
           
           <div className="text-sm font-medium text-stone-500 mt-2">
              {config.ledgerType === 'company_summary' 
                ? `${config.totalTransactions || stats.count} Transactions • ${config.uniqueCustomers || 'Multiple'} Customers`
                : `${stats.count} Transactions`
              }
           </div>
        </div>

        <div className="flex gap-8 md:text-right">
           <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                 {config.ledgerType === 'company_summary' ? 'Total Received' : 'Total Sold'}
              </div>
              <div className="text-2xl font-bold text-stone-900 font-mono">
                 LKR {(config.ledgerType === 'company_summary' ? stats.totalPaid : stats.totalSold).toLocaleString()}
              </div>
           </div>
           
           {config.ledgerType === 'individual_customer' && (
             <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Outstanding</div>
                <div className={`text-2xl font-bold font-mono ${stats.totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                   LKR {stats.totalOutstanding.toLocaleString()}
                   {stats.totalOutstanding > 0 && <span className="text-lg ml-1">⚠️</span>}
                   {stats.totalOutstanding === 0 && <span className="text-lg ml-1">✅</span>}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- Mark Payment Modal ---
const PaymentModal: React.FC<{ 
  transaction: CustomerTransaction, 
  onClose: () => void,
  onSave: (id: string, amount: number, method: string) => void 
}> = ({ transaction, onClose, onSave }) => {
  const [amount, setAmount] = useState(transaction.amount - (transaction.paidAmount || 0));
  const [method, setMethod] = useState('Bank Transfer');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
       <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-stone-800">Mark Payment</h3>
             <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
          </div>
          
          <div className="bg-stone-50 p-4 rounded-xl mb-6 text-sm">
             <div className="flex justify-between mb-2">
                <span className="text-stone-500">Stone Code:</span>
                <span className="font-bold text-stone-800">{transaction.code}</span>
             </div>
             <div className="flex justify-between mb-2">
                <span className="text-stone-500">Total Amount:</span>
                <span className="font-bold text-stone-800">{transaction.amount.toLocaleString()}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-stone-500">Outstanding:</span>
                <span className="font-bold text-amber-600">{(transaction.amount - (transaction.paidAmount || 0)).toLocaleString()}</span>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Payment Amount</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full p-3 border border-stone-200 rounded-xl font-bold text-lg"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Method</label>
                <select 
                  value={method} 
                  onChange={e => setMethod(e.target.value)}
                  className="w-full p-3 border border-stone-200 rounded-xl bg-white"
                >
                   <option>Cash</option>
                   <option>Bank Transfer</option>
                   <option>Cheque</option>
                </select>
             </div>
          </div>

          <div className="mt-8 flex gap-3">
             <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200">Cancel</button>
             <button onClick={() => onSave(transaction.id, amount, method)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20">
                Confirm Payment
             </button>
          </div>
       </div>
    </div>
  );
};

// --- Main Template ---
export const CustomerLedgerTemplate: React.FC<Props> = ({ config, isReadOnly }) => {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Selection & Modals
  const [selectedTx, setSelectedTx] = useState<CustomerTransaction | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<CustomerTransaction | null>(null);

  useEffect(() => {
    setLoading(true);
    getCustomerTransactions(config).then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, [config]);

  // Filtering
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCompany = filterCompany === 'All' || t.company === filterCompany;
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Paid' && t.paymentStatus === 'Paid') ||
        (filterStatus === 'Outstanding' && (t.paymentStatus === 'Outstanding' || t.paymentStatus === 'Partial'));

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [transactions, searchQuery, filterCompany, filterStatus]);

  // Handlers
  const handleMarkPayment = (tx: CustomerTransaction) => {
    setPaymentTarget(tx);
    setIsPaymentModalOpen(true);
  };

  const savePayment = (id: string, amount: number, method: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const newPaid = (t.paidAmount || 0) + amount;
        return {
          ...t,
          paidAmount: newPaid,
          paymentStatus: newPaid >= t.amount ? 'Paid' : 'Partial'
        };
      }
      return t;
    }));
    setIsPaymentModalOpen(false);
    setPaymentTarget(null);
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete record?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (selectedTx?.id === id) setSelectedTx(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-400">Loading ledger...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <CustomerSummary transactions={transactions} config={config} />

      {/* Breakdown Cards (Type B Multi-Company) */}
      {config.ledgerType === 'individual_customer' && config.breakdown && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {config.breakdown.map((item, i) => (
               <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-lg font-bold text-stone-800">LKR {item.amount.toLocaleString()}</div>
               </div>
            ))}
         </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by code, desc..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {/* Type A: No status filter needed usually as it's payment received log */}
            {config.ledgerType === 'individual_customer' && (
               <>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none cursor-pointer shadow-sm"
                  >
                     <option value="All">All Status</option>
                     <option value="Paid">Paid</option>
                     <option value="Outstanding">Outstanding</option>
                  </select>
                  {config.hasMultiCompany && (
                     <select 
                       value={filterCompany} 
                       onChange={(e) => setFilterCompany(e.target.value)}
                       className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none cursor-pointer shadow-sm"
                     >
                        <option value="All">All Companies</option>
                        <option value="VG">VG</option>
                        <option value="SG">SG</option>
                        <option value="K">K</option>
                        <option value="VG-T">VG-T</option>
                     </select>
                  )}
               </>
            )}
            
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
              <Download size={18} />
            </button>
            <button className="px-4 py-3 bg-stone-900 text-white rounded-xl shadow-lg hover:bg-stone-800 transition-colors">
              <Printer size={18} />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                     <th className="p-4 w-24">Date</th>
                     <th className="p-4 w-16">Co.</th>
                     <th className="p-4">Code</th>
                     <th className="p-4">Description</th>
                     {config.ledgerType === 'company_summary' && <th className="p-4">Customer</th>}
                     <th className="p-4 text-right">Weight</th>
                     <th className="p-4 text-right">Amount</th>
                     <th className="p-4 text-center">Status</th>
                     {!isReadOnly && <th className="p-4 w-24">Actions</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredData.map(t => (
                     <tr 
                        key={t.id} 
                        onClick={() => setSelectedTx(t)}
                        className="hover:bg-stone-50 transition-colors cursor-pointer"
                     >
                        <td className="p-4 font-mono text-stone-500 text-xs whitespace-nowrap">{t.date}</td>
                        <td className="p-4">
                           <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px] font-bold text-stone-600 border border-stone-200">
                              {t.company}
                           </span>
                        </td>
                        <td className="p-4 font-mono text-stone-600">{t.code}</td>
                        <td className="p-4 font-medium text-stone-800">{t.description}</td>
                        {config.ledgerType === 'company_summary' && <td className="p-4 text-stone-600">{t.name || '-'}</td>}
                        <td className="p-4 text-right font-mono text-stone-600">{t.weight.toFixed(2)}ct</td>
                        <td className="p-4 text-right font-bold text-stone-900">{t.amount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                           <StatusBadge status={t.paymentStatus} />
                        </td>
                        {!isReadOnly && (
                           <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                 {t.paymentStatus !== 'Paid' && (
                                    <button 
                                      onClick={() => handleMarkPayment(t)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Mark Paid"
                                    >
                                       <CheckCircle size={16} />
                                    </button>
                                 )}
                                 <button onClick={() => handleDelete(t.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detail Modal */}
      <DetailModal 
         isOpen={!!selectedTx}
         onClose={() => setSelectedTx(null)}
         title={selectedTx?.description || 'Transaction'}
         subtitle={`${selectedTx?.company} • ${selectedTx?.code}`}
         status={selectedTx?.paymentStatus}
         statusColor={selectedTx?.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
         icon={<Wallet size={32} className="text-emerald-600" />}
         data={selectedTx ? {
            'Date': selectedTx.date,
            'Company': selectedTx.company,
            'Code': selectedTx.code,
            ...(selectedTx.name ? {'Customer': selectedTx.name} : {}),
            'Weight': `${selectedTx.weight} ct`,
            'Amount': `LKR ${selectedTx.amount.toLocaleString()}`,
            'Paid': `LKR ${(selectedTx.paidAmount || (selectedTx.paymentStatus==='Paid' ? selectedTx.amount : 0)).toLocaleString()}`,
            'Balance': `LKR ${(selectedTx.amount - (selectedTx.paidAmount || (selectedTx.paymentStatus==='Paid' ? selectedTx.amount : 0))).toLocaleString()}`
         } : undefined}
      />

      {/* Payment Modal */}
      {isPaymentModalOpen && paymentTarget && (
         <PaymentModal 
            transaction={paymentTarget} 
            onClose={() => setIsPaymentModalOpen(false)}
            onSave={savePayment}
         />
      )}

    </div>
  );
};
