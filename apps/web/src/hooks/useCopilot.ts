import { useState, useEffect, useCallback } from 'react';
import { CopilotConversation, CopilotMessage, Attachment } from '@financesarthi/types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function useConversationHistory() {
  const [conversations, setConversations] = useState<CopilotConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/copilot/conversations`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      setConversations(json.data || []);
    } catch (err) {
      console.error('Failed to retrieve history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const createConversation = async (title: string) => {
    try {
      const res = await fetch(`${BASE_URL}/copilot/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConversations(prev => [json.data, ...prev]);
        return json.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/copilot/conversations/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const pinConversation = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/copilot/conversations/${id}/pin`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setConversations(prev =>
          prev.map(c => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { conversations, loading, createConversation, deleteConversation, pinConversation, refresh: fetchHistory };
}

export function useConversation(activeThreadId: string | null, onMessageReceived: () => void) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [streamingStatus, setStreamingStatus] = useState<'IDLE' | 'THINKING' | 'ANALYZING' | 'GENERATING'>('IDLE');
  const [streamingText, setStreamingText] = useState('');
  const [streamingWidget, setStreamingWidget] = useState<any>(null);

  // Sync messages when active thread selection changes
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/copilot/conversations`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        const active = json.data?.find((c: any) => c.id === activeThreadId);
        if (active) {
          setMessages(active.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeThreadId]);

  const sendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      content: text,
      timestamp: new Date().toISOString(),
      attachments,
    };

    // Append user message immediately
    setMessages(prev => [...prev, userMsg]);
    onMessageReceived();

    // Begin SSE Streaming retrieval
    setStreamingStatus('THINKING');
    setStreamingText('');
    setStreamingWidget(null);

    const token = localStorage.getItem('auth_token');
    const query = new URLSearchParams({
      message: text,
      conversationId: activeThreadId || '',
      lang: localStorage.getItem('sarthi_lang_pref') || 'English',
    });

    const eventSource = new EventSource(`${BASE_URL}/copilot/stream?${query.toString()}&token=${token || ''}`);

    eventSource.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);

        if (chunk.status === 'DONE') {
          // Finalize stream: Append AI message to list
          const aiMsg: CopilotMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'AI',
            content: chunk.text || streamingText || 'Analysis completed.',
            timestamp: new Date().toISOString(),
            widgetData: chunk.widgetData || streamingWidget || null,
          };
          setMessages(prev => [...prev, aiMsg]);
          setStreamingStatus('IDLE');
          setStreamingText('');
          setStreamingWidget(null);
          eventSource.close();
          onMessageReceived();
          return;
        }

        setStreamingStatus(chunk.status);
        if (chunk.status === 'GENERATING' && chunk.text) {
          setStreamingText(chunk.text);
        }
        if (chunk.widgetData) {
          setStreamingWidget(chunk.widgetData);
        }
        onMessageReceived();
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setStreamingStatus('IDLE');
      eventSource.close();
    };
  };

  return { messages, sendMessage, streamingStatus, streamingText, streamingWidget };
}
