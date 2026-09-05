import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/i18n';
import { EditIncomeModal } from '../components/EditIncomeModal';
import {
  Sparkles,
  Wallet,
  Target,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Edit3,
  X,
  ShieldCheck,
} from 'lucide-react';

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 80;
  const height = 24;
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
    <svg className="h-5 w-14" viewBox={`0 0 ${width} ${height}`}>
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
    healthScore,
    setActiveTab,
    incomeData,
    syncStatus,
    setIsAiDrawerOpen,
  } = useFinancial();

  const { userProfile, user: fbUser } = useAuth();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(true);

  // Computations
  const storedSalary = localStorage.getItem('user_monthly_income');
  const totalMonthlyIncome = incomeData?.totalIncome || (storedSalary ? Number(storedSalary) : (userProfile?.monthlySalary || 75000));
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySurplus = Math.max(0, totalMonthlyIncome - totalExpenses);
  const score = healthScore.score;

  const needsVal = Math.round(totalMonthlyIncome * 0.50);
  const wantsVal = Math.round(totalMonthlyIncome * 0.30);
  const investmentsVal = Math.round(totalMonthlyIncome * 0.20);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('good_morning');
    if (hrs < 17) return t('good_afternoon');
    return t('good_evening_title');
  };

  const displayName = userProfile?.displayName || fbUser?.displayName || 'Earner';

  const cardClass = "p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700";

  return (
    <div className="space-y-4 select-none max-w-7xl mx-auto px-2 sm:px-4 overflow-hidden">
      
      {/* 1. COMPACT TOP HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-850 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {getGreeting()}, {displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You're projected to save ₹{(monthlySurplus * 12).toLocaleString('en-IN')} this year.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-500" />
            <span>Update Salary</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{syncStatus === 'SYNCED' ? 'Online' : 'Syncing'}</span>
          </div>
        </div>
      </div>

      {/* 2. 4 PRIMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Income */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('monthly_income')}</span>
            <Wallet className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ₹{totalMonthlyIncome.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-850">
            <span className="text-emerald-500 font-bold">+4% inflow</span>
            <Sparkline data={[75000, 75000, 75000, totalMonthlyIncome]} color="#3b82f6" />
          </div>
        </div>

        {/* KPI 2: Expenses */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('monthly_expenses')}</span>
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-850">
            <span>{expenses.length} transactions</span>
            <Sparkline data={[20000, 24000, 21000, totalExpenses]} color="#f59e0b" />
          </div>
        </div>

        {/* KPI 3: Savings */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('net_savings')}</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ₹{monthlySurplus.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-850">
            <span className="text-emerald-500 font-bold">{totalMonthlyIncome > 0 ? Math.round((monthlySurplus / totalMonthlyIncome) * 100) : 0}% savings rate</span>
            <Sparkline data={[50000, 52000, monthlySurplus]} color="#10b981" />
          </div>
        </div>

        {/* KPI 4: Financial Health */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('financial_health')}</span>
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {score}<span className="text-xs font-normal text-slate-400">/1000</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-850">
            <span className="text-sky-400 font-bold">Grade: Strong</span>
            <Sparkline data={[750, 765, score]} color="#6366f1" />
          </div>
        </div>

      </div>

      {/* 3. MAIN SPLIT GRID (LEFT: GOALS + AI RECS | RIGHT: BUDGET HEALTH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN (7 COLS): GOAL TARGETS & AI INSIGHT */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* AI Recommendation Banner */}
          {showRecommendation && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 text-white relative">
              <button
                onClick={() => setShowRecommendation(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="space-y-1 pr-6">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                    {t('todays_recommendation')}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {t('increase_sip_recommendation')}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setIsAiDrawerOpen(true)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm"
                    >
                      {t('apply_recommendation')}
                    </button>
                    <button
                      onClick={() => setIsAiDrawerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      {t('why')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goal Targets Card */}
          <div className={cardClass + " space-y-3"}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Target className="h-4 w-4 text-blue-500" />
                {t('goal_progress')}
              </span>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{t('manage_goals')}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-2.5">
                {goals.slice(0, 2).map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{g.title}</span>
                        <span className="font-bold text-blue-500">₹{g.currentAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('no_active_goals')}</p>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {t('create_first_goal')}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (5 COLS): BUDGET HEALTH & CASH FLOW */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* 50/30/20 Budget Health Card */}
          <div className={cardClass + " space-y-3"}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {t('budget_health')}
              </span>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {t('review_budget')}
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: t('needs_housing'), spent: needsVal, limit: Math.round(totalMonthlyIncome * 0.50), color: 'bg-emerald-500' },
                { name: t('wants_leisure'), spent: wantsVal, limit: Math.round(totalMonthlyIncome * 0.30), color: 'bg-indigo-500' },
                { name: t('savings_sips'), spent: investmentsVal, limit: Math.round(totalMonthlyIncome * 0.20), color: 'bg-sky-400' },
              ].map((item, idx) => {
                const pct = Math.min(100, Math.round((item.spent / item.limit) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>{item.name}</span>
                      <span>₹{item.spent.toLocaleString('en-IN')} / ₹{item.limit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>{t('monthly_remaining')}</span>
              <span className="font-extrabold text-slate-900 dark:text-white">₹{(totalMonthlyIncome * 0.45).toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Income Modal */}
      {isEditOpen && (
        <EditIncomeModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSaveSuccess={() => setIsEditOpen(false)}
        />
      )}

    </div>
  );
};
export default Dashboard;
