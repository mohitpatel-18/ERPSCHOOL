import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAngleLeft, FaAngleRight, FaBars, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ menuItems, role }) => {
  /* ================= GLOBAL SIDEBAR STATE ================= */
  const { collapsed, toggleSidebar } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded-groups');
    return saved ? JSON.parse(saved) : {};
  });

  /* ================= GROUP TOGGLE ================= */
  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newState = { ...prev, [groupName]: !prev[groupName] };
      localStorage.setItem('sidebar-expanded-groups', JSON.stringify(newState));
      return newState;
    });
  };

  /* ================= ROLE FILTER ================= */
  const filteredMenu = menuItems.filter(
    item => !item.roles || item.roles.includes(role)
  );

  /* ================= GROUP ITEMS ================= */
  const groupedItems = filteredMenu.reduce((acc, item) => {
    const group = item.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  /* ================= RENDER MENU ITEM ================= */
  const renderMenuItem = (item) => (
    <NavLink key={item.path} to={item.path} end>
      {({ isActive }) => (
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`
              flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all rounded-lg
              ${collapsed ? 'justify-center' : ''}
              ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>

            {!collapsed && (
              <span className="text-sm font-medium truncate">
                {item.name}
              </span>
            )}
          </motion.div>

          {/* TOOLTIP */}
          {collapsed && (
            <div
              className="
                absolute left-full top-1/2 -translate-y-1/2 ml-3
                bg-gray-800 text-white text-xs font-medium
                px-3 py-1.5 rounded-md shadow-lg
                opacity-0 group-hover:opacity-100 z-50
                pointer-events-none whitespace-nowrap transition-opacity
              "
            >
              {item.name}
            </div>
          )}
        </div>
      )}
    </NavLink>
  );

  /* ================= SIDEBAR CONTENT ================= */
  const SidebarContent = (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ '--sidebar-width': collapsed ? '80px' : '260px' }}
      className="h-screen bg-white border-r shadow-sm flex flex-col overflow-hidden"
    >
      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-4 border-b flex-shrink-0">
        {!collapsed && (
          <h2 className="text-lg font-bold text-primary-600 truncate">
            {role === 'admin'
              ? 'Admin Portal'
              : role === 'teacher'
              ? 'Teacher Portal'
              : 'Student Portal'}
          </h2>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition"
        >
          {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            {/* GROUP HEADER */}
            {!collapsed && items.length > 0 && (
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition"
              >
                <span>{groupName}</span>
                {expandedGroups[groupName] !== false ? (
                  <FaChevronDown className="text-xs" />
                ) : (
                  <FaChevronRight className="text-xs" />
                )}
              </button>
            )}

            {/* COLLAPSED DIVIDER */}
            {collapsed && (
              <div className="h-px bg-gray-200 mx-2 mb-2"></div>
            )}

            {/* GROUP ITEMS */}
            <AnimatePresence>
              {(collapsed || expandedGroups[groupName] !== false) && (
                <motion.div
                  initial={!collapsed ? { height: 0, opacity: 0 } : {}}
                  animate={!collapsed ? { height: 'auto', opacity: 1 } : {}}
                  exit={!collapsed ? { height: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {items.map(renderMenuItem)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t text-xs text-gray-400 text-center flex-shrink-0">
        {!collapsed && <>© 2026 Samrose Nalanda</>}
      </div>
    </motion.aside>
  );

  /* ================= RENDER ================= */
  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        className="md:hidden fixed top-5 left-5 z-50 p-2 bg-white rounded-lg shadow"
        onClick={() => setMobileOpen(true)}
      >
        <FaBars />
      </button>

      {/* DESKTOP */}
      <div className="hidden md:block fixed left-0 top-0 z-40">
        {SidebarContent}
      </div>

      {/* MOBILE */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="fixed left-0 top-0 z-50"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
