import { SuggestedPrompt } from '@financesarthi/types';

export class PromptScoringService {
  scorePrompts(prompts: SuggestedPrompt[], budgetOverrun: boolean, savingsRateDrop: boolean): SuggestedPrompt[] {
    return prompts.map(p => {
      let weight = 0;
      
      // Dynamic priority adjustment rules
      if (p.category === 'Budget' && budgetOverrun) {
        weight += 50;
        p.priority = 'CRITICAL';
      }
      if (p.category === 'Savings' && savingsRateDrop) {
        weight += 30;
        p.priority = 'HIGH';
      }

      p.score = p.score + weight;
      return p;
    }).sort((a, b) => b.score - a.score);
  }
}
export const promptScoringService = new PromptScoringService();
