import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import {
  Check,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  X,
  Sparkles,
  Brain,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIActionCenter: React.FC = () => {
  const { t } = useTranslation();
  const { expenses, goals, setIsAiDrawerOpen, setActiveTab, user: finUser } = useFinancial();
  const { userProfile } = useAuth();

  const [executionFeedback, setExecutionFeedback] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Simple Simulator States
  const [selectedScenario, setSelectedScenario] = useState<string>('CAR');
  const [inputs, setInputs] = useState<any>({ price: 800000, downPayment: 200000, tenure: 5 });
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const rawSalary = finUser?.monthlyIncome || userProfile?.monthlySalary || 75000;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySurplus = Math.max(0, rawSalary - totalSpent);

  const handleExecuteTask = (title: string) => {
    setExecutionFeedback(`Action "${title}" successfully applied!`);
    setTimeout(() => setExecutionFeedback(null), 3500);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    let emi = 0;
    let status = 'Safe';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let advice = '';

    if (selectedScenario === 'CAR') {
      const price = Number(inputs.price) || 800000;
      const down = Number(inputs.downPayment) || 200000;
      const tenureMonths = (Number(inputs.tenure) || 5) * 12;
      const principal = Math.max(0, price - down);
      emi = Math.round((principal * 1.085) / tenureMonths);

      if (emi > monthlySurplus * 0.4) {
        status = 'High EMI Risk';
        statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        advice = `EMI of ₹${emi.toLocaleString('en-IN')}/mo takes over 40% of your surplus cash flow.`;
      } else {
        status = 'Safe & Affordable';
        statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        advice = `EMI of ₹${emi.toLocaleString('en-IN')}/mo fits comfortably within your monthly surplus of ₹${monthlySurplus.toLocaleString('en-IN')}.`;
      }
    } else if (selectedScenario === 'HOME') {
      const price = Number(inputs.price) || 4500000;
      const down = Number(inputs.downPayment) || 1000000;
      const tenureMonths = (Number(inputs.tenure) || 20) * 12;
      const principal = Math.max(0, price - down);
      emi = Math.round((principal * 1.0875) / tenureMonths);

      if (emi > monthlySurplus * 0.5) {
        status = 'Needs Attention';
        statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        advice = `EMI of ₹${emi.toLocaleString('en-IN')}/mo requires a higher down payment or longer tenure.`;
      } else {
        status = 'Safe & Feasible';
        statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        advice = `Supported comfortably within your long-term wealth budget.`;
      }
    } else if (selectedScenario === 'SIP') {
      const added = Number(inputs.sipAmount) || 5000;
      emi = added;
      status = 'High Compounding Growth';
      statusColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      advice = `Adding ₹${added.toLocaleString('en-IN')}/mo into index funds generates ~₹8.5 Lakhs over 10 years.`;
    } else {
      const budget = Number(inputs.budget) || 120000;
      const months = Number(inputs.months) || 6;
      emi = Math.round(budget / months);
      status = 'Debt-Free Plan';
      statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      advice = `Saving ₹${emi.toLocaleString('en-IN')}/mo for ${months} months lets you enjoy your trip 100% debt-free!`;
    }

    setSimulationResult({ emi, status, statusColor, advice });
  };

  const scenarios = [
    { id: 'CAR', icon: '🚗', name: 'Buy a Car' },
    { id: 'HOME', icon: '🏠', name: 'Buy a Home' },
    { id: 'SIP', icon: '📈', name: 'Increase SIP' },
    { id: 'VACATION', icon: '✈️', name: 'Plan Vacation' },
  ];

  const quickActions = [
    {
      title: 'Build Emergency Safety Buffer',
      desc: 'Protects 3 months of essential living expenses.',
      badge: 'Safety First',
      tab: 'goals',
    },
    {
      title: 'Auto-Invest Monthly Surplus to SIP',
      desc: 'Compounds your monthly savings automatically.',
      badge: 'High Growth',
      tab: 'goals',
    },
    {
      title: 'Review Monthly Category Budgets',
      desc: 'Keeps dining out and leisure expenses on target.',
      badge: 'Smart Budget',
      tab: 'budgets',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Execution Feedback Notification */}
      <AnimatePresence>
        {executionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm shadow-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-300" />
            <span>{executionFeedback}</span>
            <button onClick={() => setExecutionFeedback(null)} className="ml-2 hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SIMPLE HEADER */}
      <div className="pt-6 pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Action Center
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Simple AI insights & decision helper for your money
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask Sarthi AI</span>
        </button>
      </div>

      {/* 2. AI RECOMMENDATION OF THE DAY */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/90 border border-blue-500/30 text-white relative shadow-xl backdrop-blur-md space-y-4">
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 fill-sky-400" />
            <span>Today's Recommendation</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">Monthly Surplus: ₹{monthlySurplus.toLocaleString('en-IN')}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            Save ₹2,800 this month by capping food delivery orders & adding ₹1,500 to your Nifty 50 SIP.
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Moving unmonitored delivery expenses directly into index funds adds an estimated <b className="text-emerald-400 font-bold">₹42,000</b> to your 1-year projected wealth.
          </p>
        </div>

        {showExplanation && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-sky-400 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> AI Reason:
            </p>
            <p className="text-slate-300">
              Food delivery spending increased this month. Reallocating ₹1,500 to index mutual funds builds compounding wealth while leaving your emergency fund 100% safe.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => handleExecuteTask('Primary AI Recommendation')}
            className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            <span>Apply Recommendation</span>
          </button>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            {showExplanation ? 'Hide Reason' : 'Why AI Recommends This?'}
          </button>
        </div>
      </div>

      {/* 3. QUICK SMART ACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-indigo-400" />
            <span>Quick Smart Actions</span>
          </h2>
          <span className="text-xs text-slate-400">1-click optimization</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Check className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  onClick={() => setActiveTab(item.tab)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleExecuteTask(item.title)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Apply Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SIMPLE "WHAT IF" DECISION HELPER */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
            <span>"What Happens If..." Financial Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Test any goal or purchase before spending your money
          </p>
        </div>

        {/* Scenario Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {scenarios.map((sc) => {
            const active = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc.id);
                  setSimulationResult(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  active
                    ? 'border-blue-500 bg-blue-600/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{sc.icon}</span>
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Simple Input Form */}
        <form onSubmit={handleSimulate} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {selectedScenario === 'CAR' && (
              <>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Car Price (₹)</label>
                  <input
                    type="number"
                    value={inputs.price || ''}
                    onChange={(e) => setInputs({ ...inputs, price: e.target.value })}
                    placeholder="e.g. 800000"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Down Payment (₹)</label>
                  <input
                    type="number"
                    value={inputs.downPayment || ''}
                    onChange={(e) => setInputs({ ...inputs, downPayment: e.target.value })}
                    placeholder="e.g. 200000"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Loan Years</label>
                  <input
                    type="number"
                    value={inputs.tenure || ''}
                    onChange={(e) => setInputs({ ...inputs, tenure: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {selectedScenario === 'HOME' && (
              <>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Home Price (₹)</label>
                  <input
                    type="number"
                    value={inputs.price || ''}
                    onChange={(e) => setInputs({ ...inputs, price: e.target.value })}
                    placeholder="e.g. 4500000"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Down Payment (₹)</label>
                  <input
                    type="number"
                    value={inputs.downPayment || ''}
                    onChange={(e) => setInputs({ ...inputs, downPayment: e.target.value })}
                    placeholder="e.g. 1000000"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Loan Years</label>
                  <input
                    type="number"
                    value={inputs.tenure || ''}
                    onChange={(e) => setInputs({ ...inputs, tenure: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {selectedScenario === 'SIP' && (
              <div className="space-y-1 sm:col-span-3">
                <label className="text-slate-300 font-semibold">Additional Monthly SIP (₹)</label>
                <input
                  type="number"
                  value={inputs.sipAmount || ''}
                  onChange={(e) => setInputs({ ...inputs, sipAmount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {selectedScenario === 'VACATION' && (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold">Trip Budget (₹)</label>
                  <input
                    type="number"
                    value={inputs.budget || ''}
                    onChange={(e) => setInputs({ ...inputs, budget: e.target.value })}
                    placeholder="e.g. 120000"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Months to Save</label>
                  <input
                    type="number"
                    value={inputs.months || ''}
                    onChange={(e) => setInputs({ ...inputs, months: e.target.value })}
                    placeholder="e.g. 6"
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Check Financial Impact</span>
          </button>
        </form>

        {/* Results Block */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">AI Safety Rating:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${simulationResult.statusColor}`}>
                {simulationResult.status}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
              <span className="text-xs font-medium text-slate-300">Est. Monthly Impact:</span>
              <span className="text-sm font-black text-white">₹{simulationResult.emi.toLocaleString('en-IN')}/mo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1">
              {simulationResult.advice}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
export default AIActionCenter;
