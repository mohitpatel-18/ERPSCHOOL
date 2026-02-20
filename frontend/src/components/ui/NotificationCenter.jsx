import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      addNotification(event.detail);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const addNotification = ({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const icons = {
    success: <FaCheckCircle className="text-success-500" />,
    error: <FaExclamationCircle className="text-danger-500" />,
    warning: <FaExclamationTriangle className="text-warning-500" />,
    info: <FaInfoCircle className="text-primary-500" />,
  };

  const colors = {
    success: 'border-l-success-500 bg-success-50 dark:bg-success-900/20',
    error: 'border-l-danger-500 bg-danger-50 dark:bg-danger-900/20',
    warning: 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20',
    info: 'border-l-primary-500 bg-primary-50 dark:bg-primary-900/20',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md w-full space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              pointer-events-auto
              glass-card border-l-4 ${colors[notification.type]}
              flex items-start gap-3 p-4 shadow-xl
            `}
          >
            <div className="text-2xl mt-0.5">
              {icons[notification.type]}
            </div>
            <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (message, type = 'info', duration = 5000) => {
  const event = new CustomEvent('showNotification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationCenter;
