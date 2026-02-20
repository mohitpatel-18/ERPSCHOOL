import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBook, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentHomework = () => {
  const [pendingHomework, setPendingHomework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const [pendingRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/homework/student/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/homework/student/${user.studentId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPendingHomework(pendingRes.data.data || []);
      setSubmissions(submissionsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch homework');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/homework/${selectedHomework._id}/submit`,
        { submissionText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Homework submitted successfully');
      setShowModal(false);
      setSubmissionText('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit homework');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Homework</h1>
        <p className="text-gray-600">View and submit homework assignments</p>
      </div>

      {/* Pending Homework */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaClock className="text-orange-600" /> Pending Homework
        </h2>

        {pendingHomework.length === 0 ? (
          <p className="text-gray-500">No pending homework 🎉</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingHomework.map((hw) => (
              <motion.div
                key={hw._id}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500"
              >
                <h3 className="text-xl font-bold mb-2">{hw.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{hw.subject}</p>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{hw.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className={`font-semibold ${new Date(hw.dueDate) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                      {new Date(hw.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Marks:</span>
                    <span className="font-semibold">{hw.maxMarks}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedHomework(hw);
                    setShowModal(true);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit Homework
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Homework */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" /> Submitted Homework
        </h2>

        {submissions.length === 0 ? (
          <p className="text-gray-500">No submissions yet</p>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Subject</th>
                  <th className="p-4 text-left">Submitted On</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Marks</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-semibold">{sub.homework?.title}</td>
                    <td className="p-4">{sub.homework?.subject}</td>
                    <td className="p-4 text-sm">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          sub.status === 'graded'
                            ? 'bg-green-100 text-green-700'
                            : sub.status === 'late'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      {sub.marksObtained !== undefined
                        ? `${sub.marksObtained}/${sub.homework?.maxMarks}`
                        : 'Not graded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showModal && selectedHomework && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Submit Homework</h2>
              <p className="text-gray-600">{selectedHomework.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Description:</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedHomework.description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Your Answer *</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="6"
                  placeholder="Write your answer here..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSubmissionText('');
                  }}
                  className="flex-1 border px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                >
                  Submit Homework
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
