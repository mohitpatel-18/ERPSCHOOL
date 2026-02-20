import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaEye,
  FaPlus,
  FaClipboardCheck,
  FaBook,
  FaEnvelopeOpenText,
} from 'react-icons/fa';

const TeacherLayout = () => {
  const { user, logout } = useAuth();
  const { collapsed } = useSidebar(); // ⭐ MOST IMPORTANT
  const navigate = useNavigate();

  // 🔹 SAME LOGIC AS ADMIN
  const sidebarWidth = collapsed ? 80 : 260;

  // ✅ TEACHER MENU
  const menuItems = [
    { name: 'Dashboard', path: '/teacher', icon: <FaTachometerAlt />, group: 'Main' },
    { name: 'Add Student', path: '/teacher/add-student', icon: <FaPlus />, group: 'Students' },
    { name: 'My Students', path: '/teacher/students', icon: <FaUsers />, group: 'Students' },
    {
      name: 'Mark Attendance',
      path: '/teacher/attendance/mark',
      icon: <FaClipboardList />,
      group: 'Attendance',
    },
    {
      name: 'View Attendance',
      path: '/teacher/attendance/view',
      icon: <FaEye />,
      group: 'Attendance',
    },
    { name: 'Exam Management', path: '/teacher/exams', icon: <FaClipboardCheck />, group: 'Academics' },
    { name: 'Homework', path: '/teacher/homework', icon: <FaBook />, group: 'Academics' },
    { name: 'Leave Management', path: '/teacher/leaves', icon: <FaEnvelopeOpenText />, group: 'Leave' },
    { name: 'Profile', path: '/teacher/profile', icon: <FaUserCircle />, group: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/erp-login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar menuItems={menuItems} role="teacher" />

      {/* CONTENT AREA */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 right-0 h-20 bg-white shadow-md z-40
                     flex items-center justify-between px-8 transition-all duration-300"
          style={{ left: sidebarWidth }}
        >
          <h1 className="text-2xl font-bold text-gray-800">
            Samrose Nalanda School - Teacher Portal
          </h1>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || 'Teacher'}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </motion.header>

        {/* MAIN CONTENT */}
        <main className="pt-24 p-8 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
