import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherService } from '../../services/teacherService';
import toast from 'react-hot-toast';
import {
  FaCalendarPlus,
  FaHistory,
  FaChartPie,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaFileUpload,
  FaEye,
  FaTimes,
  FaExclamationCircle,
} from 'react-icons/fa';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Form state
  const [form, setForm] = useState({
    leaveType: 'Sick',
    fromDate: '',
    toDate: '',
    reason: '',
    halfDay: false,
    session: 'Full Day',
    contactNumber: '',
    alternativeEmail: '',
    priority: 'Medium',
    attachment: null,
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchLeaves();
    }
    fetchBalance();
  }, [activeTab]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getMyLeaves();
      setLeaves(res.data.data);
      setStats(res.data.stats);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await teacherService.getLeaveBalance();
      setBalance(res.data.data);
    } catch (error) {
      console.error('Failed to fetch balance');
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'attachment') {
      setForm({ ...form, attachment: files[0] });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fromDate || !form.toDate || !form.reason) {
      return toast.error('Please fill all required fields');
    }

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      await teacherService.applyLeave(formData);
      toast.success('Leave application submitted successfully');
      
      // Reset form
      setForm({
        leaveType: 'Sick',
        fromDate: '',
        toDate: '',
        reason: '',
        halfDay: false,
        session: 'Full Day',
        contactNumber: '',
        alternativeEmail: '',
        priority: 'Medium',
        attachment: null,
      });
      
      // Clear file input
      document.getElementById('attachment-input').value = '';
      
      fetchBalance();
      setActiveTab('history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      await teacherService.cancelLeave(id, { cancellationReason: reason });
      toast.success('Leave cancelled successfully');
      fetchLeaves();
      fetchBalance();
    } catch (error) {
      toast.error('Failed to cancel leave');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Approved: 'bg-green-100 text-green-700 border-green-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300',
      Cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <FaHourglassHalf className="text-yellow-600" />,
      Approved: <FaCheckCircle className="text-green-600" />,
      Rejected: <FaTimesCircle className="text-red-600" />,
      Cancelled: <FaBan className="text-gray-600" />,
    };
    return icons[status] || null;
  };

  const calculateDays = () => {
    if (form.fromDate && form.toDate) {
      const start = new Date(form.fromDate);
      const end = new Date(form.toDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return form.halfDay ? days - 0.5 : days;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Leave Management</h1>
        <p className="text-gray-600 mt-1">Apply for leaves and track your leave balance</p>
      </div>

      {/* Leave Balance Cards */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(balance).map(([type, data]) => (
            data.total > 0 && (
              <motion.div
                key={type}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100"
              >
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{type} Leave</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{data.total - data.used}</p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">{data.used} used</p>
                    <p className="text-xs text-gray-500">of {data.total}</p>
                  </div>
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all"
                    style={{ width: `${(data.used / data.total) * 100}%` }}
                  />
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'apply'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaCalendarPlus />
            Apply Leave
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaHistory />
            Leave History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaChartPie />
            Analytics
          </button>
        </div>

        <div className="p-6">
          {/* Apply Leave Tab */}
          {activeTab === 'apply' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Leave Type & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leaveType"
                    value={form.leaveType}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Medical">Medical Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                    <option value="Other">Other</option>
                  </select>
                  {balance && balance[form.leaveType] && (
                    <p className="text-sm text-gray-600 mt-1">
                      Available: {balance[form.leaveType].total - balance[form.leaveType].used} days
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={form.fromDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={form.toDate}
                    onChange={handleChange}
                    min={form.fromDate || new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Half Day Option */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="halfDay"
                    checked={form.halfDay}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Half Day Leave</span>
                </label>

                {form.halfDay && (
                  <select
                    name="session"
                    value={form.session}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="First Half">First Half (Morning)</option>
                    <option value="Second Half">Second Half (Afternoon)</option>
                  </select>
                )}
              </div>

              {/* Duration Display */}
              {form.fromDate && form.toDate && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm font-semibold text-blue-900">
                    Total Duration: <span className="text-2xl">{calculateDays()}</span> days
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Please provide a detailed reason for your leave..."
                  rows="4"
                  maxLength="500"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.reason.length}/500 characters
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alternative Email
                  </label>
                  <input
                    type="email"
                    name="alternativeEmail"
                    value={form.alternativeEmail}
                    onChange={handleChange}
                    placeholder="alternative@email.com"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                  <FaFileUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                  <input
                    id="attachment-input"
                    type="file"
                    name="attachment"
                    accept="image/*,.pdf"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="attachment-input"
                    className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Click to upload
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF or Image (Max 5MB)</p>
                  {form.attachment && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {form.attachment.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  <FaCalendarPlus className="inline mr-2" />
                  Submit Leave Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      leaveType: 'Sick',
                      fromDate: '',
                      toDate: '',
                      reason: '',
                      halfDay: false,
                      session: 'Full Day',
                      contactNumber: '',
                      alternativeEmail: '',
                      priority: 'Medium',
                      attachment: null,
                    });
                    document.getElementById('attachment-input').value = '';
                  }}
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </motion.form>
          )}

          {/* Leave History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                    <p className="text-sm opacity-90">Total</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                    <p className="text-sm opacity-90">Approved</p>
                    <p className="text-3xl font-bold">{stats.approved}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4">
                    <p className="text-sm opacity-90">Rejected</p>
                    <p className="text-3xl font-bold">{stats.rejected}</p>
                  </div>
                </div>
              )}

              {/* Leave List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No leave applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <motion.div
                      key={leave._id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{leave.leaveType}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(leave.status)} flex items-center gap-1`}>
                              {getStatusIcon(leave.status)}
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Duration:</span>{' '}
                            {new Date(leave.fromDate).toLocaleDateString()} to{' '}
                            {new Date(leave.toDate).toLocaleDateString()}
                            <span className="ml-2 text-primary-600 font-semibold">
                              ({leave.totalDays} days)
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEye />
                          </button>
                          {leave.status === 'Pending' && (
                            <button
                              onClick={() => handleCancel(leave._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{leave.reason}</p>
                      {leave.adminRemark && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">Admin Remark:</p>
                          <p className="text-sm text-yellow-900">{leave.adminRemark}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && balance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-gray-900">Leave Balance Overview</h3>
              
              {Object.entries(balance).map(([type, data]) => (
                data.total > 0 && (
                  <div key={type} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{type} Leave</h4>
                      <span className="text-2xl font-bold text-primary-600">
                        {data.total - data.used} / {data.total}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (data.used / data.total) > 0.8 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : (data.used / data.total) > 0.5
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                              : 'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${(data.used / data.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Used: {data.used} days</span>
                        <span>Available: {data.total - data.used} days</span>
                      </div>
                    </div>
                    {(data.used / data.total) > 0.8 && (
                      <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start gap-2">
                        <FaExclamationCircle className="text-red-500 mt-0.5" />
                        <p className="text-sm text-red-800">
                          You have used most of your {type.toLowerCase()} leave quota for this year.
                        </p>
                      </div>
                    )}
                  </div>
                )
              ))}
            </motion.div>
          )}
        </div>
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
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Leave Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Leave Type</p>
                    <p className="font-semibold text-gray-900">{selectedLeave.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusBadge(selectedLeave.status)}`}>
                      {getStatusIcon(selectedLeave.status)}
                      {selectedLeave.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">From Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedLeave.fromDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">To Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedLeave.toDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="font-semibold text-gray-900">{selectedLeave.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session</p>
                    <p className="font-semibold text-gray-900">{selectedLeave.session}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Reason</p>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedLeave.reason}</p>
                </div>

                {selectedLeave.adminRemark && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Admin Remark:</p>
                    <p className="text-yellow-900">{selectedLeave.adminRemark}</p>
                  </div>
                )}

                {selectedLeave.reviewedBy && (
                  <div>
                    <p className="text-sm text-gray-600">Reviewed By</p>
                    <p className="text-gray-900">
                      {selectedLeave.reviewedBy.name} on {new Date(selectedLeave.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                {selectedLeave.status === 'Pending' && (
                  <button
                    onClick={() => {
                      handleCancel(selectedLeave._id);
                      setShowModal(false);
                    }}
                    className="btn-danger"
                  >
                    Cancel Leave
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="btn-secondary">
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
