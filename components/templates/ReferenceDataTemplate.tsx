import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Plus, Edit, Trash2, X, 
  StickyNote, MapPin, DollarSign, Calendar, Search, Download, ChevronRight
} from 'lucide-react';
import { ReferenceDataConfig } from '../../utils/referenceDataConfig';
import { getReferenceData, StoneShape, NoteItem } from '../../services/referenceDataService';

interface Props {
  config: ReferenceDataConfig;
  moduleId: string;
  tabId: string;
  isReadOnly?: boolean;
}

export const ReferenceDataTemplate: React.FC<Props> = ({ config, isReadOnly, moduleId, tabId }) => {
  const [shapes, setShapes] = useState<StoneShape[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReferenceData(config).then(data => {
      setShapes(data.shapes);
      setNotes(data.notes);
      setLoading(false);
    });
  }, [config]);

  if (loading) return <div className="p-10 text-center text-stone-400">Loading reference data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto min-h-screen bg-stone-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 text-purple-600">
              {moduleId.replace('-', ' ')} <span className="text-stone-300">/</span> {tabId}
           </div>
           <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{config.tabName}</h2>
           <p className="text-stone-500 text-sm mt-1">{config.referenceType === 'shape_catalog' ? 'Official shape catalog' : 'Critical company notes'}</p>
        </div>
        {!isReadOnly && (
           <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:bg-purple-700 transition-all active:scale-95">
             <Plus size={18} /> Add New Entry
           </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input type="text" placeholder="Search records..." className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none" />
         </div>
         <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 transition-colors shadow-sm flex-shrink-0"><Download size={18} /></button>
         </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 min-h-[400px]">
        {config.referenceType === 'shape_catalog' ? (
          shapes.length === 0 ? (
            <div className="text-center py-20 text-stone-400 flex flex-col items-center">
               <ClipboardList size={48} className="mb-4 text-stone-200" />
               <h3 className="text-xl font-bold text-stone-800 mb-2">No Shapes Found</h3>
               <p className="text-sm max-w-xs">{config.emptyStateMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-stone-50 text-xs font-bold text-stone-500 uppercase border-b border-stone-200"><th className="p-4">Shape Name</th><th className="p-4">Abbr</th><th className="p-4">Notes</th><th className="p-4 w-10"></th></tr></thead>
                <tbody>{shapes.map(s => <tr key={s.id} className="hover:bg-stone-50"><td className="p-4 font-bold">{s.shapeName}</td><td className="p-4 font-mono">{s.abbreviation}</td><td className="p-4 text-stone-500">{s.description}</td><td className="p-4"><ChevronRight size={18} className="text-stone-300"/></td></tr>)}</tbody>
              </table>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(n => (
              <div key={n.id} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-purple-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-bold uppercase text-stone-400">{n.category}</span>
                  <StickyNote size={18} className="text-stone-300 group-hover:text-purple-600" />
                </div>
                <div className="text-lg font-bold text-stone-900 mb-2">{n.currency} {n.amount?.toLocaleString()}</div>
                <p className="text-sm text-stone-600 italic">"{n.notes}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};