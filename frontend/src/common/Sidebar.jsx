import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAngleLeft, FaAngleRight, FaBars } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ menuItems, role }) => {
  /* ================= GLOBAL SIDEBAR STATE ================= */
  const { collapsed, toggleSidebar } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ================= ROLE FILTER ================= */
  const filteredMenu = menuItems.filter(
    item => !item.roles || item.roles.includes(role)
  );

  /* ================= SIDEBAR CONTENT ================= */
  const SidebarContent = (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ '--sidebar-width': collapsed ? '80px' : '260px' }}
      className="h-screen bg-white border-r shadow-sm flex flex-col"
    >
      {/* LOGO */}
      <div className="h-20 flex items-center justify-between px-4 border-b">
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
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredMenu.map(item => (
          <NavLink key={item.path} to={item.path} end>
            {({ isActive }) => (
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                    ${collapsed ? 'justify-center rounded-xl' : 'rounded-full'}
                    ${
                      isActive
                        ? collapsed
                          ? 'bg-primary-600 text-white shadow'
                          : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>

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
                      bg-white text-gray-800 text-xs font-medium
                      px-3 py-1.5 rounded-md shadow-lg
                      opacity-0 group-hover:opacity-100
                      pointer-events-none whitespace-nowrap transition
                    "
                  >
                    {item.name}
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
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
