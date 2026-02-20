import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaUsers,
  FaUserGraduate,
  FaChartLine,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaEye,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrophy,
  FaExclamationTriangle,
  FaTrash,
  FaChalkboardTeacher,
} from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    classTeacher: '',
    room: '',
    academicYear: new Date().getFullYear(),
    subjects: []
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchClassDetails(selectedClass._id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedClass(response.data.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch students, attendance stats, fee stats
      const [studentsRes, attendanceRes, feeRes] = await Promise.all([
        axios.get(`${API_URL}/admin/students?classId=${classId}`, { headers }),
        axios.get(`${API_URL}/attendance?classId=${classId}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/fees/student-fees?class=${classId}`, { headers }).catch(() => ({ data: { data: [] } })),
      ]);

      const studentData = studentsRes.data.data || [];
      setStudents(studentData);

      // Calculate stats
      const totalStudents = studentData.length;
      const activeStudents = studentData.filter(s => s.isActive).length;
      const maleStudents = studentData.filter(s => s.gender === 'male').length;
      const femaleStudents = studentData.filter(s => s.gender === 'female').length;

      // Fee stats
      const feeData = feeRes.data.data || [];
      const totalFee = feeData.reduce((sum, f) => sum + (f.netFeeAmount || 0), 0);
      const collectedFee = feeData.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
      const pendingFee = feeData.reduce((sum, f) => sum + (f.balance || 0), 0);
      const paidStudents = feeData.filter(f => f.overallStatus === 'Paid').length;
      const overdueStudents = feeData.filter(f => f.overallStatus === 'Overdue').length;

      // Attendance stats (simplified)
      const attendanceRecords = attendanceRes.data.data || [];
      const avgAttendance = attendanceRecords.length > 0
        ? (attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length * 100).toFixed(2)
        : 0;

      setClassStats({
        totalStudents,
        activeStudents,
        maleStudents,
        femaleStudents,
        totalFee,
        collectedFee,
        pendingFee,
        paidStudents,
        overdueStudents,
        avgAttendance,
        feeCollectionRate: totalFee > 0 ? ((collectedFee / totalFee) * 100).toFixed(2) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch class details:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/class`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Class created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/class/${selectedClass._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Class updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update class');
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm('⚠️ Are you sure? This will delete the class if no students are enrolled.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/class/${selectedClass._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Class deleted successfully!');
      fetchClasses();
      setSelectedClass(classes.length > 1 ? classes.filter(c => c._id !== selectedClass._id)[0] : null);
    } catch (error) {
      toast.error(error.response?.data?.message || '❌ Cannot delete class with active students');
    }
  };

  const openEditModal = () => {
    setFormData({
      name: selectedClass.name,
      section: selectedClass.section,
      classTeacher: selectedClass.classTeacher?._id || '',
      room: selectedClass.room || '',
      academicYear: selectedClass.academicYear || new Date().getFullYear(),
      subjects: selectedClass.subjects || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      classTeacher: '',
      room: '',
      academicYear: new Date().getFullYear(),
      subjects: []
    });
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const rollNumber = student.rollNumber ? String(student.rollNumber).toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || rollNumber.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Class Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive class overview and student management</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Create Class
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h3 className="text-xl font-bold">All Classes</h3>
              <p className="text-sm text-blue-100">{classes.length} classes</p>
            </div>
            <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                    selectedClass?._id === cls._id
                      ? 'bg-blue-50 border-blue-600 shadow-md'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <h4 className="font-bold text-gray-800">
                    {cls.name} {cls.section}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Teacher: {cls.classTeacher?.userId?.name || 'Not assigned'}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <FaUserGraduate className="text-blue-600" />
                    <span className="font-medium">{cls.students?.length || 0} students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedClass && classStats && (
            <>
              {/* Class Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold">
                      Class {selectedClass.name} {selectedClass.section}
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Class Teacher: {selectedClass.classTeacher?.userId?.name || 'Not Assigned'}
                    </p>
                    <p className="text-blue-100">Room: {selectedClass.room || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={openEditModal}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                    >
                      <FaEdit className="inline mr-2" />
                      Edit
                    </button>
                    <button 
                      onClick={handleDeleteClass}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <FaTrash className="inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                  <FaUsers className="text-3xl mb-2 opacity-80" />
                  <p className="text-sm opacity-90">Total Students</p>
                  <p className="text-3xl font-bold">{classStats.totalStudents}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                  <FaClipboardCheck className="text-3xl mb-2 opacity-80" />
                  <p className="text-sm opacity-90">Avg Attendance</p>
                  <p className="text-3xl font-bold">{classStats.avgAttendance}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                  <FaMoneyBillWave className="text-3xl mb-2 opacity-80" />
                  <p className="text-sm opacity-90">Fee Collection</p>
                  <p className="text-3xl font-bold">{classStats.feeCollectionRate}%</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
                  <FaTrophy className="text-3xl mb-2 opacity-80" />
                  <p className="text-sm opacity-90">Active Students</p>
                  <p className="text-3xl font-bold">{classStats.activeStudents}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {['overview', 'students', 'attendance', 'fees', 'performance'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gender Distribution */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Gender Distribution</h3>
                    <Doughnut
                      data={{
                        labels: ['Male', 'Female'],
                        datasets: [{
                          data: [classStats.maleStudents, classStats.femaleStudents],
                          backgroundColor: ['#3b82f6', '#ec4899'],
                        }],
                      }}
                    />
                  </div>

                  {/* Fee Status */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Fee Collection Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-700">Collected</span>
                        <span className="text-xl font-bold text-green-600">
                          ₹{classStats.collectedFee?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-gray-700">Pending</span>
                        <span className="text-xl font-bold text-red-600">
                          ₹{classStats.pendingFee?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700">Paid Students</span>
                        <span className="text-xl font-bold text-blue-600">
                          {classStats.paidStudents}/{classStats.totalStudents}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700">Overdue</span>
                        <span className="text-xl font-bold text-yellow-600">
                          {classStats.overdueStudents} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Class Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
                        <p className="text-sm text-gray-600">Total Students</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{classStats.activeStudents}</p>
                        <p className="text-sm text-gray-600">Active</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{classStats.maleStudents}</p>
                        <p className="text-sm text-gray-600">Male</p>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <p className="text-2xl font-bold text-pink-600">{classStats.femaleStudents}</p>
                        <p className="text-sm text-gray-600">Female</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search students by name or roll number..."
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <FaPlus className="inline mr-2" />
                        Add Student
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                  </div>
                                  <div className="ml-3">
                                    <p className="font-medium text-gray-900">
                                      {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{student.studentId}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{student.rollNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-900 capitalize">{student.gender}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{student.contactNumber}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  student.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {student.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button className="text-blue-600 hover:text-blue-700 mx-1">
                                  <FaEye />
                                </button>
                                <button className="text-green-600 hover:text-green-700 mx-1">
                                  <FaEdit />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Overview</h3>
                  <div className="text-center py-12">
                    <FaClipboardCheck className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Average Attendance: {classStats.avgAttendance}%</p>
                    <p className="text-gray-400 mt-2">Detailed attendance tracking coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                    <h3 className="text-xl font-bold">Fee Collection Summary</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Fee</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{classStats.totalFee?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Collected</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{classStats.collectedFee?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{classStats.pendingFee?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Bar
                        data={{
                          labels: ['Paid Students', 'Overdue Students', 'Pending'],
                          datasets: [{
                            label: 'Count',
                            data: [
                              classStats.paidStudents,
                              classStats.overdueStudents,
                              classStats.totalStudents - classStats.paidStudents - classStats.overdueStudents
                            ],
                            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                          }],
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Class Performance</h3>
                  <div className="text-center py-12">
                    <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Performance tracking coming soon</p>
                    <p className="text-gray-400 mt-2">Exam results, grades, and analytics will appear here</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h3 className="text-2xl font-bold">Create New Class</h3>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., 10, 9, 8"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="e.g., A, B, C"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Teacher</label>
                  <select
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({...formData, classTeacher: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.userId?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="e.g., 101, A-202"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="number"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Class
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
              <h3 className="text-2xl font-bold">Edit Class</h3>
            </div>
            <form onSubmit={handleEditClass} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Teacher</label>
                  <select
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({...formData, classTeacher: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.userId?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="number"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Update Class
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;
