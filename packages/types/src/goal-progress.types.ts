export interface GoalVelocity {
  weeklyProgress: number;
  monthlyProgress: number;
  dailyAverage: number;
}

export interface GoalProgress {
  goalId: string;
  currentAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  daysRemaining: number;
  consistencyScore: number;
  velocity: GoalVelocity;
}

export interface GoalHealth {
  score: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
  consistency: number;
}

export interface GoalMilestone {
  percentage: number;
  achieved: boolean;
  achievedAt?: string;
  message: string;
}
