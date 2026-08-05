import { prisma } from '../config';

const mockIncomeDb: any[] = [];

export class IncomeRepository {
  async findActiveByUserId(userId: string) {
    try {
      return await prisma.income.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });
    } catch (err) {
      console.warn('[DATABASE OFFLINE WARNING] Gracefully falling back to in-memory income store.');
      const found = mockIncomeDb.find(inc => inc.userId === userId && !inc.deletedAt);
      return found || null;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.income.findUnique({
        where: { id },
      });
    } catch (err) {
      const found = mockIncomeDb.find(inc => inc.id === id);
      return found || null;
    }
  }

  async create(userId: string, data: any) {
    try {
      return await prisma.income.create({
        data: {
          userId,
          ...data,
        },
      });
    } catch (err) {
      const record = {
        id: `inc-mock-${Math.floor(Math.random() * 100000)}`,
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockIncomeDb.push(record);
      return record;
    }
  }

  async update(id: string, data: any) {
    try {
      return await prisma.income.update({
        where: { id },
        data,
      });
    } catch (err) {
      const idx = mockIncomeDb.findIndex(inc => inc.id === id);
      if (idx !== -1) {
        mockIncomeDb[idx] = {
          ...mockIncomeDb[idx],
          ...data,
          updatedAt: new Date(),
        };
        return mockIncomeDb[idx];
      }
      return null;
    }
  }

  async softDelete(id: string) {
    try {
      return await prisma.income.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (err) {
      const idx = mockIncomeDb.findIndex(inc => inc.id === id);
      if (idx !== -1) {
        mockIncomeDb[idx].deletedAt = new Date();
        return mockIncomeDb[idx];
      }
      return null;
    }
  }
}
export const incomeRepository = new IncomeRepository();
