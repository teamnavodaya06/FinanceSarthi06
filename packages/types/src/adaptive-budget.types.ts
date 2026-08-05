export type AIBudgetAction = 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'DISMISSED';

export interface AIBudgetDecision {
  id: string;
  userId: string;
  recommendationId: string;
  action: AIBudgetAction;
  categoryOverrides: Record<string, number>;
  createdAt: string;
}

export interface AIBudgetAuditLog {
  id: string;
  userId: string;
  decisionId: string;
  type: string;
  previousState: any;
  newState: any;
  financialImpact: number;
  createdAt: string;
}

export interface ScenarioSimulationInput {
  salary: number;
  rent: number;
  carPurchaseEmi: number;
  sipIncrease: number;
}

export interface ScenarioSimulationResult {
  monthlySavings: number;
  cashFlowRatio: number;
  projectedNetWorthYears: { year: number; value: number }[];
  improvementPercentage: number;
}

export interface SeasonalExpenseRule {
  name: string;
  month: number;
  suggestedIncrease: number;
  gradualReductionMonths: number;
}

export interface AdaptiveBudgetHealth {
  score: number;
  grade: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT' | 'ELITE';
  adherenceRating: number;
  savingsConsistency: number;
  overspendingFrequency: number;
  insights: string[];
}
