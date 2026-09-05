import OpenAI from 'openai';
import { aiConfigurationService } from './AIConfigurationService';

export class NvidiaService {
  private client: OpenAI | null = null;

  private initClient(): OpenAI {
    const apiKey = aiConfigurationService.getNvidiaApiKey();
    const baseURL = aiConfigurationService.getNvidiaBaseUrl();
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
    return this.client;
  }

  async executeWithRetry(prompt: string, retries: number = 3): Promise<string> {
    const config = aiConfigurationService.getModelConfig();
    const model = aiConfigurationService.getNvidiaModel();
    let attempt = 0;

    while (attempt < retries) {
      try {
        const client = this.initClient();
        
        try {
          // Attempt non-streaming completion first for reliability
          const completion = await client.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature ?? 0.7,
            top_p: config.topP ?? 0.95,
            max_tokens: config.maxOutputTokens ?? 4096,
          });

          const choice = completion.choices[0];
          const content = choice?.message?.content || '';
          const reasoning = (choice?.message as any)?.reasoning_content || '';

          if (reasoning) {
            console.log(`[KIMI AI THINKING]: ${reasoning.substring(0, 150)}...`);
          }

          const resultText = content.trim() ? content.trim() : reasoning.trim();
          if (resultText) {
            return resultText;
          }
        } catch (streamErr: any) {
          console.warn(`[NVIDIA SERVICE] Non-streaming call attempted with note: ${streamErr.message}. Trying streaming...`);
        }

        // Attempt streaming completion if non-streaming failed or was empty
        const streamCompletion = (await client.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature ?? 0.7,
          top_p: config.topP ?? 0.95,
          max_tokens: config.maxOutputTokens ?? 4096,
          stream: true,
        } as any)) as unknown as AsyncIterable<any>;

        let fullText = '';
        let reasoningText = '';

        for await (const chunk of streamCompletion) {
          if (!chunk.choices || chunk.choices.length === 0) continue;
          const delta = chunk.choices[0].delta as any;
          const reasoning = delta?.reasoning_content;
          if (reasoning) {
            reasoningText += reasoning;
          }
          if (delta?.content) {
            fullText += delta.content;
          }
        }

        const streamOutput = fullText.trim() ? fullText.trim() : reasoningText.trim();
        if (streamOutput) {
          return streamOutput;
        }

        throw new Error('Received empty response from Kimi AI (NVIDIA) API');
      } catch (err: any) {
        attempt++;
        console.warn(`Attempt ${attempt} to execute Kimi AI (NVIDIA) model failed: ${err.message}`);
        if (attempt >= retries) {
          throw new Error(`Kimi AI (NVIDIA) API invocation failed after ${retries} attempts. Last error: ${err.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
    throw new Error('NVIDIA API execution failed');
  }
}

export const nvidiaService = new NvidiaService();
