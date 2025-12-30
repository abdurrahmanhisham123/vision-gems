
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, Search, Home, ChevronRight, LogOut, Settings, Diamond, Wallet, TrendingUp, ChevronDown } from 'lucide-react';
import { APP_MODULES, getIcon } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const location = useLocation();

  const isHome = location.pathname === '/';
  
  // Find current module
  const currentModuleId = location.pathname.split('/')[2];
  const currentModule = APP_MODULES.find(m => m.id === currentModuleId);

  // Group modules for sidebar
  const tripIds = ['kenya', 'vgtz', 'madagascar', 'dada', 'vg-ramazan', 'vision-gems'];
  
  const mainModules = APP_MODULES.filter(m => !tripIds.includes(m.id));
  const tripModules = APP_MODULES.filter(m => tripIds.includes(m.id));

  const NavItem: React.FC<{ module: any, isActive: boolean }> = ({ module, isActive }) => (
    <Link
      to={`/module/${module.id}/${module.tabs[0]}`}
      onClick={() => setMobileSidebarOpen(false)}
      className={`group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 mb-1.5 relative overflow-hidden ${
        isActive 
          ? 'bg-white text-gem-purple font-semibold shadow-md border-l-4 border-gem-purple' 
          : 'text-stone-600 hover:bg-white/60 hover:text-gem-purple hover:shadow-sm'
      }`}
    >
      <div className={`transition-all duration-200 ${isActive ? 'text-gem-purple scale-110' : 'text-stone-400 group-hover:text-gem-purple group-hover:scale-105'}`}>
        {React.cloneElement(getIcon(module.icon), { size: 20 })}
      </div>
      <span className="text-sm font-medium tracking-wide whitespace-nowrap">{module.name}</span>
      {isActive && (
        <div className="absolute right-3 w-2 h-2 rounded-full bg-gem-purple shadow-lg shadow-gem-purple/50"></div>
      )}
    </Link>
  );

  const toggleSidebar = () => {
    // Changed breakpoint to 1024 (lg) so tablets use the mobile drawer behavior
    if (window.innerWidth >= 1024) {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    } else {
      setMobileSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen h-dvh bg-stone-50 overflow-hidden overscroll-none">
      {/* Desktop Sidebar - Hidden on tablets and below (lg breakpoint) */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-stone-200/80 shadow-lg z-20 transition-all duration-300 ease-in-out ${
          desktopSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 border-r-0'
        }`}
      >
        {/* Inner container with fixed width to prevent content squishing during transition */}
        <div className="w-[280px] flex flex-col h-full overflow-hidden">
          <div className="p-6 pb-4 border-b border-stone-100">
             <Link to="/" className="block p-4 rounded-2xl bg-gradient-to-br from-gem-purple via-gem-purple to-indigo-600 shadow-lg shadow-gem-purple/20 text-white mb-4 transform hover:scale-[1.01] hover:shadow-xl hover:shadow-gem-purple/30 transition-all duration-300">
               <div className="flex items-center gap-3">
                 <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                   <Diamond size={22} className="text-white" fill="currentColor" fillOpacity={0.3} />
                 </div>
                 <div>
                   <div className="font-black text-lg tracking-tight leading-tight">VISION GEMS</div>
                   <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Inventory System</div>
                 </div>
               </div>
             </Link>

             <Link 
               to="/" 
               className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                 isHome 
                   ? 'bg-gem-purple/10 text-gem-purple font-semibold shadow-sm border border-gem-purple/20' 
                   : 'text-stone-600 hover:bg-stone-50 hover:text-gem-purple'
               }`}
             >
               <Home size={17} /> <span>Home</span>
             </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar overscroll-contain">
            <div className="px-4 mt-3 mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Main Operations</h3>
            </div>
            {mainModules.map((module) => (
              <NavItem key={module.id} module={module} isActive={currentModuleId === module.id} />
            ))}
            
            <div className="px-4 mt-6 mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Trips & Locations</h3>
            </div>
            {tripModules.map((module) => (
              <NavItem key={module.id} module={module} isActive={currentModuleId === module.id} />
            ))}
          </nav>

          <div className="p-4 border-t border-stone-100 bg-gradient-to-b from-white to-stone-50/50">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-left group border border-transparent hover:border-stone-200">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gem-purple/10 to-indigo-100 flex items-center justify-center text-gem-purple group-hover:from-gem-purple/20 group-hover:to-indigo-200 transition-all shadow-sm">
                 <User size={18} />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="text-sm font-semibold text-stone-800 group-hover:text-gem-purple truncate">Admin User</div>
                 <div className="text-xs text-stone-500 truncate">admin@visiongems.com</div>
               </div>
               <Settings size={16} className="text-stone-400 group-hover:text-gem-purple transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Drawer Overlay - Hidden only on large screens */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile/Tablet Sidebar (Drawer) - Hidden only on large screens */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-white z-50 transform transition-transform duration-300 lg:hidden shadow-2xl flex flex-col ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-4 bg-gradient-to-br from-gem-purple via-gem-purple to-indigo-600 border-b border-gem-purple/20 flex justify-between items-center shadow-lg">
           <div className="flex items-center gap-2.5 text-white">
             <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
               <Diamond size={20} className="text-white" fill="currentColor" fillOpacity={0.3} />
             </div>
             <span className="font-black text-lg tracking-tight">VISION GEMS</span>
           </div>
           <button onClick={() => setMobileSidebarOpen(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"><X size={20} /></button>
         </div>
         <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar overscroll-contain bg-white">
            <Link 
              to="/" 
              onClick={() => setMobileSidebarOpen(false)} 
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-3 transition-all ${
                isHome 
                  ? 'bg-gem-purple/10 text-gem-purple font-semibold shadow-sm border border-gem-purple/20' 
                  : 'text-stone-600 hover:bg-stone-50 hover:text-gem-purple'
              }`}
            >
              <Home size={20} /> <span className="font-medium">Home Dashboard</span>
            </Link>
            
            <div className="px-4 mb-3 mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Main Operations</div>
            {mainModules.map((module) => (
              <Link
                key={module.id}
                to={`/module/${module.id}/${module.tabs[0]}`}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1.5 transition-all ${
                  currentModuleId === module.id 
                    ? 'bg-white text-gem-purple font-semibold shadow-md border-l-4 border-gem-purple' 
                    : 'text-stone-600 hover:bg-white/60 hover:text-gem-purple hover:shadow-sm'
                }`}
              >
                <div className={currentModuleId === module.id ? 'text-gem-purple' : 'text-stone-400'}>
                  {React.cloneElement(getIcon(module.icon), { size: 20 })}
                </div>
                <span className="text-sm font-medium">{module.name}</span>
              </Link>
            ))}

            <div className="px-4 mt-6 mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Trips & Locations</div>
            {tripModules.map((module) => (
              <Link
                key={module.id}
                to={`/module/${module.id}/${module.tabs[0]}`}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1.5 transition-all ${
                  currentModuleId === module.id 
                    ? 'bg-white text-gem-purple font-semibold shadow-md border-l-4 border-gem-purple' 
                    : 'text-stone-600 hover:bg-white/60 hover:text-gem-purple hover:shadow-sm'
                }`}
              >
                <div className={currentModuleId === module.id ? 'text-gem-purple' : 'text-stone-400'}>
                  {React.cloneElement(getIcon(module.icon), { size: 20 })}
                </div>
                <span className="text-sm font-medium">{module.name}</span>
              </Link>
            ))}
         </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50 relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold text-stone-800 tracking-tight">
                {currentModule ? currentModule.name : 'Dashboard'}
              </h1>
              {currentModule && (
                <span className="text-[10px] md:text-xs text-stone-500 font-medium hidden md:block">
                  {currentModule.description}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-gem-purple transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gem-purple/20 focus:border-gem-purple/50 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors hover:text-gem-purple">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="md:hidden w-8 h-8 bg-gradient-to-br from-gem-purple to-gem-purple-light rounded-full flex items-center justify-center text-white text-xs font-bold shadow-purple">
              VG
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-stone-50 pb-24 md:pb-8 relative overscroll-contain">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Visible ONLY on small mobile screens (< md), Hidden on tablets */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-2 pb-safe pt-1 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isHome ? 'text-gem-purple' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className={`p-1 rounded-lg ${isHome ? 'bg-gem-purple-50' : ''}`}>
              <Home size={20} />
            </div>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link to="/module/vision-gems/DashboardGems" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentModuleId === 'vision-gems' ? 'text-gem-purple' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className={`p-1 rounded-lg ${currentModuleId === 'vision-gems' ? 'bg-gem-purple-50' : ''}`}>
              <Diamond size={20} />
            </div>
            <span className="text-[10px] font-medium">Inventory</span>
          </Link>

          {/* Floating Action Button for Trips */}
          <div className="relative -top-5">
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-gem-purple to-gem-purple-dark text-white shadow-purple flex items-center justify-center transform transition-transform active:scale-95"
            >
               <div className="grid grid-cols-2 gap-0.5">
                 <span className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></span>
                 <span className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></span>
                 <span className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></span>
                 <span className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></span>
               </div>
            </button>
          </div>

          <Link to="/module/all-expenses/ExDashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentModuleId === 'all-expenses' ? 'text-gem-purple' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className={`p-1 rounded-lg ${currentModuleId === 'all-expenses' ? 'bg-gem-purple-50' : ''}`}>
               <Wallet size={20} />
            </div>
            <span className="text-[10px] font-medium">Expenses</span>
          </Link>
          
          <Link to="/module/outstanding/Dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentModuleId === 'outstanding' ? 'text-gem-purple' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className={`p-1 rounded-lg ${currentModuleId === 'outstanding' ? 'bg-gem-purple-50' : ''}`}>
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-medium">Due</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
