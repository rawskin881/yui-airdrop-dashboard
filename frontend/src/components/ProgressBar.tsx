import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  color?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  color = 'bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark', 
  showText = false,
  size = 'md'
}) => {
  const roundedValue = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Progress</span>
          <span>{roundedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${roundedValue}%` }}
        ></div>
      </div>
    </div>
  );
};
export default ProgressBar;
