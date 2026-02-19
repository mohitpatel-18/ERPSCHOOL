import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { classService } from '../../services/classService';
import DataTable from '../../common/DataTable'; // ✅ FIXED PATH
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAllClasses();
      setClasses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async (classId = '') => {
    try {
      const response = await adminService.getAllStudents({ classId });
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleClassFilter = (classId) => {
    setSelectedClass(classId);
    fetchStudents(classId);
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.userId?.name}?`)) {
      try {
        await adminService.deleteStudent(student._id);
        toast.success('Student deleted successfully');
        fetchStudents(selectedClass);
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const columns = [
    {
      header: 'Student ID',
      accessor: 'studentId',
    },
    {
      header: 'Roll No',
      accessor: 'rollNumber',
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => row.userId?.name,
    },
    {
      header: 'Class',
      accessor: 'class',
      render: (row) => `${row.class?.name} ${row.class?.section}`,
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => row.userId?.email,
    },
    {
      header: 'Parent Phone',
      accessor: 'parentPhone',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Students</h1>
        <p className="text-gray-600">View and manage all students in the system</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Total Students: {students.length}
          </h2>

          <div className="w-64">
            <select
              value={selectedClass}
              onChange={(e) => handleClassFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={students}
          onDelete={handleDelete}
        />
      </motion.div>
    </div>
  );
};

export default ManageStudents;
