import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444']; // present, absent

const AttendanceReports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    classService
      .getAllClasses()
      .then(res => setClasses(res.data.data || []))
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  /* ================= FETCH REPORT ================= */
  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end date');
      return;
    }

    setLoading(true);
    setReportData(null);

    try {
      const res = await attendanceService.getReports({
        classId: selectedClass || 'all',
        startDate,
        endDate,
      });
      setReportData(res.data);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setTimeout(() => setLoading(false), 500); // smooth SaaS feel
    }
  };

  /* ================= DERIVED DATA ================= */
  const chartData = useMemo(() => {
    if (!reportData?.stats) return [];
    return [
      { name: 'Present', value: reportData.stats.present },
      { name: 'Absent', value: reportData.stats.absent },
    ];
  }, [reportData]);

  const attendancePercentage = useMemo(() => {
    if (!reportData?.stats) return 0;
    const total =
      reportData.stats.present + reportData.stats.absent;
    return total > 0
      ? ((reportData.stats.present / total) * 100).toFixed(2)
      : 0;
  }, [reportData]);

  /* ================= PRINT PDF ================= */
  const handlePrintReport = async () => {
  try {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    const month = new Date(startDate).getMonth() + 1;
    const year = new Date(startDate).getFullYear();

    const res = await attendanceService.downloadMonthlyPDF({
      classId: selectedClass || 'all',
      month,
      year,
    });

    // 🛡️ SAFETY CHECK (SaaS level)
    if (!res || !res.data) {
      throw new Error('No PDF data received');
    }

    const blob = new Blob([res.data], {
      type: 'application/pdf',
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${month}-${year}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF DOWNLOAD ERROR:', error);
    toast.error('Failed to download PDF');
  }
};

  return (
    <div className="relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Attendance Reports
        </h1>
        <p className="text-gray-600">
          Generate and view detailed attendance reports
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-40 rounded-xl">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary-600" />
        </div>
      )}

      {/* Report */}
      {reportData && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-600">
                {reportData.stats.present}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {reportData.stats.absent}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">
                Attendance %
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {attendancePercentage}%
              </p>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-16">
            <h2 className="text-xl font-bold mb-6">
              Attendance Overview
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Print Button */}
      {reportData && (
        <button
          onClick={handlePrintReport}
          className="fixed bottom-6 right-6 btn-primary px-6 py-3 shadow-lg"
        >
          Print Report
        </button>
      )}
    </div>
  );
};

export default AttendanceReports;
