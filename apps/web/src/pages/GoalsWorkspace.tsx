import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useTranslation } from '../utils/i18n';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';

export const GoalsWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const { goals, createGoal, deleteGoal, addContribution } = useGoals();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('EMERGENCY_FUND');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyAllocation, setMonthlyAllocation] = useState('');

  // Add Money Modal State
  const [addMoneyGoalId, setAddMoneyGoalId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalMonthlyContribution = goals.reduce((acc, g) => acc + (g.monthlyAllocation || 0), 0);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !monthlyAllocation) return;

    const target = Number(targetAmount);
    const monthly = Number(monthlyAllocation);
    const monthsNeeded = Math.ceil(target / monthly);
    const estDate = new Date();
    estDate.setMonth(estDate.getMonth() + monthsNeeded);

    await createGoal({
      goalName: title,
      title,
      goalType: category,
      category,
      targetAmount: target,
      currentAmount: 0,
      monthlyAllocation: monthly,
      monthlyContribution: monthly,
      targetDate: estDate.toISOString().split('T')[0],
      priority: 'High',
      status: 'On Track',
      isCompleted: false,
    } as any);

    setTitle('');
    setTargetAmount('');
    setMonthlyAllocation('');
    setIsModalOpen(false);
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMoneyGoalId || !addAmount) return;
    await addContribution(addMoneyGoalId, Number(addAmount));
    setAddMoneyGoalId(null);
    setAddAmount('');
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* HEADER */}
      <div className="pt-6 pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Goals Workspace
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Create and track your financial target milestones easily
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* TOP SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Saved</span>
          <div className="text-2xl font-black text-emerald-400">
            ₹{totalSaved.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Investment</span>
          <div className="text-2xl font-black text-sky-400">
            ₹{totalMonthlyContribution.toLocaleString('en-IN')}/mo
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Goals</span>
          <div className="text-2xl font-black text-purple-400">
            {goals.length}
          </div>
        </div>
      </div>

      {/* GOAL CARDS GRID */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-blue-400" />
          <span>Your Active Milestones</span>
        </h2>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
              return (
                <div key={g.id || g.goalId} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-white leading-tight">{g.title}</h3>
                      <button
                        onClick={() => deleteGoal(g.id || g.goalId)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-400 font-medium">Saved: <b className="text-white">₹{(g.currentAmount || 0).toLocaleString('en-IN')}</b></span>
                      <span className="text-slate-400 font-medium">Target: <b className="text-slate-200">₹{(g.targetAmount || 0).toLocaleString('en-IN')}</b></span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-emerald-400 font-bold">{pct}% Completed</span>
                      <span className="text-slate-400">Monthly SIP: ₹{(g.monthlyAllocation || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAddMoneyGoalId(g.id || g.goalId);
                      setAddAmount('');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Savings to Goal</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/40">
            <Target className="h-8 w-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No active goals set yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start building your emergency fund or vehicle savings by clicking "Create New Goal".
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Create Goal Now
            </button>
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Financial Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Goal Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electric Scooter, Emergency Fund"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="EMERGENCY_FUND">🛡️ Emergency Safety Buffer</option>
                  <option value="VEHICLE">🚗 Vehicle Purchase</option>
                  <option value="HOUSE">🏠 House / Property Fund</option>
                  <option value="VACATION">✈️ Vacation & Leisure</option>
                  <option value="OTHER">✨ Custom Wealth Goal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 200000"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Monthly Savings (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyAllocation}
                    onChange={(e) => setMonthlyAllocation(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
              >
                Save & Start Tracking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MONEY MODAL */}
      {addMoneyGoalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Money to Goal</h3>
              <button onClick={() => setAddMoneyGoalId(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Amount to Add (₹)</label>
                <input
                  type="number"
                  required
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Add Savings
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default GoalsWorkspace;
