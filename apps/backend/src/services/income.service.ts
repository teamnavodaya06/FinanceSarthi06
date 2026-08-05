import { IncomeRepository } from '../repositories/income.repository';
import { prisma } from '../config';
import { z } from 'zod';
import { incomeCalculationService } from './income-calculation.service';

export const CreateIncomeSchema = z.object({
  monthlyIncome: z.number().min(0, "Monthly income cannot be negative"),
  salaryType: z.enum(['Salary', 'Business', 'Freelancer', 'Student', 'Retired']),
  employmentType: z.enum(['Private', 'Government', 'Self Employed', 'Business Owner', 'Contract', 'Other']),
  incomeFrequency: z.enum(['Monthly', 'Quarterly', 'Yearly', 'Weekly']),
  cityCategory: z.enum(['Metro', 'Tier1', 'Tier2', 'Tier3', 'Rural']),
  taxRegime: z.enum(['Old', 'New']),
  bonusIncome: z.number().min(0).optional().default(0),
  otherIncome: z.number().min(0).optional().default(0),
  freelanceIncome: z.number().min(0).optional().default(0),
  rentalIncome: z.number().min(0).optional().default(0),
  investmentIncome: z.number().min(0).optional().default(0),
  currency: z.string().optional().default('INR'),
  financialPriority: z.array(z.string()).optional().default([]),
  riskProfile: z.enum(['Conservative', 'Balanced', 'Aggressive']),
  isPrimaryIncome: z.boolean().optional().default(true),
  notes: z.string().optional(),
});

export const UpdateIncomeSchema = CreateIncomeSchema.partial();

export class IncomeService {
  private incomeRepo = new IncomeRepository();

  private calculateIncomeFields(data: any) {
    const monthlyIncome = data.monthlyIncome ?? 0;
    const bonus = data.bonusIncome ?? 0;
    const freelance = data.freelanceIncome ?? 0;
    const rental = data.rentalIncome ?? 0;
    const investment = data.investmentIncome ?? 0;
    const other = data.otherIncome ?? 0;

    const annualIncome = monthlyIncome * 12;
    const totalAdditionalIncome = bonus + freelance + rental + investment + other;
    const totalIncome = monthlyIncome + totalAdditionalIncome;

    return {
      annualIncome,
      totalAdditionalIncome,
      totalIncome,
    };
  }

  private async ensureUserExists(userId: string, email?: string, name?: string) {
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        await prisma.user.create({
          data: {
            id: userId,
            email: email || `${userId}@financesarthi.in`,
            name: name || 'FinanceSarthi User',
            cityTier: 'TIER_2',
            monthlyIncome: 0,
          },
        });
      }
    } catch (err) {
      console.warn('[DATABASE OFFLINE WARNING] Failed to sync user record to Postgres in ensureUserExists.');
    }
  }

  async createIncome(userId: string, userEmail: string, payload: any) {
    // 1. Validation
    const validated = CreateIncomeSchema.parse(payload);

    // 2. Ensure parent User record exists in DB
    await this.ensureUserExists(userId, userEmail);

    // 3. Duplicate Prevention (only one active income profile per user)
    const existing = await this.incomeRepo.findActiveByUserId(userId);
    if (existing) {
      throw new Error('An active income profile already exists for this user. Please update the existing profile instead.');
    }

    // 4. Calculations
    const calcs = this.calculateIncomeFields(validated);

    // 5. Store record
    return this.incomeRepo.create(userId, {
      ...validated,
      ...calcs,
    });
  }

  async getActiveIncome(userId: string) {
    return this.incomeRepo.findActiveByUserId(userId);
  }

  async getIncomeById(id: string, userId: string) {
    const income = await this.incomeRepo.findById(id);
    if (!income) {
      throw new Error('Income profile not found');
    }

    // Ownership Verification
    if (income.userId !== userId) {
      throw new Error('Access denied: You do not own this income record');
    }

    return income;
  }

  async updateIncome(id: string, userId: string, payload: any, overwrite = false) {
    const income = await this.incomeRepo.findById(id);
    if (!income) {
      throw new Error('Income profile not found');
    }

    // Ownership Verification
    if (income.userId !== userId) {
      throw new Error('Access denied: You do not own this income record');
    }

    // Check validation schema
    const schema = overwrite ? CreateIncomeSchema : UpdateIncomeSchema;
    const validated = schema.parse(payload);

    // Re-run calculations merged with existing database values
    const merged = {
      ...income,
      ...validated,
    };
    const calcs = this.calculateIncomeFields(merged);

    // Update
    return this.incomeRepo.update(id, {
      ...validated,
      ...calcs,
    });
  }

  async softDeleteIncome(id: string, userId: string) {
    const income = await this.incomeRepo.findById(id);
    if (!income) {
      throw new Error('Income profile not found');
    }

    // Ownership Verification
    if (income.userId !== userId) {
      throw new Error('Access denied: You do not own this income record');
    }

    return this.incomeRepo.softDelete(id);
  }

  async getSummary(userId: string) {
    const activeIncome = await this.incomeRepo.findActiveByUserId(userId);
    if (!activeIncome) {
      throw new Error('No active income profile found for user. Please complete onboarding first.');
    }

    let expenses: any[] = [];
    let goals: any[] = [];
    let assets: any[] = [];
    let liabilities: any[] = [];

    try {
      [expenses, goals, assets, liabilities] = await Promise.all([
        prisma.expense.findMany({ where: { userId } }),
        prisma.goal.findMany({ where: { userId } }),
        prisma.asset.findMany({ where: { userId } }),
        prisma.liability.findMany({ where: { userId } }),
      ]);
    } catch (err) {
      console.warn('[DATABASE OFFLINE WARNING] Failed to query dashboard parameters from Postgres in getSummary. Falling back to default list empty sets.');
    }

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabs = liabilities.reduce((sum, l) => sum + l.remaining, 0);
    const currentNetWorth = totalAssets - totalLiabs;

    return incomeCalculationService.calculateSummary(activeIncome, expenses, goals, currentNetWorth);
  }
}
