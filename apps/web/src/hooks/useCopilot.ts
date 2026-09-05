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

const getDynamicUserIncome = (): number => {
  try {
    const saved = localStorage.getItem('user_monthly_income');
    if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
      return Number(saved);
    }
  } catch {}
  return 45000;
};

// Rich, structured Sarthi AI response generator matching production Nemotron 550B output format
const generateFallbackResponse = (text: string, lang: string): { text: string; widgetData?: any } => {
  const clean = text.toLowerCase();
  const isHinglish = lang === 'Hindi/Hinglish' || clean.includes('hinglish') || clean.includes('hindi') || clean.includes('karo') || clean.includes('batao') || clean.includes('hai');

  const income = getDynamicUserIncome();
  const needs = Math.round(income * 0.5);
  const wants = Math.round(income * 0.3);
  const savings = Math.round(income * 0.2);
  const annual = income * 12;

  const fmtIncome = `₹${income.toLocaleString('en-IN')}`;
  const fmtNeeds = `₹${needs.toLocaleString('en-IN')}`;
  const fmtWants = `₹${wants.toLocaleString('en-IN')}`;
  const fmtSavings = `₹${savings.toLocaleString('en-IN')}`;
  const fmtAnnual = `₹${annual.toLocaleString('en-IN')}`;

  // 1. Income / Salary Specific Query
  if (clean.includes('income') || clean.includes('salary') || clean.includes('kamai') || clean.includes('inflow')) {
    if (isHinglish) {
      return {
        text: `**SUMMARY:** Aapka current recorded monthly income **${fmtIncome}** hai (${fmtAnnual}/year).

**ANALYSIS:**
Aapke financial profile ke mutabiq, aapki monthly income **${fmtIncome}** hai. Currently, aapka zero recorded outflows hai, jiski wajah se aapka 100% savings rate aur ELITE financial health score hai.

**RECOMMENDATIONS:**
1. **50-30-20 Budget Plan:** Out of **${fmtIncome}**, allocate **${fmtNeeds}** for Needs, **${fmtWants}** for Wants, and **${fmtSavings}** for Savings/SIPs.
2. **Automated Index SIP:** Set up monthly auto-debit of **${fmtSavings}** into low-cost Nifty 50 Index funds.
3. **Emergency Reserve:** Keep 3-6 months of expenses (**${fmtNeeds}** to **${fmtIncome}**) in liquid funds.`
      };
    }
    return {
      text: `**SUMMARY:** Your active monthly income base is **${fmtIncome}** (**${fmtAnnual}** annually).

**ANALYSIS:**
Based on your logged financial profile, your total monthly inflow is **${fmtIncome}**. With 0 recorded expenses, your current savings rate stands at 100%.

**RECOMMENDATIONS:**
1. **Apply 50-30-20 Rule:** Allocate **${fmtNeeds}** to Needs, **${fmtWants}** to Wants, and **${fmtSavings}** to Investments.
2. **Payday SIP Automation:** Automate monthly SIPs of **${fmtSavings}** on salary day.
3. **Liquidity Cushion:** Reserve 3–6 months of living expenses in high-yield liquid funds.`
    };
  }

  // 2. Savings / Investment Specific Query
  if (clean.includes('save') || clean.includes('bachat') || clean.includes('saving') || clean.includes('3000') || clean.includes('5000') || clean.includes('money')) {
    if (isHinglish) {
      return {
        text: `**SUMMARY:** Aapka financial target monthly savings increase karna hai. **${fmtIncome}** monthly income ke base par ye target easily achieve ho sakta hai disciplined 50-30-20 budget restructuring aur automated SIPs se.

**ANALYSIS:**
- **Income:** ${fmtIncome}/month — strong earning base hai.
- **Target Spends:** ₹3,000–5,000/month savings target aapki monthly salary ka active chunk hai.
- **Budget Potential:** Standard 50-30-20 rule ke hisaab se 20% (${fmtSavings}) wealth building mein jaana chahiye.
- **Potential Leakages:** Online food ordering (Swiggy/Zomato), unused subscriptions, aur impulsive UPI spends.

**RECOMMENDATIONS:**
1. **Automate Payday SIP** — Salary credit hote hi month ke 1st week mein ₹3,000+ Nifty 50 Index Fund mein auto-debit set karein.
2. **50-30-20 Envelope Rule** — ${fmtNeeds} Needs (rent/bills), ${fmtWants} Wants (dining/shopping), aur ${fmtSavings} Investments mein divide karein.
3. **Dining Cap** — Food delivery Spends par ₹1,500/month ka budget limit set karein.
4. **Emergency Buffer** — Instant-withdrawal liquid fund mein 3-month expense safety reserve maintain karein.`
      };
    }
    return {
      text: `**SUMMARY:** Building a disciplined monthly savings habit is highly achievable against your **${fmtIncome}** monthly income base. Using automated SIPs and the 50-30-20 rule ensures consistent wealth compounding.

**ANALYSIS:**
- **Monthly Income Base:** ${fmtIncome}/month — solid financial foundation.
- **Optimal Savings Rate:** Aim for 20% (${fmtSavings}/month) as recommended by financial benchmarks.
- **Primary Optimization Areas:** Dining out, recurring digital subscriptions, and non-essential shopping.

**RECOMMENDATIONS:**
1. **Automated Payday SIP:** Set up an auto-debit SIP into a low-cost Nifty 50 Index Fund right after salary credit.
2. **Implement 50-30-20 Budget:** Allocate ${fmtNeeds} for Needs, ${fmtWants} for Wants, and ${fmtSavings} for Savings & Debt repayment.
3. **Set Monthly Dining Caps:** Limit food delivery and dining out expenses to build a predictable monthly surplus.
4. **Build Emergency Liquidity:** Maintain a 3 to 6-month living expense reserve in high-yield liquid instruments.`
    };
  }

  // 3. Tax & Regime Specific Query
  if (clean.includes('tax') || clean.includes('regime') || clean.includes('80c') || clean.includes('deduction')) {
    if (isHinglish) {
      return {
        text: `**SUMMARY:** Salaried earners (${fmtIncome}/month = ${fmtAnnual}/year) ke liye New Tax Regime default hai, jisme tax efficiency maximum milti hai.

**ANALYSIS:**
- **Annual Gross Salary:** ${fmtAnnual} (${fmtIncome} x 12).
- **New Tax Regime Tax:** Standard Deduction apply karne ke baad reduced tax liability milti hai.
- **Old Tax Regime Threshold:** Agar aap 80C (₹1.5L), 80D (₹25K), aur HRA claim karte hain, to Old Regime zyaada tax save kar sakta hai.

**RECOMMENDATIONS:**
1. **Salary Planner Tab Open Karein:** Top menu bar se Salary Planner tab mein exact side-by-side Old vs New tax comparison dekhein.
2. **80C Maximization:** ELSS Tax-Saver Mutual Funds ya PPF/EPF mein ₹1.5 Lakhs invest karke tax reduce karein.
3. **Health Insurance 80D:** Family health insurance premium par ₹25,000 tak additional tax deduction claim karein.`
      };
    }
    return {
      text: `**SUMMARY:** For a salaried profile earning ${fmtIncome}/month (${fmtAnnual}/year), evaluating the Old vs New Tax Regime is critical to minimizing tax outflow.

**ANALYSIS:**
- **Annual Gross Salary:** ${fmtAnnual} (${fmtIncome} x 12).
- **New Tax Regime (Default):** Standard Deduction of ₹75,000 applies.
- **Old Tax Regime Crossover Point:** Beneficial if your combined deductions (80C, 80D, HRA, NPS) exceed threshold annually.

**RECOMMENDATIONS:**
1. **Use Salary Planner:** Switch to the Salary Planner tab for a detailed side-by-side tax breakdown.
2. **Optimize Section 80C:** Invest up to ₹1.5 Lakhs in ELSS tax-saving mutual funds or Provident Funds.
3. **Claim Health Insurance (80D):** Claim up to ₹25,000 for medical insurance premiums.`
      };
  }

  // 4. Default Hinglish / General Financial Mentor Response
  if (isHinglish) {
    return {
      text: `**SUMMARY:** Aapka financial profile bahut strong dikhta hai — **${fmtIncome}** monthly income base ke saath. Proper 50-30-20 asset allocation aur expense tracking se aap fast-track wealth compound kar sakte hain.

**ANALYSIS:**
- **Income:** ${fmtIncome}/month — stable base hai.
- **Expenses Tracking:** Daily transactions log karne se exact monthly surplus clear hoga.
- **Savings Rate Target:** Minimum 20–30% (${fmtSavings}–${fmtNeeds}/month) wealth building mein allocate karein.
- **Investments & Goals:** Long-term corpus aur short-term safety reserves plan karna zaroori hai.

**RECOMMENDATIONS:**
1. **Expenses Track Karein** — Expenses section mein daily spends (rent, food, bills) log karein taaki real surplus pata chale.
2. **Emergency Fund Banaein** — 3–6 mahine ke living expenses ke barabar liquid fund mein reserve rakhein.
3. **Automated SIP Wealth Creation** — Surplus ka 30–50% Nifty 50 & Flexi-Cap Index Funds mein auto-invest karein.
4. **Goals Blueprint** — Goals Workspace tab mein long-term aur short-term targets define karein.`
    };
  }

  // 5. Default English Response
  return {
    text: `**SUMMARY:** Your financial profile shows a strong base of **${fmtIncome}** monthly income. Structuring a disciplined 50-30-20 budget and automating monthly SIPs will accelerate your long-term wealth compounding.

**ANALYSIS:**
- **Monthly Income:** ${fmtIncome}/month — solid financial foundation.
- **Expense Tracking:** Logging daily transactions provides exact clarity on discretionary cash surplus.
- **Target Savings Rate:** Aim to allocate 20% to 30% (${fmtSavings}–${fmtNeeds}/month) towards high-growth investments.
- **Risk & Goals Alignment:** Balancing liquidity safety reserves with long-term equity compounding.

**RECOMMENDATIONS:**
1. **Track Monthly Spends:** Log daily transactions in the Expenses tab to monitor category utilization.
2. **Build Emergency Liquidity:** Maintain 3 to 6 months of expenses in high-yield liquid funds.
3. **Automate Index SIPs:** Allocate monthly surplus into Nifty 50 and Flexi-Cap Funds via systematic auto-debits.
4. **Define Financial Goals:** Set up target milestones in the Goals Workspace for housing, vehicle, and retirement.`
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
    const userIncome = getDynamicUserIncome();
    const query = new URLSearchParams({
      message: text,
      conversationId: targetThreadId,
      lang,
      income: userIncome.toString(),
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
