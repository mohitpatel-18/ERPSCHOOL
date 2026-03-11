import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch, 
  FaFilter,
  FaMoneyBillWave,
  FaClock,
  FaCalendar,
  FaUser
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPayments();
    
    // ✅ Auto-refresh every 15 seconds for pending payments
    let intervalId;
    if (statusFilter === 'Pending') {
      intervalId = setInterval(() => {
        fetchPayments(true); // Silent refresh
      }, 15000); // Poll every 15 seconds for pending payments
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [statusFilter]);

  const fetchPayments = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${API_URL}/fees/payments?limit=100`,
        { headers }
      );

      // ✅ Filter to show only OFFLINE payments (Cash/Cheque/UPI/Bank Transfer)
      const allPayments = response.data.data || [];
      const offlinePayments = allPayments.filter(payment => payment.paymentType === 'Offline');
      
      setPayments(offlinePayments);
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load payments');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `${API_URL}/fees/payments/${paymentId}/approve`,
        {},
        { headers }
      );

      toast.success('Payment approved successfully!');
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `${API_URL}/fees/payments/${selectedPayment._id}/reject`,
        { reason: rejectReason },
        { headers }
      );

      toast.success('Payment rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const openRejectModal = (payment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  const getStatusBadge = (approvalStatus) => {
    const badges = {
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle /> },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimesCircle /> },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock /> },
    };
    const badge = badges[approvalStatus] || badges['Pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text} flex items-center gap-1 w-fit`}>
        {badge.icon}
        {approvalStatus}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'All' || payment.approvalStatus === statusFilter;
    const matchesSearch = 
      payment.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payment Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve offline cash payments (Online payments are auto-approved)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID, or receipt..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-center bg-blue-50 rounded-lg p-2">
            <span className="text-sm font-medium text-blue-700">
              {filteredPayments.length} payments found
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-700">
                {payments.filter(p => p.approvalStatus === 'Pending').length}
              </p>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-700">
                {payments.filter(p => p.approvalStatus === 'Approved').length}
              </p>
            </div>
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">
                {payments.filter(p => p.approvalStatus === 'Rejected').length}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-xl font-bold">Payment List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No offline payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FaCalendar className="text-gray-400" />
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.student?.firstName} {payment.student?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.student?.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.receiptNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <FaMoneyBillWave />
                        ₹{payment.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.paymentType === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payment.paymentType || 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.approvalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.approvalStatus === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(payment._id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                          >
                            <FaCheckCircle />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(payment)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                          >
                            <FaTimesCircle />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {payment.approvalStatus === 'Approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Payment</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Student: {selectedPayment?.student?.firstName} {selectedPayment?.student?.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Amount: ₹{selectedPayment?.amount?.toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejecting this payment..."
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Payment
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedPayment(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApproval;
