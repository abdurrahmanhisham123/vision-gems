
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
import { TsvSoldTemplate } from './templates/TsvSoldTemplate';
import { TsvBKKTemplate } from './templates/TsvBKKTemplate';
import { MixSemiBKKTemplate } from './templates/MixSemiBKKTemplate';
import { SpinelBKKTemplate } from './templates/SpinelBKKTemplate';
import { SapphireBKKTemplate } from './templates/SapphireBKKTemplate';
import { RuBkk1Template } from './templates/RuBkk1Template';
import { RuBkk2Template } from './templates/RuBkk2Template';
import { RuBkk160425Template } from './templates/RuBkk160425Template';
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
import { CutPolishTemplate } from './templates/CutPolishTemplate';
import { AllExpensesDashboardTemplate } from './templates/AllExpensesDashboardTemplate';
import { VGExpensesTemplate } from './templates/VGExpensesTemplate'; 
import { ClassicTravelTemplate } from './templates/ClassicTravelTemplate'; 
import { SLExpensesTemplate } from './templates/SLExpensesTemplate';
import { BKKTicketsTemplate } from './templates/BKKTicketsTemplate'; 
import { BKKExpensesTemplate } from './templates/BKKExpensesTemplate';
import { BKKApartmentTemplate } from './templates/BKKApartmentTemplate';
import { BKKExportChargeTemplate } from './templates/BKKExportChargeTemplate';
import { BKKCapitalTemplate } from './templates/BKKCapitalTemplate';
import { BKKPaymentTemplate } from './templates/BKKPaymentTemplate';
import { BKKStatementTemplate } from './templates/BKKStatementTemplate';
import { OnlineTicketsTemplate } from './templates/OnlineTicketsTemplate';
import { OfficeExpensesTemplate } from './templates/OfficeExpensesTemplate';
import { SGPaymentReceivedTemplate } from './templates/SGPaymentReceivedTemplate';
import { InStocksCategoryTemplate } from './templates/InStocksCategoryTemplate';
import { PayableDashboardTemplate } from './templates/PayableDashboardTemplate';
import { GemLicenseTemplate } from './templates/GemLicenseTemplate';
import { AuditAccountsTemplate } from './templates/AuditAccountsTemplate';
import { PartnerSharesTemplate } from './templates/PartnerSharesTemplate';
import { ZahranLedgerTemplate } from './templates/ZahranLedgerTemplate';
import { BangkokLedgerTemplate } from './templates/BangkokLedgerTemplate';
import { PaymentReceivedTemplate } from './templates/PaymentReceivedTemplate';
import { SupplierLedgerTemplate } from './templates/SupplierLedgerTemplate';
import { KenyaExportTemplate } from './templates/KenyaExportTemplate';
import { KenyaTravelingTemplate } from './templates/KenyaTravelingTemplate';
import { KenyaPurchasingTemplate } from './templates/KenyaPurchasingTemplate';
import { KenyaExpenseTemplate } from './templates/KenyaExpenseTemplate';
import { KenyaCapitalTemplate } from './templates/KenyaCapitalTemplate';
import { PaymentDueDateTemplate } from './templates/PaymentDueDateTemplate';
import { GeneralExpensesTemplate } from './templates/GeneralExpensesTemplate';
import { CutPolishExpensesTemplate } from './templates/CutPolishExpensesTemplate';

import { 
  Eye, Settings2, X, ArrowUp, ArrowDown, 
  GripVertical, Plus, Trash2, 
  ChevronRight, ChevronLeft, LayoutPanelLeft,
  FolderClosed, FolderOpen,
  Gem, Wallet, DollarSign, List, ArrowLeft, CheckCircle2, ArrowRightLeft, Scissors
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
    if (templateType === 'PayableDashboard') return < PayableDashboardTemplate {...props} />;
    if (templateType === 'CutPolish') return <CutPolishTemplate {...props} />;
    if (templateType === 'VGOldStock') return <VGOldStockTemplate />;
    if (templateType === 'VisionGemsSpinel') return <VisionGemsSpinelTemplate {...props} />;
    if (templateType === 'VGExpenses') return <VGExpensesTemplate {...props} />;
    if (templateType === 'ClassicTravel') return <ClassicTravelTemplate />;
    if (templateType === 'SLExpenses') return <SLExpensesTemplate {...props} />;
    if (templateType === 'BKKTickets') return <BKKTicketsTemplate {...props} />;
    if (templateType === 'BKKExpenses') return <BKKExpensesTemplate {...props} />;
    if (templateType === 'BKKApartment') return <BKKApartmentTemplate {...props} />;
    if (templateType === 'BKKExportCharge') return <BKKExportChargeTemplate {...props} />;
    if (templateType === 'BKKCapital') return <BKKCapitalTemplate {...props} />;
    if (templateType === 'BKKPayment') return <BKKPaymentTemplate {...props} />;
    if (templateType === 'BKKStatement') return <BKKStatementTemplate {...props} />;
    if (templateType === 'OnlineTickets') return <OnlineTicketsTemplate {...props} />;
    if (templateType === 'OfficeExpenses') return <OfficeExpensesTemplate {...props} />;
    if (templateType === 'SGPaymentReceived') return <SGPaymentReceivedTemplate {...props} />;
    if (templateType === 'InStocksCategory') return <InStocksCategoryTemplate {...props} />;
    if (templateType === 'GemLicense') return <GemLicenseTemplate {...props} />;
    if (templateType === 'AuditAccounts') return <AuditAccountsTemplate {...props} />;
    if (templateType === 'PartnerShares') return <PartnerSharesTemplate {...props} />;
    if (templateType === 'ZahranLedger') return <ZahranLedgerTemplate {...props} />;
    if (templateType === 'BangkokLedger') return <BangkokLedgerTemplate {...props} />;
    if (templateType === 'PaymentReceived') return <PaymentReceivedTemplate {...props} />;
    if (templateType === 'SupplierLedger') return <SupplierLedgerTemplate {...props} />;
    if (templateType === 'KenyaExport') return <KenyaExportTemplate />;
    if (templateType === 'KenyaTraveling') return <KenyaTravelingTemplate />;
    if (templateType === 'KenyaPurchasing') return <KenyaPurchasingTemplate {...props} />;
    if (templateType === 'KenyaExpense') return <KenyaExpenseTemplate {...props} />;
    if (templateType === 'KenyaCapital') return <KenyaCapitalTemplate {...props} />;
    if (templateType === 'PaymentDueDate') return <PaymentDueDateTemplate {...props} />;
    if (templateType === 'GeneralExpenses') return <GeneralExpensesTemplate {...props} />;
    if (templateType === 'CutPolishExpenses') return <CutPolishExpensesTemplate {...props} />;

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
      case 'TsvSold': return <TsvSoldTemplate {...props} />;
      case 'TsvBKK': return <TsvBKKTemplate {...props} />;
      case 'MixSemiBKK': return <MixSemiBKKTemplate {...props} />;
      case 'SpinelBKK': return <SpinelBKKTemplate {...props} />;
      case 'SapphireBKK': return <SapphireBKKTemplate {...props} />;
      case 'RuBkk1': return <RuBkk1Template {...props} />;
      case 'RuBkk2': return <RuBkk2Template {...props} />;
      case 'RuBkk160425': return <RuBkk160425Template {...props} />;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 p-8">
             <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                <div>
                   <h3 className="font-bold text-2xl text-stone-900">{addTabStep === 1 ? 'Choose UI Blueprint' : 'Configure New Tab'}</h3>
                   <p className="text-sm text-stone-500 mt-1">{addTabStep === 1 ? 'Select a layout template for your data.' : `Naming your ${selectedTemplate?.replace(/([A-Z])/g, ' $1').trim()} tab.`}</p>
                </div>
                <button onClick={() => setIsAddTabOpen(false)} className="p-2 rounded-full hover:bg-stone-100 text-stone-400"><X size={24} /></button>
             </div>
             
             {addTabStep === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                      { id: 'VisionGemsSpinel', name: 'Rich Inventory (Template 1)', desc: 'Full 41-column master inventory with multi-currency & rich details.', icon: <Gem className="text-purple-600"/> },
                      { id: 'VGExpenses', name: 'VG Style Ledger', desc: 'Consolidated financial ledger with IN/OUT/CHECKS categories.', icon: <ArrowRightLeft className="text-emerald-600"/> },
                      { id: 'GeneralExpenses', name: 'General Expenses', desc: 'Operational expense tracking with multi-currency support and location tracking.', icon: <Wallet className="text-red-600"/> },
                      { id: 'CutPolishExpenses', name: 'Cut & Polish Expenses', desc: 'Track cutting and polishing jobs with weight-based calculations and per-carat costs.', icon: <Scissors className="text-purple-600"/> },
                      { id: 'ExpenseLog', name: 'Expense Ledger', desc: 'Financial tracking with currency conversion and vendor logging.', icon: <Wallet className="text-red-600"/> },
                      { id: 'SupplierPayable', name: 'Payable Ledger', desc: 'Track buying payments, supplier debts and settlements.', icon: <DollarSign className="text-amber-600"/> },
                      { id: 'SimpleList', name: 'Standard List', desc: 'Simple list view for reference data and basic collections.', icon: <List className="text-blue-600"/> },
                   ].map(tpl => (
                      <button 
                        key={tpl.id}
                        onClick={() => { setSelectedTemplate(tpl.id as any); setAddTabStep(2); }}
                        className="flex items-start gap-4 p-5 rounded-2xl border-2 border-stone-100 hover:border-gem-purple hover:bg-purple-50/50 transition-all text-left group"
                      >
                         <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform">{tpl.icon}</div>
                         <div className="flex-1">
                            <div className="font-bold text-stone-900 group-hover:text-gem-purple transition-colors">{tpl.name}</div>
                            <div className="text-xs text-stone-500 mt-1 leading-relaxed">{tpl.desc}</div>
                         </div>
                         <ChevronRight size={20} className="text-stone-300 group-hover:text-gem-purple mt-1" />
                      </button>
                   ))}
                </div>
             ) : (
                <div className="space-y-8 py-4">
                   <button onClick={() => setAddTabStep(1)} className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest"><ArrowLeft size={14}/> Back to Templates</button>
                   
                   <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gem-purple"><LayoutPanelLeft size={32}/></div>
                      <div>
                         <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Blueprint Selected</div>
                         <div className="text-lg font-bold text-stone-800">{selectedTemplate?.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                      <div className="ml-auto"><CheckCircle2 className="text-emerald-500" size={24}/></div>
                   </div>

                   <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">New Tab Identity</label>
                      <input 
                        type="text" 
                        value={newTabName} 
                        onChange={(e) => setNewTabName(e.target.value)} 
                        className="w-full p-5 border-2 border-stone-200 rounded-2xl bg-white text-xl font-bold text-stone-900 focus:outline-none focus:border-gem-purple focus:ring-4 focus:ring-gem-purple/5 transition-all shadow-sm" 
                        placeholder="e.g. November Sales" 
                        autoFocus 
                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddTab(); }}
                      />
                   </div>
                   
                   <button onClick={handleAddTab} disabled={!newTabName.trim()} className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-stone-900/20 hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-30">Create Dynamic Tab</button>
                </div>
             )}
          </div>
        </div>
      )}

      {isReorderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-sm flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-2xl">
              <div><h3 className="font-bold text-stone-900">Organize Tabs</h3><p className="text-xs text-stone-500">Reorder sub-menus</p></div>
              <button onClick={() => setIsReorderOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {orderedTabs.map((tab, idx) => (
                <div key={tab} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-gem-purple/30 group">
                  <div className="flex items-center gap-3 overflow-hidden"><div className="text-stone-300 cursor-grab active:cursor-grabbing shrink-0"><GripVertical size={16} /></div><span className="font-medium text-stone-700 text-sm truncate">{tab}</span></div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => moveTab(idx, 'up')} disabled={idx === 0} className="p-1.5 rounded-lg text-stone-400 hover:text-gem-purple hover:bg-stone-50 disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button onClick={() => moveTab(idx, 'down')} disabled={idx === orderedTabs.length - 1} className="p-1.5 rounded-lg text-stone-400 hover:text-gem-purple hover:bg-stone-50 disabled:opacity-30"><ArrowDown size={16} /></button>
                    {customTabs.includes(tab) && <button onClick={() => handleDeleteTab(tab)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 ml-1"><Trash2 size={16} /></button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl"><button onClick={() => setIsReorderOpen(false)} className="w-full py-2.5 bg-gem-purple text-white rounded-xl font-bold text-sm shadow-purple">Done</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
