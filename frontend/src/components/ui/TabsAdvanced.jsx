import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TabsAdvanced = ({ tabs = [], defaultTab = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-dark-700 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              relative px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors
              ${activeTab === index
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                  {tab.badge}
                </span>
              )}
            </div>
            
            {/* Active indicator */}
            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              opacity: activeTab === index ? 1 : 0,
              display: activeTab === index ? 'block' : 'none',
            }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === index && tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TabsAdvanced;
