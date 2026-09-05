import React, { useState, useEffect, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import { useGoals } from '../hooks/useGoals';

import {
  Sparkles,
  Wallet,
  TrendingUp,
  ArrowRight,
  Building,
  CheckCircle,
  PiggyBank,
  Check,
  Info,
  Sliders,
  ArrowDown,
  ChevronRight,
  Activity,
  Zap,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export const SalaryPlanner: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, user: fbUser } = useAuth();

  const { setActiveTab, incomeData, updateIncome, setIsAiDrawerOpen, user: finUser } = useFinancial();
  const { goals } = useGoals();

  // Local salary input states
  const [salaryInput, setSalaryInput] = useState<string>(
    incomeData?.monthlyIncome?.toString() || finUser?.monthlyIncome?.toString() || userProfile?.monthlySalary?.toString() || '45000'
  );
  const [activeSalary, setActiveSalary] = useState<number>(
    incomeData?.monthlyIncome || finUser?.monthlyIncome || userProfile?.monthlySalary || 45000
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sliders percentage state (50/30/20 default splits)
  const [needsPct, setNeedsPct] = useState<number>(50);
  const [wantsPct, setWantsPct] = useState<number>(30);
  const [savingsPct, setSavingsPct] = useState<number>(20);

  // Interactive donut segment hover state
  const [hoveredSegment, setHoveredSegment] = useState<'needs' | 'wants' | 'savings' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user_monthly_income');
    const currentInc = incomeData?.monthlyIncome || (stored ? Number(stored) : (userProfile?.monthlySalary || finUser?.monthlyIncome || 45000));
    if (currentInc) {
      setSalaryInput(currentInc.toString());
      setActiveSalary(currentInc);
    }
  }, [incomeData, userProfile]);

  // Synchronize Investments & Savings with goals monthly allocations
  useEffect(() => {
    if (goals && goals.length > 0 && activeSalary > 0) {
      const totalGoalsContribution = goals.reduce((sum, g) => {
        return sum + (g.monthlyAllocation || 0);
      }, 0);
      const calculatedSavingsPct = Math.min(60, Math.max(10, Math.round((totalGoalsContribution / activeSalary) * 100)));
      if (calculatedSavingsPct !== savingsPct) {
        setSavingsPct(calculatedSavingsPct);
        const remaining = 100 - calculatedSavingsPct;
        setNeedsPct(Math.round(remaining * 0.625));
        setWantsPct(Math.round(remaining * 0.375));
      }
    }
  }, [goals, activeSalary]);

  // Handle salary edit input change
  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setSalaryInput(rawVal);
  };

  const handleSalaryBlur = () => {
    if (salaryInput) {
      const val = Number(salaryInput);
      if (val > 0) {
        setActiveSalary(val);
        handleSalarySave(val);
      }
    }
  };

  // Preset percentage split button handler
  const applyPresetSplit = (needs: number, wants: number, savings: number) => {
    setNeedsPct(needs);
    setWantsPct(wants);
    setSavingsPct(savings);
  };

  // Slider change handlers with auto-balancing 100% total
  const handleNeedsChange = (value: number) => {
    const remaining = 100 - value;
    const currentOtherTotal = wantsPct + savingsPct;
    if (currentOtherTotal === 0) {
      setWantsPct(Math.round(remaining / 2));
      setSavingsPct(Math.round(remaining / 2));
    } else {
      const newWants = Math.round((wantsPct / currentOtherTotal) * remaining);
      const newSavings = remaining - newWants;
      setWantsPct(newWants);
      setSavingsPct(newSavings);
    }
    setNeedsPct(value);
  };

  const handleWantsChange = (value: number) => {
    const remaining = 100 - value;
    const currentOtherTotal = needsPct + savingsPct;
    if (currentOtherTotal === 0) {
      setNeedsPct(Math.round(remaining / 2));
      setSavingsPct(Math.round(remaining / 2));
    } else {
      const newNeeds = Math.round((needsPct / currentOtherTotal) * remaining);
      const newSavings = remaining - newWants;
      setNeedsPct(newNeeds);
      setSavingsPct(newSavings);
    }
    setWantsPct(value);
  };

  const handleSavingsChange = (value: number) => {
    const remaining = 100 - value;
    const currentOtherTotal = needsPct + wantsPct;
    if (currentOtherTotal === 0) {
      setNeedsPct(Math.round(remaining / 2));
      setWantsPct(Math.round(remaining / 2));
    } else {
      const newNeeds = Math.round((needsPct / currentOtherTotal) * remaining);
      const newWants = remaining - newNeeds;
      setNeedsPct(newNeeds);
      setWantsPct(newWants);
    }
    setSavingsPct(value);
  };

  const handleGenerateAI = () => {
    if (salaryInput) {
      const val = Number(salaryInput);
      if (val > 0) {
        setActiveSalary(val);
        handleSalarySave(val);
      }
    }
    setNeedsPct(50);
    setWantsPct(30);
    setSavingsPct(20);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleSalarySave = async (val: number) => {
    localStorage.setItem('user_monthly_income', val.toString());
    await updateIncome({ monthlyIncome: val });
    if (!fbUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', fbUser.uid, 'profile', 'basic');
      await updateDoc(docRef, {
        monthlySalary: val,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations based on live sliders
  const needsVal = Math.round(activeSalary * (needsPct / 100));
  const wantsVal = Math.round(activeSalary * (wantsPct / 100));
  const savingsVal = Math.round(activeSalary * (savingsPct / 100));

  // Health indicator rule
  const getHealthIndicator = () => {
    if (savingsPct >= 35) return { label: 'Aggressive Wealth Building', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' };
    if (wantsPct >= 45) return { label: 'Lifestyle Heavy', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    if (needsPct >= 65) return { label: 'Essentials Focus', color: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
    return { label: 'Balanced 50-30-20', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
  };

  const healthIndicator = getHealthIndicator();

  // Dynamic budget score calculator
  const budgetScore = useMemo(() => {
    const deviation = Math.abs(needsPct - 50) + Math.abs(wantsPct - 30) + Math.abs(savingsPct - 20);
    return Math.max(40, 100 - deviation);
  }, [needsPct, wantsPct, savingsPct]);

  // Wealth Projections
  const wealth1Yr = (Math.round((savingsVal * 12.7) / 1000) / 100).toFixed(1);
  const wealth5Yr = (Math.round((savingsVal * 75) / 1000) / 100).toFixed(1);
  const wealth10Yr = (Math.round((savingsVal * 230) / 1000) / 100).toFixed(1);
  const wealth20Yr = (Math.round((savingsVal * 800) / 1000) / 100).toFixed(1);

  // Donut values config
  const circumference = 2 * Math.PI * 36; // 226.195
  const needsOffset = 0;
  const wantsOffset = (needsPct / 100) * circumference;
  const savingsOffset = ((needsPct + wantsPct) / 100) * circumference;

  return (
    <div className="bg-slate-950 text-slate-100 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 selection:bg-blue-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-sm shadow-2xl shadow-blue-500/30 border border-white/20 backdrop-blur-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-300" />
            <span>AI Budget generated & synchronized successfully ({`₹${activeSalary.toLocaleString('en-IN')}`}).</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="pt-6 pb-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-blue-500 to-purple-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Salary Planner
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
                Optimize monthly cash flow, 50-30-20 allocations & long-term wealth compounding
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${healthIndicator.color}`}>
            ● {healthIndicator.label}
          </span>
        </div>
      </div>

      {/* SECTION 1 — HERO SALARY INPUT CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Take-Home Monthly Salary
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Plan your monthly salary allocations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
            Enter your monthly net salary. FinanceSarthi will calculate exact Essentials, Lifestyle, and Investment budgets aligned with your financial goals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg relative z-10">
          <div className="relative h-12 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center px-4 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
            <span className="text-base font-bold text-slate-400 mr-2">₹</span>
            <input
              type="number"
              placeholder="e.g. 45000"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="w-full bg-transparent text-base font-bold text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleGenerateAI}
              disabled={isSaving}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer w-full sm:w-auto text-center active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Generate AI Budget'}
            </button>
          </div>
        </div>

        {/* Small metric chips layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-800/80 relative z-10">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Health</span>
            <span className="text-sm font-extrabold text-emerald-400">82/100 (Strong)</span>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget Allocation</span>
            <span className="text-sm font-extrabold text-indigo-400">{healthIndicator.label}</span>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Monthly Inflow</span>
            <span className="text-sm font-extrabold text-white">₹{activeSalary.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — INTERACTIVE BUDGET VISUALIZATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Your AI Budget Breakdown
          </h2>
          <span className="text-xs text-slate-400 font-medium">Standard 50-30-20 Rule</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Block (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative bg-slate-900/80 border border-slate-800 p-6 rounded-3xl h-72 shadow-xl backdrop-blur-md">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Essentials Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeDasharray={`${(needsPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-needsOffset}
                  onMouseEnter={() => setHoveredSegment('needs')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="cursor-pointer transition-all hover:stroke-[9px] duration-150"
                />
                {/* Lifestyle Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="7"
                  strokeDasharray={`${(wantsPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-wantsOffset}
                  onMouseEnter={() => setHoveredSegment('wants')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="cursor-pointer transition-all hover:stroke-[9px] duration-150"
                />
                {/* Savings Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="7"
                  strokeDasharray={`${(savingsPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-savingsOffset}
                  onMouseEnter={() => setHoveredSegment('savings')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="cursor-pointer transition-all hover:stroke-[9px] duration-150"
                />
              </svg>

              {/* Centered dynamically updated content */}
              <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none select-none">
                {hoveredSegment ? (
                  <>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      {hoveredSegment === 'needs' ? 'Essentials' : hoveredSegment === 'wants' ? 'Lifestyle' : 'Savings'}
                    </span>
                    <span className="text-base font-extrabold text-white mt-0.5 block">
                      {hoveredSegment === 'needs' ? `${needsPct}%` : hoveredSegment === 'wants' ? `${wantsPct}%` : `${savingsPct}%`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Total Income</span>
                    <span className="text-base font-extrabold text-white mt-0.5 block">₹{activeSalary.toLocaleString('en-IN')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details breakdown cards (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            {[
              {
                title: 'Essentials (Needs)',
                icon: '🏠',
                value: needsVal,
                pct: needsPct,
                border: 'border-l-4 border-l-emerald-500 border-slate-800',
                bg: 'bg-emerald-950/20',
                categories: 'Rent, electricity bills, groceries, transit commuting',
                pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              },
              {
                title: 'Lifestyle (Wants)',
                icon: '📱',
                value: wantsVal,
                pct: wantsPct,
                border: 'border-l-4 border-l-blue-500 border-slate-800',
                bg: 'bg-blue-950/20',
                categories: 'Dining out, subscriptions, shopping, leisure travels',
                pillColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
              },
              {
                title: 'Investments & Savings',
                icon: '📈',
                value: savingsVal,
                pct: savingsPct,
                border: 'border-l-4 border-l-purple-500 border-slate-800',
                bg: 'bg-purple-950/20',
                categories: 'Emergency cushion cash, mutual fund SIPs, equity investments',
                pillColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${item.border} ${item.bg} flex items-center justify-between gap-4 shadow-md backdrop-blur-md`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-bold text-white">{item.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-normal block max-w-sm">
                    {item.categories}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-white block">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.pillColor} inline-block mt-1`}>
                    {item.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3 — SMART BUDGET CUSTOMIZATION (Interactive Sliders) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            Smart Budget Customization
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Budget Score</span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              {budgetScore}/100
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 backdrop-blur-md shadow-xl">
          {/* Essentials slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">🏠</span>
                <span>Essentials (Needs)</span>
              </div>
              <div className="space-x-2">
                <span className="text-slate-300">₹{needsVal.toLocaleString('en-IN')}</span>
                <span className="text-emerald-400 font-extrabold">{needsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={needsPct}
              onChange={(e) => handleSliderChange('needs', Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-slate-950 border border-slate-800"
            />
          </div>

          {/* Lifestyle slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <span>Lifestyle (Wants)</span>
              </div>
              <div className="space-x-2">
                <span className="text-slate-300">₹{wantsVal.toLocaleString('en-IN')}</span>
                <span className="text-blue-400 font-extrabold">{wantsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={wantsPct}
              onChange={(e) => handleSliderChange('wants', Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-400 bg-slate-950 border border-slate-800"
            />
          </div>

          {/* Savings slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">📈</span>
                <span>Investments & Savings</span>
              </div>
              <div className="space-x-2">
                <span className="text-slate-300">₹{savingsVal.toLocaleString('en-IN')}</span>
                <span className="text-purple-400 font-extrabold">{savingsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={savingsPct}
              onChange={(e) => handleSliderChange('savings', Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-400 bg-slate-950 border border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4 — MONTHLY CASH FLOW DIAGRAM */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Monthly Cash Flow Diagram
        </h2>
        
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* INCOME CARD (Left Column) */}
            <div className="md:col-span-4 w-full">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-32 w-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Monthly Income</span>
                  <Wallet className="h-5 w-5 text-blue-400 shrink-0" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white leading-none">₹{activeSalary.toLocaleString('en-IN')}</h4>
                  <span className="text-xs text-slate-400 block font-medium mt-1">100% Resource Allocation</span>
                </div>
              </div>
            </div>

            {/* CONNECTOR (Middle Column) */}
            <div className="md:col-span-1 hidden md:flex items-center justify-center">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <ChevronRight className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div className="flex md:hidden justify-center my-1 text-indigo-400">
              <ArrowDown className="h-6 w-6 animate-bounce" />
            </div>

            {/* DESTINATION CARDS (Right Column Stacked Vertically) */}
            <div className="md:col-span-7 w-full space-y-3">
              
              {/* NEEDS CARD */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Essentials (Needs)</span>
                    <h4 className="text-sm font-extrabold text-white">₹{needsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                  {needsPct}%
                </span>
              </div>

              {/* WANTS CARD */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 border-l-4 border-l-blue-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lifestyle (Wants)</span>
                    <h4 className="text-sm font-extrabold text-white">₹{wantsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold text-xs">
                  {wantsPct}%
                </span>
              </div>

              {/* SAVINGS CARD */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 border-l-4 border-l-purple-500 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Investments & Savings</span>
                    <h4 className="text-sm font-extrabold text-white">₹{savingsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold text-xs">
                  {savingsPct}%
                </span>
              </div>

            </div>

          </div>

          {/* ALLOCATION / SURPLUS HEALTH BANNER */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Flow Allocation Balance</span>
            {activeSalary - (needsVal + wantsVal + savingsVal) === 0 ? (
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2">
                <Check className="h-4 w-4" /> 100% Fully Allocated (Zero Waste)
              </div>
            ) : (
              <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-2">
                <Info className="h-4 w-4" /> Unallocated Surplus: ₹{(activeSalary - (needsVal + wantsVal + savingsVal)).toLocaleString('en-IN')}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 5 — GOAL PROGRESS */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Savings & Active Goal Progress
        </h2>
        
        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));
              const radius = 18;
              const circ = 2 * Math.PI * radius; // 113.097

              return (
                <div key={g.goalId || g.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-white block">{g.goalName || g.title}</span>
                    <span className="text-xs text-slate-400 block font-medium">
                      ₹{current.toLocaleString('en-IN')} of ₹{target.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block pt-1">
                      Est. Completion: {g.estimatedCompletionDate || g.targetDate}
                    </span>
                  </div>

                  {/* Radial progress ring (Right) */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.5"
                        strokeDasharray={`${circ} ${circ}`}
                        strokeDashoffset={circ - (pct / 100) * circ}
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl py-12">
            No active financial goals yet. Create your first goal to track progress.
          </div>
        )}
      </div>

      {/* SECTION 6 — AI SUGGESTIONS */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          AI Wealth Optimization Suggestion
        </h2>
        
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider block">Proactive Optimization</span>
              <p className="font-bold text-white text-base">"Redirect ₹2,000 monthly food delivery savings into index SIPs."</p>
              <p className="text-slate-300 leading-relaxed font-normal">
                By capping non-essential dining expenses, compounding an extra ₹2,000 monthly in equity index funds yields an estimated <strong>₹11.8 Lakhs long-term wealth gain</strong> over 20 years.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs font-medium text-slate-400">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block font-bold">Estimated Benefit</span>
              <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">₹11.8 Lakhs</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block font-bold">Risk Level</span>
              <span className="text-white font-bold block mt-0.5">Low</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block font-bold">Confidence</span>
              <span className="text-indigo-400 font-bold block mt-0.5">95%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block font-bold">Execution Time</span>
              <span className="text-white font-bold block mt-0.5">30 seconds</span>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              Why?
            </button>
            <button
              onClick={() => handleSliderChange('savings', Math.min(80, savingsPct + 5))}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Apply Optimization
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7 — FUTURE PROJECTION (Compound Line Chart) */}
      <div className="space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Compound Wealth Projection (12% CAGR)
        </h2>

        {/* Compound Line Chart Sparkline */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Investment Compounding</span>
            <span className="text-xs font-extrabold text-indigo-400">Monthly SIP: ₹{savingsVal.toLocaleString('en-IN')}</span>
          </div>

          {/* Exponential line chart SVG */}
          <div className="h-36 w-full bg-slate-950 rounded-2xl border border-slate-800 p-3 relative flex items-end">
            <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
              <path
                d={`M 10 70 Q 50 65, 100 48 T 190 10`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                className="transition-all duration-300"
              />
              <circle cx="10" cy="70" r="3.5" fill="#6366f1" />
              <circle cx="55" cy="62" r="3.5" fill="#6366f1" />
              <circle cx="100" cy="48" r="3.5" fill="#6366f1" />
              <circle cx="145" cy="28" r="3.5" fill="#6366f1" />
              <circle cx="190" cy="10" r="3.5" fill="#6366f1" />

              <text x="10" y="79" fontSize="6" fontWeight="bold" fill="#64748b" textAnchor="middle">Today</text>
              <text x="55" y="79" fontSize="6" fontWeight="bold" fill="#64748b" textAnchor="middle">1 Yr</text>
              <text x="100" y="79" fontSize="6" fontWeight="bold" fill="#64748b" textAnchor="middle">5 Yr</text>
              <text x="145" y="79" fontSize="6" fontWeight="bold" fill="#64748b" textAnchor="middle">10 Yr</text>
              <text x="190" y="79" fontSize="6" fontWeight="bold" fill="#64748b" textAnchor="middle">20 Yr</text>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1-Year Wealth</span>
            <span className="text-sm font-extrabold text-white">₹{wealth1Yr} L</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5-Year Wealth</span>
            <span className="text-sm font-extrabold text-white">₹{wealth5Yr} L</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">10-Year Wealth</span>
            <span className="text-sm font-extrabold text-indigo-400">₹{wealth10Yr} L</span>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-1 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">20-Year Wealth</span>
            <span className="text-sm font-extrabold text-purple-400">₹{wealth20Yr} L</span>
          </div>
        </div>
      </div>

      {/* SECTION 8 — TAX SAVINGS OPPORTUNITY */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Tax Optimization Strategy
        </h2>
        
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Tax Slab Comparison (Old vs New Regime)</span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Save up to ₹46,800</span>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-300">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Standard Tax Outflow</span>
                <span className="text-slate-400">₹54,600</span>
              </div>
              <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Optimized Tax (With 80C ELSS & 80D Health)</span>
                <span className="text-emerald-400 font-extrabold">₹7,800</span>
              </div>
              <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
            <span className="text-xs text-slate-400 leading-relaxed max-w-md">
              Potentially save up to ₹46,800 under Section 80C ELSS Mutual Funds and Section 80D health policies.
            </span>
            <button
              onClick={() => setActiveTab('calculators')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              View Full Tax Comparison
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
export default SalaryPlanner;
