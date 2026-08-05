import { prisma } from '../config';
import { Goal, GoalPriority, GoalStatus, GoalContribution } from '@financesarthi/types';

// Mock memory stores
const contributionHistoryDb: GoalContribution[] = [];
const mockGoalsDb: Goal[] = [];
let mockGoalsDbInitialized = false;

export class GoalExtendedRepository {
  private mapToGoal(dbGoal: any): Goal {
    const targetAmount = dbGoal.targetAmount;
    const currentAmount = dbGoal.currentAmount;
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    
    const monthlyContribution = dbGoal.monthlyAllocation || 2000;
    
    let status: GoalStatus = 'In Progress';
    if (dbGoal.isCompleted || currentAmount >= targetAmount) {
      status = 'Completed';
    } else if (monthlyContribution > 5000) {
      status = 'Ahead of Schedule';
    } else if (monthlyContribution < 1500) {
      status = 'Behind Schedule';
    } else {
      status = 'On Track';
    }

    const monthsRemaining = monthlyContribution > 0 ? remainingAmount / monthlyContribution : 999;
    const estDate = new Date();
    estDate.setMonth(estDate.getMonth() + Math.ceil(monthsRemaining));

    return {
      id: dbGoal.id,
      title: dbGoal.title,
      category: dbGoal.category,
      monthlyAllocation: dbGoal.monthlyAllocation || 2000,
      isCompleted: dbGoal.isCompleted || false,
      predictedCompletionDate: estDate.toISOString().split('T')[0],

      goalId: dbGoal.id,
      userId: dbGoal.userId,
      goalName: dbGoal.title,
      goalType: dbGoal.category,
      description: dbGoal.description || undefined,
      targetAmount,
      currentAmount,
      remainingAmount,
      monthlyContribution,
      targetDate: dbGoal.targetDate ? new Date(dbGoal.targetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      priority: (dbGoal.priority || 'Medium') as GoalPriority,
      status,
      estimatedCompletionDate: estDate.toISOString().split('T')[0],
      completionPercentage: targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0
    };
  }

  async findAll(userId: string): Promise<Goal[]> {
    try {
      const dbGoals = await prisma.goal.findMany({
        where: { userId }
      });
      return dbGoals.map(g => this.mapToGoal(g));
    } catch (err) {
      // Return memory db goals combined with static defaults if empty
      if (!mockGoalsDbInitialized) {
        mockGoalsDb.push(
          {
            id: 'goal-emergency',
            title: 'Emergency Fund',
            category: 'EMERGENCY_FUND',
            monthlyAllocation: 10000,
            isCompleted: false,
            predictedCompletionDate: '2026-11-20',

            goalId: 'goal-emergency',
            userId,
            goalName: 'Emergency Fund',
            goalType: 'EMERGENCY_FUND',
            targetAmount: 150000,
            currentAmount: 112500,
            remainingAmount: 37500,
            monthlyContribution: 10000,
            targetDate: '2026-12-01',
            priority: 'Critical',
            status: 'On Track',
            estimatedCompletionDate: '2026-11-20',
            completionPercentage: 75
          },
          {
            id: 'goal-car',
            title: 'Electric SUV Purchase',
            category: 'CAR_PURCHASE',
            monthlyAllocation: 30000,
            isCompleted: false,
            predictedCompletionDate: '2028-05-15',

            goalId: 'goal-car',
            userId,
            goalName: 'Electric SUV Purchase',
            goalType: 'CAR_PURCHASE',
            targetAmount: 1500000,
            currentAmount: 660000,
            remainingAmount: 840000,
            monthlyContribution: 30000,
            targetDate: '2028-06-01',
            priority: 'Medium',
            status: 'On Track',
            estimatedCompletionDate: '2028-05-15',
            completionPercentage: 44
          }
        );
        mockGoalsDbInitialized = true;
      }
      return mockGoalsDb.filter(g => g.userId === userId);
    }
  }

  async findById(goalId: string): Promise<Goal | null> {
    try {
      const dbGoal = await prisma.goal.findUnique({
        where: { id: goalId }
      });
      return dbGoal ? this.mapToGoal(dbGoal) : null;
    } catch (err) {
      // In mock/fallback mode, search mockGoalsDb memory array
      return mockGoalsDb.find(g => g.goalId === goalId) || null;
    }
  }

  async create(userId: string, data: any): Promise<Goal> {
    try {
      const dbGoal = await prisma.goal.create({
        data: {
          userId,
          title: data.goalName,
          category: data.goalType,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount || 0,
          monthlyAllocation: data.monthlyContribution || 2000,
          targetDate: new Date(data.targetDate || new Date()),
          isCompleted: false
        }
      });
      return this.mapToGoal(dbGoal);
    } catch (err) {
      const generatedId = `goal-${Math.floor(Math.random() * 100000)}`;
      const mockGoal: Goal = {
        id: generatedId,
        title: data.goalName,
        category: data.goalType,
        monthlyAllocation: data.monthlyContribution || 2000,
        isCompleted: false,
        predictedCompletionDate: data.targetDate || new Date().toISOString().split('T')[0],

        goalId: generatedId,
        userId,
        goalName: data.goalName,
        goalType: data.goalType,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        remainingAmount: data.targetAmount - (data.currentAmount || 0),
        monthlyContribution: data.monthlyContribution || 2000,
        targetDate: data.targetDate || new Date().toISOString().split('T')[0],
        priority: (data.priority || 'Medium') as GoalPriority,
        status: 'In Progress',
        estimatedCompletionDate: data.targetDate || new Date().toISOString().split('T')[0],
        completionPercentage: data.targetAmount > 0 ? Math.min(100, Math.round(((data.currentAmount || 0) / data.targetAmount) * 100)) : 0
      };
      mockGoalsDb.push(mockGoal);
      return mockGoal;
    }
  }

  async update(goalId: string, data: any): Promise<Goal> {
    try {
      const dbGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          title: data.goalName,
          category: data.goalType,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          monthlyAllocation: data.monthlyContribution,
          targetDate: data.targetDate ? new Date(data.targetDate) : undefined
        }
      });
      return this.mapToGoal(dbGoal);
    } catch (err) {
      const idx = mockGoalsDb.findIndex(g => g.goalId === goalId);
      if (idx === -1) throw new Error('Goal not found');
      
      const updated = {
        ...mockGoalsDb[idx],
        ...data,
        goalName: data.goalName ?? mockGoalsDb[idx].goalName,
        goalType: data.goalType ?? mockGoalsDb[idx].goalType,
        targetAmount: data.targetAmount ?? mockGoalsDb[idx].targetAmount,
        currentAmount: data.currentAmount ?? mockGoalsDb[idx].currentAmount,
        monthlyContribution: data.monthlyContribution ?? mockGoalsDb[idx].monthlyContribution,
        remainingAmount: (data.targetAmount ?? mockGoalsDb[idx].targetAmount) - (data.currentAmount ?? mockGoalsDb[idx].currentAmount),
        completionPercentage: Math.round(((data.currentAmount ?? mockGoalsDb[idx].currentAmount) / (data.targetAmount ?? mockGoalsDb[idx].targetAmount)) * 100)
      };
      mockGoalsDb[idx] = updated;
      return updated;
    }
  }

  async softDelete(goalId: string): Promise<boolean> {
    try {
      await prisma.goal.delete({
        where: { id: goalId }
      });
      return true;
    } catch (err) {
      const idx = mockGoalsDb.findIndex(g => g.goalId === goalId);
      if (idx !== -1) {
        mockGoalsDb.splice(idx, 1);
      }
      return true;
    }
  }

  async addContribution(goalId: string, amount: number, type: 'MANUAL' | 'AUTOMATIC'): Promise<GoalContribution> {
    const contrib: GoalContribution = {
      id: `contrib-${Math.floor(Math.random() * 100000)}`,
      goalId,
      amount,
      type,
      date: new Date().toISOString().split('T')[0]
    };
    contributionHistoryDb.push(contrib);

    const goal = await this.findById(goalId);
    if (goal) {
      await this.update(goalId, {
        currentAmount: goal.currentAmount + amount
      });
    }
    return contrib;
  }

  async getContributionsHistory(goalId: string): Promise<GoalContribution[]> {
    return contributionHistoryDb.filter(c => c.goalId === goalId);
  }
}
export const goalExtendedRepository = new GoalExtendedRepository();
