import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import {
  FaClipboardCheck,
  FaChartLine,
  FaUserTimes,
  FaExclamationTriangle,
  FaUsers,
  FaChalkboard,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

/* ================= QUICK ACTIONS ================= */
const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4 mb-10">
      <button onClick={() => navigate('/teacher/attendance/mark')} className="btn-primary">
        Mark Attendance
      </button>
      <button onClick={() => navigate('/teacher/students')} className="btn-secondary">
        My Students
      </button>
      <button onClick={() => navigate('/teacher/attendance')} className="btn-secondary">
        View Attendance
      </button>
      <button onClick={() => navigate('/teacher/students/add')} className="btn-secondary">
        Add Student
      </button>
    </div>
  );
};

/* ================= WEAK STUDENTS DRAWER ================= */
const WeakStudentsDrawer = ({ open, onClose, count }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Weak Students</h2>

        {count === 0 ? (
          <p className="text-gray-500">No weak students 🎉</p>
        ) : (
          <p className="text-gray-700">
            {count} students have attendance below 75%.
            <br />
            (Detailed list coming next 🚀)
          </p>
        )}

        <button onClick={onClose} className="btn-secondary mt-6">
          Close
        </button>
      </div>
    </div>
  );
};

/* ================= MAIN DASHBOARD ================= */
const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeakDrawer, setShowWeakDrawer] = useState(false);

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await teacherService.getDashboard();
        if (!mounted) return;

        const data = res.data?.data || null;
        setDashboard(data);

        const stats = data?.stats || {};

        if (stats.pendingAttendance > 0) {
          toast('Attendance pending for today', { icon: '⚠️' });
        }

        if (stats.weakStudentsCount > 0) {
          toast(`${stats.weakStudentsCount} weak students detected`, {
            icon: '📉',
          });
        }
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => (mounted = false);
  }, []);

  /* ================= ANALYTICS CARDS ================= */
  const analyticsCards = useMemo(() => {
    const s = dashboard?.stats || {};

    return [
      {
        title: "Today's Attendance %",
        value: `${s.todayAttendancePercentage || 0}%`,
        icon: <FaClipboardCheck className="text-4xl text-green-600" />,
        bg: 'bg-green-50',
      },
      {
        title: 'Attendance Completion',
        value: `${s.attendanceCompletionRate || 0}%`,
        icon: <FaChartLine className="text-4xl text-blue-600" />,
        bg: 'bg-blue-50',
      },
      {
        title: 'Weak Students',
        value: s.weakStudentsCount || 0,
        icon: <FaUserTimes className="text-4xl text-red-600" />,
        bg: 'bg-red-50',
        clickable: true,
      },
      {
        title: 'Pending Attendance',
        value: s.pendingAttendance || 0,
        icon: <FaExclamationTriangle className="text-4xl text-yellow-600" />,
        bg: 'bg-yellow-50',
      },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Smart insights from your attendance data</p>

        {/* ATTENDANCE LOCK BADGE */}
        <div className="mt-3">
          {stats.pendingAttendance === 0 ? (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
              🔒 Attendance Locked
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
              ⏰ Attendance Pending
            </span>
          )}
        </div>
      </motion.div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => card.clickable && setShowWeakDrawer(true)}
            className={`${card.bg} rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <QuickActions />

      {/* TODAY FOCUS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="font-bold mb-3">🎯 Today’s Focus</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Pending Attendance: {stats.pendingAttendance}</li>
          <li>• Weak Students: {stats.weakStudentsCount}</li>
          <li>• Absent Today: {stats.absentToday}</li>
        </ul>
      </div>

      {/* MY CLASSES */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">My Classes</h2>

        {!dashboard?.teacher?.assignedClasses || dashboard.teacher.assignedClasses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No classes assigned yet
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.teacher.assignedClasses?.map(cls => (
              <div
                key={cls._id}
                className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg"
              >
                <h3 className="font-semibold text-lg">
                  <FaChalkboard className="inline mr-2" />
                  {cls.name} {cls.section}
                </h3>
                <p className="text-sm text-gray-600">
                  <FaUsers className="inline mr-1" />
                  Students: {cls.strength || 0}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WEAK STUDENTS DRAWER */}
      <WeakStudentsDrawer
        open={showWeakDrawer}
        onClose={() => setShowWeakDrawer(false)}
        count={stats.weakStudentsCount || 0}
      />
    </div>
  );
};

export default TeacherDashboard;
