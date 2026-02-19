import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const WeakStudentsDrawer = ({ open, onClose, students = [] }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500" />
                Weak Students
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-72px)]">
              {students.length === 0 ? (
                <p className="text-center text-gray-500">
                  No weak students 🎉
                </p>
              ) : (
                students.map((s, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {s.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Attendance: {s.percentage}%
                      </p>
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                      Needs Attention
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeakStudentsDrawer;
