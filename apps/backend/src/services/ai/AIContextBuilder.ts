import { dashboardAggregationService } from '../dashboard-aggregation.service';

export class AIContextBuilder {
  async buildFinancialContext(userId: string): Promise<string> {
    try {
      const data = await dashboardAggregationService.getAggregatedDashboard(userId);
      
      const summaryText = `
[FINANCIAL PROFILE CONTEXT]
- Monthly Inflows (Income): ₹${data.summary.monthlyIncome}
- Monthly Outflows (Expenses): ₹${data.summary.monthlyExpenses}
- Net Surplus/Remaining Cash: ₹${data.summary.remainingCash}
- Current Month Savings Rate: ${data.summary.savingsRate.toFixed(1)}%
- Active Budget Limit: ₹${data.budget.monthlyBudget} (Remaining: ₹${data.budget.remainingBudget})
- Current Financial Health Score: ${data.summary.financialHealthScore}/100 (Grade: ${data.financialHealth.grade})
- Net Worth Summary: Assets total ₹${data.netWorth.assets} vs Liabilities total ₹${data.netWorth.liabilities} (Net Worth: ₹${data.netWorth.netWorth})

[ACTIVE FINANCIAL GOALS]
${data.goals.map(g => `- ${g.title} (${g.category}): Progress ${g.completionPercentage}% of ₹${g.targetAmount} (Remaining: ₹${g.remainingAmount}, Est. Completion: ${g.estimatedCompletionDate})`).join('\n')}

[INVESTMENT ALLOCATIONS]
- Total Investments Active Value: ₹${data.investments.totalInvestment}
${data.investments.allocations.map(a => `  * ${a.name} (${a.category}): ₹${a.value}`).join('\n')}
`;
      return summaryText;
    } catch (err) {
      console.error('Failed to build financial context logs:', err);
      return '[Context Fetch Failure] User has no active profiles registered.';
    }
  }
}
export const aiContextBuilder = new AIContextBuilder();
