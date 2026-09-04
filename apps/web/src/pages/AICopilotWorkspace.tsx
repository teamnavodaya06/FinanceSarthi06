import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  useConversationHistory, 
  useConversation 
} from '../hooks/useCopilot';
import { useBudgetHealth } from '../hooks/useAdaptiveBudget';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Paperclip, 
  Search, 
  Pin, 
  Trash2, 
  Plus, 
  Bot, 
  User, 
  Clock, 
  AlertTriangle,
  Zap,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Info,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

// =========================================================================
// LANGUAGE DETECTION UTILITIES
// =========================================================================

export function detectLanguage(text: string): string {
  const clean = text.toLowerCase();
  
  if (/[\u0B80-\u0BFF]/.test(text) || (clean.includes('analyse') && clean.includes('pannu'))) {
    return 'Tamil';
  }
  if (/[\u0A80-\u0AFF]/.test(text) || (clean.includes('kharch') && clean.includes('batavo'))) {
    return 'Gujarati';
  }
  if (/[\u0980-\u09FF]/.test(text) || clean.includes('bishleshon')) {
    return 'Bengali';
  }
  if (/[\u0C00-\u0C7F]/.test(text) || clean.includes('cheppu') || clean.includes('kharchulu')) {
    return 'Telugu';
  }
  if (/[\u0D00-\u0D7F]/.test(text) || clean.includes('chelavukal')) {
    return 'Malayalam';
  }
  if (/[\u0C80-\u0CFF]/.test(text) || clean.includes('kharchugalannu')) {
    return 'Kannada';
  }
  if (
    /[\u0900-\u097F]/.test(text) || 
    clean.includes('mera') || 
    clean.includes('karo') ||
    clean.includes('kharch') || 
    clean.includes('batao') || 
    clean.includes('hai') || 
    clean.includes('kya')
  ) {
    return 'Hindi/Hinglish';
  }
  
  return 'English';
}

const MULTILINGUAL_RESPONSES: Record<string, { summary: string; text: string; recommendation: string }> = {
  'English': {
    summary: 'Food spending increased by 12% this month.',
    text: 'Your dining and food expenses reached ₹8,400 this month, which is 12% higher than your average limit. Redirecting some Swiggy/Zomato orders could help optimize savings.',
    recommendation: 'Reduce dining out by 25% and cook at home to build a surplus envelope.'
  },
  'Hindi/Hinglish': {
    summary: 'Food spending pichle mahine se 12% badh gaya hai.',
    text: 'Aapka monthly food and dining spending ₹8,400 tak pahunch gaya hai, jo ki average limits se 12% up hai. Agar aap Swiggy/Zomato orders reduce karenge to savings increase hogi.',
    recommendation: 'Dining expenses check kijiye aur har mahine ₹840 extra SIP investments mein invest kijiye.'
  },
  'Tamil': {
    summary: 'இந்த மாத உணவுச் செலவு 12% அதிகரித்துள்ளது.',
    text: 'உங்கள் உணவுச் செலவு ₹8,400 ஐ எட்டியுள்ளது, இது உங்கள் சராசரி வரம்பை விட 12% அதிகமாகும். Swiggy ஆர்டர்களைக் குறைப்பது சேமிப்பை மேம்படுத்த உதவும்.',
    recommendation: 'உணவுச் செலவைக் குறைத்து, எஞ்சிய தொகையை SIP-யில் முதலீடு செய்யுங்கள்.'
  },
  'Gujarati': {
    summary: 'આ મહિને ખોરાકનો ખર્ચ ૧૨% વધી ગયો છે.',
    text: 'તમારો ખોરાકનો ખર્ચ ₹8,400 પર પહોંચી ગયો છે, જે સરેરાશ બજેટ મર્યાદા કરતાં ૧૨% વધારે છે. ખોરાકના ઓર્ડર ઘટાડવાથી SIP બચતમાં વધારો થશે.',
    recommendation: 'નકામા ખર્ચ ટાળો અને બચત કરેલી રકમ SIP મ્યુચ્યુઅલ ફંડમાં જમા કરો.'
  },
  'Bengali': {
    summary: 'এই মাসে খাবার খরচ ১২% বৃদ্ধি পেয়েছে।',
    text: 'আপনার খাবার খরচ ₹৮,৪০০ এ দাঁড়িয়েছে, যা আপনার স্বাভাবিক সীমার চেয়ে ১২% বেশি। অপ্রয়োজনীয় খাবার ডেলিভারি কমালে আপনার মাসিক সঞ্চয় বৃদ্ধি পাবে।',
    recommendation: 'খাবার খরচ নিয়ন্ত্রণ করুন এবং অতিরিক্ত টাকা SIP সঞ্চয়ে জমা দিন।'
  },
  'Telugu': {
    summary: 'ఈ నెల ఆహార ఖర్చులు 12% పెరిగాయి.',
    text: 'మీ భోజన ఖర్చులు ₹8,400 కి చేరాయి, ఇది సగటు బడ్జెట్ కంటే 12% ఎక్కువ. ఆన్‌లైన్ ఫుడ్ ఆర్డర్లు తగ్గించడం ద్వారా EMI బారిన పడకుండా ఉండవచ్చు.',
    recommendation: 'ఖర్చులను తగ్గించుకొని అదనపు పొదుపును SIP లో ఇన్వెస్ట్ చేయండి.'
  },
  'Malayalam': {
    summary: 'ഈ മാസം ഭക്ഷണ ചെലവുകൾ 12% വർദ്ധിച്ചു.',
    text: 'നിങ്ങളുടെ ഭക്ഷണ ചെലവുകൾ ₹8,400 ആയി ഉയർന്നു, ഇത് ശരാശരി ബജറ്റിനേക്കാൾ 12% കൂടുതലാണ്. ഓൺലൈൻ ഫുഡ് ഓർഡറുകൾ കുറച്ചാൽ ബജറ്റ് നിയന്ത്രണത്തിലാക്കാം.',
    recommendation: 'ഭക്ഷണ ചെലവുകൾ കുറച്ച് ബാക്കി തുക സ്ഥിരമായി SIP-യിൽ നിക്ഷേപിക്കുക.'
  },
  'Kannada': {
    summary: 'ಈ ತಿಂಗಳ ಆಹಾರ ವೆಚ್ಚ 12% ಹೆಚ್ಚಾಗಿದೆ.',
    text: 'ನಿಮ್ಮ ಆಹಾರದ ವೆಚ್ಚ ₹8,400 ತಲುಪಿದೆ, ಇದು ಸರಾಸರಿ ಬಜೆಟ್‌ಗಿಂತ 12% ಹೆಚ್ಚಾಗಿದೆ. ಆನ್‌ಲೈನ್ ಆಹಾರ ಆರ್ಡರ್‌ಗಳನ್ನು ಕಡಿಮೆ ಮಾಡುವುದರಿಂದ SIP ಉಳಿತಾಯ ಸುಧಾರಿಸುತ್ತದೆ.',
    recommendation: 'ನಿಮ್ಮ ಡೈನಿಂಗ್ ವೆಚ್ಚವನ್ನು ಕಡಿತಗೊಳಿಸಿ ಹಣವನ್ನು ಮ್ಯೂಚುವಲ್ ಫಂಡ್‌ಗೆ ವರ್ಗಾಯಿಸಿ.'
  }
};

export const AICopilotWorkspace: React.FC = () => {
  const { conversations, createConversation, deleteConversation, pinConversation } = useConversationHistory();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { messages, sendMessage, streamingStatus, streamingText, streamingWidget } = useConversation(activeThreadId, scrollChat);
  const { health } = useBudgetHealth();
  const { userProfile } = useAuth();
  const { expenses, incomeData } = useFinancial();

  // Search filter & inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'UP' | 'DOWN'>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Clean ChatGPT Sidebar States (Right collapsed by default for full width clean chat)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // Dynamic user language preference state
  const [preferredLang, setPreferredLang] = useState<string>(() => {
    return localStorage.getItem('sarthi_lang_pref') || 'English';
  });

  const userName = useMemo(() => {
    if (!userProfile?.displayName) return 'Rahul';
    return userProfile.displayName.split(' ')[0];
  }, [userProfile?.displayName]);

  const salary = incomeData?.monthlyIncome || 75000;
  const simRentAmount = () => 15000;

  // Textarea Refs for welcome and active chat footer state
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const footerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = () => {
    const textarea = messages.length === 0 ? welcomeTextareaRef.current : footerTextareaRef.current;
    if (textarea) {
      textarea.focus();
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
    }
  };

  // Auto expand textarea height on content change
  useEffect(() => {
    const textarea = messages.length === 0 ? welcomeTextareaRef.current : footerTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(44, Math.min(160, scrollHeight))}px`;
    }
  }, [inputVal, messages.length]);

  // Autofocus input after stream ends or on mount
  useEffect(() => {
    if (streamingStatus === 'IDLE') {
      focusInput();
    }
  }, [streamingStatus, messages.length]);

  // Group conversations by date intervals
  const groupedConversations = useMemo(() => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const lastWeek: any[] = [];
    const older: any[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    conversations.forEach(c => {
      const date = new Date(c.updatedAt || c.createdAt).getTime();
      const diff = startOfToday - date;

      if (date >= startOfToday) {
        today.push(c);
      } else if (diff < oneDay) {
        yesterday.push(c);
      } else if (diff < 7 * oneDay) {
        lastWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, lastWeek, older };
  }, [conversations]);

  // Clickable prompt cards
  const quickPrompts = [
    { label: '📊 Analyze my spending', desc: 'Category and merchant breakdown' },
    { label: '💰 Tax Optimization', desc: 'Old vs New Regime calculation' },
    { label: '📈 Optimize my SIP', desc: 'Wealth compounding forecasts' },
    { label: '🛡️ Emergency Fund Buffer', desc: '6-month liquidity safety plan' },
  ];

  // Auto-fill and send prompts
  const handlePromptClick = (label: string) => {
    const textOnly = label.replace(/[^\w\s\?]/g, '').trim();
    sendMessageWithLanguage(textOnly);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessageWithLanguage(inputVal);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendSubmit(e);
    }
  };

  const sendMessageWithLanguage = (text: string) => {
    const lang = detectLanguage(text);
    setPreferredLang(lang);
    localStorage.setItem('sarthi_lang_pref', lang);
    sendMessage(text);
  };

  // On initial load, auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeThreadId) {
      setActiveThreadId(conversations[0].id);
    }
  }, [conversations, activeThreadId]);

  const handleCreateNewChat = async () => {
    const title = `New Chat #${conversations.length + 1}`;
    const newChat = await createConversation(title);
    if (newChat) {
      setActiveThreadId(newChat.id);
    }
  };

  const handleCopyMsg = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const activeThreadObj = conversations.find(c => c.id === activeThreadId);

  // Intercept response outputs to render inline widgets
  const getWidgetForMessage = (content: string) => {
    const query = content.toLowerCase();
    const resPayload = MULTILINGUAL_RESPONSES[preferredLang] || MULTILINGUAL_RESPONSES['English'];

    if (query.includes('spending') || query.includes('analyze') || query.includes('food') || query.includes('expense')) {
      const categoriesData = [
        { name: 'Housing', value: simRentAmount(), color: '#2563EB' },
        { name: 'Food', value: 8400, color: '#10B981' },
        { name: 'Transport', value: 5000, color: '#F59E0B' },
        { name: 'Utilities', value: 6000, color: '#94A3B8' },
        { name: 'Others', value: 7100, color: '#E2E8F0' },
      ];
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 my-2">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Food & Dining Analysis</span>
              <h4 className="text-lg font-bold text-white mt-0.5">₹8,400 <span className="text-xs text-rose-500 font-semibold">↑12% higher</span></h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">Target: ₹840</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                  {categoriesData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Sarthi Insight</span>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">{resPayload.text}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      
      {/* 1. CHATGPT-STYLE COLLAPSIBLE LEFT SIDEBAR */}
      <aside className={`border-r border-slate-900 bg-slate-950 flex flex-col transition-all duration-300 shrink-0 z-20 ${
        isLeftCollapsed ? 'w-0 overflow-hidden' : 'w-64 sm:w-72'
      }`}>
        <div className="p-3.5 space-y-3 flex-1 flex flex-col overflow-hidden">
          
          {/* New Chat Button */}
          <button
            onClick={handleCreateNewChat}
            className="w-full h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer shrink-0"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </span>
            <Sparkles className="h-3.5 w-3.5 opacity-80" />
          </button>

          {/* Search Bar */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Conversations History List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <Clock className="h-5 w-5 mx-auto opacity-50" />
                <p className="text-[11px]">No chat history yet.</p>
              </div>
            ) : (
              <>
                {groupedConversations.today.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 px-2 block">Today</span>
                    {groupedConversations.today.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setActiveThreadId(item.id)}
                        className={`group px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          activeThreadId === item.id 
                            ? 'bg-slate-900 text-white font-semibold' 
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{item.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); pinConversation(item.id); }} className="p-1 hover:text-blue-400"><Pin className="h-3 w-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {groupedConversations.yesterday.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 px-2 block">Yesterday</span>
                    {groupedConversations.yesterday.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setActiveThreadId(item.id)}
                        className={`group px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          activeThreadId === item.id 
                            ? 'bg-slate-900 text-white font-semibold' 
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{item.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); pinConversation(item.id); }} className="p-1 hover:text-blue-400"><Pin className="h-3 w-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </aside>

      {/* 2. MAIN CENTER CHAT CANVAS (CHATGPT INTERFACE) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
        
        {/* Minimalist Header Bar */}
        <div className="h-14 px-4 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isLeftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isLeftCollapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">Sarthi AI</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium">
                Nemotron 550B
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewChat}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="New Chat"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setIsRightCollapsed(!isRightCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Toggle Live Insights"
            >
              {isRightCollapsed ? <PanelRightOpen className="h-4.5 w-4.5" /> : <PanelRightClose className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto w-full h-full flex flex-col justify-between">
            
            {messages.length === 0 ? (
              /* ========================================================= */
              /* CLEAN CHATGPT WELCOME CANVAS */
              /* ========================================================= */
              <div className="flex-1 flex flex-col justify-center items-center text-center my-auto py-12 space-y-8 select-none">
                
                <div className="space-y-2 max-w-lg">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    What can I help with today, {userName}?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal">
                    Ask me to analyze spending, calculate tax under Old vs New regime, or project your SIP growth.
                  </p>
                </div>

                {/* 2x2 Suggested Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                  {quickPrompts.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePromptClick(p.label)}
                      className="p-3.5 rounded-2xl border border-slate-900 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-800 transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-slate-200 block group-hover:text-blue-400 transition-colors">
                        {p.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal mt-0.5 block">
                        {p.desc}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              /* ========================================================= */
              /* STREAMLINED CHAT LOG FLOW */
              /* ========================================================= */
              <div className="space-y-6 py-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'AI' && (
                      <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="space-y-2 max-w-2xl w-full">
                      {/* Message Content Bubble */}
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed ${
                          msg.sender === 'USER'
                            ? 'bg-blue-600 text-white rounded-tr-none ml-auto max-w-lg shadow-xs'
                            : 'bg-slate-900/90 border border-slate-800/80 text-slate-200 rounded-tl-none mr-auto'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Inline Widgets */}
                      {msg.sender === 'AI' && (
                        <div className="w-full">
                          {getWidgetForMessage(msg.content)}
                        </div>
                      )}

                      {/* AI Toolbar: Copy, Feedback */}
                      {msg.sender === 'AI' && (
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-medium pt-1">
                          <button
                            onClick={() => handleCopyMsg(msg.id, msg.content)}
                            className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{copiedMsgId === msg.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => setFeedbackRatings(prev => ({ ...prev, [msg.id]: 'UP' }))}
                            className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                              feedbackRatings[msg.id] === 'UP' ? 'text-emerald-400' : ''
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setFeedbackRatings(prev => ({ ...prev, [msg.id]: 'DOWN' }))}
                            className={`hover:text-rose-400 transition-colors cursor-pointer ${
                              feedbackRatings[msg.id] === 'DOWN' ? 'text-rose-400' : ''
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                    </div>

                    {msg.sender === 'USER' && (
                      <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                        <User className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming Indicator */}
                {streamingStatus !== 'IDLE' && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Bot className="h-4.5 w-4.5 animate-pulse" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm font-normal max-w-xl">
                      {streamingStatus === 'THINKING' && (
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                          <span>Thinking...</span>
                        </span>
                      )}
                      {streamingStatus === 'ANALYZING' && (
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                          <span>Analyzing data...</span>
                        </span>
                      )}
                      {streamingStatus === 'GENERATING' && (
                        <p className="whitespace-pre-line leading-relaxed">{streamingText}</p>
                      )}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* 3. CENTERED FLOATING BOTTOM INPUT BAR (CHATGPT STYLE) */}
        <div className="p-3 sm:p-4 bg-slate-950 shrink-0 border-t border-slate-900/60">
          <div className="max-w-3xl mx-auto space-y-2">
            
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  focusInput();
                }
              }}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-800/80 focus-within:border-blue-500/80 shadow-2xl transition-all flex items-center gap-2 cursor-text"
            >
              <form onSubmit={handleSendSubmit} className="flex items-center w-full px-2 gap-2">
                
                <button
                  type="button"
                  onClick={() => alert('Select file attachment')}
                  title="Attach file"
                  className="p-2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => alert('Capture OCR receipt')}
                  title="Capture receipt"
                  className="p-2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                >
                  <Camera className="h-4.5 w-4.5" />
                </button>

                <textarea
                  ref={messages.length === 0 ? welcomeTextareaRef : footerTextareaRef}
                  id="sarthi-chatgpt-textarea"
                  name="sarthi-chatgpt-textarea"
                  rows={1}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Sarthi anything about your money..."
                  className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-white placeholder-slate-500 px-2 py-2 font-normal focus:ring-0 resize-none max-h-36 min-h-[40px]"
                  style={{ pointerEvents: 'auto', cursor: 'text' }}
                />

                <button
                  type="button"
                  title="Voice input"
                  className="p-2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="h-8.5 w-8.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-normal">
              Sarthi AI can assist with budgets, tax & investments. Check important numbers.
            </p>

          </div>
        </div>

      </div>

      {/* 4. TOGGLEABLE RIGHT INSIGHTS DRAWER (COLLAPSED BY DEFAULT) */}
      {!isRightCollapsed && (
        <aside className="w-72 sm:w-80 border-l border-slate-900 bg-slate-950 p-4 space-y-4 overflow-y-auto hidden xl:flex flex-col shrink-0">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Insights</span>
            <button
              onClick={() => setIsRightCollapsed(true)}
              className="p-1 text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>Electricity Bill</span>
                <span className="text-amber-400">₹2,400</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Due Tomorrow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>High Spend Alert</span>
                <span className="text-rose-400">+18%</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Food spending exceeds average</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-200 font-semibold">
                <span>SIP Reminder</span>
                <span className="text-emerald-400">₹5,000</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Due Tomorrow</span>
            </div>
          </div>
        </aside>
      )}

    </div>
  );
};

export default AICopilotWorkspace;
