import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  striped = false 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const colors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
    purple: 'from-purple-500 to-purple-600',
    gradient: 'from-primary-500 via-secondary-500 to-purple-500',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar ${sizes[size]}`}>
        <motion.div
          className={`
            progress-fill bg-gradient-to-r ${colors[color]}
            ${striped ? 'bg-[length:30px_30px]' : ''}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1 : 0, 
            ease: 'easeOut' 
          }}
          style={{
            backgroundImage: striped 
              ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
              : undefined
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
