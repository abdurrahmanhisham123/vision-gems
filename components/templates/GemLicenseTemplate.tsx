
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, Shield, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Building2, Globe, Clock,
  CheckCircle, AlertTriangle, ShieldCheck,
  ChevronRight, Download, Filter, Printer
} from 'lucide-react';
import { DetailModal } from '../DetailModal';

// --- Types ---
interface LicenseEntry {
  id: string;
  company: string;
  authority: string;
  licenseNo: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  amount: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

// --- Mock Data ---
const MOCK_LICENSES: LicenseEntry[] = [
  { 
    id: 'lic-1', 
    company: 'Vision Gems', 
    authority: 'National Gem & Jewellery Authority', 
    licenseNo: 'LIC/2024/001', 
    description: 'Annual Gem Dealer License Renewal', 
    issueDate: '2024-05-10', 
    expiryDate: '2025-05-10', 
    amount: 150000,
    status: 'Active'
  },
  { 
    id: 'lic-2', 
    company: 'Spinel Gallery', 
    authority: 'NGJA', 
    licenseNo: 'MP/SRL/882', 
    description: 'Mining Site Permit - Ratnapura Sector B', 
    issueDate: '2024-06-15', 
    expiryDate: '2024-12-15', 
    amount: 45000,
    status: 'Expiring Soon'
  },
  { 
    id: 'lic-3', 
    company: 'Vision Gems', 
    authority: 'Sri Lanka Customs', 
    licenseNo: 'EXP-AUTH-22', 
    description: 'Quarterly Export Facilitation Fee', 
    issueDate: '2024-01-20', 
    expiryDate: '2024-04-20', 
    amount: 10630,
    status: 'Expired'
  }
];

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const GemLicenseTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const [licenses, setLicenses] = useState<LicenseEntry[]>(MOCK_LICENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Selection/Edit State
  const [selectedLicense, setSelectedLicense] = useState<LicenseEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LicenseEntry | null>(null);

  // --- Statistics ---
  const stats = useMemo(() => {
    const total = licenses.reduce((sum, l) => sum + l.amount, 0);
    const active = licenses.filter(l => l.status === 'Active').length;
    const warning = licenses.filter(l => l.status === 'Expiring Soon').length;
    return { total, active, warning, count: licenses.length };
  }, [licenses]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    return licenses.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        l.company.toLowerCase().includes(q) ||
        l.authority.toLowerCase().includes(q) ||
        l.licenseNo.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      
      const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchQuery, filterStatus]);

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Delete this license record?')) {
      setLicenses(prev => prev.filter(l => l.id !== id));
      if (selectedLicense?.id === id) setSelectedLicense(null);
    }
  };

  const handleSave = (item: LicenseEntry) => {
    if (editingItem) {
      setLicenses(prev => prev.map(l => l.id === item.id ? item : l));
    } else {
      setLicenses(prev => [item, ...prev]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Expiring Soon': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Expired': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <ShieldCheck size={16} className="text-emerald-500" />;
      case 'Expiring Soon': return <Clock size={16} className="text-amber-500" />;
      case 'Expired': return <AlertTriangle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-stone-50/30">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              Finance <span className="text-stone-300">/</span> Compliance
           </div>
           <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-2">Gem License Manager</h2>
           <p className="text-stone-500">Track company licenses, permits, and regulatory fees.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Shield size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Active</div>
                 <div className="text-xl font-bold text-stone-800">{stats.active}</div>
              </div>
           </div>
           <div className="flex-1 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <DollarSign size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Fees</div>
                 <div className="text-xl font-bold text-stone-800">LKR {stats.total.toLocaleString()}</div>
              </div>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm mb-10 flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
               type="text" 
               placeholder="Search by license number, authority, or company..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-stone-800 placeholder-stone-400"
            />
         </div>
         
         <div className="flex gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl shadow-sm shrink-0">
               <Filter size={16} className="text-stone-400" />
               <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-sm font-bold text-stone-600 outline-none cursor-pointer"
               >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
               </select>
            </div>
            
            <button className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-500 hover:text-stone-800 shadow-sm transition-all shrink-0">
               <Download size={18} />
            </button>

            {!isReadOnly && (
               <button 
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-all active:scale-95 shrink-0"
               >
                  <Plus size={18} /> New License
               </button>
            )}
         </div>
      </div>

      {/* Grid of Licenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredData.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedLicense(item)}
               className="group bg-white rounded-[32px] border border-stone-200 p-1 shadow-sm hover:shadow-2xl hover:border-purple-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
               <div className="p-6">
                  {/* Status & Date Row */}
                  <div className="flex justify-between items-center mb-6">
                     <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                        {getStatusIcon(item.status)} {item.status}
                     </span>
                     <div className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                        <Calendar size={12} /> {item.expiryDate}
                     </div>
                  </div>

                  {/* Main Title Area */}
                  <div className="mb-6">
                     <h3 className="text-xl font-bold text-stone-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-1">
                        {item.authority}
                     </h3>
                     <p className="text-xs text-stone-500 font-medium line-clamp-2 min-h-[32px]">
                        {item.description}
                     </p>
                  </div>

                  {/* License Meta Card */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex justify-between items-center mb-6 group-hover:bg-purple-50 group-hover:border-purple-100 transition-all duration-300">
                     <div>
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">License Number</div>
                        <div className="font-mono font-bold text-stone-700 text-sm">{item.licenseNo}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Company</div>
                        <div className="font-bold text-stone-800 text-sm">{item.company}</div>
                     </div>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="flex justify-between items-end pt-2 border-t border-stone-50">
                     <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Amount Paid</div>
                        <div className="text-2xl font-bold text-stone-900">
                           LKR {item.amount.toLocaleString()}
                        </div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110">
                        <ChevronRight size={20} />
                     </div>
                  </div>
               </div>
            </div>
         ))}

         {filteredData.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
               <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6 text-stone-300">
                  <Shield size={48} />
               </div>
               <h3 className="text-xl font-bold text-stone-800">No matching licenses found</h3>
               <p className="text-stone-500 mt-2 max-w-sm">Adjust your filters or add a new license record to keep your compliance up to date.</p>
               <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="mt-8 text-purple-600 font-bold hover:underline">Add First License</button>
            </div>
         )}
      </div>

      {/* Side Detail Modal */}
      {selectedLicense && (
         <DetailModal 
            isOpen={!!selectedLicense}
            onClose={() => setSelectedLicense(null)}
            title={selectedLicense.authority}
            subtitle={selectedLicense.description}
            status={selectedLicense.status}
            statusColor={getStatusStyle(selectedLicense.status)}
            icon={<ShieldCheck size={32} className="text-purple-600" />}
            onEdit={!isReadOnly ? () => { setEditingItem(selectedLicense); setIsFormOpen(true); setSelectedLicense(null); } : undefined}
            data={{
               'Company': selectedLicense.company,
               'License No': selectedLicense.licenseNo,
               'Issue Date': selectedLicense.issueDate,
               'Expiry Date': selectedLicense.expiryDate,
               'Amount Paid': `LKR ${selectedLicense.amount.toLocaleString()}`,
               'Authority': selectedLicense.authority,
               'Description': selectedLicense.description
            }}
            customContent={
               <div className="mt-6 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
                     <Clock size={16} className="text-stone-400" /> Reminder Logic
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                     Automated alerts will be sent 30 days before the expiry date ({selectedLicense.expiryDate}). 
                     Please ensure documentation for renewal is prepared 2 weeks in advance.
                  </p>
               </div>
            }
         />
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                  <div>
                     <h3 className="text-2xl font-bold text-stone-900">{editingItem ? 'Edit License' : 'New Compliance Entry'}</h3>
                     <p className="text-stone-500 text-sm mt-1">Enter regulatory or license details.</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={24}/></button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newItem: LicenseEntry = {
                     id: editingItem?.id || `lic-${Date.now()}`,
                     company: formData.get('company') as string,
                     authority: formData.get('authority') as string,
                     licenseNo: formData.get('licenseNo') as string,
                     description: formData.get('description') as string,
                     issueDate: formData.get('issueDate') as string,
                     expiryDate: formData.get('expiryDate') as string,
                     amount: Number(formData.get('amount')),
                     status: 'Active' // Simple logic: would be calc based on date in real app
                  };
                  handleSave(newItem);
               }}>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Issuing Authority</label>
                        <input name="authority" type="text" defaultValue={editingItem?.authority} required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" placeholder="e.g. NGJA" />
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Company</label>
                        <select name="company" defaultValue={editingItem?.company || 'Vision Gems'} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none">
                           <option>Vision Gems</option>
                           <option>Spinel Gallery</option>
                           <option>Kenya Branch</option>
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">License No.</label>
                           <input name="licenseNo" type="text" defaultValue={editingItem?.licenseNo} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-mono" placeholder="REF/..." />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Amount (LKR)</label>
                           <input name="amount" type="number" defaultValue={editingItem?.amount} required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold" placeholder="0" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Issue Date</label>
                           <input name="issueDate" type="date" defaultValue={editingItem?.issueDate} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Expiry Date</label>
                           <input name="expiryDate" type="date" defaultValue={editingItem?.expiryDate} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                        <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm resize-none" placeholder="Purpose of the license..." />
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-10">
                     <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-colors">Cancel</button>
                     <button type="submit" className="px-10 py-4 bg-stone-900 text-white font-bold rounded-2xl shadow-xl hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-2">
                        <Save size={20} /> {editingItem ? 'Update' : 'Register'} License
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};
