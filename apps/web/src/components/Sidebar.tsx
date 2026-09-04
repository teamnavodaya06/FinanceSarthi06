import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  Bot,
  Settings as SettingsIcon,
  Sparkles,
  Plus,
  Sliders,
  X,
  Menu,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SidebarItem {
  id: string;
  label: string;
  shortLabel: string;
  desc?: string;
  icon: React.ComponentType<any>;
  badge?: string;
  gradient?: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinancial();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for custom open-mobile-menu event from Header or other components
  useEffect(() => {
    const handleOpenMenu = () => setIsMobileMenuOpen(true);
    window.addEventListener('open-mobile-menu', handleOpenMenu);
    return () => window.removeEventListener('open-mobile-menu', handleOpenMenu);
  }, []);

  const navigationGroups: SidebarGroup[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', desc: 'Financial summary & cash flow', icon: LayoutDashboard },
        { id: 'action-center', label: 'AI Action Center', shortLabel: 'AI Actions', desc: 'Proactive AI recommendations', icon: Sparkles, badge: 'AI' },
      ]
    },
    {
      title: 'Money',
      items: [
        { id: 'salary', label: 'Salary Planner', shortLabel: 'Salary', desc: 'Tax & take-home breakdown', icon: Wallet },
        { id: 'goals', label: 'Goals', shortLabel: 'Goals', desc: 'SIP & corpus target tracking', icon: Target },
        { id: 'expenses', label: 'Expenses', shortLabel: 'Expenses', desc: 'Daily transactions & analytics', icon: Receipt },
        { id: 'budgets', label: 'Adaptive AI Budget', shortLabel: 'AI Budget', desc: 'Smart 50-30-20 budget rebalancing', icon: Sliders },
      ]
    },
    {
      title: 'AI Advisor',
      items: [
        { id: 'chat', label: 'Sarthi AI', shortLabel: 'Sarthi', desc: 'Conversational financial assistant', icon: Bot, badge: 'Live' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', shortLabel: 'Settings', desc: 'Preferences, profile & security', icon: SettingsIcon },
      ]
    }
  ];

  // All 8 requested mobile menu items in exact specified order
  const allMobileItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', desc: 'Financial summary & cash flow', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'action-center', label: 'AI Action Center', shortLabel: 'AI Actions', desc: 'Proactive AI recommendations', icon: Sparkles, badge: 'AI', gradient: 'from-amber-400 to-orange-500' },
    { id: 'salary', label: 'Salary Planner', shortLabel: 'Salary', desc: 'Tax & take-home breakdown', icon: Wallet, gradient: 'from-emerald-400 to-teal-600' },
    { id: 'goals', label: 'Goals', shortLabel: 'Goals', desc: 'SIP & corpus target tracking', icon: Target, gradient: 'from-purple-500 to-pink-600' },
    { id: 'expenses', label: 'Expenses', shortLabel: 'Expenses', desc: 'Daily transactions & analytics', icon: Receipt, gradient: 'from-sky-400 to-blue-600' },
    { id: 'budgets', label: 'Adaptive AI Budget', shortLabel: 'AI Budget', desc: 'Smart 50-30-20 budget rebalancing', icon: Sliders, gradient: 'from-indigo-400 to-purple-600' },
    { id: 'chat', label: 'Sarthi AI', shortLabel: 'Sarthi', desc: 'Conversational AI assistant', icon: Bot, badge: 'Pro', gradient: 'from-blue-600 to-cyan-500' },
    { id: 'settings', label: 'Settings', shortLabel: 'Settings', desc: 'Preferences & security', icon: SettingsIcon, gradient: 'from-slate-500 to-slate-700' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-xl h-screen sticky top-0 z-30 p-5">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              FinanceSarthi
            </h1>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
              Your Financial Guide
            </p>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block px-2.5 mb-2">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/10 text-sky-400 border border-blue-500/10 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom CTA Panel */}
        <div className="pt-4 border-t border-slate-900 mt-auto shrink-0">
          <button
            onClick={() => setActiveTab('goals')}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all duration-150 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Dock Bar (All 8 Options Scrollable + Menu Drawer Button) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)]">
        <div className="relative flex items-center">
          {/* Scrollable Container for all 8 items */}
          <nav className="flex-1 flex items-center overflow-x-auto scrollbar-none py-2 px-2 gap-1 snap-x snap-mandatory">
            {allMobileItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-1 rounded-xl transition-all text-xs font-medium cursor-pointer shrink-0 snap-start relative ${
                    isActive
                      ? 'bg-blue-600/20 text-sky-400 border border-blue-500/40 shadow-inner font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                  )}
                  <Icon className={`h-4.5 w-4.5 mb-0.5 ${isActive ? 'text-sky-400 scale-110' : 'text-slate-400'} transition-transform`} />
                  <span className="text-[9.5px] tracking-tight whitespace-nowrap">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Dedicated All Options Grid Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="shrink-0 mr-2 p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center justify-center cursor-pointer min-w-[50px]"
            title="All Menu Options"
          >
            <Grid className="h-4.5 w-4.5 mb-0.5" />
            <span className="text-[9px] font-bold tracking-tight">All (8)</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Drawer Modal with All 8 Options */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col justify-end"
          >
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-1" />

              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">All Menu Options</h3>
                    <p className="text-[10px] text-slate-400">Select any section to navigate</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 8 Options Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {allMobileItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-blue-600/20 border-blue-500/40 text-white shadow-md'
                          : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${item.gradient || 'from-blue-600 to-indigo-600'} text-white shadow-md`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.desc && <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-600'} shrink-0 ml-2`} />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Action inside Drawer */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('goals');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Financial Goal</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
