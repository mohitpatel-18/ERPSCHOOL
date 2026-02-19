import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import { classService } from '../../services/classService';
import toast from 'react-hot-toast';

const AddTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subjects: '',
    classes: [], // ✅ ALWAYS ARRAY (FIXED)
  });

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await classService.getAllClasses();
        setClasses(res.data.data || []);
      } catch {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        subjects: formData.subjects
          ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };

      const res = await adminService.addTeacher(payload);

      toast.success('Teacher added successfully!');
      setCredentials(res.data.data.credentials);

      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        subjects: '',
        classes: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUCCESS SCREEN ================= */
  if (credentials) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Teacher Added Successfully!
        </h2>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Login Credentials</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-mono font-semibold text-gray-900">{credentials.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-mono font-semibold text-gray-900">{credentials.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Temporary Password</p>
              <p className="font-mono font-semibold text-gray-900">
                {credentials.temporaryPassword}
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => setCredentials(null)} className="btn-primary">
          Add Another Teacher
        </button>
      </motion.div>
    );
  }

  /* ================= FORM ================= */
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Teacher</h1>
        <p className="text-gray-600">Fill in the details to add a new teacher to the system</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-8 max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                className="input-field"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                className="input-field"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                pattern="[0-9]{10}"
                required
              />
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select
                className="input-field"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                <option>Science</option>
                <option>Mathematics</option>
                <option>English</option>
                <option>Social Studies</option>
                <option>Hindi</option>
                <option>Computer Science</option>
                <option>Physical Education</option>
              </select>
            </div>

            {/* ASSIGNED CLASS (UI SAME, LOGIC FIXED) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Class *
              </label>
              <select
                value={formData.classes[0] || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    classes: e.target.value ? [e.target.value] : [],
                  })
                }
                className="input-field"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.section}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJECTS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects (comma-separated)
              </label>
              <input
                className="input-field"
                value={formData.subjects}
                onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                placeholder="e.g., Physics, Chemistry"
              />
            </div>

          </div>

          <div className="flex space-x-4">
            <button disabled={loading} className="btn-primary flex-1">
              {loading ? 'Adding Teacher...' : 'Add Teacher'}
            </button>
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() =>
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  department: '',
                  subjects: '',
                  classes: [],
                })
              }
            >
              Reset Form
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTeacher;
