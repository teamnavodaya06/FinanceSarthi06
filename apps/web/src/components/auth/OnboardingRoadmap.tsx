import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CityTier, RiskProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Building,
  Home,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  TrendingUp,
  Percent,
  Wallet,
  Activity,
  Calculator,
  Compass,
  Zap,
} from 'lucide-react';

export const OnboardingRoadmap: React.FC = () => {
  const { completeOnboarding } = useAuth();

  // Onboarding Wizard Steps: 1 (Welcome), 2 (Income), 3 (Age), 4 (Location), 5 (Goals), 6 (Risk)
  const [step, setStep] = useState<number>(() => {
    return Number(localStorage.getItem('onboarding_step')) || 1;
  });
  const [salary, setSalary] = useState<string>('75000');
  const [age, setAge] = useState<number>(26);
  const [cityTier, setCityTier] = useState<CityTier>('TIER_2');
  const [goals, setGoals] = useState<FinancialGoalType[]>(['EMERGENCY_FUND', 'INVESTMENT']);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('MODERATE');
  
  // Custom Animations & Loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState<number>(0);

  const loadingMessages = [
    'Building your AI Financial Blueprint...',
    'Analyzing salary and cost variables...',
    'Calculating custom 50/30/20 budget...',
    'Optimizing tax slabs and deductions...',
    'Preparing mutual funds & investment roadmap...',
    'Generating AI financial recommendations...',
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            // Finish onboarding
            localStorage.removeItem('onboarding_step');
            completeOnboarding({
              cityTier,
              occupation: 'Salaried',
              monthlySalary: Number(salary),
              financialGoals: goals,
              riskProfile,
            });
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Welcome page time of day greeting
  const [greeting, setGreeting] = useState<string>('Welcome');
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Format currency dynamically
  const formatCurrency = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-IN');
  };

  // AI Live preview stats
  const numSalary = Number(salary) || 75000;
  const estSavingsPct = riskProfile === 'CONSERVATIVE' ? 0.20 : riskProfile === 'MODERATE' ? 0.25 : 0.35;
  const estSavingsAmount = Math.round(numSalary * estSavingsPct);
  const emergencyGoal = cityTier === 'TIER_1' ? numSalary * 6 : cityTier === 'TIER_2' ? numSalary * 5 : numSalary * 4;

  const getTaxRegime = (sal: number) => {
    const annual = sal * 12;
    if (annual <= 700000) return 'Tax Exempt (New Regime)';
    if (annual <= 1200000) return 'New Tax Regime (10% slab)';
    return 'New Tax Regime (15%+ slab)';
  };

  const getInvestmentStyle = (rp: RiskProfile) => {
    if (rp === 'CONSERVATIVE') return 'Fixed Income & Debt (70%), Equity (30%)';
    if (rp === 'MODERATE') return 'Mutual Funds SIP (60%), Equities (35%), Gold (5%)';
    return 'Equities (70%), Mutual Funds (20%), Crypto/Alt (10%)';
  };

  const goalOptions: { id: FinancialGoalType; label: string; desc: string; icon: string }[] = [
    { id: 'EMERGENCY_FUND', label: 'Emergency Fund', desc: 'Secure 6 months of expenses', icon: '🛡️' },
    { id: 'INVESTMENT', label: 'Grow Wealth', desc: 'SIP, mutual funds & stocks compounding', icon: '📈' },
    { id: 'HOUSE', label: 'Buy Home', desc: 'Downpayment for future property', icon: '🏠' },
    { id: 'VEHICLE', label: 'Buy Car', desc: 'Upgrade or purchase new vehicle', icon: '🚗' },
    { id: 'EDUCATION', label: 'Higher Education', desc: 'Post-grad or master courses savings', icon: '🎓' },
    { id: 'RETIREMENT', label: 'Retirement (FIRE)', desc: 'Aim for financial independence early', icon: '🌴' },
    { id: 'TRAVEL', label: 'Travel', desc: 'Fund for dream destinations & trips', icon: '✈️' },
    { id: 'WEDDING', label: 'Wedding', desc: 'Save for wedding day expenses', icon: '💍' },
  ];

  const handleToggleGoal = (id: FinancialGoalType) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(g => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const handleNext = () => {
    if (step < 6) {
      const nextStep = step + 1;
      setStep(nextStep);
      localStorage.setItem('onboarding_step', nextStep.toString());
    } else {
      setIsGenerating(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      localStorage.setItem('onboarding_step', prevStep.toString());
    }
  };

  // Progress percentage calc
  const progressPercent = Math.round((step / 6) * 100);

  // Render Intermediate Loading Shimmer Screen
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-[#081120] text-white flex flex-col items-center justify-center p-6 z-50">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Animated Blue Pulse Orb */}
          <div className="relative flex justify-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse border border-blue-500/30">
              <Sparkles className="h-10 w-10 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-white">
              {loadingMessages[loadingStepIdx]}
            </h3>
            
            {/* Minimal Progress Bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((loadingStepIdx + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Initializing Sarthi</span>
              <span>{Math.round(((loadingStepIdx + 1) / loadingMessages.length) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#081120] text-[#0F172A] dark:text-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-x-hidden select-none">
      
      {/* LEFT SIDE PANEL: GUIDED STEP QUESTIONNAIRE */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between min-h-screen p-6 lg:p-12 bg-white dark:bg-[#0B1426] border-r border-slate-200/60 dark:border-slate-900 shadow-sm relative">
        
        {/* Top: Minimal Progress Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-blue-500" />
              Onboarding Blueprint
            </span>
            <span>Step {step} of 6 • {progressPercent}%</span>
          </div>

          {/* Clean Segmented Indicator */}
          <div className="grid grid-cols-6 gap-1 h-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= step
                    ? 'bg-blue-600 dark:bg-blue-50'
                    : 'bg-slate-100 dark:bg-slate-900'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center: Slide-in Step Questionnaire */}
        <div className="my-8 lg:my-0 lg:py-8 max-w-xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* STEP 1: WELCOME SCREEN */}
              {step === 1 && (
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                      {greeting}
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                      Welcome to FinanceSarthi 👋
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                      Let's build your personalized financial roadmap. This questionnaire will help our AI engine construct your budget, optimize your taxes, and layout wealth goals.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Personalized Blueprint</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Takes less than 2 minutes. No credit cards or account binding fees required.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-semibold">
                    <span className="text-amber-500 font-bold text-sm">★★★★★</span>
                    <span>Trusted by thousands of Indian professionals</span>
                  </div>
                </div>
              )}

              {/* STEP 2: INCOME INPUT */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 2: Income Setup</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      How much do you take home every month?
                    </h2>
                    <p className="text-xs text-slate-400">This helps us compute your budget and savings allocations.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative h-14 w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 transition-all rounded-2xl flex items-center px-4">
                      <span className="text-xl font-bold text-slate-400 mr-2 select-none">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="75000"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                      <span>After taxes & deductions</span>
                      <span>Format: ₹ {formatCurrency(salary)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Used to calculate your 50/30/20 budget allocations.</span>
                  </div>
                </div>
              )}

              {/* STEP 3: AGE STEPPER */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 3: Age Demographics</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What is your current age?
                    </h2>
                    <p className="text-xs text-slate-400">Used to adjust compounding timelines and retirement targets.</p>
                  </div>

                  {/* Elegant Age Counter & Slider */}
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 text-center space-y-4">
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {age} <span className="text-sm font-semibold text-slate-400">Years</span>
                    </div>

                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>18 Years</span>
                      <span>65 Years</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION CARDS */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 4: Regional Costs</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Where do you live?
                    </h2>
                    <p className="text-xs text-slate-400">Living expenses and emergency buffers differ significantly across Tier locations.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'TIER_1', title: 'Metro', desc: 'Mumbai, Delhi, Bangalore, Chennai, Kolkata', icon: Building2 },
                      { id: 'TIER_2', title: 'Tier 2 City', desc: 'Pune, Jaipur, Indore, Chandigarh, Lucknow', icon: Building },
                      { id: 'TIER_3', title: 'Rural / Small Town', desc: 'Villages, towns and smaller district areas', icon: Home },
                    ].map((loc) => {
                      const Icon = loc.icon;
                      const isSelected = cityTier === loc.id;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setCityTier(loc.id as CityTier)}
                          className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5 -translate-y-0.5'
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{loc.title}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-sm">{loc.desc}</p>
                            </div>
                          </div>

                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-800'
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: FINANCIAL GOALS */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 5: Targets & Milestones</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What are your financial priorities?
                    </h2>
                    <p className="text-xs text-slate-400">Select multiple targets you want your Sarthi to configure.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {goalOptions.map((g) => {
                      const isSelected = goals.includes(g.id);
                      return (
                        <div
                          key={g.id}
                          onClick={() => handleToggleGoal(g.id)}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start justify-between ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/5 shadow-sm scale-[0.99]'
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className="text-lg shrink-0 mt-0.5">{g.icon}</span>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">{g.label}</h4>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{g.desc}</p>
                            </div>
                          </div>

                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-800'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: RISK PROFILE */}
              {step === 6 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 6: Risk Tolerances</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Select your investment risk profile
                    </h2>
                    <p className="text-xs text-slate-400">Risk profiles align your budget models towards optimal assets categories.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'CONSERVATIVE', title: 'Conservative 🛡️', yield: '5 - 8%', risk: 'Low Risk', desc: 'Prioritizes capital protection using government bonds and fixed deposits.' },
                      { id: 'MODERATE', title: 'Balanced (Recommended) ⚖️', yield: '10 - 14%', risk: 'Medium Risk', desc: 'Balanced allocations split across stock equities, index mutual funds, and debt.' },
                      { id: 'AGGRESSIVE', title: 'Aggressive 🚀', yield: '15%+', risk: 'High Risk', desc: 'Focused on high growth assets including smallcap stocks, sector mutual funds, and alternatives.' },
                    ].map((rp) => {
                      const isSelected = riskProfile === rp.id;
                      return (
                        <div
                          key={rp.id}
                          onClick={() => setRiskProfile(rp.id as RiskProfile)}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start justify-between ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/5 shadow-md -translate-y-0.5'
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">{rp.title}</h4>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                {rp.risk}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium max-w-md">{rp.desc}</p>
                            <span className="text-[10px] text-blue-500 font-bold block">
                              Expected Yield: {rp.yield}
                            </span>
                          </div>

                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-800'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Panel: Interactive Controls */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-900">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="h-[56px] flex-1 max-w-[360px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {step === 6 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate My AI Financial Blueprint</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Secure encryption indicators */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              Bank-level Encryption
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              100% Data Privacy
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL: LIVE AI PREVIEW (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-50 dark:bg-[#081120] p-8 flex-col justify-between border-l border-slate-200/60 dark:border-slate-900">
        
        {/* Header container */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <Activity className="h-4 w-4 text-blue-500" />
            <span>FinanceSarthi AI Preview</span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Based on your profile</h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time parameters rendering updates dynamic variables values.</p>
          </div>
        </div>

        {/* Blueprint Live Mockup Box */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-900 shadow-xl space-y-6">
          {/* Section 1: Estimated Monthly Savings */}
          <div className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-900">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Estimated Monthly Savings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{estSavingsAmount.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">({Math.round(estSavingsPct * 100)}% allocation)</span>
            </div>
          </div>

          {/* Section 2: 50/30/20 Budget Split */}
          <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-900">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Budget Allocation Splitting</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Needs (50%)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1">₹{Math.round(numSalary * 0.50).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Wants (30%)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1">₹{Math.round(numSalary * 0.30).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/40 text-center">
                <span className="text-[9px] font-bold text-blue-500 uppercase block">Savings ({Math.round(estSavingsPct * 100)}%)</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mt-1">₹{estSavingsAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Parameters list */}
          <div className="space-y-3">
            {[
              { label: 'Emergency Fund Goal', val: `₹${emergencyGoal.toLocaleString('en-IN')}`, badge: `${cityTier === 'TIER_1' ? '6 Months' : cityTier === 'TIER_2' ? '5 Months' : '4 Months'} Buffer` },
              { label: 'Investment Style', val: riskProfile, sub: getInvestmentStyle(riskProfile) },
              { label: 'Tax Slab Recommendation', val: getTaxRegime(numSalary) },
            ].map((stat, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{stat.label}</span>
                  {stat.sub && <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 leading-normal block max-w-xs">{stat.sub}</span>}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{stat.val}</span>
                  {stat.badge && <span className="text-[8px] font-bold text-emerald-500 uppercase block mt-0.5">{stat.badge}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info lock */}
        <div className="flex items-center gap-2.5 text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
          <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
          <span>Sarthi AI calculations secure standard banking algorithms.</span>
        </div>
      </div>
      
    </div>
  );
};
