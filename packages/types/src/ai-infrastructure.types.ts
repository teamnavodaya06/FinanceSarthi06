export interface AIModelConfig {
  modelName: string;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

export interface TokenMetrics {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AuditLogEntry {
  userId: string;
  promptGenerated: string;
  contextUsed: string;
  responseGenerated: string;
  latencyMs: number;
  tokens: TokenMetrics;
  timestamp: string;
}
