import React, { useState, useEffect, useRef } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Sparkles, MapPin, Search, User, LogOut, Settings as SettingsIcon, Shield, ChevronDown, Moon, Sun, Menu } from 'lucide-react';
import { CityTier } from '@financesarthi/types';

export const Header: React.FC = () => {
  const { user, setUser, setIsAiDrawerOpen, healthScore, setActiveTab } = useFinancial();
  const { userProfile, setShowSignOutModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName = userProfile?.displayName || user.name;
  const userPhoto = userProfile?.photoURL;
  const riskProfile = userProfile?.riskProfile || 'MODERATE';

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const notifications = [
    { id: 1, title: 'Salary Credited', msg: '₹85,000 processed for July 2026', time: '2h ago' },
    { id: 2, title: 'SIP Auto-Debit', msg: '₹15,000 allocated to Nifty 50 Index Fund', time: '1d ago' },
    { id: 3, title: 'Tax Saving Alert', msg: 'Claim 80D before Q3 to optimize tax deduction', time: '3d ago' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
      {/* Mobile Brand / Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="lg:hidden flex items-center gap-2 font-bold text-white text-xs sm:text-sm shrink-0">
          <button
            onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            title="Open Menu"
          >
            <Menu className="h-4 w-4 text-sky-400" />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}>
            <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="tracking-tight font-extrabold text-xs">FinanceSarthi</span>
          </div>
        </div>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search goals, transactions, calculators..."
            className="w-full bg-slate-900/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* City Tier Dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-sky-400" />
          <span>Tier:</span>
          <select
            value={user.cityTier}
            onChange={(e) => setUser(prev => ({ ...prev, cityTier: e.target.value as any }))}
            className="bg-transparent font-bold text-sky-400 focus:outline-none cursor-pointer"
          >
            <option value="METRO" className="bg-slate-900 text-slate-200">Metro City</option>
            <option value="TIER_2" className="bg-slate-900 text-slate-200">Tier 2 City</option>
            <option value="TIER_3" className="bg-slate-900 text-slate-200">Tier 3 City</option>
            <option value="VILLAGE" className="bg-slate-900 text-slate-200">Village / Rural</option>
          </select>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] sm:text-xs font-semibold text-sky-400 shrink-0">
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400 animate-ping" />
          <span>Score: {healthScore.score}<span className="hidden sm:inline">/1000</span></span>
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Ask Sarthi</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 p-4 shadow-2xl border border-slate-800 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200">Notifications</h4>
                <span className="text-[10px] font-semibold text-sky-400 cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div ref={userMenuRef} className="relative pl-2 border-l border-slate-800">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900/80 transition-all cursor-pointer"
          >
            {userPhoto ? (
              <img src={userPhoto} alt={displayName} className="h-9 w-9 rounded-xl object-cover border border-blue-500/40" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shadow-inner">
                <User className="h-4 w-4 text-sky-400" />
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 p-3 shadow-2xl border border-slate-800 z-50 animate-in fade-in space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-bold text-white">{displayName}</h4>
                <p className="text-[10px] text-slate-400 truncate">{userProfile?.email || user.email}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-sky-300 border border-blue-500/30">
                    {riskProfile} RISK
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 text-xs font-semibold text-slate-300">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-left cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-sky-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    <span>Theme Mode</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-left font-bold text-xs cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
