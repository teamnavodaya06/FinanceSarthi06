import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleButton } from '../features/authentication/GoogleButton';
import { OnboardingWizard } from '../features/authentication/OnboardingWizard';
import { ForgotPasswordModal } from '../features/authentication/ForgotPasswordModal';
import {
  Sparkles,
  Bot,
  TrendingUp,
  Target,
  Wallet,
  Receipt,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, loading, authError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await signInWithEmail(email, password);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* LEFT PANEL: Enterprise Hero Mockup & AI Graphics */}
      <div className="relative lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/50 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden min-h-[500px] lg:min-h-screen">
        {/* Floating Mesh & Glowing Particles */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 text-slate-950 font-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
              FinanceSarthi
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
              AI Powered Financial Companion
            </span>
          </div>
        </div>

        {/* Center Hero Vector Graphics & Quote */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-card border border-blue-500/30 bg-slate-900/60 shadow-2xl space-y-6">
            {/* SVG Graph Graphic */}
            <div className="relative h-44 w-full flex items-end justify-center">
              <svg className="w-full h-full" viewBox="0 0 400 160">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 130 Q 90 110 160 80 T 310 40 T 390 20 L 390 150 L 10 150 Z"
                  fill="url(#curveGradient)"
                />
                <motion.path
                  d="M 10 130 Q 90 110 160 80 T 310 40 T 390 20"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
                <circle cx="160" cy="80" r="6" fill="#60a5fa" className="animate-ping" />
                <circle cx="160" cy="80" r="5" fill="#3b82f6" />
                <circle cx="390" cy="20" r="7" fill="#3b82f6" />
              </svg>

              {/* Floating AI Orb */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-2 right-4 p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 border border-blue-500/20"
              >
                <Bot className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-black">AI Sarthi Active</span>
              </motion.div>
            </div>

            {/* Motivational Quote */}
            <div className="space-y-2 text-center pt-2">
              <h3 className="text-lg font-extrabold text-white leading-snug">
                "The smartest investment is understanding your money."
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Continue your financial journey with AI-powered guidance, salary allocations, and goal tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
            Enterprise Capabilities
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'AI Financial Coach', icon: Bot },
              { label: 'Salary Planner', icon: Wallet },
              { label: 'Goal Tracker', icon: Target },
              { label: 'Expense Analytics', icon: Receipt },
              { label: 'Smart Recommendations', icon: TrendingUp },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-slate-300"
                >
                  <Icon className="h-3.5 w-3.5 text-sky-400" />
                  <span>{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Centered Authentication Card */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-slate-950 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Card Wrapper */}
          <div className="p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl space-y-6 bg-slate-900/70">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {mode === 'signin' ? 'Welcome Back 👋' : 'Create Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'signin'
                    ? 'Continue your financial journey with AI-powered guidance.'
                    : 'Setup your personalized profile in 5 simple steps.'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setMode('signin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* FORM CONTENT */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email / Phone Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-sky-400 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-blue-500 h-4 w-4 rounded cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Divider OR */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                    <span className="bg-slate-900 px-3">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <GoogleButton onClick={() => signInWithGoogle()} loading={loading} text="Continue with Google" />

                {/* Toggle Footer */}
                <p className="text-center text-xs text-slate-400 pt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-bold text-sky-400 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            ) : (
              /* ONBOARDING WIZARD SIGNUP */
              <OnboardingWizard onSwitchToSignIn={() => setMode('signin')} />
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
};
