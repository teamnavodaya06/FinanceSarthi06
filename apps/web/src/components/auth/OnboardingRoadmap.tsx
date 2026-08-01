import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CityTier, RiskProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';
import { Wallet, Target, Sparkles, Building2, Building, Home, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@financesarthi/utils';

export const OnboardingRoadmap: React.FC = () => {
  const { completeOnboarding, userProfile } = useAuth();
  
  const [salary, setSalary] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [cityTier, setCityTier] = useState<CityTier>('TIER_2');
  const [occupation, setOccupation] = useState<OccupationType>('Salaried');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('MODERATE');
  
  const [goals, setGoals] = useState<FinancialGoalType[]>(['EMERGENCY_FUND', 'INVESTMENT']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goalOptions: { id: FinancialGoalType; label: string }[] = [
    { id: 'EMERGENCY_FUND', label: 'Emergency Fund 🛡️' },
    { id: 'INVESTMENT', label: 'Long-term Wealth / SIP 📈' },
    { id: 'HOME', label: 'Home Purchase 🏠' },
    { id: 'VEHICLE', label: 'New Car / SUV 🚗' },
    { id: 'RETIREMENT', label: 'Early Retirement (FIRE) 🌴' },
    { id: 'EDUCATION', label: 'Higher Education 🎓' },
  ];

  const handleToggleGoal = (id: FinancialGoalType) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(g => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary || isSubmitting) return;

    setIsSubmitting(true);
    await completeOnboarding({
      cityTier,
      occupation,
      monthlySalary: Number(salary),
      financialGoals: goals,
      riskProfile,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Build Your Financial Roadmap
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tell us a bit about yourself so your Sarthi can guide you better.
        </p>
      </div>

      {/* Main Questionnaire Card */}
      <form onSubmit={handleFormSubmit} className="p-8 rounded-[32px] bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* 1. In-hand salary */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
            Monthly In-Hand Salary
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">₹</span>
            <input
              type="number"
              required
              min="1000"
              placeholder="0.00"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-blue-50/40 dark:bg-blue-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl pl-8 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
            />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
            Include all regular monthly income after taxes.
          </span>
        </div>

        {/* 2. Age */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
            Your Age
          </label>
          <input
            type="number"
            required
            min="18"
            max="100"
            placeholder="e.g. 28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full bg-blue-50/40 dark:bg-blue-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
          />
        </div>

        {/* 3. Location / City Tier Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
            Where do you live?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'TIER_1', title: 'Metro', desc: 'Mumbai, Delhi...', icon: Building2 },
              { id: 'TIER_2', title: 'Developing', desc: 'Pune, Jaipur...', icon: Building },
              { id: 'TIER_3', title: 'Rural', desc: 'Towns & Villages', icon: Home },
            ].map((tier) => {
              const Icon = tier.icon;
              const isSelected = cityTier === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setCityTier(tier.id as CityTier)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-1.5 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">{tier.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Financial Goals Priorities */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
            What are your financial priorities?
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {goalOptions.map((g) => {
              const isSelected = goals.includes(g.id);
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleToggleGoal(g.id)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Risk Tolerance */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
            Select Your Risk Profile
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'CONSERVATIVE', label: 'Conservative 🛡️' },
              { id: 'MODERATE', label: 'Moderate ⚖️' },
              { id: 'AGGRESSIVE', label: 'Aggressive 🚀' },
            ].map((rp) => {
              const isSelected = riskProfile === rp.id;
              return (
                <button
                  type="button"
                  key={rp.id}
                  onClick={() => setRiskProfile(rp.id as RiskProfile)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {rp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit See My Plan CTA */}
        <button
          type="submit"
          disabled={!salary || isSubmitting}
          className="w-full h-[52px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
        >
          <Sparkles className="h-4.5 w-4.5" />
          <span>See My Plan</span>
        </button>
      </form>

      {/* Footer Encryption Label */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Lock className="h-4 w-4 text-emerald-500" />
        <span>Your data is encrypted and securely stored.</span>
      </div>
    </div>
  );
};
