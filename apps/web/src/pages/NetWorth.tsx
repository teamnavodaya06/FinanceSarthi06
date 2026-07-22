import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '@financesarthi/utils';
import { PieChart as PieIcon, Plus, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const historicalData = [
  { month: 'Jan 2026', assets: 720000, liabilities: 350000, netWorth: 370000 },
  { month: 'Mar 2026', assets: 780000, liabilities: 340000, netWorth: 440000 },
  { month: 'May 2026', assets: 840000, liabilities: 330000, netWorth: 510000 },
  { month: 'Jul 2026', assets: 900000, liabilities: 320000, netWorth: 580000 },
];

export const NetWorth: React.FC = () => {
  const { assets, liabilities, addAsset, addLiability } = useFinancial();

  const [assetName, setAssetName] = useState('');
  const [assetVal, setAssetVal] = useState('');
  const [assetCat, setAssetCat] = useState<'Bank' | 'Mutual Funds' | 'Stocks' | 'Real Estate' | 'Gold' | 'PF/NPS'>('Mutual Funds');
  const [showAddAsset, setShowAddAsset] = useState(false);

  const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.remaining, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetVal) return;
    addAsset({
      name: assetName,
      value: Number(assetVal),
      category: assetCat,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setAssetName('');
    setAssetVal('');
    setShowAddAsset(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <PieIcon className="h-6 w-6 text-emerald-400" />
            Net Worth & Portfolio Aggregator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated view of liquid assets, investments, real estate, and outstanding liabilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddAsset(!showAddAsset)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Asset Item</span>
        </button>
      </div>

      {/* Net Worth Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card border border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/30">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Net Worth</span>
          <h3 className="text-3xl font-black text-white">{formatCurrency(netWorth)}</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-2 block">+14.2% Growth in 2026</span>
        </div>

        <div className="p-6 rounded-3xl glass-card">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Asset Portfolio</span>
          <h3 className="text-3xl font-black text-emerald-400">{formatCurrency(totalAssets)}</h3>
          <span className="text-[11px] text-slate-400 mt-2 block">{assets.length} items logged</span>
        </div>

        <div className="p-6 rounded-3xl glass-card">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Liabilities & Debt</span>
          <h3 className="text-3xl font-black text-rose-400">{formatCurrency(totalLiabilities)}</h3>
          <span className="text-[11px] text-slate-400 mt-2 block">{liabilities.length} active loans</span>
        </div>
      </div>

      {/* Add Asset Form */}
      {showAddAsset && (
        <form onSubmit={handleAddAsset} className="p-6 rounded-3xl glass-card border border-emerald-500/30 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-white">Log Asset Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Asset Name</label>
              <input
                type="text"
                placeholder="e.g. Zerodha Portfolio"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Current Value (₹)</label>
              <input
                type="number"
                placeholder="e.g. 250000"
                value={assetVal}
                onChange={(e) => setAssetVal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
              <select
                value={assetCat}
                onChange={(e) => setAssetCat(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bank">Savings / Fixed Deposit</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Stocks">Direct Stocks</option>
                <option value="Gold">Gold / SGB</option>
                <option value="PF/NPS">EPF / VPF / NPS</option>
                <option value="Real Estate">Real Estate</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddAsset(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Save Asset
            </button>
          </div>
        </form>
      )}

      {/* Historical Growth Timeline Area Chart */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
          Historical Net Worth Progression (2026)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v: number) => formatCurrency(v, true)} />
              <Tooltip
                formatter={(v: any) => formatCurrency(Number(v))}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset & Liability Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>Assets Breakdown</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(totalAssets)}</span>
          </h3>

          <div className="space-y-2">
            {assets.map((ast) => (
              <div key={ast.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{ast.name}</h4>
                  <span className="text-[10px] text-slate-500">{ast.category}</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(ast.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities List */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>Liabilities Breakdown</span>
            <span className="text-rose-400 font-bold">{formatCurrency(totalLiabilities)}</span>
          </h3>

          <div className="space-y-2">
            {liabilities.map((lib) => (
              <div key={lib.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{lib.name}</h4>
                  <span className="text-[10px] text-slate-500">{lib.category} • {lib.interestRate}% Interest</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-400 block">{formatCurrency(lib.remaining)}</span>
                  <span className="text-[10px] text-slate-400">EMI: {formatCurrency(lib.monthlyEmi)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
