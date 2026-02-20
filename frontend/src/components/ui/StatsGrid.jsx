import React from 'react';
import { motion } from 'framer-motion';

const StatsGrid = ({ stats = [], columns = 4, className = '' }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                {stat.unit && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.unit}
                  </span>
                )}
              </div>
              
              {stat.change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-semibold ${
                    stat.change >= 0 
                      ? 'text-success-600 dark:text-success-400' 
                      : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.changeLabel || 'vs last period'}
                  </span>
                </div>
              )}
            </div>

            {stat.icon && (
              <div className={`stat-card-icon ${stat.iconBg || 'bg-gradient-to-br from-primary-500 to-primary-600'}`}>
                {React.createElement(stat.icon, { className: 'w-8 h-8 text-white' })}
              </div>
            )}
          </div>

          {stat.progress !== undefined && (
            <div className="mt-4">
              <div className="progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="progress-fill"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {stat.progress}%
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
