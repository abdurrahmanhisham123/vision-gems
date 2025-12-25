

import React, { useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, MapPin, User, FileText, Hash, CheckCircle, AlertCircle, Clock, Upload, FileImage } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data?: Record<string, any>;
  image?: string;
  status?: string;
  statusColor?: string; // tailwind class for bg/text
  icon?: React.ReactNode;
  customContent?: React.ReactNode;
  onEdit?: () => void; // Added callback for edit action
}

export const DetailModal: React.FC<DetailModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  data, 
  image, 
  status, 
  statusColor,
  icon,
  customContent,
  onEdit
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Helper to format key names (e.g., "paymentMethod" -> "Payment Method")
  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  // Helper to format values
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key.toLowerCase().includes('date')) return value.toString(); // Already formatted strings usually
    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('value') || key.toLowerCase().includes('balance')) {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }
    return value.toString();
  };

  // Keys to exclude from the generic grid (because they are shown in header/hero or handled specially)
  const excludeKeys = ['id', 'imgUrl', 'image', 'title', 'name', 'code', 'description', 'status', 'trend', 'trendUp', 'documents', 'items'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-stone-50 border-b border-stone-100 p-6 pb-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full text-stone-400 hover:text-stone-800 shadow-sm border border-stone-100 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex gap-5">
            {image ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-card p-1 shrink-0 overflow-hidden border border-stone-100">
                <img src={image} alt={title} className="w-full h-full object-cover rounded-lg" />
              </div>
            ) : icon ? (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gem-purple-50 to-white border border-gem-purple/10 flex items-center justify-center text-gem-purple shadow-sm shrink-0">
                {icon}
              </div>
            ) : null}

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColor || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                    {status}
                  </span>
                )}
                {data?.id && <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{data.id}</span>}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 leading-tight mb-1">{title}</h2>
              {subtitle && <p className="text-stone-500 font-medium">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
          
          {/* Custom Content (e.g. detailed tables) */}
          {customContent && (
            <div className="mb-8">
              {customContent}
            </div>
          )}

          {/* General Information Grid (if data provided) */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {Object.entries(data).map(([key, value]) => {
                if (excludeKeys.includes(key)) return null;
                
                const isMoney = key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('expenses');
                
                return (
                  <div key={key} className="flex flex-col group">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 group-hover:text-gem-purple transition-colors">
                      {formatKey(key)}
                    </span>
                    <span className={`font-medium text-stone-800 ${isMoney ? 'font-mono' : ''}`}>
                      {isMoney && <span className="text-stone-400 text-xs mr-1">LKR</span>}
                      {formatValue(key, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Receipts / Documents Section (Generic) */}
          {data?.documents && Array.isArray(data.documents) && data.documents.length > 0 && typeof data.documents[0] === 'string' && (
            <div className="mt-8 pt-8 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileImage size={16} className="text-stone-400" />
                Receipts & Documents
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {/* Upload Placeholder */}
                 <div className="aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-gem-purple/30 transition-all flex flex-col items-center justify-center text-stone-400 hover:text-gem-purple cursor-pointer group">
                    <Upload size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Upload New</span>
                 </div>

                 {/* Existing Documents */}
                 {data.documents.map((doc: string, idx: number) => (
                   <div key={idx} className="aspect-square rounded-xl border border-stone-200 p-1 bg-white shadow-sm overflow-hidden relative group">
                     <img src={doc} alt={`Document ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-1.5 bg-white/90 rounded-lg hover:text-gem-purple"><FileText size={16} /></button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Contextual Actions */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex gap-3 justify-end">
            <button className="px-4 py-2 text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors">
              History
            </button>
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
              >
                {title.includes('INV') ? 'Edit Invoice' : 'Edit Details'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
