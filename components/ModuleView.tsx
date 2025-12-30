
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APP_MODULES } from '../constants';
import { getTemplateForTab, TemplateType, saveCustomTabTemplate } from '../utils/templateMapping';
import { getInventoryConfig } from '../utils/inventoryConfig';
import { getBatchConfig } from '../utils/batchPurchaseConfig';
import { getMixedInventoryConfig } from '../utils/mixedInventoryConfig';
import { getExpenseConfig } from '../utils/expenseConfig';
import { getFinancialConfig } from '../utils/financialConfig';
import { getDashboardConfig } from '../utils/dashboardConfig';
import { getCustomerLedgerConfig } from '../utils/customerLedgerConfig';
import { getPayableConfig } from '../utils/payableConfig';
import { getExportConfig } from '../utils/exportConfig';
import { getWorkingSheetConfig } from '../utils/workingSheetConfig';
import { getSpecializedRecordConfig } from '../utils/specializedRecordConfig';
import { getPurchasingConfig } from '../utils/purchasingConfig';
import { getReferenceDataConfig } from '../utils/referenceDataConfig';

// Import Templates
import { InventoryTemplate, SimpleListTemplate } from './templates/InventoryTemplates';
import { DashboardTemplate } from './templates/DashboardTemplate'; 
import { KPIDashboardTemplate } from './templates/KPIDashboardTemplate'; 
import { FinancialCapitalTemplate, ExpenseTrackingTemplate, PaymentTrackingTemplate, StatementReportTemplate } from './templates/FinancialTemplates';
import { PurchaseJobTemplate, ExportInvoiceTemplate, TravelTicketsTemplate } from './templates/OperationalTemplates';
import { LotBasedInventoryTemplate } from './templates/LotBasedInventoryTemplate';
import { BatchPurchaseTemplate } from './templates/BatchPurchaseTemplate';
import { MixedInventoryTemplate } from './templates/MixedInventoryTemplate';
import { ChinaTemplate } from './templates/ChinaTemplate';
import { ExportInvoiceMaster } from './templates/ExportInvoiceMaster';
import { ExpenseLogTemplate } from './templates/ExpenseLogTemplate';
import { CapitalManagementTemplate } from './templates/CapitalManagementTemplate';
import { CustomerLedgerTemplate } from './templates/CustomerLedgerTemplate';
import { SupplierPayableTemplate } from './templates/SupplierPayableTemplate';
import { ExportRecordsTemplate } from './templates/ExportRecordsTemplate';
import { PurchasingRecordsTemplate } from './templates/PurchasingRecordsTemplate';
import { ReferenceDataTemplate } from './templates/ReferenceDataTemplate';
import { WorkingSheetTemplate } from './templates/WorkingSheetTemplate';
import { SpecializedRecordTemplate } from './templates/SpecializedRecordTemplate';
import { VisionGemsSpinelTemplate } from './templates/VisionGemsSpinelTemplate';
import { VGOldStockTemplate } from './templates/VGOldStockTemplate';
import { AllExpensesDashboardTemplate } from './templates/AllExpensesDashboardTemplate';
import { BKKExportChargeTemplate } from './templates/BKKExportChargeTemplate';
import { BKKCapitalTemplate } from './templates/BKKCapitalTemplate';
import { PayableDashboardTemplate } from './templates/PayableDashboardTemplate';
import { SupplierLedgerTemplate } from './templates/SupplierLedgerTemplate';
import { PaymentDueDateTemplate } from './templates/PaymentDueDateTemplate';
import { CutPolishExpensesTemplate } from './templates/CutPolishExpensesTemplate';
import { TicketsVisaTemplate } from './templates/TicketsVisaTemplate';
import { SpecificServicesTemplate } from './templates/SpecificServicesTemplate';
import { HotelAccommodationTemplate } from './templates/HotelAccommodationTemplate';
import { UnifiedCapitalManagementTemplate } from './templates/UnifiedCapitalManagementTemplate';
import { UnifiedPaymentLedgerTemplate } from './templates/UnifiedPaymentLedgerTemplate';
import { UnifiedExpenseTemplate } from './templates/UnifiedExpenseTemplate';
import { UnifiedDashboardTemplate } from './templates/UnifiedDashboardTemplate';
import { UnifiedPurchasingTemplate } from './templates/UnifiedPurchasingTemplate';
import { UnifiedExportTemplate } from './templates/UnifiedExportTemplate';
import { UnifiedStatementTemplate } from './templates/UnifiedStatementTemplate';
import { DealRecordTemplate } from './templates/DealRecordTemplate';

import { 
  Eye, Settings2, X, ArrowUp, ArrowDown, 
  GripVertical, Plus, Trash2, 
  ChevronRight, ChevronLeft, LayoutPanelLeft,
  FolderClosed, FolderOpen,
  Gem, Wallet, DollarSign, List, ArrowLeft, CheckCircle2, ArrowRightLeft, Scissors, Ticket, User, Briefcase, Hotel, Package, TrendingUp, CreditCard, ShoppingBag, Plane, FileText, ClipboardList, Handshake
} from 'lucide-react';

export const ModuleView: React.FC = () => {
  const { moduleId, tabId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const module = APP_MODULES.find(m => m.id === moduleId);

  // --- Tab State ---
  const [orderedTabs, setOrderedTabs] = useState<string[]>([]);
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  
  // --- UI State ---
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);
  const [addTabStep, setAddTabStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [newTabName, setNewTabName] = useState('');
  
  // --- Drag and Drop State ---
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // --- Outstanding Group State ---
  const [isSLGroupExpanded, setIsSLGroupExpanded] = useState(() => {
    const saved = localStorage.getItem('vg_sl_group_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  // Persist expansion state
  useEffect(() => {
    localStorage.setItem('vg_sl_group_expanded', String(isSLGroupExpanded));
  }, [isSLGroupExpanded]);

  // --- Load Tabs & Order ---
  useEffect(() => {
    if (!module) return;

    const savedCustomTabsJson = localStorage.getItem(`custom_tabs_${moduleId}`);
    let localCustomTabs: string[] = [];
    if (savedCustomTabsJson) {
      try { localCustomTabs = JSON.parse(savedCustomTabsJson); } catch (e) {}
    }
    setCustomTabs(localCustomTabs);

    const allTabs = [...module.tabs, ...localCustomTabs];

    const savedOrderJson = localStorage.getItem(`tab_order_${moduleId}`);
    let finalOrder = allTabs;

    if (savedOrderJson) {
      try {
        const savedOrder = JSON.parse(savedOrderJson);
        const validSaved = savedOrder.filter((t: string) => allTabs.includes(t));
        finalOrder = [...validSaved, ...allTabs.filter(t => !savedOrder.includes(t))];
      } catch (e) {}
    }
    setOrderedTabs(finalOrder);
  }, [moduleId, module]);

  // Auto Scroll to Top on Tab Change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [tabId, moduleId]);

  // --- Handlers ---
  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newTabs = [...orderedTabs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newTabs.length) {
      [newTabs[index], newTabs[targetIndex]] = [newTabs[targetIndex], newTabs[index]];
      setOrderedTabs(newTabs);
      localStorage.setItem(`tab_order_${moduleId}`, JSON.stringify(newTabs));
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTabs = [...orderedTabs];
    const draggedTab = newTabs[draggedIndex];
    newTabs.splice(draggedIndex, 1);
    newTabs.splice(dropIndex, 0, draggedTab);
    
    setOrderedTabs(newTabs);
    localStorage.setItem(`tab_order_${moduleId}`, JSON.stringify(newTabs));
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddTab = () => {
    if (!newTabName.trim() || !selectedTemplate) return;
    const name = newTabName.trim();
    if (orderedTabs.includes(name)) {
      alert('A tab with this name already exists.');
      return;
    }
    
    // Save dynamic template assignment
    saveCustomTabTemplate(moduleId!, name, selectedTemplate);

    const updatedCustomTabs = [...customTabs, name];
    setCustomTabs(updatedCustomTabs);
    localStorage.setItem(`custom_tabs_${moduleId}`, JSON.stringify(updatedCustomTabs));
    
    const updatedOrder = [...orderedTabs, name];
    setOrderedTabs(updatedOrder);
    localStorage.setItem(`tab_order_${moduleId}`, JSON.stringify(updatedOrder));
    
    setIsAddTabOpen(false);
    setNewTabName('');
    setAddTabStep(1);
    setSelectedTemplate(null);
    navigate(`/module/${moduleId}/${name}`);
  };

  const handleDeleteTab = (tabToDelete: string) => {
    if (!confirm(`Delete tab "${tabToDelete}"?`)) return;
    const updatedCustomTabs = customTabs.filter(t => t !== tabToDelete);
    setCustomTabs(updatedCustomTabs);
    localStorage.setItem(`custom_tabs_${moduleId}`, JSON.stringify(updatedCustomTabs));
    const updatedOrder = orderedTabs.filter(t => t !== tabToDelete);
    setOrderedTabs(updatedOrder);
    localStorage.setItem(`tab_order_${moduleId}`, JSON.stringify(updatedOrder));
    if (tabId === tabToDelete) navigate(`/module/${moduleId}/${updatedOrder[0] || module?.tabs[0]}`);
  };

  // --- Render Template Logic ---
  if (!module || !tabId) return <div>Module not found</div>;

  const templateType: TemplateType = getTemplateForTab(moduleId!, tabId!);
  const isReadOnly = module.type === 'readonly';

  const renderTemplate = () => {
    const props = { moduleId: moduleId!, tabId: tabId!, isReadOnly };
    if (templateType === 'AllExpensesDashboard') {
        const dashboardConfig = getDashboardConfig(moduleId!, tabId!);
        if (dashboardConfig) return <AllExpensesDashboardTemplate config={dashboardConfig} {...props} />;
        return <div className="p-8 text-center text-red-500">Configuration not found</div>;
    }
    if (templateType === 'PayableDashboard') return <PayableDashboardTemplate {...props} />;
    if (templateType === 'VGOldStock') return <VGOldStockTemplate />;
    if (templateType === 'VisionGemsSpinel') return <VisionGemsSpinelTemplate {...props} />;
    if (templateType === 'BKKExportCharge') return <BKKExportChargeTemplate {...props} />;
    if (templateType === 'BKKCapital') return <BKKCapitalTemplate {...props} />;
    if (templateType === 'SupplierLedger') return <SupplierLedgerTemplate {...props} />;
    if (templateType === 'PaymentDueDate') return <PaymentDueDateTemplate {...props} />;
    if (templateType === 'CutPolishExpenses') return <CutPolishExpensesTemplate {...props} />;
    if (templateType === 'TicketsVisa') return <TicketsVisaTemplate {...props} />;
    if (templateType === 'SpecificServices') return <SpecificServicesTemplate {...props} />;
    if (templateType === 'HotelAccommodation') return <HotelAccommodationTemplate {...props} />;
    if (templateType === 'UnifiedCapitalManagement') return <UnifiedCapitalManagementTemplate {...props} />;
    if (templateType === 'UnifiedPaymentLedger') return <UnifiedPaymentLedgerTemplate {...props} />;
    if (templateType === 'UnifiedExpense') return <UnifiedExpenseTemplate {...props} />;
    if (templateType === 'UnifiedDashboard') return <UnifiedDashboardTemplate {...props} />;
    if (templateType === 'UnifiedPurchasing') return <UnifiedPurchasingTemplate {...props} />;
    if (templateType === 'UnifiedExport') return <UnifiedExportTemplate {...props} />;
    if (templateType === 'UnifiedStatement') return <UnifiedStatementTemplate {...props} />;
    if (templateType === 'DealRecord') return <DealRecordTemplate {...props} />;

    const specializedConfig = getSpecializedRecordConfig(moduleId!, tabId!);
    if (specializedConfig) return <SpecializedRecordTemplate config={specializedConfig} {...props} />;
    const workingSheetConfig = getWorkingSheetConfig(moduleId!, tabId!);
    if (workingSheetConfig) return <WorkingSheetTemplate config={workingSheetConfig} {...props} />;
    const referenceConfig = getReferenceDataConfig(moduleId!, tabId!);
    if (referenceConfig) return <ReferenceDataTemplate config={referenceConfig} {...props} />;
    const dashboardConfig = getDashboardConfig(moduleId!, tabId!);
    if (dashboardConfig) return <KPIDashboardTemplate config={dashboardConfig} {...props} />;
    const ledgerConfig = getCustomerLedgerConfig(moduleId!, tabId!);
    if (ledgerConfig) return <CustomerLedgerTemplate config={ledgerConfig} {...props} />;
    const payableConfig = getPayableConfig(moduleId!, tabId!);
    if (payableConfig) return <SupplierPayableTemplate config={payableConfig} {...props} />;
    const exportConfig = getExportConfig(moduleId!, tabId!);
    if (exportConfig) return <ExportRecordsTemplate config={exportConfig} {...props} />;
    const purchasingConfig = getPurchasingConfig(moduleId!, tabId!);
    if (purchasingConfig) return <PurchasingRecordsTemplate config={purchasingConfig} {...props} />;
    const financialConfig = getFinancialConfig(moduleId!, tabId!);
    if (financialConfig) return <CapitalManagementTemplate config={financialConfig} {...props} />;
    const expenseConfig = getExpenseConfig(moduleId!, tabId!);
    if (expenseConfig) return <ExpenseLogTemplate config={expenseConfig} {...props} />;
    const mixedConfig = getMixedInventoryConfig(moduleId!, tabId!);
    if (mixedConfig) return <MixedInventoryTemplate config={mixedConfig} {...props} />;
    const batchConfig = getBatchConfig(moduleId!, tabId!);
    if (batchConfig) return <BatchPurchaseTemplate config={batchConfig} {...props} />;
    const inventoryConfig = getInventoryConfig(moduleId!, tabId!);
    if (inventoryConfig) return <LotBasedInventoryTemplate config={inventoryConfig} {...props} />;

    switch (templateType) {
      case 'ExportInvoiceMaster': return <ExportInvoiceMaster {...props} />;
      case 'Inventory': return <InventoryTemplate {...props} />;
      case 'Dashboard': return <DashboardTemplate {...props} />;
      case 'FinancialCapital': return <FinancialCapitalTemplate {...props} />;
      case 'ExpenseTracking': return <ExpenseTrackingTemplate {...props} />;
      case 'PurchaseJob': return <PurchaseJobTemplate {...props} />;
      case 'ExportInvoice': return <ExportInvoiceTemplate {...props} />;
      case 'PaymentTracking': return <PaymentTrackingTemplate {...props} />;
      case 'TravelTickets': return <TravelTicketsTemplate {...props} />;
      case 'StatementReport': return <StatementReportTemplate {...props} />;
      case 'SimpleList': return <SimpleListTemplate {...props} />;
      case 'China': return <ChinaTemplate {...props} />;
      default: return <InventoryTemplate {...props} />;
    }
  };

  const renderTabItems = () => {
    const items: React.ReactNode[] = [];
    const isOutstanding = moduleId === 'outstanding';
    const slStartIndex = isOutstanding ? orderedTabs.findIndex(t => t === 'Payment Due Date') : -1;
    const althafIdx = isOutstanding ? orderedTabs.findIndex(t => t.toLowerCase() === 'althafhaj') : -1;
    const currentIdx = orderedTabs.indexOf(tabId || '');
    const isCurrentTabInGroup = slStartIndex !== -1 && althafIdx !== -1 && currentIdx >= slStartIndex && currentIdx <= althafIdx;

    orderedTabs.forEach((tab, index) => {
      if (isOutstanding && slStartIndex !== -1 && index === slStartIndex) {
        items.push(
          <div key="sl-group-wrapper" className="flex items-center self-center shrink-0 border-l border-stone-200 ml-4 pl-2 mr-1">
             <button onClick={() => setIsSLGroupExpanded(!isSLGroupExpanded)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group ${isSLGroupExpanded ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{isSLGroupExpanded ? <FolderOpen size={16} /> : <FolderClosed size={16} />}<span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Sri Lankan Buyers</span>{isSLGroupExpanded ? <ChevronLeft size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}</button>
             {!isSLGroupExpanded && isCurrentTabInGroup && (<div className="ml-2 px-3 py-2 bg-gem-purple/10 text-gem-purple rounded-xl border border-gem-purple/20 flex items-center gap-2 animate-in fade-in zoom-in-95"><span className="text-xs font-bold">{tabId}</span><span className="w-1.5 h-1.5 rounded-full bg-gem-gold animate-pulse"></span></div>)}
          </div>
        );
      }
      if (isOutstanding && !isSLGroupExpanded && slStartIndex !== -1 && althafIdx !== -1 && index >= slStartIndex && index <= althafIdx) return;
      const isActive = tabId === tab;
      items.push(<button key={tab} onClick={() => navigate(`/module/${module.id}/${tab}`)} className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${isActive ? 'text-gem-purple font-bold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 rounded-t-lg'}`}>{tab}{isActive && (<span className="absolute bottom-0 left-0 w-full h-0.5 bg-gem-gold shadow-[0_-2px_6px_rgba(217,119,6,0.4)]"></span>)}{isActive && (<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gem-gold"></span>)}</button>);
      if (isOutstanding && index === althafIdx && isSLGroupExpanded) items.push(<div key="group-end-divider" className="flex items-center self-center shrink-0 px-2"><div className="w-px h-6 bg-stone-200"></div></div>);
    });
    return items;
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center">
        <div className="flex-1 overflow-x-auto hide-scrollbar px-4 pt-1 flex">{renderTabItems()}</div>
        <div className="flex items-center h-full border-l border-stone-100 bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10"><button onClick={() => { setAddTabStep(1); setIsAddTabOpen(true); }} className="p-3 text-stone-400 hover:text-gem-purple hover:bg-stone-50 transition-colors" title="Add New Tab"><Plus size={18} /></button><div className="w-px h-6 bg-stone-200 mx-1"></div><button onClick={() => setIsReorderOpen(true)} className="p-3 text-stone-400 hover:text-gem-purple hover:bg-stone-50 transition-colors" title="Organize Tabs"><Settings2 size={18} /></button></div>
      </div>

      <div ref={contentRef} className="flex-1 bg-stone-50 min-h-0 overflow-y-auto custom-scrollbar">{isReadOnly && (<div className="mx-6 mt-6 mb-2 bg-stone-100 text-stone-500 border border-stone-200 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 tracking-wide uppercase"><Eye size={14} /> View Only Access</div>)}{renderTemplate()}</div>

      {isAddTabOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 p-4 md:p-8">
             <div className="flex justify-between items-start md:items-center mb-4 md:mb-8 border-b border-stone-100 pb-4 md:pb-6 shrink-0">
                <div className="flex-1 min-w-0 pr-2">
                   <h3 className="font-bold text-lg md:text-2xl text-stone-900">{addTabStep === 1 ? 'Choose UI Blueprint' : 'Configure New Tab'}</h3>
                   <p className="text-xs md:text-sm text-stone-500 mt-1">{addTabStep === 1 ? 'Select a layout template for your data.' : `Naming your ${selectedTemplate?.replace(/([A-Z])/g, ' $1').trim()} tab.`}</p>
                </div>
                <button onClick={() => setIsAddTabOpen(false)} className="p-2 rounded-full hover:bg-stone-100 text-stone-400 shrink-0"><X size={20} className="md:w-6 md:h-6" /></button>
             </div>
             
             {addTabStep === 1 ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 md:mx-0 px-4 md:px-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-4">
                   {[
                      { id: 'VisionGemsSpinel', name: 'Rich Inventory (Template 1)', desc: 'Full 41-column master inventory with multi-currency & rich details.', icon: <Gem className="text-purple-600"/> },
                      { id: 'CutPolishExpenses', name: 'Cut & Polish Expenses', desc: 'Track cutting and polishing jobs with weight-based calculations and per-carat costs.', icon: <Scissors className="text-emerald-600"/> },
                      { id: 'TicketsVisa', name: 'Tickets & Visa', desc: 'Track flight tickets and visa expenses with route, airline, and visa type tracking.', icon: <Ticket className="text-cyan-600"/> },
                      { id: 'SpecificServices', name: 'Specific Services', desc: 'Track service expenses like travel, office rent, licenses, and accounting with vendor tracking.', icon: <Briefcase className="text-orange-600"/> },
                      { id: 'HotelAccommodation', name: 'Hotel & Accommodation', desc: 'Track hotel stays and accommodations with check-in/out dates, nights calculation, and cost per night.', icon: <Hotel className="text-pink-600"/> },
                      { id: 'UnifiedCapitalManagement', name: 'Unified Capital Management', desc: 'Track capital injections and investments with multi-currency support and exchange rate tracking.', icon: <TrendingUp className="text-indigo-600"/> },
                      { id: 'UnifiedPaymentLedger', name: 'Unified Payment Ledger', desc: 'Track payments received with invoice amounts, outstanding balances, and payment status tracking.', icon: <CreditCard className="text-violet-600"/> },
                      { id: 'UnifiedExpense', name: 'Unified Expense', desc: 'Comprehensive expense tracking with multi-currency support, location tracking, and configurable fields.', icon: <Wallet className="text-red-600"/> },
                      { id: 'UnifiedPurchasing', name: 'Unified Purchasing', desc: 'Track stone purchases with supplier details, weight, pieces, cost, and payment status across multiple currencies.', icon: <ShoppingBag className="text-blue-600"/> },
                      { id: 'UnifiedExport', name: 'Unified Export', desc: 'Track export transactions with company details, export types, reference numbers, destinations, and multi-currency support.', icon: <Plane className="text-sky-600"/> },
                      { id: 'UnifiedStatement', name: 'Unified Statement Report', desc: 'Consolidated bank and cash ledger tracking with company, account, location, and person tracking.', icon: <FileText className="text-violet-600"/> },
                      { id: 'DealRecord', name: 'Payment Received', desc: 'Track payments received with company, date, code, name, description, weight, deal information, and amount fields.', icon: <Handshake className="text-red-600"/> },
                   ].map(tpl => (
                      <button 
                        key={tpl.id}
                        onClick={() => { setSelectedTemplate(tpl.id as any); setAddTabStep(2); }}
                        className="flex items-start gap-3 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-stone-100 hover:border-gem-purple hover:bg-purple-50/50 transition-all text-left group active:scale-[0.98]"
                      >
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white shadow-sm border border-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">{tpl.icon}</div>
                         <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm md:text-base text-stone-900 group-hover:text-gem-purple transition-colors">{tpl.name}</div>
                            <div className="text-[10px] md:text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{tpl.desc}</div>
                         </div>
                         <ChevronRight size={18} className="text-stone-300 group-hover:text-gem-purple mt-1 shrink-0 md:w-5 md:h-5" />
                      </button>
                   ))}
                  </div>
                </div>
             ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 py-2 md:py-4">
                   <button onClick={() => setAddTabStep(1)} className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest"><ArrowLeft size={14}/> Back to Templates</button>
                   
                   <div className="bg-stone-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-stone-100 flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-gem-purple shrink-0"><LayoutPanelLeft size={24} className="md:w-8 md:h-8"/></div>
                      <div className="flex-1 min-w-0">
                         <div className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">Blueprint Selected</div>
                         <div className="text-base md:text-lg font-bold text-stone-800 truncate">{selectedTemplate?.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                      <div className="ml-auto shrink-0"><CheckCircle2 className="text-emerald-500 md:w-6 md:h-6" size={20}/></div>
                   </div>

                   <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-2 md:mb-3 ml-1">New Tab Identity</label>
                      <input 
                        type="text" 
                        value={newTabName} 
                        onChange={(e) => setNewTabName(e.target.value)} 
                        className="w-full p-4 md:p-5 border-2 border-stone-200 rounded-xl md:rounded-2xl bg-white text-lg md:text-xl font-bold text-stone-900 focus:outline-none focus:border-gem-purple focus:ring-4 focus:ring-gem-purple/5 transition-all shadow-sm" 
                        placeholder="e.g. November Sales" 
                        autoFocus 
                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddTab(); }}
                      />
                   </div>
                   
                   <button onClick={handleAddTab} disabled={!newTabName.trim()} className="w-full py-4 md:py-5 bg-stone-900 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-stone-900/20 hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-30">Create Dynamic Tab</button>
                </div>
             )}
          </div>
        </div>
      )}

      {isReorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-gradient-to-r from-stone-50 to-white rounded-t-3xl">
              <div>
                <h3 className="font-bold text-xl text-stone-900 mb-1">Organize Tabs</h3>
                <p className="text-xs text-stone-500 font-medium">Drag and drop to reorder sub-menus</p>
              </div>
              <button 
                onClick={() => {
                  setIsReorderOpen(false);
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }} 
                className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-stone-50/30">
              <div className="space-y-3">
                {orderedTabs.map((tab, idx) => {
                  const isDragging = draggedIndex === idx;
                  const isDragOver = dragOverIndex === idx;
                  const isCustom = customTabs.includes(tab);
                  
                  return (
                    <div
                      key={tab}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`
                        relative flex items-center justify-between p-4 
                        bg-white border-2 rounded-2xl shadow-sm
                        transition-all duration-200 ease-out
                        ${isDragging 
                          ? 'opacity-50 scale-95 cursor-grabbing shadow-lg border-gem-purple/50' 
                          : isDragOver 
                            ? 'border-gem-purple shadow-md scale-[1.02] bg-gem-purple/5' 
                            : 'border-stone-200 hover:border-gem-purple/40 hover:shadow-md hover:scale-[1.01]'
                        }
                        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                      `}
                    >
                      {/* Drop Indicator Line */}
                      {isDragOver && draggedIndex !== null && draggedIndex < idx && (
                        <div className="absolute -top-1.5 left-0 right-0 h-1 bg-gem-purple rounded-full animate-pulse" />
                      )}
                      {isDragOver && draggedIndex !== null && draggedIndex > idx && (
                        <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gem-purple rounded-full animate-pulse" />
                      )}
                      
                      {/* Left Side: Grip + Tab Name */}
                      <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                        <div className={`
                          text-stone-400 shrink-0 transition-colors
                          ${isDragging ? 'text-gem-purple' : 'group-hover:text-gem-purple'}
                        `}>
                          <GripVertical size={20} />
                        </div>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-bold text-stone-400 w-6 shrink-0 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-semibold text-stone-800 text-sm truncate">
                            {tab}
                          </span>
                          {isCustom && (
                            <span className="text-[10px] font-bold bg-gem-purple/10 text-gem-purple px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right Side: Delete Button */}
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        {isCustom && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTab(tab);
                            }} 
                            className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Delete tab"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-stone-100 bg-gradient-to-r from-white to-stone-50 rounded-b-3xl">
              <button 
                onClick={() => {
                  setIsReorderOpen(false);
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }} 
                className="w-full py-3.5 bg-gem-purple text-white rounded-xl font-bold text-sm shadow-lg shadow-gem-purple/30 hover:bg-gem-purple/90 hover:shadow-xl hover:shadow-gem-purple/40 transition-all duration-200 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
