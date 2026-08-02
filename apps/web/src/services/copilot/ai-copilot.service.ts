import { Expense, Goal } from '@financesarthi/types';
import { PromptBuilderService } from './prompt-builder.service';
import { ScenarioSimulationService, SimulationResult } from './scenario-simulation.service';

export interface CopilotResponse {
  summary: string;
  analysis: string;
  recommendations: {
    title: string;
    whyItMatters: string;
    suggestedAction: string;
    impact: string;
    priority: 'High' | 'Medium' | 'Low';
    confidence: string;
  }[];
  expectedOutcome: string;
  simulation?: SimulationResult;
  disclaimer?: string;
  suggestions: string[];
}

export class AICopilotService {
  public static async generateResponse(
    queryText: string,
    userProfile: any,
    expenses: Expense[],
    goals: Goal[],
    healthScore: number
  ): Promise<CopilotResponse> {
    const lQuery = queryText.toLowerCase();
    const salary = userProfile?.monthlySalary || 85000;
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const surplus = Math.max(0, salary - totalSpent);
    const budgetDepletionPct = salary > 0 ? Math.round((totalSpent / salary) * 100) : 0;

    // Extract purchase amounts (e.g. ₹60,000 laptop, ₹15,000 phone)
    const matchAmt = queryText.replace(/,/g, '').match(/\d+/);
    const extractedNum = matchAmt ? parseInt(matchAmt[0], 10) : 0;

    // Build default response suggestions
    let suggestions = [
      'Can I buy a ₹50,000 laptop?',
      'Why are my expenses increasing?',
      'Where can I save ₹5,000 monthly?',
      'How much should I invest monthly?',
    ];

    // Scenario 1: Big Ticket Purchase Feasibility
    if (lQuery.includes('buy') || lQuery.includes('afford') || lQuery.includes('laptop') || lQuery.includes('car')) {
      const purchaseAmt = extractedNum || 50000;
      const sim = ScenarioSimulationService.simulate('BIG_PURCHASE', purchaseAmt, salary, totalSpent);
      return {
        summary: `Evaluating purchase feasibility for ₹${purchaseAmt.toLocaleString('en-IN')}.`,
        analysis: `Your current monthly income is ₹${salary.toLocaleString('en-IN')} with active expenses of ₹${totalSpent.toLocaleString('en-IN')}, leaving a monthly surplus of ₹${surplus.toLocaleString('en-IN')}.`,
        recommendations: [
          {
            title: 'Purchase Priority Check',
            whyItMatters: 'Large instant cash outflows reduce liquid cash reserves below safety limits.',
            suggestedAction: sim.recommendation,
            impact: 'Protects emergency reserve capacity',
            priority: surplus > purchaseAmt ? 'Medium' : 'High',
            confidence: '95%',
          }
        ],
        expectedOutcome: sim.expectedOutcome,
        simulation: sim,
        disclaimer: 'This is educational guidance. Please verify cash flow status before committing large funds.',
        suggestions,
      };
    }

    // Scenario 2: Increase Investment / SIP
    if (lQuery.includes('sip') || lQuery.includes('invest') || lQuery.includes('saving')) {
      const sipAmt = extractedNum || 5000;
      const sim = ScenarioSimulationService.simulate('SIP_INCREASE', sipAmt, salary, totalSpent);
      return {
        summary: `Evaluating compounding projections for an additional SIP of +₹${sipAmt.toLocaleString('en-IN')}/mo.`,
        analysis: `Currently your monthly surplus stands at ₹${surplus.toLocaleString('en-IN')}. Directing ₹${sipAmt.toLocaleString('en-IN')} to mutual fund SIPs decreases cash reserves but builds equity assets.`,
        recommendations: [
          {
            title: 'Automate SIP Transfers',
            whyItMatters: 'Compounding yield curves are optimized when contributions are consistent and early.',
            suggestedAction: sim.recommendation,
            impact: 'Builds long-term portfolio wealth',
            priority: 'Medium',
            confidence: '90%',
          }
        ],
        expectedOutcome: sim.expectedOutcome,
        simulation: sim,
        disclaimer: 'Mutual fund investments are subject to market risks. Please read offer documents carefully before investing.',
        suggestions,
      };
    }

    // Scenario 3: Expense Increase Analysis
    if (lQuery.includes('increase') || lQuery.includes('expense') || lQuery.includes('spent')) {
      const foodSpent = expenses.filter(e => e.category === 'FOOD').reduce((sum, e) => sum + e.amount, 0);
      const shoppingSpent = expenses.filter(e => e.category === 'SHOPPING').reduce((sum, e) => sum + e.amount, 0);
      return {
        summary: 'Detailed explanation of recent cash outflows and category escalations.',
        analysis: `Your monthly spent is ₹${totalSpent.toLocaleString('en-IN')}. Major categories: Food/Dining (₹${foodSpent.toLocaleString('en-IN')}) and Shopping (₹${shoppingSpent.toLocaleString('en-IN')}).`,
        recommendations: [
          {
            title: 'Audit Leisure Spend',
            whyItMatters: 'Food orders and online retail shopping represent flexible categories where spending can easily balloon.',
            suggestedAction: 'Limit restaurant dining orders to once weekly and pause unessential subscriptions.',
            impact: 'Saves approx ₹30,000 annually',
            priority: 'High',
            confidence: '88%',
          }
        ],
        expectedOutcome: 'Decreases monthly discretionary outflows by 15%, improving savings rate.',
        suggestions,
      };
    }

    // Default Fallback: Financial Health Audit
    return {
      summary: `Financial Health audit overview. Current Score: ${healthScore}/100.`,
      analysis: `Active Income: ₹${salary.toLocaleString('en-IN')} • Expenses: ₹${totalSpent.toLocaleString('en-IN')} (Burn Rate: ${budgetDepletionPct}%).`,
      recommendations: [
        {
          title: 'Establish Emergency Buffer',
          whyItMatters: 'Protects from credit traps or having to liquidate equity positions during unforeseen events.',
          suggestedAction: 'Automate a ₹2,000 monthly transfer directly to your Emergency Reserve goal.',
          impact: 'Builds target ₹24,000 buffer yearly',
          priority: 'Medium',
          confidence: '92%',
        }
      ],
      expectedOutcome: 'Enhances overall financial resilience index score above 80 points.',
      suggestions,
    };
  }
}
