import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import toast from 'react-hot-toast';

const MyStudents = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    classService
      .getAllClasses()
      .then(res => setClasses(res.data.data || []))
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async classId => {
    setLoading(true);
    try {
      const res = await teacherService.getStudentsByClass(classId);
      setStudents(res.data.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      `${s.userId?.name} ${s.rollNumber}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  /* ================= ATTENDANCE STATUS ================= */
  const getStatus = percent => {
    if (percent >= 75) return '🟢 Regular';
    if (percent >= 60) return '🟡 Watchlist';
    return '🔴 At Risk';
  };

  return (
    <div>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Students</h1>
        <p className="text-gray-600">
          View students and attendance insights
        </p>
      </motion.div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col md:flex-row gap-4">
        <select
          value={selectedClass}
          onChange={e => {
            setSelectedClass(e.target.value);
            fetchStudents(e.target.value);
          }}
          className="input-field md:w-64"
        >
          <option value="">Select Class</option>
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>
              {cls.name} {cls.section}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by name or roll"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field md:flex-1"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase">Roll</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Attendance %</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(stu => (
                  <tr key={stu._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{stu.rollNumber}</td>
                    <td className="px-6 py-4 font-medium">
                      {stu.userId?.name}
                    </td>
                    <td className="px-6 py-4">
                      {stu.attendancePercentage ?? '--'}%
                    </td>
                    <td className="px-6 py-4">
                      {getStatus(stu.attendancePercentage || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setActiveStudent(stu)}
                        className="text-primary-600 text-sm hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            No students found
          </p>
        )}
      </div>

      {/* STUDENT QUICK VIEW DRAWER */}
      <AnimatePresence>
        {activeStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStudent(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">
                {activeStudent.userId?.name}
              </h2>

              <div className="space-y-3 text-sm">
                <p><b>Roll:</b> {activeStudent.rollNumber}</p>
                <p><b>Class:</b> {activeStudent.class?.name} {activeStudent.class?.section}</p>
                <p><b>Attendance %:</b> {activeStudent.attendancePercentage ?? '--'}%</p>
                <p><b>Status:</b> {getStatus(activeStudent.attendancePercentage || 0)}</p>
                <p><b>Parent Phone:</b> {activeStudent.parentPhone || '--'}</p>
              </div>

              <button
                onClick={() => setActiveStudent(null)}
                className="btn-primary w-full mt-6"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyStudents;
