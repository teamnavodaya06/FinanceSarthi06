import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  UserProfile,
  Expense,
  Goal,
  Asset,
  Liability,
  CityTier,
  FinancialHealthScore,
  TaxCalculationResult,
  BudgetAllocation,
  Income,
  Budget,
} from '@financesarthi/types';
import {
  calculateIndianTax,
  calculate50_30_20,
  calculateFinancialHealthScore,
} from '@financesarthi/utils';
import {
  expensesService,
  goalsService,
  investmentsService,
  loansService,
  activityService,
  incomeService,
  budgetService,
} from '../services/firestore';
import { financialEvents } from '../services/copilot/financial-events';
import { incomeApi } from '../api/incomeApi';
import { expenseApi } from '../api/expenseApi';

interface FinancialContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'userId'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  assets: Asset[];
  liabilities: Liability[];
  addAsset: (asset: Omit<Asset, 'id' | 'userId'>) => Promise<void>;
  addLiability: (liability: Omit<Liability, 'id' | 'userId'>) => Promise<void>;
  
  // Real-Time FDSL additions
  incomeData: Income | null;
  updateIncome: (data: Partial<Income>) => Promise<void>;
  budgets: Budget[];
  setBudget: (budgetId: string, data: Partial<Budget>) => Promise<void>;
  syncStatus: 'SYNCING' | 'SYNCED' | 'OFFLINE' | 'ERROR';
  syncError: string | null;
  monthlySurplus: number;
  savingsRate: number;
  expenseRatio: number;
  budgetUtilization: { [category: string]: { allocated: number; spent: number; utilization: number } };
  netWorth: number;
  aiContext: any;
  
  healthScore: FinancialHealthScore;
  taxSummary: TaxCalculationResult;
  budgetSummary: BudgetAllocation;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, user: fbUser } = useAuth();

  // Dynamic user state synced with real authenticated Firebase User & Firestore Profile
  const [user, setUser] = useState<UserProfile>({
    id: fbUser?.uid || userProfile?.uid || 'usr-default',
    email: userProfile?.email || fbUser?.email || '',
    name: userProfile?.displayName || fbUser?.displayName || 'FinanceSarthi User',
    role: 'USER',
    cityTier: userProfile?.cityTier || 'TIER_2',
    monthlyIncome: userProfile?.monthlySalary || 75000,
    avatarUrl: userProfile?.photoURL || fbUser?.photoURL || undefined,
    createdAt: userProfile?.createdAt || new Date().toISOString(),
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Firestore-backed state lists
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const local = localStorage.getItem('localAddedExpenses');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [incomeData, setIncomeData] = useState<Income | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // FDSL Sync and connection states
  const [syncStatus, setSyncStatus] = useState<'SYNCING' | 'SYNCED' | 'OFFLINE' | 'ERROR'>('SYNCING');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync user state whenever userProfile or fbUser changes
  useEffect(() => {
    if (userProfile || fbUser) {
      const uid = fbUser?.uid || userProfile?.uid || 'usr-default';
      localStorage.setItem('fb_uid', uid);
      const inc = userProfile?.monthlySalary || 45000;
      setUser({
        id: uid,
        email: userProfile?.email || fbUser?.email || '',
        name: userProfile?.displayName || fbUser?.displayName || 'FinanceSarthi User',
        role: 'USER',
        cityTier: userProfile?.cityTier || 'TIER_2',
        monthlyIncome: inc,
        avatarUrl: userProfile?.photoURL || fbUser?.photoURL || undefined,
        createdAt: userProfile?.createdAt || new Date().toISOString(),
      });
      localStorage.setItem('user_monthly_income', inc.toString());
    } else {
      localStorage.removeItem('fb_uid');
      localStorage.setItem('user_monthly_income', '45000');
    }
  }, [userProfile, fbUser]);

  // Sync user monthlyIncome with Firestore incomeData changes immediately
  useEffect(() => {
    if (incomeData?.monthlyIncome) {
      setUser(prev => ({
        ...prev,
        monthlyIncome: incomeData.monthlyIncome,
      }));
      localStorage.setItem('user_monthly_income', incomeData.monthlyIncome.toString());
    }
  }, [incomeData?.monthlyIncome]);

  useEffect(() => {
    if (user?.monthlyIncome) {
      localStorage.setItem('user_monthly_income', user.monthlyIncome.toString());
    }
  }, [user?.monthlyIncome]);

  // Online / Offline synchronization monitors
  useEffect(() => {
    const handleOnline = () => setSyncStatus('SYNCED');
    const handleOffline = () => setSyncStatus('OFFLINE');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-Time Snapshot Listeners for current user's documents
  useEffect(() => {
    if (!fbUser) {
      try {
        const local = localStorage.getItem('localAddedExpenses');
        setExpenses(local ? JSON.parse(local) : []);
      } catch {
        setExpenses([]);
      }
      setGoals([]);
      setAssets([]);
      setLiabilities([]);
      setBudgets([]);
      
      // Initialize incomeData from backend Express API if Firebase user is null
      incomeApi.getIncome().then(response => {
        if (response.success && response.data) {
          setIncomeData(response.data);
          setSyncStatus('SYNCED');
        } else {
          setIncomeData(null);
          setSyncStatus('SYNCED');
        }
      }).catch(err => {
        console.warn('Failed to pre-fetch income from backend:', err);
        setIncomeData(null);
        setSyncStatus('SYNCED');
      });
      return;
    }

    setSyncStatus('SYNCING');

    let unsubExpenses = () => {};
    let unsubGoals = () => {};
    let unsubAssets = () => {};
    let unsubLiabilities = () => {};
    let unsubIncome = () => {};
    let unsubBudgets = () => {};

    try {
      // 1. Expenses listener
      unsubExpenses = expensesService.listenToExpenses(async (list) => {
        const hasSeeded = localStorage.getItem(`seeded_expenses_${fbUser.uid}`);
        if (list.length === 0 && !hasSeeded) {
          localStorage.setItem(`seeded_expenses_${fbUser.uid}`, 'true');
          const defaultExps = [
            { title: 'House Rent & Utilities', amount: 18000, category: 'HOUSING' as const, type: 'EXPENSE' as const, isRecurring: true, date: new Date().toISOString().split('T')[0] },
            { title: 'Swiggy & Groceries', amount: 8400, category: 'FOOD' as const, type: 'EXPENSE' as const, isRecurring: false, date: new Date().toISOString().split('T')[0] },
            { title: 'Electricity & Wi-Fi', amount: 3200, category: 'UTILITIES' as const, type: 'EXPENSE' as const, isRecurring: true, date: new Date().toISOString().split('T')[0] },
            { title: 'Netflix & Spotify', amount: 999, category: 'ENTERTAINMENT' as const, type: 'EXPENSE' as const, isRecurring: true, date: new Date().toISOString().split('T')[0] },
            { title: 'Car EMI', amount: 12500, category: 'DEBT_EMI' as const, type: 'EXPENSE' as const, isRecurring: true, date: new Date().toISOString().split('T')[0] },
            { title: 'SIP Index Investment', amount: 15000, category: 'INVESTMENT' as const, type: 'EXPENSE' as const, isRecurring: true, date: new Date().toISOString().split('T')[0] },
          ];
          for (const e of defaultExps) {
            await expensesService.addExpense(e);
          }
        } else {
          setExpenses(list);
          setSyncStatus(navigator.onLine ? 'SYNCED' : 'OFFLINE');
          financialEvents.emit('ExpenseCreated', list);
        }
      });

      // 2. Goals listener
      unsubGoals = goalsService.listenToGoals(async (list) => {
        if (list.length === 0) {
          const defaultGoals: Omit<Goal, 'id' | 'userId'>[] = [
            {
              goalId: 'g-ef',
              goalName: '6-Month Emergency Safety Fund',
              goalType: 'EMERGENCY_FUND',
              title: '6-Month Emergency Safety Fund',
              category: 'EMERGENCY_FUND',
              targetAmount: 300005,
              currentAmount: 180000,
              remainingAmount: 120005,
              targetDate: '2026-12-31',
              estimatedCompletionDate: '2026-12-31',
              completionPercentage: 60,
              monthlyAllocation: 20000,
              monthlyContribution: 20000,
              priority: 'Critical',
              status: 'On Track',
              isCompleted: false
            },
            {
              goalId: 'g-veh',
              goalName: 'Electric SUV Down Payment',
              goalType: 'VEHICLE',
              title: 'Electric SUV Down Payment',
              category: 'VEHICLE',
              targetAmount: 500005,
              currentAmount: 220000,
              remainingAmount: 280005,
              targetDate: '2027-06-30',
              estimatedCompletionDate: '2027-06-30',
              completionPercentage: 44,
              monthlyAllocation: 15000,
              monthlyContribution: 15000,
              priority: 'High',
              status: 'In Progress',
              isCompleted: false
            },
            {
              goalId: 'g-house',
              goalName: 'House Property Fund',
              goalType: 'HOUSE',
              title: 'House Property Fund',
              category: 'HOUSE',
              targetAmount: 2500005,
              currentAmount: 450000,
              remainingAmount: 2050005,
              targetDate: '2030-12-31',
              estimatedCompletionDate: '2030-12-31',
              completionPercentage: 18,
              monthlyAllocation: 25000,
              monthlyContribution: 25000,
              priority: 'High',
              status: 'In Progress',
              isCompleted: false
            },
          ];
          for (const g of defaultGoals) {
            await goalsService.addGoal(g);
          }
        } else {
          setGoals(list);
          financialEvents.emit('GoalUpdated', list);
        }
      });

      // 3. Investments/Assets listener
      unsubAssets = investmentsService.listenToInvestments(async (list) => {
        if (list.length === 0) {
          const defaultAssets = [
            { name: 'HDFC Savings Account', category: 'Bank' as const, value: 145000, updatedAt: new Date().toISOString().split('T')[0] },
            { name: 'Zerodha Mutual Fund Portfolio', category: 'Mutual Funds' as const, value: 380000, updatedAt: new Date().toISOString().split('T')[0] },
            { name: 'EPF & VPF Balance', category: 'PF/NPS' as const, value: 290000, updatedAt: new Date().toISOString().split('T')[0] },
            { name: 'Sovereign Gold Bonds', category: 'Gold' as const, value: 85000, updatedAt: new Date().toISOString().split('T')[0] },
          ];
          for (const a of defaultAssets) {
            await investmentsService.addInvestment(a);
          }
        } else {
          setAssets(list);
          financialEvents.emit('InvestmentUpdated', list);
        }
      });

      // 4. Loans/Liabilities listener
      unsubLiabilities = loansService.listenToLoans(async (list) => {
        if (list.length === 0) {
          const defaultLiabs = [
            { name: 'HDFC Car Loan', category: 'Car Loan' as const, totalAmount: 600000, remaining: 320000, interestRate: 8.75, monthlyEmi: 12500, updatedAt: new Date().toISOString().split('T')[0] },
          ];
          for (const l of defaultLiabs) {
            await loansService.addLoan(l);
          }
        } else {
          setLiabilities(list);
          financialEvents.emit('LoanUpdated', list);
        }
      });

      // 5. Income listener
      unsubIncome = incomeService.listenToIncome(async (data) => {
        if (!data) {
          const defaultIncome = {
            monthlyIncome: userProfile?.monthlySalary || 75000,
            bonusIncome: 0,
            freelanceIncome: 0,
            rentalIncome: 0,
            investmentIncome: 0,
            otherIncome: 0,
            cityCategory: userProfile?.cityTier === 'METRO' ? 'Metro' : 'Tier2',
            employmentType: 'Private',
            riskProfile: 'Balanced',
            taxRegime: 'New',
            salaryType: 'Salary',
            totalIncome: userProfile?.monthlySalary || 75000,
            frequency: 'Monthly',
            currency: 'INR',
            financialGoals: [],
          };
          await incomeService.updateIncome(defaultIncome);
        } else {
          setIncomeData(data as any);
          financialEvents.emit('IncomeUpdated', data);
        }
      });

      // 6. Budgets listener
      unsubBudgets = budgetService.listenToBudgets((list) => {
        setBudgets(list);
        financialEvents.emit('BudgetChanged', list);
      });
    } catch (err: any) {
      console.warn('FDSL Snapshot listener registration bypassed due to loading session:', err);
      setSyncStatus('ERROR');
      setSyncError(err.message || 'Auth session parsing error');
    }

    return () => {
      unsubExpenses();
      unsubGoals();
      unsubAssets();
      unsubLiabilities();
      unsubIncome();
      unsubBudgets();
    };
  }, [fbUser, userProfile]);

  // FDSL CRUD Mutations
  const updateIncome = async (data: Partial<Income>) => {
    setIncomeData(prev => {
      const merged = prev ? { ...prev, ...data } as any : data as any;
      if (merged) {
        const monthly = Number(merged.monthlyIncome) || 0;
        const bonus = Number(merged.bonusIncome) || 0;
        const freelance = Number(merged.freelanceIncome) || 0;
        const rental = Number(merged.rentalIncome) || 0;
        const investment = Number(merged.investmentIncome) || 0;
        const other = Number(merged.otherIncome) || 0;
        merged.totalIncome = monthly + bonus + freelance + rental + investment + other;
        merged.annualIncome = monthly * 12;
      }
      return merged;
    });
    financialEvents.emit('IncomeUpdated', data);

    if (!fbUser) return;
    try {
      incomeService.updateIncome(data as any).catch(err => {
        console.warn('Firestore write deferred:', err);
      });
    } catch (err) {
      console.warn('Firestore write deferred:', err);
    }
  };

  const setBudget = async (budgetId: string, data: Partial<Budget>) => {
    if (!fbUser) return;
    budgetService.setBudget(budgetId, data).catch(err => console.warn('Firestore budget sync failed:', err));
  };

  const addExpense = async (newExp: Omit<Expense, 'id' | 'userId'>) => {
    if (!fbUser) {
      const localId = `demo-new-${Date.now()}`;
      const fullExp: Expense = {
        id: localId,
        userId: 'demo-user-id',
        title: newExp.title,
        amount: newExp.amount,
        category: newExp.category,
        type: newExp.type,
        date: newExp.date,
        isRecurring: newExp.isRecurring,
        notes: newExp.notes || '',
        paymentMethod: (newExp as any).paymentMethod || 'UPI',
        receiptURL: (newExp as any).receiptURL || null,
      } as any;

      setExpenses(prev => {
        const updated = [fullExp, ...prev];
        localStorage.setItem('localAddedExpenses', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      await expenseApi.createExpense({
        ...newExp,
        userId: fbUser.uid,
      });
    } catch (err) {
      console.warn('Express API backend failed to save expense:', err);
    }

    // Trigger secondary Firestore operations in the background
    expensesService.addExpense(newExp).catch(err => {
      console.warn('Firestore addExpense failed:', err);
    });
    activityService.logActivity('expenseCreated', { title: newExp.title, amount: newExp.amount }).catch(err => {
      console.warn('Activity logging failed:', err);
    });
  };

  const deleteExpense = async (id: string) => {
    if (!fbUser) {
      setExpenses(prev => {
        const updated = prev.filter(e => e.id !== id);
        localStorage.setItem('localAddedExpenses', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      await expenseApi.deleteExpense(id);
    } catch (err) {
      console.warn('Express API backend failed to delete expense:', err);
    }

    // Trigger secondary Firestore operations in the background
    expensesService.deleteExpense(id).catch(err => {
      console.warn('Firestore deleteExpense failed:', err);
    });
    financialEvents.emit('ExpenseDeleted', id);
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    if (!fbUser) return;
    goalsService.addGoal(newGoal).catch(err => console.warn('Firestore goal sync failed:', err));
    activityService.logActivity('goalCreated', { title: newGoal.title, target: newGoal.targetAmount }).catch(err => console.warn('Activity log failed:', err));
    financialEvents.emit('GoalCreated', newGoal);
  };

  const deleteGoal = async (id: string) => {
    goalsService.deleteGoal(id).catch(err => console.warn('Firestore deleteGoal failed:', err));
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    const matched = goals.find(g => g.id === id);
    if (matched) {
      const updatedAmount = matched.currentAmount + amount;
      goalsService.updateGoal(id, {
        currentAmount: updatedAmount,
        isCompleted: updatedAmount >= matched.targetAmount,
      }).catch(err => console.warn('Firestore updateGoalProgress failed:', err));
      if (updatedAmount >= matched.targetAmount) {
        financialEvents.emit('GoalCompleted', matched);
      }
    }
  };

  const addAsset = async (newAst: Omit<Asset, 'id' | 'userId'>) => {
    if (!fbUser) return;
    investmentsService.addInvestment(newAst).catch(err => console.warn('Firestore addInvestment failed:', err));
  };

  const addLiability = async (newLib: Omit<Liability, 'id' | 'userId'>) => {
    if (!fbUser) return;
    loansService.addLoan(newLib).catch(err => console.warn('Firestore addLoan failed:', err));
  };

  // Centralized Computed Values
  const totalMonthlyIncome = useMemo(() => {
    return incomeData?.totalIncome || user.monthlyIncome;
  }, [incomeData, user.monthlyIncome]);

  const totalMonthlyExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const monthlySurplus = useMemo(() => {
    return Math.max(0, totalMonthlyIncome - totalMonthlyExpenses);
  }, [totalMonthlyIncome, totalMonthlyExpenses]);

  const savingsRate = useMemo(() => {
    return totalMonthlyIncome > 0 ? Math.round((monthlySurplus / totalMonthlyIncome) * 100) : 0;
  }, [monthlySurplus, totalMonthlyIncome]);

  const expenseRatio = useMemo(() => {
    return totalMonthlyIncome > 0 ? Math.round((totalMonthlyExpenses / totalMonthlyIncome) * 100) : 0;
  }, [totalMonthlyExpenses, totalMonthlyIncome]);

  const netWorth = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining, 0);
    return totalAssets - totalLiabilities;
  }, [assets, liabilities]);

  const budgetSummary = useMemo(() => {
    return calculate50_30_20(totalMonthlyIncome, user.cityTier);
  }, [totalMonthlyIncome, user.cityTier]);

  const budgetUtilization = useMemo(() => {
    const categories = ['HOUSING', 'FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'SHOPPING', 'INVESTMENT', 'DEBT_EMI', 'OTHERS'];
    const utilizationMap: any = {};
    
    const allocations: Record<string, number> = {
      HOUSING: Math.round(totalMonthlyIncome * 0.25),
      FOOD: Math.round(totalMonthlyIncome * 0.15),
      TRANSPORT: Math.round(totalMonthlyIncome * 0.08),
      UTILITIES: Math.round(totalMonthlyIncome * 0.05),
      ENTERTAINMENT: Math.round(totalMonthlyIncome * 0.10),
      HEALTHCARE: Math.round(totalMonthlyIncome * 0.05),
      SHOPPING: Math.round(totalMonthlyIncome * 0.08),
      INVESTMENT: Math.round(totalMonthlyIncome * 0.20),
      DEBT_EMI: liabilities.reduce((sum, l) => sum + l.monthlyEmi, 0),
      OTHERS: Math.round(totalMonthlyIncome * 0.04)
    };

    categories.forEach(cat => {
      const spent = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      const allocated = allocations[cat] || 1000;
      utilizationMap[cat] = {
        allocated,
        spent,
        utilization: Math.round((spent / allocated) * 100)
      };
    });
    return utilizationMap;
  }, [totalMonthlyIncome, expenses, liabilities]);

  const healthScore = useMemo(() => {
    const totalSavings = expenses.filter(e => e.category === 'INVESTMENT').reduce((acc, curr) => acc + curr.amount, 0) + (totalMonthlyIncome * 0.15);
    const totalDebt = liabilities.reduce((acc, curr) => acc + curr.monthlyEmi, 0);
    const efCover = 4.5;
    return calculateFinancialHealthScore(totalMonthlyIncome, totalSavings, totalDebt, efCover, true);
  }, [totalMonthlyIncome, expenses, liabilities]);

  const taxSummary = useMemo(() => {
    return calculateIndianTax(totalMonthlyIncome);
  }, [totalMonthlyIncome]);

  const aiContext = useMemo(() => {
    return {
      income: {
        monthlyIncome: totalMonthlyIncome,
        breakdown: incomeData || null
      },
      expenses: {
        total: totalMonthlyExpenses,
        ratio: expenseRatio,
        itemsCount: expenses.length,
        categoriesBreakdown: Object.keys(budgetUtilization).reduce((acc: any, cat) => {
          acc[cat] = budgetUtilization[cat].spent;
          return acc;
        }, {})
      },
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        monthlyAllocation: g.monthlyAllocation,
        progress: Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100))
      })),
      balanceSheet: {
        netWorth,
        assetsTotal: assets.reduce((sum, a) => sum + a.value, 0),
        liabilitiesTotal: liabilities.reduce((sum, l) => sum + l.remaining, 0)
      },
      health: {
        score: healthScore.score,
        grade: healthScore.grade,
        rating: healthScore.grade
      }
    };
  }, [totalMonthlyIncome, incomeData, totalMonthlyExpenses, expenseRatio, expenses, goals, netWorth, assets, liabilities, healthScore, budgetUtilization]);

  // Dispatch AI Context update event after render completes
  useEffect(() => {
    financialEvents.emit('AIContextUpdated', aiContext);
  }, [aiContext]);

  return (
    <FinancialContext.Provider
      value={{
        user,
        setUser,
        expenses,
        addExpense,
        deleteExpense,
        goals,
        addGoal,
        deleteGoal,
        updateGoalProgress,
        assets,
        liabilities,
        addAsset,
        addLiability,
        
        // FDSL exports
        incomeData,
        updateIncome,
        budgets,
        setBudget,
        syncStatus,
        syncError,
        monthlySurplus,
        savingsRate,
        expenseRatio,
        budgetUtilization,
        netWorth,
        aiContext,

        healthScore,
        taxSummary,
        budgetSummary,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        activeTab,
        setActiveTab: handleSetActiveTab,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within FinancialProvider');
  return context;
};
