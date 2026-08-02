import React, { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, X, Sparkles, User, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';

interface Message {
  id: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AISarthiDrawer: React.FC = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen, user: finUser, expenses, goals, healthScore } = useFinancial();
  const { userProfile, user: fbUser } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history from Firestore
  useEffect(() => {
    if (!isAiDrawerOpen || !fbUser) return;

    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'users', fbUser.uid, 'chatHistory'),
          orderBy('createdAt', 'asc'),
          limit(30)
        );
        const snap = await getDocs(q);
        const history: Message[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          history.push({
            id: doc.id,
            sender: data.sender,
            text: data.text,
            timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: data.suggestions || [],
          });
        });

        if (history.length === 0) {
          // Initialize first welcome message
          const welcomeMsg: Message = {
            id: 'msg-welcome',
            sender: 'sarthi',
            text: `Namaste ${userProfile?.displayName?.split(' ')[0] || 'Earner'}! I am **FinanceSarthi**, your AI Financial Companion.\n\nI have reviewed your financial profile:\n- **Monthly Income**: ₹${(userProfile?.monthlySalary || 75000).toLocaleString('en-IN')}\n- **City Tier**: ${userProfile?.cityTier || 'TIER_2'}\n- **Financial Health Score**: ${healthScore.score}/1000 (${healthScore.grade})\n\nHow can I help you optimize your wealth today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              'How can I save maximum tax under New Regime?',
              'Recommend an optimal monthly SIP breakdown.',
              'How long will it take to complete my Emergency Fund goal?',
              'Should I prepay my Car Loan or invest in Equity SIPs?',
            ],
          };
          setMessages([welcomeMsg]);
        } else {
          setMessages(history);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    };

    loadHistory();
  }, [isAiDrawerOpen, fbUser, userProfile, healthScore]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || !fbUser) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Save User Message to Firestore
      await addDoc(collection(db, 'users', fbUser.uid, 'chatHistory'), {
        sender: 'user',
        text: queryText,
        createdAt: new Date().toISOString(),
      });

      // Fetch AI response
      const response = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          context: {
            monthlyIncome: userProfile?.monthlySalary || 75000,
            cityTier: userProfile?.cityTier || 'TIER_2',
            healthScore: healthScore.score,
            expensesCount: expenses.length,
            activeGoalsCount: goals.length,
          },
        }),
      }).catch(() => null);

      let aiText = '';
      let suggestions: string[] = [];

      if (response && response.ok) {
        const data = await response.json();
        aiText = data.text;
        suggestions = data.suggestions || [];
      } else {
        // Fallback generator
        aiText = generateClientFallbackResponse(queryText, userProfile);
        suggestions = [
          'Show me how to save more on 80C and 80D',
          'Calculate returns for a ₹10,000 monthly SIP',
          'How to reduce monthly expense spillover?',
        ];
      }

      // Add AI response to UI
      const sarthiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'sarthi',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };

      setMessages((prev) => [...prev, sarthiMsg]);

      // Save AI response to Firestore
      await addDoc(collection(db, 'users', fbUser.uid, 'chatHistory'), {
        sender: 'sarthi',
        text: aiText,
        suggestions,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientFallbackResponse = (q: string, usr: any) => {
    const l = q.toLowerCase();
    if (l.includes('tax') || l.includes('80c') || l.includes('regime')) {
      return `### 📊 Tax Strategy Analysis for ₹${(usr?.monthlySalary || 75000).toLocaleString('en-IN')}/mo\n\n1. **New Tax Regime**: Zero tax liability if taxable income is under ₹7 Lakhs annually, plus standard deduction of **₹75,000**.\n2. **Old Tax Regime**: Superior if your deductions (80C ₹1.5L + 80D ₹25k + HRA) exceed **₹3.75 Lakhs**.\n\n💡 **Recommendation**: Use our **Salary & Tax Planner** tab to dynamically toggle deductions and view side-by-side net savings.`;
    }
    if (l.includes('sip') || l.includes('invest') || l.includes('mutual fund')) {
      const sip = Math.round((usr?.monthlySalary || 75000) * 0.2);
      return `### 📈 Optimal Monthly SIP Breakdown\n\nWe recommend a monthly allocation of **₹${sip.toLocaleString('en-IN')} (20%)**:\n- **50% Core Equity**: Nifty 50 Index Fund (₹${Math.round(sip * 0.5).toLocaleString('en-IN')})\n- **30% Flexi Cap Growth**: Parag Parikh or Flexi Cap (₹${Math.round(sip * 0.3).toLocaleString('en-IN')})\n- **20% Small Cap / Sectoral**: Quant or Nippon Small Cap (₹${Math.round(sip * 0.2).toLocaleString('en-IN')})\n\n🚀 *Expected 10-Year Corpus at 12% CAGR*: **₹${(sip * 230).toLocaleString('en-IN')}**!`;
    }
    return `### 💡 Smart Financial Advice\n\nBased on your **${usr?.cityTier || 'TIER_2'}** earner profile, here are 3 key priorities:\n1. Maintain a **6-month liquid emergency fund** before expanding equity investments.\n2. Keep your **Debt-to-Income ratio below 30%**.\n3. Automate SIP transfers on your salary credit day.`;
  };

  return (
    <AnimatePresence>
      {isAiDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    AI Sarthi Financial Coach
                    <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  </h3>
                  <span className="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Context Aware & Gemini Powered
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'sarthi' && (
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-tr-none shadow-md'
                          : 'glass-card text-slate-200 rounded-tl-none border border-slate-800'
                      }`}
                    >
                      {m.text.split('\n').map((line, idx) => (
                        <p key={idx} className={line.startsWith('#') ? 'font-bold text-sm text-sky-400 my-1' : 'my-0.5'}>
                          {line.replace(/^#+\s*/, '')}
                        </p>
                      ))}
                    </div>

                    {/* Suggestions */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="text-[10px] py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-blue-500/30 transition-all text-left flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle className="h-3 w-3 text-sky-400 shrink-0" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className={`text-[9px] text-slate-500 block ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                      <User className="h-4 w-4 text-sky-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl glass-card text-xs text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce delay-200" />
                    <span>Analyzing financial context...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Sarthi anything about your money..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
