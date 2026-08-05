export interface IncomeSummaryPayload {
  summary: {
    monthlyIncome: number;
    annualIncome: number;
    additionalIncome: number;
    totalAnnualIncome: number;
    averageMonthlyIncome: number;
    savingsPotential: number;
    savingsPercentage: number;
    expenseRatio: number;
    emergencyFund: {
      current: number;
      target: number;
      gap: number;
      progress: number;
    };
    recommendedSip: {
      monthlySip: number;
      annualInvestment: number;
      expectedWealth10Years: number;
    };
    incomeCategory: string;
    investmentCapacity: 'Low' | 'Medium' | 'High';
    riskProfile: string;
    taxRegime: string;
  };
  healthScore: {
    score: number;
    grade: 'Excellent' | 'Good' | 'Average' | 'Poor';
    explanation: string;
  };
  aiInsights: string[];
  charts: {
    budgetSplit: { name: string; value: number }[];
    cashFlow: { stage: string; value: number }[];
    categoryDistribution: { source: string; amount: number }[];
    futureProjections: { year: number; savings: number; investments: number; netWorth: number }[];
  };
}

export class IncomeCalculationService {
  public calculateSummary(
    income: any,
    expensesList: { amount: number }[] = [],
    goalsList: { category: string; currentAmount: number; targetAmount: number }[] = [],
    currentNetWorth = 50000
  ): IncomeSummaryPayload {
    const monthlyIncome = income.monthlyIncome ?? 0;
    const bonusIncome = income.bonusIncome ?? 0;
    const freelanceIncome = income.freelanceIncome ?? 0;
    const rentalIncome = income.rentalIncome ?? 0;
    const investmentIncome = income.investmentIncome ?? 0;
    const otherIncome = income.otherIncome ?? 0;
    const cityCategory = income.cityCategory ?? 'Tier2';
    const employmentType = income.employmentType ?? 'Private';
    const riskProfile = income.riskProfile ?? 'Balanced';
    const taxRegime = income.taxRegime ?? 'New';

    const annualIncome = monthlyIncome * 12;
    const additionalIncome = bonusIncome + freelanceIncome + rentalIncome + investmentIncome + otherIncome;
    const totalAnnualIncome = annualIncome + additionalIncome;
    const averageMonthlyIncome = Math.round(totalAnnualIncome / 12);

    let expensesAmount = expensesList.reduce((sum, e) => sum + e.amount, 0);
    if (expensesAmount <= 0) {
      const expensePcts: Record<string, number> = { Metro: 0.6, Tier1: 0.5, Tier2: 0.45, Tier3: 0.4, Rural: 0.35 };
      expensesAmount = Math.round(monthlyIncome * (expensePcts[cityCategory] || 0.45));
    }

    const savingsPotential = Math.max(0, averageMonthlyIncome - expensesAmount);
    const savingsPercentage = averageMonthlyIncome > 0 ? Math.round((savingsPotential / averageMonthlyIncome) * 100) : 0;
    const expenseRatio = averageMonthlyIncome > 0 ? Math.round((expensesAmount / averageMonthlyIncome) * 100) : 0;

    const emergencyTarget = expensesAmount * 6;
    const emergencyCurrent = goalsList
      .filter(g => g.category === 'EMERGENCY_FUND')
      .reduce((sum, g) => sum + g.currentAmount, 0);
    const emergencyGap = Math.max(0, emergencyTarget - emergencyCurrent);
    const emergencyProgress = emergencyTarget > 0 ? Math.min(100, Math.round((emergencyCurrent / emergencyTarget) * 100)) : 100;

    const monthlySip = Math.round(averageMonthlyIncome * 0.20);
    const annualInvestment = monthlySip * 12;
    
    const expectedReturnRate = 0.12;
    const months = 120;
    const monthlyRate = expectedReturnRate / 12;
    const expectedWealth10Years = Math.round(
      monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
    );

    let incomeCategory = 'Middle Income';
    if (monthlyIncome < 20000) {
      incomeCategory = 'Low Income';
    } else if (monthlyIncome >= 20000 && monthlyIncome < 50000) {
      incomeCategory = 'Middle Income';
    } else if (monthlyIncome >= 50000 && monthlyIncome < 100000) {
      incomeCategory = 'Upper Middle';
    } else {
      incomeCategory = 'High Income';
    }

    const investmentCapacity = savingsPercentage >= 30 ? 'High' : savingsPercentage >= 15 ? 'Medium' : 'Low';

    let stabilityScore = 150;
    if (employmentType === 'Government') stabilityScore = 200;
    else if (employmentType === 'Private') stabilityScore = 180;
    else if (employmentType === 'Self Employed') stabilityScore = 160;
    else if (employmentType === 'Business Owner') stabilityScore = 160;
    else if (employmentType === 'Contract') stabilityScore = 120;

    const savingsScore = Math.min(300, savingsPercentage * 3);
    const debtRatioScore = Math.max(0, 200 - (expenseRatio > 50 ? (expenseRatio - 50) * 4 : 0));
    const efScore = Math.round((emergencyProgress / 100) * 200);
    const investmentScore = monthlySip > 0 ? 100 : 0;
    const rawScore = stabilityScore + savingsScore + debtRatioScore + efScore + investmentScore;
    const finalScore = Math.min(1000, Math.max(100, rawScore));

    let grade: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Average';
    let explanation = '';
    if (finalScore >= 800) {
      grade = 'Excellent';
      explanation = 'Your financial health is in an elite state. You maintain a high savings rate, strong emergency cushions, and a highly stable occupation profile.';
    } else if (finalScore >= 600) {
      grade = 'Good';
      explanation = 'Your financial metrics are robust. You save a healthy share of your cash flow and have moderate coverage buffers, though optimization is possible.';
    } else if (finalScore >= 400) {
      grade = 'Average';
      explanation = 'Your indicators are stable but raise alerts. Consider minimizing discretionary expenses to allocate more savings toward building your 6-month buffer.';
    } else {
      grade = 'Poor';
      explanation = 'Your financial score is in a vulnerable state. High spending velocity or low savings buffers pose significant risk. Seek to minimize discretionary leakage.';
    }

    const aiInsights: string[] = [];
    if (savingsPercentage < 20) {
      aiInsights.push(`Your savings rate is only ${savingsPercentage}%. Try to automate investments to reach the recommended target of 20%.`);
    } else {
      aiInsights.push(`Great job! Your savings rate of ${savingsPercentage}% meets or exceeds standard financial guidelines.`);
    }

    if (emergencyProgress < 100) {
      const monthsCovered = Math.round((emergencyCurrent / (expensesAmount || 1)) * 10) / 10;
      aiInsights.push(`Emergency fund covers only ${monthsCovered} months of expenses. Allocate ₹${emergencyGap.toLocaleString('en-IN')} more to achieve your 6-month target.`);
    } else {
      aiInsights.push('Superb! Your emergency fund is fully funded with at least 6 months of expenses.');
    }

    if (expenseRatio > 60) {
      aiInsights.push(`Expenses consume ${expenseRatio}% of income. Reduce non-essential discretionary wants to release savings capacity.`);
    }

    if (taxRegime === 'Old' && totalAnnualIncome > 700000) {
      aiInsights.push('Based on your earnings bracket, switching to the New Tax Regime might minimize tax liabilities.');
    }

    if (riskProfile === 'Aggressive') {
      aiInsights.push(`As an Aggressive investor, allocate at least 70% of your ₹${monthlySip.toLocaleString('en-IN')} SIP to diversified index and mid-cap equity mutual funds.`);
    } else if (riskProfile === 'Conservative') {
      aiInsights.push(`As a Conservative investor, prioritize high-quality debt instruments, sovereign gold bonds, and fixed income for your ₹${monthlySip.toLocaleString('en-IN')} investments.`);
    }

    const budgetSplit = [
      { name: 'Needs', value: Math.round(averageMonthlyIncome * 0.50) },
      { name: 'Wants', value: Math.round(averageMonthlyIncome * 0.30) },
      { name: 'Savings', value: Math.round(averageMonthlyIncome * 0.20) },
    ];

    const cashFlow = [
      { stage: 'Total Inflow', value: averageMonthlyIncome },
      { stage: 'Expenses Outflow', value: expensesAmount },
      { stage: 'Savings Potential', value: savingsPotential },
      { stage: 'Recommended SIP', value: monthlySip },
      { stage: 'Remaining Cash', value: Math.max(0, savingsPotential - monthlySip) },
    ];

    const categoryDistribution = [
      { source: 'Base Salary', amount: monthlyIncome },
      { source: 'Bonus / Incentives', amount: bonusIncome },
      { source: 'Freelance revenue', amount: freelanceIncome },
      { source: 'Rental receipts', amount: rentalIncome },
      { source: 'Investments yields', amount: investmentIncome },
      { source: 'Other sources', amount: otherIncome },
    ].filter(src => src.amount > 0);

    const futureProjections = [1, 3, 5, 10].map(yr => {
      const projectionMonths = yr * 12;
      const compoundValue = Math.round(
        monthlySip * ((Math.pow(1 + monthlyRate, projectionMonths) - 1) / monthlyRate) * (1 + monthlyRate)
      );
      const rawSavings = savingsPotential * 12 * yr;
      return {
        year: yr,
        savings: rawSavings,
        investments: compoundValue,
        netWorth: currentNetWorth + rawSavings + compoundValue,
      };
    });

    return {
      summary: {
        monthlyIncome,
        annualIncome,
        additionalIncome,
        totalAnnualIncome,
        averageMonthlyIncome,
        savingsPotential,
        savingsPercentage,
        expenseRatio,
        emergencyFund: {
          current: emergencyCurrent,
          target: emergencyTarget,
          gap: emergencyGap,
          progress: emergencyProgress,
        },
        recommendedSip: {
          monthlySip,
          annualInvestment,
          expectedWealth10Years,
        },
        incomeCategory,
        investmentCapacity,
        riskProfile,
        taxRegime,
      },
      healthScore: {
        score: finalScore,
        grade,
        explanation,
      },
      aiInsights,
      charts: {
        budgetSplit,
        cashFlow,
        categoryDistribution,
        futureProjections,
      },
    };
  }
}
export const incomeCalculationService = new IncomeCalculationService();
