import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleButton } from '../features/authentication/GoogleButton';
import { SUPPORTED_LANGUAGES, applyLanguageTranslation } from '../utils/translation';
import {
  Sparkles,
  Bot,
  TrendingUp,
  Target,
  Wallet,
  ArrowRight,
  ShieldAlert,
  Shield,
  X,
  Star,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, loading, authError } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem('sarthi_lang_pref') || 'English';
  });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langId: string) => {
    setCurrentLang(langId);
    localStorage.setItem('sarthi_lang_pref', langId);
    applyLanguageTranslation(langId);
    setShowLangMenu(false);
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              FinanceSarthi
            </h1>
            <span className="text-[9px] uppercase font-bold tracking-widest text-blue-600 dark:text-sky-400 mt-0.5 block">
              Wealth Companion
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#about" className="hidden md:inline text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-all">About</a>
          <a href="#works" className="hidden md:inline text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-all">The Sarthi Way</a>
          
          {/* Language Selection Dropdown */}
          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-emerald-500" />
              <span>{currentLang}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Language</span>
                  <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{currentLang}</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1 space-y-0.5 scrollbar-thin">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = currentLang === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleSelectLanguage(lang.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/30' 
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-xs">{lang.native}</span>
                        <span className="text-[10px] text-slate-400">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleOpenAuth()}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Trusted by 50k+ Indian Earners</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            Your Financial Literacy <span className="text-blue-600 dark:text-sky-400">Guide</span> for India's Young Earners
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Embark on a guided journey toward wealth creation. Understand taxes, master mutual funds, and plan your goals with your personal financial mentor—your Sarthi.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleOpenAuth()}
              className="w-full sm:w-auto h-[48px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto h-[48px] px-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center transition-all hover:bg-slate-200 dark:hover:bg-slate-800/80 cursor-pointer"
            >
              See How it Works
            </button>
          </div>

          {/* Social Proof Rating */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-900">
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" alt="" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-amber-500" />
                <Star className="h-3 w-3 fill-amber-500" />
                <Star className="h-3 w-3 fill-amber-500" />
                <Star className="h-3 w-3 fill-amber-500" />
                <Star className="h-3 w-3 fill-amber-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">4.9/5</span>
              </div>
              <p className="mt-0.5">from the community</p>
            </div>
          </div>
        </div>

        {/* Right Graphical Column (Garden Path Image + Floating Cards) */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <img
              src="/financial_path_hero.jpg"
              alt="Garden Path Leading to Sunrise"
              className="w-full h-full object-cover"
            />

            {/* Top Right Floating Card */}
            <div className="absolute top-6 right-6 p-4 rounded-2xl bg-white/95 dark:bg-slate-950/95 border border-slate-200/50 dark:border-slate-850 shadow-xl w-56 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Mutual Funds</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[70%]" />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block">Goal: Retirement</span>
            </div>

            {/* Bottom Left Floating Card */}
            <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/95 dark:bg-slate-950/95 border border-slate-200/50 dark:border-slate-850 shadow-xl w-52 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tax Optimization</h4>
                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-black block mt-0.5">₹1.5L Saved</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Features Section */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-slate-200 dark:border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Salary Planner */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Salary Planner</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The 50/30/20 rule, tailored for the modern Indian lifestyle and cost of living.
            </p>
          </div>

          {/* Goal Tracking */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Goal Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visualize your house downpayment or that dream Euro trip with precise timelines.
            </p>
          </div>

          {/* AI Sarthi */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Sarthi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              24/7 access to complex financial answers, simplified without the jargon.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-900 gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>© 2026 FinanceSarthi.AI. Empowering India's Future.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-blue-600 dark:hover:text-sky-400">Privacy Policy</a>
          <a href="#terms" className="hover:text-blue-600 dark:hover:text-sky-400">Terms of Service</a>
          <a href="#contact" className="hover:text-blue-600 dark:hover:text-sky-400">Contact</a>
        </div>
      </footer>

      {/* 5. Authentication Overlay Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl z-50 p-8 flex flex-col justify-center space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer z-50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-2 text-center">
                <div className="h-10 w-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400 mx-auto">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome to FinanceSarthi
                </h3>
                <p className="text-xs text-slate-500">
                  Access your goals, planning, and advice securely. Continue with Google to get started in one click.
                </p>

                {/* Language Select Pill inside Modal */}
                <div className="pt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Language:</span>
                  <select
                    value={currentLang}
                    onChange={(e) => handleSelectLanguage(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                        {lang.native} ({lang.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message Alert */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <GoogleButton onClick={() => signInWithGoogle()} loading={loading} text="Continue with Google" />

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-950 px-3 text-[10px] uppercase font-bold text-slate-400">or</span>
              </div>

              <button
                onClick={() => signInAsGuest()}
                className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-sky-400 animate-pulse" />
                <span>Instant Demo Access (No Login Needed)</span>
              </button>

              <p className="text-center text-[10px] text-slate-400 leading-normal">
                By continuing, you agree to FinanceSarthi's Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
