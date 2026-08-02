import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Activity,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Briefcase,
  Play,
  RotateCw,
  Plus,
  HelpCircle,
  Download,
  Info,
  Calendar,
  Shield,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importing services
import { AIOSService, ProactiveTask } from '../services/copilot/ai-os.service';
import { SpendingHealthService } from '../services/spending-intelligence/spending-health.service';
import { ScenarioSimulationService } from '../services/copilot/scenario-simulation.service';

export const AIActionCenter: React.FC = () => {
  const { expenses, goals, healthScore } = useFinancial();
  const { userProfile, user: fbUser } = useAuth();

  // Tasks State
  const [tasks, setTasks] = useState<ProactiveTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Simulation Form States
  const [simType, setSimType] = useState<'SALARY_INCREASE' | 'BIG_PURCHASE' | 'SIP_INCREASE'>('BIG_PURCHASE');
  const [simValue, setSimValue] = useState('');
  const [simResult, setSimResult] = useState<any>(null);

  const rawSalary = userProfile?.monthlySalary || 85000;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Health Score calculations
  const healthResult = SpendingHealthService.calculateHealth(expenses, rawSalary);

  // Load Proactive tasks and Audit history
  useEffect(() => {
    const listTasks = AIOSService.generateProactiveTasks(expenses, rawSalary, goals);
    setTasks(listTasks);
    loadAuditHistory();
  }, [expenses, goals, userProfile]);

  const loadAuditHistory = async () => {
    if (!fbUser) return;
    try {
      const q = query(
        collection(db, 'users', fbUser.uid, 'aiActionAuditLogs'),
        orderBy('timestamp', 'desc'),
        limit(15)
      );
      const snap = await getDocs(q);
      const history: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          dateFormatted: new Date(data.timestamp).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      });
      setAuditLogs(history);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  };

  // Action Executors
  const handleExecuteTask = async (task: ProactiveTask, action: 'APPROVED' | 'DISMISSED' | 'REJECTED') => {
    if (!fbUser) return;
    await AIOSService.writeAuditLog(fbUser.uid, task.title, action === 'APPROVED' ? 'EXECUTED' : action);
    setTasks(prev => prev.filter(t => t.id !== task.id));
    alert(`Success: Recommendation "${task.title}" has been ${action.toLowerCase()}.`);
    loadAuditHistory();
  };

  // Run Simulator
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(simValue);
    if (!val || val <= 0) return;

    const res = ScenarioSimulationService.simulate(
      simType as any,
      val,
      rawSalary,
      totalSpent
    );
    setSimResult(res);
  };

  return (
    <div className="space-y-8 pb-20 select-none text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 dark:border-slate-850 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Autonomous Financial OS</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Action Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Monitor allocations, simulate custom scenarios, and approve proactive personal CFO plans.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Daily Cycle: Active</span>
        </div>
      </div>

      {/* TOP PROACTIVE PLOT BANNER */}
      <div className="p-6 rounded-[28px] bg-[#0A1128] border border-blue-500/15 shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Today's Proactive Insight</span>
          </div>
          <h3 className="text-lg font-black leading-tight">
            "Your compound growth trajectory is highly healthy."
          </h3>
          <p className="text-xs text-slate-350 leading-relaxed font-semibold max-w-2xl">
            Sarthi has analyzed your active cash balances. You saved ₹2,300 more than your weekly average, putting you on track to surpass your goal milestone target by next month.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-center min-w-[140px] shrink-0">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Health score</span>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">{healthResult.score}</h2>
          <span className="text-[8px] text-slate-450 uppercase font-black tracking-wider block mt-1">{healthResult.grade}</span>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE RECOMMENDATION ACTIONS (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                Active Optimization Tasks
              </h3>
              <span className="text-[10px] font-bold text-slate-400">{tasks.length} actions pending</span>
            </div>

            {tasks.length === 0 ? (
              <div className="p-10 text-center rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-400 space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">All financial allocations optimized!</p>
                  <p className="text-[10px] text-slate-400">Sarthi is continuously monitoring your profile cash flows.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 block">
                            {task.category} PLAN
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {task.title}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          task.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">{task.description}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                          Why this matters: <span className="font-bold text-slate-650 dark:text-slate-350">{task.whyItMatters}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                        <div className="text-[10px] font-bold text-slate-450 dark:text-slate-400">
                          Estimated savings impact: <span className="text-emerald-500 uppercase">{task.impact}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExecuteTask(task, 'DISMISSED')}
                            className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleExecuteTask(task, 'APPROVED')}
                            className="h-9 px-4.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold shadow-md cursor-pointer"
                          >
                            Apply Recommendation
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCENARIO INTERACTIVE SIMULATOR (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* INTERACTIVE SIMULATOR CARD */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Scenario Simulator
            </h3>

            <form onSubmit={handleSimulate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Simulation Type</label>
                <select
                  value={simType}
                  onChange={(e) => {
                    setSimType(e.target.value as any);
                    setSimResult(null);
                  }}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="BIG_PURCHASE">Evaluate Large Purchase</option>
                  <option value="SALARY_INCREASE">Project Salary Growth</option>
                  <option value="SIP_INCREASE">Estimate SIP Compounding</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">
                  {simType === 'BIG_PURCHASE' ? 'Item Cost (₹)' : simType === 'SALARY_INCREASE' ? 'Target Salary (₹/mo)' : 'Added Monthly SIP (₹)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder={simType === 'BIG_PURCHASE' ? 'e.g. 50000' : 'e.g. 10000'}
                  value={simValue}
                  onChange={(e) => setSimValue(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer transition-all shadow-md"
              >
                Project Outcome
              </button>
            </form>

            {/* Sim Result Panel */}
            {simResult && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-3 mt-4 text-[11px] leading-relaxed">
                <h5 className="font-black text-slate-900 dark:text-white uppercase text-[9px] tracking-wide text-blue-600 dark:text-sky-400">{simResult.headline}</h5>
                <p className="font-semibold text-slate-650 dark:text-slate-350">{simResult.explanation}</p>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 font-bold text-[10px] text-slate-500 leading-normal">
                  <span className="text-emerald-500 block mb-0.5">Projected Outcome:</span>
                  {simResult.expectedOutcome}
                </div>
              </div>
            )}
          </div>

          {/* AUDIT LOG HISTORY CARD */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              AI OS Execution Logs
            </h3>

            {auditLogs.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold italic text-center py-4">No logged actions recorded.</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-start text-[10px] leading-normal border-b border-slate-50 dark:border-slate-850 pb-2">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{log.taskTitle}</span>
                      <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{log.dateFormatted}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      log.status === 'EXECUTED' ? 'bg-emerald-550/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
export default AIActionCenter;
