import { BaseRepository } from './base.repo';

export interface FirestoreBudget {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  recommendedBudget: number;
  AIRecommendation: string;
}

export class BudgetService extends BaseRepository {
  async getBudget(): Promise<FirestoreBudget | null> {
    const data = await this.getSingleDocument('budget', 'current');
    return data as FirestoreBudget | null;
  }

  async updateBudget(data: Partial<FirestoreBudget>): Promise<void> {
    await this.setSingleDocument('budget', data, 'current');
  }

  listenToBudget(callback: (budget: FirestoreBudget | null) => void) {
    return this.getDocumentSnapshot('budget', 'current', callback);
  }
}

export const budgetService = new BudgetService();
