import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfigurationService } from './AIConfigurationService';

export class GeminiService {
  private genAI: any = null;

  private initClient() {
    if (!this.genAI) {
      const apiKey = aiConfigurationService.getApiKey();
      // Initialize the GoogleGenerativeAI instance matching standard @google/generative-ai sdk standards
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async executeWithRetry(prompt: string, retries: number = 3): Promise<string> {
    const config = aiConfigurationService.getModelConfig();
    let attempt = 0;

    while (attempt < retries) {
      try {
        const client = this.initClient();
        const model = client.getGenerativeModel({ 
          model: config.modelName,
          generationConfig: {
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
            maxOutputTokens: config.maxOutputTokens,
          }
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const responseText = result.response.text();
        if (!responseText) {
          throw new Error('Malformed Response received from Gemini client');
        }
        return responseText;
      } catch (err: any) {
        attempt++;
        console.warn(`Attempt ${attempt} to execute Gemini model failed: ${err.message}`);
        if (attempt >= retries) {
          throw new Error(`Gemini invocation failed after ${retries} attempts. Last error: ${err.message}`);
        }
        // Exponential backoff sleep delay
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
    throw new Error('Gemini execution failed');
  }
}
export const geminiService = new GeminiService();
