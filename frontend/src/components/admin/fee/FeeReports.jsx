import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaDownload, FaFilter, FaChartBar } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FeeReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: '',
    class: '',
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.class) params.append('class', filters.class);

      const response = await axios.get(
        `${API_URL}/fees/reports/full?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport(response.data.data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const classWiseData = {
    labels: report?.classWise?.map(c => c.className) || [],
    datasets: [
      {
        label: 'Collected',
        data: report?.classWise?.map(c => c.totalCollected) || [],
        backgroundColor: '#10b981',
      },
      {
        label: 'Pending',
        data: report?.classWise?.map(c => c.totalPending) || [],
        backgroundColor: '#ef4444',
      },
    ],
  };

  const paymentModeData = {
    labels: report?.paymentModeWise?.map(p => p._id) || [],
    datasets: [
      {
        data: report?.paymentModeWise?.map(p => p.totalAmount) || [],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      },
    ],
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fee Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive fee collection analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <p className="text-gray-600 text-sm">Total Collection</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ₹{report?.summary?.totalCollected?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl">
          <p className="text-gray-600 text-sm">Total Pending</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ₹{report?.summary?.totalPending?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl">
          <p className="text-gray-600 text-sm">Overdue Students</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {report?.overdueStudents || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl">
          <p className="text-gray-600 text-sm">Collection Rate</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {report?.summary?.collectionPercentage || 0}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Class-wise Collection</h3>
          <Bar data={classWiseData} options={{ responsive: true }} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Mode Distribution</h3>
          <Doughnut data={paymentModeData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Class-wise Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-xl font-bold">Class-wise Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report?.classWise?.map((cls, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{cls.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cls.totalStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{cls.totalFee?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    ₹{cls.totalCollected?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                    ₹{cls.totalPending?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {((cls.totalCollected / cls.totalFee) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeReports;
