import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CityTier, RiskProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';
import { formatCurrency } from '@financesarthi/utils';
import { GoogleButton } from './GoogleButton';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Wallet,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Home,
  Car,
  Plane,
  Flame,
  TrendingUp,
  GraduationCap,
  Heart,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CITY_TIERS = [
  { id: 'METRO', title: 'Metro (Tier 1)', desc: 'High rent & commute in Delhi, Mumbai, Bengaluru, Hyderabad.', badge: 'Higher Need Ratio (55%)' },
  { id: 'TIER_2', title: 'Tier 2 City', desc: 'Balanced cost-of-living in Pune, Jaipur, Lucknow, Chandigarh.', badge: 'Standard 50-30-20' },
  { id: 'TIER_3', title: 'Tier 3 Town', desc: 'Lower rent & high savings rate in growing regional centers.', badge: 'Higher Savings Ratio (30%)' },
  { id: 'VILLAGE', title: 'Village / Rural', desc: 'Minimal fixed living overheads, ideal for wealth accumulation.', badge: 'Max Wealth Potential' },
];

const OCCUPATIONS: { id: OccupationType; title: string; desc: string }[] = [
  { id: 'Salaried', title: 'Salaried Professional', desc: 'Fixed monthly income stream' },
  { id: 'Freelancer', title: 'Freelancer / Creator', desc: 'Variable monthly income' },
  { id: 'Business', title: 'Business Owner / MSME', desc: 'Business cashflows & reinvestment' },
  { id: 'Student', title: 'Student / Trainee', desc: 'First-time earner learning money basics' },
];

const GOAL_OPTIONS: { id: FinancialGoalType; title: string; desc: string; icon: any }[] = [
  { id: 'EMERGENCY_FUND', title: 'Emergency Safety Fund', desc: '6 months liquid safety net', icon: Shield },
  { id: 'INVESTMENT', title: 'Wealth & Equity SIP', desc: 'Compound long-term wealth', icon: TrendingUp },
  { id: 'HOME', title: 'Home Real Estate', desc: 'Save for down payment', icon: Home },
  { id: 'TRAVEL', title: 'Travel & Vacations', desc: 'International & local trips', icon: Plane },
  { id: 'VEHICLE', title: 'Vehicle / Bike / SUV', desc: 'Electric SUV or bike purchase', icon: Car },
  { id: 'RETIREMENT', title: 'Retirement Freedom', desc: 'Early financial independence (FIRE)', icon: Flame },
  { id: 'EDUCATION', title: 'Higher Education', desc: 'Courses, MBA, or certifications', icon: GraduationCap },
  { id: 'WEDDING', title: 'Wedding & Family Event', desc: 'Marriage expense corpus', icon: Heart },
];

const RISK_PROFILES: { id: RiskProfile; title: string; desc: string; ratio: string }[] = [
  { id: 'CONSERVATIVE', title: 'Conservative Risk', desc: 'Prioritize safety in FD, Liquid Funds & Debt', ratio: '80% Debt / 20% Equity' },
  { id: 'MODERATE', title: 'Moderate Growth', desc: 'Balanced approach with Index Funds & Debt SIPs', ratio: '60% Equity / 40% Debt' },
  { id: 'AGGRESSIVE', title: 'Aggressive Capital Compound', desc: 'Maximum equity exposure in Mid & Small-Caps', ratio: '85% Equity / 15% Debt' },
];

export const OnboardingWizard: React.FC<{ onSwitchToSignIn: () => void }> = ({ onSwitchToSignIn }) => {
  const { signUpWithEmail, signInWithGoogle, completeOnboarding, loading, userProfile } = useAuth();

  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [name, setName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 2 State
  const [cityTier, setCityTier] = useState<CityTier>('TIER_2');
  const [occupation, setOccupation] = useState<OccupationType>('Salaried');
  const [salary, setSalary] = useState<number>(75000);

  // Step 3 State
  const [goals, setGoals] = useState<FinancialGoalType[]>(['EMERGENCY_FUND', 'INVESTMENT']);

  // Step 4 State
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('MODERATE');

  // Step 5 State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { score, label: 'Strong', color: 'bg-teal-400' };
    return { score: 100, label: 'Excellent', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      setStep(2);
    } catch (e) {
      setStep(2);
    }
  };

  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    await signUpWithEmail(email, password, name, phoneNumber);
    setStep(2);
  };

  const handleToggleGoal = (id: FinancialGoalType) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(g => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    await completeOnboarding({
      cityTier,
      occupation,
      monthlySalary: salary,
      financialGoals: goals,
      riskProfile,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-5">
      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between px-1 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : s < step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 5 && <div className={`h-0.5 w-6 sm:w-8 ${s < step ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: BASIC INFORMATION */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3.5"
          >
            <div>
              <h3 className="text-xl font-black text-white">Basic Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Choose your preferred signup method to start.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Registration Buttons (Google) */}
            <div className="space-y-2">
              <GoogleButton onClick={handleGoogleSignUp} loading={loading} text="Sign Up with Google (Gmail)" />
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                <span className="bg-slate-900 px-3">Or create Email Account</span>
              </div>
            </div>

            <form onSubmit={handleStep1Next} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="text-emerald-400 font-bold">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Next: Financial Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        )}

        {/* STEP 2: FINANCIAL PROFILE */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Step 2 of 5</span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                Financial Profile & Occupation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your city tier, occupation, and monthly salary.
              </p>
            </div>

            {/* Occupation Grid */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Occupation</label>
              <div className="grid grid-cols-2 gap-2">
                {OCCUPATIONS.map((occ) => (
                  <div
                    key={occ.id}
                    onClick={() => setOccupation(occ.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      occupation === occ.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/50'
                    }`}
                  >
                    <h5 className="text-xs font-bold text-white">{occ.title}</h5>
                    <p className="text-[10px] text-slate-400">{occ.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* City Tier Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">City Tier</label>
              <div className="grid grid-cols-2 gap-2">
                {CITY_TIERS.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setCityTier(t.id as CityTier)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      cityTier === t.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/50'
                    }`}
                  >
                    <h5 className="text-xs font-bold text-white">{t.title}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Input */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Monthly Net Salary</span>
                <span className="text-emerald-400 font-black text-sm">{formatCurrency(salary)}</span>
              </div>
              <input
                type="range"
                min="15000"
                max="500000"
                step="5000"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Next: Financial Goals</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: FINANCIAL GOALS */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Step 3 of 5</span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Select Financial Goals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Multi-select all goals you wish to track.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((g) => {
                const Icon = g.icon;
                const isSelected = goals.includes(g.id);
                return (
                  <div
                    key={g.id}
                    onClick={() => handleToggleGoal(g.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{g.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{g.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Next: Risk Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: RISK PROFILE */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Step 4 of 5</span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                Select Investment Risk Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Determines AI mutual fund asset allocation.</p>
            </div>

            <div className="space-y-2.5">
              {RISK_PROFILES.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => setRiskProfile(rp.id as RiskProfile)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                    riskProfile === rp.id
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {rp.title}
                      {riskProfile === rp.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    </h4>
                    <p className="text-[11px] text-slate-400">{rp.desc}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {rp.ratio}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: CONFIRMATION / WELCOME */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5 text-center py-2"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Welcome to FinanceSarthi 🎉</h3>
              <p className="text-xs text-slate-300">
                Your AI financial companion profile is configured and ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>City Tier & Occupation:</span>
                <strong className="text-white">{cityTier} • {occupation}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                <span>Monthly Net Income:</span>
                <strong className="text-emerald-400">{formatCurrency(salary)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Selected Goals:</span>
                <strong className="text-white">{goals.length} Active Goals</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch My AI Financial Dashboard</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
