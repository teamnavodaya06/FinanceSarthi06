import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { HealthGauge } from '../components/HealthGauge';
import { formatCurrency } from '@financesarthi/utils';
import {
  TrendingUp,
  Wallet,
  Receipt,
  Target,
  ArrowUpRight,
  Sparkles,
  Plus,
  Bot,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const {
    user,
    expenses,
    goals,
    assets,
    liabilities,
    healthScore,
    budgetSummary,
    setActiveTab,
    setIsAiDrawerOpen,
  } = useFinancial();

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = user.monthlyIncome - totalExpenses;
  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.remaining, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-400 border border-blue-500/20">
              Personalized Dashboard
            </span>
            <span className="text-xs text-slate-400">• {user.cityTier} Earner Profile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your financial snapshot. Your health score is{' '}
            <span className="text-sky-400 font-bold">{healthScore.score}/1000</span> ({healthScore.grade}).
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:border-blue-500/40 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-sky-400" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Bot className="h-4 w-4 animate-pulse" />
            <span>Talk to Sarthi</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Health Gauge & Core Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Score Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl glass-card flex flex-col items-center justify-between relative overflow-hidden"
        >
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              Financial Health Score
            </h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Calculated</span>
          </div>

          <HealthGauge score={healthScore.score} grade={healthScore.grade} />

          {/* Health Score Breakdown pill list */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Savings Ratio</span>
              <span className="font-bold text-sky-400">{healthScore.savingsRatioScore}/300</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Debt Safety</span>
              <span className="font-bold text-sky-400">{healthScore.debtToIncomeScore}/250</span>
            </div>
          </div>
        </motion.div>

        {/* Monthly Snapshot Metric Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly Income Card */}
          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Monthly Gross Income</span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-2xl font-black text-white">{formatCurrency(user.monthlyIncome)}</h4>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Full allocation active (100%)</span>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Monthly Expenses</span>
              <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-2xl font-black text-white">{formatCurrency(totalExpenses)}</h4>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <span>{((totalExpenses / user.monthlyIncome) * 100).toFixed(1)}% of total income</span>
            </div>
          </div>

          {/* Net Monthly Savings */}
          <div className="p-5 rounded-3xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Monthly Net Surplus</span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-2xl font-black text-white">{formatCurrency(netSavings)}</h4>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-400 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Ready for SIP & Goal allocations</span>
            </div>
          </div>

          {/* Total Net Worth Summary */}
          <div className="p-5 rounded-3xl glass-card relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Total Net Worth</span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-2xl font-black text-white">{formatCurrency(netWorth)}</h4>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Assets: <strong className="text-sky-400">{formatCurrency(totalAssets, true)}</strong></span>
              <span>Debt: <strong className="text-rose-400">{formatCurrency(totalLiabilities, true)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & 50-30-20 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">AI Financial Insights & Recommendations</h3>
            </div>
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ask AI <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {healthScore.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 hover:border-blue-500/30 transition-all"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 50-30-20 Salary Split Overview */}
        <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">50-30-20 Budget Target</h3>
            <span className="text-[10px] font-semibold text-sky-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              {user.cityTier} Mode
            </span>
          </div>

          <div className="space-y-3">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Needs ({budgetSummary.needs.percentage}%)</span>
                <span className="text-blue-500">{formatCurrency(budgetSummary.needs.amount)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${budgetSummary.needs.percentage}%` }} />
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Wants ({budgetSummary.wants.percentage}%)</span>
                <span className="text-sky-400">{formatCurrency(budgetSummary.wants.amount)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${budgetSummary.wants.percentage}%` }} />
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Savings & SIP ({budgetSummary.savings.percentage}%)</span>
                <span className="text-cyan-400">{formatCurrency(budgetSummary.savings.amount)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${budgetSummary.savings.percentage}%` }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('salary')}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/30 text-xs font-bold text-slate-200 transition-all text-center cursor-pointer"
          >
            Customize Allocations
          </button>
        </div>
      </div>

      {/* Active Goals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Quick Summary */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-sky-400" />
              Active Goals Progress
            </h3>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              View All ({goals.length})
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">{g.title}</span>
                    <span className="text-sky-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{formatCurrency(g.currentAmount)} saved</span>
                    <span>Target: {formatCurrency(g.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-sky-400" />
              Recent Transactions
            </h3>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              Manage Expenses
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses.slice(0, 4).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{exp.title}</h4>
                  <span className="text-[10px] text-slate-500">{exp.category} • {exp.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-200 block">
                    -{formatCurrency(exp.amount)}
                  </span>
                  {exp.isRecurring && (
                    <span className="text-[9px] text-sky-400 font-semibold uppercase bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                      Recurring
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
