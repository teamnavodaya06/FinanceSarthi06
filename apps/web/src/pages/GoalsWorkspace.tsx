import React, { useState, useEffect, useMemo } from 'react';
import { useGoals, useGoalForecast, useGoalAnalytics } from '../hooks/useGoals';
import { useGoalProgress, useGoalHealth, useGoalMilestones } from '../hooks/useGoalProgress';
import { useGoalCoach } from '../hooks/useGoalCoach';
import { useFinancial } from '../context/FinancialContext';
import { useTranslation } from '../utils/i18n';

import {
  Plus,
  DollarSign,
  Calendar,
  Target,
  Award,
  Sliders,
  Sparkles,
  Search,
  Check,
  CheckCircle,
  X,
  Trash,
  Pause,
  Play,
  ArrowRight,
  Info,
  Clock,
  TrendingUp,
  Brain,
  AlertCircle,
  ArrowUpRight,
  Compass,
  Zap,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const GoalsWorkspace: React.FC = () => {
  const { setIsAiDrawerOpen } = useFinancial();
  const { t } = useTranslation();

  
  // Goals logic hooks
  const { goals, loading, createGoal, updateGoal, deleteGoal, addContribution, refresh: refreshGoals } = useGoals();
  const { analytics } = useGoalAnalytics();
  const { recommendations, handleAction, refresh: refreshCoach } = useGoalCoach();

  // Selected goal details drawer state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed' | 'Paused' | 'Wishlist'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Selected goal forecasts & milestone details
  const selectedGoal = useMemo(() => {
    return goals.find(g => g.goalId === selectedGoalId) || null;
  }, [goals, selectedGoalId]);

  const { forecast } = useGoalForecast(selectedGoal?.goalId || null);
  const { progress } = useGoalProgress(selectedGoal?.goalId || null);
  const { health: progressHealth } = useGoalHealth(selectedGoal?.goalId || null);
  const { milestones } = useGoalMilestones(selectedGoal?.goalId || null);

  // New goal form state variables
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('EMERGENCY_FUND');
  const [newTarget, setNewTarget] = useState<string>('');
  const [newContribution, setNewContribution] = useState<string>('');

  // Log Contribution state
  const [contribAmount, setContribAmount] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Simulator slider value state
  const [simSliderVal, setSimSliderVal] = useState<number>(10000);

  // Contributions timeline state
  const [contributionsList, setContributionsList] = useState<any[]>(() => {
    const stored = localStorage.getItem('sarthi_contributions_timeline');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      { amount: 10000, goalId: 'goal-emergency', goalName: 'Emergency Fund', when: 'Today', bullet: 'bg-emerald-400' },
      { amount: 5000, goalId: 'goal-home', goalName: 'Home Down Payment', when: 'Yesterday', bullet: 'bg-blue-400' },
      { amount: 15000, goalId: 'goal-vacation', goalName: 'Vacation Plan', when: 'Last Week', bullet: 'bg-purple-400' },
    ];
  });

  // Save contributions state to localStorage
  useEffect(() => {
    localStorage.setItem('sarthi_contributions_timeline', JSON.stringify(contributionsList));
  }, [contributionsList]);

  // Pre-load default values when goal changes
  useEffect(() => {
    if (selectedGoal) {
      setSimSliderVal(selectedGoal.monthlyContribution || 10000);
    }
  }, [selectedGoalId, selectedGoal]);

  // Total summary metrics computed dynamically
  const activeCount = useMemo(() => goals.filter(g => g.status !== 'Completed').length, [goals]);
  const totalSaved = useMemo(() => goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0), [goals]);
  const totalContribution = useMemo(() => goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0), [goals]);

  // Calculate auto date based on target and monthly savings
  const autoDateObj = useMemo(() => {
    const target = Number(newTarget);
    const contribution = Number(newContribution);
    if (target > 0 && contribution > 0) {
      const months = Math.ceil(target / contribution);
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      const dateString = date.toISOString().split('T')[0];
      const displayString = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      return { months, dateString, displayString };
    }
    return null;
  }, [newTarget, newContribution]);

  const getRandomBulletColor = () => {
    const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-amber-400'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle forms
  const handleFormCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget || !newContribution) return;
    
    // Auto-calculated targetDate
    const computedDate = autoDateObj ? autoDateObj.dateString : new Date(Date.now() + 31536000000).toISOString().split('T')[0];

    const success = await createGoal({
      goalName: newName,
      goalType: newType,
      targetAmount: Number(newTarget),
      monthlyContribution: Number(newContribution),
      targetDate: computedDate,
      currentAmount: 0,
      priority: 'High',
      status: 'On Track'
    });
    
    if (success) {
      setShowNewGoalModal(false);
      setNewName('');
      setNewTarget('');
      setNewContribution('');
      setActionFeedback('Goal created successfully.');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleLogContrib = async (goalId: string) => {
    const val = Number(contribAmount);
    if (!val || val <= 0) return;
    const success = await addContribution(goalId, val);
    if (success) {
      const goalObj = goals.find(g => g.goalId === goalId);
      const name = goalObj ? goalObj.goalName : 'Goal';
      
      const newTx = {
        amount: val,
        goalId,
        goalName: name,
        when: 'Just Now',
        bullet: getRandomBulletColor(),
      };
      setContributionsList(prev => [newTx, ...prev]);

      setContribAmount('');
      setActionFeedback(`Logged ₹${val.toLocaleString('en-IN')} contribution successfully.`);
      refreshGoals();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleUpdateSimulatedAllocation = async (goalId: string) => {
    const success = await updateGoal(goalId, { monthlyContribution: simSliderVal });
    if (success) {
      setShowWhatIfModal(false);
      setActionFeedback(`Contribution rate updated to ₹${simSliderVal.toLocaleString('en-IN')}/mo`);
      refreshGoals();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleTogglePause = async (goal: any) => {
    const newStatus = (goal.status === 'Archived' || goal.status === 'Cancelled') ? 'On Track' : 'Archived';
    const success = await updateGoal(goal.goalId, { status: newStatus as any });
    if (success) {
      setActionFeedback(`Goal status set to ${newStatus === 'Archived' ? 'Paused' : 'Active'}`);
      refreshGoals();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleGoalDelete = async (goalId: string) => {
    const success = await deleteGoal(goalId);
    if (success) {
      setIsDrawerOpen(false);
      setSelectedGoalId(null);
      setActionFeedback('Goal successfully removed.');
      refreshGoals();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // Status mapping
  const getGoalStatusLabel = (status: string) => {
    if (status === 'Completed') return { text: '🟢 Completed', style: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' };
    if (status === 'Ahead of Schedule') return { text: '🟢 Excellent', style: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' };
    if (status === 'On Track') return { text: '🔵 On Track', style: 'text-blue-400 bg-blue-500/10 border border-blue-500/30' };
    if (status === 'Archived' || status === 'Cancelled') return { text: '🟠 Paused', style: 'text-amber-400 bg-amber-500/10 border border-amber-500/30' };
    return { text: '🔴 Behind Schedule', style: 'text-rose-400 bg-rose-500/10 border border-rose-500/30' };
  };

  // Filtered list
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchSearch = g.goalName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === 'All') return true;
      if (activeTab === 'Active') return g.status !== 'Completed' && g.status !== 'Archived' && g.status !== 'Cancelled';
      if (activeTab === 'Completed') return g.status === 'Completed';
      if (activeTab === 'Paused') return g.status === 'Archived' || g.status === 'Cancelled';
      if (activeTab === 'Wishlist') return g.priority === 'Low';
      return true;
    });
  }, [goals, activeTab, searchQuery]);

  // Simulated completion calculator (What If)
  const simulatedMonths = useMemo(() => {
    if (!selectedGoal) return 0;
    const remaining = selectedGoal.remainingAmount;
    return simSliderVal > 0 ? Math.ceil(remaining / simSliderVal) : 999;
  }, [selectedGoal, simSliderVal]);

  const simulatedDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + simulatedMonths);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [simulatedMonths]);

  // Chart data calculations
  const historyData = useMemo(() => {
    const pointsCount = timePeriod === '1M' ? 4 : timePeriod === '3M' ? 12 : timePeriod === '6M' ? 6 : 12;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const data = [];
    let startVal = totalSaved > 0 ? totalSaved * 0.7 : 85000;
    
    for (let i = pointsCount - 1; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      const progressFactor = (pointsCount - i) / pointsCount;
      const contributionsSum = totalContribution > 0 ? totalContribution * progressFactor : 35000 * progressFactor;
      data.push({
        name: months[mIdx],
        amount: Math.round(startVal + contributionsSum),
        monthly: Math.round((totalContribution > 0 ? totalContribution : 45000) * (0.95 + Math.random() * 0.1)),
      });
    }
    return data;
  }, [timePeriod, totalSaved, totalContribution]);

  const distributionData = useMemo(() => {
    if (goals.length === 0) {
      return [
        { name: 'Emergency Fund', value: 45, color: '#3B82F6' },
        { name: 'Home Purchase', value: 30, color: '#10B981' },
        { name: 'Vacation', value: 15, color: '#A855F7' },
        { name: 'Others', value: 10, color: '#64748B' },
      ];
    }
    return goals.map((g, idx) => {
      const colors = ['#3B82F6', '#10B981', '#A855F7', '#F59E0B', '#EF4444', '#64748B'];
      return {
        name: g.goalName,
        value: g.currentAmount || 10000,
        color: colors[idx % colors.length],
      };
    });
  }, [goals]);

  // Dynamically map current goal names in timeline
  const renderedContributions = useMemo(() => {
    return contributionsList.map(tx => {
      const currentGoal = goals.find(g => g.goalId === tx.goalId);
      return {
        ...tx,
        goalName: currentGoal ? currentGoal.goalName : tx.goalName
      };
    });
  }, [contributionsList, goals]);

  // AI Recommendation
  const activeRecommendation = recommendations?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 selection:bg-blue-500 selection:text-white">
      
      {/* Toast Feedback notifications */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-sm shadow-2xl shadow-blue-500/30 border border-white/20 backdrop-blur-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-300" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="pt-6 pb-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {t('financial_goals')}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
                {t('target_milestones')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            {t('create_goal')}
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            {t('ai_goal_planner')}
          </button>
        </div>
      </div>

      {/* SECTION 2: Goal Summary (3 Rich KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 to-slate-900/80 border border-blue-500/25 flex items-center gap-4 shadow-lg backdrop-blur-md"
        >
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('active_targets')}</span>
            <span className="text-2xl font-black text-white mt-0.5 block leading-none">{activeCount}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
              ▲ +1 created this month
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/80 border border-emerald-500/25 flex items-center gap-4 shadow-lg backdrop-blur-md"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('total_saved')}</span>
            <span className="text-2xl font-black text-white mt-0.5 block leading-none">₹{totalSaved.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
              ▲ +₹12,500 this week
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900/80 border border-purple-500/25 flex items-center gap-4 shadow-lg backdrop-blur-md"
        >
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('monthly_sip_allocation')}</span>
            <span className="text-2xl font-black text-white mt-0.5 block leading-none">₹{totalContribution.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 mt-1">
              ● 100% budget aligned
            </span>
          </div>
        </motion.div>
      </div>


      {/* SECTION 3: My Goals List */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            My Goal Targets
          </h2>
          
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold w-full sm:w-auto">
            {(['All', 'Active', 'Completed', 'Paused', 'Wishlist'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Quick Tags */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative h-11 w-full sm:w-80 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 rounded-2xl flex items-center px-3.5 transition-all shadow-inner">
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search Goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 self-start sm:self-center">
            <span>Quick filter:</span>
            {['Emergency', 'Home', 'Vacation'].map(q => (
              <button
                key={q}
                onClick={() => setSearchQuery(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredGoals.map((g) => {
              const statusLabel = getGoalStatusLabel(g.status);
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              return (
                <motion.div
                  key={g.goalId}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setSelectedGoalId(g.goalId);
                    setIsDrawerOpen(true);
                  }}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 backdrop-blur-md shadow-xl cursor-pointer flex flex-col justify-between space-y-5 relative overflow-hidden transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                        {g.goalType === 'EMERGENCY_FUND' ? '🛡️' : g.goalType === 'HOME_PURCHASE' || g.goalType === 'HOUSE' ? '🏠' : g.goalType === 'CAR_PURCHASE' || g.goalType === 'VEHICLE' ? '🚗' : g.goalType === 'VACATION' ? '✈' : '🎯'}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                          {g.goalName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">{g.priority} Priority</span>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusLabel.style}`}>
                      {statusLabel.text}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Saved: <strong className="text-white">₹{g.currentAmount.toLocaleString('en-IN')}</strong></span>
                      <span>Target: <strong className="text-white">₹{g.targetAmount.toLocaleString('en-IN')}</strong></span>
                    </div>

                    <div className="relative">
                      <div className="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${g.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span className="text-indigo-400 font-bold">{g.completionPercentage}% Completed</span>
                      <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Goal Card footer info */}
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pt-3 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Target: {g.estimatedCompletionDate || g.targetDate}
                    </span>
                    <button className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer text-xs">
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl py-14 space-y-4 bg-slate-900/40">
            <span className="text-3xl block">🔮</span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Start Building Your Financial Future</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Create your first financial goal and let Sarthi automatically guide your savings strategy.
              </p>
            </div>
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4: AI Goal Coach Recommendation */}
      {activeRecommendation && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Goal Coach Recommendation
          </h2>
          
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-5 relative overflow-hidden">
            <button
              onClick={async () => {
                await handleAction(activeRecommendation.id, 'DISMISS');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-full cursor-pointer z-10"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-3 text-xs sm:text-sm flex-1">
                <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider block">✨ Today's Optimization</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 font-normal pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Status</span>
                    <p className="text-white font-bold">Emergency Safety Fund completion timeline slowed.</p>
                  </div>
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommendation</span>
                    <p className="text-indigo-400 font-bold">Increase monthly contribution by ₹3,500.</p>
                  </div>
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expected Impact</span>
                    <p className="text-emerald-400 font-bold">✓ Finish 4 months earlier</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end text-xs font-bold pt-3 border-t border-slate-800">
              <button
                onClick={async () => {
                  await handleAction(activeRecommendation.id, 'DISMISS');
                }}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              >
                Explain Why
              </button>
              <button
                onClick={async () => {
                  await handleAction(activeRecommendation.id, 'APPROVE');
                  refreshGoals();
                  setActionFeedback('Recommendation applied successfully.');
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Apply Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Contribution History & Asset Mix Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Contribution History
            </h2>
            
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> +14.2% Growth
              </span>
              
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
                {(['1M', '3M', '6M', '1Y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${timePeriod === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorAmountGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmountGoals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts PieChart (Contribution Distribution) */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight pb-2 border-b border-slate-800">
            Goal Allocation Mix
          </h2>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl h-56 flex flex-col justify-between items-center relative">
            <div className="h-36 w-full relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Breakdown</span>
                <span className="text-xs font-black text-white mt-1 leading-none">Asset Mix</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={54}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2 text-xs font-bold text-slate-400">
              {distributionData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name.substring(0, 8)}..</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Recent Contributions Timeline */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight pb-2 border-b border-slate-800">
          Recent Contributions Activity
        </h2>
        
        <div className="pl-4 border-l-2 border-slate-800 ml-2 space-y-4 relative text-xs font-medium">
          {renderedContributions.map((tx, idx) => (
            <div key={idx} className="relative flex items-center justify-between pl-4 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <span className={`absolute left-[-22px] top-4 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${tx.bullet} ring-4 ring-blue-500/20`} />
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-sm">₹{tx.amount.toLocaleString('en-IN')}</span>
                <span className="text-slate-500 font-bold">➔</span>
                <span className="text-slate-300 font-semibold">{tx.goalName}</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{tx.when}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GOAL DETAILS RIGHT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedGoal && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-slate-950 shadow-2xl border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto space-y-6 text-slate-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight uppercase">
                    Goal Parameters
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Manage monthly allocations and milestone forecast
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Goal Name</span>
                    <span className="text-white font-bold">{selectedGoal.goalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Amount</span>
                    <span className="text-white font-bold">₹{selectedGoal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Saved</span>
                    <span className="text-emerald-400 font-bold">₹{selectedGoal.currentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Contribution</span>
                    <span className="text-indigo-400 font-bold">₹{selectedGoal.monthlyContribution.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              </div>

              {/* Log goal fund contribution block */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Log Goal Fund Contribution</h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Amount to save"
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => handleLogContrib(selectedGoal.goalId)}
                    className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Log Cash
                  </button>
                </div>
              </div>

              {/* Advanced controls actions */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() => setShowWhatIfModal(true)}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-blue-600/30 transition-all"
                  >
                    What If Calculator
                  </button>
                  <button
                    onClick={() => handleTogglePause(selectedGoal)}
                    className="px-4 h-10 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    {(selectedGoal.status === 'Archived' || selectedGoal.status === 'Cancelled') ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleGoalDelete(selectedGoal.goalId)}
                    className="px-4 h-10 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHAT IF CALCULATOR OVERLAY MODAL */}
      <AnimatePresence>
        {showWhatIfModal && selectedGoal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-white"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">
                    What If Calculator
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Simulate monthly savings contribution rate
                  </span>
                </div>
                <button
                  onClick={() => setShowWhatIfModal(false)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Simulated Contribution</span>
                  <span className="text-indigo-400 font-extrabold">₹{simSliderVal.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={simSliderVal}
                  onChange={(e) => setSimSliderVal(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-900 border border-slate-800 accent-indigo-500 cursor-pointer"
                />

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Target Date</span>
                    <span className="text-white font-bold">{selectedGoal.targetDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simulated Target Date</span>
                    <span className="text-indigo-400 font-extrabold">{simulatedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-xs font-bold pt-2">
                <button
                  onClick={() => setShowWhatIfModal(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateSimulatedAllocation(selectedGoal.goalId)}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE GOAL MODAL */}
      <AnimatePresence>
        {showNewGoalModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl text-white"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">
                  Configure Financial Goal
                </h3>
                <button
                  onClick={() => setShowNewGoalModal(false)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormCreate} className="space-y-4 text-xs font-semibold text-slate-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Goal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home Down Payment"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Monthly Saving (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10000"
                      value={newContribution}
                      onChange={(e) => setNewContribution(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="EMERGENCY_FUND">Emergency Fund</option>
                      <option value="CAR_PURCHASE">Car Purchase</option>
                      <option value="HOME_PURCHASE">Home Purchase</option>
                      <option value="VACATION">Vacation</option>
                      <option value="OTHER">Other Goals</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Auto Timeline</label>
                    <div className="w-full h-11 bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 flex items-center justify-between text-xs text-indigo-300 font-bold">
                      {autoDateObj ? (
                        <>
                          <span>{autoDateObj.months} months</span>
                          <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {autoDateObj.displayString}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500 font-medium italic">Auto-calculating...</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-blue-600/30 text-xs text-center active:scale-95 mt-2"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default GoalsWorkspace;
