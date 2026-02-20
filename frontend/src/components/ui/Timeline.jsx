import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';

const Timeline = ({ items = [], className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => {
        const Icon = item.completed 
          ? FiCheckCircle 
          : item.inProgress 
            ? FiClock 
            : FiCircle;
        
        const iconColor = item.completed
          ? 'text-success-500 bg-success-100 dark:bg-success-900/30'
          : item.inProgress
            ? 'text-warning-500 bg-warning-100 dark:bg-warning-900/30'
            : 'text-gray-400 bg-gray-100 dark:bg-gray-800';

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 relative"
          >
            {/* Connector Line */}
            {index < items.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor} relative z-10 flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                </div>
                {item.timestamp && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                    {item.timestamp}
                  </span>
                )}
              </div>
              
              {item.badge && (
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  item.badge.type === 'success' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                  item.badge.type === 'warning' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {item.badge.text}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Timeline;
