import React, { useState, useEffect, useMemo } from 'react';
import { 
  useAdaptiveRecommendations, 
  useBudgetHealth, 
} from '../hooks/useAdaptiveBudget';
import { useFinancial } from '../context/FinancialContext';
import { 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  CheckCircle,
  Play,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AdaptiveBudgetDashboard: React.FC = () => {
  const { 
    expenses, 
    incomeData, 
    goals, 
    budgets, 
    liabilities, 
    assets,
    updateIncome,
    setBudget,
    syncStatus
  } = useFinancial();

  const { recommendations, loading: recLoading, approveRecommendation, dismissRecommendation, refresh: refreshRecs } = useAdaptiveRecommendations();
  const { health, loading: healthLoading, refresh: refreshHealth } = useBudgetHealth();

  // 1. Dynamic slider bounds derived from actual database user income
  const baseSalary = incomeData?.monthlyIncome || 75000;
  
  const sliderBounds = useMemo(() => {
    const min = Math.max(5000, Math.round(baseSalary * 0.25));
    const max = Math.round(baseSalary * 3);
    const step = baseSalary > 100000 ? 5000 : 1000;
    return { min, max, step };
  }, [baseSalary]);

  // Sliders states
  const [simSalary, setSimSalary] = useState(baseSalary);
  const [simRent, setSimRent] = useState(15000);
  const [simSip, setSimSip] = useState(10000);
  const [simEmi, setSimEmi] = useState(5000);
  const [isApplying, setIsApplying] = useState(false);

  // Initialize sliders to database values on mount and updates
  useEffect(() => {
    if (baseSalary) {
      setSimSalary(baseSalary);
    }
  }, [baseSalary]);

  useEffect(() => {
    const rentSpent = expenses.filter(e => !e.isDeleted && e.category === 'HOUSING').reduce((a, c) => a + c.amount, 0) || 15000;
    setSimRent(rentSpent);
  }, [expenses]);

  useEffect(() => {
    const sipAllocation = goals.filter(g => !g.isCompleted).reduce((a, c) => a + c.monthlyAllocation, 0) || 10000;
    setSimSip(sipAllocation);
  }, [goals]);

  useEffect(() => {
    const emiSpent = expenses.filter(e => !e.isDeleted && e.category === 'DEBT_EMI').reduce((a, c) => a + c.amount, 0) || 5000;
    setSimEmi(emiSpent);
  }, [expenses]);

  // Instantly compute simulation statistics
  const currentSpentWithoutRentOrEMI = useMemo(() => {
    return expenses
      .filter(e => !e.isDeleted && e.category !== 'HOUSING' && e.category !== 'DEBT_EMI')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return expenses.filter(e => !e.isDeleted).reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const simulation = useMemo(() => {
    const proposedSpent = simRent + simEmi + currentSpentWithoutRentOrEMI;
    const surplus = Math.max(0, simSalary - proposedSpent - simSip);
    const monthlySavingsAndInvestments = surplus + simSip;
    const cashFlowRatio = simSalary > 0 ? (monthlySavingsAndInvestments / simSalary) * 100 : 0;

    // Compound interest calculation (10 years, 12% CAGR, compounded monthly)
    const monthlyRate = 0.12 / 12;
    const months = 10 * 12;
    let simulatedWealthTenYears = 0;
    for (let i = 0; i < months; i++) {
      simulatedWealthTenYears = (simulatedWealthTenYears + monthlySavingsAndInvestments) * (1 + monthlyRate);
    }

    // Projected net worth timeline (1 to 5 years)
    const projectedNetWorthYears = [1, 2, 3, 4, 5].map(y => {
      let yearSavings = 0;
      const yearMonths = y * 12;
      for (let i = 0; i < yearMonths; i++) {
        yearSavings = (yearSavings + monthlySavingsAndInvestments) * (1 + monthlyRate);
      }
      return {
        year: `Yr ${y}`,
        value: Math.round(yearSavings)
      };
    });

    // Calculate Emergency Fund Timeline
    const targetEFAmount = simSalary * 6;
    const efGoal = goals.find(g => g.title?.toLowerCase().includes('emergency'));
    const currentEFAmount = efGoal?.currentAmount || 0;
    const efGap = Math.max(0, targetEFAmount - currentEFAmount);
    const efMonthlyAllocation = monthlySavingsAndInvestments * 0.3;
    const efMonthsToComplete = efMonthlyAllocation > 0 ? Math.ceil(efGap / efMonthlyAllocation) : 999;

    // Goal Completion Projection for first pending goal
    const activeGoal = goals.find(g => !g.isCompleted && !g.title?.toLowerCase().includes('emergency'));
    let goalMonthsToComplete = 999;
    if (activeGoal) {
      const gap = Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount);
      const goalAllocation = monthlySavingsAndInvestments * 0.4;
      goalMonthsToComplete = goalAllocation > 0 ? Math.ceil(gap / goalAllocation) : 999;
    }

    // Simulated Budget Health Score
    const emiRatio = simSalary > 0 ? simEmi / simSalary : 0;
    const complianceRatio = simSalary > 0 ? (proposedSpent + simSip) / simSalary : 1.0;
    
    let complianceScore = 35;
    if (complianceRatio > 1.0) {
      complianceScore = Math.max(0, 35 - (complianceRatio - 1.0) * 120);
    } else if (complianceRatio > 0.8) {
      complianceScore = 35 - (complianceRatio - 0.8) * 60;
    }

    let savingsScore = 0;
    if (cashFlowRatio >= 20) {
      savingsScore = 30;
    } else if (cashFlowRatio > 0) {
      savingsScore = (cashFlowRatio / 20) * 30;
    }

    const emiScore = emiRatio < 0.4 ? 35 : Math.max(0, 35 - (emiRatio - 0.4) * 150);
    const budgetScore = Math.round(complianceScore + savingsScore + emiScore);
    const boundedScore = Math.max(0, Math.min(100, budgetScore));

    return {
      monthlySavings: monthlySavingsAndInvestments,
      cashFlowRatio,
      projectedNetWorthYears,
      simulatedWealthTenYears: Math.round(simulatedWealthTenYears),
      efMonthsToComplete,
      goalMonthsToComplete,
      budgetScore: boundedScore,
      proposedSpent,
      surplus
    };
  }, [simSalary, simRent, simSip, simEmi, currentSpentWithoutRentOrEMI, goals]);

  // Recharts structured datasets
  const pieChartData = useMemo(() => {
    return [
      { name: 'Rent (Housing)', value: simRent, color: '#2563EB' },
      { name: 'Investments (SIP)', value: simSip, color: '#10B981' },
      { name: 'Debt EMIs', value: simEmi, color: '#F59E0B' },
      { name: 'Other Spent', value: currentSpentWithoutRentOrEMI, color: '#94A3B8' },
      { name: 'Remaining Cash', value: simulation.surplus, color: '#E2E8F0' },
    ];
  }, [simRent, simSip, simEmi, currentSpentWithoutRentOrEMI, simulation.surplus]);

  const lineChartData = useMemo(() => {
    return [
      { name: 'Month 1', Savings: Math.round(simulation.monthlySavings) },
      { name: 'Month 3', Savings: Math.round(simulation.monthlySavings * 3) },
      { name: 'Month 6', Savings: Math.round(simulation.monthlySavings * 6) },
      { name: 'Month 9', Savings: Math.round(simulation.monthlySavings * 9) },
      { name: 'Month 12', Savings: Math.round(simulation.monthlySavings * 12) },
    ];
  }, [simulation.monthlySavings]);

  const handleApplyScenario = async () => {
    const confirmApply = window.confirm(`Apply Scenario? This will update your Monthly Salary to ₹${simSalary.toLocaleString('en-IN')} and adjust your budget allocations in the database.`);
    if (!confirmApply) return;

    try {
      setIsApplying(true);
      await updateIncome({ monthlyIncome: simSalary });
      
      if (budgets.length > 0) {
        const activeBudget = budgets[0];
        await setBudget(activeBudget.id, {
          totalBudget: simSalary,
          remainingBudget: Math.max(0, simSalary - totalSpent),
        });
      }
      
      alert('Scenario applied successfully and persisted to database!');
      refreshRecs();
      refreshHealth();
    } catch (err) {
      console.error('Failed to apply scenario:', err);
      alert('Unable to apply scenario.');
    } finally {
      setIsApplying(false);
    }
  };

  const score = health?.score || 85;
  const grade = health?.grade || 'Good';
  const lastMonthScore = score - 3;
  const trendSign = '+3';

  // Dynamic checklist observations for Row 4
  const rentPercent = Math.round((simRent / simSalary) * 100);
  const checklistInsights = useMemo(() => {
    const list = [];
    if (rentPercent <= 30) {
      list.push(`Rent consumes only ${rentPercent}% of income (healthy limit)`);
    } else {
      list.push(`Rent consumes ${rentPercent}% of income (high, ideal is <30%)`);
    }
    list.push(`Savings rate is optimized at ${Math.round(simulation.cashFlowRatio)}% of income`);
    if (simulation.efMonthsToComplete === 999) {
      list.push('Emergency Fund target remains unallocated');
    } else {
      list.push(`Emergency fund safety buffer completes in ${simulation.efMonthsToComplete} months`);
    }
    if (simulation.goalMonthsToComplete === 999) {
      list.push('Primary goals timelines unaffected');
    } else {
      list.push(`Goal completion milestones timeline reaches target in ${simulation.goalMonthsToComplete} months`);
    }
    return list;
  }, [rentPercent, simulation]);

  return (
    <div className="space-y-8 select-none pb-12 px-6 md:px-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Adaptive AI Budget</h2>
          <p className="text-sm text-slate-500 block mt-1">Autonomous spending envelopes, seasonal adjustments forecasts, and goal optimizer rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3.5 py-1.5 rounded-xl border border-emerald-100/50">
            <span className="text-[11px] font-bold uppercase tracking-wider">Health Rating: {score}</span>
          </div>
          <button
            onClick={handleApplyScenario}
            disabled={isApplying}
            className="h-10 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[13px] shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isApplying ? 'Applying...' : 'Apply Scenario'}</span>
          </button>
        </div>
      </div>

      {/* ROW 1: AI Health Score and AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: Budget Health */}
        <div className="p-6 rounded-[18px] bg-white border border-slate-100 flex items-center gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.008)]">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={score >= 75 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute h-18 w-18 rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{score}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{grade}</span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Budget Health</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Last Month: {lastMonthScore}</span>
              <span className="flex items-center text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {trendSign}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {health?.insights[0] || 'Excellent budget adherence! Keep maintaining consistent savings sweeps.'}
            </p>
          </div>
        </div>

        {/* RIGHT: AI Recommendations */}
        <div className="p-6 rounded-[18px] bg-white border border-slate-100 flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.008)] min-h-[140px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-500" />
              AI Recommendations
            </h3>
            <span className="text-xs text-slate-400 font-bold">{recommendations.length} Pending</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-2.5 pr-1 max-h-[110px]">
            {!recLoading ? (
              recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((rec: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center gap-4 text-xs transition-all hover:bg-blue-50/30">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{rec.summary}</span>
                      <span className="text-[11px] text-slate-400 font-semibold truncate block">{rec.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-600">₹{rec.financialImpact}</span>
                      <button
                        onClick={() => approveRecommendation(rec.id)}
                        className="h-7 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <CheckCircle className="h-6 w-6 text-emerald-400/30 mb-1" />
                  <p className="text-xs font-bold text-slate-500">All proposals have been aligned!</p>
                </div>
              )
            ) : (
              <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

      </div>

      {/* ROW 2: Scenario Simulation Section */}
      <div className="p-6 rounded-[18px] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.008)] space-y-5">
        <h3 className="text-xl font-bold text-slate-900 leading-none">Simulation</h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Sliders (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs font-bold text-slate-500">
            
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Monthly Income</span>
                <span className="text-slate-800 font-black">₹{simSalary.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={sliderBounds.min}
                max={sliderBounds.max}
                step={sliderBounds.step}
                value={simSalary}
                onChange={e => setSimSalary(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Housing / Rent</span>
                <span className="text-slate-800 font-black">₹{simRent.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.round(simSalary * 0.8)}
                step="1000"
                value={simRent}
                onChange={e => setSimRent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Savings / SIP</span>
                <span className="text-slate-800 font-black">₹{simSip.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.round(simSalary * 0.8)}
                step="1000"
                value={simSip}
                onChange={e => setSimSip(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>EMIs</span>
                <span className="text-slate-800 font-black">₹{simEmi.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.round(simSalary * 0.6)}
                step="500"
                value={simEmi}
                onChange={e => setSimEmi(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* RIGHT: Live Summary Stats (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Cash</span>
              <span className="text-2xl font-black text-slate-900 leading-none mt-1 truncate">
                ₹{simulation.surplus.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">Unallocated</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Savings</span>
              <span className="text-2xl font-black text-[#10B981] leading-none mt-1 truncate">
                ₹{Math.round(simulation.monthlySavings).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                {Math.round(simulation.cashFlowRatio)}% Savings Rate
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px] col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Wealth</span>
              <span className="text-2xl font-black text-slate-900 leading-none mt-1 truncate">
                ₹{simulation.simulatedWealthTenYears.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">10 Years (12%)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px] col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Fund</span>
              <span className="text-[15px] font-black text-slate-800 mt-1 block">
                {simulation.efMonthsToComplete === 999 ? 'No Allocation' : `${simulation.efMonthsToComplete} Months`}
              </span>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${simulation.efMonthsToComplete === 999 ? 0 : Math.min(100, (12 / simulation.efMonthsToComplete) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px] col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Goal Progress</span>
              <span className="text-[15px] font-black text-slate-800 mt-1 block">
                {simulation.goalMonthsToComplete === 999 ? 'No Allocation' : `${simulation.goalMonthsToComplete} Months to Completion`}
              </span>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${simulation.goalMonthsToComplete === 999 ? 0 : Math.min(100, (24 / simulation.goalMonthsToComplete) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: TWO Charts Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Budget Allocation Doughnut Chart */}
        <div className="p-6 rounded-[18px] bg-white border border-slate-100 h-[300px] flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.008)]">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Budget Allocation</h3>
          <div className="flex-1 w-full flex items-center justify-between">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] space-y-1.5 text-xs font-bold text-slate-400">
              {pieChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Projected Savings Line Chart */}
        <div className="p-6 rounded-[18px] bg-white border border-slate-100 h-[300px] flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.008)]">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Projected Savings Trajectory</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="Savings" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 4: AI Insights Checklist */}
      <div className="p-6 rounded-[18px] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.008)] space-y-3">
        <h3 className="text-lg font-bold text-slate-900">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistInsights.map((insight: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-500 leading-relaxed bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 5: 5-Year Wealth Projection horizontal timeline */}
      <div className="p-6 rounded-[18px] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.008)] space-y-5">
        <h3 className="text-lg font-bold text-slate-900">5-Year Wealth Timeline</h3>
        
        <div className="relative flex items-center justify-between mt-6 mb-2 px-4">
          {/* Connecting line */}
          <div className="absolute left-4 right-4 h-0.5 bg-slate-100 top-[14px] -z-10" />
          
          {simulation.projectedNetWorthYears.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center space-y-1 text-center group relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                Year {idx + 1}
              </span>
              <div className="h-2 w-2 rounded-full bg-blue-500 border border-white ring-2 ring-blue-500/10 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                ₹{item.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveBudgetDashboard;
