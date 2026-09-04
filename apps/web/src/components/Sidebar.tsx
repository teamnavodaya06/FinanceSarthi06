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
    { id: 'chat', label: 'Sarthi AI', shortLabel: 'Sarthi', desc: 'Conversational AI assistant', icon: Bot, badge: 'Live', gradient: 'from-blue-600 to-cyan-500' },
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

      {/* Clean, Fixed 5-Tab Mobile Bottom Navigation Dock Bar (Zero-Scroll, Instant Touch Target) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]">
        <nav className="grid grid-cols-5 items-center h-15 px-1 max-w-md mx-auto">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 mb-1 ${activeTab === 'dashboard' ? 'text-sky-400 scale-110' : ''} transition-transform`} />
            <span className="text-[10px] tracking-tight">Dashboard</span>
          </button>

          {/* Tab 2: Expenses */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'expenses' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className={`h-5 w-5 mb-1 ${activeTab === 'expenses' ? 'text-sky-400 scale-110' : ''} transition-transform`} />
            <span className="text-[10px] tracking-tight">Expenses</span>
          </button>

          {/* Tab 3: Sarthi AI (Prominent Center Button) */}
          <button
            onClick={() => setActiveTab('chat')}
            className="flex flex-col items-center justify-center -mt-4 cursor-pointer"
          >
            <div className={`h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform ${
              activeTab === 'chat' ? 'ring-2 ring-sky-400 scale-105' : 'hover:scale-105'
            }`}>
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                <Bot className="h-6 w-6 text-sky-400 animate-pulse" />
              </div>
            </div>
            <span className={`text-[9.5px] mt-0.5 tracking-tight font-extrabold ${activeTab === 'chat' ? 'text-sky-400' : 'text-slate-300'}`}>Sarthi AI</span>
          </button>

          {/* Tab 4: Goals */}
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'goals' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className={`h-5 w-5 mb-1 ${activeTab === 'goals' ? 'text-sky-400 scale-110' : ''} transition-transform`} />
            <span className="text-[10px] tracking-tight">Goals</span>
          </button>

          {/* Tab 5: All Menu Drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isMobileMenuOpen ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="h-5 w-5 mb-1 text-slate-300" />
            <span className="text-[10px] tracking-tight font-semibold">Menu</span>
          </button>
        </nav>
      </div>

      {/* Lightweight, Super-Smooth Mobile Menu Drawer Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Simple Dark Backdrop without heavy blur calculation for zero lag */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-slate-950/80"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Drag Handle Indicator */}
              <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto" />

              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
                    <Grid className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight">FinanceSarthi Features</h3>
                    <p className="text-[10px] text-slate-400 font-medium">All 8 smart financial tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* All 8 Options Grid Card List */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                {allMobileItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all text-left border ${
                        isActive
                          ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-slate-900/60 border-slate-850 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${item.gradient || 'from-blue-600 to-indigo-600'} text-white shadow-md`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30 uppercase">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.desc && <span className="text-[10px] text-slate-400 block truncate font-normal mt-0.5">{item.desc}</span>}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-600'} shrink-0 ml-2`} />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer CTA */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('goals');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Financial Goal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
