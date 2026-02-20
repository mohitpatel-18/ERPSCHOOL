import React from 'react';
import { motion } from 'framer-motion';

const StatCardAdvanced = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'blue',
  gradient = true,
  onClick 
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      badge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      icon: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      badge: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      badge: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      badge: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    },
    red: {
      bg: 'from-red-500 to-red-600',
      icon: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      badge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    },
    pink: {
      bg: 'from-pink-500 to-pink-600',
      icon: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      badge: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer
        ${gradient 
          ? `bg-gradient-to-br ${colors.bg} text-white shadow-xl hover:shadow-2xl` 
          : 'glass-card hover:shadow-xl'
        }
        transition-all duration-300
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
      
      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div className={`
          stat-card-icon
          ${gradient ? 'bg-white/20 text-white' : colors.icon}
        `}>
          {icon}
        </div>

        {/* Trend Badge */}
        {trend && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
              ${gradient ? 'bg-white/20 text-white' : colors.badge}
            `}
          >
            {trend === 'up' ? '↑' : '↓'}
            {trendValue}
          </motion.div>
        )}
      </div>

      <div className="mt-4 relative">
        <h3 className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
          {title}
        </h3>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}
        >
          {value}
        </motion.p>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

export default StatCardAdvanced;
