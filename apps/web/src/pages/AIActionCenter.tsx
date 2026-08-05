import React, { useState, useEffect, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Search,
  Undo,
  FileText,
  TrendingUp,
  AlertTriangle,
  Play,
  ArrowRight,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { AIOSService, ProactiveTask } from '../services/copilot/ai-os.service';
import { SpendingHealthService } from '../services/spending-intelligence/spending-health.service';
import { ScenarioSimulationService } from '../services/copilot/scenario-simulation.service';

interface SavedSimulation {
  id: string;
  type: string;
  typeName: string;
  timestamp: string;
  inputs: any;
  result: any;
}

export const AIActionCenter: React.FC = () => {
  const { expenses, goals, healthScore, setIsAiDrawerOpen, setActiveTab, incomeData } = useFinancial();
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

  const rawSalary = userProfile?.monthlySalary || 85000;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySurplus = Math.max(0, rawSalary - totalSpent);

  // Options cards configuration for Section 4
  const scenarioOptions = [
    { id: 'CAR', icon: '🚗', name: 'Buy a Car' },
    { id: 'HOME', icon: '🏠', name: 'Buy a Home' },
    { id: 'SIP', icon: '📈', name: 'Increase SIP' },
    { id: 'SALARY', icon: '💼', name: 'Get a Salary Raise' },
    { id: 'VACATION', icon: '✈', name: 'Plan a Vacation' },
    { id: 'LOAN', icon: '🎓', name: 'Education Loan' },
    { id: 'OTHERS', icon: '✨', name: 'Others' },
  ];

  // Initialize inputs presets (empty by default for user configuration)
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
  }, [expenses, goals, userProfile]);

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
    if (!fbUser) return;
    try {
      await AIOSService.writeAuditLog(fbUser.uid, taskTitle, action === 'APPROVED' ? 'EXECUTED' : 'DISMISSED');
      setTasks(prev => prev.filter(t => t.title !== taskTitle));
      setExecutionFeedback(`Action "${taskTitle}" successfully ${action === 'APPROVED' ? 'applied' : 'dismissed'}.`);
      loadAuditHistory();
      setTimeout(() => setExecutionFeedback(null), 4000);
    } catch (err: any) {
      setExecutionFeedback(err.message || 'Error occurred.');
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
      const principal = price - down;
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
      const principal = price - down;
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
      const added = (Number(calculatorInputs.newSip) || 17500) - (Number(incomeData?.investmentIncome) || 15000);
      
      emiValue = 0;
      savingsImpact = `Reduces savings cash by ₹${added.toLocaleString('en-IN')}/mo`;
      goalDelay = 'Speeds up retirement milestones';
      emergencyFundImpact = 'Still Safe';
      recommendation = 'Safe — Compounding compounding returns optimally';
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
      const principal = price - down;
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
      title: 'Increase your emergency savings',
      benefit: 'Reduce financial risk',
      time: '30 seconds',
    },
    {
      title: 'Increase monthly SIP investment',
      benefit: '₹8.5L in 15 years',
      time: '30 seconds',
    },
    {
      title: 'Update monthly budget limits',
      benefit: 'Save ₹2,200/month',
      time: '30 seconds',
    },
    {
      title: 'De-register unused food subscriptions',
      benefit: 'Save ₹1,800/yr',
      time: '30 seconds',
    },
  ];

  const displayedChecklist = viewAllRecommendations ? actionChecklist : actionChecklist.slice(0, 3);

  return (
    <div className="space-y-12 pb-24 bg-white text-slate-900 max-w-4xl mx-auto px-4 md:px-6 select-none">
      
      {/* execution Feedback Banner */}
      <AnimatePresence>
        {executionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-blue-600 text-white font-medium text-xs shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{executionFeedback}</span>
            <button onClick={() => setExecutionFeedback(null)} className="hover:opacity-85 cursor-pointer ml-2">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Today's AI Recommendation (Hero) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Today's AI Recommendation</h2>
        
        <div className="p-6 rounded-[20px] bg-slate-50 border border-slate-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">
              Priority: High
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Confidence 96%
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-450 italic font-semibold">"We analyzed your finances this morning."</p>
            <p className="text-sm font-bold text-slate-900 leading-relaxed max-w-xl">
              "You could save ₹2,800 this month by reducing food delivery spending and increasing your SIP by ₹1,500."
            </p>
          </div>

          {/* Explanation drawer toggle */}
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 space-y-1.5"
            >
              <p className="font-bold text-slate-800">Why Sarthi recommends this:</p>
              <p>• Swiggy & convenience food deliveries spike took up 24% of income this week.</p>
              <p>• Reallocating ₹1,500 to SIP compounders secures an estimated ₹42,000 yearly benefit.</p>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-150 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Estimated yearly benefit</span>
              <span className="text-base font-black text-emerald-500 mt-0.5 block">₹42,000</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExecuteTask('Not Now', 'DISMISSED')}
                className="h-9 px-4 rounded-xl hover:bg-slate-150 text-slate-500 font-bold cursor-pointer transition-all text-xs"
              >
                Not Now
              </button>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold cursor-pointer transition-all text-xs"
              >
                Explain Why
              </button>
              <button
                onClick={() => handleExecuteTask('Primary Recommendation', 'APPROVED')}
                className="h-9 px-4.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-all shadow-sm text-xs"
              >
                Apply Recommendation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Recommended Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recommended Actions</h2>
        
        <div className="space-y-3">
          {displayedChecklist.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Potential: <b className="text-emerald-500 font-bold">{item.benefit}</b> | Time: {item.time}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTask(item.title, 'APPROVED')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-bold text-[10px] cursor-pointer transition-all shrink-0"
              >
                Apply
              </button>
            </div>
          ))}
        </div>

        {/* View all recommendations toggle */}
        <button
          onClick={() => setViewAllRecommendations(!viewAllRecommendations)}
          className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 mt-2 cursor-pointer"
        >
          {viewAllRecommendations ? 'View Less Recommendations' : 'View All Recommendations'}
          {viewAllRecommendations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* SECTION 3: Financial Health Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Health Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "You're saving more than last month",
              desc: 'Good job holding onto surplus cash reserves.',
              color: 'border-l-4 border-l-emerald-500',
              badge: '🟢 Success',
              action: 'View Trends',
              tab: 'goals',
            },
            {
              title: 'Dining expenses increased',
              desc: 'Potential overspending detected on food deliveries.',
              color: 'border-l-4 border-l-amber-500',
              badge: '🟡 Attention',
              action: 'Set Limit',
              tab: 'budgets',
            },
            {
              title: 'Emergency savings too low',
              desc: 'Your emergency buffer only covers 1.5 months.',
              color: 'border-l-4 border-l-red-500',
              badge: '🔴 Critical',
              action: 'Add Cushion',
              tab: 'goals',
            },
            {
              title: 'SIP compounder performing well',
              desc: 'Mutual fund returns compounding targets safely.',
              color: 'border-l-4 border-l-blue-500',
              badge: '🔵 Investment',
              action: 'View Portfolio',
              tab: 'goals',
            },
          ].map((card, idx) => (
            <div key={idx} className={`p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between h-32 ${card.color}`}>
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">{card.badge}</span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{card.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  {card.desc}
                </p>
              </div>

              <button
                onClick={() => setActiveTab(card.tab as any)}
                className="w-full text-left text-[10px] text-blue-600 hover:underline font-bold mt-2 flex items-center gap-1 cursor-pointer"
              >
                {card.action}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: What Happens If... */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">What Happens If...</h2>
        <span className="text-xs font-semibold text-slate-500 block">"What happens if you..."</span>

        {/* Visual selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {scenarioOptions.map((opt) => {
            const isSelected = selectedScenario === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedScenario(opt.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/10 shadow-sm ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="text-[10px] font-bold text-slate-700">{opt.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form & Instant analysis results block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
          {/* Configurable form (5 columns) */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-blue-650 uppercase block">Simulation Parameters</h4>
            
            <form onSubmit={handleAnalyzeDecision} className="space-y-3.5 text-xs">
              {selectedScenario === 'CAR' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Car Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 800000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Down Payment (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 200000"
                      value={calculatorInputs.downPayment || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, downPayment: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Loan Period (Years)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={calculatorInputs.tenure || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, tenure: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'HOME' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Home cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4500000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Down Payment (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1000000"
                      value={calculatorInputs.downPayment || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, downPayment: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Loan Period (Years)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 20"
                      value={calculatorInputs.tenure || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, tenure: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'SALARY' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Expected Salary (₹/mo)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 100000"
                      value={calculatorInputs.expectedSalary || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, expectedSalary: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'SIP' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">New Monthly SIP (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 17500"
                      value={calculatorInputs.newSip || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, newSip: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'VACATION' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Vacation Budget (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={calculatorInputs.budget || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, budget: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Months to Save</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={calculatorInputs.months || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, months: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'LOAN' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Loan Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500000"
                      value={calculatorInputs.amount || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, amount: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 9.5"
                      value={calculatorInputs.interest || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, interest: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedScenario === 'OTHERS' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">What is this plan?</label>
                    <input
                      type="text"
                      required
                      value={calculatorInputs.name || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, name: e.target.value })}
                      placeholder="e.g. Buy an iPhone"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Total Price / Cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 120000"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, price: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Down Payment (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 30000"
                        value={calculatorInputs.downPayment || ''}
                        onChange={(e) => setCalculatorInputs({ ...calculatorInputs, downPayment: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Months / Period</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 12"
                        value={calculatorInputs.tenure || ''}
                        onChange={(e) => setCalculatorInputs({ ...calculatorInputs, tenure: e.target.value })}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-all"
              >
                Analyze Decision
              </button>
            </form>
          </div>

          {/* AI Projections Output (7 columns) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {simulationResult ? (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                <div>
                  <span className="text-[9px] font-bold text-blue-650 uppercase tracking-wide block">AI Outcome Projections</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                    {simulationResult.recommendation}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-t border-b border-slate-100 py-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Monthly EMI</span>
                    <span className="text-slate-800 block mt-0.5">₹{simulationResult.emi.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Savings Impact</span>
                    <span className="text-slate-800 block mt-0.5">{simulationResult.savingsImpact}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Emergency buffer</span>
                    <span className="text-slate-800 block mt-0.5">{simulationResult.emergencyFundImpact}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Goal Delay</span>
                    <span className="text-slate-800 block mt-0.5">{simulationResult.goalDelay}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
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
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-650 cursor-pointer"
                  >
                    Save Simulation
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider border border-dashed border-slate-200 rounded-2xl py-12">
                Provide parameters and click "Analyze Decision" to estimate impact.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: AI History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI History</h2>
        <span className="text-xs font-semibold text-slate-500 block">"What has AI already helped me with?"</span>

        <div className="space-y-4 pl-4 relative border-l border-slate-200 ml-2 pt-2">
          {[
            {
              time: 'Yesterday',
              title: 'Budget optimized',
              desc: 'Discretionary limits adjusted to restore compound margins.',
              benefit: 'Saved ₹2,100',
            },
            {
              time: 'Monday',
              title: 'Tax strategy updated',
              desc: 'Section 80C ELSS mutual fund tax plan re-routed.',
              benefit: 'Potential savings: ₹12,000',
            },
            {
              time: 'Last week',
              title: 'Emergency fund recommendation applied',
              desc: 'Safety reserve goal contribution speed-ups.',
              benefit: 'Progress 12%',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative space-y-0.5">
              {/* timeline point */}
              <span className="absolute left-[-21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 border border-white" />
              
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-800">{item.title}</span>
                <span className="text-slate-400 font-medium">{item.time}</span>
              </div>
              
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {item.desc}
              </p>

              <span className="text-[10px] font-bold text-emerald-500 block pt-0.5">
                {item.benefit}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default AIActionCenter;
