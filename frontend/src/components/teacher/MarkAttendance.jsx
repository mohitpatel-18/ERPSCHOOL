import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['present', 'absent', 'half-day', 'late'];

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    classService
      .getAllClasses()
      .then(res => setClasses(res.data.data || []))
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async classId => {
    try {
      const res = await teacherService.getStudentsByClass(classId);
      setStudents(res.data.data || []);

      const draft = JSON.parse(
        localStorage.getItem(`attendance-${classId}-${date}`)
      );

      const initial = {};
      res.data.data.forEach(s => {
        initial[s._id] = draft?.[s._id] || 'present';
      });

      setAttendance(initial);
    } catch {
      toast.error('Failed to load students');
    }
  };

  /* ================= CLASS CHANGE ================= */
  const handleClassChange = id => {
    setSelectedClass(id);
    setStudents([]);
    setAttendance({});
    if (id) fetchStudents(id);
  };

  /* ================= STATUS CHANGE ================= */
  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => {
      const updated = { ...prev, [studentId]: status };
      localStorage.setItem(
        `attendance-${selectedClass}-${date}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  /* ================= MARK ALL PRESENT ================= */
  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => (updated[s._id] = 'present'));
    setAttendance(updated);
    toast.success('All marked present');
  };

  /* ================= VALIDATION ================= */
  const isFutureDate = date > today;

  const allMarked =
    students.length > 0 &&
    students.every(s => attendance[s._id]);

  const statusBadge = useMemo(() => {
    if (!students.length) return null;
    if (allMarked) return '🟢 Completed';
    return '🟡 Partial';
  }, [students, attendance]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async e => {
    e.preventDefault();

    if (isFutureDate) {
      toast.error('Future date attendance not allowed');
      return;
    }

    if (!allMarked) {
      toast.error('Please mark all students');
      return;
    }

    if (!window.confirm('Submit attendance for this class?')) return;

    setLoading(true);

    try {
      const attendanceData = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id],
      }));

      await teacherService.markAttendance({
        classId: selectedClass,
        date,
        attendanceData,
      });

      localStorage.removeItem(`attendance-${selectedClass}-${date}`);
      toast.success('Attendance submitted successfully');

      setSelectedClass('');
      setStudents([]);
      setAttendance({});
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Attendance submission failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mark Attendance</h1>
        <p className="text-gray-600">
          Select class and mark student attendance
        </p>
      </motion.div>

      <div className="bg-white rounded-xl shadow-md p-8">
        {/* FILTERS */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <select
            value={selectedClass}
            onChange={e => handleClassChange(e.target.value)}
            className="input-field"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.name} {cls.section}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            className="input-field"
          />

          {students.length > 0 && (
            <button
              type="button"
              onClick={markAllPresent}
              className="btn-secondary"
            >
              Mark All Present
            </button>
          )}
        </div>

        {statusBadge && (
          <p className="mb-4 font-medium text-sm">
            Attendance Status: {statusBadge}
          </p>
        )}

        {/* TABLE */}
        {students.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="p-3">Roll</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(stu => (
                    <tr key={stu._id} className="border-b">
                      <td className="p-3">{stu.rollNumber}</td>
                      <td className="p-3">{stu.userId?.name}</td>
                      <td className="p-3">
                        <div className="flex gap-4">
                          {STATUS_OPTIONS.map(s => (
                            <label key={s} className="flex gap-1 text-sm">
                              <input
                                type="radio"
                                name={`att-${stu._id}`}
                                checked={attendance[stu._id] === s}
                                onChange={() =>
                                  handleStatusChange(stu._id, s)
                                }
                              />
                              <span className="capitalize">{s}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </form>
        )}

        {!students.length && selectedClass && (
          <p className="text-center text-gray-500 py-10">
            No students found for this class
          </p>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
