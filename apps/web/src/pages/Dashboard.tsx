import React, { useState, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
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
  Lightbulb,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  ArrowDownRight,
  X,
  Activity,
  User,
} from 'lucide-react';

// Helper Sparkline Component (Calm, minimalist inline SVG)
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 100;
  const height = 30;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="h-6 w-16" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    expenses,
    goals,
    assets,
    healthScore,
    setActiveTab,
    incomeData,
    updateIncome,
    syncStatus,
    setIsAiDrawerOpen,
  } = useFinancial();


  const { userProfile, user: fbUser } = useAuth();
  
  // Local States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [recommendationFeedback, setRecommendationFeedback] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(true);

  // Computations
  const totalMonthlyIncome = incomeData?.totalIncome || userProfile?.monthlySalary || 75000;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySurplus = Math.max(0, totalMonthlyIncome - totalExpenses);
  const score = healthScore.score;
  const healthGrade = healthScore.grade;

  const needsVal = Math.round(totalMonthlyIncome * 0.55);
  const wantsVal = Math.round(totalMonthlyIncome * 0.25);
  const investmentsVal = Math.round(totalMonthlyIncome * 0.20);

  // Reusable styling classes following design guidelines
  const cardClass = "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md";
  const titleClass = "text-lg font-semibold text-slate-900 dark:text-white mb-4";
  const sectionTitleClass = "text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-between";

  // Quick Greetings
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userProfile?.displayName || fbUser?.displayName || 'Earner';

  // Apply AI Recommendation Handler
  const handleApplyRecommendation = async () => {
    setRecommendationFeedback('Applying SIP Optimization...');
    try {
      // Simulate backend update & sync FDSL context
      if (incomeData) {
        const currentInvestment = Number(incomeData.investmentIncome) || 0;
        const updated = await incomeApi.updateIncome(incomeData.id, {
          investmentIncome: currentInvestment + 2500
        });
        if (updated.success && updated.data) {
          await updateIncome(updated.data);
          setRecommendationFeedback('Success! Nifty 50 Index SIP has been increased by ₹2,500. Projected annual wealth: +₹61,000.');
        } else {
          setRecommendationFeedback('Failed to apply recommendation. Please update manually.');
        }
      } else {
        setRecommendationFeedback('No active income profile. Set up your profile first.');
      }
    } catch (err: any) {
      setRecommendationFeedback(err.message || 'Error executing request.');
    }
  };

  const handleSaveSuccess = async (updated: Income) => {
    // FDSL context handles sync automatically
  };

  return (
    <div className="space-y-8 pb-16 select-none max-w-7xl mx-auto px-4 md:px-6">
      
      {/* SECTION 1: GREETING & CONTEXT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-150 dark:border-slate-800/60 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {getGreeting()}, {displayName.split(' ')[0]}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            You're projected to save ₹{(monthlySurplus * 12).toLocaleString('en-IN')} this year. You're ahead of your savings goal by 12%.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start md:self-auto">
          <span className={`h-2 w-2 rounded-full ${
            syncStatus === 'SYNCED' ? 'bg-emerald-500 animate-pulse' :
            syncStatus === 'SYNCING' ? 'bg-amber-500 animate-bounce' :
            syncStatus === 'OFFLINE' ? 'bg-slate-400' : 'bg-red-500'
          }`} />
          <span className="text-slate-600 dark:text-slate-400">
            {syncStatus === 'SYNCED' ? 'Online & Synced' :
             syncStatus === 'SYNCING' ? 'Syncing updates...' :
             syncStatus === 'OFFLINE' ? 'Offline Mode' :
             'Sync Error'}
          </span>
        </div>
      </div>

      {/* SECTION 2: FINANCIAL SNAPSHOT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI Card 1: Monthly Income */}
        <div className={cardClass}>
          <div className="flex justify-between items-start text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Monthly Income</span>
            <span className="text-emerald-500">+4%</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalMonthlyIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-850">
            <span className="text-xs font-medium text-slate-500">Steady stream</span>
            <Sparkline data={[75000, 75000, 75000, 75000, totalMonthlyIncome]} color="#3b82f6" />
          </div>
        </div>

        {/* KPI Card 2: Monthly Expenses */}
        <div className={cardClass}>
          <div className="flex justify-between items-start text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Monthly Expenses</span>
            <span className="text-amber-500">-2%</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-850">
            <span className="text-xs font-medium text-slate-500">6 transactions</span>
            <Sparkline data={[22000, 24000, 21000, 26000, totalExpenses]} color="#f59e0b" />
          </div>
        </div>

        {/* KPI Card 3: Net Savings */}
        <div className={cardClass}>
          <div className="flex justify-between items-start text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Net Savings</span>
            <span className="text-emerald-500">+8%</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{monthlySurplus.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-850">
            <span className="text-xs font-medium text-slate-500">Savings rate {totalMonthlyIncome > 0 ? Math.round((monthlySurplus / totalMonthlyIncome) * 100) : 0}%</span>
            <Sparkline data={[53000, 51000, 54000, 49000, monthlySurplus]} color="#10b981" />
          </div>
        </div>

        {/* KPI Card 4: Financial Health */}
        <div className={cardClass}>
          <div className="flex justify-between items-start text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Financial Health</span>
            <span className="text-emerald-500">Strong</span>
          </div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {score}/1000
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-850">
            <span className="text-xs font-medium text-slate-500">Grade: {healthGrade}</span>
            <Sparkline data={[750, 765, 780, 775, score]} color="#6366f1" />
          </div>
        </div>

      </div>

      {/* SECTION 3: TODAY'S HERO AI RECOMMENDATION */}
      {showRecommendation && (
        <div className="p-6 rounded-2xl sarthi-card shadow-lg text-white relative overflow-hidden">
          {/* Absolute Top-Right Dismiss Button */}
          <button
            onClick={() => setShowRecommendation(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-all cursor-pointer z-20 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg"
            title="Dismiss Recommendation"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Glow backdrop decorator */}
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                <span>Today's Recommendation</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold leading-tight text-white">
                Increase your Nifty 50 Index SIP by ₹2,500.
              </h2>
              <p className="text-xs text-slate-300">
                Your monthly cash flow has a surplus of ₹{monthlySurplus.toLocaleString('en-IN')}. Moving ₹2,500 to equity investments raises your 10-year projected wealth by <b className="text-emerald-400">₹61,000</b>.
              </p>

              {recommendationFeedback && (
                <div className="p-2.5 rounded-lg bg-white/10 text-xs font-semibold text-slate-200 mt-2 animate-in fade-in duration-200">
                  {recommendationFeedback}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 mr-8">
              <button
                onClick={handleApplyRecommendation}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/15"
              >
                Apply Recommendation
              </button>
              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Why?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4 & 5: GOALS PROGRESS & BUDGET HEALTH SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 4: GOAL PROGRESS (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={sectionTitleClass}>
            <span>Goal Progress</span>
            <button 
              onClick={() => setActiveTab('goals')}
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Manage Goals
            </button>
          </div>

          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.slice(0, 3).map((g) => {
                const pct = g.completionPercentage ?? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                return (
                  <div key={g.id} className={cardClass + " space-y-3"}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{g.title}</h4>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                          Target: ₹{g.targetAmount.toLocaleString('en-IN')} | Remaining: ₹{remaining.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-blue-600 dark:text-sky-400 block">
                          ₹{g.currentAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{pct}% complete</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    {/* Bottom details & AI optimization suggestion */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px] font-medium text-slate-400">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        Est. Completion: {g.estimatedCompletionDate || 'Dec 2026'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                          Add ₹1,200/mo to finish 8mo early
                        </span>
                        <button 
                          onClick={() => setActiveTab('goals')}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Contribute
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={cardClass + " flex flex-col items-center justify-center text-center p-8 space-y-3"}>
                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-450 dark:text-slate-500">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">No active goals yet</span>
                  <span className="text-xs text-slate-500 dark:text-slate-450 block font-medium">Create a goal to start tracking and optimizing your progress.</span>
                </div>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: BUDGET HEALTH (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={sectionTitleClass}>
            <span>Budget Health</span>
            <button 
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Review Budget
            </button>
          </div>

          <div className={cardClass + " space-y-4"}>
            
            {/* Health indicators */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Monthly Remaining</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{(totalMonthlyIncome * 0.45).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Projected End Balance</span>
                <span className="text-sm font-extrabold text-emerald-500">₹{(monthlySurplus + 12000).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Allocation rows */}
            <div className="space-y-3 pt-1">
              {[
                { name: 'Needs & Housing', spent: needsVal, limit: Math.round(totalMonthlyIncome * 0.50), color: 'bg-emerald-600', status: 'GREEN' },
                { name: 'Wants & Leisure', spent: wantsVal, limit: Math.round(totalMonthlyIncome * 0.30), color: 'bg-indigo-600', status: 'YELLOW' },
                { name: 'Savings & SIPs', spent: investmentsVal, limit: Math.round(totalMonthlyIncome * 0.20), color: 'bg-emerald-400', status: 'GREEN' },
              ].map((item, idx) => {
                const pct = Math.min(100, Math.round((item.spent / item.limit) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          item.status === 'GREEN' ? 'bg-emerald-500' :
                          item.status === 'YELLOW' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {item.name}
                      </span>
                      <span>₹{item.spent.toLocaleString('en-IN')} / ₹{item.limit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 6 & 7: CASH FLOW & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 6: CASH FLOW TREND (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={sectionTitleClass}>
            <span>Cash Flow</span>
          </div>

          <div className={cardClass + " space-y-4"}>
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Income</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹{totalMonthlyIncome.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Expenses</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-500">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Cash flow Mini bar chart SVG */}
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Monthly Cash Trend</span>
              <div className="h-28 w-full flex items-end justify-between gap-2 pt-2 border-b border-slate-100 dark:border-slate-800/80 pb-1">
                {[
                  { month: 'Mar', inc: 70, exp: 40 },
                  { month: 'Apr', inc: 72, exp: 48 },
                  { month: 'May', inc: 75, exp: 45 },
                  { month: 'Jun', inc: 75, exp: 52 },
                  { month: 'Jul', inc: totalMonthlyIncome / 1000, exp: totalExpenses / 1000 },
                ].map((bar, idx) => {
                  const scale = 0.8;
                  const incHeight = Math.max(10, bar.inc * scale);
                  const expHeight = Math.max(5, bar.exp * scale);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full flex gap-1 items-end justify-center h-20">
                        {/* Income Bar */}
                        <div 
                          className="w-2 bg-emerald-500 rounded-t-sm" 
                          style={{ height: `${incHeight}%` }}
                          title={`Income: ₹${(bar.inc * 1000).toLocaleString('en-IN')}`}
                        />
                        {/* Expense Bar */}
                        <div 
                          className="w-2 bg-amber-500 rounded-t-sm" 
                          style={{ height: `${expHeight}%` }}
                          title={`Expense: ₹${(bar.exp * 1000).toLocaleString('en-IN')}`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{bar.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: RECENT TRANSACTIONS (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className={sectionTitleClass}>
            <span>Recent Transactions</span>
            <button 
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              See Analysis
            </button>
          </div>

          <div className={cardClass + " divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden"}>
            {expenses.length > 0 ? (
              expenses.slice(0, 5).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-500">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{exp.title}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{exp.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{exp.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                No recent transactions found
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 8 & 9: UPCOMING EVENTS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 8: UPCOMING EVENTS (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className={sectionTitleClass}>
            <span>Upcoming Financial Events</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Nifty SIP Auto-Debit', amount: '₹15,000', detail: 'Allocated on 05th Aug', icon: Calendar, badge: 'AUTO-DEBIT' },
              { title: 'HDFC Car Loan EMI', amount: '₹12,500', detail: 'Due on 10th Aug', icon: CreditCard, badge: 'LOAN_EMI' },
              { title: 'Credit Card Bill Due', amount: '₹8,450', detail: 'Due on 15th Aug', icon: CreditCard, badge: 'BILL' },
              { title: 'Tax Declarations Q3', amount: 'Deadline', detail: 'Due in 22 days', icon: Activity, badge: 'TAX' },
            ].map((ev, idx) => (
              <div key={idx} className={cardClass + " flex flex-col justify-between h-28"}>
                <div className="flex justify-between items-start gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                    <ev.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                    {ev.badge}
                  </span>
                </div>
                
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{ev.title}</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xs font-black text-slate-850 dark:text-white">{ev.amount}</span>
                    <span className="text-[9px] text-slate-500 font-medium">{ev.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: QUICK ACTIONS (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className={sectionTitleClass}>
            <span>Quick Actions</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('expenses')}
              className={cardClass + " flex flex-col justify-between h-28 text-left hover:border-blue-500/50 cursor-pointer"}
            >
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Add Expense</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Log custom receipt</span>
              </div>
            </button>

            <button
              onClick={() => setIsEditOpen(true)}
              className={cardClass + " flex flex-col justify-between h-28 text-left hover:border-blue-500/50 cursor-pointer"}
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Update Income</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Edit baseline revenue</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={cardClass + " flex flex-col justify-between h-28 text-left hover:border-blue-500/50 cursor-pointer"}
            >
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Create Goal</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Set savings target</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={cardClass + " flex flex-col justify-between h-28 text-left hover:border-blue-500/50 cursor-pointer"}
            >
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Ask Sarthi AI</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Copilot sidebar chat</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 10: COLLAPSIBLE DETAILED ANALYTICS */}
      <div className="space-y-4">
        <button
          onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-bold text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-600" />
            <span>Detailed Analytics</span>
          </div>
          {isAnalyticsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isAnalyticsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-3 duration-200">
            {/* Chart 1: Expense Category Distribution */}
            <div className={cardClass}>
              <h3 className={titleClass}>Expense Category Analysis</h3>
              <div className="space-y-3">
                {[
                  { category: 'Housing & Rent', amount: 18000, pct: 31, color: 'bg-indigo-600' },
                  { category: 'Food & Groceries', amount: 8400, pct: 15, color: 'bg-sky-400' },
                  { category: 'Investments', amount: 15000, pct: 26, color: 'bg-emerald-450' },
                  { category: 'Car Loan EMI', amount: 12500, pct: 22, color: 'bg-amber-500' },
                  { category: 'Others', amount: 4199, pct: 6, color: 'bg-slate-400' },
                ].map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                      <span>{c.category}</span>
                      <span>₹{c.amount.toLocaleString('en-IN')} ({c.pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Net Worth Projections (Assets vs Liabilities) */}
            <div className={cardClass + " flex flex-col justify-between"}>
              <div>
                <h3 className={titleClass}>Net Worth Summary</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Assets</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Liabilities</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{assets.filter(a => a.id === 'liab').reduce((sum, a) => sum + a.value, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stacked indicator bar representation */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block">Asset Allocation</span>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '45%' }} title="Bank & Liquid Cache (45%)" />
                  <div className="h-full bg-indigo-500" style={{ width: '35%' }} title="Mutual Funds & Stocks (35%)" />
                  <div className="h-full bg-amber-500" style={{ width: '20%' }} title="Gold & EPF (20%)" />
                </div>
                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Liquid</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Equity</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Alternatives</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
