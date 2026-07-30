import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  Calculator,
  PieChart,
  Bot,
  GraduationCap,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'salary', label: 'Salary & Tax', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'goals', label: 'Goals Tracker', icon: Target },
  { id: 'calculators', label: 'Decision Hub', icon: Calculator },
  { id: 'networth', label: 'Net Worth', icon: PieChart },
  { id: 'chat', label: 'AI Sarthi', icon: Bot, badge: 'AI' },
  { id: 'learn', label: 'Academy', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsAiDrawerOpen } = useFinancial();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl h-screen sticky top-0 z-30 p-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
              FinanceSarthi
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">
              AI Financial Companion
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'chat') {
                    setIsAiDrawerOpen(true);
                  }
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-sky-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pro AI Advisor Banner */}
        <div className="mt-auto p-4 rounded-2xl glass-card border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-sky-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Sarthi AI Assistant</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Ask any question regarding tax regimes, SIP growth, or debt payoff.
          </p>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            Launch Advisor
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'text-sky-400' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
