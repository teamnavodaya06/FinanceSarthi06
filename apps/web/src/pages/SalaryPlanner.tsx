import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '@financesarthi/utils';
import {
  Sparkles,
  Wallet,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Building,
  CheckCircle,
  PiggyBank,
  Check,
} from 'lucide-react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const SalaryPlanner: React.FC = () => {
  const { userProfile, user: fbUser } = useAuth();
  const { setActiveTab } = useFinancial();

  // Local state initialized with user salary
  const [salary, setSalary] = useState<string>(
    userProfile?.monthlySalary?.toString() || '75000'
  );
  const [isSaving, setIsSaving] = useState(false);

  const numSalary = Number(salary) || 75000;

  // 50/30/20 splits calculations
  const needsVal = Math.round(numSalary * 0.50);
  const wantsVal = Math.round(numSalary * 0.30);
  const savingsVal = Math.round(numSalary * 0.20);

  // 10-year projection (20% savings compounded at 12% CAGR for 10 years has multiplier of 230x)
  const projectionLakhs = ((savingsVal * 230) / 100000).toFixed(1);
  const targetYear = new Date().getFullYear() + 10;

  const handleSalarySave = async () => {
    if (!fbUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', fbUser.uid);
      await updateDoc(docRef, {
        monthlySalary: numSalary,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 select-none">
      
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Plan Your Salary
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Master the 50-30-20 rule to achieve financial freedom.
        </p>
      </div>

      {/* Row 1: Donut Chart & Sliders Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Circular SVG Donut Chart */}
        <div className="lg:col-span-5 p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Needs (50%) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#047857"
                strokeWidth="11"
                strokeDasharray="219.9"
                strokeDashoffset="0"
              />
              {/* Wants (30%) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="11"
                strokeDasharray="219.9"
                strokeDashoffset={219.9 * 0.50}
              />
              {/* Savings (20%) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#34D399"
                strokeWidth="11"
                strokeDasharray="219.9"
                strokeDashoffset={219.9 * 0.80}
              />
            </svg>
            {/* Inside details text */}
            <div className="absolute text-center">
              <span className="text-[9px] uppercase font-black text-slate-400 block leading-none">Total Budget</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1.5">₹{numSalary.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Legend row */}
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-700 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">Needs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">Wants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">Savings</span>
            </div>
          </div>
        </div>

        {/* Right Card: Sliders & Salary Input */}
        <div className="lg:col-span-7 p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Salary Input wrapper */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Monthly Take-home Salary</label>
            <div className="relative h-12 w-full bg-blue-50/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center px-4">
              <span className="text-sm font-bold text-slate-400 mr-2">₹</span>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSalarySave}
                disabled={isSaving}
                className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Allocation Rows */}
          <div className="space-y-4">
            
            {/* Needs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-850 dark:text-slate-200 block">Needs</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">Rent, Groceries, Bills</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white block">₹{needsVal.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">50%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <div className="h-full bg-emerald-700 rounded-full w-[50%]" />
                <span className="absolute top-1/2 left-[50%] -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-700 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>
            </div>

            {/* Wants */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-850 dark:text-slate-200 block">Wants</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">Dining out, Hobbies, Travel</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white block">₹{wantsVal.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">30%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <div className="h-full bg-indigo-600 rounded-full w-[30%]" />
                <span className="absolute top-1/2 left-[30%] -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>
            </div>

            {/* Savings & Investments */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-850 dark:text-slate-200 block">Savings & Investments</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">Mutual Funds, Emergency Fund</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white block">₹{savingsVal.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">20%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <div className="h-full bg-emerald-400 rounded-full w-[20%]" />
                <span className="absolute top-1/2 left-[20%] -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 2: Pro Tip Card (Blue gradient background) */}
      <div className="p-6 rounded-[24px] sarthi-card text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Decorative sparkles */}
        <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Pro Tip: The Wealth Multiplier</h4>
            <p className="text-[11px] text-slate-200 leading-relaxed font-semibold max-w-2xl">
              Increasing your savings rate by just 5% today can cut your time to financial independence by up to 4 years. Automate your SIPs to go out on the 1st of every month to ensure your 'Savings' bucket stays untouched.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('chat')}
          className="h-[40px] px-5 rounded-xl bg-white hover:bg-slate-50 text-blue-800 font-bold text-[11px] uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md shadow-black/10"
        >
          Explore Funds
        </button>
      </div>

      {/* Row 3: Grid Projection & Tax Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: 10-Year Projection */}
        <div className="md:col-span-8 p-6 rounded-[24px] bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-950/30 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-sky-400 shadow-sm shrink-0">
              <PiggyBank className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Your 10-Year Projection</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                At 20% savings, you're on track to accumulate ₹{projectionLakhs} Lakhs by {targetYear}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('goals')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-sky-400 cursor-pointer shadow-sm shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Card 2: Optimize Taxes */}
        <div className="md:col-span-4 p-6 rounded-[24px] sarthi-card text-white shadow-xl space-y-2.5 relative overflow-hidden flex flex-col justify-between">
          {/* Dec glow */}
          <div className="absolute top-[-50px] right-[-50px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-slate-200" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Optimize Taxes</h4>
          </div>
          
          <p className="text-[11px] text-slate-250 leading-normal font-semibold">
            Save up to ₹46,800 annually with 80C deductions.
          </p>

          <span className="text-[9px] uppercase font-black text-slate-300 tracking-widest block pt-1">
            FY 2026-27 ACTIVE Slab
          </span>
        </div>

      </div>

    </div>
  );
};
