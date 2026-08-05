import { dashboardRepository } from '../repositories/dashboard.repository';
import { 
  DashboardResponse, 
  DashboardSummary, 
  DashboardCharts,
  AdaptiveBudgetHealth
} from '@financesarthi/types';
import { budgetHealthService } from './adaptive-budget-engine';

// Performance Memory Cache
interface CacheItem {
  data: any;
  timestamp: number;
}
const dashboardCache: Record<string, CacheItem> = {};
const CACHE_TTL = 30000; // 30 seconds cache TTL

export class IncomeAggregator {
  static aggregate(incomes: any[], userProfileIncome: number) {
    const monthlyIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0) || userProfileIncome || 75000;
    const annualIncome = monthlyIncome * 12;
    const sources = incomes.map(inc => inc.source || 'Salary');
    return {
      monthlyIncome,
      annualIncome,
      trend: 'STABLE',
      sources: sources.length > 0 ? Array.from(new Set(sources)) : ['Salary'],
    };
  }
}

export class ExpenseAggregator {
  static aggregate(expenses: any[]) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todaySpending = expenses
      .filter(exp => exp.date.toISOString().split('T')[0] === todayStr)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const monthlySpending = expenses
      .filter(exp => exp.date.getMonth() === now.getMonth() && exp.date.getFullYear() === now.getFullYear())
      .reduce((sum, exp) => sum + exp.amount, 0);

    const daysPassed = now.getDate();
    const averageDaily = daysPassed > 0 ? Math.round(monthlySpending / daysPassed) : 0;

    const merchants = expenses.map(exp => exp.merchant).filter(Boolean);
    const topMerchants = Array.from(new Set(merchants)).slice(0, 3);

    const largestExpense = expenses.reduce((max, exp) => Math.max(max, exp.amount), 0);

    return {
      todaySpending,
      monthlySpending,
      averageDaily,
      topMerchants: topMerchants.length > 0 ? topMerchants : ['Generic'],
      largestExpense,
      recentTransactions: expenses.slice(0, 10),
    };
  }
}

export class BudgetAggregator {
  static aggregate(activeBudget: any) {
    if (!activeBudget) {
      return {
        monthlyBudget: 0,
        remainingBudget: 0,
        utilization: 0,
        status: 'SAFE',
        categoryBudgets: [],
      };
    }

    return {
      monthlyBudget: activeBudget.totalBudget,
      remainingBudget: activeBudget.remainingBudget,
      utilization: activeBudget.utilizationPercentage,
      status: activeBudget.status,
      categoryBudgets: activeBudget.categoryBudgets || [],
    };
  }
}

export class CashFlowAggregator {
  static aggregate(income: number, spent: number) {
    const savings = Math.max(0, income - spent);
    const remainingCash = income - spent;
    return {
      inflow: income,
      outflow: spent,
      savings,
      remainingCash,
    };
  }
}

export class GoalAggregator {
  static aggregate(goals: any[]) {
    return goals.map(g => {
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);
      const completionPercentage = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;

      // Estimate completion date based on monthly allocation
      let estimatedCompletionDate = 'TBD';
      if (g.monthlyAllocation > 0 && remainingAmount > 0) {
        const months = Math.ceil(remainingAmount / g.monthlyAllocation);
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + months);
        estimatedCompletionDate = completionDate.toISOString().split('T')[0];
      }

      return {
        id: g.id,
        title: g.title,
        category: g.category,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount,
        completionPercentage,
        estimatedCompletionDate,
      };
    });
  }
}

export class InvestmentAggregator {
  static aggregate(assets: any[]) {
    const investments = assets.filter(a => ['Mutual Funds', 'Stocks', 'Gold', 'PF/NPS', 'FD'].includes(a.category));
    const totalInvestment = investments.reduce((sum, a) => sum + a.value, 0);
    return {
      totalInvestment,
      monthlyContribution: totalInvestment * 0.05, // Mock target contribution calculation
      allocations: investments.map(i => ({
        category: i.category,
        name: i.name,
        value: i.value,
      })),
    };
  }
}

export class NetWorthAggregator {
  static aggregate(assets: any[], liabilities: any[]) {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabs = liabilities.reduce((sum, l) => sum + l.remaining, 0);
    return {
      assets: totalAssets,
      liabilities: totalLiabs,
      netWorth: totalAssets - totalLiabs,
    };
  }
}

export class ChartAggregator {
  static aggregate(income: number, spent: number, expenses: any[], assets: any[]) {
    const incomeVsExpenses = [
      { name: 'Current Month', income, expenses: spent }
    ];

    const cashFlow = [
      { month: 'Current Month', inflow: income, outflow: spent }
    ];

    // Build category map
    const catSpends: Record<string, number> = {};
    expenses.forEach(e => {
      catSpends[e.category] = (catSpends[e.category] || 0) + e.amount;
    });

    const categoryDistribution = Object.entries(catSpends).map(([cat, val]) => ({
      category: cat,
      value: val,
      color: '#3B82F6', // default fallback color
    }));

    const budgetUtilization = Object.entries(catSpends).map(([cat, val]) => ({
      category: cat,
      limit: val * 1.2, // mock limit
      spent: val,
    }));

    const monthlySpendingTrend = expenses.slice(0, 30).map(e => ({
      date: e.date.toISOString().split('T')[0],
      amount: e.amount,
    }));

    const netWorthGrowth = [
      { year: 2026, value: assets.reduce((sum, a) => sum + a.value, 0) }
    ];

    const investmentAllocation = assets.map(a => ({
      type: a.category,
      value: a.value,
    }));

    const savingsTrend = [
      { month: 'Current Month', amount: Math.max(0, income - spent) }
    ];

    return {
      incomeVsExpenses,
      cashFlow,
      categoryDistribution,
      budgetUtilization,
      monthlySpendingTrend,
      netWorthGrowth,
      investmentAllocation,
      savingsTrend,
    };
  }
}

export class DashboardAggregationService {
  private static getCache(userId: string): any | null {
    const cached = dashboardCache[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private static setCache(userId: string, data: any) {
    dashboardCache[userId] = {
      data,
      timestamp: Date.now(),
    };
  }

  static invalidateCache(userId: string) {
    delete dashboardCache[userId];
  }

  async getAggregatedDashboard(userId: string): Promise<DashboardResponse> {
    const cached = DashboardAggregationService.getCache(userId);
    if (cached) return cached;

    // Fetch batch data in parallel using Promise.all
    const data = await dashboardRepository.fetchFinancialDataBatch(userId);

    const incomeAgg = IncomeAggregator.aggregate(data.incomes, data.user?.monthlyIncome || 75000);
    const expenseAgg = ExpenseAggregator.aggregate(data.expenses);
    const budgetAgg = BudgetAggregator.aggregate(data.activeBudget);
    const cashFlowAgg = CashFlowAggregator.aggregate(incomeAgg.monthlyIncome, expenseAgg.monthlySpending);
    const goalsAgg = GoalAggregator.aggregate(data.goals);
    const investAgg = InvestmentAggregator.aggregate(data.assets);
    const netWorthAgg = NetWorthAggregator.aggregate(data.assets, data.liabilities);

    const emiRatio = netWorthAgg.liabilities > 0 ? (data.liabilities.reduce((sum, l) => sum + l.monthlyEmi, 0) / incomeAgg.monthlyIncome) : 0;
    const health = budgetHealthService.calculateBudgetHealthScore(
      expenseAgg.monthlySpending,
      budgetAgg.monthlyBudget,
      emiRatio
    );

    const charts = ChartAggregator.aggregate(
      incomeAgg.monthlyIncome,
      expenseAgg.monthlySpending,
      data.expenses,
      data.assets
    );

    // AI recommendation aggregator
    const recommendations = [];
    if (expenseAgg.monthlySpending > budgetAgg.monthlyBudget) {
      recommendations.push({
        id: 'rec-budget-overrun',
        summary: 'Monthly budget overrun detected',
        reason: `Your monthly expenses of ₹${expenseAgg.monthlySpending} exceed your budget of ₹${budgetAgg.monthlyBudget}.`,
        financialImpact: expenseAgg.monthlySpending - budgetAgg.monthlyBudget,
        suggestedAction: 'Consider adjusting allocations for non-essential wants envelopes.',
        priority: 'HIGH' as const,
        confidence: 0.95,
      });
    }

    const notifications = [
      `Your total monthly spending is currently ₹${expenseAgg.monthlySpending.toLocaleString('en-IN')}.`
    ];

    const monthlyStory = {
      summary: 'You are maintaining a positive cash flow balance this month.',
      achievements: ['Kept utility spending within limits.'],
      warnings: expenseAgg.monthlySpending > budgetAgg.monthlyBudget ? ['Exceeded wants spending envelope.'] : [],
      opportunities: ['Reallocate remaining cash to SIPs.'],
    };

    const summary: DashboardSummary = {
      monthlyIncome: incomeAgg.monthlyIncome,
      annualIncome: incomeAgg.annualIncome,
      monthlyExpenses: expenseAgg.monthlySpending,
      remainingCash: cashFlowAgg.remainingCash,
      savings: cashFlowAgg.savings,
      savingsRate: incomeAgg.monthlyIncome > 0 ? (cashFlowAgg.savings / incomeAgg.monthlyIncome) * 100 : 0,
      budgetRemaining: budgetAgg.remainingBudget,
      financialHealthScore: health.score,
      netWorth: netWorthAgg.netWorth,
      cashAvailable: cashFlowAgg.remainingCash,
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),
    };

    const response: DashboardResponse = {
      summary,
      income: {
        monthlyIncome: incomeAgg.monthlyIncome,
        annualIncome: incomeAgg.annualIncome,
        trend: incomeAgg.trend,
        sources: incomeAgg.sources,
      },
      expenses: {
        todaySpending: expenseAgg.todaySpending,
        monthlySpending: expenseAgg.monthlySpending,
        averageDaily: expenseAgg.averageDaily,
        topMerchants: expenseAgg.topMerchants,
        largestExpense: expenseAgg.largestExpense,
      },
      budget: {
        monthlyBudget: budgetAgg.monthlyBudget,
        remainingBudget: budgetAgg.remainingBudget,
        utilization: budgetAgg.utilization,
        status: budgetAgg.status,
      },
      cashFlow: {
        inflow: cashFlowAgg.inflow,
        outflow: cashFlowAgg.outflow,
        savings: cashFlowAgg.savings,
        remainingCash: cashFlowAgg.remainingCash,
      },
      goals: goalsAgg,
      investments: {
        totalInvestment: investAgg.totalInvestment,
        monthlyContribution: investAgg.monthlyContribution,
        allocations: investAgg.allocations,
      },
      netWorth: netWorthAgg,
      financialHealth: health,
      recommendations,
      notifications,
      charts,
      monthlyStory,
      quickActions: ['Review Budget', 'Increase SIP', 'Add Expense'],
      upcomingBills: [],
      subscriptions: [],
      recentTransactions: expenseAgg.recentTransactions,
    };

    DashboardAggregationService.setCache(userId, response);
    return response;
  }
}
export const dashboardAggregationService = new DashboardAggregationService();
