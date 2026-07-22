import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, calculateIndianTax } from '@financesarthi/utils';
import { Wallet, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { CityTier } from '@financesarthi/types';

export const SalaryPlanner: React.FC = () => {
  const { user, setUser } = useFinancial();
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(120000);

  const taxResult = calculateIndianTax(
    user.monthlyIncome,
    deductions80C,
    deductions80D,
    hraExemption
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            Salary & Tax Regime Planner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate your in-hand take-home pay under New vs Old Indian Income Tax Regimes (FY 2024-25 / 25-26).
          </p>
        </div>

        {/* City Tier Switcher */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-slate-300 font-semibold">City Tier:</span>
          {(['TIER_1', 'TIER_2', 'TIER_3'] as CityTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setUser(prev => ({ ...prev, cityTier: t }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                user.cityTier === t
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Salary & Deductions Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income Slider & Inputs */}
        <div className="p-6 rounded-3xl glass-card space-y-5">
          <h3 className="text-sm font-bold text-slate-200">1. Monthly Income Input</h3>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Gross Monthly Salary (₹)
            </label>
            <input
              type="number"
              value={user.monthlyIncome}
              onChange={(e) => setUser(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="range"
              min="20000"
              max="500000"
              step="5000"
              value={user.monthlyIncome}
              onChange={(e) => setUser(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
              className="w-full mt-3 accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Annual Gross Breakdown</h4>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Gross Annual Income:</span>
              <strong className="text-white">{formatCurrency(taxResult.grossAnnual)}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Monthly Basic Salary (~50%):</span>
              <strong className="text-slate-200">{formatCurrency(user.monthlyIncome * 0.5)}</strong>
            </div>
          </div>
        </div>

        {/* Deductions Configurator (For Old Regime) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200">2. Tax Deductions Configurator (Old Regime)</h3>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Standard Deduction: ₹75,000 (New) / ₹50,000 (Old)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 80C */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Section 80C (ELSS, PPF, EPF)
              </label>
              <input
                type="number"
                max="150000"
                value={deductions80C}
                onChange={(e) => setDeductions80C(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Max limit: ₹1.5 Lakhs</span>
            </div>

            {/* 80D */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Section 80D (Health Insurance)
              </label>
              <input
                type="number"
                max="75000"
                value={deductions80D}
                onChange={(e) => setDeductions80D(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Self & Parents</span>
            </div>

            {/* HRA */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                HRA Exemption Claim
              </label>
              <input
                type="number"
                value={hraExemption}
                onChange={(e) => setHraExemption(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Rent receipts required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Tax Regime Card */}
        <div
          className={`p-6 rounded-3xl glass-card border relative overflow-hidden transition-all ${
            taxResult.recommendedRegime === 'NEW'
              ? 'border-emerald-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30'
              : 'border-slate-800'
          }`}
        >
          {taxResult.recommendedRegime === 'NEW' && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Recommended
            </div>
          )}

          <h3 className="text-lg font-black text-white mb-1">New Tax Regime (Default)</h3>
          <p className="text-xs text-slate-400 mb-4">Concessional tax slabs with ₹75,000 standard deduction.</p>

          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Annual Tax Payable:</span>
              <strong className="text-rose-400 text-sm">{formatCurrency(taxResult.taxAmountNew)}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Monthly In-Hand Take Home:</span>
              <strong className="text-emerald-400 text-base">{formatCurrency(taxResult.monthlyTakeHomeNew)}</strong>
            </div>
          </div>
        </div>

        {/* Old Tax Regime Card */}
        <div
          className={`p-6 rounded-3xl glass-card border relative overflow-hidden transition-all ${
            taxResult.recommendedRegime === 'OLD'
              ? 'border-emerald-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30'
              : 'border-slate-800'
          }`}
        >
          {taxResult.recommendedRegime === 'OLD' && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Recommended
            </div>
          )}

          <h3 className="text-lg font-black text-white mb-1">Old Tax Regime</h3>
          <p className="text-xs text-slate-400 mb-4">Utilize full deductions under 80C, 80D, HRA & LTA.</p>

          <div className="space-y-3 border-t border-slate-800/80 pt-4">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Annual Tax Payable:</span>
              <strong className="text-rose-400 text-sm">{formatCurrency(taxResult.taxAmountOld)}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Monthly In-Hand Take Home:</span>
              <strong className="text-emerald-400 text-base">{formatCurrency(taxResult.monthlyTakeHomeOld)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-6 rounded-3xl glass-card bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Sarthi AI Regime Verdict: Choose {taxResult.recommendedRegime} Regime
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              By choosing the <strong className="text-emerald-400">{taxResult.recommendedRegime} Tax Regime</strong>, you will save approximately{' '}
              <strong className="text-emerald-400">{formatCurrency(taxResult.taxSaved)}</strong> in annual taxes!
            </p>
          </div>
        </div>

        <button className="py-2.5 px-5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all shrink-0 cursor-pointer">
          Apply to Profile
        </button>
      </div>
    </div>
  );
};
