import { prisma } from '../config';

export class AdaptiveBudgetRepository {
  async logDecision(data: {
    userId: string;
    recommendationId: string;
    action: string;
    categoryOverrides: any;
  }) {
    return prisma.aIBudgetDecision.create({
      data: {
        userId: data.userId,
        recommendationId: data.recommendationId,
        action: data.action,
        categoryOverrides: JSON.stringify(data.categoryOverrides),
      },
    });
  }

  async getDecisionHistory(userId: string) {
    const list = await prisma.aIBudgetDecision.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(item => ({
      ...item,
      categoryOverrides: JSON.parse(item.categoryOverrides),
    }));
  }

  async logAudit(data: {
    userId: string;
    decisionId: string;
    type: string;
    previousState: any;
    newState: any;
    financialImpact: number;
  }) {
    return prisma.aIBudgetAuditLog.create({
      data: {
        userId: data.userId,
        decisionId: data.decisionId,
        type: data.type,
        previousState: JSON.stringify(data.previousState),
        newState: JSON.stringify(data.newState),
        financialImpact: data.financialImpact,
      },
    });
  }

  async getAuditLogs(userId: string) {
    const list = await prisma.aIBudgetAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(item => ({
      ...item,
      previousState: JSON.parse(item.previousState),
      newState: JSON.parse(item.newState),
    }));
  }
}
export const adaptiveBudgetRepository = new AdaptiveBudgetRepository();
