
import React, { useState } from 'react';
import { 
  Search, Plus, Filter, Calendar, Trash2, Edit, X, 
  CreditCard, Plane, DollarSign, ChevronDown, ChevronRight, 
  BarChart2, FileText, ArrowUpRight, TrendingUp, Wallet, Building2,
  Save, CheckCircle, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// --- Interfaces ---

interface PaymentEntry {
  id: string;
  date: string;
  name: string;
  company?: string;
  description: string;
  amount: number;
  bank: string;
  payableAmount?: number;
}

interface StatementEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  airline: string;
  amount: number;
}

interface OtherTicketEntry {
  id: string;
  company: string;
  date: string;
  code: string;
  name: string;
  description: string;
  airline: string;
  amount: number;
}

interface YearSummaryEntry {
  id: string;
  date2024: string;
  amount2024: number;
  date2025: string;
  amount2025: number;
}

// --- Mock Data ---

const INITIAL_PAYMENTS: PaymentEntry[] = [
  { id: 'pay-1', date: '2024-03-18', name: 'Rikas', company: 'Classic Travel', description: 'Classic travel payment', amount: 500000, bank: 'Zah Bank' },
  { id: 'pay-2', date: '2024-03-21', name: 'Rikas', company: 'Classic Travel', description: 'Classic travel settlement', amount: 500000, bank: 'Zah Bank' },
  { id: 'pay-3', date: '2024-05-30', name: 'Rikas', company: 'Classic Travel', description: 'Advance for tickets', amount: 500000, bank: 'Zah Bank' },
  { id: 'pay-4', date: '2024-08-06', name: 'Rikas', company: 'Classic Travel', description: 'Group booking deposit', amount: 1000000, bank: 'Zah Bank' },
];

const INITIAL_STATEMENT: StatementEntry[] = [
  { id: 'stmt-1', company: 'Classictravel', date: '2024-02-21', code: 'Ticket - BKK', name: 'Zahran', description: 'CMB-BKK-CMB', airline: 'Srilankan', amount: 216000 },
  { id: 'stmt-2', company: 'Classictravel', date: '2025-02-21', code: 'Ticket - BKK', name: 'Ihfas', description: 'CMB-BKK-CMB', airline: 'Srilankan', amount: 216000 },
  { id: 'stmt-3', company: 'Classictravel', date: '2024-02-03', code: 'Date Change', name: 'Fawaz', description: 'DAR-DXB-CMB', airline: 'Emirates', amount: 36500 },
];

const INITIAL_OTHERS: OtherTicketEntry[] = [
  { id: 'oth-1', company: 'Classictravel', date: '2025-02-21', code: 'Ticket - BKK', name: 'Ihfas', description: 'CMB-BKK-CMB', airline: 'Srilankan', amount: 216000 },
  { id: 'oth-2', company: 'Classictravel', date: '2024-05-30', code: 'Ticket - China', name: 'Sajidh', description: 'CMB-PVG-SZX', airline: 'China Eastern', amount: 115000 },
  { id: 'oth-3', company: 'Classictravel', date: '2024-02-03', code: 'Date Change', name: 'Fawaz', description: 'DAR-DXB-CMB', airline: 'Emirates', amount: 36500 },
];

const YEAR_SUMMARY: YearSummaryEntry[] = [
  { id: 'sum-3', date2024: '2024-03-01', amount2024: 500000, date2025: '2025-03-01', amount2025: 0 },
  { id: 'sum-4', date2024: '2024-04-01', amount2024: 500000, date2025: '2025-04-01', amount2025: 0 },
  { id: 'sum-5', date2024: '2024-05-01', amount2024: 500000, date2025: '2025-05-01', amount2025: 0 },
  { id: 'sum-6', date2024: '2024-06-01', amount2024: 1000000, date2025: '2025-06-01', amount2025: 0 },
];

// --- Helpers ---

const formatCurrency = (val: number) => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Components ---

const StatCard: React.FC<{ title: string, amount: number, icon: React.ReactNode, color: string }> = ({ title, amount, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-full min-w-[240px] snap-start relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500`} style={{ color }}>
      {/* Fixed Error: Cast icon to React.ReactElement<any> to avoid prop validation issues on size */}
      {React.cloneElement(icon as React.ReactElement<any>, { size: 48 })}
    </div>
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">{title}</div>
        <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">LKR {formatCurrency(amount)}</div>
      </div>
      <div className={`p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
    </div>
    
    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden relative z-10">
      <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: color }}></div>
    </div>
  </div>
);

const PaymentCard: React.FC<{ 
  item: PaymentEntry, 
  expanded: boolean, 
  onToggle: () => void,
  onEdit: () => void,
  onDelete: () => void
}> = ({ item, expanded, onToggle, onEdit, onDelete }) => (
  <div 
    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-stone-200 shadow-sm hover:border-indigo-100'}`}
  >
    <div onClick={onToggle} className="p-4 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm">{item.name}</div>
            <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <Calendar size={10} /> {formatDate(item.date)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-stone-900 font-mono">LKR {formatCurrency(item.amount)}</div>
          <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${item.bank ? 'text-indigo-500' : 'text-stone-400'}`}>
            {item.bank || 'Cash'}
          </div>
        </div>
      </div>
    </div>
    
    {expanded && (
      <div className="px-4 pb-4 pt-0">
        <div className="pt-3 mt-1 border-t border-stone-100 grid grid-cols-2 gap-4 text-sm bg-stone-50/50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <div>
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1"><Building2 size={10} /> Company</span>
             <div className="text-stone-800 font-bold">{item.company || 'N/A'}</div>
          </div>
          <div>
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Payable</span>
             <div className="text-stone-700 font-medium">{item.payableAmount ? `LKR ${formatCurrency(item.payableAmount)}` : '-'}</div>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Description</span>
            <div className="text-stone-700 font-medium">{item.description}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-500 flex items-center gap-1.5 transition-colors">
            <Edit size={14} /> Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    )}
  </div>
);

const TicketCard: React.FC<{ 
  item: StatementEntry | OtherTicketEntry, 
  expanded: boolean, 
  onToggle: () => void,
  onEdit: () => void,
  onDelete: () => void
}> = ({ item, expanded, onToggle, onEdit, onDelete }) => (
  <div 
    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-purple-200 shadow-md ring-1 ring-purple-100' : 'border-stone-200 shadow-sm hover:border-purple-100'}`}
  >
    <div onClick={onToggle} className="p-4 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Plane size={20} />
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm">{item.description}</div>
            <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-purple-600">{item.airline}</span> • {formatDate(item.date)}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.code.includes('Ticket') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
          {item.code.includes('Ticket') ? 'Ticket' : 'Change'}
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500">
              {item.name.charAt(0)}
           </div>
           <span className="text-xs font-medium text-stone-600">{item.name}</span>
        </div>
        <div className="font-bold text-stone-900 font-mono">LKR {formatCurrency(item.amount)}</div>
      </div>
    </div>

    {expanded && (
      <div className="px-4 pb-4 pt-0">
        <div className="pt-3 mt-1 border-t border-stone-100 grid grid-cols-2 gap-4 text-sm bg-stone-50/50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-200 mb-3">
          <div>
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1"><Building2 size={10} /> Company</span>
             <div className="text-stone-800 font-bold">{item.company || 'N/A'}</div>
          </div>
          <div>
             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Code</span>
             <div className="text-stone-700 font-medium">{item.code}</div>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Route / Description</span>
            <div className="text-stone-700 font-medium">{item.description}</div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-500 flex items-center gap-1.5 transition-colors">
            <Edit size={14} /> Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    )}
  </div>
);

// --- Form Modal Component ---

const ClassicTravelForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  type: 'payment' | 'statement' | 'others';
}> = ({ isOpen, onClose, onSave, initialData, type }) => {
  const [formData, setFormData] = useState<any>(initialData || {
    date: new Date().toISOString().split('T')[0],
    name: '',
    company: 'Classic Travel',
    description: '',
    amount: 0,
    // Payment specific
    bank: 'Zah Bank',
    payableAmount: 0,
    // Statement/Ticket specific
    code: 'Ticket',
    airline: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.amount) {
      alert('Please fill in required fields');
      return;
    }
    
    // Ensure ID exists
    const entry = {
      ...formData,
      id: initialData?.id || `${type}-${Date.now()}`
    };
    
    onSave(entry);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
          <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Entry' : 'New Entry'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                placeholder="Person Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Company</label>
            <input 
              type="text" 
              value={formData.company} 
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
            />
          </div>

          {/* Conditional Fields */}
          {type === 'payment' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                  placeholder="Payment description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Bank / Method</label>
                  <select 
                    value={formData.bank} 
                    onChange={e => setFormData({...formData, bank: e.target.value})}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Zah Bank">Zah Bank</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Payable Amount</label>
                  <input 
                    type="number" 
                    value={formData.payableAmount || ''} 
                    onChange={e => setFormData({...formData, payableAmount: Number(e.target.value)})}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Code</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                    placeholder="Ticket / Change"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Airline</label>
                  <input 
                    type="text" 
                    value={formData.airline} 
                    onChange={e => setFormData({...formData, airline: e.target.value})}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                    placeholder="e.g. Emirates"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Route / Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm"
                  placeholder="e.g. CMB-DXB-LHR"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Amount (LKR)</label>
            <input 
              type="number" 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full p-3 bg-white border-2 border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Save size={18} /> Save Entry
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Main Template ---

export const ClassicTravelTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'statement' | 'others' | 'year'>('payments');
  
  // Data State
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [statements, setStatements] = useState(INITIAL_STATEMENT);
  const [others, setOthers] = useState(INITIAL_OTHERS);
  const [yearData] = useState(YEAR_SUMMARY);
  
  // UI State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Totals Calculation (Dynamic)
  const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
  const totalStatement = statements.reduce((sum, item) => sum + item.amount, 0);
  const totalOthers = others.reduce((sum, item) => sum + item.amount, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // CRUD Handlers
  const handleSave = (item: any) => {
    if (activeTab === 'payments') {
      if (editingItem) {
        setPayments(prev => prev.map(p => p.id === item.id ? item : p));
      } else {
        setPayments(prev => [item, ...prev]);
      }
    } else if (activeTab === 'statement') {
      if (editingItem) {
        setStatements(prev => prev.map(s => s.id === item.id ? item : s));
      } else {
        setStatements(prev => [item, ...prev]);
      }
    } else if (activeTab === 'others') {
      if (editingItem) {
        setOthers(prev => prev.map(o => o.id === item.id ? item : o));
      } else {
        setOthers(prev => [item, ...prev]);
      }
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, type: 'payments' | 'statement' | 'others') => {
    if (confirm('Are you sure you want to delete this record?')) {
      if (type === 'payments') setPayments(prev => prev.filter(p => p.id !== id));
      else if (type === 'statement') setStatements(prev => prev.filter(s => s.id !== id));
      else if (type === 'others') setOthers(prev => prev.filter(o => o.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Filtering
  const filteredPayments = payments.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStatement = statements.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOthers = others.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.description.toLowerCase().includes(searchQuery.toLowerCase()));

  const chartData = yearData.map(d => ({
    month: new Date(d.date2024).toLocaleString('default', { month: 'short' }),
    '2024': d.amount2024,
    '2025': d.amount2025
  }));

  return (
    <div className="bg-stone-50/30 min-h-screen pb-24 md:pb-8 flex flex-col h-full">
      
      {/* Header Section */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-6 md:px-10 max-w-[1600px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-indigo-500">
                 All Expenses <span className="text-stone-300">/</span> Travel Agency
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
                Classic Travel
                <span className="hidden md:flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">Active</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
               </div>
               {activeTab !== 'year' && (
                 <button 
                   onClick={openAddModal}
                   className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
                 >
                   <Plus size={18} /> <span className="hidden md:inline">Add Entry</span>
                 </button>
               )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex overflow-x-auto gap-4 pb-2 md:pb-0 md:grid md:grid-cols-3 hide-scrollbar snap-x">
             <StatCard title="Total Paid" amount={totalPaid} icon={<CreditCard />} color="#4F46E5" />
             <StatCard title="Statement Total" amount={totalStatement} icon={<FileText />} color="#9333EA" />
             <StatCard title="Others Ticket" amount={totalOthers} icon={<ArrowUpRight />} color="#F59E0B" />
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden border-t border-stone-100 px-4 overflow-x-auto hide-scrollbar gap-2 bg-stone-50/50 pt-2 pb-0">
           {[
             { id: 'payments', label: 'Payments', icon: CreditCard },
             { id: 'statement', label: 'Statement', icon: FileText },
             { id: 'others', label: 'Others', icon: DollarSign },
             { id: 'year', label: 'Analytics', icon: BarChart2 },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-t-lg border-b-2 transition-all min-w-[80px] ${
                 activeTab === tab.id 
                   ? 'border-indigo-600 text-indigo-600 bg-white' 
                   : 'border-transparent text-stone-400 hover:text-stone-600'
               }`}
             >
               <tab.icon size={18} /> 
               <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full flex-1">
        
        {/* Mobile View */}
        <div className="md:hidden">
           {activeTab === 'payments' && (
             <div className="space-y-3">
               {filteredPayments.map(item => (
                 <PaymentCard 
                   key={item.id} 
                   item={item} 
                   expanded={expandedId === item.id} 
                   onToggle={() => toggleExpand(item.id)} 
                   onEdit={() => openEditModal(item)}
                   onDelete={() => handleDelete(item.id, 'payments')}
                 />
               ))}
             </div>
           )}
           {activeTab === 'statement' && (
             <div className="space-y-3">
               {filteredStatement.map(item => (
                 <TicketCard 
                   key={item.id} 
                   item={item} 
                   expanded={expandedId === item.id} 
                   onToggle={() => toggleExpand(item.id)} 
                   onEdit={() => openEditModal(item)}
                   onDelete={() => handleDelete(item.id, 'statement')}
                 />
               ))}
             </div>
           )}
           {activeTab === 'others' && (
             <div className="space-y-3">
               {filteredOthers.map(item => (
                 <TicketCard 
                   key={item.id} 
                   item={item} 
                   expanded={expandedId === item.id} 
                   onToggle={() => toggleExpand(item.id)} 
                   onEdit={() => openEditModal(item)}
                   onDelete={() => handleDelete(item.id, 'others')}
                 />
               ))}
             </div>
           )}
           {activeTab === 'year' && (
             <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <BarChart2 size={16} className="text-indigo-500"/> Annual Comparison
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                        <XAxis dataKey="month" tick={{fontSize: 10, fill: '#A8A29E'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#A8A29E'}} axisLine={false} tickLine={false} width={30} tickFormatter={(val) => `${val/1000}k`} />
                        <Tooltip 
                          cursor={{fill: '#F5F5F4'}}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                        />
                        <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                        <Bar dataKey="2024" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="2025" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
                     </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
           )}
        </div>

        {/* Desktop View: 3-Column Layout */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Column 1: Payments */}
           <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                 <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
                    <Wallet size={16} className="text-indigo-600"/> Payment History
                 </h3>
                 <div className="flex items-center gap-2">
                    <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-stone-200 text-stone-500">{filteredPayments.length}</span>
                    <button onClick={() => { setActiveTab('payments'); openAddModal(); }} className="p-1.5 hover:bg-stone-200 rounded text-stone-500"><Plus size={14}/></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] p-4 space-y-3 custom-scrollbar">
                 {filteredPayments.map(item => (
                    <PaymentCard 
                      key={item.id} 
                      item={item} 
                      expanded={expandedId === item.id} 
                      onToggle={() => toggleExpand(item.id)} 
                      onEdit={() => { setActiveTab('payments'); openEditModal(item); }}
                      onDelete={() => handleDelete(item.id, 'payments')}
                    />
                 ))}
              </div>
           </div>

           {/* Column 2: Statement */}
           <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                 <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-purple-600"/> Statements
                 </h3>
                 <div className="flex items-center gap-2">
                    <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-stone-200 text-stone-500">{filteredStatement.length}</span>
                    <button onClick={() => { setActiveTab('statement'); openAddModal(); }} className="p-1.5 hover:bg-stone-200 rounded text-stone-500"><Plus size={14}/></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] p-4 space-y-3 custom-scrollbar">
                 {filteredStatement.map(item => (
                    <TicketCard 
                      key={item.id} 
                      item={item} 
                      expanded={expandedId === item.id} 
                      onToggle={() => toggleExpand(item.id)} 
                      onEdit={() => openEditModal(item)}
                      onDelete={() => handleDelete(item.id, 'statement')}
                    />
                 ))}
              </div>
           </div>

           {/* Column 3: Others & Year Summary */}
           <div className="flex flex-col gap-6">
              
              <div className="flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex-1 min-h-[300px]">
                 <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
                       <DollarSign size={16} className="text-emerald-600"/> Other Expenses
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-stone-200 text-stone-500">{filteredOthers.length}</span>
                       <button onClick={() => { setActiveTab('others'); openAddModal(); }} className="p-1.5 hover:bg-stone-200 rounded text-stone-500"><Plus size={14}/></button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">
                    {filteredOthers.map(item => (
                       <TicketCard 
                         key={item.id} 
                         item={item} 
                         expanded={expandedId === item.id} 
                         onToggle={() => toggleExpand(item.id)} 
                         onEdit={() => { setActiveTab('others'); openEditModal(item); }}
                         onDelete={() => handleDelete(item.id, 'others')}
                       />
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 h-72">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-stone-700 uppercase text-xs tracking-wider flex items-center gap-2">
                       <TrendingUp size={16} className="text-blue-500"/> Yearly Overview
                    </h3>
                 </div>
                 <div className="h-full pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData}>
                          <XAxis dataKey="month" tick={{fontSize: 11, fill: '#A8A29E'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 11, fill: '#A8A29E'}} hide />
                          <Tooltip 
                             cursor={{fill: '#F5F5F4'}} 
                             contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                          />
                          <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} iconType="circle" />
                          <Bar dataKey="2024" fill="#6366F1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="2025" fill="#10B981" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

           </div>
        </div>

      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
         <button onClick={openAddModal} className="w-14 h-14 bg-indigo-600 rounded-full text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all">
            <Plus size={28} />
         </button>
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <ClassicTravelForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSave} 
          initialData={editingItem}
          type={activeTab === 'payments' ? 'payment' : activeTab === 'statement' ? 'statement' : 'others'}
        />
      )}

    </div>
  );
};
