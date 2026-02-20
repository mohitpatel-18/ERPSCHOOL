import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

import {
  FaTachometerAlt,
  FaUserPlus,
  FaUsers,
  FaUserGraduate,
  FaClipboardCheck,
  FaSchool,
  FaSignOutAlt,
  FaUserCircle,
  FaBullhorn,
  FaEnvelopeOpenText,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaLayerGroup,
  FaUserCog
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt />, group: 'Main' },

    { name: 'Add Teacher', path: '/admin/teachers/add', icon: <FaUserPlus />, group: 'Teachers' },
    { name: 'Manage Teachers', path: '/admin/teachers', icon: <FaUsers />, group: 'Teachers' },

    { name: 'Add Student', path: '/admin/students/add', icon: <FaUserGraduate />, group: 'Students' },
    { name: 'Manage Students', path: '/admin/students', icon: <FaLayerGroup />, group: 'Students' },

    { name: 'Attendance Reports', path: '/admin/attendance', icon: <FaClipboardCheck />, group: 'Academics' },
    { name: 'Manage Classes', path: '/admin/classes', icon: <FaSchool />, group: 'Academics' },

    { name: 'Announcements', path: '/admin/announcements', icon: <FaBullhorn />, group: 'Communication' },
    { name: 'Leave Requests', path: '/admin/leaves', icon: <FaEnvelopeOpenText />, group: 'Communication' },

    { name: 'Fee Dashboard', path: '/admin/fees', icon: <FaMoneyBillWave />, group: 'Finance' },
    { name: 'Fee Templates', path: '/admin/fees/templates', icon: <FaFileInvoiceDollar />, group: 'Finance' },
    { name: 'Assign Fees', path: '/admin/fees/assign', icon: <FaLayerGroup />, group: 'Finance' },
    { name: 'Record Payment', path: '/admin/fees/payments/record', icon: <FaMoneyBillWave />, group: 'Finance' },
    { name: 'Fee Reports', path: '/admin/fees/reports', icon: <FaFileInvoiceDollar />, group: 'Finance' },
    
    { name: 'Permissions', path: '/admin/permissions', icon: <FaUserCog />, group: 'Settings' },
    { name: 'Profile & Settings', path: '/admin/profile', icon: <FaUserCircle />, group: 'Settings' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/erp-login');
  };

  const sidebarWidth = collapsed ? 80 : 260;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} role="admin" />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md h-20 fixed top-0 right-0 z-40 flex items-center justify-between px-8 transition-all duration-300"
          style={{ left: sidebarWidth }}
        >
          <h1 className="text-2xl font-bold text-gray-800">
            Samrose Nalanda School - Admin Portal
          </h1>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </motion.header>

        <main className="pt-24 p-8 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
