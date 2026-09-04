import React, { useState, useRef, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { ExpenseCategory, Expense } from '@financesarthi/types';
import {
  validateExpenseTitle,
  validateExpenseAmount,
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
  X,
  CreditCard,
  Filter,
  Download,
  AlertCircle,
  Check,
  Loader2,
  ChevronRight,
  Clock,
  Lightbulb,
  Building,
  Sliders,
  PiggyBank,
  Info,
  ArrowUpRight,
  Tag,
  PieChart as PieIcon,
  Activity,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Spending Intelligence Services
import { SpendingHealthService } from '../services/spending-intelligence/spending-health.service';

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense, setIsAiDrawerOpen, incomeData } = useFinancial();
  const { userProfile } = useAuth();

  // Dialog & Selection States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpenseAdded, setIsExpenseAdded] = useState(false);

  React.useEffect(() => {
    if (!isAddOpen) {
      setIsExpenseAdded(false);
      setIsSaving(false);
    }
  }, [isAddOpen]);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<any>('FOOD');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Validation States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);
  const [categoryAlert, setCategoryAlert] = useState<string | null>(null);

  // Search & Filter Panel States
  const [searchVal, setSearchVal] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');

  // File Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local deleted demo expense tracker
  const [deletedDemoIds, setDeletedDemoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('deletedDemoIds');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State to hold the expense user has requested to delete
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Check if no real expenses logged
  const isPreview = expenses.length === 0;

  // Premium fallback demo expenses dataset
  const demoExpenses: Expense[] = useMemo(() => [
    {
      id: 'demo-1',
      title: 'Housing Rent',
      amount: 15000,
      category: 'HOUSING',
      type: 'EXPENSE',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: true,
      notes: 'Monthly housing rent contribution',
    },
    {
      id: 'demo-2',
      title: 'Swiggy Dinner',
      amount: 1200,
      category: 'FOOD',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Weekend restaurant order',
    },
    {
      id: 'demo-3',
      title: 'Electricity & Water Bill',
      amount: 3500,
      category: 'UTILITIES',
      type: 'EXPENSE',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: true,
      notes: 'Utility payments',
    },
    {
      id: 'demo-4',
      title: 'Zara Outfits',
      amount: 4500,
      category: 'SHOPPING',
      type: 'EXPENSE',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Apparel clothing log',
    },
    {
      id: 'demo-5',
      title: 'Weekly Grocery',
      amount: 2800,
      category: 'FOOD',
      type: 'EXPENSE',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Monthly grocery provisions',
    },
    {
      id: 'demo-6',
      title: 'Uber Cab Ride',
      amount: 650,
      category: 'TRANSPORT',
      type: 'EXPENSE',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Office commute',
    },
    {
      id: 'demo-7',
      title: 'SIP Mutual Fund',
      amount: 5000,
      category: 'INVESTMENT',
      type: 'EXPENSE',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: true,
      notes: 'SIP Investment plan',
    }
  ] as any[] as Expense[], []);

  // Use real data or fallback dataset
  const activeExpensesList = isPreview
    ? demoExpenses.filter(d => !deletedDemoIds.includes(d.id))
    : expenses;

  // Sizing metrics
  const rawSalary = incomeData?.monthlyIncome || userProfile?.monthlySalary || 75000;
  const totalSpent = activeExpensesList.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = Math.max(0, rawSalary - totalSpent);

  // Delete helper for demo vs real data
  const handleDeleteExpense = async (id: string) => {
    if (id.startsWith('demo-') && !id.startsWith('demo-new-')) {
      const next = [...deletedDemoIds, id];
      setDeletedDemoIds(next);
      localStorage.setItem('deletedDemoIds', JSON.stringify(next));
    } else {
      await deleteExpense(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    const targetId = expenseToDelete.id;
    setExpenseToDelete(null);
    setSelectedExpense(null);

    try {
      await handleDeleteExpense(targetId);
    } catch (err) {
      console.error('Delete operation failed:', err);
      alert('Unable to delete expense.');
    }
  };

  // Spending Intelligence Computations
  const healthResult = SpendingHealthService.calculateHealth(activeExpensesList, rawSalary);
  const activeScore = isPreview ? 93 : healthResult.score;
  const activeGrade = isPreview ? 'Excellent' : healthResult.grade;

  // Category splits
  const categoryTotals = activeExpensesList.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const highestCategoryObj = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])[0] || 'None'
    : 'None';

  // Premium Category Config mappings with soft pastels for mobile cards
  const categoryConfigs: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    HOUSING: { label: 'Housing', icon: '🏠', color: '#10B981', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    FOOD: { label: 'Food', icon: '🍔', color: '#EF4444', bg: 'bg-rose-50 text-rose-600 border-rose-200' },
    TRANSPORT: { label: 'Transport', icon: '🚗', color: '#3B82F6', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
    UTILITIES: { label: 'Utilities', icon: '⚡', color: '#F59E0B', bg: 'bg-amber-50 text-amber-600 border-amber-200' },
    ENTERTAINMENT: { label: 'Fun & OTT', icon: '🎬', color: '#EC4899', bg: 'bg-pink-50 text-pink-600 border-pink-200' },
    HEALTHCARE: { label: 'Health', icon: '🩺', color: '#06B6D4', bg: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    SHOPPING: { label: 'Shopping', icon: '🛒', color: '#8B5CF6', bg: 'bg-purple-50 text-purple-600 border-purple-200' },
    INVESTMENT: { label: 'Investment', icon: '💰', color: '#059669', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    DEBT_EMI: { label: 'Loan EMI', icon: '💳', color: '#64748B', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
    OTHERS: { label: 'Others', icon: '🔮', color: '#94A3B8', bg: 'bg-slate-50 text-slate-600 border-slate-200' }
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setPaymentMethod((exp as any).paymentMethod || 'UPI');
    setNotes(exp.notes || '');
    setIsRecurring(exp.isRecurring);
    setReceiptPreview((exp as any).receiptURL || null);
    setFieldErrors({});
    setTouchedFields({});
    setIsAddOpen(true);
  };

  const handleQuickAction = (actionKey: 'ADD' | 'SCAN' | 'IMPORT' | 'ASK') => {
    if (actionKey === 'ADD') {
      setEditingExpense(null);
      setTitle('');
      setAmount('');
      setIsRecurring(false);
      setNotes('');
      setIsAddOpen(true);
    } else if (actionKey === 'SCAN') {
      fileInputRef.current?.click();
    } else if (actionKey === 'IMPORT') {
      handleExportCSV();
    } else if (actionKey === 'ASK') {
      setIsAiDrawerOpen(true);
    }
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
          setBudgetWarning(`Warning: Exceeds monthly budget by ₹${overflow.toLocaleString('en-IN')}.`);
        } else {
          setBudgetWarning(null);
        }
        const catAmt = (categoryTotals[category] || 0) + numAmt;
        if (catAmt > rawSalary * 0.35) {
          setCategoryAlert(`Alert: ${category} spending is unusually high (>35% of income).`);
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
        ? 'border-red-400 bg-red-500/5'
        : 'border-emerald-500 bg-emerald-500/5';
    }
    return 'border-slate-200 focus:border-blue-500';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const todayStr = new Date().toISOString().split('T')[0];

    if (numAmt > 50000) {
      const confirmLarge = window.confirm(`Large Expense Confirmation: You are logging ₹${numAmt.toLocaleString('en-IN')}. Confirm?`);
      if (!confirmLarge) return;
    }

    setIsSaving(true);

    try {
      if (editingExpense) {
        await deleteExpense(editingExpense.id);
      }

      await addExpense({
        title: title.trim(),
        amount: numAmt,
        category,
        type: 'EXPENSE',
        isRecurring,
        recurrenceFrequency: isRecurring ? 'Monthly' : undefined,
        date: todayStr,
        notes: notes.trim(),
        receiptURL: receiptPreview,
        paymentMethod,
      } as any);

      setIsExpenseAdded(true);
      setIsSaving(false);

      setTimeout(() => {
        setTitle('');
        setAmount('');
        setIsRecurring(false);
        setNotes('');
        setReceiptPreview(null);
        setFieldErrors({});
        setTouchedFields({});
        setEditingExpense(null);
        setIsAddOpen(false);
      }, 600);
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Unable to add expense.');
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];
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

  // Filter expenses list
  const filteredExpenses = activeExpensesList.filter(e => {
    const query = searchVal.toLowerCase();
    const matchesQuery = 
      e.title.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      (e.notes && e.notes.toLowerCase().includes(query));

    if (!matchesQuery) return false;
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    if (filterPayment !== 'ALL' && ((e as any).paymentMethod || 'UPI') !== filterPayment) return false;
    
    return true;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    return Date.parse(b.date) - Date.parse(a.date);
  });

  const limitedRecentExpenses = sortedExpenses.slice(0, 10);

  // Line Chart Weeks points
  const monthlyTrendData = useMemo(() => {
    if (isPreview) {
      return [
        { label: 'W1', amount: 8200 },
        { label: 'W2', amount: 9500 },
        { label: 'W3', amount: 7300 },
        { label: 'W4', amount: 7650 },
      ];
    }
    const data = [
      { label: 'W1', amount: 0 },
      { label: 'W2', amount: 0 },
      { label: 'W3', amount: 0 },
      { label: 'W4', amount: 0 },
    ];
    expenses.forEach(e => {
      const d = new Date(e.date);
      const day = d.getDate();
      if (day <= 7) data[0].amount += e.amount;
      else if (day <= 14) data[1].amount += e.amount;
      else if (day <= 21) data[2].amount += e.amount;
      else data[3].amount += e.amount;
    });
    return data;
  }, [expenses, isPreview]);

  // Category Pie Data mapper
  const pieData = useMemo(() => {
    return Object.entries(categoryTotals).map(([cat, val]) => {
      const cfg = categoryConfigs[cat] || { label: cat, color: '#94A3B8' };
      return {
        name: cfg.label,
        value: val,
        color: cfg.color,
      };
    }).filter(p => p.value > 0);
  }, [categoryTotals]);

  // Circular Score ring calculation
  const radius = 14;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  // Filter Categories bar items
  const filterChips = [
    { id: 'ALL', label: 'All Expenses' },
    { id: 'FOOD', label: 'Food & Dining' },
    { id: 'HOUSING', label: 'Rent' },
    { id: 'TRANSPORT', label: 'Travel' },
    { id: 'UTILITIES', label: 'Bills' },
    { id: 'SHOPPING', label: 'Shopping' },
    { id: 'INVESTMENT', label: 'SIP' },
    { id: 'OTHERS', label: 'Others' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 max-w-7xl mx-auto px-3 sm:px-6 select-none bg-slate-50/50 text-slate-900 font-sans">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* SECTION 1: COMPACT RESPONSIVE HERO */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Expense Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-semibold flex items-center gap-1 border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>AI Assisted</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Track daily spends, view category analytics, and optimize your monthly budget.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleQuickAction('ADD')}
            className="flex-1 sm:flex-initial h-10 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('SCAN')}
            className="h-10 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            title="Scan Receipt"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Scan Receipt</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all flex items-center justify-center cursor-pointer"
            title="Export Expenses CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* SECTION 2: MOBILE-PERFECT 2x2 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Card 1: Total Spent */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              ₹{totalSpent.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] sm:text-xs text-rose-500 font-medium block mt-0.5">
              +8% vs last month
            </span>
          </div>
        </div>

        {/* Card 2: Remaining Budget */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Remaining</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-emerald-600 tracking-tight leading-tight">
              ₹{remainingBudget.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400 font-normal block mt-0.5 truncate">
              Salary: ₹{rawSalary.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Top Category</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight truncate">
              {isPreview ? 'Rent' : highestCategoryObj.charAt(0) + highestCategoryObj.slice(1).toLowerCase()}
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium block mt-0.5">
              {isPreview ? '46% of total spend' : `${Math.round(((categoryTotals[highestCategoryObj] || 0) / (totalSpent || 1)) * 100)}% of total spend`}
            </span>
          </div>
        </div>

        {/* Card 4: Spending Health Score */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between hover:border-slate-200 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide block">Health Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-slate-900">{activeScore}</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
                {activeGrade}
              </span>
            </div>
          </div>
          
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] sm:text-xs font-bold text-slate-800">{activeScore}</span>
          </div>
        </div>

      </div>

      {/* SECTION 3: CHARTS (Responsive Category Doughnut & Spending Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Category Split Chart Card (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <span>Category Split</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-normal">Monthly allocation</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Doughnut Pie Chart */}
            <div className="sm:col-span-5 h-40 sm:h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
                <span className="text-[9px] font-semibold uppercase text-slate-400">Total</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Legends / Visual Bars */}
            <div className="sm:col-span-7 space-y-2 max-h-48 overflow-y-auto pr-1">
              {pieData.map((item) => {
                const pct = Math.round((item.value / (totalSpent || 1)) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-800 font-medium">{item.name}</span>
                      </div>
                      <span className="text-slate-900 font-semibold">₹{item.value.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Spending Trend Chart Card (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Weekly Trend</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-normal">Month progress</span>
          </div>
          
          <div className="h-40 sm:h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 4: COMPACT AI INSIGHT BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">AI Spending Insight</span>
              <span className="px-2 py-0.2 text-[9px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">Save ~₹2,000/mo</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Food delivery spending is ₹2,300 higher this month. Reducing dining orders by ₹500/week saves ₹24,000 yearly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-100">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex-1 sm:flex-initial h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Ask AI Assistant</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION 5: CATEGORY FILTER CHIPS & RECENT TRANSACTIONS */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-400 font-normal">Tap any item to view or edit details</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterChips.map(chip => {
            const isActive = filterCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterCategory(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-1">
          {limitedRecentExpenses.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No transactions found matching criteria.</p>
            </div>
          ) : (
            limitedRecentExpenses.map((exp) => {
              const cfg = categoryConfigs[exp.category] || { label: exp.category, icon: '🔮', bg: 'bg-slate-50 text-slate-600 border-slate-200' };
              const payMethod = (exp as any).paymentMethod || 'UPI';

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpense(exp)}
                  className="group p-3 rounded-xl hover:bg-slate-50/80 border border-slate-100/80 flex items-center justify-between transition-all duration-150 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border ${cfg.bg}`}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {exp.title}
                        </span>
                        {exp.isRecurring && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500 shrink-0">
                            Monthly
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-normal mt-0.5">
                        <span className="font-medium text-slate-600">{cfg.label}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[9px] font-medium">
                          {payMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-rose-600">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpenseToDelete(exp);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Side Slide-Out Details Drawer (Mobile Sheet & Desktop Drawer) */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end select-none">
            <div className="flex-1" onClick={() => setSelectedExpense(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white border-l border-slate-200 h-full p-5 sm:p-6 shadow-2xl flex flex-col space-y-5 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Logged Amount
                </span>
                <h2 className="text-2xl font-bold text-rose-600">
                  -₹{selectedExpense.amount.toLocaleString('en-IN')}
                </h2>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
                  {selectedExpense.category}
                </div>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {[
                  { label: 'Merchant / Title', val: selectedExpense.title },
                  { label: 'Payment Method', val: (selectedExpense as any).paymentMethod || 'UPI' },
                  { label: 'Date Logged', val: selectedExpense.date },
                  { label: 'Subscription Mode', val: selectedExpense.isRecurring ? 'Recurring Monthly' : 'One-Time Transaction' },
                  { label: 'Notes', val: selectedExpense.notes || 'No notes added.' },
                ].map((prop, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {prop.label}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800">
                      {prop.val}
                    </p>
                  </div>
                ))}

                {/* Receipt Preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 block">Uploaded Receipt</span>
                  {(selectedExpense as any).receiptURL ? (
                    <div className="w-full max-h-40 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img src={(selectedExpense as any).receiptURL} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-normal italic">No receipt file uploaded.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2 sm:gap-3">
                <button
                  onClick={() => setExpenseToDelete(selectedExpense)}
                  className="h-10 flex-1 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs cursor-pointer transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    const toEdit = selectedExpense;
                    setSelectedExpense(null);
                    handleEditClick(toEdit);
                  }}
                  className="h-10 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer transition-all"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Mobile-Friendly Modal Dialog */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-50 flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>{editingExpense ? 'Edit Expense' : 'Log New Expense'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">Merchant / Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy Gourmet"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium ${getInputBorderClass('title')}`}
                    />
                    {touchedFields['title'] && (
                      <div className="absolute right-3.5 top-2.5 pointer-events-none">
                        {fieldErrors['title'] ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['title'] && fieldErrors['title'] && (
                    <span className="text-[10px] text-red-500 font-medium block">{fieldErrors['title']}</span>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">Amount (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium ${getInputBorderClass('amount')}`}
                    />
                    {touchedFields['amount'] && (
                      <div className="absolute right-3.5 top-2.5 pointer-events-none">
                        {fieldErrors['amount'] ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['amount'] && fieldErrors['amount'] && (
                    <span className="text-[10px] text-red-500 font-medium block">{fieldErrors['amount']}</span>
                  )}
                </div>

                {/* Warnings Alert banners */}
                {(budgetWarning || categoryAlert) && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-700 space-y-1">
                    {budgetWarning && <p className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {budgetWarning}</p>}
                    {categoryAlert && <p className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {categoryAlert}</p>}
                  </div>
                )}

                {/* Row: Category & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none font-medium cursor-pointer"
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
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none font-medium cursor-pointer"
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

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Transaction details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none font-normal"
                  />
                </div>

                {/* Receipt attachment preview */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block">Receipt Attachment</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-medium cursor-pointer"
                    >
                      Attach File
                    </button>
                  </div>
                  {receiptPreview && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 mt-1">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Subscription Check */}
                <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-blue-600 h-4 w-4 rounded"
                  />
                  <span>Recurring Monthly Subscription</span>
                </label>

              </form>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving || isExpenseAdded || Object.keys(fieldErrors).length > 0}
                  className={`h-9 px-4 rounded-xl text-white font-semibold text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                    isExpenseAdded
                      ? 'bg-emerald-600 border-emerald-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isExpenseAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Expense Added!</span>
                    </>
                  ) : (
                    <span>{editingExpense ? 'Save Changes' : 'Log Expense'}</span>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Dialog */}
      <AnimatePresence>
        {expenseToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl border border-slate-100"
            >
              <h3 className="text-base font-bold text-slate-900">Delete Expense?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this expense entry? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Delete
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
