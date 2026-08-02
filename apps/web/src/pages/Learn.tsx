import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Award, Zap, HelpCircle, Trophy, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const COURSES = [
  {
    id: 'crs-1',
    title: 'Finance Basics & Emergency Funds',
    desc: 'Master the 50-30-20 rule, budget allocations, and building a 6-month safety net in Tier 1/2/3 cities.',
    duration: '15 mins',
    xp: 250,
    category: 'Basics',
  },
  {
    id: 'crs-2',
    title: 'Mutual Funds & SIP Wealth Acceleration',
    desc: 'Understand Nifty 50 Index funds, Flexi-Cap strategies, STP, SWP, and step-up compound growth.',
    duration: '25 mins',
    xp: 400,
    category: 'Investments',
  },
  {
    id: 'crs-3',
    title: 'Indian Income Tax Regimes (Old vs New)',
    desc: 'Demystifying Section 80C, 80D, 80CCD(1B), standard deduction ₹75,000, and optimizing tax slabs.',
    duration: '20 mins',
    xp: 350,
    category: 'Tax',
  },
  {
    id: 'crs-4',
    title: 'Credit Score (CIBIL) & Debt Strategy',
    desc: 'How to boost your credit score to 780+, debt avalanche vs snowball methods, and credit card rewards.',
    duration: '18 mins',
    xp: 300,
    category: 'Credit',
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Under the New Tax Regime (FY 2024-25), what is the standard deduction for salaried individuals?',
    options: ['₹50,000', '₹75,000', '₹1,50,000', '₹2,00,000'],
    correct: 1,
    explanation: 'The New Tax Regime provides a standard deduction of ₹75,000 for salaried employees.',
  },
  {
    id: 2,
    question: 'Which investment vehicle qualifies for Section 80C tax deduction with the shortest lock-in period (3 years)?',
    options: ['Public Provident Fund (PPF)', 'Tax Saving Fixed Deposit', 'ELSS Mutual Fund', 'National Savings Certificate (NSC)'],
    correct: 2,
    explanation: 'Equity Linked Savings Scheme (ELSS) mutual funds have the lowest lock-in period of 3 years under 80C.',
  },
  {
    id: 3,
    question: 'How many months of living expenses are recommended for a robust Emergency Safety Fund?',
    options: ['1 to 2 Months', '3 to 6 Months', '12 to 24 Months', 'No emergency fund needed'],
    correct: 1,
    explanation: 'A 3 to 6 month emergency fund ensures liquid coverage for unexpected job loss or medical events.',
  },
];

export const Learn: React.FC = () => {
  const { userProfile, user: fbUser } = useAuth();
  const [xp, setXp] = useState(750);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  // Load XP & learning progress from Firestore on start
  useEffect(() => {
    if (!fbUser) return;

    const loadProgress = async () => {
      try {
        // Read user doc for XP from basic profile
        const userDocRef = doc(db, 'users', fbUser.uid, 'profile', 'basic');
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.xp) setXp(data.xp);
        }

        // Read learning progress subcollection
        const q = query(collection(db, 'users', fbUser.uid, 'learningProgress'));
        const snap = await getDocs(q);
        const lessons: string[] = [];
        snap.forEach((d) => {
          lessons.push(d.data().lessonId);
        });
        setCompletedLessons(lessons);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    };

    loadProgress();
  }, [fbUser]);

  const handleOptionSelect = async (index: number) => {
    setSelectedOption(index);
    if (activeQuizIndex !== null && index === QUIZ_QUESTIONS[activeQuizIndex].correct) {
      setQuizScore((prev) => prev + 1);
      const newXp = xp + 100;
      setXp(newXp);

      // Persist new XP to basic profile
      if (fbUser) {
        try {
          await updateDoc(doc(db, 'users', fbUser.uid, 'profile', 'basic'), { xp: newXp });
        } catch (e) {
          console.warn('Error updating XP:', e);
        }
      }
    }
  };

  const handleClaimCertificate = async () => {
    setShowCertificate(true);
    if (fbUser) {
      try {
        await setDoc(doc(db, 'users', fbUser.uid, 'learningProgress', 'tax_quiz'), {
          lessonId: 'tax_quiz',
          completed: true,
          completedAt: new Date().toISOString(),
        });
        setCompletedLessons((prev) => [...prev, 'tax_quiz']);
      } catch (e) {
        console.warn('Error saving learning progress:', e);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Gamification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sky-400" />
            FinanceSarthi Academy & Gamification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Master personal finance, attempt interactive quizzes, collect badges, and earn certified achievements.
          </p>
        </div>

        {/* XP Points Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-500/30">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-sky-400">
            <Zap className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Experience</span>
            <span className="text-lg font-black text-sky-400">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Tax Optimizer', desc: 'Calculated Old vs New Regime', unlocked: true },
          { title: 'SIP Strategist', desc: 'Set up 10% Step-up goal', unlocked: true },
          { title: 'Emergency Shield', desc: 'Built 3-month safety fund', unlocked: true },
          { title: 'Quiz Master', desc: 'Score 100% on tax quiz', unlocked: completedLessons.includes('tax_quiz') },
        ].map((badge, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl glass-card flex items-center gap-3 border ${
              badge.unlocked ? 'border-blue-500/40 bg-blue-950/20' : 'border-slate-800 opacity-60'
            }`}
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                badge.unlocked ? 'bg-blue-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">{badge.title}</h4>
              <span className="text-[10px] text-slate-400">{badge.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COURSES.map((crs) => (
          <motion.div
            key={crs.id}
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-4 border border-slate-800"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-400 text-[10px] font-bold border border-blue-500/20">
                  {crs.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{crs.duration} • +{crs.xp} XP</span>
              </div>
              <h3 className="text-base font-bold text-white">{crs.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{crs.desc}</p>
            </div>

            <button
              onClick={() => setActiveQuizIndex(0)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/40 text-xs font-bold text-sky-400 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Start Course & Quiz</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Interactive Quiz Modal */}
      {activeQuizIndex !== null && (
        <div className="p-6 rounded-3xl glass-card border border-blue-500/40 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-sky-400" />
              Question {activeQuizIndex + 1} of {QUIZ_QUESTIONS.length}
            </h3>
            <span className="text-xs font-bold text-sky-400">Score: {quizScore}</span>
          </div>

          <p className="text-sm font-semibold text-slate-200">
            {QUIZ_QUESTIONS[activeQuizIndex].question}
          </p>

          <div className="space-y-2.5">
            {QUIZ_QUESTIONS[activeQuizIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                className={`w-full text-left p-3.5 rounded-2xl text-xs font-medium border transition-all cursor-pointer ${
                  selectedOption === i
                    ? i === QUIZ_QUESTIONS[activeQuizIndex].correct
                      ? 'bg-blue-500/20 border-blue-500 text-sky-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {selectedOption !== null && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-sky-400">
                {selectedOption === QUIZ_QUESTIONS[activeQuizIndex].correct ? '✅ Correct Answer!' : '❌ Incorrect'}
              </p>
              <p>{QUIZ_QUESTIONS[activeQuizIndex].explanation}</p>
              <div className="flex justify-end pt-2">
                {activeQuizIndex < QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => {
                      setActiveQuizIndex((prev) => prev! + 1);
                      setSelectedOption(null);
                    }}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleClaimCertificate}
                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Claim Certificate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Certificate Modal */}
      {showCertificate && (
        <div className="p-8 rounded-3xl glass-card border-2 border-blue-500/60 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 text-center space-y-4 shadow-2xl">
          <Trophy className="h-12 w-12 text-sky-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">Certificate of Achievement</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            This certifies that <strong className="text-sky-400">{userProfile?.displayName || 'FinanceSarthi User'}</strong> has completed the FinanceSarthi Personal Financial Discipline & Tax Optimization program.
          </p>
          <button
            onClick={() => setShowCertificate(false)}
            className="py-2.5 px-6 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            Download Verified Badge
          </button>
        </div>
      )}
    </div>
  );
};
