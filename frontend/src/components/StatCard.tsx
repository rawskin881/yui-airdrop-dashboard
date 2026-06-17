import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'pink' | 'purple' | 'blue' | 'green' | 'red';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => {
  const colorMap = {
    pink: {
      bg: 'bg-yui-pink-light/40 dark:bg-pink-950/10',
      border: 'border-pink-200/50 dark:border-pink-950/30',
      text: 'text-yui-pink-dark',
      glow: 'shadow-pink-500/5',
    },
    purple: {
      bg: 'bg-yui-purple-light/40 dark:bg-purple-950/10',
      border: 'border-purple-200/50 dark:border-purple-950/30',
      text: 'text-yui-purple-dark',
      glow: 'shadow-purple-500/5',
    },
    blue: {
      bg: 'bg-yui-blue-light/40 dark:bg-sky-950/10',
      border: 'border-blue-200/50 dark:border-blue-950/30',
      text: 'text-yui-blue-dark',
      glow: 'shadow-sky-500/5',
    },
    green: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      border: 'border-emerald-200/40 dark:border-emerald-950/20',
      text: 'text-emerald-500 dark:text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    red: {
      bg: 'bg-rose-50/40 dark:bg-rose-950/10',
      border: 'border-rose-200/40 dark:border-rose-950/20',
      text: 'text-rose-500 dark:text-rose-400',
      glow: 'shadow-rose-500/5',
    },
  };

  const scheme = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass glass-card p-5 rounded-3xl flex items-center justify-between border ${scheme.bg} ${scheme.border} ${scheme.glow} transition-colors duration-300`}
    >
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </span>
        </div>
        {description && (
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {description}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/5 shadow-sm ${scheme.text}`}>
        {icon}
      </div>
    </motion.div>
  );
};
export default StatCard;
