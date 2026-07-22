import { prisma } from '../config';
export class GoalRepository {
    async findByUserId(userId) {
        return prisma.goal.findMany({
            where: { userId },
            orderBy: { targetDate: 'asc' },
        });
    }
    async create(data) {
        return prisma.goal.create({
            data,
        });
    }
    async updateProgress(id, currentAmount) {
        return prisma.goal.update({
            where: { id },
            data: { currentAmount },
        });
    }
}
