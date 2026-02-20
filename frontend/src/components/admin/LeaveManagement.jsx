import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import {
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaDownload,
  FaEye,
  FaChartLine,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaExclamationTriangle,
} from 'react-icons/fa';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    userType: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, leaves]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllLeaves();
      setLeaves(res.data.data);
      setStats(res.data.stats);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaves];

    if (filters.status) {
      filtered = filtered.filter(l => l.status === filters.status);
    }

    if (filters.leaveType) {
      filtered = filtered.filter(l => l.leaveType === filters.leaveType);
    }

    if (filters.userType) {
      filtered = filtered.filter(l => l.userType === filters.userType);
    }

    if (filters.priority) {
      filtered = filtered.filter(l => l.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(l => {
        const userName = l.teacher?.userId?.name || l.student?.userId?.name || '';
        return userName.toLowerCase().includes(searchLower) ||
               l.leaveType.toLowerCase().includes(searchLower) ||
               l.reason.toLowerCase().includes(searchLower);
      });
    }

    setFilteredLeaves(filtered);
  };

  const handleStatusUpdate = async (id, status) => {
    const remark = prompt(
      status === 'Rejected' 
        ? 'Enter rejection reason (required):' 
        : 'Enter remark (optional):'
    );

    if (status === 'Rejected' && !remark) {
      return toast.error('Remark required for rejection');
    }

    try {
      await adminService.updateLeaveStatus(id, { status, adminRemark: remark });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
      Cancelled: 'bg-gray-100 text-gray-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      Low: 'bg-blue-100 text-blue-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      High: 'bg-orange-100 text-orange-700',
      Urgent: 'bg-red-100 text-red-700',
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <FaHourglassHalf className="text-yellow-500" />,
      Approved: <FaCheckCircle className="text-green-500" />,
      Rejected: <FaTimesCircle className="text-red-500" />,
      Cancelled: <FaBan className="text-gray-500" />,
    };
    return icons[status] || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve leave requests</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/leaves/analytics'}
          className="btn-primary flex items-center gap-2"
        >
          <FaChartLine />
          View Analytics
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">
                {leaves.filter(l => l.status === 'Pending').length}
              </p>
            </div>
            <FaHourglassHalf className="text-4xl text-yellow-100" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Approved</p>
              <p className="text-3xl font-bold mt-1">
                {leaves.filter(l => l.status === 'Approved').length}
              </p>
            </div>
            <FaCheckCircle className="text-4xl text-green-100" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Rejected</p>
              <p className="text-3xl font-bold mt-1">
                {leaves.filter(l => l.status === 'Rejected').length}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-red-100" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Requests</p>
              <p className="text-3xl font-bold mt-1">{leaves.length}</p>
            </div>
            <FaCalendarAlt className="text-4xl text-blue-100" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* User Type Filter */}
          <select
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Users</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>

          {/* Leave Type Filter */}
          <select
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
            <option value="Emergency">Emergency</option>
            <option value="Medical">Medical</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredLeaves.length} of {leaves.length} requests</span>
          <button
            onClick={() => setFilters({ status: '', leaveType: '', userType: '', priority: '', search: '' })}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Leave List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading leaves...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <motion.tr
                    key={leave._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                          {leave.userType === 'teacher' ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {leave.teacher?.userId?.name || leave.student?.userId?.name}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{leave.userType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{leave.leaveType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(leave.fromDate).toLocaleDateString()}
                        <span className="text-gray-400 mx-1">to</span>
                        {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{leave.totalDays}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        {leave.halfDay ? '(Half)' : 'days'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(leave.priority)}`}>
                        {leave.priority === 'Urgent' && <FaExclamationTriangle className="inline mr-1" />}
                        {leave.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${getStatusBadge(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {leave.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave Details Modal */}
      <AnimatePresence>
        {showModal && selectedLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Leave Request Details</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Applicant Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">
                        {selectedLeave.teacher?.userId?.name || selectedLeave.student?.userId?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{selectedLeave.userType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">
                        {selectedLeave.teacher?.userId?.email || selectedLeave.student?.userId?.email}
                      </p>
                    </div>
                    {selectedLeave.contactNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-semibold">{selectedLeave.contactNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leave Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Leave Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Leave Type</p>
                      <p className="font-semibold">{selectedLeave.leaveType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(selectedLeave.priority)}`}>
                        {selectedLeave.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">From Date</p>
                      <p className="font-semibold">{new Date(selectedLeave.fromDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To Date</p>
                      <p className="font-semibold">{new Date(selectedLeave.toDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Days</p>
                      <p className="font-semibold">{selectedLeave.totalDays} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Session</p>
                      <p className="font-semibold">{selectedLeave.session}</p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Reason</h3>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedLeave.reason}</p>
                </div>

                {/* Attachment */}
                {selectedLeave.attachment && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Attachment</h3>
                    <a
                      href={selectedLeave.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <FaDownload />
                      View Attachment
                    </a>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</h3>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 w-fit ${getStatusBadge(selectedLeave.status)}`}>
                    {getStatusIcon(selectedLeave.status)}
                    {selectedLeave.status}
                  </span>
                </div>

                {/* Admin Remark */}
                {selectedLeave.adminRemark && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Admin Remark</h3>
                    <p className="text-gray-800 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      {selectedLeave.adminRemark}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {selectedLeave.reviewedBy && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Reviewed By</h3>
                    <p className="text-gray-800">
                      {selectedLeave.reviewedBy.name} on {new Date(selectedLeave.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                {selectedLeave.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedLeave._id, 'Approved')}
                      className="btn-success flex items-center gap-2"
                    >
                      <FaCheckCircle />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedLeave._id, 'Rejected')}
                      className="btn-danger flex items-center gap-2"
                    >
                      <FaTimesCircle />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveManagement;
