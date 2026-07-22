import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HealthGauge } from '../../components/HealthGauge';
import { Sparkles, Bot, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WelcomeTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { userProfile } = useAuth();
  const userName = userProfile?.displayName || 'Rohan Sharma';

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

        <div className="relative max-w-md w-full space-y-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userName}
                className="h-20 w-20 rounded-3xl object-cover border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/30"
              />
            ) : (
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-2xl shadow-emerald-500/30 border border-emerald-400">
                <User className="h-10 w-10 text-slate-950" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950">
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
            </span>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-1"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hello, {userName.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Welcome back to <span className="text-emerald-400 font-bold">FinanceSarthi</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="py-2"
          >
            <HealthGauge score={820} grade="EXCELLENT" />
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-xs text-slate-300 max-w-sm space-y-1 text-left bg-slate-900/80"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
              <Bot className="h-3.5 w-3.5" />
              <span>Daily Sarthi AI Insight</span>
            </div>
            <p className="italic text-slate-200">
              "Disciplined monthly SIPs beat market timing 98% of the time in long-term wealth creation."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full space-y-2 pt-2"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                Preparing your AI dashboard...
              </span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
