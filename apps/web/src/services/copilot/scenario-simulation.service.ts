export interface SimulationResult {
  headline: string;
  originalOutflow: number;
  projectedOutflow: number;
  savingsImpact: number;
  explanation: string;
  recommendation: string;
  expectedOutcome: string;
}

export class ScenarioSimulationService {
  public static simulate(
    scenarioType: 'SALARY_INCREASE' | 'BIG_PURCHASE' | 'SIP_INCREASE' | 'TAX_REGIME',
    paramValue: number,
    currentSalary: number,
    currentSpent: number
  ): SimulationResult {
    const salary = currentSalary || 85000;
    const spent = currentSpent || 45000;
    
    if (scenarioType === 'SALARY_INCREASE') {
      const newSalary = paramValue || 100000;
      const additional = newSalary - salary;
      const projectedSavings = newSalary - spent;
      return {
        headline: `Salary Increase Simulation to ₹${newSalary.toLocaleString('en-IN')}`,
        originalOutflow: spent,
        projectedOutflow: spent,
        savingsImpact: additional,
        explanation: `Increasing monthly income to ₹${newSalary.toLocaleString('en-IN')} increases your surplus cash potential by ₹${additional.toLocaleString('en-IN')} per month.`,
        recommendation: `Allocate 50% of the additional surplus (₹${Math.round(additional * 0.5).toLocaleString('en-IN')}) straight to high-yield SIPs to compound wealth.`,
        expectedOutcome: `Total projected monthly savings will rise to ₹${projectedSavings.toLocaleString('en-IN')}.`,
      };
    }

    if (scenarioType === 'BIG_PURCHASE') {
      const cost = paramValue || 60000;
      const emergencyLimit = salary * 3; // recommended emergency fund (3 months salary)
      const isAffordable = (salary - spent) > cost;
      
      return {
        headline: `Purchase Feasibility Simulation: ₹${cost.toLocaleString('en-IN')}`,
        originalOutflow: spent,
        projectedOutflow: spent + cost,
        savingsImpact: -cost,
        explanation: isAffordable 
          ? `You have a monthly surplus of ₹${(salary - spent).toLocaleString('en-IN')}, which can cover the buy of ₹${cost.toLocaleString('en-IN')} this month.`
          : `Buying this immediately creates a deficit of ₹${(cost - (salary - spent)).toLocaleString('en-IN')} against your current monthly income.`,
        recommendation: isAffordable 
          ? 'Yes, you can afford it. However, prefer splitting it into 3 interest-free EMIs or delay if possible to avoid cash tightness.'
          : `Postpone the purchase by at least 2 months to save up specific earmarked funds, avoiding depleting emergency balances.`,
        expectedOutcome: `Maintains emergency reserve buffer above safety threshold: ₹${emergencyLimit.toLocaleString('en-IN')}.`,
      };
    }

    if (scenarioType === 'SIP_INCREASE') {
      const addedSip = paramValue || 5000;
      // Calculate projected compounding over 5 years at 12% CAGR
      // FV = P * [((1 + i)^n - 1) / i] * (1 + i)
      const r = 0.12 / 12;
      const n = 5 * 12;
      const totalInvested = addedSip * n;
      const futureVal = Math.round(addedSip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      
      return {
        headline: `SIP Increase Simulation by +₹${addedSip.toLocaleString('en-IN')}/mo`,
        originalOutflow: spent,
        projectedOutflow: spent + addedSip,
        savingsImpact: -addedSip,
        explanation: `Increasing mutual fund SIP allocations by ₹${addedSip.toLocaleString('en-IN')} monthly reduces raw liquid savings but shifts wealth to equity growth.`,
        recommendation: `Automate this SIP transfer on day 1 of salary credit to enforce savings discipline.`,
        expectedOutcome: `Over 5 years, you will invest a total of ₹${totalInvested.toLocaleString('en-IN')} which compounds to approximately ₹${futureVal.toLocaleString('en-IN')} (at 12% CAGR).`,
      };
    }

    // Default Tax regime fallback simulation
    return {
      headline: 'Tax Regime Switch Simulation',
      originalOutflow: spent,
      projectedOutflow: spent,
      savingsImpact: 0,
      explanation: 'Under the New Tax Regime, tax rates are lower but standard 80C/HRA deductions are unavailable.',
      recommendation: 'Compare total active deductions against ₹3.75 Lakhs threshold to decide regime.',
      expectedOutcome: 'Check Salary Planner inputs to see custom calculations comparisons.',
    };
  }
}
