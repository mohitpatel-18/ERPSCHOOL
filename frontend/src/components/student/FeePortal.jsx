import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaCreditCard,
  FaHistory,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FeePortal = () => {
  const [studentFee, setStudentFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get current user's student ID from token/context
      const userResponse = await axios.get(`${API_URL}/auth/me`, { headers });
      const userId = userResponse.data.data._id;

      // Get student record
      const studentResponse = await axios.get(`${API_URL}/student/dashboard`, { headers });
      const studentId = studentResponse.data.data.student._id;

      // Get fee details
      const feeResponse = await axios.get(
        `${API_URL}/fees/student-fees?student=${studentId}`,
        { headers }
      );

      if (feeResponse.data.data && feeResponse.data.data.length > 0) {
        const feeData = feeResponse.data.data[0];
        setStudentFee(feeData);

        // Get payment history
        const paymentsResponse = await axios.get(
          `${API_URL}/fees/payments?studentId=${studentId}`,
          { headers }
        );
        setPayments(paymentsResponse.data.data || []);
      } else {
        toast.info('No fee record assigned yet');
      }
    } catch (error) {
      console.error('Fee fetch error:', error);
      toast.error('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (amount) => {
    if (!studentFee) return;

    setProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Create Razorpay order
      const orderResponse = await axios.post(
        `${API_URL}/fees/payments/razorpay/create-order`,
        {
          studentFeeId: studentFee._id,
          amount: amount,
        },
        { headers }
      );

      const { order } = orderResponse.data.data;

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Samrose Nalanda School',
        description: 'Fee Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post(
              `${API_URL}/fees/payments/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentFeeId: studentFee._id,
              },
              { headers }
            );

            toast.success('Payment successful!');
            fetchFeeData(); // Refresh data
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: `${studentFee.student.firstName} ${studentFee.student.lastName}`,
          email: studentFee.student.email || '',
          contact: studentFee.student.contactNumber || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Paid': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle /> },
      'Partially Paid': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaClock /> },
      'Overdue': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaExclamationTriangle /> },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock /> },
    };
    const badge = badges[status] || badges['Pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text} flex items-center gap-1 w-fit`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentFee) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Fee Record</h2>
          <p className="text-gray-600">Fee has not been assigned to you yet. Please contact the admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Fees</h1>
        <p className="text-gray-600 mt-1">View and manage your school fees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-blue-100 text-sm">Total Fee</p>
          <p className="text-3xl font-bold mt-2">₹{studentFee.netFeeAmount?.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-green-100 text-sm">Paid Amount</p>
          <p className="text-3xl font-bold mt-2">₹{studentFee.totalPaid?.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-red-100 text-sm">Balance Due</p>
          <p className="text-3xl font-bold mt-2">₹{studentFee.balance?.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-yellow-100 text-sm">Late Fee</p>
          <p className="text-3xl font-bold mt-2">₹{studentFee.totalLateFee?.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Payment Progress</h3>
          <span className="text-2xl font-bold text-blue-600">
            {studentFee.paymentPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all"
            style={{ width: `${studentFee.paymentPercentage}%` }}
          ></div>
        </div>
        <div className="mt-4">
          {getStatusBadge(studentFee.overallStatus)}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {['overview', 'installments', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
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
          {/* Fee Breakdown */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h3 className="text-xl font-bold">Fee Breakdown</h3>
            </div>
            <div className="p-6 space-y-3">
              {studentFee.componentFees?.map((component, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{component.componentName}</p>
                    <p className="text-sm text-gray-600 capitalize">{component.frequency}</p>
                  </div>
                  <p className="font-bold text-gray-800">₹{component.finalAmount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Payment */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <h3 className="text-xl font-bold">Quick Payment</h3>
            </div>
            <div className="p-6 space-y-4">
              {studentFee.balance > 0 ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Next Due Amount</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      ₹{studentFee.nextDueAmount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Due Date: {studentFee.nextDueDate ? new Date(studentFee.nextDueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOnlinePayment(studentFee.nextDueAmount)}
                    disabled={processingPayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaCreditCard />
                    {processingPayment ? 'Processing...' : 'Pay Now'}
                  </button>

                  <button
                    onClick={() => handleOnlinePayment(studentFee.balance)}
                    disabled={processingPayment}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaMoneyBillWave />
                    {processingPayment ? 'Processing...' : 'Pay Full Balance'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-bold text-green-600">All Paid!</p>
                  <p className="text-gray-600">You have no pending fees</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'installments' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-xl font-bold">Installment Schedule</h3>
            <p className="text-blue-100">Plan: {studentFee.installmentPlan}</p>
          </div>
          <div className="p-6 space-y-3">
            {studentFee.installments?.map((inst, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  inst.status === 'Paid'
                    ? 'bg-green-50 border-green-500'
                    : inst.status === 'Overdue'
                    ? 'bg-red-50 border-red-500'
                    : inst.status === 'Partially Paid'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{inst.installmentName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Due Date: {new Date(inst.dueDate).toLocaleDateString()}
                    </p>
                    {inst.paidAmount > 0 && (
                      <p className="text-sm text-gray-600">
                        Paid: ₹{inst.paidAmount?.toLocaleString()} of ₹{inst.amount?.toLocaleString()}
                      </p>
                    )}
                    {inst.lateFee > 0 && (
                      <p className="text-sm text-red-600">Late Fee: ₹{inst.lateFee?.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">₹{inst.amount?.toLocaleString()}</p>
                    {getStatusBadge(inst.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaHistory /> Payment History
            </h3>
          </div>
          <div className="p-6">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No payments made yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ₹{payment.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {payment.paymentMode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="text-blue-600 hover:text-blue-700"
                            title="Download Receipt"
                          >
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePortal;
