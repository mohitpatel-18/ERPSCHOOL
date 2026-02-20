import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...', fullScreen = false }) => {
  const container = fullScreen 
    ? 'fixed inset-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm' 
    : 'w-full';

  return (
    <div className={`${container} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          {/* Outer Ring */}
          <motion.div
            className="w-20 h-20 rounded-full border-4 border-primary-200 dark:border-primary-800"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner Spinner */}
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center Dot */}
          <motion.div
            className="absolute inset-0 m-auto w-4 h-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {message}
          </p>
          <motion.div 
            className="flex justify-center gap-1 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
