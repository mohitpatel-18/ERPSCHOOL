import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { classService } from '../../services/classService';
import DataTable from '../../common/DataTable';
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editData, setEditData] = useState({
    phone: '',
    classes: [],
    status: 'active',
  });

  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchTeachers(), fetchClasses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchTeachers = async () => {
    const res = await adminService.getAllTeachers();
    setTeachers(res.data.data || []);
  };

  const fetchClasses = async () => {
    const res = await classService.getAllClasses();
    setClasses(res.data.data || []);
  };

  const handleEdit = teacher => {
    setSelectedTeacher(teacher);
    setEditData({
      phone: teacher.userId?.phone || '',
      classes: teacher.assignedClasses?.map(c => c._id) || [],
      status: teacher.status,
    });
  };

  const handleDelete = async teacher => {
    if (!window.confirm(`Delete ${teacher.userId?.name}?`)) return;
    await adminService.deleteTeacher(teacher._id);
    toast.success('Teacher deleted');
    fetchTeachers();
  };

  const handleUpdate = async () => {
    await adminService.updateTeacher(selectedTeacher._id, editData);
    toast.success('Teacher updated');
    setSelectedTeacher(null);
    fetchTeachers();
  };

  const toggleClass = id => {
    setEditData(prev => ({
      ...prev,
      classes: prev.classes.includes(id)
        ? prev.classes.filter(c => c !== id)
        : [...prev.classes, id],
    }));
  };

  const columns = useMemo(() => [
    { header: 'Employee ID', accessor: 'employeeId' },
    { header: 'Name', render: r => r.userId?.name },
    { header: 'Email', render: r => r.userId?.email },
    { header: 'Phone', render: r => r.userId?.phone || '-' },
    {
      header: 'Assigned Classes',
      render: r =>
        r.assignedClasses?.length
          ? r.assignedClasses.map(c => `${c.name} ${c.section}`).join(', ')
          : 'Not Assigned',
    },
    {
      header: 'Status',
      render: r => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            r.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: r => (
        <div className="flex gap-3">
          <button onClick={() => handleEdit(r)} className="text-blue-600 text-sm">
            Edit
          </button>
          <button onClick={() => handleDelete(r)} className="text-red-600 text-sm">
            Delete
          </button>
        </div>
      ),
    },
  ], []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Teachers</h1>
        <p className="text-gray-600">Assign classes, update status & manage teachers</p>
      </motion.div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <DataTable columns={columns} data={teachers} />
      </div>

      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-6">
              Edit Teacher – {selectedTeacher.userId?.name}
            </h2>

            <input
              className="input-field mb-4"
              value={editData.phone}
              onChange={e => setEditData({ ...editData, phone: e.target.value })}
            />

            <div className="mb-4">
              <div
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                className="input-field cursor-pointer flex flex-wrap gap-2"
              >
                {editData.classes.length === 0 && (
                  <span className="text-gray-400">Select classes</span>
                )}
                {editData.classes.map(id => {
                  const cls = classes.find(c => c._id === id);
                  return (
                    <span key={id} className="bg-blue-100 px-2 py-1 rounded text-xs">
                      {cls?.name} {cls?.section}
                    </span>
                  );
                })}
              </div>

              {classDropdownOpen && (
                <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                  {classes.map(cls => (
                    <label key={cls._id} className="flex gap-2 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={editData.classes.includes(cls._id)}
                        onChange={() => toggleClass(cls._id)}
                      />
                      {cls.name} {cls.section}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <select
              className="input-field mb-6"
              value={editData.status}
              onChange={e => setEditData({ ...editData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedTeacher(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
