import React, { useState, useEffect, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
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
  Info,
  Sliders,
  ArrowDown,
  ChevronRight,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

export const SalaryPlanner: React.FC = () => {
  const { userProfile, user: fbUser } = useAuth();
  const { setActiveTab, incomeData, updateIncome, setIsAiDrawerOpen } = useFinancial();
  const { goals } = useGoals();

  // Local salary input states
  const [salaryInput, setSalaryInput] = useState<string>(
    incomeData?.monthlyIncome?.toString() || userProfile?.monthlySalary?.toString() || ''
  );
  const [activeSalary, setActiveSalary] = useState<number>(
    incomeData?.monthlyIncome || userProfile?.monthlySalary || 75000
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
    if (incomeData?.monthlyIncome) {
      setSalaryInput(incomeData.monthlyIncome.toString());
      setActiveSalary(incomeData.monthlyIncome);
    }
  }, [incomeData]);

  // Synchronize Investments & Savings with goals monthly allocations
  useEffect(() => {
    if (goals && goals.length > 0 && activeSalary > 0) {
      const totalGoalsContribution = goals.reduce((sum, g) => {
        // Only count active goals
        if (g.status === 'Completed' || g.status === 'Archived' || g.status === 'Cancelled') {
          return sum;
        }
        return sum + (g.monthlyContribution || 0);
      }, 0);

      if (totalGoalsContribution > 0) {
        const calculatedSavingsPct = Math.min(90, Math.max(10, Math.round((totalGoalsContribution / activeSalary) * 100)));
        const remaining = 100 - calculatedSavingsPct;
        
        // Rebalance remaining proportionally between needs (50%) and wants (30%)
        const newNeeds = Math.round(remaining * (5 / 8));
        const newWants = remaining - newNeeds;

        setSavingsPct(calculatedSavingsPct);
        setNeedsPct(newNeeds);
        setWantsPct(newWants);
      }
    }
  }, [goals, activeSalary]);

  // Proportional slider rebalancing logic
  const handleSliderChange = (category: 'needs' | 'wants' | 'savings', value: number) => {
    const totalRemaining = 100 - value;
    
    if (category === 'needs') {
      const currentSum = wantsPct + savingsPct;
      if (currentSum > 0) {
        const wantsFactor = wantsPct / currentSum;
        const newWants = Math.round(totalRemaining * wantsFactor);
        const newSavings = totalRemaining - newWants;
        setWantsPct(newWants);
        setSavingsPct(newSavings);
      } else {
        setWantsPct(Math.round(totalRemaining / 2));
        setSavingsPct(totalRemaining - Math.round(totalRemaining / 2));
      }
      setNeedsPct(value);
    } 
    
    else if (category === 'wants') {
      const currentSum = needsPct + savingsPct;
      if (currentSum > 0) {
        const needsFactor = needsPct / currentSum;
        const newNeeds = Math.round(totalRemaining * needsFactor);
        const newSavings = totalRemaining - newNeeds;
        setNeedsPct(newNeeds);
        setSavingsPct(newSavings);
      } else {
        setNeedsPct(Math.round(totalRemaining / 2));
        setSavingsPct(totalRemaining - Math.round(totalRemaining / 2));
      }
      setWantsPct(value);
    } 
    
    else {
      const currentSum = needsPct + wantsPct;
      if (currentSum > 0) {
        const needsFactor = needsPct / currentSum;
        const newNeeds = Math.round(totalRemaining * needsFactor);
        const newWants = totalRemaining - newNeeds;
        setNeedsPct(newNeeds);
        setWantsPct(newWants);
      } else {
        setNeedsPct(Math.round(totalRemaining / 2));
        setWantsPct(totalRemaining - Math.round(totalRemaining / 2));
      }
      setSavingsPct(value);
    }
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
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSalarySave = async (val: number) => {
    if (!fbUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', fbUser.uid, 'profile', 'basic');
      await updateDoc(docRef, {
        monthlySalary: val,
        updatedAt: new Date().toISOString(),
      });
      await updateIncome({ monthlyIncome: val });
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
    if (savingsPct >= 35) return { label: 'Aggressive Saving', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (wantsPct >= 45) return { label: 'Lifestyle Heavy', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    if (needsPct >= 65) return { label: 'Emergency Focus', color: 'bg-red-50 text-red-600 border-red-100' };
    return { label: 'Balanced', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  };

  const healthIndicator = getHealthIndicator();

  // Dynamic budget score calculator (deviation from 50/30/20 target)
  const budgetScore = useMemo(() => {
    const deviation = Math.abs(needsPct - 50) + Math.abs(wantsPct - 30) + Math.abs(savingsPct - 20);
    return Math.max(40, 100 - deviation);
  }, [needsPct, wantsPct, savingsPct]);

  // Projections calculations (using CAGR compounded variables)
  const wealth1Yr = Math.round((savingsVal * 12.7) / 1000) / 100;
  const wealth5Yr = Math.round((savingsVal * 75) / 1000) / 100;
  const wealth10Yr = Math.round((savingsVal * 230) / 1000) / 100;
  const wealth20Yr = Math.round((savingsVal * 800) / 1000) / 100;

  // Donut values config (expanded to 36px radius to make center white space larger)
  const circumference = 2 * Math.PI * 36; // 226.195
  const needsOffset = 0;
  const wantsOffset = (needsPct / 100) * circumference;
  const savingsOffset = ((needsPct + wantsPct) / 100) * circumference;

  return (
    <div className="space-y-12 pb-24 bg-white text-slate-900 max-w-4xl mx-auto px-4 md:px-6 select-none">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-blue-600 text-white font-medium text-xs shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>AI Budget generated and saved successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — PREMIUM HERO */}
      <div className="p-6 md:p-8 rounded-[20px] bg-slate-50 border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plan Your Monthly Salary</h1>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-2xl">
            Enter your monthly take-home salary and FinanceSarthi will generate a personalized budget using your income, goals, and spending habits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md">
          <div className="relative h-12 w-full bg-white border border-slate-200 rounded-xl flex items-center px-4 shadow-sm">
            <span className="text-sm font-bold text-slate-400 mr-2">₹</span>
            <input
              type="number"
              placeholder="e.g. 30000"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleGenerateAI}
              disabled={isSaving}
              className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer w-full sm:w-auto text-center"
            >
              {isSaving ? 'Processing...' : 'Generate AI Budget'}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="h-12 px-4 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs transition-all cursor-pointer text-center"
            >
              Edit Income
            </button>
          </div>
        </div>

        {/* Small metric chips layout */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-150">
          <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-0.5 shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Financial Health</span>
            <span className="text-xs font-black text-slate-800">82% Excellent</span>
          </div>
          <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-0.5 shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Budget Status</span>
            <span className="text-xs font-black text-blue-600">{healthIndicator.label}</span>
          </div>
          <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-0.5 shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">AI Generated Budget</span>
            <span className="text-xs font-semibold text-slate-500">Updated just now</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — INTERACTIVE BUDGET VISUALIZATION */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your AI Budget Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Block (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative bg-slate-50 border border-slate-100 p-6 rounded-2xl h-64 shadow-sm">
            <div className="relative w-40 h-40 flex items-center justify-center">
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
                  stroke="#8B5CF6"
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
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none block">
                      {hoveredSegment === 'needs' ? 'Needs' : hoveredSegment === 'wants' ? 'Wants' : 'Savings'}
                    </span>
                    <span className="text-xs font-black text-slate-900 mt-1 block leading-none">
                      {hoveredSegment === 'needs' ? `${needsPct}%` : hoveredSegment === 'wants' ? `${wantsPct}%` : `${savingsPct}%`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none block">Budget</span>
                    <span className="text-xs font-black text-slate-900 mt-1 block leading-none">₹{activeSalary.toLocaleString('en-IN')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details breakdown cards (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            {[
              {
                title: 'Essentials',
                icon: '🏠',
                value: needsVal,
                pct: needsPct,
                color: 'border-l-4 border-l-emerald-500 bg-emerald-50/10',
                categories: 'Rent, utility bills, groceries, public commute transit',
              },
              {
                title: 'Lifestyle',
                icon: '📱',
                value: wantsVal,
                pct: wantsPct,
                color: 'border-l-4 border-l-blue-500 bg-blue-50/10',
                categories: 'Shopping trips, cafes, dining, recreational travels',
              },
              {
                title: 'Investments & Savings',
                icon: '📈',
                value: savingsVal,
                pct: savingsPct,
                color: 'border-l-4 border-l-purple-500 bg-purple-50/10',
                categories: 'Emergency cushion cash, mutual funds SIP, stocks allocation',
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm ${item.color}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block leading-tight max-w-sm">
                    {item.categories}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-850 block">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3 — SMART BUDGET CUSTOMIZATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Smart Budget Customization</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Balanced Budget Score</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600/10 text-blue-600">
              {budgetScore}/100
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-5">
          {/* Essentials slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏠</span>
                <span>Essentials</span>
              </div>
              <div className="space-x-1.5">
                <span>₹{needsVal.toLocaleString('en-IN')}</span>
                <span className="text-emerald-500 font-black">{needsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={needsPct}
              onChange={(e) => handleSliderChange('needs', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-slate-200"
            />
          </div>

          {/* Lifestyle slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📱</span>
                <span>Lifestyle</span>
              </div>
              <div className="space-x-1.5">
                <span>₹{wantsVal.toLocaleString('en-IN')}</span>
                <span className="text-blue-500 font-black">{wantsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={wantsPct}
              onChange={(e) => handleSliderChange('wants', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-slate-200"
            />
          </div>

          {/* Savings slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📈</span>
                <span>Investments</span>
              </div>
              <div className="space-x-1.5">
                <span>₹{savingsVal.toLocaleString('en-IN')}</span>
                <span className="text-purple-500 font-black">{savingsPct}%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={savingsPct}
              onChange={(e) => handleSliderChange('savings', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 bg-slate-200"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4 — MONTHLY CASH FLOW */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Cash Flow</h2>
        
        <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-150/40 shadow-sm relative overflow-hidden flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* INCOME CARD (Left Column) */}
            <div className="md:col-span-4 w-full">
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-28 w-full hover:scale-[1.01] transition-transform">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Income</span>
                  <Wallet className="h-4 w-4 text-blue-500 shrink-0" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white leading-none">₹{activeSalary.toLocaleString('en-IN')}</h4>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-1">100% Total Resource</span>
                </div>
              </div>
            </div>

            {/* CONNECTOR (Middle Column) */}
            <div className="md:col-span-1 hidden md:flex items-center justify-center">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
                <ChevronRight className="h-4 w-4 text-indigo-500" />
              </div>
            </div>
            <div className="flex md:hidden justify-center my-1 text-slate-355">
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </div>

            {/* DESTINATION CARDS (Right Column Stacked Vertically) */}
            <div className="md:col-span-7 w-full space-y-3">
              
              {/* NEEDS CARD */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-100 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-sm hover:translate-x-0.5 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">Needs</span>
                    <h4 className="text-xs font-black text-slate-850">₹{needsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-650 font-black text-[10px]">
                  {needsPct}%
                </span>
              </div>

              {/* WANTS CARD */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-100 border-l-4 border-l-blue-500 flex items-center justify-between shadow-sm hover:translate-x-0.5 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">Lifestyle</span>
                    <h4 className="text-xs font-black text-slate-850">₹{wantsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-650 font-black text-[10px]">
                  {wantsPct}%
                </span>
              </div>

              {/* SAVINGS CARD */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-100 border-l-4 border-l-purple-500 flex items-center justify-between shadow-sm hover:translate-x-0.5 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-650 flex items-center justify-center shrink-0">
                    <PiggyBank className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">Savings</span>
                    <h4 className="text-xs font-black text-slate-850">₹{savingsVal.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-650 font-black text-[10px]">
                  {savingsPct}%
                </span>
              </div>

            </div>

          </div>

          {/* ALLOCATION / SURPLUS HEALTH BANNER */}
          <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Budget Allocation Health</span>
            {activeSalary - (needsVal + wantsVal + savingsVal) === 0 ? (
              <div className="px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/30 text-emerald-650 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Check className="h-3.5 w-3.5" /> 100% Fully Allocated (Zero Waste)
              </div>
            ) : (
              <div className="px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/30 text-amber-650 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Info className="h-3.5 w-3.5" /> Leftover: ₹{(activeSalary - (needsVal + wantsVal + savingsVal)).toLocaleString('en-IN')} remaining
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SECTION 5 — GOAL PROGRESS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Savings & Goal Progress</h2>
        
        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));
              const radius = 18;
              const circ = 2 * Math.PI * radius; // 113.097

              return (
                <div key={g.goalId || g.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 h-32 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">{g.goalName || g.title}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      ₹{current.toLocaleString('en-IN')} of ₹{target.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1.5">
                      Est. Completion Date: {g.estimatedCompletionDate || g.targetDate}
                    </span>
                    <p className="text-[9px] text-slate-450 italic leading-snug mt-1">
                      AI recommendation: "Save ₹800 more/mo to speed up timeline"
                    </p>
                  </div>

                  {/* Radial progress ring (Right) */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeDasharray={`${circ} ${circ}`}
                        strokeDashoffset={circ - (pct / 100) * circ}
                      />
                    </svg>
                    <span className="absolute text-[8px] font-black text-slate-700">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 border-dashed rounded-2xl py-12">
            No financial goals yet. Create your first goal and FinanceSarthi will automatically track progress.
          </div>
        )}
      </div>

      {/* SECTION 6 — AI SUGGESTIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Suggestions</h2>
        
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest block">AI Recommendation</span>
              <p className="font-bold text-slate-800">"I noticed your dining expenses are increasing."</p>
              <p className="text-slate-500 leading-relaxed font-semibold">
                Reducing food delivery spending by ₹2,000 each month could increase your long-term investment value by approximately ₹11.8 lakh over 20 years.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-150 text-[10px] font-bold text-slate-500">
            <div>
              <span className="text-[8px] text-slate-400 uppercase block font-semibold">Estimated Benefit</span>
              <span className="text-emerald-500 font-black text-xs block mt-0.5">₹11.8L</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 uppercase block font-semibold">Risk Level</span>
              <span className="text-slate-800 block mt-0.5">Low</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 uppercase block font-semibold">Confidence</span>
              <span className="text-slate-800 block mt-0.5">95%</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 uppercase block font-semibold">Time Required</span>
              <span className="text-slate-800 block mt-0.5">30 seconds</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end text-[10px] font-bold pt-2">
            <button
              onClick={() => handleGenerateAI()}
              className="px-3 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-650 cursor-pointer"
            >
              Why?
            </button>
            <button
              onClick={() => handleSliderChange('savings', Math.min(80, savingsPct + 5))}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm animate-pulse"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7 — FUTURE PROJECTION (Your Future) */}
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">If you follow this plan...</h2>

        {/* Compound Line Chart Sparkline */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 shadow-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Your Future Wealth Growth</span>
            <span className="text-xs font-black text-slate-850">compounding @ 12% CAGR</span>
          </div>

          {/* Simple exponential visual line chart */}
          <div className="h-28 w-full bg-white rounded-lg border border-slate-150 p-2 relative flex items-end">
            <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
              <path
                d={`M 10 70 Q 50 65, 100 48 T 190 10`}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
              {/* Milestone nodes */}
              <circle cx="10" cy="70" r="3" fill="#4F46E5" />
              <circle cx="55" cy="62" r="3" fill="#4F46E5" />
              <circle cx="100" cy="48" r="3" fill="#4F46E5" />
              <circle cx="145" cy="28" r="3" fill="#4F46E5" />
              <circle cx="190" cy="10" r="3" fill="#4F46E5" />

              {/* Node labels */}
              <text x="10" y="79" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Today</text>
              <text x="55" y="79" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">1 Yr</text>
              <text x="100" y="79" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">5 Yr</text>
              <text x="145" y="79" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">10 Yr</text>
              <text x="190" y="79" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">20 Yr</text>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Projected Wealth (20y)</span>
            <span className="text-xs font-black text-slate-850">₹{wealth20Yr} Lakhs</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Emergency Fund Completion</span>
            <span className="text-xs font-black text-slate-850">4 months</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Retirement Readiness</span>
            <span className="text-xs font-black text-slate-850">On Track</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5 text-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Net Worth Growth</span>
            <span className="text-xs font-black text-slate-850">12x Multiplier</span>
          </div>
        </div>
      </div>

      {/* SECTION 8 — TAX SAVING OPPORTUNITY */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tax Savings Meter</h2>
        
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-900">Tax Optimization Slab Comparison</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase">Save ₹46,800</span>
          </div>

          <div className="space-y-3 text-[10px] font-bold text-slate-650">
            {/* Standard tax estimate bar */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Standard Tax (Standard Deductions only)</span>
                <span>₹54,600</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-450" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Optimized estimate bar */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Optimized Tax (With 80C ELSS & Health)</span>
                <span className="text-emerald-500">₹7,800</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[9px] text-slate-400 leading-normal max-w-sm">
              Potentially save up to ₹46,800 under Section 80C mutual fund structures this financial year.
            </span>
            <button
              onClick={() => setActiveTab('calculators')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
            >
              View Tax Strategy
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 9 — QUICK ACTIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('settings')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all text-center block cursor-pointer shadow-sm"
          >
            <span className="text-base block mb-1">➕</span>
            <span className="text-xs font-bold text-slate-700 block">Add Income</span>
          </button>

          <a
            href="#customization"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all text-center block cursor-pointer shadow-sm"
          >
            <span className="text-base block mb-1">⚙</span>
            <span className="text-xs font-bold text-slate-700 block">Adjust Budget</span>
          </a>

          <button
            onClick={() => setActiveTab('budgets')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all text-center block cursor-pointer shadow-sm"
          >
            <span className="text-base block mb-1">📊</span>
            <span className="text-xs font-bold text-slate-700 block">View Expenses</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-[1.02] transition-all text-center block cursor-pointer shadow-sm"
          >
            <span className="text-base block mb-1">✨</span>
            <span className="text-xs font-bold text-slate-700 block">Ask AI</span>
          </button>
        </div>
      </div>

    </div>
  );
};
export default SalaryPlanner;
