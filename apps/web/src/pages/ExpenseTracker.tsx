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
      title: 'Housing Rent & Utilities',
      amount: 18000,
      category: 'HOUSING',
      type: 'EXPENSE',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: true,
      notes: 'Monthly housing rent contribution',
    },
    {
      id: 'demo-2',
      title: 'Swiggy & Groceries',
      amount: 8400,
      category: 'FOOD',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Weekend restaurant order & food supplies',
    },
    {
      id: 'demo-3',
      title: 'Electricity & Wi-Fi',
      amount: 3200,
      category: 'UTILITIES',
      type: 'EXPENSE',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: true,
      notes: 'Utility payments',
    },
    {
      id: 'demo-4',
      title: 'Zara & Apparel Shopping',
      amount: 4500,
      category: 'SHOPPING',
      type: 'EXPENSE',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Apparel clothing log',
    },
    {
      id: 'demo-5',
      title: 'Weekly Supermarket Provisions',
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
      title: 'Nifty 50 Index SIP',
      amount: 15000,
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
  const rawSalary = incomeData?.monthlyIncome || userProfile?.monthlySalary || 45000;
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

  // Category totals
  const categoryTotals = activeExpensesList.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const highestCategoryObj = Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])[0] || 'None'
    : 'None';

  // Premium Category Config mappings
  const categoryConfigs: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    HOUSING: { label: 'Housing', icon: '🏠', color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    FOOD: { label: 'Food', icon: '🍔', color: '#EF4444', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    TRANSPORT: { label: 'Transport', icon: '🚗', color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    UTILITIES: { label: 'Utilities', icon: '⚡', color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    ENTERTAINMENT: { label: 'Fun & OTT', icon: '🎬', color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
    HEALTHCARE: { label: 'Health', icon: '🩺', color: '#06B6D4', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    SHOPPING: { label: 'Shopping', icon: '🛒', color: '#A855F7', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    INVESTMENT: { label: 'Investment', icon: '💰', color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    DEBT_EMI: { label: 'Loan EMI', icon: '💳', color: '#64748B', bg: 'bg-slate-800 text-slate-300 border-slate-700' },
    OTHERS: { label: 'Others', icon: '🔮', color: '#94A3B8', bg: 'bg-slate-800 text-slate-300 border-slate-700' }
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
          setBudgetWarning(`Warning: Exceeds monthly income budget by ₹${overflow.toLocaleString('en-IN')}.`);
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
        ? 'border-rose-500 bg-rose-500/5'
        : 'border-emerald-500 bg-emerald-500/5';
    }
    return 'border-slate-800 focus:border-indigo-500';
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
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  // Filter Categories bar items
  const filterChips = [
    { id: 'ALL', label: 'All Expenses' },
    { id: 'FOOD', label: 'Food & Dining' },
    { id: 'HOUSING', label: 'Housing' },
    { id: 'TRANSPORT', label: 'Travel' },
    { id: 'UTILITIES', label: 'Bills' },
    { id: 'SHOPPING', label: 'Shopping' },
    { id: 'INVESTMENT', label: 'SIP' },
    { id: 'OTHERS', label: 'Others' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 selection:bg-blue-500 selection:text-white">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* HEADER BAR */}
      <div className="pt-6 pb-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-indigo-500 to-blue-500 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Receipt className="h-5 w-5 text-rose-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
                Log daily transactions, category splits & real-time cash outflow analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => handleQuickAction('ADD')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
          
          <button
            onClick={() => handleQuickAction('SCAN')}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="h-4 w-4 text-slate-400" />
            <span>Scan Receipt</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 w-9 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center cursor-pointer"
            title="Export CSV"
          >
            <Download className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* SECTION 2: 4 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Spent */}
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/80 border border-rose-500/25 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight leading-none">
              ₹{totalSpent.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-semibold text-rose-400 block mt-1">
              Active monthly outflow
            </span>
          </div>
        </motion.div>

        {/* Card 2: Remaining Surplus */}
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/80 border border-emerald-500/25 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Surplus</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight leading-none">
              ₹{remainingBudget.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 block mt-1">
              Base: ₹{rawSalary.toLocaleString('en-IN')}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Top Category */}
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900/80 border border-indigo-500/25 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Category</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none truncate">
              {isPreview ? 'Housing Rent' : highestCategoryObj.charAt(0) + highestCategoryObj.slice(1).toLowerCase()}
            </h3>
            <span className="text-[11px] font-semibold text-indigo-400 block mt-1">
              {isPreview ? '46% of total spend' : `${Math.round(((categoryTotals[highestCategoryObj] || 0) / (totalSpent || 1)) * 100)}% of total spend`}
            </span>
          </div>
        </motion.div>

        {/* Card 4: Health Score */}
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Score</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">{activeScore}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                {activeGrade}
              </span>
            </div>
          </div>
          
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
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
            <span className="absolute text-[10px] font-extrabold text-white">{activeScore}</span>
          </div>
        </motion.div>

      </div>

      {/* SECTION 3: CHARTS (Category Doughnut & Weekly Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Split Chart Card (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-indigo-400" />
              <span>Category Outflow Split</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Monthly breakdown</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Doughnut Pie Chart */}
            <div className="sm:col-span-5 h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center flex flex-col justify-center items-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
                <span className="text-sm font-extrabold text-white mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Legends / Visual Bars */}
            <div className="sm:col-span-7 space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {pieData.map((item) => {
                const pct = Math.round((item.value / (totalSpent || 1)) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-white font-semibold">{item.name}</span>
                      </div>
                      <span className="text-white font-bold">₹{item.value.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Weekly Trend Area Chart Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <span>Weekly Outflow Trend</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Monthly progress</span>
          </div>
          
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 4: AI INSIGHT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Outflow Intelligence</span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                Save ~₹2,000/mo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Food delivery spending is ₹2,300 higher this month. Reducing dining orders by ₹500/week builds an extra ₹24,000 annual wealth surplus.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <span>Ask Sarthi AI</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* SECTION 5: CATEGORY FILTER CHIPS & RECENT TRANSACTIONS */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-5">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-rose-400" />
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400 font-medium">Tap any item to view or edit details</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-white placeholder-slate-500"
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5 pt-1">
          {limitedRecentExpenses.length === 0 ? (
            <div className="py-12 text-center space-y-2 border-2 border-dashed border-slate-800 rounded-2xl">
              <div className="h-10 w-10 rounded-full bg-slate-950 text-slate-400 mx-auto flex items-center justify-center border border-slate-800">
                <Receipt className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">No transactions found matching criteria.</p>
            </div>
          ) : (
            limitedRecentExpenses.map((exp) => {
              const cfg = categoryConfigs[exp.category] || { label: exp.category, icon: '🔮', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
              const payMethod = (exp as any).paymentMethod || 'UPI';

              return (
                <motion.div
                  key={exp.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedExpense(exp)}
                  className="group p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between transition-all duration-150 cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border ${cfg.bg}`}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {exp.title}
                        </span>
                        {exp.isRecurring && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                            Monthly
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                        <span className="font-semibold text-slate-300">{cfg.label}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {payMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-rose-400">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpenseToDelete(exp);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>

      {/* Side Slide-Out Details Drawer */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end select-none">
            <div className="flex-1" onClick={() => setSelectedExpense(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col space-y-6 text-slate-100 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Logged Outflow Amount
                </span>
                <h2 className="text-3xl font-black text-rose-400">
                  -₹{selectedExpense.amount.toLocaleString('en-IN')}
                </h2>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mt-1">
                  {selectedExpense.category}
                </div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {[
                  { label: 'Merchant / Description', val: selectedExpense.title },
                  { label: 'Payment Method', val: (selectedExpense as any).paymentMethod || 'UPI' },
                  { label: 'Date Logged', val: selectedExpense.date },
                  { label: 'Subscription Mode', val: selectedExpense.isRecurring ? 'Recurring Monthly' : 'One-Time Transaction' },
                  { label: 'Notes', val: selectedExpense.notes || 'No notes added.' },
                ].map((prop, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {prop.label}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {prop.val}
                    </p>
                  </div>
                ))}

                {/* Receipt Preview */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Uploaded Receipt</span>
                  {(selectedExpense as any).receiptURL ? (
                    <div className="w-full max-h-44 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
                      <img src={(selectedExpense as any).receiptURL} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium italic">No receipt attachment uploaded.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-3">
                <button
                  onClick={() => setExpenseToDelete(selectedExpense)}
                  className="h-11 flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold text-xs cursor-pointer transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    const toEdit = selectedExpense;
                    setSelectedExpense(null);
                    handleEditClick(toEdit);
                  }}
                  className="h-11 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer transition-all shadow-lg shadow-blue-600/30"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal Dialog */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden space-y-5 text-white"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase text-white flex items-center gap-2 tracking-wider">
                  <Receipt className="h-5 w-5 text-rose-400" />
                  <span>{editingExpense ? 'Edit Expense' : 'Log New Expense'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-semibold text-slate-300">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Merchant / Description</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy Gourmet"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`w-full bg-slate-900 border rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none font-bold ${getInputBorderClass('title')}`}
                    />
                    {touchedFields['title'] && (
                      <div className="absolute right-3.5 top-3 pointer-events-none">
                        {fieldErrors['title'] ? <AlertCircle className="h-4 w-4 text-rose-400" /> : <Check className="h-4 w-4 text-emerald-400" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['title'] && fieldErrors['title'] && (
                    <span className="text-[10px] text-rose-400 font-bold block">{fieldErrors['title']}</span>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full bg-slate-900 border rounded-xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none font-bold ${getInputBorderClass('amount')}`}
                    />
                    {touchedFields['amount'] && (
                      <div className="absolute right-3.5 top-3 pointer-events-none">
                        {fieldErrors['amount'] ? <AlertCircle className="h-4 w-4 text-rose-400" /> : <Check className="h-4 w-4 text-emerald-400" />}
                      </div>
                    )}
                  </div>
                  {touchedFields['amount'] && fieldErrors['amount'] && (
                    <span className="text-[10px] text-rose-400 font-bold block">{fieldErrors['amount']}</span>
                  )}
                </div>

                {/* Warnings Alert banners */}
                {(budgetWarning || categoryAlert) && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 space-y-1">
                    {budgetWarning && <p className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4 shrink-0" /> {budgetWarning}</p>}
                    {categoryAlert && <p className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4 shrink-0" /> {categoryAlert}</p>}
                  </div>
                )}

                {/* Row: Category & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Transaction details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                  />
                </div>

                {/* Subscription Check */}
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-indigo-500 h-4 w-4 rounded"
                  />
                  <span>Recurring Monthly Subscription</span>
                </label>

              </form>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving || isExpenseAdded || Object.keys(fieldErrors).length > 0}
                  className={`h-11 px-6 rounded-xl text-white font-bold text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isExpenseAdded
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isExpenseAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Expense Logged!</span>
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white"
            >
              <h3 className="text-base font-bold text-white">Delete Expense Entry?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to remove this expense entry? This action will update your monthly surplus immediately.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExpenseTracker;
