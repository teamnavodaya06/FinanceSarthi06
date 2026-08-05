import { budgetRepository } from '../repositories/budget.repository';
import { prisma } from '../config';
import { BudgetStatus, BudgetStrategy } from '@financesarthi/types';

export class BudgetCalculationService {
  getStatusForPercentage(pct: number): BudgetStatus {
    if (pct <= 50) return 'SAFE';
    if (pct <= 75) return 'HEALTHY';
    if (pct <= 90) return 'WARNING';
    if (pct <= 100) return 'CRITICAL';
    return 'EXCEEDED';
  }

  calculateMetrics(total: number, spent: number) {
    const remaining = Math.max(0, total - spent);
    const pct = total > 0 ? (spent / total) * 100 : 0;
    const status = this.getStatusForPercentage(pct);
    return { remaining, percentage: pct, status };
  }
}

export class BudgetPredictionService {
  getPredictions(spent: number, total: number, month: number, year: number) {
    const now = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    // Use current day of the active month, default to mid-month if querying future/past months
    const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;
    const currentDay = isCurrentMonth ? now.getDate() : Math.round(daysInMonth / 2);

    const dailyAverage = currentDay > 0 ? spent / currentDay : 0;
    const projectedSpending = dailyAverage * daysInMonth;
    const projectedRemaining = Math.max(0, total - projectedSpending);
    const projectedSavings = Math.max(0, total - projectedSpending);
    const overspendingProbability = total > 0 ? Math.min(100, Math.round((projectedSpending / total) * 100)) : 0;

    return {
      projectedSpending,
      projectedRemaining,
      projectedSavings,
      overspendingProbability,
      burnRate: dailyAverage,
      dailyAverage,
    };
  }
}

export class BudgetRecommendationService {
  generateRecommendations(spent: number, total: number, categoryBudgets: any[]) {
    const recommendations: any[] = [];

    // Check overall budget
    if (spent > total) {
      recommendations.push({
        id: 'rec-overall-exceeded',
        summary: 'Overall monthly budget exceeded',
        reason: `Your spent amount of ₹${spent.toLocaleString('en-IN')} exceeds your limit of ₹${total.toLocaleString('en-IN')}.`,
        financialImpact: spent - total,
        suggestedAction: 'Consider adjusting category budgets or postponing non-essential purchases.',
        priority: 'HIGH',
        confidence: 0.95,
      });
    }

    // Check category budgets
    for (const cb of categoryBudgets) {
      if (cb.spent > cb.allocated) {
        recommendations.push({
          id: `rec-cat-${cb.categoryId}`,
          summary: `${cb.categoryId} budget overrun`,
          reason: `Spending in ${cb.categoryId} has exceeded your allocated ₹${cb.allocated} budget by ₹${cb.spent - cb.allocated}.`,
          financialImpact: cb.spent - cb.allocated,
          suggestedAction: `Reduce discretionary shopping to offset ${cb.categoryId} overruns.`,
          priority: 'MEDIUM',
          confidence: 0.85,
        });
      }
    }

    return recommendations;
  }
}

export class BudgetService {
  async getOrCreateCurrentBudget(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget = await budgetRepository.findCurrentBudget(userId, month, year);
    if (!budget) {
      // Auto create budget matching user's monthly income
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const monthlyIncome = user?.monthlyIncome || 50000;

      // Recommended 50-30-20 default categories limits:
      // Food (10k), Transport (5k), Bills (10k), Shopping (5k), Housing (15k)
      const defaultCategoriesAlloc = [
        { categoryId: 'food-dining', allocated: monthlyIncome * 0.2 },
        { categoryId: 'transportation', allocated: monthlyIncome * 0.1 },
        { categoryId: 'shopping', allocated: monthlyIncome * 0.15 },
        { categoryId: 'bills-utilities', allocated: monthlyIncome * 0.15 },
        { categoryId: 'housing', allocated: monthlyIncome * 0.3 },
      ];

      const totalBudget = defaultCategoriesAlloc.reduce((sum, c) => sum + c.allocated, 0);

      budget = await budgetRepository.create({
        userId,
        month,
        year,
        currency: 'INR',
        totalBudget,
        remainingBudget: totalBudget,
        spentAmount: 0,
        utilizationPercentage: 0,
        status: 'SAFE',
        strategy: 'AUTO_50_30_20',
        carryForward: false,
        categoryBudgets: defaultCategoriesAlloc.map(c => ({
          categoryId: c.categoryId,
          allocated: c.allocated,
          spent: 0,
          remaining: c.allocated,
          percentage: 0,
          status: 'SAFE',
        })),
      });
    }

    return budget;
  }

  async syncBudgetWithExpenses(userId: string, month: number, year: number) {
    const budget = await budgetRepository.findCurrentBudget(userId, month, year);
    if (!budget) return;

    // Retrieve all active expenses logged this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        isDeleted: false,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Reset and calculate spends
    let totalSpent = 0;
    const catSpends: Record<string, number> = {};

    for (const exp of expenses) {
      totalSpent += exp.amount;
      const cat = exp.category;
      catSpends[cat] = (catSpends[cat] || 0) + exp.amount;
    }

    const updatedCategories = budget.categoryBudgets.map((cb: any) => {
      const spent = catSpends[cb.categoryId] || 0;
      const metrics = budgetCalculationService.calculateMetrics(cb.allocated, spent);
      return {
        categoryId: cb.categoryId,
        allocated: cb.allocated,
        spent,
        remaining: metrics.remaining,
        percentage: metrics.percentage,
        status: metrics.status,
      };
    });

    const overallMetrics = budgetCalculationService.calculateMetrics(budget.totalBudget, totalSpent);

    return budgetRepository.update(budget.id, {
      spentAmount: totalSpent,
      remainingBudget: overallMetrics.remaining,
      utilizationPercentage: overallMetrics.percentage,
      status: overallMetrics.status,
      categoryBudgets: updatedCategories,
    });
  }

  async createBudget(userId: string, data: any) {
    const totalBudget = data.totalBudget || 50000;
    const categoryBudgets = data.categoryBudgets || [];

    return budgetRepository.create({
      userId,
      month: data.month || new Date().getMonth() + 1,
      year: data.year || new Date().getFullYear(),
      currency: data.currency || 'INR',
      totalBudget,
      remainingBudget: totalBudget,
      spentAmount: 0,
      utilizationPercentage: 0,
      status: 'SAFE',
      strategy: data.strategy || 'MANUAL',
      carryForward: data.carryForward || false,
      notes: data.notes,
      categoryBudgets: categoryBudgets.map((cb: any) => ({
        categoryId: cb.categoryId,
        allocated: cb.allocated || 0,
        spent: 0,
        remaining: cb.allocated || 0,
        percentage: 0,
        status: 'SAFE',
      })),
    });
  }

  async updateBudget(id: string, userId: string, data: any) {
    const existing = await budgetRepository.findById(id);
    if (!existing) {
      throw new Error('Budget not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return budgetRepository.update(id, data);
  }

  async deleteBudget(id: string, userId: string) {
    const existing = await budgetRepository.findById(id);
    if (!existing) {
      throw new Error('Budget not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return budgetRepository.delete(id);
  }

  async getHistoricalBudgets(userId: string) {
    return budgetRepository.findByUser(userId);
  }
}
export const budgetService = new BudgetService();
export const budgetCalculationService = new BudgetCalculationService();
export const budgetPredictionService = new BudgetPredictionService();
export const budgetRecommendationService = new BudgetRecommendationService();
