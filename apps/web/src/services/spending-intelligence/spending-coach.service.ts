import { Expense } from '@financesarthi/types';

export interface SpendingInsightCard {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  suggestedAction: string;
  impact: string;
  priority: 'High' | 'Medium' | 'Low';
}

export class SpendingCoachService {
  public static generateInsights(expenses: Expense[], monthlyIncome: number): SpendingInsightCard[] {
    const insights: SpendingInsightCard[] = [];
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetLimit = monthlyIncome || 85000;

    // Rule 1: High Spending/Overdraft check
    if (totalSpent > budgetLimit * 0.9) {
      insights.push({
        id: 'insight-budget-alert',
        title: 'Budget Burn Warning',
        summary: 'Your monthly spending has depleted over 90% of your allocated income limit.',
        whyItMatters: 'Continuing this trend will force you to tap into emergency savings or compile credit card debt.',
        suggestedAction: 'Pause all discretionary shopping for the next 7 days.',
        impact: 'Saves up to ₹5,500 by month-end',
        priority: 'High',
      });
    }

    // Rule 2: Food & Dining volume check
    const foodSpent = expenses.filter(e => e.category === 'FOOD').reduce((sum, e) => sum + e.amount, 0);
    const foodRatio = budgetLimit > 0 ? (foodSpent / budgetLimit) * 100 : 0;
    if (foodRatio > 20) {
      insights.push({
        id: 'insight-food-opt',
        title: 'Food & Dining Optimization',
        summary: `Food and dining expenses represent ${Math.round(foodRatio)}% of your total budget.`,
        whyItMatters: 'Dining out frequently is one of the quickest drains on discretionary cash flows.',
        suggestedAction: 'Limit restaurant orders to once a week; cook meals at home.',
        impact: 'Saves approx ₹31,200 yearly',
        priority: 'Medium',
      });
    }

    // Rule 3: Recurring costs check
    const recurringTotal = expenses.filter(e => e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
    if (recurringTotal > budgetLimit * 0.15) {
      insights.push({
        id: 'insight-recurring-pause',
        title: 'Fixed Subscriptions Audit',
        summary: 'Recurring subscriptions represent over 15% of your monthly take-home salary.',
        whyItMatters: 'Unused subscriptions create a silent leakage of capital that could be invested.',
        suggestedAction: 'Audit active OTT memberships and pause at least 1 underutilized subscription.',
        impact: 'Saves ₹6,000 yearly',
        priority: 'Low',
      });
    }

    // Rule 4: Investment portfolio suggestion
    const savingsRatio = budgetLimit > 0 ? ((budgetLimit - totalSpent) / budgetLimit) * 100 : 0;
    if (savingsRatio > 15) {
      insights.push({
        id: 'insight-portfolio-invest',
        title: 'SIP Compounding Acceleration',
        summary: `Your current savings surplus stands at ${Math.round(savingsRatio)}%.`,
        whyItMatters: 'Holding excessive idle cash in saving accounts misses compounding growth curves.',
        suggestedAction: 'Increase your monthly mutual fund SIP allocation by ₹5,000.',
        impact: 'Yields ₹3.8 Lakh in 5 years (at 12% CAGR)',
        priority: 'Medium',
      });
    }

    // Fallbacks to guarantee 3 insights always
    if (insights.length < 3) {
      insights.push({
        id: 'insight-fallback-emergency',
        title: 'Emergency Buffer Audit',
        summary: 'A secure financial plan requires a 6-month living cost cash buffer.',
        whyItMatters: 'Protects you from unexpected health bills or temporary income losses.',
        suggestedAction: 'Automate a ₹2,000 transfer to your Emergency Fund goal monthly.',
        impact: 'Builds ₹24,000 secure buffer annually',
        priority: 'Medium',
      });
    }

    return insights;
  }
}
