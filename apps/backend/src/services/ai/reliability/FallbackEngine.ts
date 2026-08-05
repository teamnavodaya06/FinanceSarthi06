import { FallbackResponse } from '@financesarthi/types';

export class FallbackEngine {
  generateFallback(userQuery: string): FallbackResponse {
    const query = userQuery.toLowerCase();
    
    if (query.includes('spending') || query.includes('expense')) {
      return {
        text: 'Unable to analyze your dining expenses right now. However, your latest monthly spending summary remains available on your main Spending Hub tab.',
        widgetData: {
          type: 'EXPENSE_BREAKDOWN',
          title: 'Static Spending Profile',
          items: [
            { category: 'Housing', amount: 18000, percentage: 50 },
            { category: 'Food & Dining', amount: 8400, percentage: 23 },
            { category: 'Others', amount: 4000, percentage: 27 }
          ]
        },
        isFallback: true
      };
    }

    if (query.includes('budget') || query.includes('save')) {
      return {
        text: 'Your custom AI budget optimizations are temporarily offline. You can still modify wants allocations manually inside your Taxonomy Settings dashboard.',
        widgetData: {
          type: 'BUDGET_REBALANCE',
          recommendationId: 'rec-fallback-budget',
          summary: 'Manual Budget Rebalancing',
          reason: 'AI engine is offline. Move wants budget allocations manually to recover savings rate.',
          financialImpact: 1000
        },
        isFallback: true
      };
    }

    return {
      text: 'AI services are temporarily running under limited capacity. You can still review your active budgets, savings milestones, and dashboard parameters.',
      isFallback: true
    };
  }
}
export const fallbackEngine = new FallbackEngine();
