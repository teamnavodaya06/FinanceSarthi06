import { prisma } from '../config';
export class ExpenseRepository {
    async findByUserId(userId) {
        return prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
    }
    async create(data) {
        return prisma.expense.create({
            data,
        });
    }
    async delete(id, userId) {
        return prisma.expense.deleteMany({
            where: { id, userId },
        });
    }
}
