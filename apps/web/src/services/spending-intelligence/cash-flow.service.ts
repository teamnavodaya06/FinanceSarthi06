import { Expense } from '@financesarthi/types';

export interface CashFlowNode {
  label: string;
  amount: number;
  percentage: number;
  description: string;
  isWarning: boolean;
}

export class CashFlowService {
  public static calculateJourney(expenses: Expense[], monthlyIncome: number): {
    nodes: CashFlowNode[];
    isLowCash: boolean;
    isExcellentSavings: boolean;
  } {
    const incomeVal = monthlyIncome || 85000;
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const essentialCategories = ['HOUSING', 'UTILITIES', 'HEALTHCARE', 'DEBT_EMI'];
    const essentials = expenses
      .filter(e => essentialCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    const lifestyleCategories = ['FOOD', 'SHOPPING', 'ENTERTAINMENT', 'OTHERS'];
    const lifestyle = expenses
      .filter(e => lifestyleCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    const investments = expenses
      .filter(e => e.category === 'INVESTMENT')
      .reduce((sum, e) => sum + e.amount, 0);

    const savings = Math.max(0, incomeVal - totalSpent);

    const getPct = (val: number) => (incomeVal > 0 ? Math.round((val / incomeVal) * 100) : 0);

    const nodes: CashFlowNode[] = [
      {
        label: 'Income Pool',
        amount: incomeVal,
        percentage: 100,
        description: 'Total monthly cash inflows',
        isWarning: false,
      },
      {
        label: 'Essential Costs',
        amount: essentials,
        percentage: getPct(essentials),
        description: 'Fixed housing, bills, and EMI commitments',
        isWarning: essentials > incomeVal * 0.55,
      },
      {
        label: 'Lifestyle Spending',
        amount: lifestyle,
        percentage: getPct(lifestyle),
        description: 'Flexible retail dining and leisure logs',
        isWarning: lifestyle > incomeVal * 0.35,
      },
      {
        label: 'Investments Allocation',
        amount: investments,
        percentage: getPct(investments),
        description: 'Active compounding asset placement',
        isWarning: false,
      },
      {
        label: 'Cash Surplus',
        amount: savings,
        percentage: getPct(savings),
        description: 'Retained capital buffer',
        isWarning: savings < incomeVal * 0.1,
      },
    ];

    return {
      nodes,
      isLowCash: savings < incomeVal * 0.1,
      isExcellentSavings: savings >= incomeVal * 0.3,
    };
  }
}
