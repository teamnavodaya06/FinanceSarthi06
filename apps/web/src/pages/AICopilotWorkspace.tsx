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

function detectLanguage(text: string): string {

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

  const { messages, sendMessage, streamingStatus, streamingText } = useConversation(activeThreadId, scrollChat);
  const { userProfile } = useAuth();
  const { incomeData } = useFinancial();

  // Search filter & inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'UP' | 'DOWN'>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Clean ChatGPT Sidebar States (Collapsed by default on mobile to prevent overflow)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(true);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // Dynamic user language preference state
  const [preferredLang, setPreferredLang] = useState<string>(() => {
    return localStorage.getItem('sarthi_lang_pref') || 'English';
  });

  const userName = useMemo(() => {
    if (!userProfile?.displayName) return 'User';
    return userProfile.displayName.split(' ')[0];
  }, [userProfile?.displayName]);

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
      textarea.style.height = `${Math.max(40, Math.min(140, scrollHeight))}px`;
    }
  }, [inputVal, messages.length]);

  // Group conversations by date intervals with search filtering
  const groupedConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? conversations.filter(c => c.title.toLowerCase().includes(query) || c.messages?.some(m => m.content.toLowerCase().includes(query)))
      : conversations;

    const today: any[] = [];
    const yesterday: any[] = [];
    const lastWeek: any[] = [];
    const older: any[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    filtered.forEach(c => {
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

    return { today, yesterday, lastWeek, older, totalCount: filtered.length };
  }, [conversations, searchQuery]);

  // Clickable prompt cards
  const quickPrompts = [
    { label: '📊 Analyze my spending', desc: 'Category and merchant breakdown' },
    { label: '💰 Tax Optimization', desc: 'Old vs New Regime calculation' },
    { label: '📈 Optimize my SIP', desc: 'Wealth compounding forecasts' },
    { label: '🛡️ Emergency Fund Buffer', desc: '6-month liquidity safety plan' },
  ];

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

  // On initial load, auto-select first conversation or default thread
  useEffect(() => {
    if (!activeThreadId) {
      if (conversations.length > 0) {
        setActiveThreadId(conversations[0].id);
      } else {
        setActiveThreadId('thread-default-1');
      }
    }
  }, [conversations, activeThreadId]);

  const handleCreateNewChat = async () => {
    const title = `New Chat #${conversations.length + 1}`;
    const newChat = await createConversation(title);
    if (newChat) {
      setActiveThreadId(newChat.id);
      setIsLeftCollapsed(true);
    }
  };

  const handleCopyMsg = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Intercept response outputs to render inline widgets
  const getWidgetForMessage = (msg: any) => {
    const content = (msg.content || '').toLowerCase();
    const widgetData = msg.widgetData;

    if (widgetData?.type === 'SPENDING_BREAKDOWN' || (content.includes('swiggy') && content.includes('8,400'))) {
      const categoriesData = [
        { name: 'Housing', value: simRentAmount(), color: '#2563EB' },
        { name: 'Food', value: 8400, color: '#10B981' },
        { name: 'Transport', value: 5000, color: '#F59E0B' },
        { name: 'Utilities', value: 6000, color: '#94A3B8' },
        { name: 'Others', value: 7100, color: '#E2E8F0' },
      ];
      return (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 my-2">
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
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              Food delivery expenses are 12% higher than average. Redirecting ₹840/mo to SIP can generate over ₹1.4 Lakhs in 5 years.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-5rem)] w-full max-w-full overflow-hidden bg-slate-950 text-slate-100 font-sans rounded-2xl border border-slate-900 relative">
      
      {/* Top Header Bar */}
      <div className="h-13 px-4 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-950 z-10 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isLeftCollapsed ? 'Open chat history' : 'Close chat history'}
          >
            {isLeftCollapsed ? <PanelLeftOpen className="h-4 w-4 text-sky-400" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-white">Sarthi AI</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-[10px] font-bold">
              Kimi K3 (NVIDIA)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewChat}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex w-full max-w-full overflow-hidden relative">
        
        {/* Left History Sidebar (Slide-over on mobile, Inline on desktop) */}
        {!isLeftCollapsed && (
          <aside className="absolute lg:relative inset-y-0 left-0 z-30 w-72 bg-slate-950 border-r border-slate-900 flex flex-col p-3 space-y-3 shadow-2xl lg:shadow-none h-full shrink-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-bold text-slate-300">Chat History ({groupedConversations.totalCount})</span>
              <button onClick={() => setIsLeftCollapsed(true)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {groupedConversations.totalCount === 0 ? (
                <div className="py-8 text-center text-slate-500 space-y-1">
                  <Clock className="h-5 w-5 mx-auto opacity-50" />
                  <p className="text-[11px]">No chat history found.</p>
                </div>
              ) : (
                <>
                  {groupedConversations.today.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 px-2 block">Today</span>
                      {groupedConversations.today.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveThreadId(item.id);
                            setIsLeftCollapsed(true);
                          }}
                          className={`group px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            activeThreadId === item.id 
                              ? 'bg-blue-600/20 text-sky-400 font-bold border border-blue-500/30' 
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2 text-xs">{item.title}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {groupedConversations.yesterday.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 px-2 block">Yesterday</span>
                      {groupedConversations.yesterday.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveThreadId(item.id);
                            setIsLeftCollapsed(true);
                          }}
                          className={`group px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            activeThreadId === item.id 
                              ? 'bg-blue-600/20 text-sky-400 font-bold border border-blue-500/30' 
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2 text-xs">{item.title}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {groupedConversations.lastWeek.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 px-2 block">Previous 7 Days</span>
                      {groupedConversations.lastWeek.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveThreadId(item.id);
                            setIsLeftCollapsed(true);
                          }}
                          className={`group px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            activeThreadId === item.id 
                              ? 'bg-blue-600/20 text-sky-400 font-bold border border-blue-500/30' 
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2 text-xs">{item.title}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {groupedConversations.older.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 px-2 block">Older</span>
                      {groupedConversations.older.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setActiveThreadId(item.id);
                            setIsLeftCollapsed(true);
                          }}
                          className={`group px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            activeThreadId === item.id 
                              ? 'bg-blue-600/20 text-sky-400 font-bold border border-blue-500/30' 
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2 text-xs">{item.title}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-1 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}

        {/* Main Central Chat Canvas */}
        <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden bg-slate-950">
          
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 w-full">
            <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full justify-between space-y-6">
              
              {messages.length === 0 ? (
                /* Welcome Canvas */
                <div className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-12 space-y-6 w-full max-w-xl mx-auto">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>

                  <div className="space-y-1.5 w-full">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      What can I help with today, {userName}?
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed px-2">
                      Ask me to analyze spending, calculate tax, or optimize your SIP investments.
                    </p>
                  </div>

                  {/* 2x2 Suggested Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-2">
                    {quickPrompts.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handlePromptClick(p.label)}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-slate-200 block group-hover:text-sky-400 transition-colors">
                          {p.label}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-normal mt-0.5 block truncate">
                          {p.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message Stream */
                <div className="space-y-4 py-2 w-full">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 sm:gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      {msg.sender === 'AI' && (
                        <div className="h-7 w-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div className="space-y-2 max-w-[85%] sm:max-w-xl">
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed ${
                            msg.sender === 'USER'
                              ? 'bg-blue-600 text-white rounded-tr-none ml-auto shadow-xs'
                              : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                        </div>

                        {msg.sender === 'AI' && (
                          <div className="w-full">
                            {getWidgetForMessage(msg)}
                          </div>
                        )}
                      </div>

                      {msg.sender === 'USER' && (
                        <div className="h-7 w-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {streamingStatus !== 'IDLE' && (
                    <div className="flex gap-2.5 justify-start w-full">
                      <div className="h-7 w-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                        <Bot className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-normal">
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                          <span>Thinking...</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}

            </div>
          </div>

          {/* Floating Bottom Input Bar */}
          <div className="p-2.5 sm:p-4 bg-slate-950 border-t border-slate-900 shrink-0 w-full">
            <div className="max-w-3xl mx-auto space-y-1.5 w-full">
              <form onSubmit={handleSendSubmit} className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-blue-500/80 transition-all">
                <textarea
                  ref={messages.length === 0 ? welcomeTextareaRef : footerTextareaRef}
                  rows={1}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Sarthi about your finances..."
                  className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-white placeholder-slate-500 px-2 py-1 font-normal resize-none max-h-32 min-h-[36px]"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              <p className="text-[9.5px] text-slate-500 text-center font-normal truncate">
                Sarthi AI provides financial guidance powered by Kimi AI (NVIDIA).
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AICopilotWorkspace;
