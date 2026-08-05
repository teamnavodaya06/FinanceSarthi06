export type GoalStatus = 'Not Started' | 'In Progress' | 'Ahead of Schedule' | 'On Track' | 'Behind Schedule' | 'Completed' | 'Archived' | 'Cancelled';
export type GoalPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Goal {
  // Backwards compatibility keys
  id: string;
  title: string;
  category: string;
  monthlyAllocation: number;
  isCompleted: boolean;
  predictedCompletionDate?: string;

  // Premium Intelligence keys
  goalId: string;
  userId: string;
  goalName: string;
  goalType: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  monthlyContribution: number;
  targetDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  estimatedCompletionDate: string;
  completionPercentage: number;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  type: 'MANUAL' | 'AUTOMATIC';
  date: string;
}

export interface GoalForecast {
  expectedCompletionDate: string;
  probability: number;
  monthlyContributionRequired: number;
}

export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  averageCompletionRate: number;
  monthlyContribution: number;
  distribution: { category: string; count: number }[];
}
