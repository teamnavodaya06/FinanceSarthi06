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
} from '../services/firestore';

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
    cityTier: userProfile?.cityTier === 'METRO' ? 'TIER_1' : userProfile?.cityTier === 'VILLAGE' ? 'TIER_3' : (userProfile?.cityTier as any) || 'TIER_2',
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  // Sync user state whenever userProfile or fbUser changes
  useEffect(() => {
    if (userProfile || fbUser) {
      setUser({
        id: fbUser?.uid || userProfile?.uid || 'usr-default',
        email: userProfile?.email || fbUser?.email || '',
        name: userProfile?.displayName || fbUser?.displayName || 'FinanceSarthi User',
        role: 'USER',
        cityTier: userProfile?.cityTier === 'METRO' ? 'TIER_1' : userProfile?.cityTier === 'VILLAGE' ? 'TIER_3' : (userProfile?.cityTier as any) || 'TIER_2',
        monthlyIncome: userProfile?.monthlySalary || 75000,
        avatarUrl: userProfile?.photoURL || fbUser?.photoURL || undefined,
        createdAt: userProfile?.createdAt || new Date().toISOString(),
      });
    }
  }, [userProfile, fbUser]);

  // Real-Time Snapshot Listeners for current user's documents
  useEffect(() => {
    if (!fbUser) {
      setExpenses([]);
      setGoals([]);
      setAssets([]);
      setLiabilities([]);
      return;
    }

    const userId = fbUser.uid;

    // 1. Expenses listener
    const unsubExpenses = expensesService.listenToExpenses(async (list) => {
      // Seed default values if brand new user profile to provide an initial visualization
      if (list.length === 0) {
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
      }
    });

    // 2. Goals listener
    const unsubGoals = goalsService.listenToGoals(async (list) => {
      if (list.length === 0) {
        const defaultGoals = [
          { title: '6-Month Emergency Safety Fund', category: 'EMERGENCY_FUND' as const, targetAmount: 300005, currentAmount: 180000, targetDate: '2026-12-31', monthlyAllocation: 20000, isCompleted: false },
          { title: 'Electric SUV Down Payment', category: 'VEHICLE' as const, targetAmount: 500005, currentAmount: 220000, targetDate: '2027-06-30', monthlyAllocation: 15000, isCompleted: false },
          { title: 'House Property Fund', category: 'HOUSE' as const, targetAmount: 2500005, currentAmount: 450000, targetDate: '2030-12-31', monthlyAllocation: 25000, isCompleted: false },
        ];
        for (const g of defaultGoals) {
          await goalsService.addGoal(g);
        }
      } else {
        setGoals(list);
      }
    });

    // 3. Investments/Assets listener
    const unsubAssets = investmentsService.listenToInvestments(async (list) => {
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
      }
    });

    // 4. Loans/Liabilities listener
    const unsubLiabilities = loansService.listenToLoans(async (list) => {
      if (list.length === 0) {
        const defaultLiabs = [
          { name: 'HDFC Car Loan', category: 'Car Loan' as const, totalAmount: 600000, remaining: 320000, interestRate: 8.75, monthlyEmi: 12500, updatedAt: new Date().toISOString().split('T')[0] },
        ];
        for (const l of defaultLiabs) {
          await loansService.addLoan(l);
        }
      } else {
        setLiabilities(list);
      }
    });

    return () => {
      unsubExpenses();
      unsubGoals();
      unsubAssets();
      unsubLiabilities();
    };
  }, [fbUser]);

  // Live calculations memoized based on real database records
  const taxSummary = useMemo(() => {
    return calculateIndianTax(user.monthlyIncome);
  }, [user.monthlyIncome]);

  const budgetSummary = useMemo(() => {
    return calculate50_30_20(user.monthlyIncome, user.cityTier);
  }, [user.monthlyIncome, user.cityTier]);

  const healthScore = useMemo(() => {
    const totalSavings = expenses.filter(e => e.category === 'INVESTMENT').reduce((acc, curr) => acc + curr.amount, 0) + (user.monthlyIncome * 0.15);
    const totalDebt = liabilities.reduce((acc, curr) => acc + curr.monthlyEmi, 0);
    const efCover = 4.5;
    return calculateFinancialHealthScore(user.monthlyIncome, totalSavings, totalDebt, efCover, true);
  }, [user.monthlyIncome, expenses, liabilities]);

  // Database CRUD Actions (real-time propagation)
  const addExpense = async (newExp: Omit<Expense, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await expensesService.addExpense(newExp);
    await activityService.logActivity('expenseCreated', { title: newExp.title, amount: newExp.amount });
  };

  const deleteExpense = async (id: string) => {
    await expensesService.deleteExpense(id);
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await goalsService.addGoal(newGoal);
    await activityService.logActivity('goalCreated', { title: newGoal.title, target: newGoal.targetAmount });
  };

  const deleteGoal = async (id: string) => {
    await goalsService.deleteGoal(id);
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    const matched = goals.find(g => g.id === id);
    if (matched) {
      const updatedAmount = matched.currentAmount + amount;
      await goalsService.updateGoal(id, {
        currentAmount: updatedAmount,
        isCompleted: updatedAmount >= matched.targetAmount,
      });
    }
  };

  const addAsset = async (newAst: Omit<Asset, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await investmentsService.addInvestment(newAst);
  };

  const addLiability = async (newLib: Omit<Liability, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await loansService.addLoan(newLib);
  };

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
