import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheckCircle } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    examType: 'unit-test',
    class: '',
    subject: '',
    totalMarks: 100,
    passingMarks: 40,
    examDate: '',
    duration: 60,
    syllabus: '',
    instructions: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [examsRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/exams`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/class/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExams(examsRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const payload = {
        ...formData,
        academicYear: '6766fbba123456789abcdef0', // Get from active academic year
      };

      if (selectedExam) {
        await axios.put(`${API_URL}/exams/${selectedExam._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Exam updated successfully');
      } else {
        await axios.post(`${API_URL}/exams`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Exam created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const publishExam = async (examId) => {
    if (!window.confirm('Publish this exam? Students will be notified.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/exams/${examId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Exam published and students notified');
      fetchData();
    } catch (error) {
      toast.error('Failed to publish exam');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      examType: 'unit-test',
      class: '',
      subject: '',
      totalMarks: 100,
      passingMarks: 40,
      examDate: '',
      duration: 60,
      syllabus: '',
      instructions: '',
    });
    setSelectedExam(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-gray-600">Create and manage exams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlus /> Create Exam
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <motion.div
            key={exam._id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{exam.name}</h3>
                <p className="text-sm text-gray-600">{exam.subject}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  exam.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {exam.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-semibold">
                  {exam.class?.name} - {exam.class?.section}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(exam.examDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-semibold">{exam.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{exam.duration} min</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {!exam.isPublished && (
                <button
                  onClick={() => publishExam(exam._id)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Publish
                </button>
              )}
              <button
                onClick={() => window.location.href = `/teacher/exam/${exam._id}/marks`}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Enter Marks
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {selectedExam ? 'Edit Exam' : 'Create Exam'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Exam Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Exam Type *</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="unit-test">Unit Test</option>
                    <option value="mid-term">Mid-Term</option>
                    <option value="final">Final</option>
                    <option value="practical">Practical</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Total Marks *</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Passing Marks *</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Exam Date *</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Syllabus</label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 border px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : selectedExam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
