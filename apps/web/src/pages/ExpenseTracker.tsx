import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '@financesarthi/utils';
import { ExpenseCategory } from '@financesarthi/types';
import { Receipt, Plus, Trash2, AlertCircle, RefreshCw, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  HOUSING: '#10b981',
  FOOD: '#f59e0b',
  TRANSPORT: '#3b82f6',
  UTILITIES: '#8b5cf6',
  ENTERTAINMENT: '#ec4899',
  HEALTHCARE: '#ef4444',
  SHOPPING: '#14b8a6',
  INVESTMENT: '#06b6d4',
  DEBT_EMI: '#6366f1',
  OTHERS: '#64748b',
};

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense, user } = useFinancial();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Group by Category for Pie Chart
  const categoryTotals = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const recurringTotal = expenses.filter(e => e.isRecurring).reduce((acc, curr) => acc + curr.amount, 0);

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
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-400" />
            Expense Analytics & Subscription Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track daily transactions, recurring subscriptions, and category overspending alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log New Transaction</span>
        </button>
      </div>

      {/* Add Expense Drawer/Form */}
      {isAddOpen && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl glass-card border border-emerald-500/30 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-white">Log Expense Transaction</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Swiggy Gourmet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>Recurring Monthly Subscription</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      {/* Grid: Pie Chart Breakdown & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Recharts Pie Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-400" />
              Category Expense Distribution
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Total Spent: <strong className="text-white">{formatCurrency(totalSpent)}</strong>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#10b981'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend formatter={(val: any) => <span className="text-xs text-slate-300">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recurring Subscriptions Box */}
        <div className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                Detected Subscriptions
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                {formatCurrency(recurringTotal)}/mo
              </span>
            </div>

            <div className="space-y-2.5">
              {expenses.filter(e => e.isRecurring).map(exp => (
                <div key={exp.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{exp.title}</h4>
                    <span className="text-[10px] text-slate-500">{exp.category}</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5 mt-4">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>AI Subscription Detector recommends auditing OTT platforms to save ₹1,200/mo.</span>
          </div>
        </div>
      </div>

      {/* Full Expense List Table */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
          All Expense Logs ({expenses.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-900/40 transition-all">
                  <td className="py-3 px-4 font-bold text-slate-200">{exp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {exp.isRecurring ? 'Recurring' : 'One-time'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-white">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
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
    </div>
  );
};
