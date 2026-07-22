import { prisma } from '../config';

export class GoalRepository {
  async findByUserId(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    category: any;
    targetAmount: number;
    currentAmount?: number;
    targetDate: Date;
    monthlyAllocation?: number;
  }) {
    return prisma.goal.create({
      data,
    });
  }

  async updateProgress(id: string, currentAmount: number) {
    return prisma.goal.update({
      where: { id },
      data: { currentAmount },
    });
  }
}
