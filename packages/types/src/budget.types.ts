export type BudgetStatus = 'SAFE' | 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
export type BudgetStrategy = 'MANUAL' | 'AUTO_50_30_20' | 'AI_RECOMMENDED';

export interface CategoryBudget {
  categoryId: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  currency: string;
  totalBudget: number;
  remainingBudget: number;
  spentAmount: number;
  budgetUtilizationPercentage: number;
  status: BudgetStatus;
  budgetStrategy: BudgetStrategy;
  carryForwardUnusedBudget: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  categoryBudgets: Record<string, CategoryBudget>;
}

export interface BudgetPrediction {
  projectedSpending: number;
  projectedRemaining: number;
  projectedSavings: number;
  overspendingProbability: number;
  burnRate: number; // Daily average spend
  dailyAverage: number;
}

export interface BudgetRecommendation {
  id: string;
  summary: string;
  reason: string;
  financialImpact: number;
  suggestedAction: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0 to 1
}

export interface BudgetHistory {
  month: number;
  year: number;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  savings: number;
  improvementPercentage?: number;
}

export interface BudgetAnalytics {
  utilizationRate: number;
  accuracy: number;
  savingsRate: number;
  overspendingFrequency: number;
  bestPerformingCategories: string[];
  worstPerformingCategories: string[];
}
