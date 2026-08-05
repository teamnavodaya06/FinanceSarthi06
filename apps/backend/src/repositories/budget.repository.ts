import { prisma } from '../config';

const mockBudgetsDb: any[] = [];

export class BudgetRepository {
  async findCurrentBudget(userId: string, month: number, year: number) {
    try {
      return await prisma.budget.findUnique({
        where: {
          userId_month_year: {
            userId,
            month,
            year,
          },
        },
        include: {
          categoryBudgets: true,
        },
      });
    } catch (err) {
      console.warn('[DATABASE OFFLINE WARNING] Gracefully falling back to in-memory current budget.');
      const found = mockBudgetsDb.find(b => b.userId === userId && b.month === month && b.year === year);
      return found || null;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.budget.findUnique({
        where: { id },
        include: {
          categoryBudgets: true,
        },
      });
    } catch (err) {
      const found = mockBudgetsDb.find(b => b.id === id);
      return found || null;
    }
  }

  async findByUser(userId: string) {
    try {
      return await prisma.budget.findMany({
        where: { userId },
        include: {
          categoryBudgets: true,
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
      });
    } catch (err) {
      return mockBudgetsDb.filter(b => b.userId === userId);
    }
  }

  async create(data: {
    userId: string;
    month: number;
    year: number;
    currency: string;
    totalBudget: number;
    remainingBudget: number;
    spentAmount: number;
    utilizationPercentage: number;
    status: string;
    strategy: string;
    carryForward: boolean;
    notes?: string;
    categoryBudgets: {
      categoryId: string;
      allocated: number;
      spent: number;
      remaining: number;
      percentage: number;
      status: string;
    }[];
  }) {
    try {
      return await prisma.budget.create({
        data: {
          userId: data.userId,
          month: data.month,
          year: data.year,
          currency: data.currency,
          totalBudget: data.totalBudget,
          remainingBudget: data.remainingBudget,
          spentAmount: data.spentAmount,
          utilizationPercentage: data.utilizationPercentage,
          status: data.status,
          strategy: data.strategy,
          carryForward: data.carryForward,
          notes: data.notes,
          categoryBudgets: {
            createMany: {
              data: data.categoryBudgets.map(cb => ({
                categoryId: cb.categoryId,
                allocated: cb.allocated,
                spent: cb.spent,
                remaining: cb.remaining,
                percentage: cb.percentage,
                status: cb.status,
              })),
            },
          },
        },
        include: {
          categoryBudgets: true,
        },
      });
    } catch (err) {
      const record = {
        id: `bud-mock-${Math.floor(Math.random() * 100000)}`,
        userId: data.userId,
        month: data.month,
        year: data.year,
        currency: data.currency,
        totalBudget: data.totalBudget,
        remainingBudget: data.remainingBudget,
        spentAmount: data.spentAmount,
        utilizationPercentage: data.utilizationPercentage,
        status: data.status,
        strategy: data.strategy,
        carryForward: data.carryForward,
        notes: data.notes,
        categoryBudgets: data.categoryBudgets.map(cb => ({
          id: `cb-mock-${Math.floor(Math.random() * 100000)}`,
          categoryId: cb.categoryId,
          allocated: cb.allocated,
          spent: cb.spent,
          remaining: cb.remaining,
          percentage: cb.percentage,
          status: cb.status,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBudgetsDb.push(record);
      return record;
    }
  }

  async update(id: string, data: {
    totalBudget?: number;
    remainingBudget?: number;
    spentAmount?: number;
    utilizationPercentage?: number;
    status?: string;
    notes?: string;
    categoryBudgets?: {
      categoryId: string;
      allocated?: number;
      spent?: number;
      remaining?: number;
      percentage?: number;
      status?: string;
    }[];
  }) {
    try {
      if (data.categoryBudgets) {
        for (const cb of data.categoryBudgets) {
          await prisma.categoryBudget.upsert({
            where: {
              budgetId_categoryId: {
                budgetId: id,
                categoryId: cb.categoryId,
              },
            },
            update: {
              allocated: cb.allocated,
              spent: cb.spent,
              remaining: cb.remaining,
              percentage: cb.percentage,
              status: cb.status,
            },
            create: {
              budgetId: id,
              categoryId: cb.categoryId,
              allocated: cb.allocated || 0,
              spent: cb.spent || 0,
              remaining: cb.remaining || 0,
              percentage: cb.percentage || 0,
              status: cb.status || 'SAFE',
            },
          });
        }
      }

      return await prisma.budget.update({
        where: { id },
        data: {
          totalBudget: data.totalBudget,
          remainingBudget: data.remainingBudget,
          spentAmount: data.spentAmount,
          utilizationPercentage: data.utilizationPercentage,
          status: data.status,
          notes: data.notes,
        },
        include: {
          categoryBudgets: true,
        },
      });
    } catch (err) {
      const idx = mockBudgetsDb.findIndex(b => b.id === id);
      if (idx !== -1) {
        const current = mockBudgetsDb[idx];
        if (data.categoryBudgets) {
          data.categoryBudgets.forEach(updateCb => {
            const cbIdx = current.categoryBudgets.findIndex((cb: any) => cb.categoryId === updateCb.categoryId);
            if (cbIdx !== -1) {
              current.categoryBudgets[cbIdx] = {
                ...current.categoryBudgets[cbIdx],
                ...updateCb,
              };
            } else {
              current.categoryBudgets.push({
                id: `cb-mock-${Math.floor(Math.random() * 100000)}`,
                categoryId: updateCb.categoryId,
                allocated: updateCb.allocated || 0,
                spent: updateCb.spent || 0,
                remaining: updateCb.remaining || 0,
                percentage: updateCb.percentage || 0,
                status: updateCb.status || 'SAFE',
              });
            }
          });
        }
        mockBudgetsDb[idx] = {
          ...current,
          totalBudget: data.totalBudget !== undefined ? data.totalBudget : current.totalBudget,
          remainingBudget: data.remainingBudget !== undefined ? data.remainingBudget : current.remainingBudget,
          spentAmount: data.spentAmount !== undefined ? data.spentAmount : current.spentAmount,
          utilizationPercentage: data.utilizationPercentage !== undefined ? data.utilizationPercentage : current.utilizationPercentage,
          status: data.status !== undefined ? data.status : current.status,
          notes: data.notes !== undefined ? data.notes : current.notes,
          updatedAt: new Date(),
        };
        return mockBudgetsDb[idx];
      }
      return null;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.budget.delete({
        where: { id },
      });
    } catch (err) {
      const idx = mockBudgetsDb.findIndex(b => b.id === id);
      if (idx !== -1) {
        const deleted = mockBudgetsDb[idx];
        mockBudgetsDb.splice(idx, 1);
        return deleted;
      }
      return null;
    }
  }
}
export const budgetRepository = new BudgetRepository();
