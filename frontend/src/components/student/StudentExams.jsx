import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaClipboardCheck, FaClock, FaAward, FaCalendar } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentExams = () => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const [upcomingRes, resultsRes] = await Promise.all([
        axios.get(`${API_URL}/exams`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/exams/student/${user.studentId}/results`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Filter upcoming exams
      const upcoming = upcomingRes.data.data.filter(
        (exam) => new Date(exam.examDate) >= new Date() && exam.isPublished
      );

      setUpcomingExams(upcoming || []);
      setResults(resultsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">My Exams & Results</h1>
        <p className="text-gray-600">View upcoming exams and your results</p>
      </div>

      {/* Upcoming Exams */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaCalendar className="text-blue-600" /> Upcoming Exams
        </h2>

        {upcomingExams.length === 0 ? (
          <p className="text-gray-500">No upcoming exams</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.map((exam) => (
              <motion.div
                key={exam._id}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md"
              >
                <h3 className="text-xl font-bold mb-2">{exam.name}</h3>
                <p className="text-gray-700 mb-4">{exam.subject}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-blue-600" />
                    <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-600" />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClipboardCheck className="text-blue-600" />
                    <span>Total Marks: {exam.totalMarks}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaAward className="text-green-600" /> My Results
        </h2>

        {results.length === 0 ? (
          <p className="text-gray-500">No results published yet</p>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Exam</th>
                  <th className="p-4 text-left">Subject</th>
                  <th className="p-4 text-left">Marks</th>
                  <th className="p-4 text-left">Percentage</th>
                  <th className="p-4 text-left">Grade</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      {result.exam?.name}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(result.exam?.examDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">{result.exam?.subject}</td>
                    <td className="p-4 font-semibold">
                      {result.marksObtained}/{result.exam?.totalMarks}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      {result.percentage}%
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          result.grade === 'A+' || result.grade === 'A'
                            ? 'bg-green-100 text-green-700'
                            : result.grade === 'B+' || result.grade === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : result.grade === 'F'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          result.status === 'pass'
                            ? 'bg-green-100 text-green-700'
                            : result.status === 'fail'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {result.status}
                      </span>
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

export default StudentExams;
