import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

import {
  FaTachometerAlt,
  FaUserCircle,
  FaClipboardList,
  FaSignOutAlt,
  FaUserGraduate,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaBook,
} from 'react-icons/fa';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { collapsed } = useSidebar(); // ⭐ SAME FIX
  const navigate = useNavigate();

  // 🔥 dynamic sidebar width (same as admin / teacher)
  const sidebarWidth = collapsed ? 80 : 260;

  // ✅ STUDENT MENU
  const menuItems = [
    { name: 'Dashboard', path: '/student', icon: <FaTachometerAlt />, group: 'Main' },
    { name: 'My Profile', path: '/student/profile', icon: <FaUserGraduate />, group: 'Profile' },
    { name: 'Attendance', path: '/student/attendance', icon: <FaClipboardList />, group: 'Academics' },
    { name: 'Exams & Results', path: '/student/exams', icon: <FaClipboardCheck />, group: 'Academics' },
    { name: 'Homework', path: '/student/homework', icon: <FaBook />, group: 'Academics' },
    { name: 'Leave Management', path: '/student/leaves', icon: <FaClipboardList />, group: 'Leave' },
    { name: 'My Fees', path: '/student/fees', icon: <FaMoneyBillWave />, group: 'Finance' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/erp-login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar menuItems={menuItems} role="student" />

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
            Samrose Nalanda School - Student Portal
          </h1>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || 'Student'}
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

export default StudentLayout;
