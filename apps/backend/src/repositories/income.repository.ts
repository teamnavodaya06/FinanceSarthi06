import { prisma } from '../config';

export class IncomeRepository {
  async findActiveByUserId(userId: string) {
    return prisma.income.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async findById(id: string) {
    return prisma.income.findUnique({
      where: { id },
    });
  }

  async create(userId: string, data: any) {
    return prisma.income.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.income.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.income.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
