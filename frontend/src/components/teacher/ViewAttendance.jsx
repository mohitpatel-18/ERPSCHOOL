import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  'half-day': 'bg-blue-100 text-blue-700',
};

const ViewAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    classService
      .getAllClasses()
      .then(res => setClasses(res.data.data || []))
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  /* ================= FETCH ATTENDANCE ================= */
  const fetchAttendance = async () => {
    if (!selectedClass || !startDate || !endDate) {
      toast.error('Select class and date range');
      return;
    }

    setLoading(true);
    try {
      const res = await teacherService.getAttendanceByClass(
        selectedClass,
        { startDate, endDate }
      );

      const processed = res.data.data.map(record => {
        const diffHours =
          (Date.now() - new Date(record.date)) / (1000 * 60 * 60);

        return {
          ...record,
          locked: diffHours > 24,
        };
      });

      setAttendance(processed);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ATTENDANCE ================= */
  const updateAttendance = async (id, status) => {
    const reason = prompt('Reason for changing attendance?');
    if (!reason) return toast.error('Reason is mandatory');

    try {
      await teacherService.updateAttendance(id, {
        status,
        reason,
      });
      toast.success('Attendance updated');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      {/* HEADER */}
      <motion.div className="mb-8">
        <h1 className="text-4xl font-bold">View Attendance</h1>
        <p className="text-gray-600">
          Attendance history with lock & status badges
        </p>
      </motion.div>

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-4">
        <select
          className="input-field"
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input-field"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="input-field"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <button
          onClick={fetchAttendance}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Attendance'}
        </button>
      </div>

      {/* TABLE */}
      {attendance.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs">Date</th>
                <th className="p-3 text-left text-xs">Student</th>
                <th className="p-3 text-left text-xs">Roll</th>
                <th className="p-3 text-center text-xs">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map(a => (
                <tr key={a._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(a.date).toLocaleDateString()}
                  </td>

                  <td className="p-3 font-medium">
                    {a.student?.userId?.name}
                  </td>

                  <td className="p-3">{a.student?.rollNumber}</td>

                  <td className="p-3 text-center">
                    {a.locked ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status]}`}
                      >
                        🔒 {a.status}
                      </span>
                    ) : (
                      <select
                        value={a.status}
                        onChange={e =>
                          updateAttendance(a._id, e.target.value)
                        }
                        className="border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;
