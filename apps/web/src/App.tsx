import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AISarthiDrawer } from './components/AISarthiDrawer';
import { WelcomeTransition } from './components/auth/WelcomeTransition';
import { SignOutModal } from './components/auth/SignOutModal';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { SalaryPlanner } from './pages/SalaryPlanner';
import { ExpenseTracker } from './pages/ExpenseTracker';
import { GoalsWorkspace } from './pages/GoalsWorkspace';
import { DecisionHub } from './pages/DecisionHub';
import { NetWorth } from './pages/NetWorth';
import { Settings } from './pages/Settings';
import { OnboardingRoadmap } from './components/auth/OnboardingRoadmap';
import { AIActionCenter } from './pages/AIActionCenter';
import { AICopilotWorkspace } from './pages/AICopilotWorkspace';
import { AdaptiveBudgetDashboard } from './pages/AdaptiveBudgetDashboard';
import { applyLanguageTranslation } from './utils/translation';

const MainLayout: React.FC = () => {
  const { activeTab, setIsAiDrawerOpen } = useFinancial();
  const { 
    isAuthenticated, 
    loading, 
    showWelcomeScreen, 
    setShowWelcomeScreen, 
    userProfile,
    authInitTimeout,
    signOutUser
  } = useAuth();

  React.useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Auto-close AI Sarthi Drawer when user navigates directly to Sarthi chat workspace page
  React.useEffect(() => {
    if (activeTab === 'chat') {
      setIsAiDrawerOpen(false);
    }
  }, [activeTab, setIsAiDrawerOpen]);

  // Synchronize entire page translation when userProfile's preferredLanguage changes
  React.useEffect(() => {
    if (userProfile?.preferredLanguage) {
      applyLanguageTranslation(userProfile.preferredLanguage);
    } else {
      const stored = localStorage.getItem('sarthi_lang_pref') || localStorage.getItem('onboarding_language');
      if (stored) {
        applyLanguageTranslation(stored);
      }
    }
  }, [userProfile?.preferredLanguage]);

  // Show Timeout / Error Screen if initialization hangs (>10 seconds)
  if (authInitTimeout) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6 select-none">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">We couldn't finish signing you in</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-normal">
            Your connection to the Sarthi secure database timed out. Please check your network connection or backend services status and retry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-blue-650 hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/10 transition-all cursor-pointer"
          >
            Retry Connection
          </button>
          <button
            onClick={() => signOutUser()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-350 text-xs font-bold transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show Loading Spinner / Experience while Auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-650 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase animate-pulse">Syncing Sarthi secure environment...</span>
      </div>
    );
  }

  // Show Auth Page if user is not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show 2.5s Luxury Welcome Experience after sign-in / onboarding
  if (showWelcomeScreen) {
    return <WelcomeTransition onComplete={() => setShowWelcomeScreen(false)} />;
  }

  // Check onboarding status - Redirect to Onboarding if not completed
  if (!userProfile?.isOnboarded) {
    return <OnboardingRoadmap />;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'action-center' && <AIActionCenter />}
          {activeTab === 'salary' && <SalaryPlanner />}
          {activeTab === 'expenses' && <ExpenseTracker />}
          {activeTab === 'budgets' && <AdaptiveBudgetDashboard />}
          {activeTab === 'goals' && <GoalsWorkspace />}
          {activeTab === 'calculators' && <DecisionHub />}
          {activeTab === 'networth' && <NetWorth />}
          {activeTab === 'chat' && <AICopilotWorkspace />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Conversational AI Sarthi Drawer */}
      {activeTab !== 'chat' && <AISarthiDrawer />}

      {/* Premium Sign Out Confirmation Modal */}
      <SignOutModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <MainLayout />
      </FinancialProvider>
    </AuthProvider>
  );
}

export default App;
