import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Edit, Flame, Trash2, Clock } from 'lucide-react';
import ProgressBar from './ProgressBar';

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface Airdrop {
  id: string;
  userId: string;
  name: string;
  nama?: string; // fallback from backend DB structure
  deadline: string;
  status: 'pending' | 'done' | 'claim' | 'gagal';
  skor: number;
  notes: string;
  tasks: Task[];
  createdAt: string;
}

interface AirdropItemProps {
  airdrop: Airdrop;
  onEdit: (airdrop: Airdrop) => void;
  onDelete: (airdropId: string) => void;
  onToggleTask: (airdropId: string, taskId: string) => void;
}

export const AirdropItem: React.FC<AirdropItemProps> = ({ 
  airdrop, 
  onEdit, 
  onDelete,
  onToggleTask 
}) => {
  const [countdown, setCountdown] = useState<{ text: string; color: string; expired: boolean }>({
    text: '',
    color: '',
    expired: false
  });

  const airdropName = airdrop.name || airdrop.nama || 'Unnamed Airdrop';

  // Calculate task progress
  const totalTasks = airdrop.tasks?.length || 0;
  const completedTasks = airdrop.tasks?.filter(t => t.done).length || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Real-time countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (airdrop.status === 'done' || airdrop.status === 'claim') {
        setCountdown({ text: 'Selesai ✨', color: 'text-emerald-500 font-semibold', expired: false });
        return;
      }
      
      const now = new Date();
      const deadline = new Date(airdrop.deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown({ 
          text: airdrop.status === 'gagal' ? 'Gagal ❌' : 'Terlewat Deadline ⚠️', 
          color: 'text-red-500 font-bold', 
          expired: true 
        });
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setCountdown({ 
          text: `${days} hari, ${hours} jam lagi`, 
          color: days <= 2 ? 'text-amber-500 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium',
          expired: false 
        });
      } else if (hours > 0) {
        setCountdown({ 
          text: `${hours} jam, ${minutes} menit lagi`, 
          color: 'text-amber-500 font-bold', 
          expired: false 
        });
      } else {
        setCountdown({ 
          text: `${minutes} menit lagi! 🔥`, 
          color: 'text-red-500 font-extrabold animate-pulse', 
          expired: false 
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [airdrop.deadline, airdrop.status]);

  // Score styling
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-red-500/10 text-red-500 border-red-200 dark:border-red-950/20';
    if (score >= 5) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-950/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-950/20';
  };

  // Status Badge styling
  const getStatusBadge = (status: string) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full border ';
    switch (status) {
      case 'claim':
        return base + 'bg-emerald-500/10 text-emerald-500 border-emerald-200 dark:border-emerald-950/20';
      case 'done':
        return base + 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-950/20';
      case 'gagal':
        return base + 'bg-red-500/10 text-red-500 border-red-200 dark:border-red-950/20';
      default:
        return base + 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-950/20';
    }
  };

  // Convert status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'claim': return 'Claimable';
      case 'done': return 'Done';
      case 'gagal': return 'Gagal';
      default: return 'Pending';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="glass rounded-3xl p-5 border border-white/20 dark:border-white/5 flex flex-col justify-between h-full bg-white/20 dark:bg-slate-900/10 shadow-sm transition-all"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base group-hover:text-pink-500 leading-tight">
              {airdropName}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Calendar size={12} />
              <span>Deadline: {airdrop.deadline}</span>
            </div>
          </div>
          <span className={getStatusBadge(airdrop.status)}>
            {getStatusLabel(airdrop.status)}
          </span>
        </div>

        {/* Notes (truncate) */}
        {airdrop.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed bg-white/30 dark:bg-slate-800/20 p-2.5 rounded-xl border border-white/10">
            {airdrop.notes}
          </p>
        )}

        {/* Subtasks checklist summary */}
        {totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <CheckSquare size={12} className="text-yui-pink-dark" />
                <span>Tasks ({completedTasks}/{totalTasks})</span>
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            
            {/* Quick-toggle subtasks list (show max 3 inline) */}
            <div className="space-y-1 pt-1">
              {airdrop.tasks.slice(0, 3).map((task) => (
                <label 
                  key={task.id} 
                  className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer select-none py-0.5"
                >
                  <input 
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(airdrop.id, task.id)}
                    className="w-3.5 h-3.5 rounded text-yui-pink-dark border-slate-300 dark:border-slate-700 focus:ring-yui-pink-dark/50 accent-pink-500"
                  />
                  <span className={task.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                    {task.title}
                  </span>
                </label>
              ))}
              {totalTasks > 3 && (
                <span className="text-[10px] italic text-slate-400 block pl-5">
                  +{totalTasks - 3} tasks lainnya...
                </span>
              )}
            </div>
            
            <ProgressBar value={progressPercent} size="sm" />
          </div>
        )}
      </div>

      {/* Footer Details & Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between gap-4">
        {/* Potency & Countdown Info */}
        <div className="space-y-1">
          {/* Potency Score */}
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getScoreColor(airdrop.skor)}`}>
              <Flame size={10} className="fill-current" />
              <span>Skor: {airdrop.skor}</span>
            </span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-1 text-[10px] font-medium pl-1">
            <Clock size={11} className="text-slate-400" />
            <span className={countdown.color}>{countdown.text}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(airdrop)}
            className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-90"
            title="Edit / Detail"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(airdrop.id)}
            className="p-2 rounded-xl border border-red-200/20 dark:border-red-950/20 hover:bg-red-500/10 text-red-500 transition-all active:scale-90"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default AirdropItem;
