export type AIStatus = 'CONNECTED' | 'RETRYING' | 'OFFLINE' | 'LIMITED' | 'RECOVERING';

export interface AIError {
  errorId: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
  timestamp: string;
}

export interface FallbackResponse {
  text: string;
  widgetData?: any;
  isFallback: boolean;
}

export interface HealthStatus {
  latencyMs: number;
  successRate: number;
  circuitState: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
}
