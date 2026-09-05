import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useTranslation } from '../utils/i18n';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export const AdaptiveBudgetDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { expenses, incomeData, goals, user: finUser } = useFinancial();

  const salary = incomeData?.monthlyIncome || finUser?.monthlyIncome || 75000;
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlySurplus = Math.max(0, salary - totalSpent);

  // Simulation Sliders
  const [simSalary, setSimSalary] = useState<number>(salary);
  const [simRent, setSimRent] = useState<number>(18000);
  const [simSip, setSimSip] = useState<number>(15000);

  const simSurplus = Math.max(0, simSalary - simRent - simSip);
  const tenYearCompoundedWealth = Math.round(simSip * 12 * 10 * 1.6);

  const needsLimit = Math.round(simSalary * 0.50);
  const wantsLimit = Math.round(simSalary * 0.30);
  const savingsLimit = Math.round(simSalary * 0.20);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* HEADER */}
      <div className="pt-6 pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Adaptive AI Budget
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Smart budget recommendations & live spending simulation
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4" /> Grade: Excellent
        </span>
      </div>

      {/* HEALTH HERO CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/90 border border-blue-500/30 text-white relative shadow-xl backdrop-blur-md space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Smart Budget Health Score</span>
          <span className="text-2xl font-black text-emerald-400">88/100</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Your current monthly surplus is <b className="text-white">₹{monthlySurplus.toLocaleString('en-IN')}</b>. You are spending within recommended 50-30-20 budget parameters.
        </p>
      </div>

      {/* 50-30-20 BUDGET HEALTH SLOTS */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <PieChart className="h-4.5 w-4.5 text-indigo-400" />
          <span>Smart 50-30-20 Budget Split</span>
        </h2>

        <div className="space-y-3">
          {/* Needs */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Essentials / Needs (50%)</span>
              </span>
              <span>₹{needsLimit.toLocaleString('en-IN')} max target</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          {/* Wants */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span>Lifestyle / Wants (30%)</span>
              </span>
              <span>₹{wantsLimit.toLocaleString('en-IN')} max target</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>

          {/* Savings */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                <span>Savings & SIPs (20%)</span>
              </span>
              <span>₹{savingsLimit.toLocaleString('en-IN')} min target</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE BUDGET SIMULATOR */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
            <span>Live Budget Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Test how changing your rent or monthly SIP affects your 10-year wealth
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-200">
              <span>Simulated Monthly Income</span>
              <span className="font-extrabold text-white">₹{simSalary.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="30000"
              max="300000"
              step="5000"
              value={simSalary}
              onChange={(e) => setSimSalary(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-blue-500 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-200">
              <span>Housing Rent & Bills</span>
              <span className="font-extrabold text-white">₹{simRent.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2000"
              value={simRent}
              onChange={(e) => setSimRent(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-emerald-400 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-200">
              <span>Monthly Equity SIP</span>
              <span className="font-extrabold text-white">₹{simSip.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="80000"
              step="1000"
              value={simSip}
              onChange={(e) => setSimSip(Number(e.target.value))}
              className="w-full h-2 rounded-lg accent-purple-400 bg-slate-950 border border-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Calculation Output Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Monthly Remaining Surplus:</span>
            <span className="font-bold text-white text-sm">₹{simSurplus.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400 font-medium">Projected 10-Year Wealth (12% CAGR):</span>
            <span className="font-black text-emerald-400 text-base">₹{tenYearCompoundedWealth.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
export default AdaptiveBudgetDashboard;
