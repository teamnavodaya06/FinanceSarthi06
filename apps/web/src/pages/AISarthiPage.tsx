import React, { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Sparkles, User, HelpCircle, Lock, ShieldCheck, Search, Paperclip, MessageSquare } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';

interface Message {
  id: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AISarthiPage: React.FC = () => {
  const { expenses, goals, healthScore } = useFinancial();
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

  // Load chat history from Firestore on mount
  useEffect(() => {
    if (!fbUser) return;

    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'chatHistory'),
          where('userId', '==', fbUser.uid),
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
            text: `Namaste ${userProfile?.displayName?.split(' ')[0] || 'Earner'}! I am **Sarthi**. I've analyzed your spending and targets for this month.\n\nYou have completed your profile parameters. Would you like to see a custom SIP breakdown or set a temporary limit for the next week?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              'Compare ELSS funds',
              'Set dining limit',
              'Download tax report',
              'Check SIP status',
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
  }, [fbUser, userProfile, healthScore]);

  const generateClientFallbackResponse = (q: string, usr: any) => {
    const l = q.toLowerCase();
    if (l.includes('tax') || l.includes('80c') || l.includes('regime') || l.includes('elss')) {
      return `### 📊 Tax Strategy Analysis for ₹${(usr?.monthlySalary || 75000).toLocaleString('en-IN')}/mo\n\n1. **New Tax Regime**: Zero tax liability if taxable income is under ₹7 Lakhs annually, plus standard deduction of **₹75,000**.\n2. **Old Tax Regime**: Superior if your deductions (80C ₹1.5L + 80D ₹25k + HRA) exceed **₹3.75 Lakhs**.\n\n💡 **Recommendation**: Use our **Salary & Tax Planner** tab to dynamically toggle deductions and view side-by-side net savings.`;
    }
    if (l.includes('sip') || l.includes('invest') || l.includes('mutual fund') || l.includes('wealth')) {
      const sip = Math.round((usr?.monthlySalary || 75000) * 0.2);
      return `### 📈 Optimal Monthly SIP Breakdown\n\nWe recommend a monthly allocation of **₹${sip.toLocaleString('en-IN')} (20%)**:\n- **50% Core Equity**: Nifty 50 Index Fund (₹${Math.round(sip * 0.5).toLocaleString('en-IN')})\n- **30% Flexi Cap Growth**: Parag Parikh or Flexi Cap (₹${Math.round(sip * 0.3).toLocaleString('en-IN')})\n- **20% Small Cap / Sectoral**: Quant or Nippon Small Cap (₹${Math.round(sip * 0.2).toLocaleString('en-IN')})\n\n🚀 *Expected 10-Year Corpus at 12% CAGR*: **₹${(sip * 230).toLocaleString('en-IN')}**!`;
    }
    return `### 💡 Smart Financial Advice\n\nBased on your **${usr?.cityTier || 'TIER_2'}** earner profile, here are 3 key priorities:\n1. Maintain a **6-month liquid emergency fund** before expanding equity investments.\n2. Keep your **Debt-to-Income ratio below 30%**.\n3. Automate SIP transfers on your salary credit day.`;
  };

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
      await addDoc(collection(db, 'chatHistory'), {
        userId: fbUser.uid,
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
          'Set dining limit',
          'Compare ELSS funds',
          'Download tax report',
          'Check SIP status',
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
      await addDoc(collection(db, 'chatHistory'), {
        userId: fbUser.uid,
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

  const getTodayDateString = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `Today, ${today.toLocaleDateString('en-IN', options)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] overflow-hidden select-none">
      
      {/* COLUMN 1 & 2: MAIN CHAT PANEL (8 Columns on desktop) */}
      <div className="col-span-1 lg:col-span-8 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm h-full">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
              <Bot className="h-6 w-6" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                AI Sarthi Assistant
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                Always active for your financial growth
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span>Your data stays private</span>
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFCFF] dark:bg-[#081120]/10">
          
          {/* Date Separator */}
          <div className="relative flex justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative px-4 py-1 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {getTodayDateString()}
            </div>
          </div>

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Bot Avatar */}
              {m.sender === 'sarthi' && (
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
              )}

              <div className="max-w-[75%] space-y-2">
                <div
                  className={`p-4 rounded-[20px] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-tr-none shadow-sm shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-850 shadow-sm'
                  }`}
                >
                  {m.text.split('\n').map((line, idx) => (
                    <p key={idx} className={line.startsWith('#') ? 'font-bold text-sm text-blue-600 dark:text-blue-400 my-1' : 'my-0.5'}>
                      {line.replace(/^#+\s*/, '')}
                    </p>
                  ))}

                  {/* Curated Inner action pick cards (Rendered only on fallback / welcome) */}
                  {m.id === 'msg-welcome' && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div
                        onClick={() => handleSend('Show dining limit breakdown')}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer text-center"
                      >
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block">Dining Breakdown</span>
                      </div>
                      <div
                        onClick={() => handleSend('Compare ELSS funds')}
                        className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer text-center"
                      >
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">Tax Saver Pick</span>
                      </div>
                    </div>
                  )}
                </div>

                <span className={`text-[9px] text-slate-400 dark:text-slate-500 block font-semibold ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </span>
              </div>

              {/* User Avatar */}
              {m.sender === 'user' && (
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {fbUser?.photoURL ? (
                    <img className="h-full w-full rounded-xl object-cover" src={fbUser.photoURL} alt="" />
                  ) : (
                    <User className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Bot className="h-4.5 w-4.5 animate-spin" />
              </div>
              <div className="p-4 rounded-[20px] bg-white dark:bg-slate-950 text-xs text-slate-400 flex items-center gap-2 border border-slate-200 dark:border-slate-850 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-100" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-200" />
                <span className="font-semibold text-[10px]">Analyzing financial parameters...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Suggestion Chips */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3">
          
          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-w-full">
            {messages.length > 0 && messages[messages.length - 1].suggestions?.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sug)}
                className="text-[10px] py-1.5 px-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all font-semibold cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Chat Form Capsule */}
          <div className="relative h-14 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 transition-all rounded-[28px] flex items-center px-4">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your Sarthi anything about your money..."
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none px-3 py-2"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 3: RIGHT PANEL - HISTORY & INSIGHTS (4 Columns on desktop) */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 h-full overflow-y-auto pr-1">
        
        {/* Widget 1: Quick Insights */}
        <div className="space-y-3 shrink-0">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Quick Insights</span>
          
          {/* Smart Tip Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Smart Tip</h4>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
              You have ₹12,000 idle in your savings account. Moving it to a Liquid Fund could earn you more interest.
            </p>
          </div>

          {/* Recent Queries Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Recent Queries</h4>
            </div>
            <div className="space-y-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {[
                'How to save on GST?',
                'Best small cap funds 2024',
                'Rent vs Buy calculator',
              ].map((queryStr, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSend(queryStr)}
                  className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-all"
                >
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>{queryStr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Chat History */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 shadow-sm min-h-[300px]">
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Chat History</span>
            
            <div className="space-y-3">
              {[
                { title: 'August Portfolio Review', time: 'Last message 2 weeks ago' },
                { title: 'Home Loan Eligibility', time: 'Last message 1 month ago' },
                { title: 'Wedding Savings Plan', time: 'Last message 3 months ago' },
              ].map((historySession, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-75 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all cursor-pointer flex items-start gap-3"
                >
                  <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{historySession.title}</h5>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">{historySession.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sarthi Security Check Footer */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 mt-4 shrink-0">
            <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Sarthi Security</h5>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium leading-normal">
                End-to-end encrypted financial advice.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
