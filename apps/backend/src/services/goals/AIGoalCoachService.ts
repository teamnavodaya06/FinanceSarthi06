import { GoalCoachRecommendation } from '@financesarthi/types';
import { goalExtendedRepository } from '../../repositories/goal-extended.repository';

// Memory db for active recommendations
const activeRecommendationsDb: GoalCoachRecommendation[] = [];

export class AIGoalCoachService {
  async getRecommendations(userId: string): Promise<GoalCoachRecommendation[]> {
    if (activeRecommendationsDb.length > 0) {
      return activeRecommendationsDb.filter(r => r.status === 'PENDING');
    }

    const goals = await goalExtendedRepository.findAll(userId);
    
    // Compile mock recommendations based on active goal profiles
    goals.forEach(g => {
      if (g.goalType === 'EMERGENCY_FUND') {
        activeRecommendationsDb.push({
          id: 'rec-coach-emergency',
          goalId: g.goalId,
          title: 'Boost Emergency Buffer Allocation',
          summary: 'Increase monthly contribution rate to complete your 6-month buffer fund faster.',
          currentSituation: `Currently contributing ₹${g.monthlyContribution.toLocaleString('en-IN')}/month. Fund is 75% complete.`,
          recommendedAction: `Increment monthly contribution allocation by ₹3,500.`,
          financialImpact: 3500,
          timelineImpactMonths: 4,
          confidenceScore: 92,
          reasoning: 'Reallocating unused Swiggy & Zomato budgets rebalances surplus savings directly towards safety cash.',
          status: 'PENDING'
        });
      } else if (g.goalType === 'CAR_PURCHASE') {
        activeRecommendationsDb.push({
          id: 'rec-coach-car',
          goalId: g.goalId,
          title: 'Accelerate SUV Milestone timeline',
          summary: 'Apply savings from recent subscription cancellations towards your Electric SUV purchase.',
          currentSituation: `Currently contributing ₹${g.monthlyContribution.toLocaleString('en-IN')}/month. Fund is 44% complete.`,
          recommendedAction: `Redirect ₹5,000 monthly surplus budget to vehicle fund.`,
          financialImpact: 5000,
          timelineImpactMonths: 8,
          confidenceScore: 88,
          reasoning: 'Allows reaching target date 8 months earlier without lowering your savings rate consistency.',
          status: 'PENDING'
        });
      }
    });

    return activeRecommendationsDb.filter(r => r.status === 'PENDING');
  }

  async executeAction(recommendationId: string, action: 'APPROVE' | 'DISMISS'): Promise<boolean> {
    const idx = activeRecommendationsDb.findIndex(r => r.id === recommendationId);
    if (idx === -1) return false;

    if (action === 'APPROVE') {
      activeRecommendationsDb[idx].status = 'APPROVED';
      const rec = activeRecommendationsDb[idx];

      // Automatically increment goal allocation
      const goal = await goalExtendedRepository.findById(rec.goalId);
      if (goal) {
        await goalExtendedRepository.update(rec.goalId, {
          monthlyContribution: goal.monthlyContribution + rec.financialImpact
        });
      }
    } else {
      activeRecommendationsDb[idx].status = 'DISMISSED';
    }

    return true;
  }
}
export const aiGoalCoachService = new AIGoalCoachService();
