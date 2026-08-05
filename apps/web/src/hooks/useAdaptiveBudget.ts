import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AdaptiveBudgetHealth, 
  ScenarioSimulationInput, 
  ScenarioSimulationResult 
} from '@financesarthi/types';
import { adaptiveBudgetApi } from '../api/adaptiveBudgetApi';
import { useFinancial } from '../context/FinancialContext';

// =========================================================================
// LOCAL ENGINE HELPERS
// =========================================================================

export function calculateLocalHealthScore(
  expenses: any[],
  incomeData: any,
  goals: any[],
  budgets: any[],
  liabilities: any[],
  assets: any[]
): AdaptiveBudgetHealth {
  const salary = incomeData?.monthlyIncome || 75000;
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const spent = activeExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // 1. Adherence / Compliance (0 to 30 points)
  const budgetLimit = budgets.length > 0 ? budgets[0].totalBudget : salary;
  const complianceRatio = budgetLimit > 0 ? spent / budgetLimit : 0.5;
  let complianceScore = 30;
  if (complianceRatio > 1.0) {
    complianceScore = Math.max(0, 30 - (complianceRatio - 1.0) * 100);
  } else if (complianceRatio > 0.8) {
    complianceScore = 30 - (complianceRatio - 0.8) * 50;
  }

  // 2. Savings Rate (0 to 25 points)
  const surplus = Math.max(0, salary - spent);
  const savingsRate = salary > 0 ? (surplus / salary) * 100 : 0;
  let savingsScore = 0;
  if (savingsRate >= 20) {
    savingsScore = 25;
  } else if (savingsRate > 0) {
    savingsScore = (savingsRate / 20) * 25;
  }

  // 3. Emergency Fund status (0 to 20 points)
  const efGoal = goals.find(g => g.title?.toLowerCase().includes('emergency'));
  let efScore = 0;
  if (efGoal) {
    const target = efGoal.targetAmount || (salary * 6);
    const saved = efGoal.currentAmount || 0;
    efScore = target > 0 ? Math.min(20, (saved / target) * 20) : 20;
  } else {
    efScore = surplus > 0 ? 10 : 0;
  }

  // 4. Needs vs Wants ratio compliance (0 to 15 points)
  const needsSpent = activeExpenses
    .filter(e => ['HOUSING', 'UTILITIES', 'DEBT_EMI'].includes(e.category))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const wantsSpent = activeExpenses
    .filter(e => ['FOOD', 'SHOPPING', 'ENTERTAINMENT'].includes(e.category))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const needsRatio = salary > 0 ? needsSpent / salary : 0;
  const wantsRatio = salary > 0 ? wantsSpent / salary : 0;

  let ratioScore = 15;
  if (needsRatio > 0.6) ratioScore -= (needsRatio - 0.6) * 30;
  if (wantsRatio > 0.4) ratioScore -= (wantsRatio - 0.4) * 30;
  ratioScore = Math.max(0, ratioScore);

  // 5. Debt Burden (0 to 10 points)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
  let debtScore = 10;
  if (debtRatio > 0.5) {
    debtScore = Math.max(0, 10 - (debtRatio - 0.5) * 20);
  }

  const score = Math.round(complianceScore + savingsScore + efScore + ratioScore + debtScore);
  const boundedScore = Math.max(0, Math.min(100, score));

  const grade = 
    boundedScore >= 90 ? 'Excellent' :
    boundedScore >= 75 ? 'Good' :
    boundedScore >= 60 ? 'Average' :
    boundedScore >= 45 ? 'Needs Attention' : 'Critical';

  const insights = [];
  if (boundedScore < 50) {
    insights.push('High spent relative to budget limits. Focus on curtailing luxury wants spending.');
  } else if (boundedScore < 75) {
    insights.push('Good progress! Increasing emergency fund contributions will lift your overall safety rating.');
  } else {
    insights.push('Excellent financial safety rating! Maintain consistent savings allocations.');
  }

  const adherence = Math.round(complianceRatio * 100);

  return {
    score: boundedScore,
    grade: grade as any,
    adherenceRating: Math.max(0, 100 - Math.abs(100 - adherence)),
    savingsConsistency: 92,
    overspendingFrequency: spent > budgetLimit ? 1 : 0,
    insights,
  };
}

export function generateLocalRecommendations(
  expenses: any[],
  incomeData: any,
  goals: any[],
  budgets: any[],
  liabilities: any[]
): any[] {
  const salary = incomeData?.monthlyIncome || 75000;
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const spent = activeExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const surplus = Math.max(0, salary - spent);

  const list: any[] = [];

  // 1. Food check
  const foodSpent = activeExpenses
    .filter(e => e.category === 'FOOD')
    .reduce((acc, curr) => acc + curr.amount, 0);
  if (foodSpent > salary * 0.15) {
    list.push({
      id: 'rec-food-high',
      summary: 'High Food & Dining Spending',
      reason: `Your food and dining expenses are ₹${foodSpent.toLocaleString('en-IN')}, which is ${Math.round((foodSpent / salary) * 100)}% of your monthly income.`,
      financialImpact: Math.round(foodSpent * 0.25),
      suggestedAction: 'Reduce eating out by 25% and cook at home to build a surplus envelope.',
      priority: 'MEDIUM',
      confidence: 0.92,
    });
  }

  // 2. Emergency fund check
  const efGoal = goals.find(g => g.title?.toLowerCase().includes('emergency'));
  const targetEFAmount = salary * 6;
  const currentEFAmount = efGoal?.currentAmount || 0;
  if (!efGoal || currentEFAmount < targetEFAmount) {
    list.push({
      id: 'rec-emergency-buffer',
      summary: 'Emergency safety net below target',
      reason: efGoal
        ? `Your emergency fund has ₹${currentEFAmount.toLocaleString('en-IN')}, which is below your safety goal of ₹${targetEFAmount.toLocaleString('en-IN')}.`
        : `No Emergency Fund goal detected. We recommend building a 6-month salary safety buffer of ₹${(salary * 6).toLocaleString('en-IN')}.`,
      financialImpact: Math.round(salary * 0.1),
      suggestedAction: 'Redirect ₹5,000 monthly from lifestyle spending to Emergency Savings.',
      priority: 'HIGH',
      confidence: 0.95,
    });
  }

  // 3. Rent check
  const rentSpent = activeExpenses
    .filter(e => e.category === 'HOUSING')
    .reduce((acc, curr) => acc + curr.amount, 0);
  if (rentSpent > salary * 0.35) {
    list.push({
      id: 'rec-rent-high',
      summary: 'Housing cost exceeds 35%',
      reason: `Your housing and rent expenses are ₹${rentSpent.toLocaleString('en-IN')}, exceeding the recommended 30% financial stability limit.`,
      financialImpact: Math.round(rentSpent * 0.1),
      suggestedAction: 'Look into refinancing housing loans, renegotiating lease, or utility sharing.',
      priority: 'HIGH',
      confidence: 0.88,
    });
  }

  // 4. Surplus check
  if (surplus > 5000) {
    list.push({
      id: 'rec-surplus-invest',
      summary: 'Optimize Unallocated Cash Surplus',
      reason: `You have an unallocated monthly surplus of ₹${surplus.toLocaleString('en-IN')} lying idle in cash.`,
      financialImpact: Math.round(surplus * 0.8),
      suggestedAction: 'Increase your monthly SIP allocations by ₹5,000 into high-yield diversified funds.',
      priority: 'MEDIUM',
      confidence: 0.94,
    });
  }

  // 5. Shopping check
  const shoppingSpent = activeExpenses
    .filter(e => e.category === 'SHOPPING')
    .reduce((acc, curr) => acc + curr.amount, 0);
  if (shoppingSpent > salary * 0.1) {
    list.push({
      id: 'rec-shopping-high',
      summary: 'Reduce Discretionary Shopping',
      reason: `Shopping expenses reached ₹${shoppingSpent.toLocaleString('en-IN')}, which is higher than safety thresholds.`,
      financialImpact: Math.round(shoppingSpent * 0.3),
      suggestedAction: 'Pause non-essential purchase items for 30 days or setup strict sub-envelopes.',
      priority: 'LOW',
      confidence: 0.85,
    });
  }

  return list;
}

export function runLocalSimulation(
  input: ScenarioSimulationInput,
  expenses: any[],
  goals: any[],
  liabilities: any[]
): any {
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const currentSpentWithoutHousing = activeExpenses
    .filter(e => e.category !== 'HOUSING')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const proposedIncome = input.salary;
  const proposedRent = input.rent;
  const proposedCarEmi = input.carPurchaseEmi;
  const proposedSipIncrease = input.sipIncrease;

  const proposedSpent = proposedRent + currentSpentWithoutHousing + proposedCarEmi + proposedSipIncrease;
  const monthlySavings = Math.max(0, proposedIncome - proposedRent - currentSpentWithoutHousing - proposedCarEmi);
  const surplus = Math.max(0, proposedIncome - proposedSpent);
  
  const cashFlowRatio = proposedIncome > 0 ? (monthlySavings / proposedIncome) * 100 : 0;

  // Compound interest calculation for 10-year wealth projection (12% CAGR, compounded monthly)
  const monthlyRate = 0.12 / 12;
  const months = 10 * 12;
  let simulatedWealthTenYears = 0;
  for (let i = 0; i < months; i++) {
    simulatedWealthTenYears = (simulatedWealthTenYears + monthlySavings) * (1 + monthlyRate);
  }

  // Years Net Worth timeline (1 to 5 years)
  const projectedNetWorthYears = [1, 2, 3, 4, 5].map(y => {
    let yearSavings = 0;
    const yearMonths = y * 12;
    for (let i = 0; i < yearMonths; i++) {
      yearSavings = (yearSavings + monthlySavings) * (1 + monthlyRate);
    }
    return {
      year: y,
      value: Math.round(yearSavings)
    };
  });

  // Calculate Emergency Fund Timeline (months)
  const targetEFAmount = proposedIncome * 6;
  const efGoal = goals.find(g => g.title?.toLowerCase().includes('emergency'));
  const currentEFAmount = efGoal?.currentAmount || 0;
  const efGap = Math.max(0, targetEFAmount - currentEFAmount);
  const efMonthlyAllocation = monthlySavings * 0.3;
  const efMonthsToComplete = efMonthlyAllocation > 0 ? Math.ceil(efGap / efMonthlyAllocation) : 999;

  // Budget Health Score simulated recalculation
  const emiRatio = proposedIncome > 0 ? proposedCarEmi / proposedIncome : 0;
  const complianceRatio = proposedIncome > 0 ? proposedSpent / proposedIncome : 1.0;
  
  let complianceScore = 35;
  if (complianceRatio > 1.0) {
    complianceScore = Math.max(0, 35 - (complianceRatio - 1.0) * 120);
  } else if (complianceRatio > 0.8) {
    complianceScore = 35 - (complianceRatio - 0.8) * 60;
  }

  let savingsScore = 0;
  if (cashFlowRatio >= 20) {
    savingsScore = 30;
  } else if (cashFlowRatio > 0) {
    savingsScore = (cashFlowRatio / 20) * 30;
  }

  const emiScore = emiRatio < 0.4 ? 35 : Math.max(0, 35 - (emiRatio - 0.4) * 150);

  const budgetScore = Math.round(complianceScore + savingsScore + emiScore);
  const boundedScore = Math.max(0, Math.min(100, budgetScore));

  const activeGoal = goals.find(g => !g.isCompleted && !g.title?.toLowerCase().includes('emergency'));
  let goalMonthsToComplete = 999;
  if (activeGoal) {
    const gap = Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount);
    const goalAllocation = monthlySavings * 0.4;
    goalMonthsToComplete = goalAllocation > 0 ? Math.ceil(gap / goalAllocation) : 999;
  }

  const suggestions: string[] = [];
  if (proposedRent > proposedIncome * 0.35) {
    suggestions.push(`High Rent Alert: Refinancing or relocation would cut rent to ₹${Math.round(proposedIncome * 0.25).toLocaleString('en-IN')} saving ₹${Math.round(proposedRent - (proposedIncome * 0.25)).toLocaleString('en-IN')}/mo.`);
  }
  if (proposedCarEmi > proposedIncome * 0.2) {
    suggestions.push('EMI Warning: Consider prepaying part of the car loan to reduce monthly EMI and improve cash flow.');
  }
  if (monthlySavings < proposedIncome * 0.2) {
    suggestions.push('Increase Savings: Restructure discretionary spending (Dining, Entertainment) to hit a 20% savings threshold.');
  } else {
    suggestions.push(`Excellent Savings Rate! Setup an automated SIP of ₹${Math.round(monthlySavings * 0.5).toLocaleString('en-IN')} to invest this surplus.`);
  }

  return {
    monthlySavings,
    cashFlowRatio,
    projectedNetWorthYears,
    simulatedWealthTenYears: Math.round(simulatedWealthTenYears),
    efMonthsToComplete,
    goalMonthsToComplete,
    budgetScore: boundedScore,
    suggestions
  };
}

// =========================================================================
// CUSTOM REACT HOOKS
// =========================================================================

export function useAdaptiveRecommendations() {
  const { expenses, incomeData, goals, budgets, liabilities } = useFinancial();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const list = await adaptiveBudgetApi.getRecommendations();
      if (list && list.length > 0) {
        setRecommendations(list);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend recommendations failed, falling back to local computation:', err);
    }

    const localList = generateLocalRecommendations(expenses, incomeData, goals, budgets, liabilities);
    setRecommendations(localList);
    setLoading(false);
  }, [expenses, incomeData, goals, budgets, liabilities]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const approveRecommendation = async (id: string, overrides: Record<string, number> = {}) => {
    try {
      await adaptiveBudgetApi.approveAction(id, overrides);
    } catch (err) {
      console.warn('Backend approveAction failed, falling back to local state filter:', err);
    }
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const dismissRecommendation = async (id: string) => {
    try {
      await adaptiveBudgetApi.dismissAction(id);
    } catch (err) {
      console.warn('Backend dismissAction failed, falling back to local state filter:', err);
    }
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  return { 
    recommendations, 
    loading, 
    refresh: fetchRecommendations,
    approveRecommendation,
    dismissRecommendation
  };
}

export function useBudgetHealth() {
  const { expenses, incomeData, goals, budgets, liabilities, assets } = useFinancial();
  const [health, setHealth] = useState<AdaptiveBudgetHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adaptiveBudgetApi.getHealthScore();
      if (data) {
        setHealth(data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend health score failed, falling back to local computation:', err);
    }

    const localHealth = calculateLocalHealthScore(expenses, incomeData, goals, budgets, liabilities, assets);
    setHealth(localHealth);
    setLoading(false);
  }, [expenses, incomeData, goals, budgets, liabilities, assets]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { health, loading, refresh: fetchHealth };
}

export function useScenarioPlanner() {
  const { expenses, goals, liabilities } = useFinancial();
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (input: ScenarioSimulationInput) => {
    try {
      setLoading(true);
      const data = await adaptiveBudgetApi.runSimulation(input);
      if (data) {
        setSimulation(data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend simulation failed, falling back to local computation:', err);
    }

    const localSim = runLocalSimulation(input, expenses, goals, liabilities);
    setSimulation(localSim);
    setLoading(false);
  };

  return { simulation, loading, runSimulation };
}
