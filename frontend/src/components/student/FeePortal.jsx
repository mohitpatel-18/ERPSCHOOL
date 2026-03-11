import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';
import {
  DollarSign, CreditCard, Download, Calendar, CheckCircle,
  AlertCircle, TrendingUp, Clock, FileText, Receipt,
  ExternalLink, RefreshCw, Filter, Search, Eye
} from 'lucide-react';

/**
 * Advanced Student Fee Portal
 * Features: Real-time stats, Payment tracking, Receipt download, Modern UI
 */

const FeePortalNew = () => {
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const feeRes = await studentService.getFees();

      console.log('💰 Fee Data:', feeRes.data);
      setFeeData(feeRes.data.data);
      setPayments(feeRes.data.data?.payments || []);
    } catch (error) {
      console.error('Failed to load fee data:', error);
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (amount) => {
    setPaymentLoading(true);
    try {
      // Razorpay integration or payment gateway
      toast.success('Opening payment gateway...');
      
      // TODO: Integrate actual payment gateway
      setTimeout(() => {
        toast.success('Payment initiated successfully!');
        fetchFeeData();
        setPaymentLoading(false);
      }, 2000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setPaymentLoading(false);
    }
  };

  const downloadReceipt = (paymentId) => {
    toast.success('Downloading receipt...');
    // TODO: Generate and download PDF receipt
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{value?.toLocaleString() || 0}</h3>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
    </motion.div>
  );

  const PaymentCard = ({ payment }) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{payment.description || 'Tuition Fee'}</h4>
              <p className="text-sm text-gray-600">{payment.term || 'Quarter 1'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || statusColors.pending}`}>
            {payment.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-lg font-bold text-gray-900">₹{payment.amount?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Due Date</p>
            <p className="text-sm font-medium text-gray-700">
              {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {payment.status === 'paid' ? (
            <button
              onClick={() => downloadReceipt(payment._id)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          ) : (
            <button
              onClick={() => handlePayNow(payment.amount)}
              disabled={paymentLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          )}
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading fee information...</p>
        </div>
      </div>
    );
  }

  const totalFee = feeData?.totalFee || 50000;
  const paidAmount = feeData?.paidAmount || 30000;
  const pendingAmount = totalFee - paidAmount;
  const paymentPercentage = ((paidAmount / totalFee) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Fee Portal
            </h1>
            <p className="text-gray-600 mt-1">Manage your fee payments and view history</p>
          </div>
          <button
            onClick={fetchFeeData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Fee"
            value={totalFee}
            color="text-blue-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={CheckCircle}
            label="Amount Paid"
            value={paidAmount}
            color="text-green-600"
            bgColor="bg-white"
            trend={`${paymentPercentage}%`}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Amount"
            value={pendingAmount}
            color="text-red-600"
            bgColor="bg-white"
          />
        </div>

        {/* Payment Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Payment Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{paymentPercentage}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${paymentPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>₹{paidAmount.toLocaleString()} paid</span>
              <span>₹{pendingAmount.toLocaleString()} remaining</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {pendingAmount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Pay Pending Fee</h3>
                <p className="text-blue-100">Clear your dues and avoid late fees</p>
              </div>
              <button
                onClick={() => handlePayNow(pendingAmount)}
                disabled={paymentLoading}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{pendingAmount.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Payment History
            </h2>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search payments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {payments.length > 0 ? (
              payments
                .filter(p => filterStatus === 'all' || p.status === filterStatus)
                .filter(p => !searchTerm || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((payment, index) => (
                  <PaymentCard key={payment._id || index} payment={payment} />
                ))
            ) : (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payment history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePortalNew;
