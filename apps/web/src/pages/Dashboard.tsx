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
  Zap,
  CheckCircle2,
  PieChart,
  Calendar,
} from 'lucide-react';

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 90;
  const height = 28;
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
        strokeWidth="2.5"
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

  const cardClass = "p-6 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800/80 shadow-xl backdrop-blur-md transition-all hover:border-slate-700 hover:shadow-2xl flex flex-col justify-between space-y-4";

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto px-4 md:px-6 py-4">
      
      {/* 1. GREETING & CONTEXT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug flex items-center gap-2.5">
            <span>{getGreeting()}, {displayName.split(' ')[0]}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            You're projected to save <b className="text-emerald-400 font-bold">₹{(monthlySurplus * 12).toLocaleString('en-IN')}</b> this year. You're ahead of your savings target by 12%.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-bold transition-all cursor-pointer border border-slate-700 shadow-md shadow-slate-950/40 hover:-translate-y-0.5"
          >
            <Edit3 className="h-4 w-4 text-sky-400" />
            <span>Update Salary</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            <span className={`h-2.5 w-2.5 rounded-full ${
              syncStatus === 'SYNCED' ? 'bg-emerald-500 animate-pulse' :
              syncStatus === 'SYNCING' ? 'bg-amber-500 animate-bounce' : 'bg-slate-400'
            }`} />
            <span>{syncStatus === 'SYNCED' ? 'Online & Synced' : 'Syncing updates...'}</span>
          </div>
        </div>
      </div>

      {/* 2. 4 PRIMARY SNAPSHOT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Monthly Income */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
            <span>{t('monthly_income')}</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-2 py-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              ₹{totalMonthlyIncome.toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+4% monthly growth</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
            <span>Steady stream</span>
            <Sparkline data={[75000, 75000, 75000, totalMonthlyIncome]} color="#3b82f6" />
          </div>
        </div>

        {/* KPI 2: Monthly Expenses */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
            <span>{t('monthly_expenses')}</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Receipt className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-2 py-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
              <span>{expenses.length} transactions recorded</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
            <span className="text-emerald-400">Budget under control</span>
            <Sparkline data={[20000, 24000, 21000, totalExpenses]} color="#f59e0b" />
          </div>
        </div>

        {/* KPI 3: Net Savings */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
            <span>{t('net_savings')}</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-2 py-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              ₹{monthlySurplus.toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" />
              <span>{totalMonthlyIncome > 0 ? Math.round((monthlySurplus / totalMonthlyIncome) * 100) : 0}% savings rate</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
            <span>High surplus</span>
            <Sparkline data={[50000, 52000, monthlySurplus]} color="#10b981" />
          </div>
        </div>

        {/* KPI 4: Financial Health Score */}
        <div className={cardClass}>
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
            <span>{t('financial_health')}</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-2 py-1">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none flex items-baseline gap-1.5">
              <span>{score}</span>
              <span className="text-base font-bold text-slate-500">/1000</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
              <span>Grade: EXCELLENT</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
            <span className="text-emerald-400">Top 10% in Tier</span>
            <Sparkline data={[750, 765, score]} color="#6366f1" />
          </div>
        </div>

      </div>

      {/* 3. MAIN SPLIT CONTENT GRID (LEFT 7 COLS / RIGHT 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 COLS): TODAY'S AI RECOMMENDATION & GOAL TARGETS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Recommendation Highlight Card */}
          {showRecommendation && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/90 border border-blue-500/35 text-white relative shadow-2xl backdrop-blur-md space-y-4">
              <button
                onClick={() => setShowRecommendation(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                title="Dismiss Recommendation"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-lg shadow-blue-500/10">
                  <Sparkles className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <div className="space-y-2.5 pr-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-widest">
                    <span>{t('todays_recommendation')}</span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                    {t('increase_sip_recommendation')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Your monthly cash flow has a surplus of ₹{monthlySurplus.toLocaleString('en-IN')}. Moving ₹2,500 to equity investments raises your 10-year projected wealth by <b className="text-emerald-400 font-bold">₹61,000</b>.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsAiDrawerOpen(true)}
                      className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      {t('apply_recommendation')}
                    </button>
                    <button
                      onClick={() => setIsAiDrawerOpen(true)}
                      className="px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                    >
                      {t('why')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goal Targets Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4.5 w-4.5 text-blue-500" />
                  <span>{t('goal_progress')}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Target milestones & SIP corpus progress</p>
              </div>

              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{t('manage_goals')}</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  const remaining = Math.max(0, g.targetAmount - g.currentAmount);
                  return (
                    <div key={g.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-white leading-tight">{g.title}</h4>
                          <span className="text-xs text-slate-400 font-medium block">
                            Target: ₹{g.targetAmount.toLocaleString('en-IN')} | Remaining: ₹{remaining.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-sky-400 block">
                            ₹{g.currentAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 block mt-0.5">{pct}% complete</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800/70 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
                  <Target className="h-6 w-6 text-sky-400" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-base font-bold text-white">{t('no_active_goals')}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t('no_active_goals_desc')}</p>
                </div>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {t('create_first_goal')}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (5 COLS): 50/30/20 BUDGET HEALTH */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="h-4.5 w-4.5 text-indigo-400" />
                  <span>{t('budget_health')}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Smart 50-30-20 budget allocation</p>
              </div>

              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
              >
                {t('review_budget')}
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                { name: t('needs_housing'), spent: needsVal, limit: Math.round(totalMonthlyIncome * 0.50), color: 'bg-emerald-500', pct: 50 },
                { name: t('wants_leisure'), spent: wantsVal, limit: Math.round(totalMonthlyIncome * 0.30), color: 'bg-indigo-500', pct: 30 },
                { name: t('savings_sips'), spent: investmentsVal, limit: Math.round(totalMonthlyIncome * 0.20), color: 'bg-sky-400', pct: 20 },
              ].map((item, idx) => {
                const filledPct = Math.min(100, Math.round((item.spent / item.limit) * 100));
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2.5 transition-all hover:border-slate-700/70">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span className="leading-snug">{item.name} ({item.pct}%)</span>
                      </span>
                      <span className="font-bold text-slate-300 shrink-0 ml-2">
                        ₹{item.spent.toLocaleString('en-IN')} / ₹{item.limit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${filledPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950/80 to-slate-900/80 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-medium text-slate-400">{t('monthly_remaining')}</span>
                <span className="font-black text-white text-base">₹{(totalMonthlyIncome * 0.45).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-medium text-slate-400">{t('projected_end_balance')}</span>
                <span className="font-black text-emerald-400 text-base">₹{(monthlySurplus + 12000).toLocaleString('en-IN')}</span>
              </div>
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
