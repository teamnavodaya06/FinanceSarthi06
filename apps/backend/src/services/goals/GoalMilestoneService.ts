import { GoalMilestone } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

export class GoalMilestoneService {
  async getMilestonesForGoal(goalId: string): Promise<GoalMilestone[]> {
    const goal = await goalExtendedRepository.findById(goalId);
    if (!goal) return [];

    const thresholds = [10, 25, 50, 75, 90, 100];
    const currentPct = goal.completionPercentage;

    return thresholds.map(pct => {
      const achieved = currentPct >= pct;
      let message = `Accumulated ${pct}% of total milestone funds.`;
      if (pct === 10) {
        message = 'Kickoff: Starting your savings journey! 🚀';
      } else if (pct === 50) {
        message = 'Halfway there! Keep going. 🎯';
      } else if (pct === 100) {
        message = 'Goal fully funded! You did it! 🎉';
      }

      return {
        percentage: pct,
        achieved,
        achievedAt: achieved ? new Date(goal.targetDate).toISOString().split('T')[0] : undefined,
        message
      };
    });
  }
}
export const goalMilestoneService = new GoalMilestoneService();
