import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const Dropdown = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option',
  icon,
  disabled = false,
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white dark:bg-dark-700 border rounded-xl
            flex items-center justify-between gap-3
            transition-all duration-300
            ${error 
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500' 
              : 'border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-primary-500 cursor-pointer'
            }
            ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : ''}
          `}
        >
          <div className="flex items-center gap-3 flex-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaChevronDown className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="
                absolute z-50 w-full mt-2 
                bg-white dark:bg-dark-800 
                border border-gray-200 dark:border-dark-700 
                rounded-xl shadow-xl
                max-h-60 overflow-auto
              "
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`
                    w-full px-4 py-3 text-left
                    flex items-center gap-3
                    transition-colors duration-150
                    ${option.value === value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }
                    ${index === 0 ? 'rounded-t-xl' : ''}
                    ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                  `}
                >
                  {option.icon && <span>{option.icon}</span>}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-danger-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Dropdown;
