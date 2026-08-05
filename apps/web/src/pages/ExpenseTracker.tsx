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
  ChevronRight,
  Clock,
  Lightbulb,
  Building,
  Sliders,
  PiggyBank,
  Info,
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
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

// Spending Intelligence Services
import { SpendingHealthService } from '../services/spending-intelligence/spending-health.service';
import { TimelineService } from '../services/spending-intelligence/timeline.service';

export const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpense, setIsAiDrawerOpen, incomeData } = useFinancial();
  const { userProfile } = useAuth();

  // Dialog & Selection States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('NEWEST');

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
      title: 'Swiggy Gourmet Dinner',
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
      title: 'Zara Shopping & Outfits',
      amount: 4500,
      category: 'SHOPPING',
      type: 'EXPENSE',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isRecurring: false,
      notes: 'Apparel clothing log',
    },
    {
      id: 'demo-5',
      title: 'Weekly Grocery Stock',
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

  // Category Config mappings
  const categoryConfigs: Record<string, { label: string; icon: string; color: string }> = {
    HOUSING: { label: 'Rent', icon: '🏠', color: '#10B981' },
    FOOD: { label: 'Food', icon: '🍔', color: '#EF4444' },
    TRANSPORT: { label: 'Travel', icon: '✈', color: '#3B82F6' },
    UTILITIES: { label: 'Bills', icon: '⚡', color: '#F59E0B' },
    ENTERTAINMENT: { label: 'Entertainment', icon: '🎬', color: '#EC4899' },
    HEALTHCARE: { label: 'Medical', icon: '🩺', color: '#06B6D4' },
    SHOPPING: { label: 'Shopping', icon: '🛒', color: '#8B5CF6' },
    INVESTMENT: { label: 'Investment', icon: '💰', color: '#10B981' },
    DEBT_EMI: { label: 'EMI Loans', icon: '💳', color: '#64748B' },
    OTHERS: { label: 'Others', icon: '🔮', color: '#94A3B8' }
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
      const confirmLarge = window.confirm(`Large Expense Confirmation: You are logging a transaction of ₹${numAmt.toLocaleString('en-IN')}. Confirm?`);
      if (!confirmLarge) return;
    }

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

      alert('Expense added successfully.');

      setTitle('');
      setAmount('');
      setIsRecurring(false);
      setNotes('');
      setReceiptPreview(null);
      setFieldErrors({});
      setTouchedFields({});
      setEditingExpense(null);
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Unable to add expense.');
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

  // Filter out recent transactions list (max 8)
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

  const limitedRecentExpenses = sortedExpenses.slice(0, 8);

  // Line Chart Weeks points
  const monthlyTrendData = useMemo(() => {
    if (isPreview) {
      return [
        { label: 'Week 1', amount: 8200 },
        { label: 'Week 2', amount: 9500 },
        { label: 'Week 3', amount: 7300 },
        { label: 'Week 4', amount: 7650 },
      ];
    }
    const data = [
      { label: 'Week 1', amount: 0 },
      { label: 'Week 2', amount: 0 },
      { label: 'Week 3', amount: 0 },
      { label: 'Week 4', amount: 0 },
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
  const radius = 16;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius; // 100.53
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 md:px-6 select-none bg-[#F8FAFC] text-[#0F172A]">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* SECTION 1: HERO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-[44px] font-black tracking-tight text-[#0F172A] leading-none">
            My Expenses
          </h1>
          <p className="text-[17px] text-[#64748B] font-bold">
            Track every rupee. Stay in control of your spending.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleQuickAction('ADD')}
            className="h-11 px-6 rounded-[18px] bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[16px] shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            + Add Expense
          </button>
          
          <button
            onClick={() => handleQuickAction('SCAN')}
            className="h-11 px-6 rounded-[18px] bg-white border border-slate-205 hover:bg-slate-50 text-[16px] font-bold text-[#64748B] cursor-pointer transition-all shrink-0"
          >
            Scan Receipt
          </button>
        </div>
      </div>

      {/* SECTION 2: EXPENSE SUMMARY ROW (4 Premium Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Monthly Spent */}
        <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-[16px] font-bold text-[#64748B] block uppercase tracking-wide">Monthly Spent</span>
          <div>
            <h3 className="text-[34px] font-black text-[#0F172A] leading-none">₹{totalSpent.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-[#EF4444] font-bold block mt-2">+8% from last month</span>
          </div>
        </div>

        {/* Card 2: Remaining Budget */}
        <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-[16px] font-bold text-[#64748B] block uppercase tracking-wide">Remaining Budget</span>
          <div>
            <h3 className="text-[34px] font-black text-[#10B981] leading-none">₹{remainingBudget.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-[#64748B] font-bold block mt-2">Salary: ₹{rawSalary.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 3: Top Spending Category */}
        <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-36 hover:-translate-y-0.5 transition-all duration-300">
          <span className="text-[16px] font-bold text-[#64748B] block uppercase tracking-wide">Top Category</span>
          <div>
            <h3 className="text-[34px] font-black text-[#0F172A] leading-none">
              {isPreview ? 'Rent' : highestCategoryObj.charAt(0) + highestCategoryObj.slice(1).toLowerCase()}
            </h3>
            <span className="text-xs text-[#64748B] font-bold block mt-2">
              {isPreview ? '46% of monthly spent' : `${Math.round(((categoryTotals[highestCategoryObj] || 0) / totalSpent) * 100)}% of monthly spent`}
            </span>
          </div>
        </div>

        {/* Card 4: Spending Health Score with Circular Ring */}
        <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between h-36 hover:-translate-y-0.5 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[16px] font-bold text-[#64748B] block uppercase tracking-wide">Spending Score</span>
            <span className="text-sm text-[#10B981] font-black block">{activeGrade}</span>
          </div>
          
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
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
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-[#0F172A]">{activeScore}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: CHARTS (TWO CHARTS ONLY, 60% Left Donut | 40% Right Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* LEFT (60%): Doughnut Category Split */}
        <div className="lg:col-span-7 p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          <h3 className="text-[30px] font-black text-[#0F172A] tracking-tight leading-none">Category Split</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* Doughnut Pie chart */}
            <div className="sm:col-span-5 h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={72}
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
                <span className="text-[10px] font-black uppercase text-[#64748B] tracking-wider leading-none">Total</span>
                <span className="text-[17px] font-black text-[#0F172A] mt-1">₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Legends */}
            <div className="sm:col-span-7 space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs font-bold text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[#0F172A]">₹{item.value.toLocaleString('en-IN')} ({Math.round((item.value / totalSpent) * 100)}%)</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT (40%): Spending Trend Line Chart */}
        <div className="lg:col-span-5 p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          <h3 className="text-[30px] font-black text-[#0F172A] tracking-tight leading-none">Spending Trend</h3>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} width={28} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 4: AI INSIGHT (ONLY ONE CARD) */}
      <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-l-4 border-l-[#2563EB] space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h4 className="text-[17px] font-bold text-[#0F172A] uppercase tracking-wider">AI Spending Insight</h4>
        </div>
        
        <div className="space-y-1">
          <p className="text-[17px] text-[#0F172A] font-medium leading-relaxed">
            You spent ₹2,300 more on Food this month. Reducing food delivery by ₹500/week could save ₹2,000 monthly.
          </p>
          <p className="text-xs font-bold text-[#10B981] pt-1">
            Estimated yearly savings: ₹24,000
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => alert('AI Budget suggestion applied successfully!')}
            className="h-9 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all"
          >
            Apply Suggestion
          </button>
          
          <button
            onClick={() => alert('Insight dismissed.')}
            className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs cursor-pointer transition-all"
          >
            Dismiss
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="h-9 px-4 rounded-xl hover:bg-slate-50 text-slate-400 font-bold text-xs cursor-pointer transition-all"
          >
            Explain Why
          </button>
        </div>
      </div>

      {/* SECTION 5: RECENT TRANSACTIONS (MAXIMUM 8 ROWS) */}
      <div className="p-6 rounded-[18px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-[30px] font-black text-[#0F172A] tracking-tight leading-none">Recent Transactions</h3>
          <span className="text-xs text-[#64748B] font-bold">Showing {limitedRecentExpenses.length} entries</span>
        </div>

        <div className="space-y-3">
          {limitedRecentExpenses.map((exp) => {
            const cfg = categoryConfigs[exp.category] || { label: exp.category, icon: '🔮' };
            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExpense(exp)}
                className="group py-3 px-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-lg shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[18px] font-bold text-[#0F172A] block truncate group-hover:text-[#2563EB] transition-colors leading-snug">
                      {exp.title}
                    </span>
                    <span className="text-xs font-bold text-[#64748B] block mt-0.5 uppercase tracking-wide">
                      {cfg.label} • {exp.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-black text-[#EF4444] shrink-0">
                    -₹{exp.amount.toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpenseToDelete(exp);
                    }}
                    className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                    title="Delete Transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ChevronRight className="h-4.5 w-4.5 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={handleExportCSV}
            className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors uppercase tracking-wider"
          >
            View All Transactions / Export
          </button>
        </div>
      </div>

      {/* SECTION 6: QUICK ACTIONS (FOUR EQUAL CARDS) */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-[#64748B] tracking-widest block">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button
            onClick={() => handleQuickAction('ADD')}
            className="p-5 rounded-[18px] bg-white border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-24 w-full"
          >
            <span className="text-xl">➕</span>
            <span className="text-xs font-bold text-[#0F172A]">Add Expense</span>
          </button>

          <button
            onClick={() => handleQuickAction('SCAN')}
            className="p-5 rounded-[18px] bg-white border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-24 w-full"
          >
            <span className="text-xl">📷</span>
            <span className="text-xs font-bold text-[#0F172A]">Scan Receipt</span>
          </button>

          <button
            onClick={() => handleQuickAction('IMPORT')}
            className="p-5 rounded-[18px] bg-white border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-24 w-full"
          >
            <span className="text-xl">📄</span>
            <span className="text-xs font-bold text-[#0F172A]">Import Statement</span>
          </button>

          <button
            onClick={() => handleQuickAction('ASK')}
            className="p-5 rounded-[18px] bg-white border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md hover:scale-[1.02] transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-24 w-full"
          >
            <span className="text-xl">✨</span>
            <span className="text-xs font-bold text-[#0F172A]">Ask AI</span>
          </button>

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
              className="w-full max-w-md bg-white border-l border-slate-205 h-full p-6 shadow-2xl flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 rounded-[18px] bg-[#F8FAFC] border border-slate-100 text-center space-y-2">
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block">
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
                  { label: 'Merchant Description', val: selectedExpense.title },
                  { label: 'Payment Method', val: (selectedExpense as any).paymentMethod || 'UPI' },
                  { label: 'Date Logged', val: selectedExpense.date },
                  { label: 'Subscription Mode', val: selectedExpense.isRecurring ? 'Recurring Monthly' : 'One-Time Transaction' },
                  { label: 'Notes Description', val: selectedExpense.notes || 'No added descriptions.' },
                ].map((prop, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[#64748B]">
                      {prop.label}
                    </span>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {prop.val}
                    </p>
                  </div>
                ))}

                {/* Receipt Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 block">Uploaded Receipt</span>
                  {(selectedExpense as any).receiptURL ? (
                    <div className="w-full max-h-40 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img src={(selectedExpense as any).receiptURL} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#64748B] font-semibold italic">No receipt file uploaded.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex gap-3">
                <button
                  onClick={() => {
                    setExpenseToDelete(selectedExpense);
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
                  className="h-10 flex-1 rounded-xl bg-[#2563EB] hover:bg-blue-650 text-white font-bold text-xs cursor-pointer transition-all"
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
              className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[28px] p-6 shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                  <Receipt className="h-4.5 w-4.5 text-[#2563EB]" />
                  <span>{editingExpense ? 'Edit Transaction Details' : 'Log Expense Transaction'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase block">Merchant / Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swiggy Gourmet"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`w-full bg-[#F8FAFC] border rounded-xl px-3.5 py-3 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none font-semibold ${getInputBorderClass('title')}`}
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
                  <label className="text-[10px] font-bold text-[#64748B] uppercase block">Amount (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full bg-[#F8FAFC] border rounded-xl px-3.5 py-3 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none font-semibold ${getInputBorderClass('amount')}`}
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
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-605 space-y-1">
                    {budgetWarning && <p className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {budgetWarning}</p>}
                    {categoryAlert && <p className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {categoryAlert}</p>}
                  </div>
                )}

                {/* Row: Category & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-3 text-xs text-[#0F172A] focus:outline-none font-semibold cursor-pointer"
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
                    <label className="text-[10px] font-bold text-[#64748B] uppercase block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-3 text-xs text-[#0F172A] focus:outline-none font-semibold cursor-pointer"
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
                  <label className="text-[10px] font-bold text-[#64748B] uppercase block">Notes Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter transaction specifics..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:outline-none font-medium"
                  />
                </div>

                {/* Receipt attachment preview */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase block">Receipt Attachment</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-4 rounded-lg border border-slate-205 hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                    >
                      Attach receipt file
                    </button>
                  </div>
                  {receiptPreview && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Subcription Check */}
                <label className="flex items-center gap-2 text-xs text-[#64748B] font-semibold cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="accent-blue-550 h-4 w-4"
                  />
                  <span>Recurring Monthly Subscription</span>
                </label>

              </form>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-[#64748B] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={Object.keys(fieldErrors).length > 0}
                  className="h-10 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-650 disabled:bg-blue-600/40 disabled:text-white/60 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {editingExpense ? 'Save Changes' : 'Log Transaction'}
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
            className="fixed inset-0 bg-[#020617]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-[18px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-[#0F172A]">Delete Expense?</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-[#64748B] hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-10 px-4 rounded-xl bg-[#EF4444] hover:bg-red-650 text-white font-bold text-xs cursor-pointer"
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
