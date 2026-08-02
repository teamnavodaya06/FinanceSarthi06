import React from 'react';
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
import { Goals } from './pages/Goals';
import { DecisionHub } from './pages/DecisionHub';
import { NetWorth } from './pages/NetWorth';
import { Learn } from './pages/Learn';
import { Settings } from './pages/Settings';
import { OnboardingRoadmap } from './components/auth/OnboardingRoadmap';
import { AISarthiPage } from './pages/AISarthiPage';
import { AIActionCenter } from './pages/AIActionCenter';

const MainLayout: React.FC = () => {
  const { activeTab } = useFinancial();
  const { isAuthenticated, loading, showWelcomeScreen, setShowWelcomeScreen, userProfile } = useAuth();

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

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            userProfile?.isOnboarded ? <Dashboard /> : <OnboardingRoadmap />
          )}
          {activeTab === 'action-center' && <AIActionCenter />}
          {activeTab === 'salary' && <SalaryPlanner />}
          {activeTab === 'expenses' && <ExpenseTracker />}
          {activeTab === 'goals' && <Goals />}
          {activeTab === 'calculators' && <DecisionHub />}
          {activeTab === 'networth' && <NetWorth />}
          {activeTab === 'chat' && <AISarthiPage />}
          {activeTab === 'learn' && <Learn />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Conversational AI Sarthi Drawer */}
      <AISarthiDrawer />

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
