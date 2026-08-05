export interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  widgetData?: any; // Dynamic financial response widgets: budgets, assets allocation, emergency buffers
}

export interface CopilotConversation {
  id: string;
  title: string;
  isPinned: boolean;
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamingResponseChunk {
  status: 'THINKING' | 'ANALYZING' | 'GENERATING' | 'DONE';
  text: string;
  widgetData?: any;
}
