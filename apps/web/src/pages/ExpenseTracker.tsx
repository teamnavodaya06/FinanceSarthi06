import React, { useState, useRef } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
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
  Download,
  AlertCircle,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Lightbulb,
  ArrowRight,
  TrendingUp as TrendUpIcon,
  Smile,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importing Spending Intelligence Services
import { SpendingHealthService } from '../services/spending-intelligence/spending-health.service';
import { SpendingCoachService, SpendingInsightCard } from '../services/spending-intelligence/spending-coach.service';
import { CashFlowService } from '../services/spending-intelligence/cash-flow.service';
import { FinancialStoryService } from '../services/spending-intelligence/financial-story.service';
import { TimelineService } from '../services/spending-intelligence/timeline.service';

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

  // Dismissed insights list
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // File Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const dailyAverage = Math.round(totalSpent / 30);
  const rawSalary = userProfile?.monthlySalary || 85000;
  const remainingBudget = Math.max(0, rawSalary - totalSpent);
  const budgetDepletionPct = Math.min(150, Math.round((totalSpent / rawSalary) * 100));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpent = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Spending Intelligence Computations
  const healthResult = SpendingHealthService.calculateHealth(expenses, rawSalary);
  const allCoachInsights = SpendingCoachService.generateInsights(expenses, rawSalary);
  const visibleInsights = allCoachInsights.filter(ins => !dismissedInsights.includes(ins.id));
  
  const cashFlowResult = CashFlowService.calculateJourney(expenses, rawSalary);
  const storyResult = FinancialStoryService.generateStory(expenses, rawSalary);

  // Category splits
  const categoryTotals = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const highestCategoryObj = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])[0] || 'None'
    : 'None';

  const getCategoryProgress = (cat: ExpenseCategory) => {
    const amt = categoryTotals[cat] || 0;
    if (totalSpent === 0) return { amount: 0, pct: 0 };
    return {
      amount: amt,
      pct: Math.round((amt / totalSpent) * 100),
    };
  };

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

  const handleBlur = (name: string) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    runFieldValidation(name, name === 'title' ? title : amount);
  };

  const getInputBorderClass = (name: string) => {
    if (touchedFields[name]) {
      return fieldErrors[name]
        ? 'border-red-500 focus:border-red-500 bg-red-500/5'
        : 'border-emerald-500 focus:border-emerald-500 bg-emerald-500/5';
    }
    return 'border-slate-200 dark:border-slate-800 focus:border-blue-500';
  };

  // Add Tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Receipt Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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

    if (numAmt > 50000) {
      const confirmLarge = window.confirm(`Large Expense Confirmation: You are logging a transaction of ₹${numAmt.toLocaleString('en-IN')}. Confirm?`);
      if (!confirmLarge) return;
    }

    const hasDuplicate = expenses.some(e =>
      e.title.toLowerCase() === title.toLowerCase().trim() &&
      e.amount === numAmt &&
      e.date === todayStr &&
      e.id !== editingExpense?.id
    );
    if (hasDuplicate) {
      const confirmDup = window.confirm(`Duplicate Warning: An identical transaction for ₹${numAmt.toLocaleString('en-IN')} was logged today. Proceed?`);
      if (!confirmDup) return;
    }

    if (editingExpense) {
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
      tags,
      receiptURL: receiptPreview,
      paymentMethod,
    } as any);

    setTitle('');
    setAmount('');
    setIsRecurring(false);
    setNotes('');
    setTags([]);
    setReceiptPreview(null);
    setFieldErrors({});
    setTouchedFields({});
    setEditingExpense(null);
    setIsAddOpen(false);
  };

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

  // Filtering
  const filteredExpenses = expenses.filter(e => {
    const query = searchVal.toLowerCase();
    const matchesQuery = 
      e.title.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      (e.notes && e.notes.toLowerCase().includes(query));

    if (!matchesQuery) return false;
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    if (filterPayment !== 'ALL' && ((e as any).paymentMethod || 'UPI') !== filterPayment) return false;
    
    if (filterDateRange !== 'ALL') {
      const expDate = new Date(e.date);
      const now = new Date();
      if (filterDateRange === 'TODAY' && e.date !== todayStr) return false;
      if (filterDateRange === 'THIS_WEEK') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (expDate < oneWeekAgo) return false;
      }
    }
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortOption === 'NEWEST') return Date.parse(b.date) - Date.parse(a.date);
    if (sortOption === 'OLDEST') return Date.parse(a.date) - Date.parse(b.date);
    if (sortOption === 'HIGHEST') return b.amount - a.amount;
    return a.amount - b.amount;
  });

  // Smart grouped buckets using TimelineService
  const timelineBuckets = TimelineService.groupExpenses(sortedExpenses);

  return (
    <div className="space-y-8 pb-20 select-none text-slate-900 dark:text-slate-100">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 dark:border-slate-850 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Spending Intelligence</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Spending Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Analyze money flows, verify health scores, and act on personalized AI advisory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-slate-600 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
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

      {/* SUMMARY CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Monthly Spent', val: `₹${totalSpent.toLocaleString('en-IN')}`, desc: 'Within budget boundaries', icon: CreditCard, color: 'text-blue-500' },
          { label: "Today's Spent", val: `₹${todaySpent.toLocaleString('en-IN')}`, desc: 'UPI & Cash logs', icon: Clock, color: 'text-amber-500' },
          { label: 'Health Score Index', val: `${healthResult.score}/100`, desc: `Grade: ${healthResult.grade}`, icon: Activity, color: 'text-emerald-500' },
          { label: 'Highest Category', val: highestCategoryObj, desc: 'Highest spent percentage', icon: TrendingDown, color: 'text-rose-500' },
        ].map((card, idx) => (
          <div key={idx} className="p-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-all duration-350">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{card.val}</h3>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN SPENDING INTELLIGENCE PLOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTELLIGENCE ENGINE & GROUPED TIMELINE (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FEATURE 1: AI SPENDING COACH */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Spending Coach</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {visibleInsights.map((ins) => (
                  <motion.div
                    key={ins.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          ins.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {ins.priority} Priority
                        </span>
                        <button 
                          onClick={() => setDismissedInsights([...dismissedInsights, ins.id])}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">{ins.title}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed font-semibold">
                        {ins.summary} <span className="text-slate-400 font-bold">{ins.whyItMatters}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-blue-600 dark:text-sky-400">{ins.suggestedAction}</span>
                      <span className="text-emerald-500 uppercase">{ins.impact}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* FEATURE 4: CASH FLOW JOURNEY */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                Cash Flow Journey Map
              </h3>
              {cashFlowResult.isLowCash ? (
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Low Surplus Warning</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase flex items-center gap-1"><Check className="h-3 w-3" /> Surplus Healthy</span>
              )}
            </div>

            {/* Horizontal flow nodes stack */}
            <div className="flex flex-col md:flex-row items-center gap-4 py-2">
              {cashFlowResult.nodes.map((node, idx) => (
                <React.Fragment key={idx}>
                  <div className={`p-4 rounded-2xl flex-1 w-full text-center border transition-all duration-200 ${
                    node.isWarning 
                      ? 'border-amber-200 bg-amber-500/5 text-amber-700 dark:border-amber-900 dark:bg-amber-950/10 dark:text-amber-400' 
                      : 'border-slate-150 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/30'
                  }`}>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{node.label}</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">₹{node.amount.toLocaleString('en-IN')}</h4>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{node.percentage}% of salary</span>
                  </div>
                  {idx < cashFlowResult.nodes.length - 1 && (
                    <ArrowRight className="hidden md:block h-4.5 w-4.5 text-slate-300 dark:text-slate-700 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* FEATURE 3: SMART SPENDING TIMELINE ( Chronological Buckets ) */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                Smart Spending Timeline
              </h3>
              
              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-1 sm:justify-end">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex items-center gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {timelineBuckets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                No recent transactions matching these filter criteria.
              </div>
            ) : (
              <div className="space-y-6">
                {timelineBuckets.map((bucket) => (
                  <div key={bucket.title} className="space-y-3">
                    {/* Sticky timeline header */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 py-1 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{bucket.title}</span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {bucket.expenses.length} logs • ₹{bucket.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Grouped item list */}
                    <div className="space-y-2 pl-2 border-l border-slate-150 dark:border-slate-850">
                      {bucket.expenses.map((exp) => (
                        <div
                          key={exp.id}
                          onClick={() => setSelectedExpense(exp)}
                          className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-850/60 flex items-center justify-between transition-all duration-150 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
                              {exp.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                                {exp.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{exp.category}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">• {exp.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                              -₹{exp.amount.toLocaleString('en-IN')}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HEALTH CARD & MONTHLY STORY (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FEATURE 2: SPENDING HEALTH SCORE CARD */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Spending Health Index
            </h3>

            <div className="flex flex-col items-center text-center space-y-3">
              {/* Circular progress path score */}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="3.5"
                    strokeDasharray={`${healthResult.score}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{healthResult.score}</span>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5">{healthResult.grade}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wide block">Monthly Trend</span>
                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-black">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{healthResult.trend} points variance</span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {healthResult.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider block">Key Strengths</span>
                  <ul className="space-y-1">
                    {healthResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-1.5 items-baseline text-[10px] text-slate-500 font-semibold leading-relaxed">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {healthResult.weaknesses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider block">Areas of Warning</span>
                  <ul className="space-y-1">
                    {healthResult.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex gap-1.5 items-baseline text-[10px] text-slate-500 font-semibold leading-relaxed">
                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 5: MONTHLY FINANCIAL STORY CARD */}
          <div className="p-6 rounded-[24px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lightbulb className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                August Financial Story
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-normal">
                "{storyResult.headline}"
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {storyResult.summary}
              </p>

              {storyResult.achievements.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-wider block">Achievements</span>
                  <div className="space-y-1">
                    {storyResult.achievements.map((ach, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center text-[10px] text-slate-500 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-slate-500 font-bold leading-normal">
                <span className="uppercase text-[9px] text-blue-600 block mb-0.5">Vanguard Prediction:</span>
                {storyResult.prediction}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Side Slide-Out Details Drawer */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-xs z-50 flex justify-end select-none">
            <div className="flex-1" onClick={() => setSelectedExpense(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-[#0B1426] border-l border-slate-200 dark:border-slate-900 h-full p-6 shadow-2xl flex flex-col space-y-6"
            >
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
                      className="w-full h-11 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-955 dark:text-white focus:outline-none font-semibold cursor-pointer"
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
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                    >
                      Attach receipt file
                    </button>
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
