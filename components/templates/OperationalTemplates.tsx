
import React, { useMemo, useState, useEffect } from 'react';
import { generateJobs, generateTickets, getDetailedExportInvoices } from '../../services/dataService';
import { JobEntry, TicketEntry, DetailedExportInvoice, InvoiceItem, InvoiceDocument } from '../../types';
import { Clock, CheckCircle, AlertCircle, Plane, FileText, Package, Truck, MapPin, Loader2, Briefcase, DollarSign, Scale, Calculator, Upload, FileImage, ExternalLink, Calendar, Trash2, Edit, Save, X, Plus, Search, Eye, User, File, Printer, Filter, Download } from 'lucide-react';
import { DetailModal } from '../DetailModal';

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- TEMPLATE 5: PURCHASE / JOB ---
export const PurchaseJobTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const jobs = useMemo(() => generateJobs(12), []);
  const [selectedJob, setSelectedJob] = useState<JobEntry | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div 
            key={job.id} 
            onClick={() => setSelectedJob(job)}
            className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:border-stone-300"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${job.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded">{job.code}</span>
                <h3 className="font-bold text-stone-900 mt-2 text-lg group-hover:text-gem-purple transition-colors">{job.description}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${job.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {job.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {job.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-stone-600 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-400">Company:</span>
                <span className="font-medium">{job.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Worker:</span>
                <span className="font-medium">{job.worker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Due:</span>
                <span className="font-medium">{job.dueDate}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <div className="font-bold text-stone-900">{job.cost.toLocaleString()} <span className="text-xs font-normal text-stone-400">LKR</span></div>
              {!isReadOnly && <button className="text-stone-400 hover:text-gem-purple text-sm font-medium">View Details</button>}
            </div>
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.description || 'Job'}
        subtitle={`Assigned to ${selectedJob?.worker}`}
        data={selectedJob || {}}
        status={selectedJob?.status}
        statusColor={selectedJob?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
        icon={<Briefcase size={32} />}
      />
    </div>
  );
};

// --- COMPONENT: INVOICE FORM (For Add/Edit) ---
const InvoiceForm: React.FC<{ 
  initialData?: DetailedExportInvoice | null, 
  onSave: (invoice: DetailedExportInvoice) => void, 
  onCancel: () => void 
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DetailedExportInvoice>(initialData || {
    id: `new-${Date.now()}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
    status: 'Pending',
    createdDate: new Date().toISOString().split('T')[0],
    shipDate: '',
    destination: '',
    destinationFlag: '🏳️',
    exportCharges: 0,
    items: [{ sn: 1, description: '', lotOrPcs: '', weight: 0, pricePerPc: 0 }],
    documents: []
  });

  const updateField = (field: keyof DetailedExportInvoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { sn: prev.items.length + 1, description: '', lotOrPcs: '', weight: 0, pricePerPc: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sn: i + 1 }));
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // --- DOCUMENT HANDLING ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files) as File[];
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                // Determine type based on file extension/MIME
                let docType: 'invoice' | 'packing_list' | 'certificate' | 'other' = 'other';
                if (file.type.includes('pdf')) docType = 'invoice'; // Default to invoice for PDFs
                if (file.type.includes('image')) docType = 'certificate'; // Default to certificate for images

                const newDoc: InvoiceDocument = {
                    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: file.name,
                    url: result,
                    type: docType,
                    uploadedAt: new Date().toISOString()
                };
                setFormData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const calculateItemValue = (item: InvoiceItem) => {
    const lotOrPcs = Number(item.lotOrPcs);
    return !isNaN(lotOrPcs) && item.lotOrPcs !== '' 
      ? lotOrPcs * item.pricePerPc 
      : item.weight * item.pricePerPc;
  };

  const { totalWeight, totalValue } = formData.items.reduce((acc, item) => ({
    totalWeight: acc.totalWeight + Number(item.weight),
    totalValue: acc.totalValue + calculateItemValue(item)
  }), { totalWeight: 0, totalValue: 0 });

  return (
    <div className="fixed inset-0 z-[60] bg-stone-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-stone-50/95 backdrop-blur py-4 z-10 border-b border-stone-200">
           <div>
             <h2 className="text-2xl font-bold text-stone-900">{initialData ? 'Edit Invoice' : 'New Export Invoice'}</h2>
             <p className="text-stone-500 text-sm">Fill in the details below</p>
           </div>
           <div className="flex gap-3">
             <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-100">Cancel</button>
             <button onClick={() => onSave(formData)} className="px-6 py-2.5 rounded-xl bg-gem-purple text-white font-bold shadow-purple hover:bg-gem-purple-dark flex items-center gap-2">
               <Save size={18} /> Save Invoice
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Details</h3>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Invoice Number</label>
                <input type="text" value={formData.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} className="w-full p-2.5 rounded-lg border border-stone-200 bg-stone-50 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Destination</label>
                <input type="text" value={formData.destination} onChange={e => updateField('destination', e.target.value)} className="w-full p-2.5 rounded-lg border border-stone-200" placeholder="e.g. Bangkok" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">Date Created</label>
                    <input type="date" value={formData.createdDate} onChange={e => updateField('createdDate', e.target.value)} className="w-full p-2.5 rounded-lg border border-stone-200 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">Ship Date</label>
                    <input type="date" value={formData.shipDate} onChange={e => updateField('shipDate', e.target.value)} className="w-full p-2.5 rounded-lg border border-stone-200 text-sm" />
                </div>
              </div>
           </div>
           
           <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Items</h3>
                 <button onClick={addItem} className="text-xs flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-stone-700 font-medium transition-colors"><Plus size={14}/> Add Row</button>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                 <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-stone-400 text-xs font-bold uppercase text-left">
                        <th className="p-2 w-10">#</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 w-20">Lot/Pcs</th>
                        <th className="p-2 w-24">Weight</th>
                        <th className="p-2 w-24">Price</th>
                        <th className="p-2 w-24 text-right">Value</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-stone-50">
                          <td className="p-2 text-stone-400 font-mono text-xs">{idx + 1}</td>
                          <td className="p-2"><input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-gem-purple outline-none py-1" placeholder="Item name" /></td>
                          <td className="p-2"><input type="text" value={item.lotOrPcs} onChange={e => updateItem(idx, 'lotOrPcs', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-gem-purple outline-none py-1" placeholder="Lot" /></td>
                          <td className="p-2"><input type="number" value={item.weight} onChange={e => updateItem(idx, 'weight', Number(e.target.value))} className="w-full bg-transparent border-b border-transparent focus:border-gem-purple outline-none py-1" /></td>
                          <td className="p-2"><input type="number" value={item.pricePerPc} onChange={e => updateItem(idx, 'pricePerPc', Number(e.target.value))} className="w-full bg-transparent border-b border-transparent focus:border-gem-purple outline-none py-1" /></td>
                          <td className="p-2 text-right font-mono text-stone-600">${calculateItemValue(item).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="p-2 text-center">
                            <button onClick={() => removeItem(idx)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-end gap-8 pt-4 border-t border-stone-100 mt-4 text-sm">
                 <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Total Weight</div>
                    <div className="font-bold text-stone-800">{totalWeight.toFixed(2)} ct</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Total Value</div>
                    <div className="font-bold text-emerald-600 text-lg">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Documents Section in Editor */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Documents</h3>
             <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                <Upload size={14} /> Upload Files
                <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
          </div>

          {formData.documents.length === 0 ? (
             <div className="text-center py-8 border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50">
                <p className="text-stone-400 text-xs">No documents attached. Upload invoices, packing lists, or certificates.</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formData.documents.map((doc, idx) => (
                   <div key={idx} className="relative group border border-stone-200 bg-white rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                      <div className="w-full aspect-[4/3] bg-stone-50 rounded-lg border border-stone-100 mb-2 overflow-hidden flex items-center justify-center relative">
                         {(doc.type === 'certificate' || doc.url.startsWith('data:image') || doc.name.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                            <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                         ) : (
                            <FileText size={24} className="text-stone-300" />
                         )}
                         <a href={doc.url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <Eye size={16} />
                         </a>
                      </div>
                      <span className="text-[10px] font-medium text-stone-600 truncate w-full px-1">{doc.name}</span>
                      
                      <button onClick={() => removeDocument(idx)} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 border border-stone-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                         <X size={12} />
                      </button>
                   </div>
                ))}
             </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
           <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wider mb-4">Final Adjustments</h3>
           <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                 <label className="block text-xs font-semibold text-stone-500 mb-1">Export Charges (USD)</label>
                 <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="number" value={formData.exportCharges} onChange={e => updateField('exportCharges', Number(e.target.value))} className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-stone-200 text-sm" />
                 </div>
              </div>
              <div className="w-full md:w-1/3">
                 <label className="block text-xs font-semibold text-stone-500 mb-1">Tracking Number</label>
                 <div className="relative">
                    <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" value={formData.trackingNumber || ''} onChange={e => updateField('trackingNumber', e.target.value)} className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-stone-200 text-sm" placeholder="Optional" />
                 </div>
              </div>
              <div className="w-full md:w-1/3">
                 <label className="block text-xs font-semibold text-stone-500 mb-1">Status</label>
                 <select value={formData.status} onChange={e => updateField('status', e.target.value)} className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm rounded-lg border border-stone-200 bg-white outline-none transition-all appearance-none">
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                 </select>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- TEMPLATE 6: EXPORT / INVOICE (Redesigned with State & CRUD) ---
export const ExportInvoiceTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [invoices, setInvoices] = useState<DetailedExportInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<DetailedExportInvoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<DetailedExportInvoice | null>(null);

  // Initialize Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDetailedExportInvoices(tabId).then(data => {
      if (mounted) {
        setInvoices(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [tabId]);

  // CRUD Actions
  const handleSaveInvoice = (updatedInvoice: DetailedExportInvoice) => {
    setInvoices(prev => {
      const exists = prev.find(inv => inv.id === updatedInvoice.id);
      if (exists) {
        return prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
      } else {
        return [updatedInvoice, ...prev];
      }
    });
    setIsEditing(false);
    setEditingInvoice(null);
    if (selectedInvoice && selectedInvoice.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice); // Update detail view if open
    }
  };

  const handleDeleteInvoice = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    }
  };

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setIsEditing(true);
  };

  const handleEdit = (invoice: DetailedExportInvoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingInvoice(invoice);
    setIsEditing(true);
    // If editing from list, detail view might not be open. If from detail view, keep it open underneath or close it.
    // Let's close detail view to avoid confusion, or just rely on the modal overlay z-index.
    setSelectedInvoice(null); 
  };

  // Helper Calculations
  const calculateItemValue = (item: InvoiceItem) => {
    if (!isNaN(Number(item.lotOrPcs)) && item.lotOrPcs !== '') {
      return Number(item.lotOrPcs) * item.pricePerPc;
    } else {
      return item.weight * item.pricePerPc;
    }
  };

  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = items.reduce((sum, item) => sum + calculateItemValue(item), 0);
    return { totalWeight, totalValue };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-stone-50 text-stone-600';
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    let weight = 0;
    let pieces = 0;
    let value = 0;
    let active = 0;

    filteredInvoices.forEach(inv => {
      const { totalWeight, totalValue } = calculateInvoiceTotals(inv.items);
      weight += totalWeight;
      // Count pieces from lotOrPcs or default to 1 per item
      const invoicePieces = inv.items.reduce((sum, item) => {
        if (!isNaN(Number(item.lotOrPcs)) && item.lotOrPcs !== '') {
          return sum + Number(item.lotOrPcs);
        }
        return sum + 1;
      }, 0);
      pieces += invoicePieces;
      value += totalValue;
      if (inv.status !== 'Delivered' && inv.status !== 'Cancelled') active++;
    });

    return { weight, pieces, value, active };
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      {/* Editor Modal Overlay */}
      {isEditing && (
        <InvoiceForm 
          initialData={editingInvoice} 
          onSave={handleSaveInvoice} 
          onCancel={() => setIsEditing(false)} 
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId} Dashboard</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">{filteredInvoices.length} invoices currently tracked</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={handleCreateNew}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Create New Export
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                 <Truck size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Active</div>
           </div>
           <div className="text-lg font-black text-stone-900">{summaryStats.active}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Scale size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Weight</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">{summaryStats.weight.toFixed(2)} <span className="text-xs text-stone-400">ct</span></div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0">
                 <Package size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Pieces</div>
           </div>
           <div className="text-lg font-black text-stone-900">{summaryStats.pieces}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Value</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">${summaryStats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Active</div>
              <div className="text-2xl font-black text-stone-900">{summaryStats.active}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Truck size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Weight</div>
              <div className="text-2xl font-black text-stone-900">{summaryStats.weight.toFixed(2)} <span className="text-sm font-medium text-stone-400">ct</span></div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Scale size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Pieces</div>
              <div className="text-2xl font-black text-stone-900">{summaryStats.pieces}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Package size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Value</div>
              <div className="text-2xl font-black text-emerald-600">${summaryStats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign size={28} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
         <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
               <input 
                  type="text" 
                  placeholder="Search exports..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                 <Filter size={18} />
               </button>
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Invoice List - Card Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 flex items-center justify-center mb-4">
              <Package size={40} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No invoices found</h3>
            <p className="text-stone-500 mb-6">Get started by adding your first export invoice</p>
            {!isReadOnly && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-700 transition-all"
              >
                <Plus size={18} /> New Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map(invoice => {
              const { totalWeight, totalValue } = calculateInvoiceTotals(invoice.items);
              const avgPrice = totalWeight > 0 ? totalValue / totalWeight : 0;
              const totalPieces = invoice.items.reduce((sum, item) => {
                if (!isNaN(Number(item.lotOrPcs)) && item.lotOrPcs !== '') {
                  return sum + Number(item.lotOrPcs);
                }
                return sum + 1;
              }, 0);
              
              return (
                <div 
                  key={invoice.id} 
                  onClick={() => setSelectedInvoice(invoice)}
                  className="bg-white border border-stone-200 rounded-2xl p-0 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                         <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center text-lg shadow-sm border border-stone-100">
                            {invoice.destinationFlag || '📦'}
                         </div>
                         <div>
                            <h3 className="font-bold text-stone-900 leading-tight group-hover:text-purple-600 transition-colors text-sm md:text-base">{invoice.invoiceNumber}</h3>
                            <div className="text-xs text-stone-500 mt-0.5">{invoice.destination}</div>
                         </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                       <div className="text-center border-r border-stone-200 last:border-0">
                          <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Weight</div>
                          <div className="font-bold text-stone-800 text-sm">{totalWeight.toFixed(1)} <span className="text-[10px] text-stone-400">ct</span></div>
                       </div>
                       <div className="text-center border-r border-stone-200 last:border-0">
                          <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Pieces</div>
                          <div className="font-bold text-stone-800 text-sm">{totalPieces}</div>
                       </div>
                       <div className="text-center">
                          <div className="text-[10px] text-stone-400 font-bold uppercase mb-0.5">Avg/Ct</div>
                          <div className="font-bold text-stone-800 text-sm">${avgPrice.toFixed(0)}</div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50/80 p-4 border-t border-stone-100 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                       <Calendar size={12} /> {invoice.createdDate}
                    </div>
                    <div className="font-bold text-emerald-600 text-lg">
                       ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onEdit={() => selectedInvoice && handleEdit(selectedInvoice)}
        title={selectedInvoice?.invoiceNumber || ''}
        subtitle={`Destination: ${selectedInvoice?.destination}`}
        status={selectedInvoice?.status}
        statusColor={selectedInvoice ? getStatusColor(selectedInvoice.status) : ''}
        icon={<Package size={32} />}
        data={selectedInvoice ? {
             createdDate: selectedInvoice.createdDate,
             shipDate: selectedInvoice.shipDate,
             trackingNumber: selectedInvoice.trackingNumber || 'Pending',
             exportCharges: `$${selectedInvoice.exportCharges}`,
        } : undefined}
        customContent={
            selectedInvoice ? (
                <div className="space-y-8">
                    {/* FULL DETAILS FOR MOBILE USERS - Showing every single field */}
                    <div className="space-y-3">
                         <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                            <Package size={14}/> Items ({selectedInvoice.items.length})
                        </h4>
                        
                        {/* Mobile Cards for Items */}
                        <div className="block md:hidden space-y-3">
                            {selectedInvoice.items.map((item, i) => (
                                <div key={i} className="bg-stone-50 rounded-xl border border-stone-200 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-2 border-b border-stone-100 pb-2">
                                        <div className="font-bold text-stone-900">{item.description}</div>
                                        <div className="text-xs font-mono text-stone-400">#{item.sn}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold">Lot/Pcs</div>
                                            <div className="font-medium text-stone-700">{item.lotOrPcs}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold">Weight</div>
                                            <div className="font-medium text-stone-700">{item.weight} ct</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold">Price/Pc</div>
                                            <div className="font-medium text-stone-700">${item.pricePerPc}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold">Value</div>
                                            <div className="font-bold text-emerald-600">${calculateItemValue(item).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block rounded-xl border border-stone-200 overflow-hidden">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-stone-50 text-xs font-bold text-stone-500 uppercase">
                                    <tr>
                                        <th className="p-3">#</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3">Lot/Pcs</th>
                                        <th className="p-3">Weight</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {selectedInvoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="p-3 text-stone-400 text-xs">{item.sn}</td>
                                            <td className="p-3 font-medium text-stone-900">{item.description}</td>
                                            <td className="p-3 text-stone-600">{item.lotOrPcs}</td>
                                            <td className="p-3 text-stone-600">{item.weight}ct</td>
                                            <td className="p-3 text-stone-600">${item.pricePerPc}</td>
                                            <td className="p-3 text-right font-mono font-medium">${calculateItemValue(item).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                         <div className="bg-stone-100 p-4 rounded-xl flex justify-between items-center mt-2 border border-stone-200">
                             <div className="text-xs font-bold text-stone-500 uppercase">Total Invoice Value</div>
                             <div className="text-xl font-bold text-emerald-600">${calculateInvoiceTotals(selectedInvoice.items).totalValue.toLocaleString()}</div>
                         </div>
                    </div>
                    
                    {/* DOCUMENTS SECTION - VISIBLE IN READ ONLY MODE */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                            <FileText size={14}/> Documents & Receipts
                        </h4>
                        {selectedInvoice.documents.length === 0 ? (
                            <div className="p-6 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                <FileText size={24} className="mx-auto text-stone-300 mb-2" />
                                <p className="text-stone-400 text-sm">No documents attached.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {selectedInvoice.documents.map((doc, idx) => (
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        key={idx} 
                                        className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-md hover:border-gem-purple/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center text-gem-purple overflow-hidden relative shrink-0">
                                            {(doc.type === 'certificate' || doc.url.startsWith('data:image') || doc.name.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                                                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <File size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-stone-700 truncate group-hover:text-gem-purple transition-colors">{doc.name}</div>
                                            <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                                                <ExternalLink size={10} /> Tap to view
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : null
        }
      />
    </div>
  );
};

// --- TEMPLATE 8: TRAVEL TICKETS ---
export const TravelTicketsTemplate: React.FC<Props> = ({ isReadOnly }) => {
  const tickets = useMemo(() => generateTickets(12), []);
  const [selectedTicket, setSelectedTicket] = useState<TicketEntry | null>(null);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(ticket => (
          <div 
            key={ticket.id} 
            onClick={() => setSelectedTicket(ticket)}
            className="group bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${ticket.type === 'Flight' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                 {ticket.type === 'Flight' ? <Plane size={24} /> : <FileText size={24} />}
               </div>
               <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ticket.status === 'Booked' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                 {ticket.status}
               </span>
            </div>
            
            <h3 className="font-bold text-lg text-stone-900 mb-1 group-hover:text-gem-purple transition-colors">{ticket.description}</h3>
            <div className="text-sm text-stone-500 mb-6 flex items-center gap-2">
               <User size={14} /> {ticket.passenger}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
               <div>
                  <div className="text-[10px] uppercase text-stone-400 font-bold mb-0.5">Date</div>
                  <div className="font-medium text-stone-800">{ticket.date}</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] uppercase text-stone-400 font-bold mb-0.5">Cost</div>
                  <div className="font-bold text-stone-900">{ticket.cost.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">LKR</span></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.description || 'Ticket'}
        subtitle={selectedTicket?.type}
        data={selectedTicket || {}}
        status={selectedTicket?.status}
        statusColor={selectedTicket?.status === 'Booked' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
        icon={selectedTicket?.type === 'Flight' ? <Plane size={32} /> : <FileText size={32} />}
      />
    </div>
  );
};
