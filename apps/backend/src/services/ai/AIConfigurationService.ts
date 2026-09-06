import { AIModelConfig } from '@financesarthi/types';

export class AIConfigurationService {
  private provider: string = process.env.AI_PROVIDER || 'nvidia';
  private config: AIModelConfig = {
    modelName: process.env.NVIDIA_MODEL || process.env.GEMINI_MODEL_NAME || 'moonshotai/kimi-k3',
    temperature: parseFloat(process.env.NVIDIA_TEMPERATURE || process.env.GEMINI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.NVIDIA_TOP_P || process.env.GEMINI_TOP_P || '0.95'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40'),
    maxOutputTokens: parseInt(process.env.NVIDIA_MAX_TOKENS || process.env.GEMINI_MAX_TOKENS || '4096'),
  };

  getProvider(): string {
    return this.provider;
  }

  setProvider(provider: string) {
    this.provider = provider;
  }

  getModelConfig(): AIModelConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AIModelConfig>) {
    this.config = { ...this.config, ...updates };
  }

  getApiKey(): string {
    if (this.provider === 'nvidia') {
      return this.getNvidiaApiKey();
    }
    const key = process.env.GEMINI_API_KEY || 'demo-api-key';
    return key;
  }

  getNvidiaApiKey(): string {
    return process.env.NVIDIA_API_KEY || '';
  }

  getNvidiaBaseUrl(): string {
    return process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  }

  getNvidiaModel(): string {
    return process.env.NVIDIA_MODEL || 'nvidia/nemotron-voicechat';
  }
}
export const aiConfigurationService = new AIConfigurationService();

