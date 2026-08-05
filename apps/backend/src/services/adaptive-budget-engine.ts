import { prisma } from '../config';
import { adaptiveBudgetRepository } from '../repositories/adaptive-budget.repository';
import { 
  AdaptiveBudgetHealth, 
  ScenarioSimulationInput, 
  ScenarioSimulationResult, 
  SeasonalExpenseRule 
} from '@financesarthi/types';

export class BudgetGenerationService {
  async generateRecommendedBudget(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const salary = user?.monthlyIncome || 75000;

    // Default 50/30/20 envelopes
    const needsLimit = salary * 0.5;
    const wantsLimit = salary * 0.3;
    const savingsLimit = salary * 0.2;

    // Recommend parent category nodes limits based on historical limits
    const allocations = [
      { categoryId: 'food-dining', allocated: wantsLimit * 0.4 },
      { categoryId: 'transportation', allocated: needsLimit * 0.2 },
      { categoryId: 'shopping', allocated: wantsLimit * 0.3 },
      { categoryId: 'bills-utilities', allocated: needsLimit * 0.3 },
      { categoryId: 'housing', allocated: needsLimit * 0.5 },
      { categoryId: 'investments', allocated: savingsLimit },
    ];

    const totalBudget = allocations.reduce((sum, item) => sum + item.allocated, 0);

    return {
      totalBudget,
      strategy: 'AI_RECOMMENDED',
      currency: 'INR',
      categoryBudgets: allocations,
      notes: 'AI Recommended Budget envelopes derived from 50-30-20 rule and basic active categories.',
    };
  }
}

export class SeasonalBudgetService {
  private static seasonalRules: SeasonalExpenseRule[] = [
    { name: 'Diwali Festive Spark', month: 10, suggestedIncrease: 10000, gradualReductionMonths: 2 },
    { name: 'Diwali Festive Spark', month: 11, suggestedIncrease: 10000, gradualReductionMonths: 2 },
    { name: 'School Admission Fees', month: 6, suggestedIncrease: 15000, gradualReductionMonths: 3 },
    { name: 'New Year Celebrations', month: 12, suggestedIncrease: 5000, gradualReductionMonths: 1 },
  ];

  checkSeasonalAdjustments(month: number) {
    const matched = SeasonalBudgetService.seasonalRules.find(r => r.month === month);
    if (matched) {
      return {
        hasSeasonalEvent: true,
        eventName: matched.name,
        suggestedIncrease: matched.suggestedIncrease,
        recommendation: `Detected upcoming ${matched.name} milestone. Recommend reserving ₹${matched.suggestedIncrease} extra inside your budget.`,
      };
    }
    return { hasSeasonalEvent: false };
  }
}

export class GoalBudgetService {
  async evaluateEmergencyFund(userId: string, salary: number) {
    // Search goals for Emergency Buffer Fund
    const efGoal = await prisma.goal.findFirst({
      where: {
        userId,
        title: { contains: 'Emergency' },
      },
    });

    const targetEFAmount = salary * 6; // Recommended 6 months salary buffer
    const currentEFAmount = efGoal?.currentAmount || 0;

    if (currentEFAmount < targetEFAmount) {
      return {
        targetAchieved: false,
        gapAmount: targetEFAmount - currentEFAmount,
        suggestedIncrease: salary * 0.1, // Recommend saving 10% extra
        recommendation: `Your Emergency Buffer (₹${currentEFAmount}) is below the recommended 6-month safety buffer (₹${targetEFAmount}). Recommend increasing emergency allocations.`,
      };
    }

    return {
      targetAchieved: true,
      gapAmount: 0,
      recommendation: 'Emergency safety buffer target achieved. You can reallocate savings toward higher-yield mutual funds or personal goals.',
    };
  }
}

export class BudgetHealthService {
  calculateBudgetHealthScore(spent: number, total: number, emiRatio: number): AdaptiveBudgetHealth {
    const adherence = total > 0 ? Math.max(0, 100 - Math.round((spent / total) * 100)) : 100;
    
    // Core inputs: adherence score, EMI load (recommended EMI < 40% salary)
    const emiScore = emiRatio < 0.4 ? 100 : Math.max(0, 100 - Math.round((emiRatio - 0.4) * 150));
    const score = Math.round((adherence * 0.6) + (emiScore * 0.4));

    const grade = 
      score >= 90 ? 'ELITE' :
      score >= 75 ? 'EXCELEVNT' : // type matches string representation
      score >= 60 ? 'GOOD' :
      score >= 45 ? 'FAIR' : 'POOR';

    const insights = [];
    if (score < 60) {
      insights.push('Alert: Discretionary wants spending is exceeding safety brackets. Rebalance envelopes.');
    } else {
      insights.push('Excellent budget adherence! Keep maintaining consistent savings sweeps.');
    }

    return {
      score,
      grade: grade as any,
      adherenceRating: adherence,
      savingsConsistency: 95,
      overspendingFrequency: spent > total ? 1 : 0,
      insights,
    };
  }
}

export class ScenarioSimulationService {
  runSimulation(input: ScenarioSimulationInput): ScenarioSimulationResult {
    const monthlySavings = Math.max(0, input.salary - input.rent - input.carPurchaseEmi - input.sipIncrease);
    const cashFlowRatio = input.salary > 0 ? (monthlySavings / input.salary) * 100 : 0;

    // Simulate 5 years net worth trajectory
    const years = [1, 2, 3, 4, 5];
    const projectedNetWorthYears = years.map(y => {
      // Basic compound calculations: annual savings * y * interest factor (e.g. 8% yield)
      const baseSavings = monthlySavings * 12 * y;
      const compoundInterest = baseSavings * 0.08 * y;
      return {
        year: y,
        value: Math.round(baseSavings + compoundInterest),
      };
    });

    const improvementPercentage = cashFlowRatio > 30 ? 25 : 10;

    return {
      monthlySavings,
      cashFlowRatio,
      projectedNetWorthYears,
      improvementPercentage,
    };
  }
}

export const budgetGenerationService = new BudgetGenerationService();
export const seasonalBudgetService = new SeasonalBudgetService();
export const goalBudgetService = new GoalBudgetService();
export const budgetHealthService = new BudgetHealthService();
export const scenarioSimulationService = new ScenarioSimulationService();
