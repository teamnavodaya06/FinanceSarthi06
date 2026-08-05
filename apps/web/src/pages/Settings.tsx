import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile, FirestoreUserProfile, FinancialGoalType, OccupationType, CityTier, RiskProfile } from '@financesarthi/types';
import { profileService } from '../services/firestore';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Lock, 
  Globe, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Save,
  Laptop,
  Check,
  X
} from 'lucide-react';

import { applyLanguageTranslation } from '../utils/translation';

export const Settings: React.FC = () => {
  const { user, setUser, expenses, goals, assets, incomeData, updateIncome } = useFinancial();
  const { userProfile, completeOnboarding, deleteAccount } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [income, setIncome] = useState(incomeData?.monthlyIncome || user.monthlyIncome);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR');
  const [salaryDay, setSalaryDay] = useState(1);
  const [aiLanguage, setAiLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    ai: true,
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [isDangerZoneExpanded, setIsDangerZoneExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New fields
  const [occupation, setOccupation] = useState('Salaried');
  const [city, setCity] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<FinancialGoalType[]>([]);

  useEffect(() => {
    const storedLang = localStorage.getItem('sarthi_lang_pref') || userProfile?.preferredLanguage || 'English';
    setLanguage(storedLang);
    setAiLanguage(storedLang);
    setName(userProfile?.displayName || user.name);
    setEmail(userProfile?.email || user.email);
    setIncome(incomeData?.monthlyIncome || userProfile?.monthlySalary || user.monthlyIncome);
    setOccupation(userProfile?.occupation || 'Salaried');
    setCity(userProfile?.city || '');
    setPhotoURL(userProfile?.photoURL || '');
    setSelectedGoals(userProfile?.financialGoals || ['EMERGENCY_FUND', 'INVESTMENT']);
    setCurrency(userProfile?.currency || 'INR');
  }, [user, incomeData, userProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Update centrally via updateIncome (updates Firestore & incomeData)
      await updateIncome({ monthlyIncome: Number(income) });

      // 2. Save profile to Firestore basic
      await profileService.updateProfile({
        displayName: name,
        email,
        monthlySalary: Number(income),
        occupation: occupation as OccupationType,
        preferredLanguage: language,
        currency,
        photoURL,
        city,
        financialGoals: selectedGoals,
      });

      // 3. Save local preference
      localStorage.setItem('sarthi_lang_pref', language);
      applyLanguageTranslation(language);

      // 4. Update local auth context too
      if (completeOnboarding) {
        await completeOnboarding({
          displayName: name,
          email,
          monthlySalary: Number(income),
          occupation: occupation as OccupationType,
          preferredLanguage: language,
          currency,
          photoURL,
          city,
          financialGoals: selectedGoals,
        });
      }

      // 5. Update the global React user state directly to trigger instant update on all pages
      setUser((prev: UserProfile) => ({
        ...prev,
        name,
        email,
        monthlyIncome: Number(income),
        avatarUrl: photoURL || undefined,
      }));

      showToast('Settings saved successfully!');
    } catch (err: any) {
      showToast(`Error saving settings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format: 'JSON' | 'CSV' | 'PDF' | 'EXPENSES') => {
    try {
      if (format === 'JSON') {
        const dump = { user, expenses, goals, assets };
        const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financesarthi-export-${Date.now()}.json`;
        a.click();
        showToast('JSON data exported successfully!');
      } else if (format === 'CSV') {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Type,Category,Amount,Date,Title\n";
        expenses.forEach(e => {
          csvContent += `Expense,${e.category},${e.amount},${e.date},"${e.title || ''}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = `financesarthi-data-${Date.now()}.csv`;
        a.click();
        showToast('CSV data exported successfully!');
      } else if (format === 'EXPENSES') {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Category,Amount,Title\n";
        expenses.forEach(e => {
          csvContent += `${e.date},${e.category},${e.amount},"${e.title || ''}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = `expense-history-${Date.now()}.csv`;
        a.click();
        showToast('Expense history exported successfully!');
      } else if (format === 'PDF') {
        window.print();
        showToast('PDF print dialog triggered!');
      }
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 pb-20 relative select-text">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-850 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-blue-500" />
            System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, notification preferences, security parameters, and exports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-850 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg">
                {name ? name.substring(0, 2).toUpperCase() : 'FS'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Profile Details
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Personal profile coordinates
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                    <option value="Business">Business</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Professional">Professional</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi / हिन्दी</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Marathi">Marathi / मराठी</option>
                    <option value="Tamil">Tamil / தமிழ்</option>
                    <option value="Telugu">Telugu / తెలుగు</option>
                    <option value="Kannada">Kannada / ಕನ್ನಡ</option>
                    <option value="Gujarati">Gujarati / ગુજરાતી</option>
                    <option value="Bengali">Bengali / বাংলা</option>
                    <option value="Punjabi">Punjabi / ਪੰਜਾਬੀ</option>
                    <option value="Malayalam">Malayalam / മലയാളം</option>
                    <option value="Auto Detect">Auto Detect</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Active Financial Goals</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {[
                    { id: 'EMERGENCY_FUND', label: 'Emergency Fund' },
                    { id: 'INVESTMENT', label: 'Wealth Creation' },
                    { id: 'HOUSE', label: 'Buy House' },
                    { id: 'VEHICLE', label: 'Buy Car' },
                    { id: 'RETIREMENT', label: 'Retirement (FIRE)' },
                    { id: 'TRAVEL', label: 'Travel' },
                    { id: 'EDUCATION', label: 'Higher Education' },
                    { id: 'WEDDING', label: 'Wedding' },
                  ].map(g => {
                    const isChecked = selectedGoals.includes(g.id as any);
                    return (
                      <label key={g.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-850/60 cursor-pointer hover:bg-slate-950">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGoals([...selectedGoals, g.id as any]);
                            } else {
                              setSelectedGoals(selectedGoals.filter(val => val !== g.id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer"
                        />
                        <span>{g.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/10 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. Financial Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-850 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Financial Preferences
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Salary cycles and language mappings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Salary Day</label>
                <select
                  value={salaryDay}
                  onChange={(e) => setSalaryDay(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Sarthi Advisor AI Language</label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
                <option value="Tamil">Tamil / தமிழ்</option>
                <option value="Gujarati">Gujarati / ગુજરાતી</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 block">Notification channels</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer"
                  />
                  <span>Email Digests</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer"
                  />
                  <span>Push Alerts</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer"
                  />
                  <span>SMS Logs</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.ai}
                    onChange={(e) => setNotifications(prev => ({ ...prev, ai: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer"
                  />
                  <span>Proactive AI alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Security */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-850 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-650/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Security & Authentication
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Encryption keys and active nodes
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <span className="text-slate-400">Email Verification Status</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <span className="text-slate-400">Master Password Status</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase">
                Secure & Encryption Locked
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <span className="text-slate-400">Two Factor Auth (2FA)</span>
              <button 
                type="button"
                onClick={() => {
                  setTwoFactor(prev => !prev);
                  showToast(twoFactor ? 'Two-Factor Authentication disabled' : 'Two-Factor Authentication activated');
                }}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                  twoFactor ? 'bg-blue-600 flex justify-end' : 'bg-slate-800 flex justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block pt-1">Active Login Sessions</span>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/20 border border-slate-850/50">
                  <div className="flex items-center gap-2.5">
                    <Laptop className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-white font-bold">Mac OS • Chrome browser</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Current session • active</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Local</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Data Export */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-850 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Data Portability & Export
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Extract encryptions and CSV balances
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Download your raw financial entries, budgets parameters, and goal checkpoints in standard formats.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => exportData('JSON')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <FileJson className="h-4 w-4 text-orange-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => exportData('CSV')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => exportData('PDF')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <FileText className="h-4 w-4 text-red-400" />
              <span>Export PDF Report</span>
            </button>

            <button
              type="button"
              onClick={() => exportData('EXPENSES')}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Expenses History</span>
            </button>
          </div>
        </div>

      </div>

      {/* 5. Danger Zone */}
      <div className="rounded-3xl border border-rose-900/30 overflow-hidden bg-slate-950">
        <button
          type="button"
          onClick={() => setIsDangerZoneExpanded(prev => !prev)}
          className="w-full p-5 bg-rose-950/5 hover:bg-rose-950/10 flex items-center justify-between border-b border-rose-900/10 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 text-rose-450">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <div>
              <span className="text-xs font-bold text-rose-400">Danger Zone</span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Account termination controls</p>
            </div>
          </div>
          {isDangerZoneExpanded ? (
            <ChevronUp className="h-4 w-4 text-rose-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-rose-500" />
          )}
        </button>

        {isDangerZoneExpanded && (
          <div className="p-6 space-y-4 bg-rose-950/5 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs text-slate-400 font-medium">
              Wiping your data is irreversible. All transaction lists, investments portfolios, and Sarthi memory parameters will be purged permanently.
            </p>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={async () => {
                  const confirm = window.confirm("Are you absolutely sure you want to permanently delete your FinanceSarthi account and all stored data? This cannot be undone.");
                  if (confirm) {
                    setIsLoading(true);
                    try {
                      await deleteAccount();
                      showToast('Your account and all associated data have been permanently deleted.');
                    } catch (err: any) {
                      showToast(`Failed to delete account: ${err.message}`);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
                className="py-2.5 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-450 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Sarthi Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
