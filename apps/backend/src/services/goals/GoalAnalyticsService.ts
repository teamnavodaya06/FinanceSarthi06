import { GoalAnalytics } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

export class GoalAnalyticsService {
  async getAnalytics(userId: string): Promise<GoalAnalytics> {
    const goals = await goalExtendedRepository.findAll(userId);

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Completed').length;
    
    let totalPct = 0;
    let monthlyContribution = 0;
    const distMap: Record<string, number> = {};

    goals.forEach(g => {
      totalPct += g.completionPercentage;
      monthlyContribution += g.monthlyContribution;
      distMap[g.goalType] = (distMap[g.goalType] || 0) + 1;
    });

    const averageCompletionRate = totalGoals > 0 ? Math.round(totalPct / totalGoals) : 0;
    const distribution = Object.entries(distMap).map(([category, count]) => ({
      category,
      count
    }));

    return {
      totalGoals,
      completedGoals,
      averageCompletionRate,
      monthlyContribution,
      distribution
    };
  }
}
export const goalAnalyticsService = new GoalAnalyticsService();
