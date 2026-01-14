import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Printer, Calendar, 
  Trash2, Edit, Save, X, DollarSign, 
  FileText, Scale, Scissors, Sparkles, Wallet, User, AlertCircle
} from 'lucide-react';
import { 
  convertExpenseItemToRecord, 
  syncCutPolishRecordToStones, 
  removeCutPolishRecordFromStones 
} from '../../services/cutPolishSyncService';

// --- Types ---
interface CutPolishExpenseItem {
  id: string;
  date: string;
  code: string;
  name: string; // Cutter/Polisher name
  description: string;
  weight: number; // in carats
  amount: number;
  currency: string; // "LKR"
  perCaratCost?: number; // Auto-calculated: amount / weight
  company?: string;
  type?: 'Cutting' | 'Polishing';
  paymentMethod?: string; // Cash / Cheque
  sourceModule?: string; // For aggregated data: which module this came from
  sourceTab?: string; // For aggregated data: which tab this came from
}

interface Props {
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

// --- Mock Data ---
const generateMockData = (): CutPolishExpenseItem[] => {
  return [];
};

// --- Side Panel Component ---
const CutPolishDetailPanel: React.FC<{
  expense: CutPolishExpenseItem;
  initialIsEditing?: boolean;
  onClose: () => void;
  onSave: (expense: CutPolishExpenseItem) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}> = ({ expense: initialExpense, initialIsEditing = false, onClose, onSave, onDelete, isReadOnly }) => {
  
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<CutPolishExpenseItem>(initialExpense);

  useEffect(() => {
    setFormData(initialExpense);
    setIsEditing(initialIsEditing);
  }, [initialExpense, initialIsEditing]);

  const handleInputChange = (key: keyof CutPolishExpenseItem, value: any) => {
    const updated = { ...formData, [key]: value };
    
    // Auto-calculate per-carat cost when weight or amount changes
    if ((key === 'weight' || key === 'amount') && updated.weight > 0 && updated.amount > 0) {
      updated.perCaratCost = Number((updated.amount / updated.weight).toFixed(2));
    }
    
    setFormData(updated);
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount || !formData.name || !formData.weight) {
      return alert('Description, Amount, Worker Name, and Weight are required');
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm('Delete this cut & polish expense?')) {
      onDelete(formData.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const Field: React.FC<{ 
    label: string, 
    value: any, 
    field: keyof CutPolishExpenseItem, 
    isEditing: boolean, 
    onInputChange: (key: keyof CutPolishExpenseItem, value: any) => void,
    type?: 'text' | 'number' | 'date', 
    highlight?: boolean, 
    isCurrency?: boolean, 
    options?: string[]
  }> = ({ label, value, field, isEditing, onInputChange, type = 'text', highlight = false, isCurrency = false, options = [] }) => {
    return (
      <div className="flex flex-col py-2 border-b border-stone-100 last:border-0 min-h-[50px] justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</span>
        {isEditing ? (
          options.length > 0 ? (
            <select 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, e.target.value)} 
              className="w-full p-3 md:p-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-lg outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 appearance-none"
            >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input 
              type={type} 
              value={value === undefined || value === null ? '' : value.toString()} 
              onChange={(e) => onInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)} 
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" 
            />
          )
        ) : (
          <span className={`text-sm ${highlight ? 'font-bold text-emerald-700' : 'font-medium text-stone-700'} ${isCurrency ? 'font-mono' : ''}`}>
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
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Scissors size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                  Completed
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{formData.code}</span>
              </div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  className="text-lg md:text-xl font-bold text-stone-900 border-b-2 border-emerald-200 focus:border-emerald-500 outline-none w-full" 
                  placeholder="Description" 
                  autoFocus 
                />
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{formData.description}</h2>
              )}
              <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                <User size={14} className="text-stone-400" />
                <p className="truncate">{formData.name || 'Worker'} • {formData.weight || 0} ct • LKR {formData.amount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
          <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Scissors size={14} className="text-emerald-500" /> Cut & Polish Details</h3>
              <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                <Field label="Date" value={formData.date} field="date" isEditing={isEditing} onInputChange={handleInputChange} type="date" />
                <Field label="Code" value={formData.code} field="code" isEditing={isEditing} onInputChange={handleInputChange} highlight />
                <Field label="Worker/Cutter" value={formData.name} field="name" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Description" value={formData.description} field="description" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Type" value={formData.type} field="type" isEditing={isEditing} onInputChange={handleInputChange} options={['Cutting', 'Polishing']} />
                <Field label="Weight (ct)" value={formData.weight} field="weight" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight />
                <Field label="Amount (LKR)" value={formData.amount} field="amount" isEditing={isEditing} onInputChange={handleInputChange} type="number" highlight isCurrency />
                <Field label="Per Carat Cost" value={formData.perCaratCost} field="perCaratCost" isEditing={false} onInputChange={handleInputChange} highlight isCurrency />
                <Field label="Company" value={formData.company} field="company" isEditing={isEditing} onInputChange={handleInputChange} />
                <Field label="Cash / Cheque" value={formData.paymentMethod} field="paymentMethod" isEditing={isEditing} onInputChange={handleInputChange} options={['Cash', 'Cheque', 'Bank Transfer']} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all">
                <Save size={16} /> Save
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrint} className="p-2.5 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl hover:bg-stone-100">
                <Printer size={18} />
              </button>
              {!isReadOnly && (
                <>
                  <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all">
                    <Edit size={16} /> Edit Expense
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

export const CutPolishExpensesTemplate: React.FC<Props> = ({ moduleId, tabId, isReadOnly }) => {
  const [items, setItems] = useState<CutPolishExpenseItem[]>(generateMockData());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CutPolishExpenseItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<CutPolishExpenseItem | null>(null);
  const [syncWarning, setSyncWarning] = useState<{ message: string; code: string } | null>(null);

  // Check if this is the mother tab (all-expenses / Cut.polish)
  const isMotherTab = moduleId === 'all-expenses' && tabId.toLowerCase() === 'cut.polish';

  // Define all cut polish tabs to aggregate from (memoized to avoid dependency issues)
  const cutPolishTabs = useMemo(() => [
    { moduleId: 'vision-gems', tabId: 'Cut.polish' },
    { moduleId: 'spinel-gallery', tabId: 'Cut.polish' },
    { moduleId: 'kenya', tabId: 'CutPolish' },
    { moduleId: 'vgtz', tabId: 'Cut.and.polish' },
    { moduleId: 'madagascar', tabId: 'Cut.polish' },
    { moduleId: 'vg-ramazan', tabId: 'Cut.polish' },
  ], []);

  // Load data from localStorage
  useEffect(() => {
    if (isMotherTab) {
      // Aggregate data from all cut polish tabs
      const allItems: CutPolishExpenseItem[] = [];
      
      cutPolishTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const storageKey = `cut_polish_expenses_${sourceModule}_${sourceTab}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const sourceItems: CutPolishExpenseItem[] = JSON.parse(saved);
            // Add source information to each item
            const itemsWithSource = sourceItems.map(item => ({
              ...item,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load cut polish data from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      
      // Also load data from the mother tab itself
      const motherTabKey = `cut_polish_expenses_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CutPolishExpenseItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      
      setItems(allItems);
      setIsDataLoaded(true);
    } else {
      // Load data for individual tabs
      const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load cut polish data:', e);
        }
      }
      // Set flag to true even if no data was found, to allow future saves
      setIsDataLoaded(true);
    }
  }, [moduleId, tabId, isMotherTab, cutPolishTabs]);

  // Save data to localStorage (only for non-mother tabs, and only after initial load)
  useEffect(() => {
    if (!isMotherTab && isDataLoaded) {
      const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
        console.log(`Saved ${items.length} items to localStorage: ${storageKey}`);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [items, moduleId, tabId, isMotherTab, isDataLoaded]);

  // --- Statistics ---
  const stats = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const avgPerCarat = totalWeight > 0 ? totalAmount / totalWeight : 0;
    
    const dates = items.map(i => new Date(i.date));
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return { totalAmount, totalWeight, avgPerCarat, count: items.length, minDate, maxDate };
  }, [items]);

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = 
        typeFilter === 'all' || item.type === typeFilter;
        
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchQuery, typeFilter]);

  // Helper function to save item to the correct localStorage location
  const saveItemToStorage = (item: CutPolishExpenseItem, isNew: boolean = false) => {
    const targetModule = item.sourceModule || moduleId;
    const targetTab = item.sourceTab || tabId;
    const storageKey = `cut_polish_expenses_${targetModule}_${targetTab}`;
    
    // Load existing items from that location
    const saved = localStorage.getItem(storageKey);
    let existingItems: CutPolishExpenseItem[] = [];
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
      const allItems: CutPolishExpenseItem[] = [];
      cutPolishTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKey = `cut_polish_expenses_${sourceModule}_${sourceTab}`;
        const sourceSaved = localStorage.getItem(sourceKey);
        if (sourceSaved) {
          try {
            const sourceItems: CutPolishExpenseItem[] = JSON.parse(sourceSaved);
            const itemsWithSource = sourceItems.map(i => ({
              ...i,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      const motherTabKey = `cut_polish_expenses_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CutPolishExpenseItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      setItems(allItems);
    }
  };

  // Helper function to delete item from the correct localStorage location
  const deleteItemFromStorage = (id: string, sourceModule?: string, sourceTab?: string) => {
    const targetModule = sourceModule || moduleId;
    const targetTab = sourceTab || tabId;
    const storageKey = `cut_polish_expenses_${targetModule}_${targetTab}`;
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const existingItems: CutPolishExpenseItem[] = JSON.parse(saved);
        const filteredItems = existingItems.filter(i => i.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filteredItems));
        console.log(`Successfully deleted item from localStorage: ${storageKey}. Remaining items: ${filteredItems.length}`);
      } catch (e) {
        console.error('Failed to delete item:', e);
      }
    }
    
    // If we're in the mother tab, reload all aggregated data
    if (isMotherTab) {
      const allItems: CutPolishExpenseItem[] = [];
      cutPolishTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
        const sourceKey = `cut_polish_expenses_${sourceModule}_${sourceTab}`;
        const sourceSaved = localStorage.getItem(sourceKey);
        if (sourceSaved) {
          try {
            const sourceItems: CutPolishExpenseItem[] = JSON.parse(sourceSaved);
            const itemsWithSource = sourceItems.map(i => ({
              ...i,
              sourceModule,
              sourceTab,
            }));
            allItems.push(...itemsWithSource);
          } catch (e) {
            console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
          }
        }
      });
      const motherTabKey = `cut_polish_expenses_${moduleId}_${tabId}`;
      const motherTabSaved = localStorage.getItem(motherTabKey);
      if (motherTabSaved) {
        try {
          const motherTabItems: CutPolishExpenseItem[] = JSON.parse(motherTabSaved);
          allItems.push(...motherTabItems);
        } catch (e) {
          console.error('Failed to load mother tab data:', e);
        }
      }
      setItems(allItems);
    }
  };

  // --- Handlers ---
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const item = items.find(i => i.id === id);
    if (confirm('Are you sure you want to delete this expense?')) {
      // Remove from stones if code is provided
      if (item?.code && item.code.trim() !== '') {
        removeCutPolishRecordFromStones(item.code, id);
      }
      
      if (isMotherTab && item) {
        deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
      } else {
        setItems(prev => {
          const updated = prev.filter(i => i.id !== id);
          // Immediately save to localStorage
          const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log(`Deleted item and saved to localStorage: ${storageKey}`);
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
          return updated;
        });
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    }
  };

  const handleSave = (item: CutPolishExpenseItem) => {
    // Auto-calculate per-carat cost
    if (item.weight > 0 && item.amount > 0) {
      item.perCaratCost = Number((item.amount / item.weight).toFixed(2));
    }
    
    // Sync to stones if code is provided
    if (item.code && item.code.trim() !== '') {
      const record = convertExpenseItemToRecord(item);
      const oldItem = editingItem || items.find(i => i.id === item.id);
      const oldCode = oldItem?.code;
      const result = syncCutPolishRecordToStones(item.code, record, oldCode);
      
      if (result.notFound) {
        setSyncWarning({
          message: `Stone with code '${item.code}' not found in All Stones. Record saved but not synced.`,
          code: item.code
        });
        // Auto-dismiss warning after 5 seconds
        setTimeout(() => setSyncWarning(null), 5000);
      } else if (result.updated > 0) {
        // Successfully synced - clear any previous warnings
        setSyncWarning(null);
      }
    }
    
    if (isMotherTab) {
      // If editing an existing item, save to its source location
      // If creating a new item (no source), save to mother tab
      const isNew = !editingItem || !items.find(i => i.id === item.id);
      if (isNew && !item.sourceModule && !item.sourceTab) {
        // New item in mother tab - save to mother tab
        const motherTabKey = `cut_polish_expenses_${moduleId}_${tabId}`;
        const saved = localStorage.getItem(motherTabKey);
        let motherTabItems: CutPolishExpenseItem[] = [];
        if (saved) {
          try {
            motherTabItems = JSON.parse(saved);
          } catch (e) {
            console.error('Failed to load mother tab items:', e);
          }
        }
        motherTabItems.push(item);
        try {
          localStorage.setItem(motherTabKey, JSON.stringify(motherTabItems));
          console.log(`Successfully saved new item to mother tab localStorage: ${motherTabKey}`, item);
        } catch (e) {
          console.error('Failed to save to mother tab localStorage:', e);
        }
        
        // Reload aggregated data
        const allItems: CutPolishExpenseItem[] = [];
        cutPolishTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
          const sourceKey = `cut_polish_expenses_${sourceModule}_${sourceTab}`;
          const sourceSaved = localStorage.getItem(sourceKey);
          if (sourceSaved) {
            try {
              const sourceItems: CutPolishExpenseItem[] = JSON.parse(sourceSaved);
              const itemsWithSource = sourceItems.map(i => ({
                ...i,
                sourceModule,
                sourceTab,
              }));
              allItems.push(...itemsWithSource);
            } catch (e) {
              console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
            }
          }
        });
        allItems.push(...motherTabItems);
        setItems(allItems);
      } else {
        // Existing item or item with source - save to source location
        saveItemToStorage(item, isNew);
      }
    } else {
      // Normal save for individual tabs - update state (useEffect will save to localStorage)
      if (editingItem) {
        setItems(prev => {
          const updated = prev.map(i => i.id === item.id ? item : i);
          // Immediately save to localStorage
          const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log(`Saved updated item to localStorage: ${storageKey}`);
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
          return updated;
        });
      } else {
        setItems(prev => {
          const updated = [item, ...prev];
          // Immediately save to localStorage
          const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log(`Saved new item to localStorage: ${storageKey}`);
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
          return updated;
        });
      }
    }
    setIsFormOpen(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleSaveFromPanel = (item: CutPolishExpenseItem) => {
    if (item.weight > 0 && item.amount > 0) {
      item.perCaratCost = Number((item.amount / item.weight).toFixed(2));
    }
    
    // Sync to stones if code is provided
    if (item.code && item.code.trim() !== '') {
      const record = convertExpenseItemToRecord(item);
      const oldItem = items.find(i => i.id === item.id);
      const oldCode = oldItem?.code;
      const result = syncCutPolishRecordToStones(item.code, record, oldCode);
      
      if (result.notFound) {
        setSyncWarning({
          message: `Stone with code '${item.code}' not found in All Stones. Record saved but not synced.`,
          code: item.code
        });
        // Auto-dismiss warning after 5 seconds
        setTimeout(() => setSyncWarning(null), 5000);
      } else if (result.updated > 0) {
        // Successfully synced - clear any previous warnings
        setSyncWarning(null);
      }
    }
    
    if (isMotherTab) {
      // Check if this is a new item (no source) or existing item
      const existingItem = items.find(i => i.id === item.id);
      const isNew = !existingItem || (!existingItem.sourceModule && !existingItem.sourceTab);
      
      if (isNew && !item.sourceModule && !item.sourceTab) {
        // New item in mother tab - save to mother tab
        const motherTabKey = `cut_polish_expenses_${moduleId}_${tabId}`;
        const saved = localStorage.getItem(motherTabKey);
        let motherTabItems: CutPolishExpenseItem[] = [];
        if (saved) {
          try {
            motherTabItems = JSON.parse(saved);
          } catch (e) {
            console.error('Failed to load mother tab items:', e);
          }
        }
        const existingIndex = motherTabItems.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          motherTabItems[existingIndex] = item;
          console.log(`Updating item in mother tab localStorage: ${motherTabKey}`, item);
        } else {
          motherTabItems.push(item);
          console.log(`Adding new item to mother tab localStorage: ${motherTabKey}`, item);
        }
        try {
          localStorage.setItem(motherTabKey, JSON.stringify(motherTabItems));
          console.log(`Successfully saved ${motherTabItems.length} items to mother tab localStorage: ${motherTabKey}`);
        } catch (e) {
          console.error('Failed to save to mother tab localStorage:', e);
        }
        
        // Reload aggregated data
        const allItems: CutPolishExpenseItem[] = [];
        cutPolishTabs.forEach(({ moduleId: sourceModule, tabId: sourceTab }) => {
          const sourceKey = `cut_polish_expenses_${sourceModule}_${sourceTab}`;
          const sourceSaved = localStorage.getItem(sourceKey);
          if (sourceSaved) {
            try {
              const sourceItems: CutPolishExpenseItem[] = JSON.parse(sourceSaved);
              const itemsWithSource = sourceItems.map(i => ({
                ...i,
                sourceModule,
                sourceTab,
              }));
              allItems.push(...itemsWithSource);
            } catch (e) {
              console.error(`Failed to load from ${sourceModule}/${sourceTab}:`, e);
            }
          }
        });
        allItems.push(...motherTabItems);
        setItems(allItems);
        setSelectedItem(item);
      } else {
        // Existing item with source - save to source location
        saveItemToStorage(item, false);
        setSelectedItem(item);
      }
    } else {
      setItems(prev => {
        const updated = prev.map(i => i.id === item.id ? item : i);
        // Immediately save to localStorage
        const storageKey = `cut_polish_expenses_${moduleId}_${tabId}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
          console.log(`Saved updated item from panel to localStorage: ${storageKey}`);
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
        }
        return updated;
      });
      setSelectedItem(item);
    }
  };

  const handleDeleteFromPanel = (id: string) => {
    const item = items.find(i => i.id === id);
    
    // Remove from stones if code is provided
    if (item?.code && item.code.trim() !== '') {
      removeCutPolishRecordFromStones(item.code, id);
    }
    
    if (isMotherTab && item) {
      deleteItemFromStorage(id, item.sourceModule, item.sourceTab);
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      setSelectedItem(null);
    }
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
      const description = (item.description || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const name = (item.name || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const type = (item.type || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const company = (item.company || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const paymentMethod = (item.paymentMethod || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return `
      <tr>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${date}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${code}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${description}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${name}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${type}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.weight.toFixed(2)} ct</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${formatCurrency(item.amount, item.currency)}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${item.perCaratCost ? item.perCaratCost.toFixed(2) : '-'}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${company}</td>
        <td style="border: 1px solid #cccccc; padding: 5px 4px; font-size: 8pt; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: middle;">${paymentMethod}</td>
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
            <col style="width: 15%;">
            <col style="width: 12%;">
            <col style="width: 8%;">
            <col style="width: 8%;">
            <col style="width: 12%;">
            <col style="width: 8%;">
            <col style="width: 12%;">
            <col style="width: 9%;">
          </colgroup>
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Date</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Code</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Description</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Worker</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Type</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Weight</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Amount</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Per Carat</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Company</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000000; padding: 6px 4px; text-align: left; font-weight: bold; font-size: 7pt; text-transform: uppercase; white-space: nowrap; color: #000000; vertical-align: middle;">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="10" style="text-align: center; padding: 20px; border: 1px solid #cccccc;">No expenses found</td></tr>'}
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
      {/* Sync Warning Notification */}
      {syncWarning && (
        <div className="fixed top-4 right-4 z-50 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg p-4 max-w-md animate-in slide-in-from-right">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="font-bold text-amber-900 text-sm mb-1">Sync Warning</div>
              <div className="text-amber-700 text-xs">{syncWarning.message}</div>
            </div>
            <button
              onClick={() => setSyncWarning(null)}
              className="text-amber-600 hover:text-amber-800 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Header Section - More Modern */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-emerald-600">
             {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">{tabId}</h2>
           <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">Cut & Polish Expenses in use</p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
           <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap">
             <Printer size={16} /> Print List
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 active:scale-95 whitespace-nowrap"
             >
               <Plus size={18} /> Add Job
             </button>
           )}
        </div>
      </div>

      {/* Summary Stats - More Curvy */}
      {/* Mobile & Tablet: Compact 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <DollarSign size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Amount</div>
           </div>
           <div className="text-lg font-black text-stone-900 truncate">LKR {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100 shrink-0">
                 <FileText size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Jobs</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.count}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                 <Scale size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Total Weight</div>
           </div>
           <div className="text-lg font-black text-stone-900">{stats.totalWeight.toFixed(2)} ct</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                 <Sparkles size={16} />
              </div>
              <div className="text-[9px] font-black text-stone-400 uppercase tracking-wider truncate">Avg/Carat</div>
           </div>
           <div className="text-lg font-black text-stone-900">LKR {stats.avgPerCarat.toFixed(2)}</div>
        </div>
      </div>

      {/* Desktop Only: Original Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Amount</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.totalAmount.toLocaleString()}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Jobs</div>
              <div className="text-2xl font-black text-stone-900">{stats.count}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
              <FileText size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Weight</div>
              <div className="text-2xl font-black text-stone-900">{stats.totalWeight.toFixed(2)} ct</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Scale size={28} />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
           <div>
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Avg Per Carat</div>
              <div className="text-2xl font-black text-stone-900">LKR {stats.avgPerCarat.toFixed(2)}</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Sparkles size={28} />
           </div>
        </div>
      </div>

      {/* Toolbar - More Curvy */}
      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
         <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by description, worker, code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
               />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
               <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
                  <Scissors size={14} className="text-stone-900" />
                  <select 
                     value={typeFilter}
                     onChange={(e) => setTypeFilter(e.target.value)}
                     className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[100px]"
                  >
                     <option value="all">All Types</option>
                     <option value="Cutting">Cutting</option>
                     <option value="Polishing">Polishing</option>
                  </select>
               </div>
               <button className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] text-stone-500 hover:text-stone-800 transition-colors shadow-sm">
                 <Download size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Desktop Table - More Curvy */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                     <th className="p-6 pl-10">Date</th>
                     <th className="p-6">Code</th>
                     <th className="p-6">Worker</th>
                     <th className="p-6">Description</th>
                     {isMotherTab && <th className="p-6">Source</th>}
                     <th className="p-6">Type</th>
                     <th className="p-6 text-right">Weight (ct)</th>
                     <th className="p-6 text-right">Amount (LKR)</th>
                     <th className="p-6">Cash / Cheque</th>
                     <th className="p-6 text-right pr-10">Per Carat</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredItems.map(item => (
                     <tr 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-emerald-50/5 transition-colors cursor-pointer group"
                     >
                        <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="p-6">
                           <span className="font-mono text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                              {item.code}
                           </span>
                        </td>
                        <td className="p-6 font-bold text-stone-800">{item.name}</td>
                        <td className="p-6 text-stone-600 max-w-xs truncate" title={item.description}>
                           {item.description}
                        </td>
                        {isMotherTab && (
                           <td className="p-6">
                              {item.sourceModule && item.sourceTab ? (
                                 <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100" title={`${item.sourceModule} / ${item.sourceTab}`}>
                                    {item.sourceModule.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase()).join('')}
                                 </span>
                              ) : (
                                 <span className="text-stone-300">-</span>
                              )}
                           </td>
                        )}
                        <td className="p-6">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              item.type === 'Cutting' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                           }`}>
                              {item.type || '-'}
                           </span>
                        </td>
                        <td className="p-6 text-right font-mono font-black text-stone-700">{item.weight.toFixed(2)} ct</td>
                        <td className="p-6 text-right">
                           <div className="font-black text-stone-900">
                              LKR {item.amount.toLocaleString()}
                           </div>
                        </td>
                        <td className="p-6">
                           {item.paymentMethod ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-stone-50 text-stone-700 border-stone-200">
                                 {item.paymentMethod}
                              </span>
                           ) : (
                              <span className="text-stone-300">-</span>
                           )}
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="font-black text-emerald-600">
                              LKR {item.perCaratCost?.toFixed(2) || '-'}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredItems.length === 0 && (
               <div className="p-16 text-center text-stone-400">No cut & polish jobs found.</div>
            )}
         </div>
      </div>

      {/* Mobile/Tablet Cards - More Curvy */}
      <div className="lg:hidden space-y-4 mb-24">
         {filteredItems.map(item => (
            <div 
               key={item.id}
               onClick={() => setSelectedItem(item)}
               className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[60px] -mr-16 -mt-16 opacity-30 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                     </span>
                     <h3 className="font-black text-stone-900 text-lg">{item.description}</h3>
                  </div>
                  <span className="font-mono text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                     {item.code}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-stone-600 mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                     <User size={14} className="text-stone-400" />
                     <span className="truncate font-medium">{item.name}</span>
                  </div>
                  {item.type && (
                     <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                           item.type === 'Cutting' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                           {item.type}
                        </span>
                     </div>
                  )}
                  {isMotherTab && item.sourceModule && item.sourceTab && (
                     <div className="flex items-center gap-2 col-span-2">
                        <span className="text-[10px] text-stone-400 uppercase">Source:</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-100">
                           {item.sourceModule.replace('-', ' ')} / {item.sourceTab}
                        </span>
                     </div>
                  )}
                  <div className="flex items-center gap-2">
                     <Scale size={14} className="text-stone-400" />
                     <span className="font-mono">{item.weight.toFixed(2)} ct</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Sparkles size={14} className="text-stone-400" />
                     <span className="font-mono">LKR {item.perCaratCost?.toFixed(2) || '-'}/ct</span>
                  </div>
                  {item.paymentMethod && (
                     <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-stone-400" />
                        <span className="text-stone-600">{item.paymentMethod}</span>
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-stone-100 flex justify-between items-center relative z-10">
                  <div>
                     <div className="text-xs text-stone-400 font-medium mb-1">Total Amount</div>
                     <div className="text-xl font-black text-emerald-600">LKR {item.amount.toLocaleString()}</div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Side Panel */}
      {selectedItem && (
         <CutPolishDetailPanel 
            expense={selectedItem} 
            initialIsEditing={selectedItem.id.startsWith('new-')} 
            onClose={() => setSelectedItem(null)} 
            onSave={handleSaveFromPanel} 
            onDelete={handleDeleteFromPanel}
            isReadOnly={isReadOnly}
         />
      )}

      {/* Form Modal */}
      {isFormOpen && (
         <CutPolishExpenseForm 
            initialData={editingItem}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
         />
      )}
    </div>
  );
};

// --- Form Component ---
const CutPolishExpenseForm: React.FC<{
  initialData: CutPolishExpenseItem | null;
  onSave: (item: CutPolishExpenseItem) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CutPolishExpenseItem>>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    weight: initialData?.weight || 0,
    amount: initialData?.amount || 0,
    currency: 'LKR',
    type: initialData?.type || 'Cutting',
    company: initialData?.company || '',
    paymentMethod: initialData?.paymentMethod || '',
    perCaratCost: initialData?.perCaratCost,
  });

  // Auto-calculate per-carat cost
  useEffect(() => {
    if (formData.weight && formData.amount && formData.weight > 0) {
      const perCarat = Number((formData.amount / formData.weight).toFixed(2));
      if (perCarat !== formData.perCaratCost) {
        setFormData(prev => ({...prev, perCaratCost: perCarat}));
      }
    }
  }, [formData.amount, formData.weight]);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.name || !formData.weight) {
      return alert('Description, Amount, Worker Name, and Weight are required');
    }
    
    onSave({
      id: initialData?.id || `cp-${Date.now()}`,
      date: formData.date!,
      code: formData.code || `CP-${Date.now().toString().slice(-4)}`,
      name: formData.name!,
      description: formData.description!,
      weight: Number(formData.weight),
      amount: Number(formData.amount),
      currency: formData.currency || 'LKR',
      perCaratCost: formData.perCaratCost,
      type: formData.type,
      company: formData.company,
      paymentMethod: formData.paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
             <h3 className="text-xl font-bold text-stone-900">{initialData ? 'Edit Job' : 'New Cut & Polish Job'}</h3>
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
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Code</label>
                   <input 
                      type="text" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                      placeholder="CP-001"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Worker/Cutter *</label>
                   <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                      placeholder="Worker name"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Type</label>
                   <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value as 'Cutting' | 'Polishing'})}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                   >
                      <option value="Cutting">Cutting</option>
                      <option value="Polishing">Polishing</option>
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Description *</label>
                <textarea 
                   rows={3}
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" 
                   placeholder="Job description..."
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Weight (ct) *</label>
                   <input 
                      type="number" 
                      step="0.01"
                      value={formData.weight} 
                      onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Amount (LKR) *</label>
                   <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                      placeholder="0.00"
                   />
                </div>
             </div>

             {formData.weight > 0 && formData.amount > 0 && formData.perCaratCost && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                   <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Per Carat Calculation</div>
                   <div className="text-lg font-black text-emerald-700">
                      LKR {formData.perCaratCost.toFixed(2)} per carat
                   </div>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Company</label>
                   <input 
                      type="text" 
                      value={formData.company} 
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" 
                      placeholder="Optional"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Cash / Cheque</label>
                   <select 
                      value={formData.paymentMethod || ''} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full p-3 md:p-2.5 py-3 md:py-2.5 min-h-[44px] md:min-h-0 text-base md:text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                   >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
             <button onClick={onCancel} className="px-6 py-3 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Job
             </button>
          </div>
       </div>
    </div>
  );
};

