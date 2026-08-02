import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '@financesarthi/utils';
import { incomeApi } from '../api/incomeApi';
import { Income } from '@financesarthi/types';
import { EditIncomeModal } from '../components/EditIncomeModal';
import {
  Sparkles,
  TrendingUp,
  Wallet,
  Target,
  ArrowUpRight,
  Bot,
  Send,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const {
    expenses,
    goals,
    healthScore,
    setActiveTab,
  } = useFinancial();

  const { userProfile, user: fbUser } = useAuth();
  
  // States
  const [askInput, setAskInput] = useState('');
  const [incomeData, setIncomeData] = useState<Income | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await incomeApi.getIncome();
        if (res.success && res.data) {
          setIncomeData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch active income profile:', err);
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await incomeApi.getSummary();
        if (res.success && res.data) {
          setSummaryData(res.data);
        }
      } catch (err) {
        console.warn('Calculations summary pending user onboarding profile');
      }
    };

    fetchIncome();
    fetchSummary();
  }, []);

  const handleDeleteClick = async () => {
    if (!incomeData) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your income profile? This will perform a soft delete.'
    );
    if (confirmDelete) {
      try {
        const res = await incomeApi.deleteIncome(incomeData.id);
        if (res.success) {
          setIncomeData(null);
          alert('Income profile soft deleted successfully!');
        } else {
          alert(res.message || 'Failed to delete income profile');
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred during deletion');
      }
    }
  };
  
  const displayName = userProfile?.displayName || fbUser?.displayName || 'Earner';
  const rawSalary = summaryData ? summaryData.summary.monthlyIncome : (incomeData ? incomeData.monthlyIncome : (userProfile?.monthlySalary || 85000));
  const averageMonthly = summaryData ? summaryData.summary.averageMonthlyIncome : rawSalary;
  
  // Custom Surplus Calculation
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const surplus = summaryData ? summaryData.summary.savingsPotential : (rawSalary - totalExpenses);
  
  // Dynamic Score scaled from healthScore (out of 1000) to out of 100
  const score = summaryData ? Math.round(summaryData.healthScore.score / 10) : Math.round((healthScore?.score || 840) / 10);
  const healthGrade = summaryData ? summaryData.healthScore.grade : 'Good';
  const explanation = summaryData ? summaryData.healthScore.explanation : 'Your financial indicators are stable but seek buffer improvements.';

  // Dynamic values for 50/30/20 Salary Split
  const needsVal = summaryData ? summaryData.charts.budgetSplit.find((b: any) => b.name === 'Needs')?.value || Math.round(averageMonthly * 0.5) : Math.round(averageMonthly * 0.5);
  const wantsVal = summaryData ? summaryData.charts.budgetSplit.find((b: any) => b.name === 'Wants')?.value || Math.round(averageMonthly * 0.3) : Math.round(averageMonthly * 0.3);
  const investmentsVal = summaryData ? summaryData.charts.budgetSplit.find((b: any) => b.name === 'Savings')?.value || Math.round(averageMonthly * 0.2) : Math.round(averageMonthly * 0.2);

  // Suggested Prompts
  const suggestedPrompts = [
    'Tax saving tips',
    'SIP Calculator',
  ];

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    // Redirect to chat and search/ask query
    setActiveTab('chat');
  };

  const handleSend = (text: string) => {
    // Redirect to chat and search/ask query
    setActiveTab('chat');
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 pb-16 select-none">
      
      {/* Top Banner Row */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, {displayName.split(' ')[0]}!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your financial roadmap looks steady today. You've saved 12% more than last month!
        </p>
      </div>

      {/* Main Content Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT & MIDDLE SECTION: MAIN KPI CARDS (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             {/* KPI CARD 1: FINANCIAL HEALTH SCORE */}
             <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                 Financial Health Score
               </span>
 
               {/* Semi-Circular SVG Gauge */}
               <div className="relative w-40 flex items-center justify-center">
                 <svg viewBox="0 0 100 55" className="w-full">
                   {/* Gray background arc */}
                   <path
                     d="M 10 50 A 40 40 0 0 1 90 50"
                     fill="none"
                     stroke="#F1F5F9"
                     strokeWidth="8"
                     strokeLinecap="round"
                     className="dark:stroke-slate-800"
                   />
                   {/* Blue progress arc */}
                   <path
                     d="M 10 50 A 40 40 0 0 1 90 50"
                     fill="none"
                     stroke="#2563EB"
                     strokeWidth="8"
                     strokeLinecap="round"
                     strokeDasharray="125.6"
                     strokeDashoffset={125.6 * (1 - score / 100)}
                     className="transition-all duration-1000 ease-out"
                   />
                 </svg>
                 {/* Inside Score text */}
                 <div className="absolute bottom-1 text-center">
                   <span className="text-3xl font-extrabold text-slate-900 dark:text-white block leading-none">{score * 10}</span>
                   <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Out of 1000</span>
                 </div>
               </div>
 
               {/* Bottom tag */}
               <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                 <TrendingUp className="h-3 w-3" />
                 <span>Grade: {healthGrade}</span>
               </div>
             </div>

            {/* KPI CARD 2: MONTHLY SURPLUS */}
            <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Monthly Surplus
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{surplus.toLocaleString('en-IN')}
                  </h3>
                </div>
                
                {/* Analytics icon button */}
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Vs. Previous Month</span>
                  <span className="text-emerald-500">+18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                </div>
              </div>

              {/* Bottom tip description */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                {summaryData?.aiInsights?.[0] || 'Great job! You save a steady share of your cash flow.'}
              </p>
            </div>

          </div>

          {/* Row 2: Wide Card - Salary Split */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Salary Split</h3>
                <span className="text-xs font-semibold text-slate-400">
                  ₹{rawSalary.toLocaleString('en-IN')} Total Monthly Credit
                </span>
              </div>
              <button
                onClick={() => setActiveTab('salary')}
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Modify
              </button>
            </div>

            {/* Content box: Donut SVG + Details */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-4">
              
              {/* Left Donut SVG Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Needs 50% */}
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
                  {/* Wants 30% */}
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
                  {/* Investments 20% */}
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
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block leading-none">50/30/20</span>
                  <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest block mt-1">Golden Rule</span>
                </div>
              </div>

              {/* Right Side details parameters */}
              <div className="flex-1 max-w-sm space-y-4">
                {[
                  { label: 'Needs & Rent', amount: needsVal, pct: '50%', color: 'bg-emerald-700' },
                  { label: 'Wants & Lifestyle', amount: wantsVal, pct: '30%', color: 'bg-indigo-600' },
                  { label: 'Investments', amount: investmentsVal, pct: '20%', color: 'bg-emerald-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">₹{item.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT SECTION: SIDEBAR WIDGETS (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 0: Income Profile Overview */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                Income Profile
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Edit
                </button>
                {incomeData && (
                  <button 
                    onClick={handleDeleteClick}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Monthly Income</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{(incomeData?.monthlyIncome ?? rawSalary).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Annual Income</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{(incomeData?.annualIncome ?? (rawSalary * 12)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Salary Type</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {incomeData?.salaryType || 'Salary'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Tax Regime</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {incomeData?.taxRegime || 'New'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Risk Profile</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {incomeData?.riskProfile || 'Balanced'}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Financial Health & Projections */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              AI Advisory & Projections
            </h3>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Health Analysis</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mt-1">
                  {explanation}
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Recommended Monthly SIP</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-black text-blue-600 dark:text-sky-400">
                    ₹{summaryData ? summaryData.summary.recommendedSip.monthlySip.toLocaleString('en-IN') : Math.round(averageMonthly * 0.2).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">20% capacity</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-normal">
                  Projected 10-Yr Equity Compound Yield: <b className="text-slate-800 dark:text-slate-200">₹{summaryData ? summaryData.summary.recommendedSip.expectedWealth10Years.toLocaleString('en-IN') : '...'}</b> (at 12% returns).
                </span>
              </div>

              {summaryData?.summary?.emergencyFund && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Emergency buffer progress</span>
                    <span className="text-emerald-500">{summaryData.summary.emergencyFund.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${summaryData.summary.emergencyFund.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5 leading-normal">
                    Target: ₹{summaryData.summary.emergencyFund.target.toLocaleString('en-IN')} | Gap: ₹{summaryData.summary.emergencyFund.gap.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 1: Goals Progress */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                Goals Progress
              </h3>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold">•••</button>
            </div>

            {/* List goals items */}
            <div className="space-y-4">
              {[
                { title: 'Emergency Fund', target: 200000, current: 145000, color: 'bg-emerald-500', time: '~4 months left' },
                { title: 'Bali Vacation', target: 120000, current: 42000, color: 'bg-indigo-500', time: '~9 months left' },
              ].map((g, idx) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs items-baseline font-bold">
                      <div>
                        <span className="text-slate-850 dark:text-slate-200 block">{g.title}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">Target: ₹{g.target.toLocaleString('en-IN')}</span>
                      </div>
                      <span className={`text-xs font-black ${g.color === 'bg-emerald-500' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        ₹{g.current.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress Bar bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${g.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>

                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block text-right">
                      {g.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* View All Goals Outline CTA */}
            <button
              onClick={() => setActiveTab('goals')}
              className="w-full h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              View All Goals
            </button>
          </div>

          {/* Card 2: Ask Sarthi AI Card (Royal blue theme widget) */}
          <div className="p-6 rounded-[24px] sarthi-card text-white space-y-4 shadow-xl relative overflow-hidden">
            
            {/* Decorative Sarthi sparkles glow */}
            <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ask Sarthi AI</h4>
                <span className="text-[9px] text-slate-300 font-medium block">Instant financial advice</span>
              </div>
            </div>

            {/* Prompt block bubble */}
            <div className="p-3.5 rounded-xl bg-white/10 text-[11px] font-semibold leading-relaxed border border-white/5 text-slate-100">
              "How much more can I invest in ELSS to save tax this year?"
            </div>

            {/* Chat Input form capsule */}
            <form onSubmit={handleAskSubmit} className="relative h-11 w-full bg-white/10 border border-white/10 rounded-xl flex items-center px-3.5">
              <input
                type="text"
                placeholder="Ask anything..."
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-300 focus:outline-none py-1.5"
              />
              <button type="submit" className="text-slate-200 hover:text-white cursor-pointer shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Quick tag suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestedPrompts.map((promptText, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSend(promptText)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[9px] font-bold text-slate-200 transition-all cursor-pointer"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: AI Financial Insights */}
          <div className="p-6 rounded-[24px] bg-[#0A1128] border border-blue-500/10 space-y-4 shadow-xl text-white">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-sky-400 shrink-0">
                <Lightbulb className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Financial Insights</h4>
            </div>

            <div className="space-y-3">
              {summaryData?.aiInsights ? (
                summaryData.aiInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-[10px] font-medium leading-relaxed text-slate-200">
                    <span className="text-sky-400 font-extrabold select-none">•</span>
                    <span>{insight}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Loading AI advisory insights based on your income profile...
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Income Profile Modal */}
      <EditIncomeModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentIncome={incomeData}
        onSaveSuccess={handleSaveSuccess}
      />

    </div>
  );
};
