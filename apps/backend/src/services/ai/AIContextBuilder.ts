import { dashboardAggregationService } from '../dashboard-aggregation.service';

export class AIContextBuilder {
  async buildFinancialContext(userId: string, overrideIncome?: number): Promise<string> {
    try {
      const data = await dashboardAggregationService.getAggregatedDashboard(userId);
      const monthlyIncome = (overrideIncome && overrideIncome > 0) ? overrideIncome : data.summary.monthlyIncome;
      const monthlyExpenses = data.summary.monthlyExpenses;
      const remainingCash = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? (remainingCash / monthlyIncome) * 100 : 0;
      
      const summaryText = `
[FINANCIAL PROFILE CONTEXT]
- Monthly Inflows (Income): ₹${monthlyIncome}
- Monthly Outflows (Expenses): ₹${monthlyExpenses}
- Net Surplus/Remaining Cash: ₹${remainingCash}
- Current Month Savings Rate: ${savingsRate.toFixed(1)}%
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
      const incomeVal = overrideIncome || 45000;
      return `[FINANCIAL PROFILE CONTEXT]
- Monthly Inflows (Income): ₹${incomeVal}
- Monthly Outflows (Expenses): ₹0
- Net Surplus/Remaining Cash: ₹${incomeVal}
- Current Month Savings Rate: 100.0%
`;
    }
  }
}
export const aiContextBuilder = new AIContextBuilder();
