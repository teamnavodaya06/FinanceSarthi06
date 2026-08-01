import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '@financesarthi/utils';
import { ExpenseCategory } from '@financesarthi/types';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Search,
  Wallet,
  TrendingDown,
  TrendingUp,
  FileText,
  RotateCw,
  Info,
  X,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useFinancial();
  const { userProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Search Filter
  const [searchVal, setSearchVal] = useState('');

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const dailyAverage = Math.round(totalSpent / 30);
  
  const rawSalary = userProfile?.monthlySalary || 85000;
  const remainingBudget = rawSalary - totalSpent;
  const budgetDepletionPct = Math.min(100, Math.round((totalSpent / rawSalary) * 100));

  // Category splits (Rent/Utilities, Food/Dining, Entertainment, Transport, Others)
  const categoryTotals = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const getCategoryProgress = (cat: ExpenseCategory) => {
    const amt = categoryTotals[cat] || 0;
    if (totalSpent === 0) return { amount: 0, pct: 0 };
    return {
      amount: amt,
      pct: Math.round((amt / totalSpent) * 100),
    };
  };

  const rentStats = getCategoryProgress('HOUSING');
  const foodStats = getCategoryProgress('FOOD');
  const entStats = getCategoryProgress('ENTERTAINMENT');
  const transStats = getCategoryProgress('TRANSPORT');

  // Filtered list
  const filteredExpenses = expenses.filter((e) =>
    e.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    e.category.toLowerCase().includes(searchVal.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    addExpense({
      title,
      amount: Number(amount),
      category,
      type: 'EXPENSE',
      isRecurring,
      date: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setAmount('');
    setIsRecurring(false);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 select-none relative">
      
      {/* Title Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Expenses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track daily transactions, recurring subscriptions, and category spending details.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
          />
        </div>
      </div>

      {/* Row 1: Three Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI Card 1: Total Spent */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold">
              -12%
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-450 tracking-wider block">Total Spent This Month</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              ₹{totalSpent.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* KPI Card 2: Daily Average */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
              +2.4%
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-450 tracking-wider block">Daily Average</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              ₹{dailyAverage.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* KPI Card 3: Remaining Budget (Blue theme widget) */}
        <div className="p-6 rounded-[24px] sarthi-card text-white flex flex-col justify-between h-[140px] shadow-lg relative overflow-hidden">
          <div className="absolute top-[-55px] right-[-55px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-between items-start">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <Info className="h-4.5 w-4.5 text-blue-200" />
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[8px] uppercase font-black text-blue-200 tracking-wider block">Remaining Budget</span>
              <h3 className="text-xl font-black text-white leading-none mt-0.5">
                ₹{remainingBudget.toLocaleString('en-IN')}
              </h3>
            </div>
            {/* Depletion bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${100 - budgetDepletionPct}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Spend Category (Left) & Sarthi Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Spending by Category */}
        <div className="lg:col-span-8 p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-850 dark:text-white">
              Spending by Category
            </h3>
            
            {/* Toggle mock switch */}
            <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-bold uppercase">
              <span className="px-2.5 py-1 text-slate-400">Weekly</span>
              <span className="px-2.5 py-1 rounded bg-blue-600 text-white shadow-sm">Monthly</span>
            </div>
          </div>

          {/* Allocation rows list */}
          <div className="space-y-4.5">
            {[
              { label: 'Rent & Utilities', value: rentStats.amount, pct: rentStats.pct, color: 'bg-emerald-700' },
              { label: 'Food & Dining', value: foodStats.amount, pct: foodStats.pct, color: 'bg-indigo-600' },
              { label: 'Entertainment', value: entStats.amount, pct: entStats.pct, color: 'bg-indigo-400' },
              { label: 'Transport', value: transStats.amount, pct: transStats.pct, color: 'bg-slate-600' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-350">{cat.label}</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">
                    ₹{cat.value.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-medium">({cat.pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sarthi Insight & Quick Actions */}
        <div className="lg:col-span-4 p-6 rounded-[24px] bg-blue-500/5 border border-blue-500/10 shadow-sm flex flex-col justify-between min-h-[300px]">
          
          {/* Insight Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" />
              <span className="text-[9px] uppercase font-black text-blue-600 dark:text-sky-400 tracking-wider">Sarthi Insight</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
              "You've spent 15% less on Dining Out this week. At this rate, you could save an extra ₹3,500 for your 'New Car' goal!"
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-6 border-t border-blue-500/10">
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase block">Quick Actions</span>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Scan receipt */}
              <div
                onClick={() => setIsAddOpen(true)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
              >
                <FileText className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-355">Scan Receipt</span>
              </div>
              
              {/* Recurring subscriptions view */}
              <div
                onClick={() => {
                  const check = expenses.find(e => e.isRecurring);
                  if (check) alert(`Detected subscriptions: ${check.title} (₹${check.amount}/mo)`);
                  else alert("No recurring subscriptions registered yet.");
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center shadow-sm"
              >
                <RotateCw className="h-5 w-5 text-indigo-500 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-355">Recurring</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Row 3: Recent Transactions list */}
      <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
            Recent Transactions
          </h3>
          <button className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline">View All ➔</button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                  <td className="py-3 px-3 text-slate-400 font-medium">{exp.date}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{exp.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                    -₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button (FAB) at bottom-right */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-6 right-6 h-12 px-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all cursor-pointer z-40"
      >
        <Plus className="h-4 w-4" />
        <span>Add Expense</span>
      </button>

      {/* Popover Transaction Log Modal Form */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-50 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-500" />
                  Log Expense Transaction
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreate} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Merchant / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy Gourmet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-450 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-450 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="HOUSING">Housing / Rent</option>
                    <option value="FOOD">Food & Groceries</option>
                    <option value="TRANSPORT">Transport & Fuel</option>
                    <option value="UTILITIES">Bills & Utilities</option>
                    <option value="ENTERTAINMENT">Entertainment & OTT</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="SHOPPING">Shopping</option>
                    <option value="INVESTMENT">Investment SIP</option>
                    <option value="DEBT_EMI">Debt EMI</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>

                {/* Subscription Check */}
                <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-blue-500 h-4 w-4"
                  />
                  <span>Recurring Monthly Subscription</span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log Transaction</span>
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
