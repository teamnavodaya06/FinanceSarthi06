import { TokenMetrics } from '@financesarthi/types';

export class TokenManagementService {
  // Approximate standard cost rates for Gemini 2.5 Pro (per 1M tokens)
  private readonly inputCostPerMillion = 1.25; // USD
  private readonly outputCostPerMillion = 3.75; // USD

  estimateTokens(text: string): number {
    if (!text) return 0;
    // Standard approximation: 1 word ≈ 1.3 tokens
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.3);
  }

  calculateMetrics(promptText: string, responseText: string): TokenMetrics {
    const promptTokens = this.estimateTokens(promptText);
    const responseTokens = this.estimateTokens(responseText);
    const totalTokens = promptTokens + responseTokens;

    const estimatedCostUsd = 
      (promptTokens / 1000000) * this.inputCostPerMillion +
      (responseTokens / 1000000) * this.outputCostPerMillion;

    return {
      promptTokens,
      responseTokens,
      totalTokens,
      estimatedCostUsd,
    };
  }
}
export const tokenManagementService = new TokenManagementService();
