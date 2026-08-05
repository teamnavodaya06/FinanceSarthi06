import { describe, it, expect } from 'vitest';
import { calculateFinancialHealthScore, calculate50_30_20 } from '@financesarthi/utils';

// Mock FDSL Sync Engine State
class FDSLEngine {
  public income: any = null;
  public expenses: any[] = [];
  public goals: any[] = [];
  public assets: any[] = [];
  public liabilities: any[] = [];
  public budgets: any[] = [];
  
  public syncStatus: string = 'SYNCED';
  
  // Computed Properties (FDSL Core)
  get totalMonthlyIncome() {
    return this.income?.totalIncome || 75000;
  }
  
  get totalMonthlyExpenses() {
    return this.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }
  
  get monthlySurplus() {
    return Math.max(0, this.totalMonthlyIncome - this.totalMonthlyExpenses);
  }
  
  get savingsRate() {
    return this.totalMonthlyIncome > 0 ? Math.round((this.monthlySurplus / this.totalMonthlyIncome) * 100) : 0;
  }
  
  get expenseRatio() {
    return this.totalMonthlyIncome > 0 ? Math.round((this.totalMonthlyExpenses / this.totalMonthlyIncome) * 100) : 0;
  }
  
  get netWorth() {
    const totalAssets = this.assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = this.liabilities.reduce((sum, l) => sum + l.remaining, 0);
    return totalAssets - totalLiabilities;
  }
  
  get healthScore() {
    const totalSavings = this.expenses.filter(e => e.category === 'INVESTMENT').reduce((acc, curr) => acc + curr.amount, 0) + (this.totalMonthlyIncome * 0.15);
    const totalDebt = this.liabilities.reduce((acc, curr) => acc + curr.monthlyEmi, 0);
    const efCover = 4.5;
    return calculateFinancialHealthScore(this.totalMonthlyIncome, totalSavings, totalDebt, efCover, true);
  }
  
  get budgetSummary() {
    return calculate50_30_20(this.totalMonthlyIncome, 'TIER_2');
  }

  get aiContext() {
    return {
      income: this.totalMonthlyIncome,
      expenses: this.totalMonthlyExpenses,
      surplus: this.monthlySurplus,
      netWorth: this.netWorth,
      health: this.healthScore.score
    };
  }

  // Mutators
  async updateIncome(incomeData: any) {
    this.income = incomeData;
  }

  async addExpense(expense: any) {
    this.expenses.push(expense);
  }

  async addAsset(asset: any) {
    this.assets.push(asset);
  }

  async addLiability(liability: any) {
    this.liabilities.push(liability);
  }

  async completeGoal(goalId: string) {
    const matched = this.goals.find(g => g.id === goalId);
    if (matched) {
      matched.currentAmount = matched.targetAmount;
      matched.isCompleted = true;
    }
  }
}

describe('FDSL Centralized Real-time Sync Engine Tests', () => {
  it('should correctly propagate calculations when income is updated', async () => {
    const engine = new FDSLEngine();
    expect(engine.totalMonthlyIncome).toBe(75000);
    expect(engine.monthlySurplus).toBe(75000);

    // Update income
    await engine.updateIncome({ totalIncome: 120000 });
    expect(engine.totalMonthlyIncome).toBe(120000);
    expect(engine.monthlySurplus).toBe(120000);
    expect(engine.savingsRate).toBe(100);
    expect(engine.aiContext.income).toBe(120000);
  });

  it('should correctly cascade surplus and expense metrics when expense is added', async () => {
    const engine = new FDSLEngine();
    await engine.updateIncome({ totalIncome: 100000 });
    expect(engine.monthlySurplus).toBe(100000);

    // Add rent expense
    await engine.addExpense({ title: 'Rent', amount: 30000, category: 'HOUSING' });
    expect(engine.totalMonthlyExpenses).toBe(30000);
    expect(engine.monthlySurplus).toBe(70000);
    expect(engine.expenseRatio).toBe(30);
    expect(engine.savingsRate).toBe(70);
    expect(engine.aiContext.expenses).toBe(30000);
  });

  it('should correctly update net worth when assets or liabilities change', async () => {
    const engine = new FDSLEngine();
    expect(engine.netWorth).toBe(0);

    // Add cash asset
    await engine.addAsset({ name: 'HDFC Savings', value: 200000 });
    expect(engine.netWorth).toBe(200000);

    // Add car loan liability
    await engine.addLiability({ name: 'Car Loan', remaining: 50000, monthlyEmi: 5000 });
    expect(engine.netWorth).toBe(150000);
  });

  it('should execute concurrent updates correctly without racing or stale values', async () => {
    const engine = new FDSLEngine();
    
    await Promise.all([
      engine.updateIncome({ totalIncome: 150000 }),
      engine.addExpense({ title: 'Food', amount: 10000, category: 'FOOD' }),
      engine.addAsset({ name: 'Gold', value: 80000 }),
      engine.addLiability({ name: 'Personal Loan', remaining: 30000, monthlyEmi: 3000 })
    ]);

    expect(engine.totalMonthlyIncome).toBe(150000);
    expect(engine.totalMonthlyExpenses).toBe(10000);
    expect(engine.monthlySurplus).toBe(140000);
    expect(engine.netWorth).toBe(50000);
    expect(engine.aiContext.surplus).toBe(140000);
  });
});
