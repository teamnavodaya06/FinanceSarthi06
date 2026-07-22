import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, calculateSIP, calculateEMI, calculateFD } from '@financesarthi/utils';
import { Calculator, TrendingUp, Building, ShieldCheck, Scale, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const DecisionHub: React.FC = () => {
  const { user } = useFinancial();
  const [activeCalc, setActiveCalc] = useState<'SIP' | 'EMI' | 'FD' | 'LOAN_VS_INVEST'>('SIP');

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(15000);
  const [sipReturnRate, setSipReturnRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  const [sipStepUp, setSipStepUp] = useState(10);

  // EMI Calculator State
  const [loanPrincipal, setLoanPrincipal] = useState(1000000);
  const [loanRate, setLoanRate] = useState(9);
  const [loanYears, setLoanYears] = useState(15);

  // FD Calculator State
  const [fdPrincipal, setFdPrincipal] = useState(200000);
  const [fdRate, setFdRate] = useState(7.2);
  const [fdYears, setFdYears] = useState(3);

  const sipResult = calculateSIP(sipMonthly, sipReturnRate, sipYears, sipStepUp);
  const emiResult = calculateEMI(loanPrincipal, loanRate, loanYears);
  const fdResult = calculateFD(fdPrincipal, fdRate, fdYears);

  // Loan Prepayment vs Invest Calculation
  const loanInterestAnnualCost = (loanPrincipal * (loanRate / 100));
  const sipExpectedGainAnnual = (loanPrincipal * (sipReturnRate / 100));
  const netAdvantage = sipExpectedGainAnnual - loanInterestAnnualCost;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-400" />
            Decision Hub & Financial Calculators
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate SIP compound growth, Loan EMI schedules, Fixed Deposit returns, and Loan Prepayment vs Equity SIP strategies.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { id: 'SIP', label: 'SIP Calculator', icon: TrendingUp },
            { id: 'EMI', label: 'EMI Calculator', icon: Building },
            { id: 'FD', label: 'FD Return', icon: ShieldCheck },
            { id: 'LOAN_VS_INVEST', label: 'Loan vs Invest', icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCalc === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCalc(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SIP Calculator View */}
      {activeCalc === 'SIP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              SIP Parameters (With Annual Step-Up)
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Monthly Investment</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(sipMonthly)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Expected Annual Return Rate (%)</span>
                <span className="text-emerald-400 font-bold">{sipReturnRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={sipReturnRate}
                onChange={(e) => setSipReturnRate(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Time Horizon (Years)</span>
                <span className="text-emerald-400 font-bold">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Annual Step-Up (%)</span>
                <span className="text-emerald-400 font-bold">{sipStepUp}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={sipStepUp}
                onChange={(e) => setSipStepUp(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4">
                SIP Wealth Projection
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Invested Amount:</span>
                  <strong className="text-slate-200 text-sm">{formatCurrency(sipResult.totalInvested)}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Estimated Wealth Gain:</span>
                  <strong className="text-emerald-400 text-sm">{formatCurrency(sipResult.wealthGain)}</strong>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Expected Maturity Value:</span>
                  <strong className="text-2xl font-black text-emerald-400">{formatCurrency(sipResult.totalValue)}</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>By applying a 10% annual step-up, your final wealth corpus increases by over 45%!</span>
            </div>
          </div>
        </div>
      )}

      {/* EMI Calculator View */}
      {activeCalc === 'EMI' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-card space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Loan & EMI Parameters
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Loan Principal Amount (₹)</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(loanPrincipal)}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="10000000"
                step="50000"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Annual Interest Rate (%)</span>
                <span className="text-emerald-400 font-bold">{loanRate}%</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.25"
                value={loanRate}
                onChange={(e) => setLoanRate(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Tenure (Years)</span>
                <span className="text-emerald-400 font-bold">{loanYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-4">
                EMI Breakdown
              </h3>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Monthly EMI Payment:</span>
                  <strong className="text-2xl font-black text-emerald-400">{formatCurrency(emiResult.monthlyEmi)}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Interest Payable:</span>
                  <strong className="text-rose-400 text-sm">{formatCurrency(emiResult.totalInterest)}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Payment (Principal + Interest):</span>
                  <strong className="text-white text-sm">{formatCurrency(emiResult.totalPayment)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan vs Invest AI Strategy View */}
      {activeCalc === 'LOAN_VS_INVEST' && (
        <div className="p-6 rounded-3xl glass-card space-y-6 border border-emerald-500/30">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Loan Prepayment vs SIP Investment Analyzer</h3>
              <p className="text-xs text-slate-400">Should you use extra cash to pay off loan debt or invest in mutual funds?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Loan Cost Rate</span>
              <h4 className="text-xl font-bold text-rose-400">{loanRate}% per annum</h4>
              <p className="text-xs text-slate-400">Annual interest expense on remaining balance.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Expected Equity Return</span>
              <h4 className="text-xl font-bold text-emerald-400">{sipReturnRate}% per annum</h4>
              <p className="text-xs text-slate-400">Estimated long-term CAGR from Nifty 50 Index funds.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Sarthi Decision Verdict: {sipReturnRate > loanRate ? 'Invest Surplus in Equity SIPs' : 'Prepay High-Interest Debt'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Since your expected equity return ({sipReturnRate}%) is higher than your borrowing interest rate ({loanRate}%), investing your surplus generates a net positive spread of **+{(sipReturnRate - loanRate).toFixed(1)}% annually**.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
