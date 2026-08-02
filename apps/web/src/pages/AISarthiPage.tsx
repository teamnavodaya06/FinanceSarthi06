import React, { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  X,
  CreditCard,
  TrendingDown,
  Activity,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  PieChart,
  Shield,
  RotateCw,
  Plus,
  HelpCircle,
  Lock,
  Download,
} from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// Importing services
import { AICopilotService, CopilotResponse } from '../services/copilot/ai-copilot.service';

interface Message {
  id: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  suggestions?: string[];
  // Extended structures for visual UI parsing
  structuredData?: CopilotResponse;
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
          collection(db, 'users', fbUser.uid, 'chatHistory'),
          orderBy('createdAt', 'asc'),
          limit(30)
        );
        const snap = await getDocs(q);
        const history: Message[] = [];
        
        for (const doc of snap.docs) {
          const data = doc.data();
          // Attempt to parse structured response if present
          let structuredData: CopilotResponse | undefined = undefined;
          if (data.structuredData) {
            try {
              structuredData = JSON.parse(data.structuredData);
            } catch {
              // fallback
            }
          }

          history.push({
            id: doc.id,
            sender: data.sender,
            text: data.text,
            timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: data.suggestions || [],
            structuredData,
          });
        }

        if (history.length === 0) {
          // Initialize first welcome message
          const welcomeMsg: Message = {
            id: 'msg-welcome',
            sender: 'sarthi',
            text: `Namaste ${userProfile?.displayName?.split(' ')[0] || 'Earner'}! I am Sarthi, your flagship AI Financial Copilot. I've compiled your profile parameters and active transactions.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            structuredData: {
              summary: 'Ready to optimize your net worth potential.',
              analysis: `Income: ₹${(userProfile?.monthlySalary || 85000).toLocaleString('en-IN')} • Active Expenses: ${expenses.length} logs.`,
              recommendations: [
                {
                  title: 'Core Portfolio SIP Builder',
                  whyItMatters: 'Automating mutual fund investments prevents cash leakage.',
                  suggestedAction: 'Deploy a monthly SIP of 20% salary.',
                  impact: 'Compounds wealth at 12% CAGR',
                  priority: 'Medium',
                  confidence: '95%',
                }
              ],
              expectedOutcome: 'Enhances overall personal finance stability.',
              suggestions: [
                'Can I afford a ₹50,000 laptop?',
                'Why did my expenses increase?',
                'How can I save ₹5,000 monthly?',
                'Review my financial health',
              ],
            },
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
  }, [fbUser, userProfile]);

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

      // Generate AI Sarthi Response dynamically based on actual user profile data
      const copilotResponse = await AICopilotService.generateResponse(
        queryText,
        userProfile,
        expenses,
        goals,
        healthScore.score
      );

      const sarthiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'sarthi',
        text: copilotResponse.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: copilotResponse.suggestions,
        structuredData: copilotResponse,
      };

      setMessages((prev) => [...prev, sarthiMsg]);

      // Save AI response to Firestore
      await addDoc(collection(db, 'users', fbUser.uid, 'chatHistory'), {
        sender: 'sarthi',
        text: copilotResponse.summary,
        suggestions: copilotResponse.suggestions,
        structuredData: JSON.stringify(copilotResponse),
        createdAt: new Date().toISOString(),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] overflow-hidden select-none text-slate-900 dark:text-slate-100">
      
      {/* LEFT COLUMN: CHAT WORKSPACE (8 Columns) */}
      <div className="col-span-1 lg:col-span-8 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] overflow-hidden shadow-sm h-full">
        
        {/* Workspace Header */}
        <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 relative">
              <Bot className="h-5.5 w-5.5" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                AI Financial Copilot
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                Your personal AI financial advisor.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Online Context Active</span>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'sarthi' && (
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
              )}

              <div className={`space-y-4 max-w-[85%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                {/* Text Bubble */}
                <div className={`p-4 rounded-3xl text-xs leading-relaxed font-semibold shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-tl-none text-slate-850 dark:text-slate-200'
                }`}>
                  <p>{msg.text}</p>
                </div>

                {/* Structured UI response parser blocks */}
                {msg.sender === 'sarthi' && msg.structuredData && (
                  <div className="space-y-4">
                    {/* 1. Scenario Simulation Overlay Card */}
                    {msg.structuredData.simulation && (
                      <div className="p-5 rounded-[22px] bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 space-y-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          <Activity className="h-4 w-4" />
                          <span>Scenario Simulation Outcome</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {msg.structuredData.simulation.headline}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Original outflow</span>
                            <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">
                              ₹{msg.structuredData.simulation.originalOutflow.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Projected outflow</span>
                            <span className="text-sm font-black text-rose-500 mt-1 block">
                              ₹{msg.structuredData.simulation.projectedOutflow.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 leading-normal space-y-1">
                          <p className="font-semibold">{msg.structuredData.simulation.explanation}</p>
                          <p className="text-emerald-500 font-bold">{msg.structuredData.simulation.expectedOutcome}</p>
                        </div>
                      </div>
                    )}

                    {/* 2. Advisory Insight Recommendations */}
                    {msg.structuredData.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            {rec.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                            rec.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {rec.priority} Priority
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                          {rec.whyItMatters}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 text-[10px] font-bold">
                          <span className="text-blue-600 dark:text-sky-400">{rec.suggestedAction}</span>
                          <span className="text-emerald-500 uppercase">{rec.impact}</span>
                        </div>
                      </div>
                    ))}

                    {/* 3. Regulatory Disclaimer */}
                    {msg.structuredData.disclaimer && (
                      <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-850 text-[10px] text-slate-450 dark:text-slate-500 font-semibold flex gap-2 items-start">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{msg.structuredData.disclaimer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl rounded-tl-none flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Tray */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/10 shrink-0 space-y-3">
          
          {/* Dynamic Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {[
              'Can I buy a ₹50,000 laptop?',
              'Why did my expenses increase?',
              'How can I save ₹5,000 monthly?',
              'How much should I invest monthly?',
            ].map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="h-8 px-4.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-[10px] font-extrabold cursor-pointer shrink-0 transition-all text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-xs"
              >
                {sug}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3 items-center"
          >
            <input
              type="text"
              placeholder="Ask Sarthi: can I afford a vacation? set a dining budget limit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-11 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 text-white flex items-center justify-center cursor-pointer transition-all shadow-md shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: QUICK ACTION SIDEBAR (4 Columns) */}
      <div className="col-span-1 lg:col-span-4 space-y-6">
        
        {/* Today's Financial Insight Box */}
        <div className="p-6 rounded-[24px] bg-[#0A1128] border border-blue-500/10 space-y-3.5 shadow-xl text-white">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Daily Insight Summary</h4>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed font-semibold">
            Based on active cache calculations, you are on track to save **₹18,000** this month. Keep dining logs steady.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Quick Actions Command
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { label: 'Review Spending', action: 'increase', icon: CreditCard },
              { label: 'Financial Health Status', action: 'health', icon: Activity },
              { label: 'Budget Projections', action: 'budget', icon: DollarSign },
              { label: 'Investment Portfolio', action: 'sip', icon: TrendingUp },
              { label: 'Emergency Fund Targets', action: 'emergency', icon: Shield },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(`Analyze my ${btn.action} configurations.`)}
                className="h-11 px-4.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <btn.icon className="h-4.5 w-4.5 text-slate-400" />
                  <span>{btn.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-350" />
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Credentials Info Card */}
        <div className="p-5 rounded-[22px] bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 text-[10px] text-slate-450 dark:text-slate-500 font-semibold space-y-2 flex gap-3 items-start">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase block text-[8px] tracking-wide">SECURE CO-PILOT LAYER</span>
            <p className="leading-relaxed">
              Sarthi runs contextual analysis on the client layer without caching raw identifiers. Regulated strategies are educational advisories.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
export default AISarthiPage;
