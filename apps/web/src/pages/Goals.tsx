import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '@financesarthi/utils';
import { GoalCategory } from '@financesarthi/types';
import {
  Target,
  Plus,
  Sparkles,
  Trophy,
  Shield,
  Home,
  Car,
  Plane,
  Heart,
  GraduationCap,
  Flame,
  X,
  Pencil,
  Trash2,
  MoreVertical,
  Calendar,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOAL_ICONS: Record<string, any> = {
  EMERGENCY_FUND: Shield,
  VEHICLE: Car,
  HOUSE: Home,
  VACATION: Plane,
  MARRIAGE: Heart,
  EDUCATION: GraduationCap,
  RETIREMENT: Flame,
  OTHER: Target,
};

const CATEGORY_NAMES: Record<string, string> = {
  EMERGENCY_FUND: 'Security & Stability',
  VEHICLE: 'Personal Asset',
  HOUSE: 'Real Estate / Property',
  VACATION: 'Life Experiences',
  MARRIAGE: 'Family & Milestones',
  EDUCATION: 'Academic Growth',
  RETIREMENT: 'Future Freedom',
  OTHER: 'Personal Target',
};

export const Goals: React.FC = () => {
  const { goals, addGoal, deleteGoal, updateGoalProgress, setActiveTab } = useFinancial();
  const { userProfile, user: fbUser } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('VACATION');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyAlloc, setMonthlyAlloc] = useState('');
  
  const [celebrateGoal, setCelebrateGoal] = useState<string | null>(null);

  // Dynamic Portfolio Stats
  const activeCount = goals.length;
  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const totalRemaining = totalTarget - totalSaved;

  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 75;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    addGoal({
      title,
      category,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyAllocation: Number(monthlyAlloc) || 5000,
      isCompleted: false,
    });

    setTitle('');
    setTargetAmount('');
    setMonthlyAlloc('');
    setIsAddOpen(false);
  };

  const handleContribute = (id: string, current: number, target: number) => {
    const topUp = 10000;
    updateGoalProgress(id, topUp);
    if (current + topUp >= target) {
      setCelebrateGoal(id);
    }
  };

  const getGoalDateFormatted = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Dec 2026';
    }
  };

  const getMonthsLeft = (g: any) => {
    if (g.isCompleted) return 'Completed';
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining <= 0) return 'Completed';
    const alloc = g.monthlyAllocation || 5000;
    const months = Math.ceil(remaining / alloc);
    return `${months} Months Left`;
  };

  return (
    <div className="space-y-6 pb-16 select-none relative">
      
      {/* Title Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Your Savings Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            "Setting goals is the first step in turning the invisible into the visible." - Your Sarthi Guide.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Celebration Modal Overlay */}
      <AnimatePresence>
        {celebrateGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-5"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">🎉 Goal Milestone Reached!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Incredible job! You have fully achieved this financial milestone. Keep building and scaling your wealth parameters!
              </p>
              <button
                onClick={() => setCelebrateGoal(null)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Continue Growth
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Global Health & Sarthi Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Portfolio Goal Health */}
        <div className="lg:col-span-8 p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-around items-center gap-6">
          {/* Circular donut */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="11"
                className="dark:stroke-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#047857"
                strokeWidth="11"
                strokeDasharray="219.9"
                strokeDashoffset={219.9 * (1 - overallPct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{overallPct}%</span>
              <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest block mt-1">Overall</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 max-w-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Global Overview</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Portfolio Goal Health</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                You are on track to hitting {activeCount > 0 ? activeCount - 1 : 0} of your {activeCount} major milestones this year. Increase contributions to reach safety sooner.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-center sm:text-left">
              <div>
                <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">Saved So Far</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-1">₹{totalSaved.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">Remaining</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1">₹{totalRemaining.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">Active Goals</span>
                <span className="text-xs font-black text-slate-900 dark:text-white block mt-1">{activeCount.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Sarthi's Wisdom (Indigo/blue widget) */}
        <div className="lg:col-span-4 p-6 rounded-[24px] sarthi-card text-white flex flex-col justify-between shadow-xl min-h-[220px] relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-blue-200" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sarthi's Wisdom</h4>
          </div>

          <p className="text-[11px] italic font-semibold text-slate-100 leading-relaxed py-2">
            "Emergency funds are your financial oxygen. Before aiming for the clouds with a Travel Fund, ensure your life-jacket is fully inflated."
          </p>

          {/* Sarthi identity footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <div className="h-6 w-6 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0">
              S
            </div>
            <div>
              <span className="text-[9px] font-bold text-white block">Aditya</span>
              <span className="text-[7px] text-slate-300 font-bold block mt-0.5">Lead Finance Guide</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Grid of Active Goals + Dotted Add Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {goals.map((g) => {
          const Icon = GOAL_ICONS[g.category] || Target;
          const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

          return (
            <motion.div
              key={g.id}
              whileHover={{ y: -3 }}
              className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[200px]"
            >
              {/* Header icons line */}
              <div className="flex justify-between items-start">
                <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-700 dark:text-sky-400 shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleContribute(g.id, g.currentAmount, g.targetAmount)}
                    title="Add SIP Contribution"
                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-950 text-blue-600 hover:text-blue-500 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    title="Delete Goal"
                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-950 text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Title parameters */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{g.title}</h4>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                  {CATEGORY_NAMES[g.category] || 'Personal Target'}
                </span>
              </div>

              {/* Progress sliders info */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-450">Progress</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">
                    ₹{g.currentAmount.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-medium">/ {(g.targetAmount / 100000).toFixed(1)}L</span>
                  </span>
                </div>

                {/* Meter bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>

              {/* Date footer badges */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 dark:text-sky-400">
                  <Calendar className="h-3 w-3" />
                  {getMonthsLeft(g)}
                </span>
                <span className="text-[9px] font-bold text-slate-450">
                  Target: {getGoalDateFormatted(g.targetDate)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Card 4: Dotted Add Card */}
        <div
          onClick={() => setIsAddOpen(true)}
          className="p-6 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]"
        >
          <div className="h-10 w-10 rounded-full border border-slate-250 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-slate-900 dark:text-slate-350">Dreaming of something?</h5>
            <p className="text-[10px] text-slate-450 leading-relaxed font-semibold max-w-[200px] mt-1">
              Define your next milestone and let Sarthi guide you.
            </p>
          </div>
        </div>

      </div>

      {/* Row 3: Bottom Path to Freedom Banner */}
      <div className="p-8 rounded-[24px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-indigo-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 min-h-[160px]">
        {/* Decorative graphic background path image if available, else smooth visual overlay */}
        <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/financial_path_hero.jpg')" }} />

        <div className="space-y-2 z-10 max-w-2xl">
          <h3 className="text-xl font-black text-white">The Path to Freedom</h3>
          <p className="text-xs text-slate-205 leading-relaxed font-semibold">
            Every Rupee saved today is a brick in the foundation of your future independence. Track your progress, stay consistent, and watch your empire grow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => setActiveTab('salary')}
            className="h-10 px-5 rounded-xl bg-white hover:bg-slate-50 text-blue-900 font-bold text-xs shadow transition-all cursor-pointer"
          >
            Explore Investment Guide
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-sm backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>AI Strategy Chat</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SETUP GOAL MODAL DIALOG */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-50 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Setup New Financial Goal
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateGoal} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Euro Trip 2027"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-450 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Target amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 400000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-450 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="EMERGENCY_FUND">Emergency Fund</option>
                    <option value="VEHICLE">Vehicle / Bike / SUV</option>
                    <option value="HOUSE">House / Real Estate</option>
                    <option value="VACATION">Vacation / Travel</option>
                    <option value="MARRIAGE">Marriage / Family Event</option>
                    <option value="EDUCATION">Higher Education</option>
                    <option value="RETIREMENT">Retirement Corpus</option>
                    <option value="OTHER">Other Goal</option>
                  </select>
                </div>

                {/* Monthly Contribution */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Contribution (SIP Plan)</label>
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="e.g. 10000"
                    value={monthlyAlloc}
                    onChange={(e) => setMonthlyAlloc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-950 dark:text-white placeholder:text-slate-450 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Goal</span>
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
