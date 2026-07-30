import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '@financesarthi/utils';
import { GoalCategory } from '@financesarthi/types';
import { Target, Plus, Sparkles, Trophy, Shield, Home, Car, Plane, Heart, GraduationCap, Flame } from 'lucide-react';
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

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, user } = useFinancial();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('VACATION');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyAlloc, setMonthlyAlloc] = useState('');
  const [celebrateGoal, setCelebrateGoal] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-sky-400" />
            Financial Goals & SIP Target Predictor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-horizon life goals: Emergency Fund, Vehicle, House, Marriage, and Retirement.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goal Celebration Modal */}
      <AnimatePresence>
        {celebrateGoal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 border-2 border-blue-500/60 shadow-2xl flex flex-col items-center text-center space-y-4"
          >
            <div className="h-16 w-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sky-400 animate-bounce">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-white">🎉 Goal Milestone Completed!</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Congratulations {user.name}! You have reached 100% of your target allocation for this financial goal.
            </p>
            <button
              onClick={() => setCelebrateGoal(null)}
              className="py-2.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30 cursor-pointer"
            >
              Continue Growth
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Goal Form Drawer */}
      {isAddOpen && (
        <form onSubmit={handleCreateGoal} className="p-6 rounded-3xl glass-card border border-blue-500/30 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-white">Setup New Financial Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Euro Trip 2027"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Target Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 400000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const Icon = GOAL_ICONS[g.category] || Target;
          const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

          // Calculate estimated months left based on monthly allocation & 12% equity growth
          const monthsLeft = g.monthlyAllocation > 0
            ? Math.ceil((g.targetAmount - g.currentAmount) / g.monthlyAllocation)
            : 24;

          return (
            <motion.div
              key={g.id}
              whileHover={{ y: -3 }}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-4 border border-slate-800 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{g.title}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{g.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-sky-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Saved: <strong className="text-white">{formatCurrency(g.currentAmount)}</strong></span>
                  <span>Target: <strong className="text-slate-300">{formatCurrency(g.targetAmount)}</strong></span>
                </div>
              </div>

              {/* AI Prediction Chip */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  Target Prediction:
                </span>
                <span className="font-bold text-sky-400">~{monthsLeft} Months</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleContribute(g.id, g.currentAmount, g.targetAmount)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-sky-400 transition-all cursor-pointer"
                >
                  + Add ₹10,000 SIP
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
