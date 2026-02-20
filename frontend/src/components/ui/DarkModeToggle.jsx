import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import useDarkMode from '../../hooks/useDarkMode';

const DarkModeToggle = ({ className = '' }) => {
  const [isDark, toggleDarkMode] = useDarkMode();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300
        ${isDark ? 'bg-dark-700' : 'bg-gray-300'}
        ${className}
      `}
      aria-label="Toggle dark mode"
    >
      <motion.div
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs
          ${isDark ? 'bg-dark-900 text-yellow-400' : 'bg-white text-orange-500'}
        `}
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? <FaMoon /> : <FaSun />}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle;
