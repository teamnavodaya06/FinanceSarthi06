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
import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

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

  const [activeTab, setActiveTab] = useState<string>('dashboard');
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
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', userId));
    const unsubExpenses = onSnapshot(qExpenses, async (snap) => {
      const list: Expense[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Expense);
      });

      // Seed default values if brand new user profile to provide an initial visualization
      if (list.length === 0 && snap.metadata.fromCache === false) {
        const defaultExps = [
          { userId, title: 'House Rent & Utilities', amount: 18000, category: 'HOUSING', type: 'EXPENSE', isRecurring: true, date: new Date().toISOString().split('T')[0] },
          { userId, title: 'Swiggy & Groceries', amount: 8400, category: 'FOOD', type: 'EXPENSE', isRecurring: false, date: new Date().toISOString().split('T')[0] },
          { userId, title: 'Electricity & Wi-Fi', amount: 3200, category: 'UTILITIES', type: 'EXPENSE', isRecurring: true, date: new Date().toISOString().split('T')[0] },
          { userId, title: 'Netflix & Spotify', amount: 999, category: 'ENTERTAINMENT', type: 'EXPENSE', isRecurring: true, date: new Date().toISOString().split('T')[0] },
          { userId, title: 'Car EMI', amount: 12500, category: 'DEBT_EMI', type: 'EXPENSE', isRecurring: true, date: new Date().toISOString().split('T')[0] },
          { userId, title: 'SIP Index Investment', amount: 15000, category: 'INVESTMENT', type: 'EXPENSE', isRecurring: true, date: new Date().toISOString().split('T')[0] },
        ];
        for (const e of defaultExps) {
          await addDoc(collection(db, 'expenses'), e);
        }
      } else {
        setExpenses(list);
      }
    });

    // 2. Goals listener
    const qGoals = query(collection(db, 'goals'), where('userId', '==', userId));
    const unsubGoals = onSnapshot(qGoals, async (snap) => {
      const list: Goal[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Goal);
      });

      if (list.length === 0 && snap.metadata.fromCache === false) {
        const defaultGoals = [
          { userId, title: '6-Month Emergency Safety Fund', category: 'EMERGENCY_FUND', targetAmount: 300000, currentAmount: 180000, targetDate: '2026-12-31', monthlyAllocation: 20000, isCompleted: false },
          { userId, title: 'Electric SUV Down Payment', category: 'VEHICLE', targetAmount: 500000, currentAmount: 220000, targetDate: '2027-06-30', monthlyAllocation: 15000, isCompleted: false },
          { userId, title: 'House Property Fund', category: 'HOUSE', targetAmount: 2500000, currentAmount: 450000, targetDate: '2030-12-31', monthlyAllocation: 25000, isCompleted: false },
        ];
        for (const g of defaultGoals) {
          await addDoc(collection(db, 'goals'), g);
        }
      } else {
        setGoals(list);
      }
    });

    // 3. Assets listener
    const qAssets = query(collection(db, 'assets'), where('userId', '==', userId));
    const unsubAssets = onSnapshot(qAssets, async (snap) => {
      const list: Asset[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Asset);
      });

      if (list.length === 0 && snap.metadata.fromCache === false) {
        const defaultAssets = [
          { userId, name: 'HDFC Savings Account', category: 'Bank', value: 145000, updatedAt: new Date().toISOString().split('T')[0] },
          { userId, name: 'Zerodha Mutual Fund Portfolio', category: 'Mutual Funds', value: 380000, updatedAt: new Date().toISOString().split('T')[0] },
          { userId, name: 'EPF & VPF Balance', category: 'PF/NPS', value: 290000, updatedAt: new Date().toISOString().split('T')[0] },
          { userId, name: 'Sovereign Gold Bonds', category: 'Gold', value: 85000, updatedAt: new Date().toISOString().split('T')[0] },
        ];
        for (const a of defaultAssets) {
          await addDoc(collection(db, 'assets'), a);
        }
      } else {
        setAssets(list);
      }
    });

    // 4. Liabilities listener
    const qLiabilities = query(collection(db, 'liabilities'), where('userId', '==', userId));
    const unsubLiabilities = onSnapshot(qLiabilities, async (snap) => {
      const list: Liability[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Liability);
      });

      if (list.length === 0 && snap.metadata.fromCache === false) {
        const defaultLiabs = [
          { userId, name: 'HDFC Car Loan', category: 'Car Loan', totalAmount: 600000, remaining: 320000, interestRate: 8.75, monthlyEmi: 12500, updatedAt: new Date().toISOString().split('T')[0] },
        ];
        for (const l of defaultLiabs) {
          await addDoc(collection(db, 'liabilities'), l);
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
    await addDoc(collection(db, 'expenses'), {
      ...newExp,
      userId: fbUser.uid,
    });
  };

  const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await addDoc(collection(db, 'goals'), {
      ...newGoal,
      userId: fbUser.uid,
    });
  };

  const deleteGoal = async (id: string) => {
    await deleteDoc(doc(db, 'goals', id));
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    const goalRef = doc(db, 'goals', id);
    const matched = goals.find(g => g.id === id);
    if (matched) {
      const updatedAmount = matched.currentAmount + amount;
      await updateDoc(goalRef, {
        currentAmount: updatedAmount,
        isCompleted: updatedAmount >= matched.targetAmount,
      });
    }
  };

  const addAsset = async (newAst: Omit<Asset, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await addDoc(collection(db, 'assets'), {
      ...newAst,
      userId: fbUser.uid,
    });
  };

  const addLiability = async (newLib: Omit<Liability, 'id' | 'userId'>) => {
    if (!fbUser) return;
    await addDoc(collection(db, 'liabilities'), {
      ...newLib,
      userId: fbUser.uid,
    });
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
        setActiveTab,
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
