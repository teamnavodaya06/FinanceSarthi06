import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
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
  ChevronRight,
  ChevronLeft,
  Search,
  Calendar,
  Bell,
  TrendingDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const { userProfile } = useAuth();

  const displayName = userProfile?.displayName || user.name;

  // Calculation Metrics
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = user.monthlyIncome - totalExpenses;
  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.remaining, 0);
  const netWorth = totalAssets - totalLiabilities;

  // AI Carousel States
  const [insightIndex, setInsightIndex] = useState(0);
  const insights = [
    `You saved ₹8,400 more than last month. Consider moving ₹5,000 of it into a compound Equity SIP.`,
    `Emergency Fund is at 60% of target. Allocating ₹3,000 more this month secures your 6-month safety net early.`,
    `You are saving 18% of your gross income. Increase this to 20% to reach financial independence 3 years earlier.`,
  ];

  // Transaction Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(expenses.map((e) => e.category))];

  // Upcoming Bills mock data
  const upcomingBills = [
    { id: 'b1', title: 'Rent payment', date: 'In 3 days', amount: 18000, category: 'HOUSING' },
    { id: 'b2', title: 'Electricity bill', date: 'In 5 days', amount: 2400, category: 'UTILITIES' },
    { id: 'b3', title: 'Internet subscription', date: 'In 10 days', amount: 999, category: 'UTILITIES' },
  ];

  const handleNextInsight = () => {
    setInsightIndex((prev) => (prev + 1) % insights.length);
  };

  const handlePrevInsight = () => {
    setInsightIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Welcome Panel & Financial Health Summary */}
      <div className="p-8 rounded-[24px] bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Good Evening, {displayName.split(' ')[0]} 👋
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Financial Health: <strong className="text-emerald-400 font-semibold">{healthScore.grade}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Score: <strong className="text-sky-400 font-semibold">{healthScore.score}</strong>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">+12 this month</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            You saved {formatCurrency(8400)} more than last month. Your AI advisor has recommended 3 optimizations.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('expenses')}
            className="h-[48px] px-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:border-slate-700 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Add Expense
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="h-[48px] px-6 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Bot className="h-4 w-4" />
            <span>Talk to AI</span>
          </button>
        </div>
      </div>

      {/* 2. Premium KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Income', val: user.monthlyIncome, icon: Wallet, color: 'text-sky-400', trend: '+4% vs last month', up: true },
          { label: 'Total Expenses', val: totalExpenses, icon: Receipt, color: 'text-rose-400', trend: '-2% vs last month', up: false },
          { label: 'Net Savings', val: netSavings, icon: TrendingUp, color: 'text-emerald-400', trend: '+14% vs last month', up: true },
          { label: 'Net Worth', val: netWorth, icon: Target, color: 'text-purple-400', trend: '+₹45K compound', up: true },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-5 rounded-[24px] bg-slate-900/35 border border-slate-800 flex flex-col justify-between h-[130px] transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div>
                <h4 className="text-xl font-bold tracking-tight text-white">{formatCurrency(kpi.val)}</h4>
                <span className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${kpi.up ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Core Grid: Health breakdown, Flow chart, AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Indicators */}
        <div className="p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Indicators</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Financial Pillars</h3>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { label: 'Savings Ratio', score: healthScore.savingsRatioScore, max: 300, pct: 75, color: 'bg-blue-600' },
              { label: 'Emergency Fund Safety', score: 180, max: 250, pct: 72, color: 'bg-sky-500' },
              { label: 'Debt Health', score: healthScore.debtToIncomeScore, max: 250, pct: 88, color: 'bg-emerald-500' },
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">{p.label}</span>
                  <span className="text-slate-200 font-bold">{p.score} / {p.max}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Visualization */}
        <div className="p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CASH FLOW DISTRIBUTION</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Monthly Flow Diagram</h3>
          </div>

          {/* Simple Sankey Style Graphic mapping Flows */}
          <div className="h-[160px] flex flex-col justify-between py-2 text-xs relative">
            <div className="flex justify-between items-center">
              <span className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-sky-400 font-bold">
                Income {formatCurrency(user.monthlyIncome, true)}
              </span>
              <span className="h-0.5 bg-slate-800 flex-1 mx-2 relative">
                <span className="absolute top-1/2 -translate-y-1/2 right-0 h-1.5 w-1.5 rounded-full bg-sky-400" />
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                Expenses {formatCurrency(totalExpenses, true)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold ml-12">
                Surplus {formatCurrency(netSavings, true)}
              </span>
              <span className="h-0.5 bg-slate-800 flex-1 mx-2 relative">
                <span className="absolute top-1/2 -translate-y-1/2 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">
                Investments {formatCurrency(netSavings * 0.6, true)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Carousel */}
        <div className="p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 flex flex-col justify-between h-[260px] lg:h-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">AI RECOMMENDATIONS</span>
              <div className="flex items-center gap-1.5">
                <button onClick={handlePrevInsight} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={handleNextInsight} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-[90px] flex items-start gap-3.5 pt-2">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {insights[insightIndex]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all cursor-pointer text-center"
            >
              Optimize Budget
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] transition-all cursor-pointer text-center"
            >
              View Plan
            </button>
          </div>
        </div>
      </div>

      {/* 4. Goals & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals Tracker */}
        <div className="lg:col-span-2 p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-sky-400" />
              Active Goals Progress
            </h3>
            <button onClick={() => setActiveTab('goals')} className="text-xs font-bold text-sky-400 hover:underline cursor-pointer">
              View All ({goals.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.slice(0, 2).map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              return (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">{g.title}</span>
                    <span className="text-sky-400">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{formatCurrency(g.currentAmount)} saved</span>
                    <span>Target: {formatCurrency(g.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Bills List */}
        <div className="p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-400" />
              Upcoming Bills
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Automated Reminders</span>
          </div>

          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{bill.title}</h4>
                  <span className="text-[10px] text-slate-500">{bill.date}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-xs font-extrabold text-white">{formatCurrency(bill.amount)}</span>
                  <button className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sky-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                    <Bell className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions Feed with Search & Filters */}
      <div className="p-6 rounded-[24px] bg-slate-900/30 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">Recent Transactions Feed</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Merchant / Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-900/20 transition-all">
                  <td className="py-3 px-3 font-semibold text-slate-200">{exp.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{exp.date}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    -{formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
