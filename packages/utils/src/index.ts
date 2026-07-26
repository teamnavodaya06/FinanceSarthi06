import { CityTier, TaxCalculationResult, BudgetAllocation, FinancialHealthScore } from '@financesarthi/types';

/**
 * Format currency in Indian format (e.g. ₹1,50,000 or ₹1.5 Lakhs)
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null) return '₹0';
  
  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Indian Income Tax Calculator (Old vs New Regime)
 */
export function calculateIndianTax(
  monthlyIncome: number,
  deductions80C: number = 150000,
  deductions80D: number = 25000,
  hraExemption: number = 0,
  otherDeductions: number = 0
): TaxCalculationResult {
  const grossAnnual = monthlyIncome * 12;

  // New Regime (FY 2024-25 Budget)
  // Standard Deduction: ₹75,000
  const stdDeductionNew = 75000;
  const taxableNew = Math.max(0, grossAnnual - stdDeductionNew);

  let taxNew = 0;
  if (taxableNew <= 300000) {
    taxNew = 0;
  } else if (taxableNew <= 700000) {
    taxNew = (taxableNew - 300000) * 0.05;
  } else if (taxableNew <= 1000000) {
    taxNew = 20000 + (taxableNew - 700000) * 0.10;
  } else if (taxableNew <= 1200000) {
    taxNew = 50000 + (taxableNew - 1000000) * 0.15;
  } else if (taxableNew <= 1500000) {
    taxNew = 80000 + (taxableNew - 1200000) * 0.20;
  } else {
    taxNew = 140000 + (taxableNew - 1500000) * 0.30;
  }

  // Rebate under 87A for New Regime if taxable <= 700000
  if (taxableNew <= 700000) {
    taxNew = 0;
  }
  taxNew = taxNew * 1.04; // 4% Cess

  // Old Regime
  const stdDeductionOld = 50000;
  const totalOldDeductions = stdDeductionOld + Math.min(150000, deductions80C) + Math.min(50000, deductions80D) + hraExemption + otherDeductions;
  const taxableOld = Math.max(0, grossAnnual - totalOldDeductions);

  let taxOld = 0;
  if (taxableOld <= 250000) {
    taxOld = 0;
  } else if (taxableOld <= 500000) {
    taxOld = (taxableOld - 250000) * 0.05;
  } else if (taxableOld <= 1000000) {
    taxOld = 12500 + (taxableOld - 500000) * 0.20;
  } else {
    taxOld = 112500 + (taxableOld - 1000000) * 0.30;
  }

  if (taxableOld <= 500000) {
    taxOld = 0;
  }
  taxOld = taxOld * 1.04;

  const recommendedRegime = taxNew <= taxOld ? 'NEW' : 'OLD';
  const taxSaved = Math.abs(taxOld - taxNew);

  return {
    grossAnnual,
    taxableIncomeOld: taxableOld,
    taxableIncomeNew: taxableNew,
    taxAmountOld: Math.round(taxOld),
    taxAmountNew: Math.round(taxNew),
    recommendedRegime,
    taxSaved: Math.round(taxSaved),
    monthlyTakeHomeOld: Math.round((grossAnnual - taxOld) / 12),
    monthlyTakeHomeNew: Math.round((grossAnnual - taxNew) / 12),
  };
}

/**
 * 50-30-20 Allocation with Tier 1/2/3 adjustment
 */
export function calculate50_30_20(
  monthlyIncome: number,
  cityTier: CityTier = 'TIER_2'
): BudgetAllocation {
  let needsPct = 50;
  let wantsPct = 30;
  let savingsPct = 20;

  if (cityTier === 'METRO') {
    needsPct = 55; // Higher rent/transit in Metro cities
    wantsPct = 25;
    savingsPct = 20;
  } else if (cityTier === 'TIER_3' || cityTier === 'VILLAGE') {
    needsPct = 40; // Lower cost of living in Tier 3 / Village
    wantsPct = 30;
    savingsPct = 30; // Higher savings potential
  }

  const needsAmount = Math.round((monthlyIncome * needsPct) / 100);
  const wantsAmount = Math.round((monthlyIncome * wantsPct) / 100);
  const savingsAmount = Math.round((monthlyIncome * savingsPct) / 100);

  return {
    needs: { amount: needsAmount, percentage: needsPct },
    wants: { amount: wantsAmount, percentage: wantsPct },
    savings: { amount: savingsAmount, percentage: savingsPct },
    emergencyFundContribution: Math.round(savingsAmount * 0.4),
  };
}

/**
 * SIP Compound Growth Calculator with optional Step-Up
 */
export function calculateSIP(
  monthlyInvestment: number,
  expectedReturnRatePct: number,
  timePeriodYears: number,
  annualStepUpPct: number = 0
) {
  const months = timePeriodYears * 12;
  const monthlyRate = expectedReturnRatePct / 12 / 100;
  
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthlySIP = monthlyInvestment;

  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0 && annualStepUpPct > 0) {
      currentMonthlySIP += currentMonthlySIP * (annualStepUpPct / 100);
    }
    totalInvested += currentMonthlySIP;
    totalValue = (totalValue + currentMonthlySIP) * (1 + monthlyRate);
  }

  const wealthGain = totalValue - totalInvested;

  return {
    totalInvested: Math.round(totalInvested),
    totalValue: Math.round(totalValue),
    wealthGain: Math.round(wealthGain),
    futureMonthlySIP: Math.round(currentMonthlySIP),
  };
}

/**
 * Loan EMI & Amortization Calculator
 */
export function calculateEMI(
  principalAmount: number,
  annualInterestRatePct: number,
  tenureYears: number
) {
  const monthlyRate = annualInterestRatePct / 12 / 100;
  const months = tenureYears * 12;

  const emi =
    (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principalAmount;

  return {
    monthlyEmi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principalAmount,
  };
}

/**
 * Fixed Deposit Calculator (Quarterly Compounding)
 */
export function calculateFD(
  principal: number,
  annualRatePct: number,
  tenureYears: number
) {
  const compoundingFrequency = 4; // Quarterly in India
  const maturityAmount =
    principal * Math.pow(1 + annualRatePct / (100 * compoundingFrequency), compoundingFrequency * tenureYears);
  
  const interestEarned = maturityAmount - principal;

  return {
    principal,
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interestEarned),
  };
}

/**
 * Financial Health Score Engine (0 to 1000)
 */
export function calculateFinancialHealthScore(
  monthlyIncome: number,
  monthlySavings: number,
  monthlyDebtEmi: number,
  emergencyFundMonths: number,
  hasInsurance: boolean
): FinancialHealthScore {
  if (monthlyIncome <= 0) {
    return {
      score: 500,
      grade: 'FAIR',
      savingsRatioScore: 100,
      debtToIncomeScore: 100,
      emergencyFundScore: 100,
      investmentDiversityScore: 100,
      insights: ['Set up your monthly income profile to get an accurate financial health score.'],
    };
  }

  // 1. Savings Ratio (Target >= 20-30%) -> Max 300 pts
  const savingsRatio = (monthlySavings / monthlyIncome) * 100;
  const savingsScore = Math.min(300, Math.round((savingsRatio / 30) * 300));

  // 2. Debt to Income Ratio (Target <= 30%) -> Max 250 pts
  const dtiRatio = (monthlyDebtEmi / monthlyIncome) * 100;
  const dtiScore = dtiRatio <= 30 ? 250 : Math.max(0, Math.round(250 - (dtiRatio - 30) * 5));

  // 3. Emergency Fund Coverage (Target >= 6 months) -> Max 250 pts
  const efScore = Math.min(250, Math.round((emergencyFundMonths / 6) * 250));

  // 4. Insurance & Protection -> Max 200 pts
  const insuranceScore = hasInsurance ? 200 : 50;

  const totalScore = savingsScore + dtiScore + efScore + insuranceScore;

  let grade: FinancialHealthScore['grade'] = 'POOR';
  if (totalScore >= 850) grade = 'ELITE';
  else if (totalScore >= 750) grade = 'EXCELLENT';
  else if (totalScore >= 650) grade = 'GOOD';
  else if (totalScore >= 500) grade = 'FAIR';

  const insights: string[] = [];
  if (savingsRatio < 20) insights.push('Increase savings rate to at least 20% of your net monthly income.');
  if (dtiRatio > 35) insights.push('High DTI ratio (>35%). Consider debt consolidation or loan prepayment.');
  if (emergencyFundMonths < 6) insights.push(`Emergency fund covers ${emergencyFundMonths} months. Aim for at least 6 months.`);
  if (!hasInsurance) insights.push('Get a comprehensive term life and health insurance policy to protect your family.');
  if (totalScore >= 800) insights.push('Outstanding financial discipline! You are in the top 5% of earners in your bracket.');

  return {
    score: totalScore,
    grade,
    savingsRatioScore: savingsScore,
    debtToIncomeScore: dtiScore,
    emergencyFundScore: efScore,
    investmentDiversityScore: insuranceScore,
    insights,
  };
}
