import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  FaUsers,
  FaChalkboardTeacher,
  FaChalkboard,
  FaUserPlus,
  FaUserGraduate,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaBullhorn,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaTrophy,
  FaCalendarAlt,
  FaBell,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  StatCardAdvanced,
  GlassCard,
  ProgressBar,
  LoadingScreen,
  AnimatedBackground,
  showNotification,
} from '../ui';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [studentGrowth, setStudentGrowth] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [classAttendance, setClassAttendance] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [
        dashboardRes,
        weeklyRes,
        growthRes,
        trendRes,
        classRes,
        riskRes,
      ] = await Promise.all([
        adminService.getDashboard(),
        adminService.getWeeklyAttendance(),
        adminService.getStudentGrowth(),
        adminService.getAttendanceTrend(),
        adminService.getClassAttendanceStats(),
        adminService.getRiskStudents(),
      ]);

      setStats(dashboardRes.data.data);
      setWeeklyAttendance(weeklyRes.data?.data || []);
      setStudentGrowth(growthRes.data?.data || []);
      setAttendanceTrend(trendRes.data?.data || []);
      setClassAttendance(classRes.data?.data || []);
      setRiskStudents(riskRes.data?.data || []);

      showNotification('Dashboard loaded successfully!', 'success');
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      showNotification('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <LoadingScreen message="Loading Dashboard..." fullScreen />;
  }

  // KPI Cards Data
  const kpiData = [
    {
      title: 'Total Students',
      value: stats?.stats?.totalStudents || 0,
      icon: <FaUsers />,
      color: 'blue',
      trend: 'up',
      trendValue: '+12%',
      gradient: true,
    },
    {
      title: 'Total Teachers',
      value: stats?.stats?.totalTeachers || 0,
      icon: <FaChalkboardTeacher />,
      color: 'green',
      trend: 'up',
      trendValue: '+5%',
      gradient: true,
    },
    {
      title: 'Total Classes',
      value: stats?.stats?.totalClasses || 0,
      icon: <FaChalkboard />,
      color: 'purple',
      trend: 'up',
      trendValue: '+2%',
      gradient: true,
    },
    {
      title: 'Active Announcements',
      value: stats?.stats?.activeAnnouncements || 0,
      icon: <FaBullhorn />,
      color: 'orange',
      trend: 'up',
      trendValue: '+8%',
      gradient: true,
    },
  ];

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="page-container relative z-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's a real-time overview of your school.
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="input-field py-2 px-4"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="year">This Year</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboard}
                className="btn-primary flex items-center gap-2"
              >
                <FaSync className="animate-spin-slow" /> Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCardAdvanced {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* OVERALL ATTENDANCE PROGRESS */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Overall Attendance
            </h2>
            <span className="text-2xl font-bold text-gradient">
              {stats?.stats?.overallAttendance?.toFixed(1) || 0}%
            </span>
          </div>
          <ProgressBar
            value={stats?.stats?.overallAttendance || 0}
            max={100}
            color="success"
            animated
            striped
            showLabel
          />
        </GlassCard>

        {/* QUICK ACTIONS */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionBtn
              icon={<FaUserGraduate />}
              label="Add Student"
              onClick={() => navigate('/admin/students/add')}
              color="blue"
            />
            <QuickActionBtn
              icon={<FaUserPlus />}
              label="Add Teacher"
              onClick={() => navigate('/admin/teachers/add')}
              color="green"
            />
            <QuickActionBtn
              icon={<FaChalkboard />}
              label="Manage Classes"
              onClick={() => navigate('/admin/classes')}
              color="purple"
            />
            <QuickActionBtn
              icon={<FaClipboardCheck />}
              label="Attendance"
              onClick={() => navigate('/admin/attendance')}
              color="orange"
            />
            <QuickActionBtn
              icon={<FaBullhorn />}
              label="Announcements"
              onClick={() => navigate('/admin/announcements')}
              color="red"
            />
            <QuickActionBtn
              icon={<FaChartLine />}
              label="Reports"
              onClick={() => navigate('/admin/reports')}
              color="indigo"
            />
          </div>
        </GlassCard>

        {/* ALERTS & INSIGHTS */}
        {(stats?.alerts?.todayAttendanceMarked === false ||
          stats?.alerts?.unassignedTeachers > 0 ||
          stats?.alerts?.unassignedStudents > 0) && (
          <GlassCard className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaBell className="text-warning-500 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Alerts & Insights
              </h2>
            </div>
            <div className="space-y-3">
              {!stats?.alerts?.todayAttendanceMarked && (
                <AlertCard
                  type="danger"
                  message="Attendance not marked for today"
                />
              )}
              {stats?.alerts?.unassignedTeachers > 0 && (
                <AlertCard
                  type="warning"
                  message={`${stats.alerts.unassignedTeachers} teachers not assigned to classes`}
                />
              )}
              {stats?.alerts?.unassignedStudents > 0 && (
                <AlertCard
                  type="warning"
                  message={`${stats.alerts.unassignedStudents} students without class assignment`}
                />
              )}
            </div>
          </GlassCard>
        )}

        {/* CHARTS ROW 1: Weekly Attendance + Student Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Attendance */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Weekly Attendance Overview
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyAttendance}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="url(#colorPresent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="url(#colorAbsent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Student Growth */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={studentGrowth}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="_id.month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* CHARTS ROW 2: Attendance Trend */}
        <div className="grid grid-cols-1 mb-8">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Attendance Trend (%)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="_id.month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* CLASS PERFORMANCE & RISK STUDENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Attendance Ranking */}
          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <FaTrophy className="text-warning-500 text-2xl" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Class Attendance Rankings
              </h3>
            </div>
            <div className="space-y-4">
              {classAttendance.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-warning-100 text-warning-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-600'
                      } font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.classId?.name} {item.classId?.section}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gradient">
                      {item.percentage?.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={item.percentage || 0}
                    max={100}
                    color={
                      item.percentage >= 90 ? 'success' :
                      item.percentage >= 75 ? 'primary' :
                      item.percentage >= 60 ? 'warning' :
                      'danger'
                    }
                    animated
                  />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* At-Risk Students */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FaExclamationTriangle className="text-danger-500 text-xl" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                At-Risk Students
              </h3>
            </div>
            <div className="space-y-3">
              {riskStudents.slice(0, 8).map((student, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl hover:bg-danger-100 dark:hover:bg-danger-900/30 transition-all cursor-pointer border border-danger-200 dark:border-danger-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {student.studentId?.userId?.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Class: {student.studentId?.class?.name} {student.studentId?.class?.section}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-danger-600 dark:text-danger-400 font-bold">
                      <FaArrowDown className="text-xs" />
                      <span>{student.attendance?.toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionBtn = ({ icon, label, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-2`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-center">{label}</span>
    </motion.button>
  );
};

// Alert Card Component
const AlertCard = ({ type = 'warning', message }) => {
  const styles = {
    danger: 'bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border-danger-200 dark:border-danger-800',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-800',
    info: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-4 rounded-xl border ${styles[type]} transition-all`}
    >
      <FaExclamationTriangle className="text-lg flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

export default AdminDashboard;
