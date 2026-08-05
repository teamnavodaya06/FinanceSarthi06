import { TestUserProfile } from '../fixtures/profiles';

export type MockErrorState = 'none' | 'timeout' | 'quota' | 'network' | 'invalid_key' | 'firestore_fail';

export class GeminiMockClient {
  private errorState: MockErrorState = 'none';
  private latencyMs: number = 200;

  setErrorState(state: MockErrorState) {
    this.errorState = state;
  }

  setLatency(ms: number) {
    this.latencyMs = ms;
  }

  async generateResponse(prompt: string, profile: TestUserProfile, history: any[] = []): Promise<string> {
    // 1. Simulate Latency
    if (this.latencyMs > 0) {
      await new Promise(r => setTimeout(r, this.latencyMs));
    }

    // 2. Simulate Error States
    if (this.errorState === 'timeout') {
      throw new Error('Gemini API call timed out after 30000ms');
    }
    if (this.errorState === 'quota') {
      throw new Error('429 RESOURCE_EXHAUSTED: Quota exceeded for model gemini-2.5-pro');
    }
    if (this.errorState === 'network') {
      throw new Error('FetchFailed: Failed to establish secure connection to generativeai.googleapis.com');
    }
    if (this.errorState === 'invalid_key') {
      throw new Error('API_KEY_INVALID: API key expired or unauthorized');
    }

    const query = prompt.toLowerCase();

    // 3. Prompt Injection Audits (Security/Safety)
    if (query.includes('ignore previous instructions') || query.includes('system prompt')) {
      return "Refusal: I cannot reveal my system instructions. I am AI Sarthi, your personal financial advisor.";
    }
    if (query.includes('show another user') || query.includes('cross-user') || query.includes('user-alice-uid') || query.includes('user-bob-uid')) {
      return "Refusal: Security boundary error. I am unauthorized to share or view details of another user's account.";
    }
    if (query.includes('delete my goals') || query.includes('unauthorized change') || query.includes('make change')) {
      return "Refusal: I cannot modify your account database directly or execute database mutations. Please use your Dashboard controls.";
    }
    if (query.includes('api key') || query.includes('api_key') || query.includes('credentials')) {
      return "Refusal: I do not have access to backend API credentials or secret keys.";
    }
    if (query.includes('guarantee') || query.includes('sure profit') || query.includes('100% returns')) {
      return "Refusal: I cannot promise guaranteed returns. All market investments carry risks. Please evaluate carefully.";
    }
    if (query.includes('risky') || query.includes('leverage everything')) {
      return "Refusal: Highly risky asset allocation is discouraged. I recommend maintaining a 6-month emergency buffer first.";
    }

    // 4. Relevance / Personalization / Reasonings matching context
    if (query.includes('spending') || query.includes('food') || query.includes('expense')) {
      const foodExpense = profile.expenses.find(e => e.category === 'FOOD');
      const foodAmount = foodExpense?.amount || 0;
      if (foodAmount > 0) {
        return `### 📊 Expense Analysis for ${profile.name}
Your monthly food outflow is **₹${foodAmount.toLocaleString('en-IN')}**. 
Based on your income of **₹${profile.monthlySalary.toLocaleString('en-IN')}**, we recommend setting a monthly Swiggy/dining limit at 10% (₹${(profile.monthlySalary * 0.1).toLocaleString('en-IN')}) to optimize your savings potential.
Why: Reduces discretionary leaks.
Expected Outcome: Save ₹${Math.max(500, Math.round(foodAmount * 0.15)).toLocaleString('en-IN')} monthly.
Possible Risks: Low risk, relies on minor lifestyle changes.`;
      } else {
        return `### 📊 Expense Analysis for ${profile.name}
You have no transaction logs in the Food & Dining category. Please upload your digital statements to view custom breakdowns.`;
      }
    }

    if (query.includes('buy') || query.includes('afford') || query.includes('laptop') || query.includes('laptop?')) {
      // Find purchase price
      const match = query.match(/\d+/g);
      const cost = match ? parseInt(match[0], 10) : 70000;
      const totalSpent = profile.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const surplus = Math.max(0, profile.monthlySalary - totalSpent);
      const isAffordable = surplus > cost;
      
      const responseText = `### 💻 Purchase Feasibility: ₹${cost.toLocaleString('en-IN')}
Profile Analysis: Income ₹${profile.monthlySalary.toLocaleString('en-IN')} | Expenses ₹${totalSpent.toLocaleString('en-IN')} | Monthly Surplus ₹${surplus.toLocaleString('en-IN')}.
${isAffordable 
  ? `Yes, you can afford it. However, prefer splitting it into 3 interest-free EMIs or delay if possible to avoid cash tightness.` 
  : `Buying this immediately creates a deficit of ₹${(cost - surplus).toLocaleString('en-IN')} against your current monthly income.`}
Why: A massive instant outflow reduces liquid capital buffers.
Expected Outcome: Post-purchase emergency reserves will stand at ₹${Math.max(0, surplus - cost).toLocaleString('en-IN')}.
Possible Risks: Depleting emergency funds creates vulnerability to credit card debts.`;
      return responseText;
    }

    if (query.includes('sip') || query.includes('should i increase') || query.includes('invest')) {
      const currentSip = profile.goals.reduce((sum, g) => sum + (g.monthlyAllocation || 0), 0);
      const totalSpent = profile.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const surplus = Math.max(0, profile.monthlySalary - totalSpent);
      const addedSip = Math.round(surplus * 0.4);
      
      const r = 0.12 / 12;
      const n = 120; // 10 years
      const compoundVal = Math.round(addedSip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));

      return `### 🚀 SIP Optimization Profile: ${profile.name}
Current Monthly Surplus: **₹${surplus.toLocaleString('en-IN')}**
Recommendation: Allocate **₹${addedSip.toLocaleString('en-IN')}** of your savings to automated mutual fund SIPs.
Why: Automating SIPs on credit day enforces savings discipline and maximizes compound interest.
Expected Outcome: Over 10 years at 12% CAGR, this incremental SIP will accumulate to approximately **₹${compoundVal.toLocaleString('en-IN')}**.
Possible Risks: Equity funds are subject to market volatility. Keep at least 6 months emergency coverage.`;
    }

    // Default template advisor
    return `### 💡 FinanceSarthi Copilot Response
Welcome, ${profile.name}!
- Monthly Base Income: ₹${profile.monthlySalary.toLocaleString('en-IN')}
- City Tier Category: ${profile.cityTier}
- Risk Appetite Profile: ${profile.riskProfile}
- Active Goals: ${profile.goals.length > 0 ? profile.goals.map(g => g.title).join(', ') : 'None'}

Please clarify if you would like me to optimize your tax regime, review budget overrides, or analyze your emergency fund completion timelines.`;
  }

  async *streamResponse(prompt: string, profile: TestUserProfile): AsyncGenerator<{ status: string; text: string; widgetData?: any }, void, unknown> {
    const fullText = await this.generateResponse(prompt, profile);
    const tokens = fullText.split(' ');
    
    yield { status: 'THINKING', text: 'AI Sarthi is processing your financial request...' };
    await new Promise(r => setTimeout(r, 50));
    
    yield { status: 'ANALYZING', text: 'Analyzing active database profiles, goals, and monthly transactions history...' };
    await new Promise(r => setTimeout(r, 50));

    let accumulatedText = '';
    for (let i = 0; i < tokens.length; i++) {
      accumulatedText += (i === 0 ? '' : ' ') + tokens[i];
      if (i % 5 === 0 || i === tokens.length - 1) {
        yield { status: 'GENERATING', text: accumulatedText };
        await new Promise(r => setTimeout(r, 20));
      }
    }

    yield { status: 'DONE', text: '' };
  }
}

export const geminiMockClient = new GeminiMockClient();
