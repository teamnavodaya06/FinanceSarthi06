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
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Sliders,
  DollarSign,
  AlertTriangle,
  Zap,
  Calendar,
  CreditCard,
  ArrowRight,
  Camera,
  Database,
  Archive,
  Edit2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  
  // Tamil indicators
  if (/[\u0B80-\u0BFF]/.test(text) || clean.includes('analyse') && clean.includes('pannu') || clean.includes('enoda')) {
    return 'Tamil';
  }
  // Gujarati indicators
  if (/[\u0A80-\u0AFF]/.test(text) || clean.includes('kharch') && clean.includes('batavo') || clean.includes('maro')) {
    return 'Gujarati';
  }
  // Bengali indicators
  if (/[\u0980-\u09FF]/.test(text) || clean.includes('bishleshon') || clean.includes('amar') && clean.includes('khoroch')) {
    return 'Bengali';
  }
  // Telugu indicators
  if (/[\u0C00-\u0C7F]/.test(text) || clean.includes('cheppu') || clean.includes('kharchulu') || clean.includes('maa')) {
    return 'Telugu';
  }
  // Malayalam indicators
  if (/[\u0D00-\u0D7F]/.test(text) || clean.includes('chelavukal') || clean.includes('vishakalanam')) {
    return 'Malayalam';
  }
  // Kannada indicators
  if (/[\u0C80-\u0CFF]/.test(text) || clean.includes('kharchugalannu') || clean.includes('nanna')) {
    return 'Kannada';
  }
  // Hindi / Hinglish indicators
  if (
    /[\u0900-\u097F]/.test(text) || 
    clean.includes('mera') || 
    clean.includes('budget') && clean.includes('review') && clean.includes('karo') ||
    clean.includes('kharch') || 
    clean.includes('batao') || 
    clean.includes('hai') || 
    clean.includes('kya') || 
    clean.includes('nahi') ||
    clean.includes('kar')
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
  const { conversations, createConversation, deleteConversation, pinConversation, refresh } = useConversationHistory();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { messages, sendMessage, streamingStatus, streamingText, streamingWidget } = useConversation(activeThreadId, scrollChat);
  const { health } = useBudgetHealth();
  const { userProfile } = useAuth();
  const { expenses, goals, incomeData } = useFinancial();

  // Search filter & inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, 'UP' | 'DOWN'>>({});
  const [isWelcomeFocused, setIsWelcomeFocused] = useState(false);
  const [isFooterFocused, setIsFooterFocused] = useState(false);

  // Dynamic user language preference state
  const [preferredLang, setPreferredLang] = useState<string>(() => {
    return localStorage.getItem('sarthi_lang_pref') || 'English';
  });

  // Dynamic Greeting based on current local time
  const [greeting, setGreeting] = useState('Good Morning');
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const userName = useMemo(() => {
    if (!userProfile?.displayName) return 'Rahul';
    return userProfile.displayName.split(' ')[0];
  }, [userProfile?.displayName]);

  const salary = incomeData?.monthlyIncome || 75000;
  const totalSpent = expenses.filter(e => !e.isDeleted).reduce((acc, curr) => acc + curr.amount, 0) || 32500;
  const totalSavings = Math.max(0, salary - totalSpent);
  const budgetUsedPercent = Math.round(salary > 0 ? (totalSpent / salary) * 100 : 43);
  const financialHealthScore = health?.score || 92;

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
    const twoDaysAgo: any[] = [];
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
      } else if (diff < 2 * oneDay) {
        twoDaysAgo.push(c);
      } else if (diff < 7 * oneDay) {
        lastWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, twoDaysAgo, lastWeek, older };
  }, [conversations]);

  // Clickable prompt cards
  const quickPrompts = [
    { label: '📊 Analyze my spending', desc: 'Category and merchant breakdown' },
    { label: '💰 Can I afford an iPhone?', desc: 'Simulate purchase impact on goals' },
    { label: '📈 Optimize my SIP', desc: 'Wealth compounding forecasts' },
    { label: '🎯 Review my budget', desc: 'Envelopes status check' },
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
    // 1. Detect language client-side
    const lang = detectLanguage(text);
    setPreferredLang(lang);
    localStorage.setItem('sarthi_lang_pref', lang);

    // 2. Dispatch query message
    sendMessage(text);
  };

  // On initial load, auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeThreadId) {
      setActiveThreadId(conversations[0].id);
    }
  }, [conversations, activeThreadId]);

  const handleCreateNewChat = async () => {
    const title = `Analysis Run #${conversations.length + 1}`;
    const newChat = await createConversation(title);
    if (newChat) {
      setActiveThreadId(newChat.id);
    }
  };

  const filteredHistory = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Intercept response outputs to render multilingual widgets
  const getWidgetForMessage = (content: string) => {
    const query = content.toLowerCase();
    const resPayload = MULTILINGUAL_RESPONSES[preferredLang] || MULTILINGUAL_RESPONSES['English'];

    // 1. Spending category breakdown chart
    if (query.includes('spending') || query.includes('analyze') || query.includes('food') || query.includes('expense') || query.includes('খર્ચ') || query.includes('ಖರ್ಚು') || query.includes('செலவு')) {
      const categoriesData = [
        { name: 'Housing', value: simRentAmount(), color: '#2563EB' },
        { name: 'Food', value: 8400, color: '#10B981' },
        { name: 'Transport', value: 5000, color: '#F59E0B' },
        { name: 'Utilities', value: 6000, color: '#94A3B8' },
        { name: 'Others', value: 7100, color: '#E2E8F0' },
      ];
      return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Food & Dining Analysis</span>
              <h4 className="text-xl font-black text-white mt-1">₹8,400 <span className="text-xs text-red-500 font-extrabold">↑12% Badh gaya</span></h4>
            </div>
            <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold shrink-0">Savings target: ₹840</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                  {categoriesData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold block">Sarthi Observation</span>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">{resPayload.text}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5">
            <span className="text-[10px] text-emerald-500 font-extrabold block">✓ Recommendation</span>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">{resPayload.recommendation}</p>
          </div>

          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] cursor-pointer" onClick={() => alert('Suggestion applied!')}>Apply Suggestion</button>
            <button className="h-9 px-4 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-950 font-extrabold text-[11px] cursor-pointer">Explain Why</button>
          </div>
        </div>
      );
    }

    // 2. SIP / Compounding growth chart
    if (query.includes('sip') || query.includes('optimize') || query.includes('invest') || query.includes('wealth')) {
      const projectionData = [
        { name: 'Yr 1', Standard: 120000, Optimized: 130000 },
        { name: 'Yr 2', Standard: 254400, Optimized: 282100 },
        { name: 'Yr 3', Standard: 404900, Optimized: 462350 },
        { name: 'Yr 4', Standard: 573500, Optimized: 673400 },
        { name: 'Yr 5', Standard: 762300, Optimized: 919800 },
      ];
      return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SIP Compounding Growth Trajectory</span>
            <h4 className="text-xl font-black text-white mt-1">₹9,19,800 projected wealth</h4>
            <p className="text-xs text-emerald-500 font-extrabold mt-0.5">Optimizing your SIP allocation adds ₹1,57,500 over 5 years (at 12% CAGR).</p>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={9} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="Standard" stroke="#94A3B8" strokeWidth={2} />
                <Line type="monotone" dataKey="Optimized" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] cursor-pointer" onClick={() => alert('SIP optimized!')}>Optimize SIP</button>
            <button className="h-9 px-4 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-950 font-extrabold text-[11px] cursor-pointer">Compare Funds</button>
          </div>
        </div>
      );
    }

    // 3. Affordability simulator card
    if (query.includes('iphone') || query.includes('car') || query.includes('afford')) {
      return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Affordability Index simulation</span>
            <h4 className="text-xl font-black text-red-500 mt-1">Caution Suggested (Affordability: 46%)</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1">Buying an iPhone at ₹1,20,000 via credit card EMIs will push your debt-to-savings ratio to 45%, delaying your Emergency Fund completion by 4 months.</p>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-850">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>Emergency Fund timeline growth</span>
                <span className="text-slate-200">7 Months ➔ 11 Months</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] cursor-pointer" onClick={() => alert('Simulated purchase parameters saved!')}>Track Purchase Goal</button>
            <button className="h-9 px-4 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-950 font-extrabold text-[11px] cursor-pointer">Alternative Options</button>
          </div>
        </div>
      );
    }

    // Fallback standard budget progress card
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Monthly Budget Envelope</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Healthy status</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400">
          <div>
            <span>Spent Envelopes</span>
            <p className="text-lg font-black text-slate-100 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span>Unallocated Remaining</span>
            <p className="text-lg font-black text-[#10B981] mt-1">₹{(salary - totalSpent).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${budgetUsedPercent}%` }} />
        </div>
      </div>
    );
  };

  function simRentAmount() {
    return expenses.filter(e => !e.isDeleted && e.category === 'HOUSING').reduce((a,c)=>a+c.amount,0) || 15000;
  }

  return (
    <div className="flex h-[calc(100vh-170px)] bg-slate-950 text-slate-100 rounded-2xl border border-slate-900 overflow-hidden font-sans select-text">
      
      {/* 1. LEFT SIDEBAR: Conversation History */}
      <aside className="w-68 border-r border-slate-900 bg-slate-950 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="p-5 space-y-5 flex-1 flex flex-col overflow-hidden">
          
          {/* New chat action */}
          <button
            onClick={handleCreateNewChat}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/10 shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Conversation</span>
          </button>

          {/* Search box */}
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search chat sessions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-slate-900/60 border border-slate-900 rounded-xl pl-10 pr-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500/40 focus:ring-0"
            />
          </div>

          {/* Grouped conversations list */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs font-bold text-slate-400">
            
            {/* TODAY */}
            {groupedConversations.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2 px-1">Today</span>
                {groupedConversations.today.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setActiveThreadId(item.id)}
                    className={`group px-3.5 py-3 rounded-xl flex justify-between items-center cursor-pointer transition-all border ${
                      activeThreadId === item.id 
                        ? 'bg-slate-900 border-slate-800 text-white shadow-sm' 
                        : 'border-transparent text-slate-400 hover:bg-slate-900/35'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 shrink-0 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); pinConversation(item.id); }} className="p-0.5 hover:text-blue-500"><Pin className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* YESTERDAY */}
            {groupedConversations.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2 px-1">Yesterday</span>
                {groupedConversations.yesterday.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setActiveThreadId(item.id)}
                    className={`group px-3.5 py-3 rounded-xl flex justify-between items-center cursor-pointer transition-all border ${
                      activeThreadId === item.id 
                        ? 'bg-slate-900 border-slate-800 text-white shadow-sm' 
                        : 'border-transparent text-slate-400 hover:bg-slate-900/35'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 shrink-0 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); pinConversation(item.id); }} className="p-0.5 hover:text-blue-500"><Pin className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LAST WEEK */}
            {groupedConversations.lastWeek.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2 px-1">Last Week</span>
                {groupedConversations.lastWeek.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setActiveThreadId(item.id)}
                    className={`group px-3.5 py-3 rounded-xl flex justify-between items-center cursor-pointer transition-all border ${
                      activeThreadId === item.id 
                        ? 'bg-slate-900 border-slate-800 text-white shadow-sm' 
                        : 'border-transparent text-slate-400 hover:bg-slate-900/35'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 shrink-0 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); pinConversation(item.id); }} className="p-0.5 hover:text-blue-500"><Pin className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(item.id); }} className="p-0.5 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. CENTER PANEL: Copilot Workspace */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-950">
        
        {/* Central Workspace Scroll Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full">
          
          {messages.length === 0 ? (
            /* ========================================================= */
            /* WELCOME STATE */
            /* ========================================================= */
            <div className="space-y-8 py-6">
              
              {/* AI Hero Title */}
              <div className="space-y-2">
                <h2 className="text-[32px] font-black text-white leading-none">
                  {greeting}, {userName} 👋
                </h2>
                <p className="text-sm text-slate-400 font-bold">I\'m monitoring your finances in real time.</p>
              </div>

              {/* Today's Snapshot metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/10 to-blue-800/5 border border-slate-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Salary</span>
                  <span className="text-[18px] font-black text-slate-100 mt-2">₹{salary.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/10 to-red-900/5 border border-slate-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expenses</span>
                  <span className="text-[18px] font-black text-slate-100 mt-2">₹{totalSpent.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/10 to-emerald-900/5 border border-slate-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Savings</span>
                  <span className="text-[18px] font-black text-[#10B981] mt-2">₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/10 to-blue-800/5 border border-slate-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Used</span>
                  <span className="text-[18px] font-black text-slate-100 mt-2">{budgetUsedPercent}%</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/10 to-emerald-900/5 border border-slate-900 flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                  <span className="text-[18px] font-black text-[#10B981] mt-2">{financialHealthScore}</span>
                </div>
              </div>

              {/* Large Centered Input Block */}
              <div 
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    focusInput();
                  }
                }}
                className={`p-2 rounded-2xl bg-slate-900 border shadow-xl max-w-2xl mx-auto pointer-events-auto cursor-text transition-all duration-150 ${
                  isWelcomeFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800/60'
                }`}
              >
                <form onSubmit={handleSendSubmit} className="flex items-start px-4 py-2 gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Select statements PDF payload uploads.')}
                    title="Upload statement"
                    className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer transition-all mt-1"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => alert('Capture OCR receipt scanning.')}
                    title="Capture receipt"
                    className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer transition-all mt-1"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>

                  <textarea
                    ref={welcomeTextareaRef}
                    id="sarthi-welcome-textarea"
                    name="sarthi-welcome-textarea"
                    rows={1}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsWelcomeFocused(true)}
                    onBlur={() => setIsWelcomeFocused(false)}
                    placeholder="Ask Sarthi anything about your money..."
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-slate-500 px-2 py-2.5 font-semibold focus:ring-0 focus:outline-none resize-none overflow-hidden max-h-40 min-h-[44px]"
                    style={{ pointerEvents: 'auto', cursor: 'text', userSelect: 'text' }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="true"
                    tabIndex={0}
                    role="textbox"
                    aria-label="Ask Sarthi anything about your money"
                  />

                  <button
                    type="button"
                    title="Voice input"
                    className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer mt-1"
                  >
                    <Mic className="h-4.5 w-4.5" />
                  </button>

                  <button
                    type="submit"
                    className="h-9 w-9 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer transition-all mt-1 shrink-0"
                  >
                    <Send className="h-4 w-4 fill-current" />
                  </button>
                </form>
              </div>

              {/* Quick Prompt Cards */}
              <div className="space-y-3 max-w-2xl mx-auto">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block text-center">Suggested insights prompts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-400">
                  {quickPrompts.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePromptClick(p.label)}
                      className="p-4 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900/40 hover:border-slate-800 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-slate-100 font-extrabold block mb-1">{p.label}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* CHAT LOG STATE */
            /* ========================================================= */
            <div className="space-y-6 py-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'AI' && (
                    <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div className="space-y-3 max-w-xl w-full">
                    {/* Message body bubble container */}
                    <div
                      className={`p-5 rounded-2xl text-xs font-bold leading-relaxed shadow-sm border ${
                        msg.sender === 'USER'
                          ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none ml-auto max-w-md'
                          : 'bg-slate-900 border-slate-850 text-slate-300 rounded-tl-none mr-auto'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm font-semibold">{msg.content}</p>
                    </div>

                    {/* Dynamic widget response attachments */}
                    {msg.sender === 'AI' && (
                      <div className="w-full">
                        {getWidgetForMessage(msg.content)}
                      </div>
                    )}

                    {/* Thumbs Feedback */}
                    {msg.sender === 'AI' && (
                      <div className="flex gap-3.5 items-center justify-end px-2 text-slate-500 text-[10px] font-bold">
                        <span>Was this helpful?</span>
                        <button
                          onClick={() => setFeedbackRatings(prev => ({ ...prev, [msg.id]: 'UP' }))}
                          className={`hover:text-emerald-500 cursor-pointer ${
                            feedbackRatings[msg.id] === 'UP' ? 'text-emerald-500' : ''
                          }`}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => setFeedbackRatings(prev => ({ ...prev, [msg.id]: 'DOWN' }))}
                          className={`hover:text-red-500 cursor-pointer ${
                            feedbackRatings[msg.id] === 'DOWN' ? 'text-red-500' : ''
                          }`}
                        >
                          👎
                        </button>
                      </div>
                    )}

                    {/* Suggested follow-up question pills */}
                    {msg.sender === 'AI' && (
                      <div className="flex flex-wrap gap-2 pt-2 justify-end">
                        <button 
                          onClick={() => sendMessage('Compare spending trends')}
                          className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-950 text-[11px] font-extrabold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          Compare trends
                        </button>
                        <button 
                          onClick={() => sendMessage('Where can I save?')}
                          className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-950 text-[11px] font-extrabold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          Where can I save?
                        </button>
                        <button 
                          onClick={() => sendMessage('Optimize my investments')}
                          className="px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-950 text-[11px] font-extrabold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          Optimize Investments
                        </button>
                      </div>
                    )}

                  </div>

                  {msg.sender === 'USER' && (
                    <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-450 shrink-0 mt-0.5">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming state container */}
              {streamingStatus !== 'IDLE' && (
                <div className="flex gap-4 justify-start">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                    <Bot className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="space-y-3 max-w-xl w-full">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-850 text-slate-400 rounded-tl-none text-xs font-bold">
                      {streamingStatus === 'THINKING' && (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                          <span>Thinking...</span>
                        </span>
                      )}
                      {streamingStatus === 'ANALYZING' && (
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                          <span>Analyzing database files...</span>
                        </span>
                      )}
                      {streamingStatus === 'GENERATING' && (
                        <p className="whitespace-pre-line text-sm font-semibold text-slate-300">{streamingText}</p>
                      )}
                    </div>

                    {streamingWidget && streamingStatus === 'GENERATING' && (
                      <div className="w-full">
                        {getWidgetForMessage(streamingText)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

        </div>

        {/* Input box footer controls (Active chat state input) */}
        {messages.length > 0 && (
          <div className="p-6 border-t border-slate-900 bg-slate-950/80 shrink-0">
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  focusInput();
                }
              }}
              className={`p-2 rounded-2xl bg-slate-900 border max-w-4xl mx-auto pointer-events-auto cursor-text transition-all duration-150 ${
                isFooterFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-850'
              }`}
            >
              <form onSubmit={handleSendSubmit} className="flex items-start px-4 py-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert('Attachments upload requires real storage credentials.')}
                  title="Upload Statement"
                  className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer transition-all mt-1"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => alert('Capture OCR receipt scanning.')}
                  title="Capture Receipt"
                  className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer transition-all mt-1"
                >
                  <Camera className="h-4.5 w-4.5" />
                </button>

                <textarea
                  ref={footerTextareaRef}
                  id="sarthi-footer-textarea"
                  name="sarthi-footer-textarea"
                  rows={1}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFooterFocused(true)}
                  onBlur={() => setIsFooterFocused(false)}
                  placeholder="Ask Sarthi anything about your money..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-slate-500 px-3 py-2.5 font-semibold focus:ring-0 focus:outline-none resize-none overflow-hidden max-h-40 min-h-[44px]"
                  style={{ pointerEvents: 'auto', cursor: 'text', userSelect: 'text' }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="true"
                  tabIndex={0}
                  role="textbox"
                  aria-label="Ask Sarthi anything about your money"
                />

                <button
                  type="button"
                  title="Voice input"
                  className="p-2 hover:text-blue-500 text-slate-500 cursor-pointer mt-1"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all shadow-md shadow-blue-600/10 shrink-0 mt-1"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* 3. RIGHT SIDEBAR: Live Insights & Smart AI Memory */}
      <aside className="w-80 border-l border-slate-900 bg-slate-950 flex flex-col overflow-y-auto hidden xl:flex shrink-0">
        <div className="p-6 space-y-6">
          
          {/* Section 1: Live Insights */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Live Insights</span>
            
            <div className="space-y-3">
              {/* Electricity Bill Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>Upcoming Bill: Electricity</span>
                    <span className="text-amber-500 font-extrabold">₹2,400</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Due Tomorrow</span>
                  <button className="text-[10px] text-blue-500 hover:underline cursor-pointer block pt-1" onClick={() => alert('Processing payment request.')}>Pay Bill</button>
                </div>
              </div>

              {/* High Spending Alert */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>High Spending Alert</span>
                    <span className="text-red-500 font-extrabold">+18%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Food spending exceeds average limits</span>
                  <button className="text-[10px] text-blue-500 hover:underline cursor-pointer block pt-1" onClick={() => handlePromptClick('Analyze my spending')}>Optimize Envelopes</button>
                </div>
              </div>

              {/* Investment Reminder */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <Zap className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>Investment Reminder: SIP</span>
                    <span className="text-emerald-500 font-extrabold">₹5,000</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Due Tomorrow</span>
                  <button className="text-[10px] text-blue-500 hover:underline cursor-pointer block pt-1" onClick={() => alert('SIP Payment executed.')}>Invest Now</button>
                </div>
              </div>

              {/* Goal Progress Emergency */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>Emergency Fund Goal</span>
                    <span className="text-blue-500 font-extrabold">74%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">₹1,48,000 of ₹2,00,000</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>
              </div>

              {/* CC Due Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <CreditCard className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>HDFC Credit Card</span>
                    <span className="text-amber-500 font-extrabold">₹14,500</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Due in 5 Days</span>
                  <button className="text-[10px] text-blue-500 hover:underline cursor-pointer block pt-1" onClick={() => alert('Processing payment.')}>Pay Card</button>
                </div>
              </div>

              {/* ELSS Limit */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs font-bold">
                <Sliders className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-slate-200">
                    <span>Tax Saving ELSS Limit</span>
                    <span className="text-emerald-500 font-extrabold">₹45,000 Left</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">ELSS Investment under Section 80C</span>
                  <button className="text-[10px] text-blue-500 hover:underline cursor-pointer block pt-1" onClick={() => alert('Redirecting to tax planners.')}>Optimize Tax</button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: What Sarthi Knows */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              What Sarthi Knows
            </span>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 space-y-2.5 text-[11px] font-bold text-slate-400">
              <div className="flex justify-between">
                <span>Salary</span>
                <span className="text-slate-100">₹{salary.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses</span>
                <span className="text-slate-100">₹{totalSpent.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Investments</span>
                <span className="text-slate-100">₹10,000/mo (SIP)</span>
              </div>
              <div className="flex justify-between">
                <span>Loans</span>
                <span className="text-slate-100">Car Loan: ₹5,00,000</span>
              </div>
              <div className="flex justify-between">
                <span>Credit Score</span>
                <span className="text-emerald-500">788 (Excellent)</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Profile</span>
                <span className="text-slate-100">Moderate</span>
              </div>
              <div className="flex justify-between">
                <span>Recent Expense</span>
                <span className="text-slate-100">Starbucks Coffee (₹450)</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

    </div>
  );
};

export default AICopilotWorkspace;
