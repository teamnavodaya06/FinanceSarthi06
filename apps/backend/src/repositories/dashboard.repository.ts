import { prisma } from '../config';

export class DashboardRepository {
  async fetchFinancialDataBatch(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    try {
      // Batch query with parallel Promise.all execution to optimize reads
      const [
        user,
        incomes,
        expenses,
        budgets,
        goals,
        assets,
        liabilities
      ] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.income.findMany({ where: { userId } }),
        prisma.expense.findMany({ where: { userId, isDeleted: false } }),
        prisma.budget.findMany({
          where: { userId },
          include: { categoryBudgets: true }
        }),
        prisma.goal.findMany({ where: { userId } }),
        prisma.asset.findMany({ where: { userId } }),
        prisma.liability.findMany({ where: { userId } })
      ]);

      const activeBudget = budgets.find(b => b.month === currentMonth && b.year === currentYear) || null;

      return {
        user,
        incomes,
        expenses,
        budgets,
        activeBudget,
        goals,
        assets,
        liabilities
      };
    } catch (err: any) {
      console.warn(`[DATABASE OFFLINE WARNING] Could not query PostgreSQL: ${err.message}. Gracefully falling back to default/empty dataset.`);
      return {
        user: { id: userId, monthlyIncome: 75000 },
        incomes: [],
        expenses: [],
        budgets: [],
        activeBudget: null,
        goals: [],
        assets: [],
        liabilities: []
      };
    }
  }
}
export const dashboardRepository = new DashboardRepository();
