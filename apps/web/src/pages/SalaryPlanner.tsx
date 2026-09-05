import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import {
  Wallet,
  CheckCircle2,
  Sliders,
  Sparkles,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const SalaryPlanner: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, user: fbUser } = useAuth();
  const { incomeData, updateIncome, user: finUser } = useFinancial();

  // Salary State
  const initialSalary = incomeData?.monthlyIncome || finUser?.monthlyIncome || userProfile?.monthlySalary || 75000;
  const [salaryInput, setSalaryInput] = useState<string>(initialSalary.toString());
  const [activeSalary, setActiveSalary] = useState<number>(initialSalary);
  const [isSaved, setIsSaved] = useState(false);

  // Allocation Sliders
  const [needsPct, setNeedsPct] = useState<number>(50);
  const [wantsPct, setWantsPct] = useState<number>(30);
  const [savingsPct, setSavingsPct] = useState<number>(20);

  useEffect(() => {
    const stored = localStorage.getItem('user_monthly_income');
    const currentInc = incomeData?.monthlyIncome || (stored ? Number(stored) : (userProfile?.monthlySalary || 75000));
    if (currentInc) {
      setSalaryInput(currentInc.toString());
      setActiveSalary(currentInc);
    }
  }, [incomeData, userProfile]);

  const handleSaveSalary = () => {
    const val = Number(salaryInput);
    if (val > 0) {
      setActiveSalary(val);
      updateIncome({ monthlyIncome: val });
      localStorage.setItem('user_monthly_income', val.toString());
      if (userProfile) userProfile.monthlySalary = val;
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const applyPreset = (n: number, w: number, s: number) => {
    setNeedsPct(n);
    setWantsPct(w);
    setSavingsPct(s);
  };

  const needsVal = Math.round(activeSalary * (needsPct / 100));
  const wantsVal = Math.round(activeSalary * (wantsPct / 100));
  const savingsVal = Math.round(activeSalary * (savingsPct / 100));

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* HEADER */}
      <div className="pt-6 pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Salary Planner
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Understand how your monthly income is split between Needs, Wants, and Savings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> 50-30-20 Smart Rule
          </span>
        </div>
      </div>

      {/* 1. SALARY INPUT & PRESET CARDS */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Your Monthly Salary
            </label>
            <div className="relative flex items-center max-w-xs">
              <span className="absolute left-3.5 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full h-11 pl-8 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-extrabold text-base focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSalary}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-end"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSaved ? 'Saved!' : 'Save Salary'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Quick Allocation Presets:</span>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => applyPreset(50, 30, 20)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                needsPct === 50 && wantsPct === 30 && savingsPct === 20
                  ? 'border-blue-500 bg-blue-600/20 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              50/30/20 Balanced Rule
            </button>
            <button
              onClick={() => applyPreset(60, 20, 20)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                needsPct === 60 && wantsPct === 20 && savingsPct === 20
                  ? 'border-blue-500 bg-blue-600/20 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              60/20/20 High Rent Safety
            </button>
            <button
              onClick={() => applyPreset(40, 20, 40)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                needsPct === 40 && wantsPct === 20 && savingsPct === 40
                  ? 'border-blue-500 bg-blue-600/20 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              40/20/40 Aggressive Wealth
            </button>
          </div>
        </div>
      </div>

      {/* 2. 50-30-20 BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Needs */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏠</span> Essentials (Needs)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              {needsPct}%
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{needsVal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Rent, utilities, food groceries, commuting
          </p>
        </div>

        {/* Wants */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📱</span> Lifestyle (Wants)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
              {wantsPct}%
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{wantsVal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dining out, shopping, hobbies, vacations
          </p>
        </div>

        {/* Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📈</span> Savings & SIPs
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
              {savingsPct}%
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{savingsVal.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mutual funds, emergency fund, investments
          </p>
        </div>
      </div>

      {/* 3. INTERACTIVE SLIDERS */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-indigo-400" />
            Custom Budget Adjuster
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Drag the sliders below to adjust your monthly allocation ratio
          </p>
        </div>

        <div className="space-y-4">
          {/* Needs Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-200">
              <span>Essentials (Needs)</span>
              <span>₹{needsVal.toLocaleString('en-IN')} ({needsPct}%)</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={needsPct}
              onChange={(e) => setNeedsPct(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-emerald-400 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>

          {/* Wants Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-200">
              <span>Lifestyle (Wants)</span>
              <span>₹{wantsVal.toLocaleString('en-IN')} ({wantsPct}%)</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={wantsPct}
              onChange={(e) => setWantsPct(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-sky-400 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>

          {/* Savings Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-200">
              <span>Investments & Savings</span>
              <span>₹{savingsVal.toLocaleString('en-IN')} ({savingsPct}%)</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={savingsPct}
              onChange={(e) => setSavingsPct(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-purple-400 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
export default SalaryPlanner;
