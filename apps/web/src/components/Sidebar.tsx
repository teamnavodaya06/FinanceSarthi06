import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  PieChart,
  Bot,
  GraduationCap,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsAiDrawerOpen } = useFinancial();

  const navigationGroups: SidebarGroup[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Money',
      items: [
        { id: 'salary', label: 'Salary & Tax', icon: Wallet },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'goals', label: 'Goals Tracker', icon: Target },
        { id: 'networth', label: 'Net Worth', icon: PieChart },
      ]
    },
    {
      title: 'AI Advisor',
      items: [
        { id: 'chat', label: 'AI Sarthi', icon: Bot },
      ]
    },
    {
      title: 'Academy',
      items: [
        { id: 'learn', label: 'Academy', icon: GraduationCap },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
      ]
    }
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
              Wealth Companion
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
                      onClick={() => {
                        if (item.id === 'chat') {
                          setIsAiDrawerOpen(true);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/10 text-sky-400 border border-blue-500/10 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-900 px-3 py-2 flex items-center justify-around">
        {navigationGroups[0].items.concat(navigationGroups[1].items).slice(0, 5).map((item) => {
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
