import { BaseRepository } from './base.repo';

export interface FirestoreIncome {
  monthlyIncome: number;
  annualIncome: number;
  salaryType: string;
  employmentType: string;
  frequency: string;
  cityCategory: string;
  taxRegime: string;
  bonusIncome: number;
  freelanceIncome: number;
  rentalIncome: number;
  investmentIncome: number;
  otherIncome: number;
  totalIncome: number;
  currency: string;
  riskProfile: string;
  financialGoals: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class IncomeService extends BaseRepository {
  private runCalculations(data: Partial<FirestoreIncome>) {
    const monthlyIncome = data.monthlyIncome ?? 0;
    const bonus = data.bonusIncome ?? 0;
    const freelance = data.freelanceIncome ?? 0;
    const rental = data.rentalIncome ?? 0;
    const investment = data.investmentIncome ?? 0;
    const other = data.otherIncome ?? 0;

    const annualIncome = monthlyIncome * 12;
    const totalIncome = monthlyIncome + bonus + freelance + rental + investment + other;

    return {
      annualIncome,
      totalIncome,
    };
  }

  async getIncome(): Promise<FirestoreIncome | null> {
    const data = await this.getSingleDocument('income', 'current');
    return data as FirestoreIncome | null;
  }

  async updateIncome(data: Partial<FirestoreIncome>): Promise<void> {
    const calcs = this.runCalculations(data);
    const merged = {
      ...data,
      ...calcs,
    };
    await this.setSingleDocument('income', merged, 'current');
  }

  listenToIncome(callback: (income: FirestoreIncome | null) => void) {
    return this.getDocumentSnapshot('income', 'current', callback);
  }
}

export const incomeService = new IncomeService();
