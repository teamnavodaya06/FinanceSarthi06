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

const MainLayout: React.FC = () => {
  const { activeTab } = useFinancial();
  const { isAuthenticated, showWelcomeScreen, setShowWelcomeScreen } = useAuth();

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
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'salary' && <SalaryPlanner />}
          {activeTab === 'expenses' && <ExpenseTracker />}
          {activeTab === 'goals' && <Goals />}
          {activeTab === 'calculators' && <DecisionHub />}
          {activeTab === 'networth' && <NetWorth />}
          {activeTab === 'chat' && <Dashboard />}
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
