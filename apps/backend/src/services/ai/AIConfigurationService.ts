import { AIModelConfig } from '@financesarthi/types';

export class AIConfigurationService {
  private config: AIModelConfig = {
    modelName: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-pro',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.2'),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.9'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
  };

  getModelConfig(): AIModelConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AIModelConfig>) {
    this.config = { ...this.config, ...updates };
  }

  getApiKey(): string {
    const key = process.env.GEMINI_API_KEY || 'demo-api-key';
    return key;
  }
}
export const aiConfigurationService = new AIConfigurationService();
