import { Expense } from '@financesarthi/types';

export interface SpendingHealthResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  trend: string;
}

export class SpendingHealthService {
  public static calculateHealth(
    expenses: Expense[],
    monthlyIncome: number,
    emergencyProgress = 65, // default fallback
    investmentContribution = 20 // default fallback (20%)
  ): SpendingHealthResult {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetLimit = monthlyIncome || 85000;
    
    // 1. Budget Discipline (25% Weight)
    // Score based on budget burn rate. Best is < 80%.
    const burnRate = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 100;
    let budgetScore = 100;
    if (burnRate > 100) {
      budgetScore = Math.max(0, 100 - (burnRate - 100) * 3);
    } else if (burnRate > 80) {
      budgetScore = 80;
    }

    // 2. Savings Rate (20% Weight)
    const savingsRatio = budgetLimit > 0 ? ((budgetLimit - totalSpent) / budgetLimit) * 100 : 0;
    let savingsScore = 0;
    if (savingsRatio >= 30) savingsScore = 100;
    else if (savingsRatio >= 20) savingsScore = 85;
    else if (savingsRatio >= 10) savingsScore = 60;
    else savingsScore = Math.max(0, savingsRatio * 5);

    // 3. Recurring Expense Control (10% Weight)
    const recurringTotal = expenses.filter(e => e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
    const recurringRatio = budgetLimit > 0 ? (recurringTotal / budgetLimit) * 100 : 0;
    let recurringScore = 100;
    if (recurringRatio > 25) {
      recurringScore = Math.max(20, 100 - (recurringRatio - 25) * 2);
    }

    // 4. Emergency Fund (15% Weight)
    const emergencyScore = Math.min(100, emergencyProgress);

    // 5. Essential vs Discretionary (15% Weight)
    // Essential categories: housing, utilities, healthcare, EMI
    const essentialTotal = expenses
      .filter(e => ['HOUSING', 'UTILITIES', 'HEALTHCARE', 'DEBT_EMI'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    const essentialRatio = budgetLimit > 0 ? (essentialTotal / budgetLimit) * 100 : 0;
    let essentialScore = 100;
    if (essentialRatio > 55) {
      essentialScore = Math.max(30, 100 - (essentialRatio - 55) * 2);
    }

    // 6. Investment Contribution (15% Weight)
    const investmentScore = Math.min(100, investmentContribution * 5); // 20% maps to 100

    // Weighted calculations
    const finalScore = Math.round(
      budgetScore * 0.25 +
      savingsScore * 0.20 +
      recurringScore * 0.10 +
      emergencyScore * 0.15 +
      essentialScore * 0.15 +
      investmentScore * 0.15
    );

    // Grade Determination
    let grade: SpendingHealthResult['grade'] = 'Average';
    if (finalScore >= 90) grade = 'Excellent';
    else if (finalScore >= 75) grade = 'Good';
    else if (finalScore >= 50) grade = 'Average';
    else if (finalScore >= 30) grade = 'Poor';
    else grade = 'Critical';

    // Build Strengths & Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (burnRate <= 80) {
      strengths.push('Excellent budget control');
    } else {
      weaknesses.push('Monthly budget is heavily depleted');
      suggestions.push('Review non-essential subscription accounts to return budget burn below 80%.');
    }

    if (savingsRatio >= 25) {
      strengths.push('Strong savings potential');
    } else {
      weaknesses.push('Savings margin is narrow');
      suggestions.push('Increase savings margin by deferring big impulse purchases.');
    }

    if (recurringRatio > 25) {
      weaknesses.push('High volume of recurring subscription costs');
      suggestions.push('Pause underutilized recurring accounts (OTT, gym) to free up ₹1,200/mo.');
    } else {
      strengths.push('Low fixed overhead costs');
    }

    if (emergencyProgress < 50) {
      weaknesses.push('Emergency reserve buffer is low');
      suggestions.push('Allocate 10% of next salary directly to your Emergency Fund.');
    } else {
      strengths.push('Solid emergency buffer progress');
    }

    return {
      score: finalScore,
      grade,
      strengths,
      weaknesses,
      suggestions,
      trend: finalScore >= 75 ? '+3' : '-1',
    };
  }
}
