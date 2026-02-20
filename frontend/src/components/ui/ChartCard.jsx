import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const ChartCard = ({ 
  title, 
  value, 
  change, 
  chart: ChartComponent, 
  icon: Icon,
  iconBg = 'bg-primary-500',
  className = '' 
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-card p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
        
        {Icon && (
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive 
              ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400' 
              : 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400'
          }`}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(change)}%
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vs last period
          </span>
        </div>
      )}

      {ChartComponent && (
        <div className="h-32 mt-4">
          <ChartComponent />
        </div>
      )}
    </motion.div>
  );
};

export default ChartCard;
