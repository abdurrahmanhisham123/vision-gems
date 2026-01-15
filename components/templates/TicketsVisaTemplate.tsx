import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Plane, Globe, Ticket, User, Building2, MapPin
} from 'lucide-react';
import { APP_MODULES } from '../../constants';

// --- Types ---
interface TicketsVisaItem {
  id: string;
  date: string;
  code: string;
  passengerName: string;
  description?: string; // Description field
  route?: string; // From → To
  airline?: string;
  ticketType?: 'One-way' | 'Round-trip' | 'Multi-city';
  category?: string; // Classic Travel, Online Ticket, Personal Ticket Visa
  recordType?: 'Ticket' | 'Visa' | 'Both';
  amount: number;
  currency: string; // "LKR", "TZS", "USD", etc.
  convertedAmount?: number; // Amount in LKR if foreign currency
  exchangeRate?: number;
  location?: string; // Location field
  payable?: number; // Payable amount
  company?: string;
  notes?: string;
  sourceModule?: string; // For aggregated data: which module this came from
  sourceTab?: string; // For aggregated data: which tab this came from
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): TicketsVisaItem[] => {
  return [];
};

// --- Side Panel Component ---
const TicketsVisaDetailPanel: React.FC<{
  item: TicketsVisaItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (item: TicketsVisaItem) => void;
  onDelete: (id: string) => void;
  currencies: string[];
  exchangeRates: Record<string, number>;
  hasRouteInfo?: boolean;
  hasAirline?: boolean;
  isReadOnly?: boolean;
}> = ({ item: initialItem, initialIsEditing = false, onClose, onSave, onDelete, currencies, exchangeRates, hasRouteInfo = false, hasAirline = false, isReadOnly }) => {
  
  if (!initialItem) {
    return null;
  }
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<TicketsVisaItem>(initialItem);

  useEffect(() => {
    setFormData(initialItem);
    setIsEditing(initialIsEditing);
  }, [initialItem, initialIsEditing]);

  const handleInputChange = (key: keyof TicketsVisaItem, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      
      // Calculate converted amount for foreign currencies based on manually entered exchange rate
      if (key === 'currency' || key === 'amount' || key === 'exchangeRate') {
        const currency = key === 'currency' ? value : updated.currency;
        const amount = key === 'amount' ? value : updated.amount;
        const exchangeRate = key === 'exchangeRate' ? value : updated.exchangeRate;
        
        if (currency && currency !== 'LKR' && amount && exchangeRate) {
          // Use manually entered exchange rate to calculate LKR equivalent
          const converted = Math.floor(amount * exchangeRate);
          return { ...updated, convertedAmount: converted };
        } else if (currency === 'LKR') {
          return { ...updated, convertedAmount: undefined, exchangeRate: undefined };
        } else if (currency && currency !== 'LKR' && (!amount || !exchangeRate)) {
          // Clear converted amount if amount or exchange rate is missing
          return { ...updated, convertedAmount: undefined };
        }
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    if (!formData.passengerName || !formData.amount) {
      return alert('Passenger Name and Amount are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this ticket/visa record?')) {
      onDelete(formData.id);
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
    if (amount === undefined || amount === null || !currency) return 'N/A';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof TicketsVisaItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof TicketsVisaItem, value: any) => void,
    type?: 'text' | 'number' | 'date' | 'select', 
    highlight?: boolean, 
    isCurrency?: boolean, 
    options?: string[]
  }> = ({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options = [] }) => {
    return (
      <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
        {isEditing ? (
          (type === 'select' || options.length > 0) ? (
            <select 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, e.target.value)} 
              className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 appearance-none"
            >
              {options.length > 0 ? (
                options.map(opt => <option key={opt} value={opt}>{opt}</option>)
              ) : (
                <option value="">Select...</option>
              )}
            </select>
          ) : (
            <input 
              type={type} 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10" 
            />
          )
        ) : (
          <span className={`text-sm ${highlight ? 'font-bold text-cyan-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
            {value === undefined || value === null || value === '' ? '-' : (typeof value === 'number' ? value.toLocaleString() : value)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
        
        <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
          <div className="flex gap-3 md:gap-4 items-center min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
              <Ticket size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                  {formData.recordType || formData.ticketType || 'Ticket'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code || 'N/A'}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.passengerName || ''} 
                  onChange={(e) => handleInputChange('passengerName', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-cyan-200 focus:border-cyan-500 outline-none w-full" 
                  placeholder="Passenger Name" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.passengerName || 'Unnamed'}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <Plane size={14} className="text-stone-400" />
                <p className="truncate">{formData.route || 'No route'} • {formData.amount ? formatCurrency(formData.amount, formData.currency || 'LKR') : 'N/A'}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Ticket size={14} className="text-cyan-500" /> Ticket/Visa Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field 
                  label="Type" 
                  value={formData.recordType || ''} 
                  field="recordType" 
                  isEditing={isEditing} 
                  onInputChange={handleInputChange} 
                  options={['Ticket', 'Visa', 'Both']}
                />
                <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Location" value={formData.location} field="location" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Passenger Name" value={formData.passengerName} field="passengerName" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Route (From → To)" value={formData.route} field="route" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Airline" value={formData.airline} field="airline" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field 
                  label="Ticket Type" 
                  value={formData.ticketType} 
                  field="ticketType" 
                  isEditing={isEditing} 
                  onInputChange={handleInputChange} 
                  options={['One-way', 'Round-trip', 'Multi-city']}
                />
                <Field 
                  label="Category" 
                  value={formData.category} 
                  field="category" 
                  isEditing={isEditing} 
                  onInputChange={handleInputChange} 
                  options={['Classic Travel', 'Online Ticket', 'Personal Ticket Visa']}
                />
                <Field label="Currency" value={formData.currency} field="currency" isEditing={isEditing} onInputChange={handleInputChange} options={currencies} />
                <Field label="Amount" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                {formData.currency !== 'LKR' && (
                  <>
                    <Field label="Exchange Rate" value={formData.exchangeRate} field="exchangeRate" isEditing={isEditing} onInputChange={handleInputChange} type="number" />
                    <Field label="LKR Equivalent" value={formData.convertedAmount} field="convertedAmount" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                  </>
                )}
                <Field label="Payable" value={formData.payable} field="payable" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                <Field label="Notes" value={formData.notes} field="notes" isEditing={isEditing} onInputChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-cyan-700 transition-all">
                <Save size={16} /> Save
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.print()} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100">
                <Printer size={18} />
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-cyan-700 transition-all">
                    <Edit size={16} /> Edit Record
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TicketsVisaTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<TicketsVisaItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [payable, setPayable] = useState<number>(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Panel State
  const [selectedItem, setSelectedItem] = useState<TicketsVisaItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TicketsVisaItem | null>(null);

  // Check if this is the mother tab (all-expenses / Ticket and Visa)
  const isMotherTab = moduleId === 'all-expenses' && tabId.toLowerCase() === 'ticket and visa';

  // Define all TicketsVisa tabs to aggregate from (memoized to avoid dependency issues)
  const ticketsVisaTabs = useMemo(() => [
    { moduleId: 'bkk', tabId: 'BKKTickets' },
    { moduleId: 'kenya', tabId: 'Traveling.EX' },
    { moduleId: 'spinel-gallery', tabId: 'BKkticket' },
    { moduleId: 'dada', tabId: 'Tickets.visa' },
    { moduleId: 'madagascar', tabId: 'Tickets.visa' },
    { moduleId: 'vgtz', tabId: 'Tickets.visa' },
  ], []);

  // Determine tab-specific requirements
  const tabConfig = useMemo(() => {
    const tabLower = tabId.toLowerCase();
    return {
      hasRouteInfo: tabLower.includes('ticket') || tabLower.includes('traveling') || tabLower === 'bkkticket',
      hasAirline: tabLower.includes('online') || tabLower === 'bkktickets'
    };
  }, [tabId]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalMain = items.reduce((sum, item) => sum + item.amount, 0);
    const totalLKR = items.reduce((sum, item) => 
      sum + (item.convertedAmount || (item.currency === 'LKR' ? item.amount : 0)), 0
    );
    const foreignCount = items.filter(item => item.currency !== 'LKR').length;
    const ticketCount = items.length;
    
    return { totalMain, totalLKR, count: ticketCount, foreignCount };
  }, [items]);

  // --- Filter Options ---
  const uniqueCategories = useMemo(() => Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort(), [items]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(items.map(i => i.company).filter(Boolean))).sort(), [items]);

  // Load data from localStorage
  useEffect(() => {
    if (isMotherTab) {
      // Aggregate data from all TicketsVisa tabs
      const allItems: TicketsVisaItem[] = [];
      
      ticketsVisaTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        // Try multiple localStorage key patterns
        const storageKeys = [
          `tickets_visa_${sourceModule}_${sourceTab}`,
          `ticket_visa_${sourceModule}_${sourceTab}`,
        ];
        
        for (const storageKey of storageKeys) {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              const sourceItems: TicketsVisaItem[] = JSON.parse(saved);
              // Add source information to each item
              const itemsWithSource = sourceItems.map(item => ({
                ...item,
                sourceModule,
                sourceTab,
              }));
              allItems.push(...itemsWithSource);
              break; // Found data, no need to check other keys
            } catch (e) {
              console.error(`Failed to load tickets/visa data from ${sourceModule}/${sourceTab}:`, e);
            }
          }
        }
      });
      
      // Also load data from the mother tab itself
      const motherTabKeys = [
        `tickets_visa_${moduleId}_${tabId}`,
        `ticket_visa_${moduleId}_${tabId}`,
      ];
      
      for (const motherTabKey of motherTabKeys) {
        const motherTabSaved = localStorage.getItem(motherTabKey);
        if (motherTabSaved) {
          try {
            const motherTabItems: TicketsVisaItem[] = JSON.parse(motherTabSaved);
            allItems.push(...motherTabItems);
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error('Failed to load mother tab data:', e);
          }
        }
      }
      
      setItems(allItems);
      setIsDataLoaded(true);
    } else {
      // Load data for individual tabs
      const storageKeys = [
        `tickets_visa_${moduleId}_${tabId}`,
        `ticket_visa_${moduleId}_${tabId}`,
      ];
      
      for (const storageKey of storageKeys) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            setItems(JSON.parse(saved));
            setIsDataLoaded(true);
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error('Failed to load tickets/visa data:', e);
          }
        }
      }
      // Set flag to true even if no data was found, to allow future saves
      setIsDataLoaded(true);
    }
  }, [moduleId, tabId, isMotherTab, ticketsVisaTabs]);

  // Save data to localStorage (only for non-mother tabs, and only after initial load)
  useEffect(() => {
    if (!isMotherTab && isDataLoaded) {
      const storageKey = `tickets_visa_${moduleId}_${tabId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
        console.log(`Saved ${items.length} items to localStorage: ${storageKey}`);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [items, moduleId, tabId, isMotherTab, isDataLoaded]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.route && item.route.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.airline && item.airline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCurrency = 
        currencyFilter === 'all' || item.currency === currencyFilter;
      
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      
      const matchesCompany = companyFilter === 'All' || item.company === companyFilter;
        
      return matchesSearch && matchesCurrency && matchesCategory && matchesCompany;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, currencyFilter, categoryFilter, companyFilter]);

  // Helper function to save item to the correct localStorage location
  const saveItemToStorage = (item: TicketsVisaItem, isNew: boolean = false) => {
    const targetModule = item.sourceModule || moduleId;
    const targetTab = item.sourceTab || tabId;
    const storageKey = `tickets_visa_${targetModule}_${targetTab}`;
    
    // Load existing items from that location
    const saved = localStorage.getItem(storageKey);
    let existingItems: TicketsVisaItem[] = [];
    if (saved) {
      try {
        existingItems = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load existing items:', e);
      }
    }
    
    if (isNew) {
      existingItems.push(item);
      console.log(`Adding new item to localStorage: ${storageKey}`, item);
    } else {
      existingItems = existingItems.map(i => i.id === item.id ? item : i);
      console.log(`Updating item in localStorage: ${storageKey}`, item);
    }
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(existingItems));
      console.log(`Successfully saved ${existingItems.length} items to localStorage: ${storageKey}`);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    
    // If we're in the mother tab, reload all aggregated data
    if (isMotherTab) {
      const allItems: TicketsVisaItem[] = [];
      ticketsVisaTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKeys = [
          `tickets_visa_${sourceModule}_${sourceTab}`,
          `ticket_visa_${sourceModule}_${sourceTab}`,
        ];
        
        for (const sourceKey of sourceKeys) {
          const sourceSaved = localStorage.getItem(sourceKey);
          if (sourceSaved) {
            try {
              const sourceItems: TicketsVisaItem[] = JSON.parse(sourceSaved);
              const itemsWithSource = sourceItems.map(i => ({
                ...i,
                sourceModule,
                sourceTab,
              }));
              allItems.push(...itemsWithSource);
              break; // Found data, no need to check other keys
            } catch (e) {
              console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
            }
          }
        }
      });
      
      const motherTabKeys = [
        `tickets_visa_${moduleId}_${tabId}`,
        `ticket_visa_${moduleId}_${tabId}`,
      ];
      
      for (const motherTabKey of motherTabKeys) {
        const motherTabSaved = localStorage.getItem(motherTabKey);
        if (motherTabSaved) {
          try {
            const motherTabItems: TicketsVisaItem[] = JSON.parse(motherTabSaved);
            allItems.push(...motherTabItems);
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error('Failed to load mother tab data:', e);
          }
        }
      }
      
      setItems(allItems);
    }
  };

  // Helper function to delete item from the correct localStorage location
  const deleteItemFromStorage = (id: string, sourceModule?: string, sourceTab?: string) => {
    const targetModule = sourceModule || moduleId;
    const targetTab = sourceTab || tabId;
    const storageKey = `tickets_visa_${targetModule}_${targetTab}`;
    
    // Load existing items from that location
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const existingItems: TicketsVisaItem[] = JSON.parse(saved);
        const filteredItems = existingItems.filter(i => i.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filteredItems));
        console.log(`Deleted item from localStorage: ${storageKey}`);
      } catch (e) {
        console.error('Failed to delete from localStorage:', e);
      }
    }
    
    // If we're in the mother tab, reload all aggregated data
    if (isMotherTab) {
      const allItems: TicketsVisaItem[] = [];
      ticketsVisaTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKeys = [
          `tickets_visa_${sourceModule}_${sourceTab}`,
          `ticket_visa_${sourceModule}_${sourceTab}`,
        ];
        
        for (const sourceKey of sourceKeys) {
          const sourceSaved = localStorage.getItem(sourceKey);
          if (sourceSaved) {
            try {
              const sourceItems: TicketsVisaItem[] = JSON.parse(sourceSaved);
              const itemsWithSource = sourceItems.map(i => ({
                ...i,
                sourceModule,
                sourceTab,
              }));
              allItems.push(...itemsWithSource);
              break; // Found data, no need to check other keys
            } catch (e) {
              console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
            }
          }
        }
      });
      
      const motherTabKeys = [
        `tickets_visa_${moduleId}_${tabId}`,
        `ticket_visa_${moduleId}_${tabId}`,
      ];
      
      for (const motherTabKey of motherTabKeys) {
        const motherTabSaved = localStorage.getItem(motherTabKey);
        if (motherTabSaved) {
          try {
            const motherTabItems: TicketsVisaItem[] = JSON.parse(motherTabSaved);
            allItems.push(...motherTabItems);
            break; // Found data, no need to check other keys
          } catch (e) {
            console.error('Failed to load mother tab data:', e);
          }
        }
      }
      
      setItems(allItems);
    }
  };

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this ticket/visa record?')) {
      const item = items.find(i => i.id === id);
      if (item) {
        deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
      }
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleSave = (item: TicketsVisaItem) => {
    const isNew = !editingItem;
    
    // If in mother tab and item has source info, save to source location
    // Otherwise, save to current location
    if (isMotherTab && item.sourceModule && item.sourceTab) {
      // Item is from another tab, save to that location
      saveItemToStorage(item, isNew);
    } else if (!isMotherTab) {
      // Regular tab, save normally (will be handled by useEffect)
      if (editingItem) {
        setItems(prev => prev.map(i => i.id === item.id ? item : i));
      } else {
        setItems(prev => [item, ...prev]);
      }
    } else {
      // Mother tab, new item without source - save to mother tab
      saveItemToStorage({ ...item, sourceModule: moduleId, sourceTab: tabId }, isNew);
    }
    
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: TicketsVisaItem) => {
    // If in mother tab and item has source info, save to source location
    if (isMotherTab && item.sourceModule && item.sourceTab) {
      saveItemToStorage(item, false);
    } else if (!isMotherTab) {
      // Regular tab, update normally
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      // Mother tab, item without source - save to mother tab
      saveItemToStorage({ ...item, sourceModule: moduleId, sourceTab: tabId }, false);
    }
    setSelectedItem(item);
  };

  const handleDeleteFromPanel = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
    }
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  // --- Currency Options ---
  const currencies = ['LKR', 'TZS', 'KSH', 'USD'];
  const exchangeRates: Record<string, number> = {
    'TZS': 0.125,
    'KSH': 2.25,
    'USD': 300
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handlePrint = () => {
    const now = new Date();
    const printDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const tableRows = filteredItems.map(item => {
      const date = (item.date || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const code = (item.code || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const passengerName = (item.passengerName || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const route = (item.route || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const airline = (item.airline || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const ticketType = (item.ticketType || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const notes = (item.notes || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${passengerName}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${route}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${airline}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${ticketType}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.convertedAmount ? `LKR ${item.convertedAmount.toLocaleString()}` : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.exchangeRate ? item.exchangeRate.toFixed(4) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${notes}</td>
      </tr>
    `;
    }).join('');

    const safeTabId = tabId.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Create print overlay that covers the page
    const printOverlay = document.createElement('div');
    printOverlay.id = 'print-overlay';
    printOverlay.style.position = 'fixed';
    printOverlay.style.top = '0';
    printOverlay.style.left = '0';
    printOverlay.style.width = '100%';
    printOverlay.style.height = '100%';
    printOverlay.style.backgroundColor = '#ffffff';
    printOverlay.style.zIndex = '99999';
    printOverlay.style.overflow = 'auto';
    printOverlay.style.padding = '40px';
    printOverlay.style.fontFamily = 'Arial, sans-serif';
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-overlay,
        #print-overlay * {
          visibility: visible;
        }
        #print-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          background: white;
        }
        @page {
          size: landscape;
          margin: 0.5in;
        }
        .no-print {
          display: none !important;
        }
      }
      @media screen {
        #print-overlay {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);
    
    printOverlay.innerHTML = `
      <div style="max-width: 100%; margin: 0 auto;">
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #000000;">
          <h1 style="font-size: 24pt; font-weight: bold; margin-bottom: 5px; color: #000000; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Vision Gems</h1>
          <p style="font-size: 9pt; color: #333333; margin: 0;">Printed on: ${printDate} at ${printTime}</p>
        </div>
        <div style="font-size: 16pt; font-weight: bold; margin: 10px 0; text-transform: uppercase; color: #000000;">${safeTabId}</div>
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 10px; font-size: 8pt;">
          <colgroup>
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 11%;">
            <col style="width: 11%;">
            <col style="width: 9%;">
            <col style="width: 9%;">
            <col style="width: 11%;">
            <col style="width: 11%;">
            <col style="width: 8%;">
            <col style="width: 9%;">
            <col style="width: 5%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Passenger</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Route</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Airline</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Ticket Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Converted (LKR)</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Exchange Rate</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="11" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No tickets/visas found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(printOverlay);

    // Wait for content to render, then trigger print
    setTimeout(() => {
      window.print();
    }, 100);

    // Clean up after print dialog closes
    const handleAfterPrint = () => {
      if (document.body.contains(printOverlay)) {
        document.body.removeChild(printOverlay);
      }
      const printStyles = document.getElementById('print-styles');
      if (printStyles) {
        printStyles.remove();
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-cyan-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Tickets & Visa in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Payable</span>
              <input
                 type="number"
                 value={payable || ''}
                 onChange={(e) => setPayable(Number(e.target.value) || 0)}
                 placeholder="0.00"
                 className="w-24 md:w-32 px-2 py-1 text-sm font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                 disabled={isReadOnly}
              />
              <span className="text-xs font-bold text-stone-400">LKR</span>
           </div>
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-900/20 hover:bg-cyan-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Ticket/Visa
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalLKR.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <Ticket size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Tickets Issued</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.count}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Globe size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Foreign Currency</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.foreignCount}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Plane size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Avg Ticket Cost</div>
           </div>
           <div className="text-sm font-black text-stone-900 leading-tight">
              {stats.count > 0 ? `LKR ${Math.floor(stats.totalLKR / stats.count).toLocaleString()}` : '-'}
           </div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalLKR.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Tickets Issued</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <Ticket size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Foreign Currency</div>
              <div className="text-2xl font-black text-stone-900">{stats.foreignCount}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Globe size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Avg Ticket Cost</div>
              <div className="text-2xl font-black text-stone-900">
                {stats.count > 0 ? `LKR ${Math.floor(stats.totalLKR / stats.count).toLocaleString()}` : '-'}
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Plane size={28} />
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
                  placeholder="Search by passenger, route, code, airline..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-cyan-500/5 focus:border-cyan-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Globe size={14} className="text-stone-900" />
                  <select 
                     value={currencyFilter}
                     onChange={(e) => setCurrencyFilter(e.target.value)}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">All Currencies</option>
                     {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Ticket size={14} className="text-stone-300" />
                  <select 
                     value={categoryFilter} 
                     onChange={(e) => setCategoryFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[140px]"
                  >
                     <option value="All">Category</option>
                     {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                     ))}
                  </select>
               </div>
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Building2 size={14} className="text-stone-300" />
                  <select 
                     value={companyFilter} 
                     onChange={(e) => setCompanyFilter(e.target.value)} 
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
                  >
                     <option value="All">Company</option>
                     {uniqueCompanies.map(company => (
                        <option key={company} value={company}>{company}</option>
                     ))}
                  </select>
               </div>
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm shrink-0">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Company</th>
                     <th className="p-6">Date</th>
                     <th className="p-6">Location</th>
                     <th className="p-6">Name</th>
                     <th className="p-6">Description</th>
                     <th className="p-6">Route</th>
                     {isMotherTab && <th className="p-6">Source</th>}
                     <th className="p-6 text-right pr-10">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-cyan-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 text-stone-600">{item.company || <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6 text-stone-600">{item.location || <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 font-bold text-stone-800">{item.passengerName}</td>
                        <td className="p-6 text-stone-600 max-w-xs truncate" title={item.description}>{item.description || <span className="text-stone-300">-</span>}</td>
                        <td className="p-6 text-stone-600">
                            {item.route ? (
                              <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                                <Plane size={14} />
                                {item.route}
                              </div>
                            ) : (
                              <span className="text-stone-300">-</span>
                            )}
                        </td>
                        {isMotherTab && (
                           <td className="p-6">
                              {item.sourceModule && item.sourceTab ? (
                                 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100" title={`${APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / ${item.sourceTab}`}>
                                    {APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / {item.sourceTab}
                                 </span>
                              ) : (
                                 <span className="text-stone-300">-</span>
                              )}
                           </td>
                        )}
                        <td className="p-6 text-right pr-10">
                           <div className="font-black text-cyan-700">
                              {formatCurrency(item.amount, item.currency)}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && (
               <div className="p-16 text-center text-stone-400">No tickets/visas found.</div>
            )}
         </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4 mb-24">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">{item.company || <span className="text-stone-300">-</span>}</span>
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Plane size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.passengerName}</h3>
                     {isMotherTab && item.sourceModule && item.sourceTab && (
                        <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100 inline-block w-fit">
                           {APP_MODULES.find(m => m.id === item.sourceModule)?.name || item.sourceModule} / {item.sourceTab}
                        </span>
                     )}
                  </div>
               </div>

               <div className="mb-3 relative z-10 space-y-2">
                  {item.location && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <MapPin size={14} className="text-stone-400" />
                        <span>{item.location}</span>
                     </div>
                  )}
                  {item.description && (
                     <div className="text-sm text-stone-600">
                        <span className="font-medium">Description: </span>
                        <span>{item.description}</span>
                     </div>
                  )}
                  {item.route && (
                     <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Plane size={14} className="text-stone-400" />
                        <span className="truncate font-medium">{item.route}</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 relative z-10">
                  <div className="text-xs text-stone-400 font-medium mb-1">Amount</div>
                  <div className="text-xl font-black text-cyan-700">
                     {formatCurrency(item.amount, item.currency)}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <TicketsVisaDetailPanel 
            item={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            currencies={currencies}
            exchangeRates={exchangeRates}
            hasRouteInfo={tabConfig.hasRouteInfo}
            hasAirline={tabConfig.hasAirline}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <TicketsVisaForm 
            initialData={editingItem}
            currencies={currencies}
            exchangeRates={exchangeRates}
            hasRouteInfo={tabConfig.hasRouteInfo}
            hasAirline={tabConfig.hasAirline}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const TicketsVisaForm: React.FC<{
  initialData: TicketsVisaItem | null;
  currencies: string[];
  exchangeRates: Record<string, number>;
  hasRouteInfo?: boolean;
  hasAirline?: boolean;
  onSave: (item: TicketsVisaItem) => void;
  onCancel: () => void;
}> = ({ initialData, currencies, exchangeRates, hasRouteInfo = false, hasAirline = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TicketsVisaItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    passengerName: initialData?.passengerName || '',
    description: initialData?.description || '',
    route: initialData?.route || '',
    airline: initialData?.airline || '',
    ticketType: initialData?.ticketType || 'One-way',
    category: initialData?.category || '',
    recordType: initialData?.recordType || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'LKR',
    location: initialData?.location || '',
    payable: initialData?.payable || 0,
    company: initialData?.company || '',
    notes: initialData?.notes || '',
    exchangeRate: initialData?.exchangeRate,
    convertedAmount: initialData?.convertedAmount,
  });

  // Calculate converted amount based on manually entered exchange rate
  useEffect(() => {
    if (formData.currency && formData.amount && formData.currency !== 'LKR' && formData.exchangeRate) {
      // Only calculate if exchange rate is manually entered
      const converted = Math.floor(formData.amount * formData.exchangeRate);
      if (converted !== formData.convertedAmount) {
        setFormData(prev => ({...prev, convertedAmount: converted}));
      }
    } else if (formData.currency === 'LKR') {
      setFormData(prev => ({...prev, convertedAmount: undefined, exchangeRate: undefined}));
    } else if (formData.currency && formData.currency !== 'LKR' && (!formData.exchangeRate || !formData.amount)) {
      // Clear converted amount if exchange rate or amount is missing
      setFormData(prev => ({...prev, convertedAmount: undefined}));
    }
  }, [formData.amount, formData.currency, formData.exchangeRate]);

  const handleSubmit = () => {
    if (!formData.passengerName || !formData.amount) {
      return alert('Passenger Name and Amount are required');
    }
    
    onSave({
      id: initialData?.id || `ticket-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `TKT-${Date.now().toString().slice(-4)}`,
      passengerName: formData.passengerName!,
      description: formData.description,
      route: formData.route,
      airline: formData.airline,
      ticketType: formData.ticketType,
      category: formData.category,
      recordType: formData.recordType as 'Ticket' | 'Visa' | 'Both' | undefined,
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      convertedAmount: formData.convertedAmount,
      exchangeRate: formData.exchangeRate,
      location: formData.location,
      payable: formData.payable,
      company: formData.company,
      notes: formData.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Ticket/Visa' : 'New Ticket/Visa'}</h3>
             <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={20}/></button>
          </div>

          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Date</label>
                   <input 
                      type="date" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="TKT-001"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Type *</label>
                <select 
                   value={formData.recordType || ''} 
                   onChange={e => setFormData({...formData, recordType: e.target.value as 'Ticket' | 'Visa' | 'Both'})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                >
                   <option value="">Select type</option>
                   <option value="Ticket">Ticket</option>
                   <option value="Visa">Visa</option>
                   <option value="Both">Both</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Passenger Name *</label>
                <input 
                   type="text" 
                   value={formData.passengerName} 
                   onChange={e => setFormData({...formData, passengerName: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="Passenger name"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description</label>
                <textarea 
                   rows={2}
                   value={formData.description || ''} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none" 
                   placeholder="Description (optional)"
                />
             </div>

             {hasRouteInfo && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Route (From → To)</label>
                   <input 
                      type="text" 
                      value={formData.route} 
                      onChange={e => setFormData({...formData, route: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="e.g., CMB → BKK"
                   />
                </div>
             )}

             {hasAirline && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Airline</label>
                   <input 
                      type="text" 
                      value={formData.airline} 
                      onChange={e => setFormData({...formData, airline: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="Airline name"
                   />
                </div>
             )}

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Ticket Type</label>
                <select 
                   value={formData.ticketType} 
                   onChange={e => setFormData({...formData, ticketType: e.target.value as any})}
                   className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none"
                >
                   <option value="One-way">One-way</option>
                   <option value="Round-trip">Round-trip</option>
                   <option value="Multi-city">Multi-city</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Category</label>
                <select 
                   value={formData.category || ''} 
                   onChange={e => setFormData({...formData, category: e.target.value})}
                   className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none"
                >
                   <option value="">Select category</option>
                   <option value="Classic Travel">Classic Travel</option>
                   <option value="Online Ticket">Online Ticket</option>
                   <option value="Personal Ticket Visa">Personal Ticket Visa</option>
                </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Currency</label>
                   <select 
                      value={formData.currency} 
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                   >
                      {currencies.map(curr => (
                         <option key={curr} value={curr}>{curr}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount *</label>
                   <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.currency !== 'LKR' && (
                <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                   <div className="text-xs font-bold text-cyan-600 uppercase mb-2">Currency Conversion</div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">Exchange Rate *</label>
                         <input 
                            type="number" 
                            step="0.0001" 
                            value={formData.exchangeRate || ''} 
                            onChange={e => {
                              const rate = e.target.value ? Number(e.target.value) : undefined;
                              setFormData({...formData, exchangeRate: rate});
                            }}
                            className="w-full p-2 border rounded-lg bg-white text-sm" 
                            placeholder="Enter exchange rate"
                         />
                      </div>
                      <div>
                         <label className="block text-xs text-stone-500 mb-1">LKR Equivalent</label>
                         <input 
                            type="number" 
                            value={formData.convertedAmount || ''} 
                            disabled 
                            className="w-full p-2 border rounded-lg bg-stone-100 text-stone-500 text-sm" 
                            placeholder={formData.exchangeRate && formData.amount ? 'Auto-calculated' : 'Enter exchange rate first'}
                         />
                      </div>
                   </div>
                </div>
             )}

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Location</label>
                <input 
                   type="text" 
                   value={formData.location || ''} 
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="Location (optional)"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Payable</label>
                <input 
                   type="number" 
                   value={formData.payable || ''} 
                   onChange={e => setFormData({...formData, payable: Number(e.target.value) || 0})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="0.00"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                <input 
                   type="text" 
                   value={formData.company || ''} 
                   onChange={e => setFormData({...formData, company: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" 
                   placeholder="Optional"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Notes</label>
                <textarea 
                   rows={3}
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none" 
                   placeholder="Additional notes..."
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Ticket/Visa
             </button>
          </div>
       </div>
    </div>
  );
};

