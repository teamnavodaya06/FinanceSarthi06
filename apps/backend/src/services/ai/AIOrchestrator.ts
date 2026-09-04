import { aiContextBuilder } from './AIContextBuilder';
import { promptBuilderService } from './PromptBuilderService';
import { geminiService } from './GeminiService';
import { nvidiaService } from './NvidiaService';
import { aiConfigurationService } from './AIConfigurationService';
import { tokenManagementService } from './TokenManagementService';
import { requestValidator } from './reliability/RequestValidator';
import { responseValidator } from './reliability/ResponseValidator';
import { circuitBreaker } from './reliability/CircuitBreaker';
import { fallbackEngine } from './reliability/FallbackEngine';
import * as fs from 'fs';
import * as path from 'path';

const AUDIT_LOG_PATH = path.join('/Users/kartavayasuryavanshi/.gemini/antigravity/brain/c6cbfb28-b689-40ca-810a-81329b6d6586/scratch', 'ai-orchestrator-audit.jsonl');

export class AIOrchestrator {
  private logAudit(entry: any) {
    try {
      const dir = path.dirname(AUDIT_LOG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n');
    } catch (err) {
      console.error('Failed to write AI audit log entries:', err);
    }
  }

  async processRequest(userId: string, userMessage: string, historySummary: string = '', preferredLanguage: string = 'English'): Promise<{
    text: string;
    metrics: any;
    widgetData?: any;
    isFallback?: boolean;
  }> {
    const startTime = Date.now();

    // Fast-path intercept for basic greetings to provide instant responsive feedback
    const cleanMsg = userMessage.trim().toLowerCase().replace(/[^\w\s]/g, '');
    const greetings = ['hi', 'hello', 'hey', 'hola', 'greetings', 'namaste', 'wasup', 'yo', 'sarthi', 'ai sarthi'];
    if (greetings.includes(cleanMsg)) {
      let welcomeMsg = 'Hello! I am Sarthi, your personal AI financial assistant. How can I help you manage your budgets, track expenses, or simulate goals today?';
      if (preferredLanguage === 'Hindi/Hinglish' || preferredLanguage.toLowerCase().includes('hindi')) {
        welcomeMsg = 'Namaste! Main hoon Sarthi, aapka personal AI financial assistant. Aaj main aapke budget, expenses aur financial goals manage karne me kaise madad kar sakta hoon?';
      }
      return {
        text: welcomeMsg,
        metrics: { promptTokens: 0, responseTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
        isFallback: false
      };
    }

    try {
      // 1. Request boundary validations
      requestValidator.validateRequest(userId, userMessage);

      // 2. Circuit Breaker protection check
      if (circuitBreaker.checkState() === 'OPEN') {
        console.warn('[AI ORCHESTRATOR] Circuit is OPEN. Short-circuiting request directly to FallbackEngine.');
        const fallback = fallbackEngine.generateFallback(userMessage);
        return {
          text: fallback.text,
          metrics: { promptTokens: 0, responseTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
          widgetData: fallback.widgetData,
          isFallback: true
        };
      }

      // 3. Build context & prompt
      const context = await aiContextBuilder.buildFinancialContext(userId);
      const prompt = promptBuilderService.buildSystemPrompt(context, historySummary, userMessage, preferredLanguage);

      // 4. Invoke Provider (NVIDIA Nemotron primary, Gemini secondary fallback)
      let responseText = '';
      const provider = aiConfigurationService.getProvider();
      try {
        if (provider === 'nvidia') {
          try {
            responseText = await nvidiaService.executeWithRetry(prompt);
          } catch (nvErr: any) {
            console.warn(`[AI ORCHESTRATOR] NVIDIA Nemotron primary failed: ${nvErr.message}. Attempting Gemini fallback...`);
            responseText = await geminiService.executeWithRetry(prompt);
          }
        } else {
          responseText = await geminiService.executeWithRetry(prompt);
        }
        
        // 5. Response validations
        responseValidator.validateResponse(responseText);
        circuitBreaker.recordSuccess();
      } catch (err: any) {
        console.error(`[AI ORCHESTRATOR] All AI Providers failed: ${err.message}. Tripping failure trackers...`);
        circuitBreaker.recordFailure();

        const fallback = fallbackEngine.generateFallback(userMessage);
        return {
          text: fallback.text,
          metrics: { promptTokens: 0, responseTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
          widgetData: fallback.widgetData,
          isFallback: true
        };
      }

      const latencyMs = Date.now() - startTime;
      const metrics = tokenManagementService.calculateMetrics(prompt, responseText);

      // Parse custom widgets
      let widgetData = null;
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('spending') || lowerMessage.includes('expense')) {
        widgetData = {
          type: 'EXPENSE_BREAKDOWN',
          title: 'Contextual Spending Analysis',
          items: [
            { category: 'Housing', amount: 18000, percentage: 50 },
            { category: 'Food & Dining', amount: 8400, percentage: 23 },
            { category: 'Transportation', amount: 3200, percentage: 9 }
          ]
        };
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('save')) {
        widgetData = {
          type: 'BUDGET_REBALANCE',
          recommendationId: 'rec-infra-rebalance',
          summary: 'Adaptive Reallocation Strategy',
          reason: 'Auto-detected Wants surplus reallocated directly to Savings.',
          financialImpact: 2000
        };
      }

      // Log audits
      this.logAudit({
        userId,
        promptLength: prompt.length,
        responseLength: responseText.length,
        latencyMs,
        metrics,
        timestamp: new Date().toISOString()
      });

      return {
        text: responseText,
        metrics,
        widgetData,
        isFallback: false
      };
    } catch (err: any) {
      console.error(`[AI ORCHESTRATOR] Validation or systemic error: ${err.message}`);
      const fallback = fallbackEngine.generateFallback(userMessage);
      return {
        text: fallback.text,
        metrics: { promptTokens: 0, responseTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
        widgetData: fallback.widgetData,
        isFallback: true
      };
    }
  }
}
export const aiOrchestrator = new AIOrchestrator();
