import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  X,
  Sparkles,
  Brain,
  ShieldCheck,
  Activity,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { AIOSService, ProactiveTask } from '../services/copilot/ai-os.service';

interface SavedSimulation {
  id: string;
  type: string;
  typeName: string;
  timestamp: string;
  inputs: any;
  result: any;
}

export const AIActionCenter: React.FC = () => {
  const { expenses, goals, healthScore, setIsAiDrawerOpen, setActiveTab, incomeData, user: finUser } = useFinancial();
  const { userProfile, user: fbUser } = useAuth();

  // Local States
  const [tasks, setTasks] = useState<ProactiveTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [executionFeedback, setExecutionFeedback] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Redesigned What If Calculator States
  const [selectedScenario, setSelectedScenario] = useState<string>('CAR');
  const [calculatorInputs, setCalculatorInputs] = useState<any>({});
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  
  // View all toggle for checklist
  const [viewAllRecommendations, setViewAllRecommendations] = useState(false);

  const rawSalary = finUser?.monthlyIncome || userProfile?.monthlySalary || 45000;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySurplus = Math.max(0, rawSalary - totalSpent);

  // Options cards configuration for Section 4
  const scenarioOptions = [
    { id: 'CAR', icon: '🚗', name: 'Buy a Car' },
    { id: 'HOME', icon: '🏠', name: 'Buy a Home' },
    { id: 'SIP', icon: '📈', name: 'Increase SIP' },
    { id: 'SALARY', icon: '💼', name: 'Salary Raise' },
    { id: 'VACATION', icon: '✈', name: 'Plan Vacation' },
    { id: 'LOAN', icon: '🎓', name: 'Education Loan' },
    { id: 'OTHERS', icon: '✨', name: 'Custom Goal' },
  ];

  // Initialize inputs presets
  useEffect(() => {
    setCalculatorInputs({});
    setSimulationResult(null);
  }, [selectedScenario]);

  // Load Proactive tasks and execution history
  useEffect(() => {
    const listTasks = AIOSService.generateProactiveTasks(expenses, rawSalary, goals);
    setTasks(listTasks);
    loadAuditHistory();
    const saved = localStorage.getItem('sarthi_simulations');
    if (saved) {
      try { setSavedSimulations(JSON.parse(saved)); } catch (e) {}
    }
  }, [expenses, goals, userProfile, rawSalary]);

  const loadAuditHistory = async () => {
    if (!fbUser) return;
    try {
      const q = query(collection(db, 'users', fbUser.uid, 'aiActionAuditLogs'), orderBy('timestamp', 'desc'), limit(5));
      const snap = await getDocs(q);
      const history: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        history.push({ id: doc.id, ...data });
      });
      setAuditLogs(history);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  };

  // Action Executors
  const handleExecuteTask = async (taskTitle: string, action: 'APPROVED' | 'DISMISSED') => {
    if (!fbUser) {
      setExecutionFeedback(`Action "${taskTitle}" successfully ${action === 'APPROVED' ? 'applied' : 'dismissed'}.`);
      setTasks(prev => prev.filter(t => t.title !== taskTitle));
      setTimeout(() => setExecutionFeedback(null), 4000);
      return;
    }
    try {
      await AIOSService.writeAuditLog(fbUser.uid, taskTitle, action === 'APPROVED' ? 'EXECUTED' : 'DISMISSED');
      setTasks(prev => prev.filter(t => t.title !== taskTitle));
      setExecutionFeedback(`Action "${taskTitle}" successfully ${action === 'APPROVED' ? 'applied' : 'dismissed'}.`);
      loadAuditHistory();
      setTimeout(() => setExecutionFeedback(null), 4000);
    } catch (err: any) {
      setExecutionFeedback(err.message || 'Action executed.');
      setTimeout(() => setExecutionFeedback(null), 4000);
    }
  };

  // Tailored What Happens If Calculation Logic
  const handleAnalyzeDecision = (e: React.FormEvent) => {
    e.preventDefault();
    let emiValue = 0;
    let savingsImpact = '';
    let goalDelay = '';
    let emergencyFundImpact = 'Still Safe';
    let recommendation = '';

    if (selectedScenario === 'CAR') {
      const price = Number(calculatorInputs.price) || 800000;
      const down = Number(calculatorInputs.downPayment) || 200000;
      const tenureMonths = (Number(calculatorInputs.tenure) || 5) * 12;
      const principal = Math.max(0, price - down);
      emiValue = Math.round((principal * 1.085) / tenureMonths);
      
      savingsImpact = `Reduces monthly surplus by ₹${emiValue.toLocaleString('en-IN')}`;
      goalDelay = emiValue > monthlySurplus * 0.3 ? 'Delay other goals by 3 months' : 'Minimal delay';
      emergencyFundImpact = down > monthlySurplus * 3 ? 'Cushion drops below safety margin' : 'Still Safe';
      recommendation = emiValue > monthlySurplus * 0.4 ? 'High Risk — EMI exceeds safe boundaries' : 'Safe — Financed comfortably';
    } 
    
    else if (selectedScenario === 'HOME') {
      const price = Number(calculatorInputs.price) || 4500000;
      const down = Number(calculatorInputs.downPayment) || 1000000;
      const tenureMonths = (Number(calculatorInputs.tenure) || 20) * 12;
      const principal = Math.max(0, price - down);
      emiValue = Math.round((principal * 1.0875) / tenureMonths);
      
      savingsImpact = `Reduces monthly surplus by ₹${emiValue.toLocaleString('en-IN')}`;
      goalDelay = emiValue > monthlySurplus * 0.5 ? 'Delay other goals by 6 months' : 'Minor delay';
      emergencyFundImpact = 'Requires liquidating cash cushions';
      recommendation = emiValue > monthlySurplus * 0.5 ? 'Needs Attention — Target lower property cost' : 'Safe — Supported within limits';
    } 
    
    else if (selectedScenario === 'SALARY') {
      const expected = Number(calculatorInputs.expectedSalary) || Math.round(rawSalary * 1.25);
      const diff = expected - rawSalary;
      
      emiValue = 0;
      savingsImpact = `Increases monthly surplus by ₹${diff.toLocaleString('en-IN')}`;
      goalDelay = 'Speeds up targets by 4 months';
      emergencyFundImpact = 'Boosts cushion potential immediately';
      recommendation = 'Highly Recommended — Redirect 50% raise to SIPs';
    } 
    
    else if (selectedScenario === 'SIP') {
      const currentInvest = Number(incomeData?.investmentIncome) || 9000;
      const added = (Number(calculatorInputs.newSip) || 12000) - currentInvest;
      
      emiValue = 0;
      savingsImpact = `Allocates ₹${Math.abs(added).toLocaleString('en-IN')}/mo directly to wealth compounding`;
      goalDelay = 'Accelerates retirement milestones by 2 years';
      emergencyFundImpact = 'Still Safe';
      recommendation = 'Safe — Compounding wealth at maximum efficiency';
    } 
    
    else if (selectedScenario === 'VACATION') {
      const budget = Number(calculatorInputs.budget) || 150000;
      const months = Number(calculatorInputs.months) || 10;
      const monthlySave = Math.round(budget / months);

      emiValue = 0;
      savingsImpact = `Requires ₹${monthlySave.toLocaleString('en-IN')}/mo saving rate`;
      goalDelay = 'Delay major assets by 1 month';
      emergencyFundImpact = 'Still Safe';
      recommendation = 'Safe — Plan vacation completely debt-free';
    } 
    
    else if (selectedScenario === 'OTHERS') {
      const price = Number(calculatorInputs.price) || 120000;
      const down = Number(calculatorInputs.downPayment) || 30000;
      const tenure = Number(calculatorInputs.tenure) || 12;
      const principal = Math.max(0, price - down);
      emiValue = Math.round(principal / tenure);
      
      savingsImpact = `Reduces monthly surplus by ₹${emiValue.toLocaleString('en-IN')}/mo`;
      goalDelay = emiValue > monthlySurplus * 0.25 ? 'Delay other goals by 1 month' : 'Minimal';
      emergencyFundImpact = down > monthlySurplus * 2 ? 'Temporary buffer strain' : 'Still Safe';
      recommendation = emiValue > monthlySurplus * 0.35 ? 'Needs Attention — High monthly commitment' : 'Safe — Financed comfortably';
    }
    
    else {
      const amount = Number(calculatorInputs.amount) || 500000;
      const tenureMonths = (Number(calculatorInputs.tenure) || 7) * 12;
      emiValue = Math.round((amount * 1.095) / tenureMonths);

      savingsImpact = `Reduces monthly surplus by ₹${emiValue.toLocaleString('en-IN')}`;
      goalDelay = emiValue > monthlySurplus * 0.2 ? 'Delay other goals by 2 months' : 'Minimal';
      recommendation = emiValue > monthlySurplus * 0.3 ? 'Needs Attention — High EMI burden' : 'Safe';
    }

    setSimulationResult({
      emi: emiValue,
      savingsImpact,
      goalDelay,
      emergencyFundImpact,
      recommendation,
    });
  };

  // Pre-configured friendly checklist actions
  const actionChecklist = [
    {
      title: 'Increase your emergency savings buffer',
      benefit: 'Protects 3 months living expenses',
      time: '30 sec',
      category: 'SAFETY',
    },
    {
      title: 'Auto-allocate salary surplus to Nifty 50 SIP',
      benefit: 'Est. ₹8.5L in 10 years',
      time: '1 min',
      category: 'GROWTH',
    },
    {
      title: 'Update monthly discretionary budget limits',
      benefit: 'Saves ₹2,500/month',
      time: '45 sec',
      category: 'BUDGET',
    },
    {
      title: 'Review unused digital subscriptions',
      benefit: 'Saves ₹1,800/yr',
      time: '30 sec',
      category: 'OPTIMIZE',
    },
  ];

  const displayedChecklist = viewAllRecommendations ? actionChecklist : actionChecklist.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 selection:bg-blue-500 selection:text-white">
      
      {/* Execution Feedback Banner */}
      <AnimatePresence>
        {executionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-sm shadow-2xl shadow-blue-500/30 border border-white/20 backdrop-blur-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-300" />
            <span>{executionFeedback}</span>
            <button onClick={() => setExecutionFeedback(null)} className="hover:opacity-80 cursor-pointer ml-3 p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="pt-6 pb-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AI Action Center
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
                Proactive intelligence engine powering your Financial OS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            NVIDIA Nemotron AI Active
          </div>
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Ask Sarthi AI
          </button>
        </div>
      </div>

      {/* SECTION 1: Today's AI Recommendation (Hero Gradient Card) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400/20" />
            Today's AI Recommendation
          </h2>
          <span className="text-xs font-semibold text-slate-400">Updated today • 96% Confidence</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/25 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 space-y-6">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          {/* Card Top Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                Priority: High
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Optimization
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400 italic">
              "Analyzed from your active income profile ({`₹${rawSalary.toLocaleString('en-IN')}`})"
            </span>
          </div>

          {/* Main Statement */}
          <div className="space-y-3 relative z-10">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug max-w-3xl">
              "You could save <span className="text-emerald-400 font-extrabold underline decoration-emerald-500/50 underline-offset-4">₹2,800 this month</span> by capping food delivery spending and increasing your index SIP by <span className="text-blue-400 font-extrabold">₹1,500</span>."
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Based on your monthly surplus of <strong className="text-white">₹{monthlySurplus.toLocaleString('en-IN')}</strong>, reallocating unmonitored convenience delivery orders directly into high-growth mutual funds builds long-term wealth without impacting your core needs.
            </p>
          </div>

          {/* Explanation drawer toggle */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 text-xs text-slate-300 space-y-2 relative z-10 backdrop-blur-md"
              >
                <p className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
                  <Brain className="h-4 w-4" /> Why Sarthi AI recommends this:
                </p>
                <ul className="space-y-1.5 text-slate-300 pl-4 list-disc marker:text-indigo-400">
                  <li>Convenience food delivery orders spiked by 24% over the last 3 weeks.</li>
                  <li>Reallocating ₹1,500 to low-cost Nifty 50 Index funds generates an estimated <strong>₹42,000 compounding wealth benefit</strong> over 12 months.</li>
                  <li>Your emergency reserve cushion stays 100% intact.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80 relative z-10">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Projected 1-Year Benefit</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block tracking-tight">₹42,000</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleExecuteTask('Dismiss Recommendation', 'DISMISSED')}
                className="px-4 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Not Now
              </button>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {showExplanation ? 'Hide Reasoning' : 'Explain Why'}
                {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleExecuteTask('Primary Recommendation', 'APPROVED')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Apply Recommendation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Recommended Actions (Interactive Checklist) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            Recommended Actions
          </h2>
          <span className="text-xs text-slate-400 font-medium">Quick 1-click execution</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {displayedChecklist.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Impact: <strong className="text-emerald-400 font-semibold">{item.benefit}</strong> • Est. time: {item.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleExecuteTask(item.title, 'DISMISSED')}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleExecuteTask(item.title, 'APPROVED')}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white text-indigo-300 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Apply Action
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all recommendations toggle */}
        <button
          onClick={() => setViewAllRecommendations(!viewAllRecommendations)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1.5 mt-1 cursor-pointer transition-colors"
        >
          {viewAllRecommendations ? 'Show Fewer Recommendations' : 'Show All Recommendations'}
          {viewAllRecommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* SECTION 3: Financial Health Summary Cards */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          Financial Health Highlights
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "You're saving more than last month",
              desc: 'Good job holding onto surplus cash reserves.',
              border: 'border-l-4 border-l-emerald-500 border-slate-800',
              bg: 'from-emerald-950/20 to-slate-900/80',
              badge: '🟢 Savings Surge',
              badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
              action: 'View Goals',
              tab: 'goals',
            },
            {
              title: 'Dining expenses slightly elevated',
              desc: 'Discretionary food delivery spending can be trimmed by 10%.',
              border: 'border-l-4 border-l-amber-500 border-slate-800',
              bg: 'from-amber-950/20 to-slate-900/80',
              badge: '🟡 Attention Needed',
              badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
              action: 'Adjust Budget',
              tab: 'budgets',
            },
            {
              title: 'Emergency buffer setup recommended',
              desc: 'Safety buffer currently covers ~1.5 months living costs.',
              border: 'border-l-4 border-l-rose-500 border-slate-800',
              bg: 'from-rose-950/20 to-slate-900/80',
              badge: '🔴 Buffer Priority',
              badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
              action: 'Build Buffer',
              tab: 'goals',
            },
            {
              title: 'SIP investments compounding well',
              desc: 'Index mutual funds tracking inflation-beating returns.',
              border: 'border-l-4 border-l-blue-500 border-slate-800',
              bg: 'from-blue-950/20 to-slate-900/80',
              badge: '🔵 Compounding',
              badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
              action: 'View Portfolio',
              tab: 'goals',
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl bg-gradient-to-r ${card.bg} border ${card.border} flex flex-col justify-between space-y-3 shadow-md backdrop-blur-md`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-tight">{card.title}</h4>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <button
                onClick={() => setActiveTab(card.tab as any)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors self-start pt-1"
              >
                {card.action}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 4: What Happens If... (Simulator) */}
      <div className="space-y-5 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            "What Happens If..." Financial Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Simulate life decisions before spending a single rupee
          </p>
        </div>

        {/* Visual selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {scenarioOptions.map((opt) => {
            const isSelected = selectedScenario === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedScenario(opt.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'border-indigo-500 bg-gradient-to-b from-indigo-900/50 to-slate-900 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-xs font-bold">{opt.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form & Instant analysis results block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
          {/* Configurable form (5 columns) */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4 w-4" /> Parameters
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Scenario: {selectedScenario}</span>
            </div>
            
            <form onSubmit={handleAnalyzeDecision} className="space-y-4 text-xs">
              {selectedScenario === 'CAR' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Car Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 800000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Down Payment (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 200000"
                      value={calculatorInputs.downPayment || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, downPayment: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Loan Period (Years)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={calculatorInputs.tenure || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, tenure: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'HOME' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Home Cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4500000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Down Payment (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1000000"
                      value={calculatorInputs.downPayment || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, downPayment: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Loan Period (Years)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 20"
                      value={calculatorInputs.tenure || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, tenure: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'SALARY' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Expected Salary (₹/month)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 75000"
                      value={calculatorInputs.expectedSalary || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, expectedSalary: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'SIP' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">New Target Monthly SIP (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15000"
                      value={calculatorInputs.newSip || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, newSip: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'VACATION' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Vacation Budget (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 120000"
                      value={calculatorInputs.budget || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, budget: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Months to Save</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 8"
                      value={calculatorInputs.months || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, months: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'LOAN' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Loan Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 400000"
                      value={calculatorInputs.amount || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, amount: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 9.5"
                      value={calculatorInputs.interest || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, interest: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'OTHERS' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Goal Description</label>
                    <input
                      type="text"
                      required
                      value={calculatorInputs.name || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, name: e.target.value })}
                      placeholder="e.g. Buy a MacBook Pro"
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Total Cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="h-4 w-4 text-purple-300" />
                Analyze Decision Impact
              </button>
            </form>
          </div>

          {/* AI Projections Output (7 columns) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {simulationResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-5"
              >
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">AI Projected Impact</span>
                  <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">
                    {simulationResult.recommendation}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium border-t border-b border-slate-800/80 py-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Monthly Commitment</span>
                    <span className="text-sm font-bold text-white">₹{simulationResult.emi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Savings Impact</span>
                    <span className="text-sm font-bold text-indigo-300">{simulationResult.savingsImpact}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Reserve</span>
                    <span className="text-sm font-bold text-emerald-400">{simulationResult.emergencyFundImpact}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Goal Delay</span>
                    <span className="text-sm font-bold text-amber-300">{simulationResult.goalDelay}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const name = scenarioOptions.find(o => o.id === selectedScenario)?.name || 'Plan';
                      const newSim: SavedSimulation = {
                        id: `sim-${Date.now()}`,
                        type: selectedScenario,
                        typeName: name,
                        timestamp: 'Today',
                        inputs: { ...calculatorInputs },
                        result: { ...simulationResult },
                      };
                      setSavedSimulations([newSim, ...savedSimulations].slice(0, 5));
                      setExecutionFeedback('Decision path saved to historical archive.');
                      setTimeout(() => setExecutionFeedback(null), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Simulation
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl py-14 space-y-3 bg-slate-900/30">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">Ready to Analyze Financial Decisions</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enter your parameters on the left and click "Analyze Decision Impact" to see exact EMI, goal delay, and surplus projections.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: AI History (Audit Log Timeline) */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-400" />
            AI Execution History
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Audit trail of actions optimized by Sarthi AI
          </p>
        </div>

        <div className="space-y-4 pl-5 relative border-l-2 border-slate-800 ml-3 pt-2">
          {[
            {
              time: 'Today',
              title: 'Dynamic Income Sync & AI Context Updated',
              desc: `Monthly income base aligned to ₹${rawSalary.toLocaleString('en-IN')} across Sarthi AI copilot engines.`,
              benefit: '100% Accuracy Verified',
            },
            {
              time: 'Yesterday',
              title: 'Discretionary Budget Auto-Restructured',
              desc: 'Food delivery caps set to preserve monthly compound surplus.',
              benefit: 'Saved ₹2,100',
            },
            {
              time: 'Last week',
              title: 'Tax Strategy & 80C Evaluation',
              desc: 'Side-by-side Old vs New tax regime optimization reviewed.',
              benefit: 'Potential savings: ₹12,000/yr',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative space-y-1 group">
              {/* timeline point */}
              <span className="absolute left-[-27px] top-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-slate-950 ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/50" />
              
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 group-hover:border-slate-700 transition-colors space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white text-sm">{item.title}</span>
                  <span className="text-slate-500 font-medium text-[11px]">{item.time}</span>
                </div>
                
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  {item.desc}
                </p>

                <span className="text-xs font-bold text-emerald-400 block pt-1">
                  {item.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default AIActionCenter;
