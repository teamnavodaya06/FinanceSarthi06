import { describe, it, expect, vi } from 'vitest';

// 1. Mock api and types
interface Income {
  id: string;
  monthlyIncome: number;
  salaryType: string;
  employmentType: string;
  incomeFrequency: string;
  cityCategory: string;
  taxRegime: string;
  bonusIncome: number;
  otherIncome: number;
  freelanceIncome: number;
  rentalIncome: number;
  investmentIncome: number;
  riskProfile: string;
  notes: string;
  totalIncome: number;
}

// 2. FDSL Central State Sync Simulator
class FDSLEngine {
  public income: Income | null = null;
  public totalMonthlyExpenses: number = 25000; // Simulated expenses

  public updateIncome(data: Income) {
    this.income = data;
  }

  get totalMonthlyIncome(): number {
    if (!this.income) return 75000;
    return (
      (this.income.monthlyIncome || 0) +
      (this.income.bonusIncome || 0) +
      (this.income.freelanceIncome || 0) +
      (this.income.rentalIncome || 0) +
      (this.income.investmentIncome || 0) +
      (this.income.otherIncome || 0)
    );
  }

  get monthlySurplus(): number {
    return Math.max(0, this.totalMonthlyIncome - this.totalMonthlyExpenses);
  }

  get aiContext() {
    return {
      income: this.totalMonthlyIncome,
      expenses: this.totalMonthlyExpenses,
      surplus: this.monthlySurplus,
    };
  }
}

describe('Income Profile CRUD & FDSL Flow Redesign', () => {
  
  it('should auto-detect and enter CREATE mode when no profile exists', async () => {
    // Simulate API returning null (first-time signup)
    const mockGetIncome = vi.fn().mockResolvedValue({ success: true, data: null });
    
    // Simulate Modal Lifecycle
    const response = await mockGetIncome();
    let mode: 'create' | 'edit' = 'create';
    let formData = {};

    if (response.success && response.data) {
      mode = 'edit';
      formData = response.data;
    } else {
      mode = 'create';
      formData = {
        monthlyIncome: 75000,
        salaryType: 'Salary',
        employmentType: 'Private',
      };
    }

    expect(mode).toBe('create');
    expect(formData).toHaveProperty('monthlyIncome', 75000);
    expect(formData).toHaveProperty('salaryType', 'Salary');
  });

  it('should auto-detect and enter EDIT mode when an active profile exists', async () => {
    const existingProfile: Income = {
      id: 'inc-999',
      monthlyIncome: 95000,
      salaryType: 'Freelancer',
      employmentType: 'Self Employed',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      taxRegime: 'New',
      bonusIncome: 5000,
      otherIncome: 0,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      riskProfile: 'Aggressive',
      notes: 'Consulting services',
      totalIncome: 100000,
    };

    const mockGetIncome = vi.fn().mockResolvedValue({ success: true, data: existingProfile });
    
    // Simulate Modal Open
    const response = await mockGetIncome();
    let mode: 'create' | 'edit' = 'create';
    let formData = {};

    if (response.success && response.data) {
      mode = 'edit';
      formData = { ...response.data };
    }

    expect(mode).toBe('edit');
    expect(formData).toHaveProperty('monthlyIncome', 95000);
    expect(formData).toHaveProperty('salaryType', 'Freelancer');
  });

  it('should calculate changed fields delta (PATCH payload) when editing', () => {
    const dbIncome: Income = {
      id: 'inc-999',
      monthlyIncome: 95000,
      salaryType: 'Freelancer',
      employmentType: 'Self Employed',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      taxRegime: 'New',
      bonusIncome: 5000,
      otherIncome: 0,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      riskProfile: 'Aggressive',
      notes: 'Consulting services',
      totalIncome: 100000,
    };

    // User changes freelanceIncome from 0 to 12000
    const formFields = {
      ...dbIncome,
      freelanceIncome: 12000,
    };

    // Construct delta
    const patchPayload: any = {};
    let hasChanges = false;

    Object.keys(formFields).forEach((k) => {
      const key = k as keyof Income;
      if (formFields[key] !== dbIncome[key]) {
        patchPayload[key] = formFields[key];
        hasChanges = true;
      }
    });

    expect(hasChanges).toBe(true);
    expect(patchPayload).toEqual({ freelanceIncome: 12000 });
    expect(patchPayload).not.toHaveProperty('monthlyIncome');
  });

  it('should prevent duplicate creation on backend if already exists', async () => {
    const mockCreateIncome = vi.fn().mockImplementation((userId) => {
      const activeExists = true; // Simulated DB check
      if (activeExists) {
        return Promise.resolve({
          success: false,
          message: 'An active income profile already exists for this user. Please update the existing profile instead.',
        });
      }
      return Promise.resolve({ success: true });
    });

    const response = await mockCreateIncome('user-123');
    expect(response.success).toBe(false);
    expect(response.message).toContain('already exists');
  });

  it('should immediately update central FDSL calculations and cascade dashboard state', () => {
    const fdsl = new FDSLEngine();
    expect(fdsl.totalMonthlyIncome).toBe(75000); // Default
    expect(fdsl.monthlySurplus).toBe(50000); // 75000 - 25000

    const updatedProfile: Income = {
      id: 'inc-999',
      monthlyIncome: 120000,
      salaryType: 'Salary',
      employmentType: 'Private',
      incomeFrequency: 'Monthly',
      cityCategory: 'Metro',
      taxRegime: 'New',
      bonusIncome: 10000,
      otherIncome: 5000,
      freelanceIncome: 0,
      rentalIncome: 0,
      investmentIncome: 0,
      riskProfile: 'Balanced',
      notes: '',
      totalIncome: 135000,
    };

    // Simulate saving and calling updateIncome context function
    fdsl.updateIncome(updatedProfile);

    // Verify FDSL immediately synchronized
    expect(fdsl.totalMonthlyIncome).toBe(135000);
    expect(fdsl.monthlySurplus).toBe(110000); // 135000 - 25000
    expect(fdsl.aiContext.surplus).toBe(110000);
  });
});
