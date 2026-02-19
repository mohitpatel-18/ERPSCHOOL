import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '../../services/studentService';
import {
  FaCheckCircle,
  FaChartLine,
  FaFire,
  FaMedal,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await studentService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAFE DERIVED DATA ================= */

  const stats = dashboardData?.stats || {};

  const attendanceData = useMemo(() => {
    return [
      {
        name: 'Present',
        value: stats.presentDays || 0,
        color: '#10b981',
      },
      {
        name: 'Absent',
        value:
          (stats.totalDays || 0) - (stats.presentDays || 0),
        color: '#ef4444',
      },
    ];
  }, [stats.presentDays, stats.totalDays]);

  const trendData = useMemo(() => {
    if (!dashboardData?.trendData) return [];

    return dashboardData.trendData.map((item, index) => ({
      day: index + 1,
      present: item.status === 'present' ? 1 : 0,
    }));
  }, [dashboardData]);

  /* ================= RENDER ================= */

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {dashboardData?.student?.userId?.name} 👋
            </h1>
            <p className="text-gray-600">
              Class: {dashboardData?.student?.class?.name}{' '}
              {dashboardData?.student?.class?.section}
            </p>
          </motion.div>

          {/* LOW ATTENDANCE WARNING */}
          {stats.lowAttendance && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <FaExclamationTriangle />
              Your attendance is below 75%. Please improve it.
            </div>
          )}

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Present Days
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.presentDays || 0}
                  </p>
                </div>
                <FaCheckCircle className="text-4xl text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Attendance %
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.attendancePercentage || 0}%
                  </p>
                </div>
                <FaChartLine className="text-4xl text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.currentStreak || 0} 🔥
                  </p>
                </div>
                <FaFire className="text-4xl text-orange-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Performance Grade
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.grade || '—'}
                  </p>
                </div>
                <FaMedal className="text-4xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* BADGE */}
          <div className="bg-yellow-50 rounded-xl p-6 shadow-md mb-8 text-center">
            <h2 className="text-lg font-semibold mb-2">
              🎖 Attendance Badge
            </h2>
            <p className="text-xl font-bold">
              {stats.badge}
            </p>
          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                Attendance Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={attendanceData} dataKey="value" outerRadius={100}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                Last 30 Days Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#6366f1"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STUDENT INFO */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-10">
            <h2 className="text-xl font-bold mb-4">
              My Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-semibold">
                  {dashboardData?.student?.studentId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-semibold">
                  {dashboardData?.student?.rollNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">
                  {dashboardData?.student?.userId?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">
                  {dashboardData?.student?.userId?.phone}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
