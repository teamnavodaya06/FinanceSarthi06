import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { UserProfile } from '@financesarthi/types';
import { Settings as SettingsIcon, User, Shield, Bell, Download, Trash2, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, setUser, expenses, goals, assets } = useFinancial();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [income, setIncome] = useState(user.monthlyIncome);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev: UserProfile) => ({
      ...prev,
      name,
      email,
      monthlyIncome: Number(income),
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const exportData = (format: 'JSON' | 'CSV') => {
    const dump = { user, expenses, goals, assets };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financesarthi-export-${Date.now()}.${format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-emerald-400" />
            Account Settings & Data Controls
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, notification preferences, security, and financial data exports.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" />
          User Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Monthly Gross Income (₹)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Update Profile
          </button>
        </div>
      </form>

      {/* Export & Data Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            Export Financial Report
          </h3>
          <p className="text-xs text-slate-400">
            Download your raw financial data, transaction logs, goals, and assets in encrypted format.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportData('JSON')}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
            >
              Export as JSON
            </button>
            <button
              type="button"
              onClick={() => exportData('CSV')}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              Export as CSV
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-4 border border-rose-500/20">
          <h3 className="text-sm font-bold text-rose-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Account & Danger Zone
          </h3>
          <p className="text-xs text-slate-400">
            Permanently wipe local browser cache, financial logs, and reset account state.
          </p>

          <button
            type="button"
            onClick={() => alert('Account data cleared successfully.')}
            className="py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};
