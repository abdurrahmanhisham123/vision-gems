
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ModuleView } from './components/ModuleView';
import { StatementView } from './components/StatementView';
import { APP_MODULES, getIcon } from './constants';
import { ArrowRight, FileText } from 'lucide-react';

const Home = () => {
  // Group modules for display
  const tripIds = ['kenya', 'vgtz', 'madagascar', 'dada', 'vg-ramazan', 'vision-gems'];
  
  const mainModules = APP_MODULES.filter(m => !tripIds.includes(m.id));
  const tripModules = APP_MODULES.filter(m => tripIds.includes(m.id));

  const ModuleCard: React.FC<{ module: any }> = ({ module }) => (
    <Link 
      to={`/module/${module.id}/${module.tabs[0]}`}
      className="group relative bg-white p-6 rounded-2xl shadow-card border border-stone-200 hover:border-gem-purple/30 hover:shadow-premium transition-all duration-300 flex flex-col active:scale-95"
    >
      <div className="flex justify-between items-start mb-5">
         <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-sm ${
           module.type === 'readonly' ? 'bg-stone-100 text-stone-600' :
           module.type === 'financial' ? 'bg-orange-50 text-orange-600' :
           module.type === 'export' ? 'bg-blue-50 text-blue-600' :
           'bg-gradient-to-br from-gem-purple-50 to-white text-gem-purple border border-gem-purple/10'
         }`}>
           {React.cloneElement(getIcon(module.icon), { size: 28 })}
         </div>
         {module.type === 'readonly' && (
           <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded-full uppercase tracking-wide border border-stone-200">Read Only</span>
         )}
      </div>
      
      <h2 className="text-xl font-bold text-stone-900 group-hover:text-gem-purple transition-colors tracking-tight">{module.name}</h2>
      <p className="text-sm text-stone-500 mt-2 mb-6 line-clamp-2 leading-relaxed">{module.description}</p>
      
      <div className="pt-4 border-t border-stone-100 mt-auto flex items-center justify-between">
         <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{module.tabs.length} Sections</span>
         <span className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-gem-purple group-hover:text-white transition-all">
           <ArrowRight size={14} />
         </span>
      </div>
    </Link>
  );

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
      <div className="mb-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Welcome to Vision Gems</h1>
            <p className="text-stone-500 mt-2 text-lg">Select a module to manage your inventory and operations</p>
          </div>
          <Link 
            to="/statement"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:from-purple-700 hover:to-purple-800 transition-all active:scale-95"
          >
            <FileText size={18} /> View Complete Statement
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Main Operations</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mainModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400">Trips & Locations</h2>
          <div className="h-px bg-stone-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tripModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/statement" element={<StatementView />} />
          <Route path="/module/:moduleId/:tabId" element={<ModuleView />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
