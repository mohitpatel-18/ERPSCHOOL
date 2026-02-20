import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { toast } from 'react-hot-toast';
import { FaTrophy, FaCalendarAlt, FaChartLine, FaAward, FaBook } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ExamResults = () => {
  const [examsData, setExamsData] = useState({
    upcomingExams: [],
    pastExams: [],
    results: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data } = await studentService.getExams();
      setExamsData(data.data || { upcomingExams: [], pastExams: [], results: [] });
    } catch (error) {
      toast.error('Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(2);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const calculateStats = () => {
    if (examsData.results.length === 0) return { avg: 0, highest: 0, lowest: 0, total: 0 };

    const percentages = examsData.results.map(r => 
      parseFloat(calculatePercentage(r.marksObtained, r.exam?.totalMarks || 100))
    );

    return {
      avg: (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2),
      highest: Math.max(...percentages).toFixed(2),
      lowest: Math.min(...percentages).toFixed(2),
      total: examsData.results.length,
    };
  };

  const stats = calculateStats();

  // Chart data
  const chartData = {
    labels: examsData.results.slice(0, 10).reverse().map(r => r.exam?.name || 'Exam'),
    datasets: [
      {
        label: 'Percentage',
        data: examsData.results.slice(0, 10).reverse().map(r => 
          calculatePercentage(r.marksObtained, r.exam?.totalMarks || 100)
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Performance Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Exams & Results</h1>
        <p className="text-gray-600 mt-1">Track your exam schedule and view your results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Average %</p>
              <p className="text-3xl font-bold mt-2">{stats.avg}%</p>
            </div>
            <FaChartLine className="text-4xl text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Highest %</p>
              <p className="text-3xl font-bold mt-2">{stats.highest}%</p>
            </div>
            <FaTrophy className="text-4xl text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Lowest %</p>
              <p className="text-3xl font-bold mt-2">{stats.lowest}%</p>
            </div>
            <FaAward className="text-4xl text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Exams</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FaBook className="text-4xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {['results', 'upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading exam data...</p>
        </div>
      ) : (
        <>
          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Performance Chart */}
              {examsData.results.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Trend</h2>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}

              {/* Results List */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-800">My Results</h2>
                </div>
                {examsData.results.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No results available yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exam Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examsData.results.map((result) => {
                          const percentage = calculatePercentage(result.marksObtained, result.exam?.totalMarks || 100);
                          const gradeInfo = getGrade(parseFloat(percentage));
                          return (
                            <tr key={result._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{result.exam?.name || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                                  {result.exam?.type || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {result.marksObtained} / {result.exam?.totalMarks || 100}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{percentage}%</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-lg font-bold ${gradeInfo.color}`}>
                                  {gradeInfo.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Exams Tab */}
          {activeTab === 'upcoming' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Exams</h2>
              </div>
              {examsData.upcomingExams.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No upcoming exams scheduled</p>
                </div>
              ) : (
                <div className="divide-y">
                  {examsData.upcomingExams.map((exam) => (
                    <div key={exam._id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{exam.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 capitalize">{exam.type} Exam</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{new Date(exam.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Total Marks: {exam.totalMarks}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Past Exams Tab */}
          {activeTab === 'past' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Past Exams</h2>
              </div>
              {examsData.pastExams.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No past exams</p>
                </div>
              ) : (
                <div className="divide-y">
                  {examsData.pastExams.map((exam) => (
                    <div key={exam._id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{exam.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 capitalize">{exam.type} Exam</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>{new Date(exam.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            Total Marks: {exam.totalMarks}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamResults;
