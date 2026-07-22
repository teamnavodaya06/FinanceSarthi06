import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SignOutModal: React.FC = () => {
  const { showSignOutModal, setShowSignOutModal, signOutUser } = useAuth();

  return (
    <AnimatePresence>
      {showSignOutModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSignOutModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 rounded-3xl glass-card border border-rose-500/30 z-50 space-y-4 shadow-2xl text-center"
          >
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <LogOut className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Leaving already?</h3>
              <p className="text-xs text-slate-300">
                You can securely sign out anytime. Your financial data is safely stored with Firebase encryption.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={signOutUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
