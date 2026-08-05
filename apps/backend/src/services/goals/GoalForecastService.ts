import { Goal, GoalForecast } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

export class GoalForecastService {
  async getForecastForGoal(goalId: string): Promise<GoalForecast | null> {
    const goal = await goalExtendedRepository.findById(goalId);
    if (!goal) return null;

    const remaining = goal.remainingAmount;
    const rate = goal.monthlyContribution;

    // Default probability estimation based on remaining months
    const monthsRequired = rate > 0 ? remaining / rate : 999;
    let probability = 85;
    if (monthsRequired > 48) {
      probability = 45;
    } else if (monthsRequired > 24) {
      probability = 65;
    }

    const expectedDate = new Date();
    expectedDate.setMonth(expectedDate.getMonth() + Math.ceil(monthsRequired));

    return {
      expectedCompletionDate: expectedDate.toISOString().split('T')[0],
      probability,
      monthlyContributionRequired: Math.round(remaining / Math.max(1, monthsRequired))
    };
  }

  // Double contribution scenario analysis
  async simulateDoubleContribution(goalId: string): Promise<{
    originalCompletionDate: string;
    simulatedCompletionDate: string;
    timelineImprovementMonths: number;
  } | null> {
    const goal = await goalExtendedRepository.findById(goalId);
    if (!goal) return null;

    const remaining = goal.remainingAmount;
    const originalRate = goal.monthlyContribution;
    const doubleRate = originalRate * 2;

    const originalMonths = originalRate > 0 ? remaining / originalRate : 999;
    const simulatedMonths = doubleRate > 0 ? remaining / doubleRate : 999;

    const timelineImprovementMonths = Math.max(0, Math.ceil(originalMonths - simulatedMonths));

    const simDate = new Date();
    simDate.setMonth(simDate.getMonth() + Math.ceil(simulatedMonths));

    return {
      originalCompletionDate: goal.estimatedCompletionDate,
      simulatedCompletionDate: simDate.toISOString().split('T')[0],
      timelineImprovementMonths
    };
  }
}
export const goalForecastService = new GoalForecastService();
