"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeCalculationService = exports.IncomeCalculationService = void 0;
class IncomeCalculationService {
    calculateSummary(income, expensesList = [], goalsList = [], currentNetWorth = 50000) {
        // 1. Inputs mapping
        const monthlyIncome = income.monthlyIncome;
        const bonusIncome = income.bonusIncome;
        const freelanceIncome = income.freelanceIncome;
        const rentalIncome = income.rentalIncome;
        const investmentIncome = income.investmentIncome;
        const otherIncome = income.otherIncome;
        const cityCategory = income.cityCategory;
        const employmentType = income.employmentType;
        const riskProfile = income.riskProfile;
        const taxRegime = income.taxRegime;
        // 2. Calculations
        const annualIncome = monthlyIncome * 12;
        const additionalIncome = bonusIncome + freelanceIncome + rentalIncome + investmentIncome + otherIncome;
        const totalAnnualIncome = annualIncome + additionalIncome;
        const averageMonthlyIncome = Math.round(totalAnnualIncome / 12);
        // Expenses Estimation or actual
        let expensesAmount = expensesList.reduce((sum, e) => sum + e.amount, 0);
        let isEstimatedExpenses = false;
        if (expensesAmount <= 0) {
            isEstimatedExpenses = true;
            const expensePcts = { Metro: 0.6, Tier1: 0.5, Tier2: 0.45, Tier3: 0.4, Rural: 0.35 };
            expensesAmount = Math.round(monthlyIncome * (expensePcts[cityCategory] || 0.45));
        }
        // Savings Potential
        const savingsPotential = Math.max(0, averageMonthlyIncome - expensesAmount);
        const savingsPercentage = averageMonthlyIncome > 0 ? Math.round((savingsPotential / averageMonthlyIncome) * 100) : 0;
        const expenseRatio = averageMonthlyIncome > 0 ? Math.round((expensesAmount / averageMonthlyIncome) * 100) : 0;
        // Emergency Fund Gaps
        const emergencyTarget = expensesAmount * 6;
        const emergencyCurrent = goalsList
            .filter(g => g.category === 'EMERGENCY_FUND')
            .reduce((sum, g) => sum + g.currentAmount, 0);
        const emergencyGap = Math.max(0, emergencyTarget - emergencyCurrent);
        const emergencyProgress = emergencyTarget > 0 ? Math.min(100, Math.round((emergencyCurrent / emergencyTarget) * 100)) : 100;
        // Recommended SIP
        const monthlySip = Math.round(averageMonthlyIncome * 0.20);
        const annualInvestment = monthlySip * 12;
        // Expected Wealth (10 Years at 12% compound monthly returns)
        // Formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
        const expectedReturnRate = 0.12;
        const months = 120;
        const monthlyRate = expectedReturnRate / 12;
        const expectedWealth10Years = Math.round(monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
        // Classification
        let incomeCategory = 'Middle Income';
        if (monthlyIncome < 20000) {
            incomeCategory = 'Low Income';
        }
        else if (monthlyIncome >= 20000 && monthlyIncome < 50000) {
            incomeCategory = 'Middle Income';
        }
        else if (monthlyIncome >= 50000 && monthlyIncome < 100000) {
            incomeCategory = 'Upper Middle';
        }
        else {
            incomeCategory = 'High Income';
        }
        const investmentCapacity = savingsPercentage >= 30 ? 'High' : savingsPercentage >= 15 ? 'Medium' : 'Low';
        // 3. Health Score (0-1000)
        let stabilityScore = 150;
        if (employmentType === 'Government')
            stabilityScore = 200;
        else if (employmentType === 'Private')
            stabilityScore = 180;
        else if (employmentType === 'Self Employed')
            stabilityScore = 160;
        else if (employmentType === 'Business Owner')
            stabilityScore = 160;
        else if (employmentType === 'Contract')
            stabilityScore = 120;
        const savingsScore = Math.min(300, savingsPercentage * 3);
        const debtRatioScore = Math.max(0, 200 - (expenseRatio > 50 ? (expenseRatio - 50) * 4 : 0));
        const efScore = Math.round((emergencyProgress / 100) * 200);
        const investmentScore = monthlySip > 0 ? 100 : 0;
        const rawScore = stabilityScore + savingsScore + debtRatioScore + efScore + investmentScore;
        const finalScore = Math.min(1000, Math.max(100, rawScore));
        let grade = 'Average';
        let explanation = '';
        if (finalScore >= 800) {
            grade = 'Excellent';
            explanation = 'Your financial health is in an elite state. You maintain a high savings rate, strong emergency cushions, and a highly stable occupation profile.';
        }
        else if (finalScore >= 600) {
            grade = 'Good';
            explanation = 'Your financial metrics are robust. You save a healthy share of your cash flow and have moderate coverage buffers, though optimization is possible.';
        }
        else if (finalScore >= 400) {
            grade = 'Average';
            explanation = 'Your indicators are stable but raise alerts. Consider minimizing discretionary expenses to allocate more savings toward building your 6-month buffer.';
        }
        else {
            grade = 'Poor';
            explanation = 'Your financial score is in a vulnerable state. High spending velocity or low savings buffers pose significant risk. Seek to minimize discretionary leakage.';
        }
        // 4. AI Insights
        const aiInsights = [];
        if (savingsPercentage < 20) {
            aiInsights.push(`Your savings rate is only ${savingsPercentage}%. Try to automate investments to reach the recommended target of 20%.`);
        }
        else {
            aiInsights.push(`Great job! Your savings rate of ${savingsPercentage}% meets or exceeds standard financial guidelines.`);
        }
        if (emergencyProgress < 100) {
            const monthsCovered = Math.round((emergencyCurrent / (expensesAmount || 1)) * 10) / 10;
            aiInsights.push(`Emergency fund covers only ${monthsCovered} months of expenses. Allocate ₹${emergencyGap.toLocaleString('en-IN')} more to achieve your 6-month target.`);
        }
        else {
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
        }
        else if (riskProfile === 'Conservative') {
            aiInsights.push(`As a Conservative investor, prioritize high-quality debt instruments, sovereign gold bonds, and fixed income for your ₹${monthlySip.toLocaleString('en-IN')} investments.`);
        }
        // 5. Chart Data
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
        // Compounding Projections (12% CAGR CAGR calculation for years 1, 3, 5, 10)
        const futureProjections = [1, 3, 5, 10].map(yr => {
            const projectionMonths = yr * 12;
            const compoundValue = Math.round(monthlySip * ((Math.pow(1 + monthlyRate, projectionMonths) - 1) / monthlyRate) * (1 + monthlyRate));
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
exports.IncomeCalculationService = IncomeCalculationService;
exports.incomeCalculationService = new IncomeCalculationService();
