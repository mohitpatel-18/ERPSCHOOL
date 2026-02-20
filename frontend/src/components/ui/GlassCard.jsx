import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  blur = 'xl',
  gradient = false,
  ...props 
}) => {
  const baseClasses = gradient
    ? 'gradient-card'
    : `glass-card backdrop-blur-${blur}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
