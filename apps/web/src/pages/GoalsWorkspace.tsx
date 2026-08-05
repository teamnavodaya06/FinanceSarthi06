import React, { useState, useEffect, useMemo } from 'react';
import { useGoals, useGoalForecast, useGoalAnalytics } from '../hooks/useGoals';
import { useGoalProgress, useGoalHealth, useGoalMilestones } from '../hooks/useGoalProgress';
import { useGoalCoach } from '../hooks/useGoalCoach';
import { useFinancial } from '../context/FinancialContext';
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
      { amount: 10000, goalId: 'goal-emergency', goalName: 'Emergency Fund', when: 'Today', bullet: 'bg-emerald-500' },
      { amount: 5000, goalId: 'goal-home', goalName: 'Home Down Payment', when: 'Yesterday', bullet: 'bg-blue-500' },
      { amount: 15000, goalId: 'goal-vacation', goalName: 'Vacation Plan', when: 'Last Week', bullet: 'bg-purple-500' },
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
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500'];
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
    if (status === 'Completed') return { text: '🟢 Completed', style: 'text-emerald-700 bg-emerald-50/70 border border-emerald-250/20' };
    if (status === 'Ahead of Schedule') return { text: '🟢 Excellent', style: 'text-emerald-700 bg-emerald-50/70 border border-emerald-250/20' };
    if (status === 'On Track') return { text: '🟡 On Track', style: 'text-blue-700 bg-blue-50/70 border border-blue-250/20' };
    if (status === 'Archived' || status === 'Cancelled') return { text: '🟠 Paused', style: 'text-amber-700 bg-amber-50/70 border border-amber-250/20' };
    return { text: '🔴 Behind Schedule', style: 'text-red-700 bg-red-50/70 border border-red-250/20' };
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
    // Generates premium curve progression data based on goals
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
        { name: 'Emergency Fund', value: 45, color: '#2563EB' },
        { name: 'Home Purchase', value: 30, color: '#10B981' },
        { name: 'Vacation', value: 15, color: '#8B5CF6' },
        { name: 'Others', value: 10, color: '#64748B' },
      ];
    }
    return goals.map((g, idx) => {
      const colors = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B'];
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

  // AI Recommendation (Apple Intelligence / ChatGPT style)
  const activeRecommendation = recommendations?.[0] || null;

  return (
    <div className="space-y-10 pb-20 bg-white text-slate-900 max-w-4xl mx-auto px-4 md:px-6 select-none font-sans leading-relaxed">
      
      {/* Toast Feedback notifications */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle className="h-4 w-4 text-emerald-450 shrink-0" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="space-y-1">
          <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            🎯 My Financial Goals
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
            Track your financial dreams and let Sarthi help you reach them faster.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          >
            + Create Goal
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all hover:scale-[1.01] cursor-pointer"
          >
            AI Goal Planner
          </button>
        </div>
      </div>

      {/* SECTION 2: Goal Summary (3 Rich KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/30 to-indigo-50/10 border border-blue-100/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] hover:shadow transition-all relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-11 w-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Active Goals</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 block leading-none">{activeCount}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              ▲ +1 created this month
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/30 to-teal-50/10 border border-emerald-100/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] hover:shadow transition-all relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-11 w-11 rounded-xl bg-emerald-655/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Saved</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 block leading-none">₹{totalSaved.toLocaleString('en-IN')}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              ▲ +₹12,500 this week
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/30 to-indigo-50/10 border border-purple-100/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] hover:shadow transition-all relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-11 w-11 rounded-xl bg-purple-655/10 text-purple-650 flex items-center justify-center shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Monthly Allocation</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 block leading-none">₹{totalContribution.toLocaleString('en-IN')}</span>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
              ● 88% budget utilized
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: My Goals list */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1.5 border-b border-slate-100">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">My Goals</h2>
          
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-505 w-full sm:w-auto">
            {/* Premium filter chips */}
            {(['All', 'Active', 'Completed', 'Paused', 'Wishlist'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full border transition-all hover:scale-101 cursor-pointer ${
                  activeTab === tab
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/15'
                    : 'border-slate-200 bg-slate-50 text-slate-655 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Quick Tags */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative h-10 w-full max-w-xs bg-slate-50 border border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-655/15 focus-within:shadow-sm rounded-xl flex items-center px-3 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search Goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-450 font-bold self-start sm:self-center">
            <span>Quick filters:</span>
            {['Emergency', 'Home', 'Vacation'].map(q => (
              <button
                key={q}
                onClick={() => setSearchQuery(q)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-655 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((g) => {
              const statusLabel = getGoalStatusLabel(g.status);
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              return (
                <div
                  key={g.goalId}
                  onClick={() => {
                    setSelectedGoalId(g.goalId);
                    setIsDrawerOpen(true);
                  }}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between h-52 space-y-4 relative overflow-hidden group border-b-2 border-b-blue-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-lg shadow-sm">
                        {g.goalType === 'EMERGENCY_FUND' ? '🛡️' : g.goalType === 'HOME_PURCHASE' || g.goalType === 'HOUSE' ? '🏠' : g.goalType === 'CAR_PURCHASE' || g.goalType === 'VEHICLE' ? '🚗' : g.goalType === 'VACATION' ? '✈' : '🎯'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-955 tracking-tight group-hover:text-blue-600 transition-colors">
                          {g.goalName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">{g.priority} Priority</span>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusLabel.style}`}>
                      {statusLabel.text}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Saved: ₹{g.currentAmount.toLocaleString('en-IN')} <span className="text-blue-600 font-extrabold text-[10px] ml-1 bg-blue-50 px-1.5 py-0.5 rounded-md">{g.completionPercentage}%</span></span>
                      <span>Target: ₹{g.targetAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="relative">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-505 rounded-full transition-all duration-500"
                          style={{ width: `${g.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Progress status</span>
                      <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Goal Card footer info */}
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-150">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Completion: {g.estimatedCompletionDate || g.targetDate}
                    </span>
                    <button className="text-blue-600 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer text-xs">
                      Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl py-14 space-y-4">
            <span className="text-2xl block">🔮</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Start Building Your Financial Future</h3>
              <p className="text-xs text-slate-450 font-semibold max-w-sm mx-auto leading-relaxed">
                Create your first financial goal and let Sarthi automatically guide you.
              </p>
            </div>
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow shadow-blue-500/10 cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4: AI Recommendation (Apple Intelligence / ChatGPT style) */}
      {activeRecommendation && (
        <div className="space-y-4 pt-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">AI Recommendation</h2>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/30 to-indigo-50/10 border border-blue-100/30 space-y-4 shadow-sm relative overflow-hidden">
            {/* Gradient accent block */}
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-650" />
            <div className="absolute top-[-40px] right-[-40px] w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

            <button
              onClick={async () => {
                await handleAction(activeRecommendation.id, 'DISMISS');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition p-1 hover:bg-slate-100 rounded-full cursor-pointer z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <Brain className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="space-y-3 text-xs flex-1">
                <span className="text-[10px] md:text-[11px] font-black uppercase text-blue-600 tracking-widest block">✨ Today's Recommendation</span>
                
                {/* Structured Recommendation Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-655 pt-1 font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Problem</span>
                    <p className="text-slate-800 font-bold">Emergency Fund completion is slower than expected.</p>
                  </div>
                  <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Recommendation</span>
                    <p className="text-blue-600 font-bold">Increase contribution by ₹3,500/month.</p>
                  </div>
                  <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Impact</span>
                    <p className="text-emerald-600 font-bold">✓ Finish 4 months earlier</p>
                    <p className="text-emerald-600 font-bold">✓ Improve financial safety</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold pt-3 border-t border-slate-150">
              <button
                onClick={async () => {
                  await handleAction(activeRecommendation.id, 'DISMISS');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-505 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-650 cursor-pointer"
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
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow"
              >
                Apply Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Contribution History & Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
            <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">Contribution History</h2>
            
            <div className="flex items-center gap-3">
              {/* growth chip */}
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-black text-[11px] flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +14.2% Growth
              </span>
              
              {/* Period selection */}
              <div className="flex rounded-md bg-slate-100 p-0.5 text-[11px] font-bold">
                {(['1M', '3M', '6M', '1Y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTimePeriod(p)}
                    className={`px-2 py-0.5 rounded transition ${timePeriod === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450 hover:text-slate-700'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '10px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts PieChart (Contribution Distribution) */}
        <div className="space-y-4">
          <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight pb-1.5 border-b border-slate-100">
            Distribution
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm h-48 flex flex-col justify-between items-center relative">
            <div className="h-32 w-full relative">
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Breakdown</span>
                <span className="text-[11px] font-black text-slate-850 mt-1 leading-none">Asset Mix</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Micro details indicators */}
            <div className="flex gap-2 text-[10px] font-bold text-slate-505">
              {distributionData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name.substring(0, 7)}..</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 10: Horizontal Stacked Goals Completion Progress */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight pb-1.5 border-b border-slate-100">
          Notion Progress Tracker
        </h2>
        
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 shadow-sm">
          {goals.map(g => (
            <div key={g.goalId} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{g.goalName}</span>
                <span>{g.completionPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-md overflow-hidden flex">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${g.completionPercentage}%` }}
                />
                <div
                  className="h-full bg-slate-300"
                  style={{ width: `${100 - g.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 11: AI Insights */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight pb-1.5 border-b border-slate-100">
          AI Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-bold">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-emerald-500 text-sm">✔</span>
            <span className="text-slate-700">Consistently contributing.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-emerald-500 text-sm">✔</span>
            <span className="text-slate-700">Home Goal is ahead.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-emerald-500 text-sm">✔</span>
            <span className="text-slate-700">Emergency Fund increased by 12%.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
            <span className="text-amber-500 text-sm">⚠</span>
            <span className="text-slate-700">Vacation Goal slowed.</span>
          </div>
        </div>
      </div>

      {/* SECTION 12: Recent Contributions Timeline */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight pb-1.5 border-b border-slate-100">
          Recent Contributions Timeline
        </h2>
        
        <div className="pl-3 border-l border-dashed border-blue-200 ml-2 space-y-4 relative text-xs font-semibold text-slate-655">
          {renderedContributions.map((tx, idx) => (
            <div key={idx} className="relative flex items-center justify-between pl-4 group">
              <span className={`absolute left-[-17px] top-1 h-3 w-3 rounded-full border border-white ${tx.bullet} shadow-sm group-hover:scale-105 transition-transform`} />
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-extrabold text-sm">₹{tx.amount.toLocaleString('en-IN')}</span>
                <span className="text-slate-400 font-bold">➔</span>
                <span className="text-slate-700 font-bold">{tx.goalName}</span>
              </div>
              <span className="text-[10px] text-slate-450 font-bold">{tx.when}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 13: Quick Actions Modern Tiles */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight pb-1.5 border-b border-slate-100">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-50/30 to-indigo-50/10 border border-blue-150/20 hover:scale-[1.01] hover:shadow transition-all text-left block cursor-pointer"
          >
            <span className="text-xl block mb-1.5">➕</span>
            <h4 className="text-xs font-bold text-slate-850 block">Create Goal</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Start a new dream target.</span>
          </button>

          <button
            onClick={() => {
              if (goals[0]) {
                setSelectedGoalId(goals[0].goalId);
                setIsDrawerOpen(true);
              }
            }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/30 to-teal-50/10 border border-emerald-150/20 hover:scale-[1.01] hover:shadow transition-all text-left block cursor-pointer"
          >
            <span className="text-xl block mb-1.5">💰</span>
            <h4 className="text-xs font-bold text-slate-850 block">Contribute</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Add savings instantly.</span>
          </button>

          <button
            onClick={() => {
              if (goals[0]) {
                setSelectedGoalId(goals[0].goalId);
                setIsDrawerOpen(true);
              }
            }}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-50/30 to-indigo-50/10 border border-purple-150/20 hover:scale-[1.01] hover:shadow transition-all text-left block cursor-pointer"
          >
            <span className="text-xl block mb-1.5">✏</span>
            <h4 className="text-xs font-bold text-slate-850 block">Edit Goal</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Modify monthly contribution.</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-50/30 to-orange-50/10 border border-amber-150/20 hover:scale-[1.01] hover:shadow transition-all text-left block cursor-pointer"
          >
            <span className="text-xl block mb-1.5">🤖</span>
            <h4 className="text-xs font-bold text-slate-850 block">Ask AI</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Get personalized roadmap tips.</span>
          </button>
        </div>
      </div>

      {/* GOAL DETAILS RIGHT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedGoal && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 cursor-pointer"
            />

            {/* Right Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl border-l border-slate-100 p-5 flex flex-col justify-between overflow-y-auto space-y-4"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                    Goal Details
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                    Configure allocation and check projections
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-900 font-bold p-1 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Goal parameters overview */}
              <div className="space-y-3 text-xs font-semibold text-slate-655">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Goal Name</span>
                    <span className="text-slate-900 font-bold">{selectedGoal.goalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Target Amount</span>
                    <span className="text-slate-900 font-bold">₹{selectedGoal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Current Saved</span>
                    <span className="text-slate-900 font-bold">₹{selectedGoal.currentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Monthly Allocation</span>
                    <span className="text-slate-900 font-bold">₹{selectedGoal.monthlyContribution.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Goal Status</span>
                    <span className="text-emerald-500 font-black">
                      {getGoalStatusLabel(selectedGoal.status).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* MILESTONES TIMELINE */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Milestone Timeline Progress</h4>
                
                <div className="pl-3 border-l border-slate-200 ml-1.5 space-y-2.5 relative text-xs font-bold text-slate-500">
                  <div className="relative">
                    <span className={`absolute left-[-16px] top-0.5 h-2 w-2 rounded-full border border-white ${selectedGoal.completionPercentage >= 0 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={selectedGoal.completionPercentage >= 0 ? 'text-slate-900' : 'text-slate-400'}>🚀 Goal Created</span>
                  </div>
                  <div className="relative">
                    <span className={`absolute left-[-16px] top-0.5 h-2 w-2 rounded-full border border-white ${selectedGoal.completionPercentage >= 25 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={selectedGoal.completionPercentage >= 25 ? 'text-slate-900 animate-pulse' : 'text-slate-400'}>25% Milestones Achieved</span>
                  </div>
                  <div className="relative">
                    <span className={`absolute left-[-16px] top-0.5 h-2 w-2 rounded-full border border-white ${selectedGoal.completionPercentage >= 50 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={selectedGoal.completionPercentage >= 50 ? 'text-slate-900' : 'text-slate-400'}>50% Halfway Mark</span>
                  </div>
                  <div className="relative">
                    <span className={`absolute left-[-16px] top-0.5 h-2 w-2 rounded-full border border-white ${selectedGoal.completionPercentage >= 75 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={selectedGoal.completionPercentage >= 75 ? 'text-slate-900' : 'text-slate-400'}>75% Completion Proximity</span>
                  </div>
                  <div className="relative">
                    <span className={`absolute left-[-16px] top-0.5 h-2 w-2 rounded-full border border-white ${selectedGoal.completionPercentage >= 100 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={selectedGoal.completionPercentage >= 100 ? 'text-slate-900 font-extrabold' : 'text-slate-400'}>🏆 Goal Completed</span>
                  </div>
                </div>
              </div>

              {/* Log goal fund contribution block */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Log Goal Fund Contribution</h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Amount to save"
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      className="w-full h-8.5 bg-white border border-slate-200 rounded-lg pl-6 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleLogContrib(selectedGoal.goalId)}
                    className="h-8.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Save Cash
                  </button>
                </div>
              </div>

              {/* Advanced controls actions */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() => setShowWhatIfModal(true)}
                    className="flex-1 h-8.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all"
                  >
                    What If Calculator
                  </button>
                  <button
                    onClick={() => handleTogglePause(selectedGoal)}
                    className="px-3 h-8.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-bold cursor-pointer"
                  >
                    {(selectedGoal.status === 'Archived' || selectedGoal.status === 'Cancelled') ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleGoalDelete(selectedGoal.goalId)}
                    className="px-3 h-8.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold cursor-pointer"
                  >
                    <Trash className="h-3.5 w-3.5" />
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
          <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-slate-100 rounded-2xl p-5 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-905 tracking-tight uppercase">
                    What If Calculator
                  </h3>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                    Interactive contribution rates simulator
                  </span>
                </div>
                <button
                  onClick={() => setShowWhatIfModal(false)}
                  className="text-slate-450 hover:text-slate-905 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Simulated Monthly Contribution</span>
                  <span className="text-blue-600 font-black">₹{simSliderVal.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={simSliderVal}
                  onChange={(e) => setSimSliderVal(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-slate-100 accent-blue-600 cursor-pointer"
                />

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs font-semibold text-slate-655 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current completion</span>
                    <span className="text-slate-800">{selectedGoal.targetDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simulated completion</span>
                    <span className="text-blue-600 font-extrabold">{simulatedDate}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-1.5 text-[9px] font-bold text-emerald-600">
                    <span>Timeline change</span>
                    <span>Finish faster by {Math.max(0, (selectedGoal.monthlyContribution > 0 ? Math.ceil(selectedGoal.remainingAmount / selectedGoal.monthlyContribution) : 0) - simulatedMonths)} months</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-xs font-bold pt-1.5">
                <button
                  onClick={() => setShowWhatIfModal(false)}
                  className="flex-1 h-8.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-505 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateSimulatedAllocation(selectedGoal.goalId)}
                  className="flex-1 h-8.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
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
              className="w-full max-w-md bg-white border border-slate-100 rounded-[24px] p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-905 tracking-tight uppercase">
                  Configure Financial Goal
                </h3>
                <button
                  onClick={() => setShowNewGoalModal(false)}
                  className="text-slate-400 hover:text-slate-900 font-bold cursor-pointer p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormCreate} className="space-y-5 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Goal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home Down Payment"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-10 bg-white border-2 border-slate-200 focus:border-blue-650 focus:ring-4 focus:ring-blue-650/15 rounded-xl px-3 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full h-10 bg-white border-2 border-slate-200 focus:border-blue-650 focus:ring-4 focus:ring-blue-650/15 rounded-xl px-3 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Saving (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10000"
                      value={newContribution}
                      onChange={(e) => setNewContribution(e.target.value)}
                      className="w-full h-10 bg-white border-2 border-slate-200 focus:border-blue-650 focus:ring-4 focus:ring-blue-650/15 rounded-xl px-3 text-xs font-bold text-slate-880 placeholder-slate-400 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full h-10 bg-white border-2 border-slate-200 focus:border-blue-650 focus:ring-4 focus:ring-blue-650/15 rounded-xl px-2 text-xs font-bold text-slate-800 transition-all focus:outline-none cursor-pointer"
                    >
                      <option value="EMERGENCY_FUND">Emergency Fund</option>
                      <option value="CAR_PURCHASE">Car Purchase</option>
                      <option value="HOME_PURCHASE">Home Purchase</option>
                      <option value="VACATION">Vacation</option>
                      <option value="OTHER">Other Goals</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto Timeline</label>
                    <div className="w-full h-10 bg-blue-50/50 border-2 border-blue-100 rounded-xl px-3 flex items-center justify-between text-xs text-blue-755 font-black transition-all">
                      {autoDateObj ? (
                        <>
                          <span>{autoDateObj.months} months</span>
                          <span className="text-[9px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                            {autoDateObj.displayString}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Auto-calculating...</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-blue-500/10 text-xs text-center hover:scale-[1.01]"
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
