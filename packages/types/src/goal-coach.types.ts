export interface GoalCoachRecommendation {
  id: string;
  goalId: string;
  title: string;
  summary: string;
  currentSituation: string;
  recommendedAction: string;
  financialImpact: number;
  timelineImpactMonths: number;
  confidenceScore: number;
  reasoning: string;
  status: 'PENDING' | 'APPROVED' | 'DISMISSED';
}
