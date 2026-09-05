import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useTranslation } from '../utils/i18n';
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  Filter,
  CreditCard,
  Sparkles,
  X,
} from 'lucide-react';

export const ExpenseTracker: React.FC = () => {
  const { t } = useTranslation();
  const { expenses, addExpense, deleteExpense } = useFinancial();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'FOOD', label: '🍔 Food & Dining' },
    { id: 'HOUSING', label: '🏠 Housing & Rent' },
    { id: 'UTILITIES', label: '⚡ Utilities & Bills' },
    { id: 'SHOPPING', label: '🛍️ Shopping' },
    { id: 'ENTERTAINMENT', label: '🎬 Entertainment' },
    { id: 'OTHERS', label: '✨ Others' },
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    await addExpense({
      title,
      amount: Number(amount),
      category: category as any,
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      notes: paymentMethod,
    });

    setTitle('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* HEADER */}
      <div className="pt-6 pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Expense Tracker
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Log & track your daily spending categories effortlessly
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log New Expense</span>
        </button>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Spent This Month</span>
          <div className="text-2xl font-black text-rose-400">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Logged Transactions</span>
          <div className="text-2xl font-black text-sky-400">
            {expenses.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top Category</span>
          <div className="text-xl font-bold text-amber-400 truncate">
            Food & Housing
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-9 pl-9 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Receipt className="h-4.5 w-4.5 text-indigo-400" />
          <span>Transactions History</span>
        </h2>

        {filteredExpenses.length > 0 ? (
          <div className="space-y-2.5">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                    <p className="text-xs text-slate-400">
                      {exp.category} • {exp.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-rose-400">
                    -₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-2 bg-slate-900/40">
            <p className="text-xs text-slate-400">No transactions match your search filter.</p>
          </div>
        )}
      </div>

      {/* LOG NEW EXPENSE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log New Expense</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Expense Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swiggy Food Order, Rent"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="FOOD">🍔 Food & Dining</option>
                    <option value="HOUSING">🏠 Housing & Rent</option>
                    <option value="UTILITIES">⚡ Utilities & Bills</option>
                    <option value="SHOPPING">🛍️ Shopping</option>
                    <option value="ENTERTAINMENT">🎬 Entertainment</option>
                    <option value="OTHERS">✨ Others</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Log Expense
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ExpenseTracker;
