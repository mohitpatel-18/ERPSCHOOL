import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { classService } from '../../services/classService';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('students');

  /* ================= ADD CLASS STATE ================= */
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
  });

  /* ================= EDIT CLASS STATE ================= */
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
  });

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getAllClasses();
      setClasses(res.data?.data || []);
    } catch {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  /* ================= OPEN CLASS ================= */
  const openClassDetails = async (cls) => {
    setSelectedClass(cls);
    setActiveTab('students');

    setFormData({
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
    });

    try {
      const res = await adminService.getAllStudents({ classId: cls._id });
      setStudents(res.data?.data || []);
    } catch {
      setStudents([]);
    }
  };

  /* ================= ADD CLASS ================= */
  const handleAddClass = async () => {
    if (
      !addFormData.name ||
      !addFormData.section ||
      !addFormData.academicYear
    ) {
      toast.error('All fields are required');
      return;
    }

    try {
      await classService.createClass(addFormData);
      toast.success('Class added successfully');
      setShowAddModal(false);
      setAddFormData({ name: '', section: '', academicYear: '' });
      fetchClasses();
    } catch {
      toast.error('Failed to add class');
    }
  };

  /* ================= UPDATE CLASS ================= */
  const handleUpdate = async () => {
    try {
      await classService.updateClass(selectedClass._id, formData);
      toast.success('Class updated successfully');
      setSelectedClass(null);
      fetchClasses();
    } catch {
      toast.error('Update failed');
    }
  };

  /* ================= DELETE CLASS ================= */
  const handleDelete = async () => {
    if (!window.confirm('Delete this class permanently?')) return;

    try {
      await classService.deleteClass(selectedClass._id);
      toast.success('Class deleted');
      setSelectedClass(null);
      fetchClasses();
    } catch {
      toast.error('Delete failed');
    }
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Classes</h1>
          <p className="text-gray-600">View and manage all classes</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add New Class
        </button>
      </motion.div>

      {/* CLASS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls._id}
            onClick={() => openClassDetails(cls)}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold">
              {cls.name} {cls.section}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Academic Year: {cls.academicYear}
            </p>

            <div className="flex justify-between mt-4 border-t pt-3">
              <span className="text-sm text-gray-600">Total Students</span>
              <span className="font-semibold">{cls.strength || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD CLASS MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Class</h2>

            <div className="space-y-4">
              <input
                className="input-field"
                placeholder="Class Name (e.g. 10)"
                value={addFormData.name}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, name: e.target.value })
                }
              />
              <input
                className="input-field"
                placeholder="Section (e.g. A)"
                value={addFormData.section}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, section: e.target.value })
                }
              />
              <input
                className="input-field"
                placeholder="Academic Year (e.g. 2025-2026)"
                value={addFormData.academicYear}
                onChange={(e) =>
                  setAddFormData({
                    ...addFormData,
                    academicYear: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddClass} className="btn-primary">
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CLASS DETAILS MODAL ================= */}
      {selectedClass && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedClass(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-4xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedClass.name} {selectedClass.section}
            </h2>

            {/* TABS */}
            <div className="flex gap-6 border-b mb-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`pb-2 ${
                  activeTab === 'students'
                    ? 'border-b-2 border-primary-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                Students
              </button>

              <button
                onClick={() => setActiveTab('edit')}
                className={`pb-2 ${
                  activeTab === 'edit'
                    ? 'border-b-2 border-primary-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                Edit Class
              </button>
            </div>

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="max-h-[420px] overflow-y-auto space-y-4">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No students found in this class
                  </p>
                ) : (
                  students.map((stu) => (
                    <div
                      key={stu._id}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <h4 className="font-semibold">
                        {stu.userId?.name || '—'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {stu.userId?.email || '—'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EDIT TAB */}
            {activeTab === 'edit' && (
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  className="input-field"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Class Name"
                />
                <input
                  className="input-field"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  placeholder="Section"
                />
                <input
                  className="input-field"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicYear: e.target.value,
                    })
                  }
                  placeholder="Academic Year"
                />
              </div>
            )}

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handleDelete}
                className="text-red-600 flex items-center gap-2"
              >
                <FaTrash /> Delete Class
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="btn-secondary"
                >
                  Close
                </button>

                {activeTab === 'edit' && (
                  <button onClick={handleUpdate} className="btn-primary">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;
