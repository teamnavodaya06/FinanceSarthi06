import { GoalProgress } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

export class GoalProgressService {
  async getProgressForGoal(goalId: string): Promise<GoalProgress | null> {
    const goal = await goalExtendedRepository.findById(goalId);
    if (!goal) return null;

    const remaining = goal.remainingAmount;
    const rate = goal.monthlyContribution;

    // Days remaining estimation
    const monthsRemaining = rate > 0 ? remaining / rate : 999;
    const daysRemaining = Math.ceil(monthsRemaining * 30.4);

    // Compute mock velocities based on monthly allocations
    const monthlyProgress = rate;
    const weeklyProgress = Math.round(rate / 4.3);
    const dailyAverage = Math.round(rate / 30.4);

    return {
      goalId,
      currentAmount: goal.currentAmount,
      remainingAmount: remaining,
      completionPercentage: goal.completionPercentage,
      daysRemaining,
      consistencyScore: 88, // Fallback consistency rating
      velocity: {
        weeklyProgress,
        monthlyProgress,
        dailyAverage
      }
    };
  }
}
export const goalProgressService = new GoalProgressService();
