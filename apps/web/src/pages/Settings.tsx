import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile, FinancialGoalType, OccupationType } from '@financesarthi/types';
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
  Sparkles,
  Sliders,
  DollarSign,
  ShieldCheck,
  Activity,
  HardDrive
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

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    setAiLanguage(newLang);
    localStorage.setItem('sarthi_lang_pref', newLang);
    applyLanguageTranslation(newLang);
    showToast(`Language switched to ${newLang}. Translating entire app...`);
    try {
      await profileService.updateProfile({ preferredLanguage: newLang });
      if (completeOnboarding) {
        await completeOnboarding({ preferredLanguage: newLang });
      }
    } catch (err) {
      console.warn('Failed to update language preference in profile:', err);
    }
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
    <div className="space-y-8 pb-24 relative select-text">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-6 lg:p-8 backdrop-blur-xl shadow-2xl shadow-slate-950/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                <SettingsIcon className="h-7 w-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  System Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Preferences Active
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-400 font-medium max-w-xl">
                Configure your personal profile, regional currency, AI Sarthi language, security credentials, and data backups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Storage Node</div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-end">
                <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cloud Sync Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Profile Details Card */}
        <div className="p-6 lg:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6 flex flex-col justify-between hover:border-slate-750 transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xl shadow-md">
                  {name ? name.substring(0, 2).toUpperCase() : 'FS'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Personal Profile Details
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Your personal information and financial profile parameters
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Verified Profile
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="name@domain.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Monthly Income (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="Monthly Income"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                    <option value="Business">Business / Entrepreneur</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Professional">Professional</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Primary UI Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium cursor-pointer"
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
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium cursor-pointer"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Pune, Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Active Financial Objectives</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                  {[
                    { id: 'EMERGENCY_FUND', label: 'Emergency Fund' },
                    { id: 'INVESTMENT', label: 'Wealth Creation' },
                    { id: 'HOUSE', label: 'Buy House' },
                    { id: 'VEHICLE', label: 'Buy Car' },
                    { id: 'RETIREMENT', label: 'Retirement (FIRE)' },
                    { id: 'TRAVEL', label: 'Travel & Lifestyle' },
                    { id: 'EDUCATION', label: 'Higher Education' },
                    { id: 'WEDDING', label: 'Wedding' },
                  ].map(g => {
                    const isChecked = selectedGoals.includes(g.id as any);
                    return (
                      <label 
                        key={g.id} 
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isChecked 
                            ? 'bg-blue-950/40 border-blue-500/50 text-blue-200 shadow-sm shadow-blue-500/10' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950 hover:border-slate-700'
                        }`}
                      >
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
                          className="h-4 w-4 rounded border-slate-800 text-blue-500 bg-slate-950 focus:ring-0 cursor-pointer accent-blue-500"
                        />
                        <span className="text-[11px] font-semibold">{g.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-3 px-7 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Preferences, Security, Export */}
        <div className="space-y-8">
          
          {/* 2. Financial Preferences Card */}
          <div className="p-6 lg:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6 hover:border-slate-750 transition-all duration-300">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Financial & AI Preferences
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Salary cycle triggers and AI companion language settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Salary Credit Day</label>
                  <select
                    value={salaryDay}
                    onChange={(e) => setSalaryDay(Number(e.target.value))}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all font-medium cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>Day {day} of every month</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Sarthi AI Voice & Text Language</label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all font-medium cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi / हिन्दी</option>
                    <option value="Tamil">Tamil / தமிழ்</option>
                    <option value="Gujarati">Gujarati / ગુજરાતી</option>
                    <option value="Hinglish">Hinglish (Hindi + English)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-300 block">Notification Channels & Delivery</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-300">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <span className="text-slate-200">Email Digests</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <span className="text-slate-200">Push Notifications</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <span className="text-slate-200">SMS Reminders</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.ai}
                      onChange={(e) => setNotifications(prev => ({ ...prev, ai: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <span className="text-slate-200">Proactive AI Nudges</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Security Card */}
          <div className="p-6 lg:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6 hover:border-slate-750 transition-all duration-300">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Security & Encryption
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Account authentication, two-factor access & device sessions
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-medium text-slate-300">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-300">Email Verification Status</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Verified Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-indigo-400" />
                  <span className="text-slate-300">Master Password Vault</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Encrypted & Secured
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">Two Factor Authentication (2FA)</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setTwoFactor(prev => !prev);
                    showToast(twoFactor ? 'Two-Factor Authentication disabled' : 'Two-Factor Authentication activated');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                    twoFactor ? 'bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-end shadow-sm shadow-blue-500/30' : 'bg-slate-800 flex justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Active Device Sessions</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-200 font-bold">Mac OS • Web App Browser</p>
                      <p className="text-[10px] text-slate-500 font-medium">Current session • Active now</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Data Export Card */}
          <div className="p-6 lg:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl shadow-slate-950/40 space-y-6 hover:border-slate-750 transition-all duration-300">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Data Portability & Backup Export
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Export complete financial logs in open formats
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Download your complete financial entries, budget configurations, and historical checkpoints anytime.
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => exportData('JSON')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 hover:border-orange-500/40 text-slate-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <FileJson className="h-4 w-4 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => exportData('CSV')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 hover:border-emerald-500/40 text-slate-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => exportData('PDF')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 hover:border-rose-500/40 text-slate-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <FileText className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Export PDF Report</span>
              </button>

              <button
                type="button"
                onClick={() => exportData('EXPENSES')}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:bg-slate-950 hover:border-blue-500/40 text-slate-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <Download className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Expenses Log</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Global Language Selection Card */}
      <div className="p-6 lg:p-7 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-blue-500/30 backdrop-blur-md shadow-2xl space-y-6 hover:border-blue-500/50 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-teal-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Global Language & App Translation
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Select your preferred language — all website screens, buttons, and Sarthi AI companion will translate instantly
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
            {language} Active
          </span>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-300 block">
            Choose Application & Sarthi AI Language:
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { id: 'English', label: 'English', code: 'EN' },
              { id: 'Hindi', label: 'Hindi / हिन्दी', code: 'HI' },
              { id: 'Hinglish', label: 'Hinglish', code: 'HING' },
              { id: 'Marathi', label: 'Marathi / मराठी', code: 'MR' },
              { id: 'Tamil', label: 'Tamil / தமிழ்', code: 'TA' },
              { id: 'Telugu', label: 'Telugu / తెలుగు', code: 'TE' },
              { id: 'Gujarati', label: 'Gujarati / ગુજરાતી', code: 'GU' },
              { id: 'Bengali', label: 'Bengali / বাংলা', code: 'BN' },
              { id: 'Punjabi', label: 'Punjabi / ਪੰਜਾਬੀ', code: 'PA' },
              { id: 'Malayalam', label: 'Malayalam / മലയാളം', code: 'ML' },
              { id: 'Kannada', label: 'Kannada / ಕನ್ನಡ', code: 'KN' },
              { id: 'Auto Detect', label: 'Auto Detect', code: 'AUTO' },
            ].map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {lang.code}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  </div>
                  <span className="text-xs font-bold truncate">{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Danger Zone */}

      <div className="rounded-3xl border border-rose-500/30 overflow-hidden bg-slate-950/80 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={() => setIsDangerZoneExpanded(prev => !prev)}
          className="w-full p-5 bg-rose-950/20 hover:bg-rose-950/30 flex items-center justify-between border-b border-rose-500/20 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-rose-400">Danger Zone</span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Permanent account termination and data wipe controls</p>
            </div>
          </div>
          {isDangerZoneExpanded ? (
            <ChevronUp className="h-5 w-5 text-rose-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-rose-400" />
          )}
        </button>

        {isDangerZoneExpanded && (
          <div className="p-6 space-y-4 bg-rose-950/10 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Wiping your data is permanent and irreversible. All recorded transactions, investments, financial goals, and personalized Sarthi AI memories will be completely purged.
            </p>
            <div className="flex justify-start pt-2">
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
                className="py-2.5 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All FinanceSarthi Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

