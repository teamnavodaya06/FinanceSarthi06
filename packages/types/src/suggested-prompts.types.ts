export type PromptPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SuggestedPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: PromptPriority;
  score: number;
  estimatedTime: string;
  iconName?: string;
}

export interface TodayFocus {
  id: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  message: string;
  ctaText: string;
  promptText: string;
}

export interface SuggestedPromptsResponse {
  todayFocus: TodayFocus[];
  prompts: SuggestedPrompt[];
}
