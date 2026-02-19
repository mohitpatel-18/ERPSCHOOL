import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
} from 'recharts';

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
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Students',
      value: stats?.stats?.totalStudents || 0,
      icon: <FaUsers />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Teachers',
      value: stats?.stats?.totalTeachers || 0,
      icon: <FaChalkboardTeacher />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Classes',
      value: stats?.stats?.totalClasses || 0,
      icon: <FaChalkboard />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Active Announcements',
      value: stats?.stats?.activeAnnouncements || 0,
      icon: <FaBullhorn />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here’s a real-time overview of your school.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </motion.div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className={`${kpi.bg} rounded-xl p-6 shadow-md`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className={`text-4xl ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* OVERALL ATTENDANCE */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Overall Attendance</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${stats?.stats?.overallAttendance?.toFixed(1) || 0}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {stats?.stats?.overallAttendance?.toFixed(1) || 0}% overall attendance
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickBtn icon={<FaUserGraduate />} text="Add Student" onClick={() => navigate('/admin/students/add')} />
          <QuickBtn icon={<FaUserPlus />} text="Add Teacher" onClick={() => navigate('/admin/teachers/add')} />
          <QuickBtn icon={<FaChalkboard />} text="Manage Classes" onClick={() => navigate('/admin/classes')} />
          <QuickBtn icon={<FaClipboardCheck />} text="Attendance" onClick={() => navigate('/admin/attendance')} />
        </div>
      </div>

      {/* WEEKLY ATTENDANCE + ALERTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard title="Weekly Attendance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts & Insights">
          {!stats?.alerts?.todayAttendanceMarked && (
            <Alert danger text="Attendance not marked for today" />
          )}
          {stats?.alerts?.unassignedTeachers > 0 && (
            <Alert text={`${stats.alerts.unassignedTeachers} teachers not assigned`} />
          )}
          {stats?.alerts?.unassignedStudents > 0 && (
            <Alert text={`${stats.alerts.unassignedStudents} students without class`} />
          )}
        </ChartCard>
      </div>

      {/* STUDENT GROWTH + ATTENDANCE TREND */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard title="Student Growth">
          <LineChartWrapper data={studentGrowth} dataKey="students" />
        </ChartCard>

        <ChartCard title="Attendance Trend (%)">
          <LineChartWrapper data={attendanceTrend} dataKey="percentage" />
        </ChartCard>
      </div>

      {/* CLASS RANKING + RISK STUDENTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <ChartCard title="Class Attendance Ranking">
          <table className="w-full text-sm">
            <tbody>
              {classAttendance.map((c, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{c.classId?.name} {c.classId?.section}</td>
                  <td className="py-2 text-right font-semibold">
                    {c.percentage?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>

        <ChartCard title="At-Risk Students">
          {riskStudents.map((r, i) => (
            <div key={i} className="flex justify-between bg-red-50 p-3 rounded-lg mb-2">
              <span>{r.studentId?.userId?.name}</span>
              <span className="font-bold text-red-600">
                {r.attendance?.toFixed(1)}%
              </span>
            </div>
          ))}
        </ChartCard>
      </div>

    </div>
  );
};

const QuickBtn = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="quick-btn flex items-center gap-2">
    {icon} {text}
  </button>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const LineChartWrapper = ({ data, dataKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="_id.month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke="#6366f1" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

const Alert = ({ text, danger }) => (
  <div className={`flex items-center gap-3 p-4 rounded-lg ${
    danger ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
  }`}>
    <FaExclamationTriangle />
    <span className="text-sm">{text}</span>
  </div>
);

export default AdminDashboard;
