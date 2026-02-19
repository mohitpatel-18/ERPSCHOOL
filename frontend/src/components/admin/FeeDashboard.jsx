import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import {
  FaMoneyBillWave,
  FaExclamationCircle,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const FeeDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, trendRes, recentRes] = await Promise.all([
        adminService.getFeeSummary(),
        adminService.getCollectionTrend(),
        adminService.getRecentPayments(),
      ]);

      setSummary(summaryRes.data.data);
      setTrend(trendRes.data.data);
      setRecentPayments(recentRes.data.data);
    } catch (err) {
      console.error("Fee dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Collection",
      value: `₹ ${summary?.totalCollection || 0}`,
      icon: <FaMoneyBillWave />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Pending Amount",
      value: `₹ ${summary?.totalPending || 0}`,
      icon: <FaExclamationCircle />,
      bg: "bg-red-50",
      color: "text-red-600",
    },
    {
      title: "Paid Students",
      value: summary?.paidStudents || 0,
      icon: <FaCheckCircle />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-2">Fee Dashboard</h1>
        <p className="text-gray-600">
          Monitor revenue, collections & pending dues in real-time.
        </p>
      </motion.div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {kpis.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4 }}
            className={`${item.bg} p-6 rounded-xl shadow-md`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{item.title}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
              <div className={`text-3xl ${item.color}`}>{item.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* COLLECTION TREND */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaChartLine /> Monthly Collection Trend
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT PAYMENTS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Payments</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {p.student?.userId?.name || "N/A"}
                  </td>
                  <td className="p-3 font-semibold text-green-600">
                    ₹ {p.amount}
                  </td>
                  <td className="p-3 capitalize">{p.method}</td>
                  <td className="p-3">
                    {new Date(p.paidAt).toLocaleDateString()}
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

export default FeeDashboard;
