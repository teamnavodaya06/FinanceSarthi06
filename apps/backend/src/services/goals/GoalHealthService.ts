import { GoalHealth } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

export class GoalHealthService {
  async getHealthForGoal(goalId: string): Promise<GoalHealth | null> {
    const goal = await goalExtendedRepository.findById(goalId);
    if (!goal) return null;

    // Consistency score starts at 90. Reduces if rate is low
    let consistency = 90;
    if (goal.monthlyContribution < 2000) {
      consistency = 60;
    } else if (goal.monthlyContribution < 5000) {
      consistency = 75;
    }

    // Health score weighted calculations
    const progressWt = goal.completionPercentage * 0.4;
    const consistencyWt = consistency * 0.4;
    const timelineWt = (goal.status === 'Ahead of Schedule' ? 100 : goal.status === 'Behind Schedule' ? 50 : 80) * 0.2;

    const score = Math.min(100, Math.round(progressWt + consistencyWt + timelineWt));

    let rating: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical' = 'Average';
    if (score >= 85) {
      rating = 'Excellent';
    } else if (score >= 70) {
      rating = 'Good';
    } else if (score >= 50) {
      rating = 'Average';
    } else if (score >= 30) {
      rating = 'Poor';
    } else {
      rating = 'Critical';
    }

    return {
      score,
      rating,
      consistency
    };
  }
}
export const goalHealthService = new GoalHealthService();
