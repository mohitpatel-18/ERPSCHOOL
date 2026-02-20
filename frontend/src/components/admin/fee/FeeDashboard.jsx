import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaMoneyBillWave,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaFileInvoiceDollar,
  FaClock,
  FaPlus,
} from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, overdueRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/fees/reports/summary`, { headers }),
        axios.get(`${API_URL}/fees/reports/overdue`, { headers }),
        axios.get(`${API_URL}/fees/payments?limit=10`, { headers }),
      ]);

      setSummary(summaryRes.data.data);
      setOverdueStudents(overdueRes.data.data || []);
      setRecentPayments(paymentsRes.data.data || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Fee Amount',
      value: `₹${summary?.totalFeeAmount?.toLocaleString() || 0}`,
      icon: <FaMoneyBillWave className="text-4xl" />,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Collected',
      value: `₹${summary?.totalCollected?.toLocaleString() || 0}`,
      icon: <FaCheckCircle className="text-4xl" />,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Pending Amount',
      value: `₹${summary?.totalPending?.toLocaleString() || 0}`,
      icon: <FaClock className="text-4xl" />,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
    },
    {
      title: 'Overdue Students',
      value: summary?.overdueCount || 0,
      icon: <FaExclamationTriangle className="text-4xl" />,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
    },
  ];

  // Collection Status Chart
  const statusChartData = {
    labels: ['Paid', 'Partially Paid', 'Overdue', 'Not Started'],
    datasets: [
      {
        data: [
          summary?.paidCount || 0,
          summary?.partialCount || 0,
          summary?.overdueCount || 0,
          (summary?.totalStudents || 0) - 
            (summary?.paidCount || 0) - 
            (summary?.partialCount || 0) - 
            (summary?.overdueCount || 0),
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  // Collection Percentage Chart
  const collectionChartData = {
    labels: ['Collected', 'Pending'],
    datasets: [
      {
        data: [
          summary?.totalCollected || 0,
          summary?.totalPending || 0,
        ],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fee Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete overview of fee collection and management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/fees/templates')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Create Template
          </button>
          <button
            onClick={() => navigate('/admin/fees/assign')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaUsers /> Assign Fees
          </button>
          <button
            onClick={() => navigate('/admin/fees/payments/record')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaFileInvoiceDollar /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>View Details</span>
                <FaChartLine className={stat.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collection Percentage */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Collection Rate</h3>
            <p className="text-3xl font-bold mt-2">
              {summary?.collectionPercentage || 0}%
            </p>
            <p className="text-sm opacity-90 mt-1">
              ₹{summary?.totalCollected?.toLocaleString() || 0} of ₹
              {summary?.totalFeeAmount?.toLocaleString() || 0} collected
            </p>
          </div>
          <div className="w-32 h-32">
            <Doughnut
              data={collectionChartData}
              options={{
                plugins: { legend: { display: false } },
                cutout: '70%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Status Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Students Fully Paid</span>
              <span className="text-xl font-bold text-green-600">
                {summary?.paidCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Partially Paid</span>
              <span className="text-xl font-bold text-blue-600">
                {summary?.partialCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Overdue</span>
              <span className="text-xl font-bold text-red-600">
                {summary?.overdueCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Total Late Fees</span>
              <span className="text-xl font-bold text-yellow-600">
                ₹{summary?.totalLateFee?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Students */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 p-4">
            <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <FaExclamationTriangle /> Overdue Students
            </h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {overdueStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No overdue students</p>
            ) : (
              <div className="space-y-3">
                {overdueStudents.slice(0, 5).map((student) => (
                  <div
                    key={student._id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {student.student?.firstName} {student.student?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Roll: {student.student?.rollNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Class: {student.class?.name} {student.class?.section}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">
                          ₹{student.balance?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(student.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {overdueStudents.length > 5 && (
            <div className="p-3 bg-gray-50 border-t text-center">
              <button
                onClick={() => navigate('/admin/fees/overdue')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All ({overdueStudents.length})
              </button>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 p-4">
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <FaCheckCircle /> Recent Payments
            </h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent payments</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {payment.student?.firstName} {payment.student?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt: {payment.receiptNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold">
                          ₹{payment.totalAmount?.toLocaleString()}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {payment.paymentMode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {recentPayments.length > 0 && (
            <div className="p-3 bg-gray-50 border-t text-center">
              <button
                onClick={() => navigate('/admin/fees/payments')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Payments
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/fees/templates')}
            className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            <FaPlus className="text-3xl text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Fee Templates</p>
          </button>
          <button
            onClick={() => navigate('/admin/fees/students')}
            className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center"
          >
            <FaUsers className="text-3xl text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Student Fees</p>
          </button>
          <button
            onClick={() => navigate('/admin/fees/reports')}
            className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-center"
          >
            <FaChartLine className="text-3xl text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Reports</p>
          </button>
          <button
            onClick={() => navigate('/admin/fees/defaulters')}
            className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center"
          >
            <FaExclamationTriangle className="text-3xl text-red-600 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Defaulters</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeDashboard;
