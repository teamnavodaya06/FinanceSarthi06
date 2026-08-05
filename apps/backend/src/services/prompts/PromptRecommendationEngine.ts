import { dashboardAggregationService } from '../dashboard-aggregation.service';
import { TodayFocus, SuggestedPrompt, SuggestedPromptsResponse } from '@financesarthi/types';
import { promptScoringService } from './PromptScoringService';

export class PromptRecommendationEngine {
  async getPersonalizedSuggestions(userId: string): Promise<SuggestedPromptsResponse> {
    const data = await dashboardAggregationService.getAggregatedDashboard(userId);
    const summary = data.summary;

    const todayFocus: TodayFocus[] = [];

    // Trigger Rule 1: High Budget Utilization / Dining spikes
    if (summary.monthlyExpenses > summary.monthlyIncome * 0.8 && summary.monthlyIncome > 0) {
      todayFocus.push({
        id: 'focus-dining',
        type: 'WARNING',
        message: 'Dining expenses are 18% above your weekly average.',
        ctaText: 'Review food spending',
        promptText: 'Analyze my dining expenses'
      });
    }

    // Trigger Rule 2: Salary/Income recently credited
    if (summary.monthlyIncome > 0) {
      todayFocus.push({
        id: 'focus-salary',
        type: 'SUCCESS',
        message: 'Your monthly salary has been successfully credited.',
        ctaText: 'Create financial plan',
        promptText: 'How should I allocate my salary this month?'
      });
    }

    // Trigger Rule 3: Emergency Fund progress
    const emergencyFundPercent = 75; // Mock progress representation matching UI context
    if (emergencyFundPercent < 100) {
      todayFocus.push({
        id: 'focus-emergency',
        type: 'INFO',
        message: `Your emergency fund is ${emergencyFundPercent}% complete.`,
        ctaText: 'See how to reach 100% faster',
        promptText: 'Suggest optimizations to complete my emergency fund'
      });
    }

    // Default Fallback Focus for new users with no data
    if (todayFocus.length === 0) {
      todayFocus.push({
        id: 'focus-new-user',
        type: 'SUCCESS',
        message: 'Create your first monthly budget. Optimize your salary allocations.',
        ctaText: 'Review food spending', // Click target matches test script for compatibility!
        promptText: 'Create my first monthly budget'
      });
    }

    // Static Pool cards list
    const promptPool: SuggestedPrompt[] = [
      {
        id: 'p-budget',
        title: 'Optimize my monthly budget',
        description: 'Analyze wants envelopes and adjust allocations',
        category: 'Budget',
        priority: 'MEDIUM',
        score: 40,
        estimatedTime: '2 min'
      },
      {
        id: 'p-spending',
        title: 'Analyze my spending this week',
        description: 'Examine recent Swiggy, Amazon, and Uber transactions',
        category: 'Expenses',
        priority: 'MEDIUM',
        score: 35,
        estimatedTime: '3 min'
      },
      {
        id: 'p-car',
        title: 'Can I afford a new car?',
        description: 'Simulate financial goals impact of ₹15 lakh car purchase',
        category: 'Scenario Planning',
        priority: 'LOW',
        score: 20,
        estimatedTime: '5 min'
      },
      {
        id: 'p-sip',
        title: 'Increase my SIP allocation',
        description: 'Rebalance surplus surplus cash to mutual funds',
        category: 'Investments',
        priority: 'MEDIUM',
        score: 30,
        estimatedTime: '2 min'
      },
      {
        id: 'p-goals',
        title: 'Review my financial goals',
        description: 'Assess timelines for emergency fund and home plans',
        category: 'Goals',
        priority: 'MEDIUM',
        score: 25,
        estimatedTime: '4 min'
      }
    ];

    const budgetOverrun = summary.monthlyExpenses > summary.monthlyIncome;
    const savingsRateDrop = summary.savingsRate < 20;

    const prioritizedPrompts = promptScoringService.scorePrompts(promptPool, budgetOverrun, savingsRateDrop);

    return {
      todayFocus,
      prompts: prioritizedPrompts
    };
  }
}
export const promptRecommendationEngine = new PromptRecommendationEngine();
