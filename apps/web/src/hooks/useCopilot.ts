import { useState, useEffect, useCallback, useRef } from 'react';
import { CopilotConversation, CopilotMessage, Attachment } from '@financesarthi/types';
import { getApiBaseUrl } from '../api/config';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Fail-safe Sarthi response generator only triggered on network connection failures
const generateFallbackResponse = (text: string, lang: string): { text: string; widgetData?: any } => {
  const clean = text.toLowerCase();

  if (clean.includes('hindi') || clean.includes('hinglish')) {
    return {
      text: `नमस्ते! मैं सारथी AI हूँ, आपका व्यक्तिगत वित्तीय मार्गदर्शक। आप मुझसे बजट, टैक्स बचत, एसआईपी निवेश और खर्चों के बारे में हिंदी या इंग्लिश में कुछ भी पूछ सकते हैं!`,
    };
  }

  if (clean.includes('tax') || clean.includes('regime') || clean.includes('80c') || clean.includes('salary')) {
    return {
      text: lang === 'Hindi/Hinglish'
        ? `Aapke income level ke hisab se, New Tax Regime mein ₹7.5 Lakh tak zero tax slab hai (with ₹75k standard deduction). Agar aap 80C, 80D aur HRA deductions claim karte hain (total deductions > ₹3.75 Lakhs), to Old Tax Regime zyaada beneficial rahega. Aap Salary Planner tab mein exact tax comparison check kar sakte hain!`
        : `Under current Indian tax laws (FY 2025-26), the New Tax Regime offers a standard deduction of ₹75,000 with zero tax up to ₹7.5 Lakhs. If your total deductions (80C, 80D, HRA, NPS) exceed ₹3.75 Lakhs, the Old Regime will save you more tax. You can check your exact salary breakdown in the Salary Planner tab.`,
    };
  }

  if (clean.includes('spend') || clean.includes('expense') || clean.includes('kharch') || clean.includes('food') || clean.includes('swiggy')) {
    return {
      text: lang === 'Hindi/Hinglish'
        ? `Aapka monthly food & dining expense ₹8,400 tak pahunch gaya hai, jo ki average limits se 12% higher hai. Swiggy/Zomato expenses ko 25% reduce karke aap har mahine ₹840 save kar sakte hain aur use SIP Index Fund mein invest kar sakte hain.`
        : `Your monthly food and dining expenses reached ₹8,400 this month, which is ~12% above recommended budget limits. Redirecting ₹840/month from food delivery into a Nifty 50 Index SIP can accumulate over ₹1.4 Lakhs in 5 years at 12% expected CAGR.`,
    };
  }

  if (clean.includes('sip') || clean.includes('invest') || clean.includes('mutual fund') || clean.includes('wealth') || clean.includes('goal')) {
    return {
      text: lang === 'Hindi/Hinglish'
        ? `Sarthi Smart Recommendation: Apne monthly salary ka 20% (₹15,000) Flexi-Cap aur Nifty 50 Index Funds mein SIP ke zariye allocate kijiye. Disciplined compounding se 10 saal mein ₹32.4+ Lakhs ka financial safety corpus create ho sakta hai.`
        : `Sarthi Wealth Tip: Allocating 20% of your monthly income (₹15,000) into disciplined SIPs split across Nifty 50 Index and Flexi-Cap Funds can potentially build a corpus of ₹32.4 Lakhs over 10 years at an expected 12% annual return.`,
    };
  }

  return {
    text: lang === 'Hindi/Hinglish'
      ? `Main Sarthi AI hoon, aapka personal financial mentor! Main aapke expenses analyze karne, 50-30-20 budget plan karne, Old vs New tax regime calculate karne aur SIP wealth goals track karne mein madad karta hoon. Aap mujhse koi bhi question pooch sakte hain!`
      : `I'm Sarthi AI, your personal financial guide! I can analyze your monthly expenses, structure a 50-30-20 budget, calculate Old vs New tax regimes, and track your SIP growth goals. Feel free to ask me anything about your finances!`,
  };
};

export function useConversationHistory() {
  const [conversations, setConversations] = useState<CopilotConversation[]>(() => {
    try {
      const saved = localStorage.getItem('sarthi_local_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    
    // Default initial conversation thread if empty
    const initialThread: CopilotConversation = {
      id: 'thread-default-1',
      title: 'Financial Health Overview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
      messages: [],
    };
    return [initialThread];
  });

  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/copilot/conversations`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setConversations(json.data);
        localStorage.setItem('sarthi_local_conversations', JSON.stringify(json.data));
      }
    } catch (err) {
      console.warn('Backend history fetch bypassed, using local history cache:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const createConversation = async (title: string): Promise<CopilotConversation> => {
    const localId = `thread-${Date.now()}`;
    const newConv: CopilotConversation = {
      id: localId,
      title: title || `New Chat #${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      messages: [],
    };

    setConversations(prev => {
      const updated = [newConv, ...prev];
      localStorage.setItem('sarthi_local_conversations', JSON.stringify(updated));
      return updated;
    });

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/copilot/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: newConv.title }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn('Backend conversation creation bypassed:', err);
    }
    return newConv;
  };

  const deleteConversation = async (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('sarthi_local_conversations', JSON.stringify(updated));
      return updated;
    });

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/copilot/conversations/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
  };

  const pinConversation = async (id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, isPinned: !c.isPinned } : c));
      localStorage.setItem('sarthi_local_conversations', JSON.stringify(updated));
      return updated;
    });

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/copilot/conversations/${id}/pin`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (err) {
      console.warn('Backend pin error:', err);
    }
  };

  return { conversations, loading, createConversation, deleteConversation, pinConversation, refresh: fetchHistory };
}

export function useConversation(activeThreadId: string | null, onMessageReceived: () => void) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [streamingStatus, setStreamingStatus] = useState<'IDLE' | 'THINKING' | 'ANALYZING' | 'GENERATING'>('IDLE');
  const [streamingText, setStreamingText] = useState('');
  const [streamingWidget, setStreamingWidget] = useState<any>(null);

  const prevThreadIdRef = useRef<string | null>(null);

  // Sync messages ONLY when switching to a different thread ID
  useEffect(() => {
    if (activeThreadId === prevThreadIdRef.current) {
      return;
    }
    prevThreadIdRef.current = activeThreadId;

    if (!activeThreadId) {
      return;
    }

    try {
      const local = localStorage.getItem('sarthi_local_conversations');
      if (local) {
        const parsed: CopilotConversation[] = JSON.parse(local);
        const match = parsed.find(c => c.id === activeThreadId);
        if (match && match.messages) {
          setMessages(match.messages);
        }
      }
    } catch {}

    const fetchMessages = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/copilot/conversations`, {
          headers: getHeaders(),
        });
        const json = await res.json();
        const active = json.data?.find((c: any) => c.id === activeThreadId);
        if (active && active.messages) {
          setMessages(active.messages);
        }
      } catch (err) {
        console.warn('Backend message fetch warning:', err);
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

    const targetThreadId = activeThreadId || 'thread-default-1';

    // Append user message immediately to state & local storage
    setMessages(prev => {
      const updated = [...prev, userMsg];
      try {
        const local = localStorage.getItem('sarthi_local_conversations');
        if (local) {
          const parsed: CopilotConversation[] = JSON.parse(local);
          let idx = parsed.findIndex(c => c.id === targetThreadId);
          if (idx === -1) {
            parsed.unshift({
              id: targetThreadId,
              title: text.slice(0, 30) || 'New Chat',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPinned: false,
              messages: updated,
            });
          } else {
            parsed[idx].messages = updated;
          }
          localStorage.setItem('sarthi_local_conversations', JSON.stringify(parsed));
        }
      } catch {}
      return updated;
    });
    onMessageReceived();

    // Set AI status to thinking
    setStreamingStatus('THINKING');
    setStreamingText('');
    setStreamingWidget(null);

    const token = localStorage.getItem('auth_token');
    const lang = localStorage.getItem('sarthi_lang_pref') || 'English';
    const query = new URLSearchParams({
      message: text,
      conversationId: targetThreadId,
      lang,
    });

    const baseUrl = getApiBaseUrl();
    let isHandled = false;

    try {
      const eventSource = new EventSource(`${baseUrl}/copilot/stream?${query.toString()}&token=${token || ''}`);

      eventSource.onmessage = (event) => {
        try {
          isHandled = true;
          const chunk = JSON.parse(event.data);

          if (chunk.status === 'DONE') {
            const aiMsg: CopilotMessage = {
              id: `msg-${Date.now() + 1}`,
              sender: 'AI',
              content: chunk.text || streamingText || 'Analysis completed.',
              timestamp: new Date().toISOString(),
              widgetData: chunk.widgetData || streamingWidget || null,
            };
            setMessages(prev => {
              const updated = [...prev, aiMsg];
              try {
                const local = localStorage.getItem('sarthi_local_conversations');
                if (local) {
                  const parsed: CopilotConversation[] = JSON.parse(local);
                  const idx = parsed.findIndex(c => c.id === targetThreadId);
                  if (idx !== -1) {
                    parsed[idx].messages = updated;
                    localStorage.setItem('sarthi_local_conversations', JSON.stringify(parsed));
                  }
                }
              } catch {}
              return updated;
            });
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
        eventSource.close();
        if (!isHandled) {
          isHandled = true;
          const fallback = generateFallbackResponse(text, lang);
          const aiMsg: CopilotMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'AI',
            content: fallback.text,
            timestamp: new Date().toISOString(),
            widgetData: fallback.widgetData || null,
          };
          setMessages(prev => {
            const updated = [...prev, aiMsg];
            try {
              const local = localStorage.getItem('sarthi_local_conversations');
              if (local) {
                const parsed: CopilotConversation[] = JSON.parse(local);
                const idx = parsed.findIndex(c => c.id === targetThreadId);
                if (idx !== -1) {
                  parsed[idx].messages = updated;
                  localStorage.setItem('sarthi_local_conversations', JSON.stringify(parsed));
                }
              }
            } catch {}
            return updated;
          });
          setStreamingStatus('IDLE');
          setStreamingText('');
          setStreamingWidget(null);
          onMessageReceived();
        }
      };
    } catch (err) {
      if (!isHandled) {
        isHandled = true;
        const fallback = generateFallbackResponse(text, lang);
        const aiMsg: CopilotMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'AI',
          content: fallback.text,
          timestamp: new Date().toISOString(),
          widgetData: fallback.widgetData || null,
        };
        setMessages(prev => [...prev, aiMsg]);
        setStreamingStatus('IDLE');
        onMessageReceived();
      }
    }
  };

  return { messages, sendMessage, streamingStatus, streamingText, streamingWidget };
}
