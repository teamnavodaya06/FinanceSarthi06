import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { CityTier, RiskProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';
import { incomeApi } from '../../api/incomeApi';
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
  User,
  Calendar,
  Globe,
  DollarSign
} from 'lucide-react';
import { applyLanguageTranslation } from '../../utils/translation';

export const OnboardingRoadmap: React.FC = () => {
  const { completeOnboarding, userProfile, user: fbUser } = useAuth();
  const { updateIncome } = useFinancial();

  // Onboarding Wizard Steps: 1 to 8
  const [step, setStep] = useState<number>(() => {
    return Number(localStorage.getItem('onboarding_step')) || 1;
  });

  // Step 2: Income
  const [incomeSource, setIncomeSource] = useState<string>(() => {
    return localStorage.getItem('onboarding_income_source') || 'Salary';
  });
  const [salary, setSalary] = useState<string>(() => {
    return localStorage.getItem('onboarding_salary') || '75000';
  });
  const [annualIncome, setAnnualIncome] = useState<string>(() => {
    return localStorage.getItem('onboarding_annual_income') || '';
  });
  const [salaryDate, setSalaryDate] = useState<number>(() => {
    return Number(localStorage.getItem('onboarding_salary_date')) || 1;
  });

  // Step 3: Demographics
  const [age, setAge] = useState<number>(() => {
    return Number(localStorage.getItem('onboarding_age')) || 26;
  });
  const [dob, setDob] = useState<string>(() => {
    return localStorage.getItem('onboarding_dob') || '2000-01-01';
  });
  const [gender, setGender] = useState<string>(() => {
    return localStorage.getItem('onboarding_gender') || 'Male';
  });
  const [city, setCity] = useState<string>(() => {
    return localStorage.getItem('onboarding_city') || 'Mumbai';
  });
  const [state, setState] = useState<string>(() => {
    return localStorage.getItem('onboarding_state') || 'Maharashtra';
  });
  const [country, setCountry] = useState<string>(() => {
    return localStorage.getItem('onboarding_country') || 'India';
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('onboarding_currency') || 'INR';
  });

  // Step 4: Occupation
  const [occupation, setOccupation] = useState<string>(() => {
    return localStorage.getItem('onboarding_occupation') || 'Employee';
  });

  // Step 5: Financial Goals
  const [goals, setGoals] = useState<FinancialGoalType[]>(() => {
    const saved = localStorage.getItem('onboarding_goals');
    try {
      return saved ? JSON.parse(saved) : ['EMERGENCY_FUND', 'INVESTMENT'];
    } catch {
      return ['EMERGENCY_FUND', 'INVESTMENT'];
    }
  });
  const [customGoal, setCustomGoal] = useState<string>(() => {
    return localStorage.getItem('onboarding_custom_goal') || '';
  });

  // Step 6: Current Financial Status (Optional)
  const [rent, setRent] = useState<string>(() => localStorage.getItem('onboarding_rent') || '');
  const [emi, setEmi] = useState<string>(() => localStorage.getItem('onboarding_emi') || '');
  const [savings, setSavings] = useState<string>(() => localStorage.getItem('onboarding_savings') || '');
  const [investments, setInvestments] = useState<string>(() => localStorage.getItem('onboarding_investments') || '');
  const [debt, setDebt] = useState<string>(() => localStorage.getItem('onboarding_debt') || '');
  const [emergencyFund, setEmergencyFund] = useState<string>(() => localStorage.getItem('onboarding_emergency_fund') || '');

  // Step 7: Preferred Language
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('onboarding_language') || 'English';
  });

  // Loading generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState<number>(0);

  const loadingMessages = [
    'Building your AI Financial Blueprint...',
    'Analyzing income cycles and costs...',
    'Calculating emergency buffer needs...',
    'Optimizing 50/30/20 budget allocations...',
    'Customizing Sarthi AI memory buffers...',
    'Redirecting to secure dashboard environment...',
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            finishOnboarding();
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const mapOccupation = (occ: string): OccupationType => {
    if (occ === 'Student') return 'Student';
    if (occ === 'Business' || occ === 'Self Employed') return 'Business';
    if (occ === 'Freelancer') return 'Freelancer';
    return 'Salaried';
  };

  const finishOnboarding = async () => {
    // Purge local onboarding values
    const keys = [
      'onboarding_step', 'onboarding_income_source', 'onboarding_salary',
      'onboarding_annual_income', 'onboarding_salary_date', 'onboarding_age',
      'onboarding_dob', 'onboarding_gender', 'onboarding_city', 'onboarding_state',
      'onboarding_country', 'onboarding_currency', 'onboarding_occupation',
      'onboarding_goals', 'onboarding_custom_goal', 'onboarding_rent', 'onboarding_emi',
      'onboarding_savings', 'onboarding_investments', 'onboarding_debt',
      'onboarding_emergency_fund', 'onboarding_language'
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // Calculate city tier based on input city
    const metrocities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'];
    const calculatedTier: CityTier = metrocities.includes(city.toLowerCase().trim()) ? 'METRO' : 'TIER_2';

    // Map risk profile based on goals/age (Moderate as baseline default)
    const calculatedRisk: RiskProfile = age > 45 ? 'CONSERVATIVE' : goals.includes('INVESTMENT') ? 'AGGRESSIVE' : 'MODERATE';

    // 1. Sync Income CRUD record
    // 1. Sync Income CRUD record (non-blocking background)
    const riskMap: Record<string, 'Conservative' | 'Balanced' | 'Aggressive'> = {
      CONSERVATIVE: 'Conservative',
      MODERATE: 'Balanced',
      AGGRESSIVE: 'Aggressive'
    };

    const priorities = goals.map(g => {
      switch (g) {
        case 'EMERGENCY_FUND': return 'Emergency Fund';
        case 'RETIREMENT': return 'Retirement';
        case 'INVESTMENT': return 'Wealth Creation';
        case 'HOUSE': return 'Home';
        case 'EDUCATION': return 'Education';
        case 'TRAVEL': return 'Travel';
        default: return 'Wealth Creation';
      }
    });

    const payload = {
      monthlyIncome: Number(salary),
      salaryType: (incomeSource === 'Salary' ? 'Salary' : 'Business') as any,
      employmentType: (occupation === 'Employee' ? 'Private' : 'Self-Employed') as any,
      incomeFrequency: 'Monthly' as const,
      cityCategory: calculatedTier === 'METRO' ? 'Metro' as const : 'Tier2' as const,
      taxRegime: 'New' as const,
      bonusIncome: 0,
      otherIncome: 0,
      freelanceIncome: incomeSource === 'Freelancer' ? Number(salary) : 0,
      rentalIncome: 0,
      investmentIncome: Number(investments) || 0,
      currency,
      financialPriority: priorities,
      riskProfile: riskMap[calculatedRisk] || 'Balanced',
      isPrimaryIncome: true,
    };

    incomeApi.getIncome()
      .then(async (existingResponse) => {
        if (existingResponse.success && existingResponse.data) {
          await incomeApi.updateIncome(existingResponse.data.id, payload);
        } else {
          await incomeApi.createIncome(payload);
        }
      })
      .catch((err) => console.warn('Failed to sync CRUD income profile:', err));

    // 2. Set default AI response language preference
    localStorage.setItem('sarthi_lang_pref', language);

    // 3. Update Income context centrally
    updateIncome({ monthlyIncome: Number(salary) }).catch(e => console.warn(e));

    // 4. Update Firestore Profile basic record (non-blocking background)
    completeOnboarding({
      cityTier: calculatedTier,
      occupation: mapOccupation(occupation),
      monthlySalary: Number(salary),
      financialGoals: goals,
      riskProfile: calculatedRisk,
      preferredLanguage: language,
      dob,
      gender,
      city,
      state,
      country,
      currency,
      isOnboarded: true,
    }).catch(e => console.warn(e));
  };

  const handleNext = async () => {
    // Auto-save step data to backend database basic profile on continue click (production data persistence)
    try {
      const dataToSave: any = {};
      if (step === 2) {
        dataToSave.monthlySalary = Number(salary);
        dataToSave.annualIncome = Number(annualIncome) || Number(salary) * 12;
        dataToSave.salaryDate = salaryDate;
        dataToSave.incomeSource = incomeSource;
      } else if (step === 3) {
        dataToSave.dob = dob;
        dataToSave.age = age;
        dataToSave.gender = gender;
        dataToSave.city = city;
        dataToSave.state = state;
        dataToSave.country = country;
        dataToSave.currency = currency;
      } else if (step === 4) {
        dataToSave.occupation = mapOccupation(occupation);
      } else if (step === 5) {
        dataToSave.financialGoals = goals;
        dataToSave.customGoal = customGoal;
      } else if (step === 6) {
        dataToSave.monthlyRent = Number(rent) || 0;
        dataToSave.monthlyEmi = Number(emi) || 0;
        dataToSave.currentSavings = Number(savings) || 0;
        dataToSave.currentInvestments = Number(investments) || 0;
        dataToSave.currentDebt = Number(debt) || 0;
        dataToSave.currentEmergencyFund = Number(emergencyFund) || 0;
      } else if (step === 7) {
        dataToSave.preferredLanguage = language;
      }
      
      // Save partial profile data directly on database (non-blocking)
      completeOnboarding(dataToSave).catch(e => console.warn('Deferred step persistence error:', e));
    } catch (e) {
      console.warn('Deferred step persistence error:', e);
    }

    if (step < 8) {
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

  const goalOptions: { id: FinancialGoalType | 'CUSTOM'; label: string; desc: string; icon: string }[] = [
    { id: 'EMERGENCY_FUND', label: 'Emergency Fund', desc: 'Secure 6 months of expenses', icon: '🛡️' },
    { id: 'INVESTMENT', label: 'Wealth Creation', desc: 'Compounding & mutual funds SIPs', icon: '📈' },
    { id: 'HOUSE', label: 'Buy House', desc: 'Downpayment for future property', icon: '🏠' },
    { id: 'VEHICLE', label: 'Buy Car', desc: 'Purchase a new vehicle', icon: '🚗' },
    { id: 'RETIREMENT', label: 'Retirement (FIRE)', desc: 'Financial freedom targets', icon: '🌴' },
    { id: 'TRAVEL', label: 'Travel', desc: 'Fund for future destinations', icon: '✈️' },
    { id: 'EDUCATION', label: 'Higher Education', desc: 'Masters or post-grad degrees', icon: '🎓' },
    { id: 'CUSTOM', label: 'Custom Goal', desc: 'Write your custom milestones', icon: '🎯' },
  ];

  const handleToggleGoal = (id: any) => {
    if (id === 'CUSTOM') {
      if (goals.includes('INVESTMENT')) return; // Custom goal behaves like investment
    }
    let nextGoals;
    if (goals.includes(id)) {
      nextGoals = goals.filter(g => g !== id);
    } else {
      nextGoals = [...goals, id];
    }
    setGoals(nextGoals);
    localStorage.setItem('onboarding_goals', JSON.stringify(nextGoals));
  };

  // Render Intermediate Blueprint Generation Screen
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-[#081120] text-white flex flex-col items-center justify-center p-6 z-50">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="relative flex justify-center animate-bounce">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <Sparkles className="h-10 w-10 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white animate-pulse">
              {loadingMessages[loadingStepIdx]}
            </h3>
            
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((loadingStepIdx + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#081120] text-[#0F172A] dark:text-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-x-hidden select-text">
      
      {/* LEFT SIDE PANEL: GUIDED STEP QUESTIONNAIRE */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between min-h-screen p-6 lg:p-12 bg-white dark:bg-[#0B1426] border-r border-slate-200/60 dark:border-slate-900 shadow-sm relative">
        
        {/* Top: Minimal Progress Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-blue-500" />
              SaaS onboarding wizard
            </span>
            <span>Step {step} of 8 • {Math.round((step / 8) * 100)}%</span>
          </div>

          <div className="grid grid-cols-8 gap-1 h-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-blue-600 dark:bg-blue-50' : 'bg-slate-100 dark:bg-slate-900'
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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* STEP 1: WELCOME SCREEN */}
              {step === 1 && (
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                      Welcome Greeting
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                      Hi {userProfile?.displayName?.split(' ')[0] || fbUser?.displayName?.split(' ')[0] || 'there'} 👋
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed pt-1 font-medium">
                      Let's personalize FinanceSarthi to match your exact financial lifecycle.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Centralized Profile Setup</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">All details are permanently synced to your secure Google Account.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MONTHLY INCOME */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 2: Monthly Income</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Enter your monthly earnings coordinates
                    </h2>
                  </div>

                  {/* Income Source Select buttons */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Income Source</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['Salary', 'Business', 'Freelancer', 'Student', 'Retired', 'Other'].map(src => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => {
                            setIncomeSource(src);
                            localStorage.setItem('onboarding_income_source', src);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            incomeSource === src
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Monthly Salary (₹)</label>
                      <input
                        type="number"
                        placeholder="75000"
                        value={salary}
                        onChange={(e) => {
                          setSalary(e.target.value);
                          localStorage.setItem('onboarding_salary', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Annual Income (₹) <span className="text-slate-400 font-medium">(Optional)</span></label>
                      <input
                        type="number"
                        placeholder="900000"
                        value={annualIncome}
                        onChange={(e) => {
                          setAnnualIncome(e.target.value);
                          localStorage.setItem('onboarding_annual_income', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Salary Day of Month</label>
                    <select
                      value={salaryDate}
                      onChange={(e) => {
                        setSalaryDate(Number(e.target.value));
                        localStorage.setItem('onboarding_salary_date', e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: DEMOGRAPHICS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 3: Demographics</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Tell us about yourself
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => {
                          setDob(e.target.value);
                          localStorage.setItem('onboarding_dob', e.target.value);
                          // Approximate age calculation
                          const birthYr = new Date(e.target.value).getFullYear();
                          const currentYr = new Date().getFullYear();
                          if (birthYr) {
                            setAge(currentYr - birthYr);
                            localStorage.setItem('onboarding_age', (currentYr - birthYr).toString());
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Gender <span className="text-slate-400 font-medium">(Optional)</span></label>
                      <select
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value);
                          localStorage.setItem('onboarding_gender', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer Not to Say">Prefer Not to Say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          localStorage.setItem('onboarding_city', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          localStorage.setItem('onboarding_state', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          localStorage.setItem('onboarding_country', e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value);
                        localStorage.setItem('onboarding_currency', e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 4: OCCUPATION */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 4: Employment status</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What is your occupation?
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Student', 'Employee', 'Business', 'Self Employed', 'Professional', 'Retired', 'Other'].map(occ => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => {
                          setOccupation(occ);
                          localStorage.setItem('onboarding_occupation', occ);
                        }}
                        className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                          occupation === occ
                            ? 'border-blue-600 bg-blue-600/5 text-blue-600'
                            : 'border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: FINANCIAL GOALS */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 5: Targets & Milestones</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What are your financial goals?
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {goalOptions.map((g) => {
                      const isSelected = goals.includes(g.id as any) || (g.id === 'CUSTOM' && customGoal.length > 0);
                      return (
                        <div
                          key={g.id}
                          onClick={() => handleToggleGoal(g.id)}
                          className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/5 shadow-sm'
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                          }`}
                        >
                          <div className="flex gap-2">
                            <span className="text-base shrink-0">{g.icon}</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">{g.label}</h4>
                              <p className="text-[9px] text-slate-500">{g.desc}</p>
                            </div>
                          </div>

                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-800'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Goal Input Box if clicked custom goal */}
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Custom Goal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dream Wedding, Buy Tesla..."
                      value={customGoal}
                      onChange={(e) => {
                        setCustomGoal(e.target.value);
                        localStorage.setItem('onboarding_custom_goal', e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: CURRENT FINANCIAL STATUS (OPTIONAL) */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 6: Balance Sheet</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Current Financial Status <span className="text-slate-400 font-medium text-sm">(Optional)</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={rent}
                        onChange={(e) => { setRent(e.target.value); localStorage.setItem('onboarding_rent', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Monthly EMI (₹)</label>
                      <input
                        type="number"
                        placeholder="5000"
                        value={emi}
                        onChange={(e) => { setEmi(e.target.value); localStorage.setItem('onboarding_emi', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Current Savings (₹)</label>
                      <input
                        type="number"
                        placeholder="250000"
                        value={savings}
                        onChange={(e) => { setSavings(e.target.value); localStorage.setItem('onboarding_savings', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Current Investments (₹)</label>
                      <input
                        type="number"
                        placeholder="500000"
                        value={investments}
                        onChange={(e) => { setInvestments(e.target.value); localStorage.setItem('onboarding_investments', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Current Debt (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={debt}
                        onChange={(e) => { setDebt(e.target.value); localStorage.setItem('onboarding_debt', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-550 block mb-0.5">Emergency Fund (₹)</label>
                      <input
                        type="number"
                        placeholder="100000"
                        value={emergencyFund}
                        onChange={(e) => { setEmergencyFund(e.target.value); localStorage.setItem('onboarding_emergency_fund', e.target.value); }}
                        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: PREFERRED LANGUAGE */}
              {step === 7 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">Step 7: Sarthi AI Language</span>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Select your preferred language
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      'English', 'Hindi', 'Hinglish', 'Marathi',
                      'Tamil', 'Telugu', 'Kannada', 'Gujarati',
                      'Bengali', 'Punjabi', 'Malayalam', 'Auto Detect'
                    ].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          localStorage.setItem('onboarding_language', lang);
                          applyLanguageTranslation(lang);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                          language === lang
                            ? 'border-blue-605 bg-blue-600/5 text-blue-600'
                            : 'border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: FINAL STEP */}
              {step === 8 && (
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block">
                      All Setup!
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                      Generating Your Profile
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                      Click the button below to initialize your Sarthi environment. We will calculate your initial financial health score, structure budgets, and boot your Sarthi AI memory.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Environment Ready</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Ready to redirect to Dashboard. No subsequent setup required.</p>
                    </div>
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
              className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
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
              {step === 8 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Profile & Start</span>
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
              Secure Authentication
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              SaaS Encrypted Record
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL: LIVE AI PREVIEW (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-50 dark:bg-[#081120] p-8 flex-col justify-between border-l border-slate-200/60 dark:border-slate-900">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <Activity className="h-4 w-4 text-blue-500" />
            <span>FinanceSarthi AI Preview</span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Based on your coordinates</h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time parameters sync from database inputs.</p>
          </div>
        </div>

        {/* Blueprint Live Mockup Box */}
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-900 shadow-xl space-y-6">
          <div className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-900">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Monthly Income</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(salary).toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">({incomeSource})</span>
            </div>
          </div>

          <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-900">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">50/30/20 Budget Split</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Needs (50%)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1">₹{Math.round((Number(salary) || 0) * 0.50).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Wants (30%)</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-1">₹{Math.round((Number(salary) || 0) * 0.30).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/40 text-center">
                <span className="text-[9px] font-bold text-blue-500 uppercase block">Savings (20%)</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mt-1">₹{Math.round((Number(salary) || 0) * 0.20).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Demographics info', val: `${age} Yrs | ${gender}`, sub: `${city}, ${state}, ${country}` },
              { label: 'Language preferred', val: language },
              { label: 'Goals identifiedCount', val: `${goals.length} active goals`, sub: customGoal ? `Custom: ${customGoal}` : undefined },
            ].map((stat, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{stat.label}</span>
                  {stat.sub && <span className="text-[8px] font-medium text-slate-450 dark:text-slate-500 leading-normal block max-w-xs">{stat.sub}</span>}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{stat.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
          <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
          <span>SaaS onboarding environment secure.</span>
        </div>
      </div>
      
    </div>
  );
};
