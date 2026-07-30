import React from 'react';
import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number; // 0 to 1000
  grade: string;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, grade }) => {
  const percentage = Math.min(100, Math.max(0, (score / 1000) * 100));
  const strokeDasharray = 283; // 2 * Math.PI * 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  let colorClass = 'stroke-blue-500';
  let badgeColor = 'bg-blue-500/20 text-sky-400 border-blue-500/30';
  if (score < 500) {
    colorClass = 'stroke-rose-500';
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  } else if (score < 700) {
    colorClass = 'stroke-amber-400';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-slate-800 fill-none"
          strokeWidth="8"
        />
        {/* Animated Progress Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          className={`fill-none ${colorClass}`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: strokeDasharray }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Center Score Display */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-2xl font-black tracking-tight text-white"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Out of 1000</span>
        <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {grade}
        </span>
      </div>
    </div>
  );
};
