import { Expense } from '@financesarthi/types';

export interface FinancialStoryPayload {
  headline: string;
  summary: string;
  achievements: string[];
  warnings: string[];
  prediction: string;
}

export class FinancialStoryService {
  public static generateStory(expenses: Expense[], monthlyIncome: number): FinancialStoryPayload {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const incomeVal = monthlyIncome || 85000;
    const savingsRate = incomeVal > 0 ? Math.round(((incomeVal - totalSpent) / incomeVal) * 100) : 0;
    
    // Previous Month Mock references (for variance calculation)
    const prevMonthSpent = Math.round(totalSpent * 1.08); // assume they spent 8% more last month
    const variance = prevMonthSpent - totalSpent;
    const variancePct = 8; // variance percentage mock

    const foodSpent = expenses.filter(e => e.category === 'FOOD').reduce((sum, e) => sum + e.amount, 0);
    const shoppingSpent = expenses.filter(e => e.category === 'SHOPPING').reduce((sum, e) => sum + e.amount, 0);

    const headline = totalSpent < incomeVal 
      ? 'Outstanding Cash Surplus Strategy this Month!' 
      : 'Careful! Budget Overruns detected.';

    const summary = `In August, you spent ₹${totalSpent.toLocaleString('en-IN')}, which was ${variancePct}% lower than July. Your active food & dining allocations stand at ₹${foodSpent.toLocaleString('en-IN')}. By keeping discretionary logs down, your overall savings rate improved to ${savingsRate}%. Maintaining this trajectory will yield approximately ₹${(Math.round(incomeVal * (savingsRate / 100) * 12 * 5)).toLocaleString('en-IN')} over the next five years.`;

    const achievements: string[] = [];
    const warnings: string[] = [];

    if (totalSpent < prevMonthSpent) {
      achievements.push('Spent less than previous month (8% savings variance)');
    }
    if (totalSpent < incomeVal * 0.8) {
      achievements.push('Maintained budget burn rate below 80% threshold');
    }
    if (savingsRate > 20) {
      achievements.push('Savings margin exceeded target 20% limit');
    }

    if (foodSpent > incomeVal * 0.25) {
      warnings.push('Food spending consumes over 25% of monthly salary.');
    }
    if (shoppingSpent > incomeVal * 0.2) {
      warnings.push('Shopping and retail purchases exceeded planned limits.');
    }

    const prediction = `If current spending patterns continue, you are projected to save ₹${Math.max(0, incomeVal - totalSpent).toLocaleString('en-IN')} next month.`;

    return {
      headline,
      summary,
      achievements,
      warnings,
      prediction,
    };
  }
}
