import { 
  Budget, 
  Expense, 
  Goal, 
  Income, 
  Asset, 
  Liability, 
  BudgetPrediction, 
  BudgetRecommendation, 
  AdaptiveBudgetHealth 
} from './index';

export interface DashboardSummary {
  monthlyIncome: number;
  annualIncome: number;
  monthlyExpenses: number;
  remainingCash: number;
  savings: number;
  savingsRate: number;
  budgetRemaining: number;
  financialHealthScore: number;
  netWorth: number;
  cashAvailable: number;
  currentMonth: number;
  currentYear: number;
}

export interface DashboardCharts {
  incomeVsExpenses: { name: string; income: number; expenses: number }[];
  cashFlow: { month: string; inflow: number; outflow: number }[];
  categoryDistribution: { category: string; value: number; color: string }[];
  budgetUtilization: { category: string; limit: number; spent: number }[];
  monthlySpendingTrend: { date: string; amount: number }[];
  netWorthGrowth: { year: number; value: number }[];
  investmentAllocation: { type: string; value: number }[];
  savingsTrend: { month: string; amount: number }[];
}

export interface DashboardGoalInfo {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  estimatedCompletionDate: string;
}

export interface DashboardInvestmentInfo {
  category: string;
  name: string;
  value: number;
}

export interface DashboardLiabilityInfo {
  name: string;
  category: string;
  totalAmount: number;
  remaining: number;
  monthlyEmi: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  income: {
    monthlyIncome: number;
    annualIncome: number;
    trend: string;
    sources: string[];
  };
  expenses: {
    todaySpending: number;
    monthlySpending: number;
    averageDaily: number;
    topMerchants: string[];
    largestExpense: number;
  };
  budget: {
    monthlyBudget: number;
    remainingBudget: number;
    utilization: number;
    status: string;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    savings: number;
    remainingCash: number;
  };
  goals: DashboardGoalInfo[];
  investments: {
    totalInvestment: number;
    monthlyContribution: number;
    allocations: DashboardInvestmentInfo[];
  };
  netWorth: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
  financialHealth: AdaptiveBudgetHealth;
  recommendations: BudgetRecommendation[];
  notifications: string[];
  charts: DashboardCharts;
  monthlyStory: {
    summary: string;
    achievements: string[];
    warnings: string[];
    opportunities: string[];
  };
  quickActions: string[];
  upcomingBills: { name: string; amount: number; dueDate: string }[];
  subscriptions: { name: string; amount: number; renewalDate: string }[];
  recentTransactions: Expense[];
}
