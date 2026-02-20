import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUsers, FaCheck, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FeeAssignment = () => {
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [installmentPlan, setInstallmentPlan] = useState('Quarterly');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('bulk'); // bulk, class, single

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [templatesRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/fees/templates?isActive=true`, { headers }),
        axios.get(`${API_URL}/class`, { headers }),
      ]);

      setTemplates(templatesRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${API_URL}/admin/students?classId=${selectedClass}`,
        { headers }
      );

      setStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  const handleToggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleAssignBulk = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a fee template');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/fees/assign/bulk`,
        {
          studentIds: selectedStudents,
          feeTemplateId: selectedTemplate,
          installmentPlan,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, failed } = response.data.data;
      
      toast.success(
        `Fee assigned to ${success.length} students successfully! ${
          failed.length > 0 ? `${failed.length} failed.` : ''
        }`
      );

      setSelectedStudents([]);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign fees');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToClass = async () => {
    if (!selectedTemplate || !selectedClass) {
      toast.error('Please select both template and class');
      return;
    }

    if (!window.confirm(`Assign fees to ALL students in this class?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/fees/assign/class`,
        {
          classId: selectedClass,
          feeTemplateId: selectedTemplate,
          installmentPlan,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, failed } = response.data.data;
      
      toast.success(
        `Fee assigned to ${success.length} students! ${
          failed.length > 0 ? `${failed.length} failed.` : ''
        }`
      );

      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign fees');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const rollNumber = student.rollNumber ? String(student.rollNumber).toLowerCase() : '';
    const studentId = student.studentId ? String(student.studentId).toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || rollNumber.includes(search) || studentId.includes(search);
  });

  const selectedTemplateData = templates.find(t => t._id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fee Assignment</h1>
        <p className="text-gray-600 mt-1">Assign fee structures to students</p>
      </div>

      {/* Assignment Mode Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setAssignmentMode('bulk')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              assignmentMode === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulk Assignment
          </button>
          <button
            onClick={() => setAssignmentMode('class')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              assignmentMode === 'class'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Entire Class
          </button>
        </div>
      </div>

      {/* Selection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Template Selection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">1. Select Fee Template</h3>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose Template</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.templateName} - ₹{template.totalAnnualFee?.toLocaleString()}
              </option>
            ))}
          </select>

          {selectedTemplateData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Class:</strong> {selectedTemplateData.class?.name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Total Fee:</strong> ₹{selectedTemplateData.totalAnnualFee?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Components:</strong> {selectedTemplateData.components?.length}
              </p>
            </div>
          )}
        </div>

        {/* Class Selection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">2. Select Class</h3>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} {cls.section}
              </option>
            ))}
          </select>

          {students.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Students:</strong> {students.length}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Selected:</strong> {selectedStudents.length}
              </p>
            </div>
          )}
        </div>

        {/* Installment Plan */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">3. Installment Plan</h3>
          <select
            value={installmentPlan}
            onChange={(e) => setInstallmentPlan(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Annual">Annual</option>
          </select>

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected Plan:</strong> {installmentPlan}
            </p>
          </div>
        </div>
      </div>

      {/* Students List */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Students List</h2>
                <p className="text-green-100">Select students to assign fees</p>
              </div>
              {assignmentMode === 'class' ? (
                <button
                  onClick={handleAssignToClass}
                  disabled={loading || !selectedTemplate}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Assigning...' : 'Assign to Entire Class'}
                </button>
              ) : (
                <button
                  onClick={handleAssignBulk}
                  disabled={loading || selectedStudents.length === 0 || !selectedTemplate}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Assigning...' : `Assign to ${selectedStudents.length} Students`}
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          {assignmentMode === 'bulk' && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, roll number, or student ID..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
          )}

          {/* Students Table */}
          {assignmentMode === 'bulk' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleToggleStudent(student._id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.rollNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.studentId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.contactNumber}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeAssignment;
