import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Printer, X, FileText, Calendar,
  TrendingUp, TrendingDown, DollarSign, Filter, ArrowLeft
} from 'lucide-react';
import { getAllStatementEntries } from '../services/statementService';
import { StatementEntry } from '../types';
import { APP_MODULES } from '../constants';
import { Link } from 'react-router-dom';

export const StatementView: React.FC = () => {
  const [entries, setEntries] = useState<StatementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<StatementEntry | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const allEntries = getAllStatementEntries();
      setEntries(allEntries);
    } catch (e) {
      console.error('Failed to load statement entries:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get unique modules and types for filters
  const uniqueModules = useMemo(() => {
    const modules = Array.from(new Set(entries.map(e => e.moduleName))).sort();
    return modules;
  }, [entries]);

  const uniqueTypes = useMemo(() => {
    const types = Array.from(new Set(entries.map(e => e.transactionType))).sort();
    return types;
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = !searchQuery || 
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tabName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesModule = moduleFilter === 'All' || entry.moduleName === moduleFilter;
      const matchesType = typeFilter === 'All' || entry.transactionType === typeFilter;
      
      const matchesDateFrom = !dateFrom || new Date(entry.date) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(entry.date) <= new Date(dateTo);

      return matchesSearch && matchesModule && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [entries, searchQuery, moduleFilter, typeFilter, dateFrom, dateTo]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDebits = filteredEntries.reduce((sum, e) => sum + e.debitLKR, 0);
    const totalCredits = filteredEntries.reduce((sum, e) => sum + e.creditLKR, 0);
    const netBalance = totalCredits - totalDebits;
    const finalBalance = filteredEntries.length > 0 
      ? filteredEntries[filteredEntries.length - 1].balanceLKR 
      : 0;
    
    return { totalDebits, totalCredits, netBalance, finalBalance, count: filteredEntries.length };
  }, [filteredEntries]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Module', 'Tab', 'Type', 'Description', 'Reference', 'Debit (LKR)', 'Credit (LKR)', 'Balance (LKR)', 'Currency', 'Original Amount'];
    const rows = filteredEntries.map(e => [
      e.date,
      e.moduleName,
      e.tabName,
      e.transactionType,
      e.description,
      e.reference,
      e.debitLKR.toFixed(2),
      e.creditLKR.toFixed(2),
      e.balanceLKR.toFixed(2),
      e.originalCurrency || 'LKR',
      e.originalAmount?.toFixed(2) || e.debitLKR > 0 ? e.debitLKR.toFixed(2) : e.creditLKR.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_statement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-stone-400">
        <div className="animate-spin mb-4">⏳</div>
        <p className="text-sm font-bold uppercase tracking-widest">Loading Statement...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-stone-50/20 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-purple-600">
            <FileText size={14} /> Complete Financial Statement
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">Bank Statement View</h2>
          <p className="text-stone-400 text-xs md:text-sm mt-1 font-medium">
            All transactions across {APP_MODULES.length} modules • {entries.length} total entries
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button 
            onClick={handleExportCSV} 
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={handlePrint} 
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl text-xs font-bold shadow-sm hover:bg-stone-50 active:scale-95 whitespace-nowrap"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Debits</div>
          <div className="text-2xl font-black text-red-600">{formatCurrency(stats.totalDebits)}</div>
          <div className="text-xs text-stone-400 mt-1">{stats.count} transactions</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Total Credits</div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalCredits)}</div>
          <div className="text-xs text-stone-400 mt-1">Money In</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Net Balance</div>
          <div className={`text-2xl font-black ${stats.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netBalance)}
          </div>
          <div className="text-xs text-stone-400 mt-1">Credits - Debits</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">Final Balance</div>
          <div className={`text-2xl font-black ${stats.finalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(stats.finalBalance)}
          </div>
          <div className="text-xs text-stone-400 mt-1">Running Balance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 md:p-4 rounded-[32px] border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by description, reference, module..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-50/50 border border-stone-100 rounded-[20px] text-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 outline-none transition-all placeholder-stone-300 text-stone-700" 
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 xl:pb-0">
            <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
              <Filter size={14} className="text-stone-300" />
              <select 
                value={moduleFilter} 
                onChange={(e) => setModuleFilter(e.target.value)} 
                className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
              >
                <option value="All">All Modules</option>
                {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
              <FileText size={14} className="text-stone-300" />
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)} 
                className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
              <Calendar size={14} className="text-stone-300" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
              />
            </div>
            <div className="flex items-center bg-stone-50 border border-stone-100 rounded-[20px] px-3 shrink-0">
              <Calendar size={14} className="text-stone-300" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="px-2 py-2.5 bg-transparent text-xs text-stone-600 font-bold focus:outline-none min-w-[120px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statement Table */}
      <div className="bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden mb-24">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">
                <th className="p-6 pl-10">Date</th>
                <th className="p-6">Module</th>
                <th className="p-6">Tab</th>
                <th className="p-6">Type</th>
                <th className="p-6">Description</th>
                <th className="p-6">Reference</th>
                <th className="p-6 text-right">Debit (LKR)</th>
                <th className="p-6 text-right">Credit (LKR)</th>
                <th className="p-6 text-right pr-10">Balance (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-stone-400">
                    No transactions found. {entries.length === 0 ? 'Start adding transactions to see them here.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr 
                    key={entry.id} 
                    onClick={() => setSelectedEntry(entry)}
                    className="hover:bg-purple-50/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-6 pl-10 font-mono text-stone-500 text-xs whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="p-6 text-stone-600 font-medium">{entry.moduleName}</td>
                    <td className="p-6 text-stone-500 text-xs">{entry.tabName}</td>
                    <td className="p-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        entry.transactionType === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        entry.transactionType === 'Expense' ? 'bg-red-50 text-red-700 border-red-100' :
                        entry.transactionType === 'Purchase' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        entry.transactionType === 'Capital' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        entry.transactionType === 'Export' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-stone-50 text-stone-700 border-stone-100'
                      }`}>
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="p-6 text-stone-600 max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
                        {entry.reference}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {entry.debitLKR > 0 ? (
                        <span className="font-mono font-black text-red-600">{formatCurrency(entry.debitLKR)}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {entry.creditLKR > 0 ? (
                        <span className="font-mono font-black text-emerald-600">{formatCurrency(entry.creditLKR)}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="p-6 text-right pr-10">
                      <span className={`font-mono font-black ${entry.balanceLKR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(entry.balanceLKR)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEntry(null)} />
          <div className="relative w-full max-w-full md:max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200 overflow-hidden">
            
            <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-b border-stone-100 flex justify-between items-start z-10">
              <div className="flex gap-3 md:gap-4 items-center min-w-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      selectedEntry.transactionType === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      selectedEntry.transactionType === 'Expense' ? 'bg-red-50 text-red-700 border-red-100' :
                      selectedEntry.transactionType === 'Purchase' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      selectedEntry.transactionType === 'Capital' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      selectedEntry.transactionType === 'Export' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-stone-50 text-stone-700 border-stone-100'
                    }`}>
                      {selectedEntry.transactionType}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded truncate">{selectedEntry.reference}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-stone-900 truncate leading-tight">{selectedEntry.description}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 text-stone-500 font-medium text-xs md:text-sm">
                    <Calendar size={14} className="text-stone-400" />
                    <p className="truncate">{formatDate(selectedEntry.date)} • {selectedEntry.moduleName} / {selectedEntry.tabName}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-400 rounded-full transition-colors shrink-0 ml-2">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-stone-50/20">
              <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-sm">
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <DollarSign size={14} className="text-purple-500" /> Transaction Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 md:gap-x-6">
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Date</span>
                      <span className="text-sm font-medium text-stone-700">{formatDate(selectedEntry.date)}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Reference</span>
                      <span className="text-sm font-bold text-purple-700 font-mono">{selectedEntry.reference}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Module</span>
                      <span className="text-sm font-medium text-stone-700">{selectedEntry.moduleName}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Tab</span>
                      <span className="text-sm font-medium text-stone-700">{selectedEntry.tabName}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Transaction Type</span>
                      <span className="text-sm font-medium text-stone-700">{selectedEntry.transactionType}</span>
                    </div>
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Description</span>
                      <span className="text-sm font-medium text-stone-700">{selectedEntry.description}</span>
                    </div>
                    {selectedEntry.debitLKR > 0 && (
                      <div className="flex flex-col py-2 border-b border-stone-100">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Debit (LKR)</span>
                        <span className="text-sm font-bold text-red-600 font-mono">{formatCurrency(selectedEntry.debitLKR)}</span>
                      </div>
                    )}
                    {selectedEntry.creditLKR > 0 && (
                      <div className="flex flex-col py-2 border-b border-stone-100">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Credit (LKR)</span>
                        <span className="text-sm font-bold text-emerald-600 font-mono">{formatCurrency(selectedEntry.creditLKR)}</span>
                      </div>
                    )}
                    <div className="flex flex-col py-2 border-b border-stone-100">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Balance (LKR)</span>
                      <span className={`text-sm font-bold font-mono ${selectedEntry.balanceLKR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedEntry.balanceLKR)}
                      </span>
                    </div>
                    {selectedEntry.originalCurrency && selectedEntry.originalCurrency !== 'LKR' && (
                      <>
                        <div className="flex flex-col py-2 border-b border-stone-100">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Original Currency</span>
                          <span className="text-sm font-medium text-stone-700">{selectedEntry.originalCurrency}</span>
                        </div>
                        <div className="flex flex-col py-2 border-b border-stone-100">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Original Amount</span>
                          <span className="text-sm font-medium text-stone-700 font-mono">
                            {selectedEntry.originalCurrency} {selectedEntry.originalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2 items-center shrink-0">
              <button onClick={() => setSelectedEntry(null)} className="px-6 py-2.5 bg-stone-50 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-100 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

