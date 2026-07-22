import { prisma } from '../config';

export class ExpenseRepository {
  async findByUserId(userId: string) {
    return prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    amount: number;
    category: any;
    isRecurring?: boolean;
    notes?: string;
  }) {
    return prisma.expense.create({
      data,
    });
  }

  async delete(id: string, userId: string) {
    return prisma.expense.deleteMany({
      where: { id, userId },
    });
  }
}
