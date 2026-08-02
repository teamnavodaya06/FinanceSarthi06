import React, { useState, useEffect, useRef } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '@financesarthi/utils';
import { ExpenseCategory, Expense } from '@financesarthi/types';
import {
  validateExpenseTitle,
  validateExpenseAmount,
  validateExpenseCategory,
  validatePaymentMethod,
  validateExpenseDate,
} from '@financesarthi/utils';
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
  Filter,
  ArrowUpDown,
  Download,
  AlertCircle,
  Check,
  ChevronRight,
  Eye,
  CheckCircle,
  Copy,
  Clock,
  DollarSign,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useFinancial();
  const { userProfile } = useAuth();

  // Dialog & Selection States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('Monthly');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Validation States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);
  const [categoryAlert, setCategoryAlert] = useState<string | null>(null);

  // Search & Filter Panel States
  const [searchVal, setSearchVal] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('NEWEST');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Receipts file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const dailyAverage = Math.round(totalSpent / 30);
  const rawSalary = userProfile?.monthlySalary || 85000;
  const remainingBudget = Math.max(0, rawSalary - totalSpent);
  const budgetDepletionPct = Math.min(150, Math.round((totalSpent / rawSalary) * 100));

  // Today's Spent
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpent = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Category splits
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

  const highestCategoryObj = Object.keys(categoryTotals).reduce((max, cat) => {
    if (categoryTotals[cat] > (categoryTotals[max] || 0)) return cat;
    return max;
  }, 'FOOD');

  // Trigger editing fill
  const handleEditClick = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setPaymentMethod((exp as any).paymentMethod || 'UPI');
    setNotes(exp.notes || '');
    setIsRecurring(exp.isRecurring);
    setRecurrenceFrequency((exp as any).recurrenceFrequency || 'Monthly');
    setTags((exp as any).tags || []);
    setReceiptPreview((exp as any).receiptURL || null);
    setFieldErrors({});
    setTouchedFields({});
    setIsAddOpen(true);
  };

  // Duplicate Action
  const handleDuplicateClick = (exp: Expense) => {
    addExpense({
      title: `${exp.title} (Copy)`,
      amount: exp.amount,
      category: exp.category,
      type: 'EXPENSE',
      isRecurring: exp.isRecurring,
      date: new Date().toISOString().split('T')[0],
      notes: exp.notes,
    });
    alert('Transaction duplicated successfully!');
  };

  // Recalculate dynamic alerts on form updates
  const runFieldValidation = (name: string, value: any) => {
    let error: string | null = null;
    if (name === 'title') {
      error = validateExpenseTitle(value);
    } else if (name === 'amount') {
      error = validateExpenseAmount(value);
      const numAmt = Number(value) || 0;
      if (numAmt > 0) {
        if (totalSpent + numAmt > rawSalary) {
          const overflow = (totalSpent + numAmt) - rawSalary;
          setBudgetWarning(`Warning: Logging this expense will exceed your monthly budget by ₹${overflow.toLocaleString('en-IN')}.`);
        } else {
          setBudgetWarning(null);
        }
        const catAmt = (categoryTotals[category] || 0) + numAmt;
        if (catAmt > rawSalary * 0.35) {
          setCategoryAlert(`Alert: ${category} spending is unusually high (exceeds 35% of monthly salary).`);
        } else {
          setCategoryAlert(null);
        }
      } else {
        setBudgetWarning(null);
        setCategoryAlert(null);
      }
    }
    setFieldErrors(prev => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    runFieldValidation('title', val);
    setTouchedFields(prev => ({ ...prev, title: true }));
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    runFieldValidation('amount', val);
    setTouchedFields(prev => ({ ...prev, amount: true }));
  };

  const getInputBorderClass = (name: string) => {
    if (touchedFields[name]) {
      return fieldErrors[name]
        ? 'border-red-500 focus:border-red-500 bg-red-500/5'
        : 'border-emerald-500 focus:border-emerald-500 bg-emerald-500/5';
    }
    return 'border-slate-200 dark:border-slate-800 focus:border-blue-500';
  };

  // Tags Handler
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  // Receipt File Attachment Simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerScanReceipt = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Submit Logger (CRUD)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const titleError = validateExpenseTitle(title);
    const amountError = validateExpenseAmount(amount);
    if (titleError || amountError) {
      setFieldErrors({
        ...(titleError ? { title: titleError } : {}),
        ...(amountError ? { amount: amountError } : {}),
      });
      setTouchedFields({ title: true, amount: true });
      return;
    }

    const numAmt = Number(amount);

    // Business verification guards
    if (numAmt > 50000) {
      const confirmLarge = window.confirm(`Large Expense Alert: You are logging a transaction of ₹${numAmt.toLocaleString('en-IN')}. Do you want to proceed?`);
      if (!confirmLarge) return;
    }

    const hasDuplicate = expenses.some(e =>
      e.title.toLowerCase() === title.toLowerCase().trim() &&
      e.amount === numAmt &&
      e.date === todayStr &&
      e.id !== editingExpense?.id
    );
    if (hasDuplicate) {
      const confirmDup = window.confirm(`Duplicate Detection: An identical transaction for ₹${numAmt.toLocaleString('en-IN')} was logged today. Proceed?`);
      if (!confirmDup) return;
    }

    if (editingExpense) {
      // For editing, simulate mock update by delete and re-insert
      deleteExpense(editingExpense.id);
    }

    addExpense({
      title: title.trim(),
      amount: numAmt,
      category,
      type: 'EXPENSE',
      isRecurring,
      date: todayStr,
      notes: notes.trim(),
      // Custom extended properties for drawer hydration
      ...(tags.length > 0 ? { tags } : {}),
      ...(receiptPreview ? { receiptURL: receiptPreview } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
    } as any);

    // Reset Form
    setTitle('');
    setAmount('');
    setIsRecurring(false);
    setNotes('');
    setTags([]);
    setReceiptFile(null);
    setReceiptPreview(null);
    setFieldErrors({});
    setTouchedFields({});
    setEditingExpense(null);
    setIsAddOpen(false);
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = 'Date,Description,Category,Amount,PaymentMethod,Notes\n';
    const rows = filteredExpenses.map(e => 
      `"${e.date}","${e.title}","${e.category}",${e.amount},"${(e as any).paymentMethod || 'UPI'}","${e.notes || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `FinanceSarthi_Expenses_${todayStr}.csv`);
    a.click();
  };

  // Filter & Search Logic
  const filteredExpenses = expenses.filter(e => {
    // 1. Search Query
    const query = searchVal.toLowerCase();
    const matchesQuery = 
      e.title.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      (e.notes && e.notes.toLowerCase().includes(query)) ||
      (e as any).tags?.some((t: string) => t.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    // 2. Category Filter
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;

    // 3. Payment Method Filter
    const pMethod = (e as any).paymentMethod || 'UPI';
    if (filterPayment !== 'ALL' && pMethod !== filterPayment) return false;

    // 4. Date Filter
    if (filterDateRange !== 'ALL') {
      const expDate = new Date(e.date);
      const now = new Date();
      if (filterDateRange === 'TODAY') {
        if (e.date !== todayStr) return false;
      } else if (filterDateRange === 'THIS_WEEK') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (expDate < oneWeekAgo) return false;
      } else if (filterDateRange === 'THIS_MONTH') {
        if (expDate.getMonth() !== now.getMonth() || expDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortOption === 'NEWEST') return Date.parse(b.date) - Date.parse(a.date);
    if (sortOption === 'OLDEST') return Date.parse(a.date) - Date.parse(b.date);
    if (sortOption === 'HIGHEST') return b.amount - a.amount;
    if (sortOption === 'LOWEST') return a.amount - b.amount;
    return b.title.localeCompare(a.title);
  });

  // Pagination indexes
  const totalItems = sortedExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedExpenses = sortedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-20 select-none relative min-h-screen text-slate-900 dark:text-slate-100">
      
      {/* Hidden File Input for scanning receipt */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 dark:border-slate-850 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal Cash Flow</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Spending Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-xl">
            Track every rupee. Understand every habit. Improve your financial future.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>August 2026</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm text-slate-600 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setTitle('');
              setAmount('');
              setIsRecurring(false);
              setNotes('');
              setIsAddOpen(true);
            }}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/10 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Monthly Spending',
            value: `₹${totalSpent.toLocaleString('en-IN')}`,
            icon: CreditCard,
            color: 'text-blue-500 bg-blue-500/5 dark:bg-blue-500/10',
            comparison: '↑12% vs last month',
            isPositive: false,
          },
          {
            label: "Today's Log",
            value: `₹${todaySpent.toLocaleString('en-IN')}`,
            icon: Clock,
            color: 'text-amber-500 bg-amber-500/5 dark:bg-amber-500/10',
            comparison: 'Within average range',
            isPositive: true,
          },
          {
            label: 'Budget Remaining',
            value: `₹${remainingBudget.toLocaleString('en-IN')}`,
            icon: Wallet,
            color: 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10',
            comparison: `${budgetDepletionPct}% spent`,
            isPositive: budgetDepletionPct < 80,
          },
          {
            label: 'Daily Average',
            value: `₹${dailyAverage.toLocaleString('en-IN')}`,
            icon: TrendingDown,
            color: 'text-rose-500 bg-rose-500/5 dark:bg-rose-500/10',
            comparison: 'Based on 30-day index',
            isPositive: true,
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {card.value}
              </h3>
              <span className={`text-[10px] font-bold block ${card.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {card.comparison}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="p-4 rounded-[22px] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-850 flex flex-wrap gap-4 items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-2">Quick Commands:</span>
        <button
          onClick={triggerScanReceipt}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <FileText className="h-4.5 w-4.5 text-emerald-500" />
          <span>Scan Receipt</span>
        </button>
        <button
          onClick={() => {
            setIsRecurring(true);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <RotateCw className="h-4.5 w-4.5 text-indigo-500" />
          <span>Add Recurring Subscription</span>
        </button>
        <button
          onClick={() => alert(`Copilot AI Engine: Running automated audit... Found 3 potential subscription optimization candidates.`)}
          className="px-4 py-2.5 rounded-xl bg-[#0A1128] border border-blue-500/10 hover:bg-blue-950/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm text-sky-400"
        >
          <Sparkles className="h-4.5 w-4.5 text-blue-500" />
          <span>AI Audit Analysis</span>
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: BUDGET & RECENT TRANSACTIONS (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Budget progress tracker */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-400">Monthly Budget Burn Rate</span>
              <span className={budgetDepletionPct > 100 ? 'text-red-500' : budgetDepletionPct > 80 ? 'text-amber-500' : 'text-emerald-500'}>
                {budgetDepletionPct}% Spent
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  budgetDepletionPct > 100 
                    ? 'bg-red-500' 
                    : budgetDepletionPct > 80 
                    ? 'bg-amber-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, budgetDepletionPct)}%` }} 
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              <span>Spent: ₹{totalSpent.toLocaleString('en-IN')}</span>
              <span>Available Budget limit: ₹{rawSalary.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Transactions Module Container */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Swiggy, Uber, housing, tags..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Toggles Panel */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isFilterOpen 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900 dark:text-sky-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer text-slate-600 dark:text-slate-350"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="HIGHEST">Highest Amount</option>
                  <option value="LOWEST">Lowest Amount</option>
                </select>
              </div>
            </div>

            {/* Collapsible Filter settings panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 space-y-4 text-xs font-semibold"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      >
                        <option value="ALL">All Categories</option>
                        {['HOUSING', 'FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'SHOPPING', 'INVESTMENT', 'DEBT_EMI', 'OTHERS'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Payment Method</label>
                      <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      >
                        <option value="ALL">All Payments</option>
                        {['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Wallet'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date limit */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Date Range</label>
                      <select
                        value={filterDateRange}
                        onChange={(e) => setFilterDateRange(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today Only</option>
                        <option value="THIS_WEEK">This Week</option>
                        <option value="THIS_MONTH">This Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => {
                        setFilterCategory('ALL');
                        setFilterPayment('ALL');
                        setFilterDateRange('ALL');
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white text-[10px] font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transactions items list */}
            {paginatedExpenses.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-350 mx-auto">
                  <Receipt className="h-8 w-8" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No expenses recorded yet.</h4>
                  <p className="text-[11px] text-slate-400">Start tracking your spending and gain intelligent cash flow audits.</p>
                </div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm cursor-pointer transition-all"
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedExpenses.map((exp) => {
                  const methodStr = (exp as any).paymentMethod || 'UPI';
                  return (
                    <div
                      key={exp.id}
                      onClick={() => setSelectedExpense(exp)}
                      className="group p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 flex items-center justify-between transition-all duration-200 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4">
                        {/* Dynamic Merchant Icon Logo */}
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 shrink-0">
                          {exp.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                              {exp.title}
                            </span>
                            {exp.isRecurring && (
                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase">
                                Sub
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                              {exp.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{exp.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            -₹{exp.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">
                            via {methodStr}
                          </span>
                        </div>

                        {/* Hover Quick Row Actions */}
                        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(exp);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                            title="Edit Transaction"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateClick(exp);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const confirmDel = window.confirm('Delete this expense?');
                              if (confirmDel) deleteExpense(exp.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-350" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-bold text-slate-500">
                <span>Showing Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI RECOMMENDATIONS & TIMELINES (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: AI Copilot Insights */}
          <div className="p-6 rounded-[24px] bg-[#0A1128] border border-blue-500/10 space-y-4 shadow-xl text-white">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-sky-400 shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot Analysis</h4>
            </div>

            <div className="space-y-4">
              {[
                {
                  desc: 'You spent 28% more on food & dining this week compared to July.',
                  action: 'Suggest reducing restaurant orders by ₹2,500.',
                  saving: '₹30,000 yearly potential',
                },
                {
                  desc: 'Electricity bill utility charge increased by 14%.',
                  action: 'Switch devices off standby modes to conserve energy.',
                  saving: '₹4,800 yearly potential',
                },
                {
                  desc: 'Netflix and Spotify subscriptions consume ₹1,100/mo.',
                  action: 'Consolidate shared accounts or pause unused plans.',
                  saving: '₹13,200 yearly potential',
                },
              ].map((ins, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-[11px] text-slate-250 font-semibold leading-relaxed">
                    {ins.desc}
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-sky-400">{ins.action}</span>
                    <span className="text-emerald-400 uppercase">{ins.saving}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Category Distribution progress visual */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Category Distribution
            </h3>

            <div className="space-y-3.5">
              {(['FOOD', 'HOUSING', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'OTHERS'] as ExpenseCategory[]).map((cat) => {
                const stats = getCategoryProgress(cat);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                      <span className="text-slate-400">{cat}</span>
                      <span className="text-slate-950 dark:text-slate-200">
                        ₹{stats.amount.toLocaleString('en-IN')} ({stats.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Upcoming Bills Timeline */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Upcoming Bills Timeline
            </h3>

            <div className="space-y-4">
              {[
                { title: 'Wi-Fi Broadband', date: 'Aug 05', amount: 999, status: 'Due soon' },
                { title: 'Rent Invoice', date: 'Aug 10', amount: 18000, status: 'Due in 7 days' },
                { title: 'Electricity Grid', date: 'Aug 15', amount: 3450, status: 'Pending' },
              ].map((bill, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-normal">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-500">
                    {bill.date.split(' ')[1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200 block truncate">{bill.title}</span>
                      <span className="text-slate-900 dark:text-white font-black shrink-0">₹{bill.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-0.5">
                      <span>Due Date: {bill.date}</span>
                      <span className="text-amber-500 uppercase">{bill.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Recurring Subscriptions list */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Recurring Subscriptions
            </h3>

            <div className="space-y-3">
              {[
                { title: 'Netflix Standard', amount: 499, frequency: 'Monthly' },
                { title: 'Spotify Premium', amount: 119, frequency: 'Monthly' },
                { title: 'Gym Membership', amount: 1500, frequency: 'Monthly' },
              ].map((sub, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 block">{sub.title}</span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-400 font-bold block mt-0.5">
                      ₹{sub.amount}/{sub.frequency === 'Monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  <button 
                    onClick={() => alert(`Paused recurring subscription command triggered for ${sub.title}.`)}
                    className="h-7 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-bold cursor-pointer text-slate-500"
                  >
                    Pause
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Side Slide-Out Details Drawer */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs z-50 flex justify-end select-none">
            {/* Backdrop click close */}
            <div className="flex-1" onClick={() => setSelectedExpense(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-[#0B1426] border-l border-slate-200 dark:border-slate-900 h-full p-6 shadow-2xl flex flex-col space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-4">
                <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-wider">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Amount Display Card */}
              <div className="p-6 rounded-[24px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-center space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Logged Amount
                </span>
                <h2 className="text-3xl font-black text-rose-500">
                  -₹{selectedExpense.amount.toLocaleString('en-IN')}
                </h2>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase">
                  {selectedExpense.category}
                </div>
              </div>

              {/* Properties Grid */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {[
                  { label: 'Merchant description', val: selectedExpense.title },
                  { label: 'Payment Method', val: (selectedExpense as any).paymentMethod || 'UPI' },
                  { label: 'Date Logged', val: selectedExpense.date },
                  { label: 'Subscription Mode', val: selectedExpense.isRecurring ? 'Recurring Monthly' : 'One-Time Transaction' },
                  { label: 'Notes description', val: selectedExpense.notes || 'No added descriptions.' },
                ].map((prop, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {prop.label}
                    </span>
                    <p className="text-xs font-semibold text-slate-850 dark:text-slate-200">
                      {prop.val}
                    </p>
                  </div>
                ))}

                {/* Tags */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {((selectedExpense as any).tags || []).length > 0 ? (
                      ((selectedExpense as any).tags || []).map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-sky-400 text-[9px] font-bold">
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic">No tags attached.</span>
                    )}
                  </div>
                </div>

                {/* Receipt Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 block">Uploaded Receipt</span>
                  {(selectedExpense as any).receiptURL ? (
                    <div className="w-full max-h-40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50">
                      <img src={(selectedExpense as any).receiptURL} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-semibold italic">No receipt file uploaded.</p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex gap-3">
                <button
                  onClick={() => {
                    const confirmDel = window.confirm('Are you sure you want to delete this expense?');
                    if (confirmDel) {
                      deleteExpense(selectedExpense.id);
                      setSelectedExpense(null);
                    }
                  }}
                  className="h-10 flex-1 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold text-xs cursor-pointer transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    const toEdit = selectedExpense;
                    setSelectedExpense(null);
                    handleEditClick(toEdit);
                  }}
                  className="h-10 flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Dialog Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-900 rounded-[28px] p-6 shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4.5 w-4.5 text-blue-500" />
                  <span>{editingExpense ? 'Edit Transaction Details' : 'Log Expense Transaction'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Merchant / Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy Gourmet"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl px-3.5 py-3 text-xs text-slate-955 dark:text-white placeholder:text-slate-450 focus:outline-none font-semibold ${getInputBorderClass('title')}`}
                    />
                    {touchedFields['title'] && (
                      <div className="absolute right-3.5 top-3.5 pointer-events-none">
                        {fieldErrors['title'] ? <AlertCircle className="h-4.5 w-4.5 text-red-500" /> : <Check className="h-4.5 w-4.5 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['title'] && fieldErrors['title'] && (
                    <span className="text-[10px] text-red-500 font-bold block">{fieldErrors['title']}</span>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Amount (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-slate-955 border rounded-xl px-3.5 py-3 text-xs text-slate-955 dark:text-white placeholder:text-slate-450 focus:outline-none font-semibold ${getInputBorderClass('amount')}`}
                    />
                    {touchedFields['amount'] && (
                      <div className="absolute right-3.5 top-3.5 pointer-events-none">
                        {fieldErrors['amount'] ? <AlertCircle className="h-4.5 w-4.5 text-red-500" /> : <Check className="h-4.5 w-4.5 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['amount'] && fieldErrors['amount'] && (
                    <span className="text-[10px] text-red-500 font-bold block">{fieldErrors['amount']}</span>
                  )}
                </div>

                {/* Warnings Alert banners */}
                {(budgetWarning || categoryAlert) && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 space-y-1">
                    {budgetWarning && <p className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {budgetWarning}</p>}
                    {categoryAlert && <p className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {categoryAlert}</p>}
                  </div>
                )}

                {/* Row: Category & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-955 dark:text-white focus:outline-none font-semibold cursor-pointer"
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

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-955 dark:text-white focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Wallet">Wallet</option>
                    </select>
                  </div>
                </div>

                {/* Notes descriptions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Notes Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter transaction specifics..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-955 dark:text-white focus:outline-none font-medium"
                  />
                </div>

                {/* Receipt attachment preview */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Receipt Attachment</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={triggerScanReceipt}
                      className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                    >
                      Attach receipt file
                    </button>
                    {receiptFile && <span className="text-[10px] text-slate-500 font-bold block truncate max-w-xs">{receiptFile.name}</span>}
                  </div>
                  {receiptPreview && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Subcription Check */}
                <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-blue-500 h-4 w-4"
                  />
                  <span>Recurring Monthly Subscription</span>
                </label>

              </form>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={Object.keys(fieldErrors).length > 0}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 disabled:text-white/60 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {editingExpense ? 'Save Changes' : 'Log Transaction'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default ExpenseTracker;
