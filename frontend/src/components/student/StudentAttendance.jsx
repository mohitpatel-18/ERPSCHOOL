import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { studentService } from "../../services/studentService";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await studentService.getAttendance();
      setAttendance(res.data.data || []);
    } catch (err) {
      console.error("Attendance fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendance.filter(
    (a) => a.status === "present"
  ).length;

  const absentCount = attendance.filter(
    (a) => a.status === "absent"
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Attendance Overview 📅
        </h1>
        <p className="text-gray-600">
          Track your attendance performance
        </p>
      </motion.div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6 shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">
                {presentCount}
              </p>
            </div>
            <FaCheckCircle className="text-4xl text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {absentCount}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-red-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 shadow-md">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">
                {attendance.length}
              </p>
            </div>
            <FaCalendarAlt className="text-4xl text-blue-600" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          Detailed Attendance
        </h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No attendance records found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === "present"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
