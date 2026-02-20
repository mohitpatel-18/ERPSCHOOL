import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaMoneyBillWave, FaSearch, FaReceipt, FaPrint } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentRecording = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFee, setStudentFee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: '',
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    transactionId: '',
    upiId: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/students?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const fetchStudentFee = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/fees/student-fees?student=${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data && response.data.data.length > 0) {
        setStudentFee(response.data.data[0]);
        // Set amount to next due amount by default
        setPaymentData(prev => ({
          ...prev,
          amount: response.data.data[0].nextDueAmount || 0
        }));
      } else {
        toast.error('No fee record found for this student');
        setStudentFee(null);
      }
    } catch (error) {
      toast.error('Failed to load student fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentFee(student._id);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!studentFee) {
      toast.error('Please select a student first');
      return;
    }

    if (parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/fees/payments`,
        {
          studentFeeId: studentFee._id,
          ...paymentData,
          amount: parseFloat(paymentData.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Payment recorded successfully!');
      
      // Reset form
      setPaymentData({
        amount: '',
        paymentMode: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: '',
        chequeNumber: '',
        chequeDate: '',
        bankName: '',
        transactionId: '',
        upiId: '',
      });

      // Refresh student fee data
      fetchStudentFee(selectedStudent._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Record Payment</h1>
        <p className="text-gray-600 mt-1">Record offline payments (Cash, Cheque, Bank Transfer, etc.)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Search & Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h3 className="text-xl font-bold">Search Student</h3>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, roll no..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No students found</p>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedStudent?._id === student._id
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      <p className="text-sm text-gray-600">
                        Class: {student.class?.name} {student.class?.section}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form & Student Fee Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Fee Summary */}
          {selectedStudent && studentFee && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <h3 className="text-xl font-bold">Fee Summary</h3>
                <p className="text-sm text-green-100">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Fee</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{studentFee.netFeeAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{studentFee.totalPaid?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-xl font-bold text-red-600">
                      ₹{studentFee.balance?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Late Fee</p>
                    <p className="text-xl font-bold text-yellow-600">
                      ₹{studentFee.totalLateFee?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Installments */}
                <div className="mt-6">
                  <h4 className="font-bold text-gray-800 mb-3">Installments</h4>
                  <div className="space-y-2">
                    {studentFee.installments?.map((inst, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          inst.status === 'Paid'
                            ? 'bg-green-50 border-green-200'
                            : inst.status === 'Overdue'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{inst.installmentName}</p>
                            <p className="text-sm text-gray-600">
                              Due: {new Date(inst.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">
                              ₹{inst.amount?.toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                inst.status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : inst.status === 'Overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {inst.status}
                            </span>
                          </div>
                        </div>
                        {inst.paidAmount > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Paid: ₹{inst.paidAmount?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {selectedStudent && studentFee && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaMoneyBillWave /> Record Payment
                </h3>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      step="0.01"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ₹{studentFee.nextDueAmount?.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mode *
                    </label>
                    <select
                      value={paymentData.paymentMode}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Conditional fields based on payment mode */}
                  {paymentData.paymentMode === 'Cheque' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Number
                        </label>
                        <input
                          type="text"
                          value={paymentData.chequeNumber}
                          onChange={(e) => setPaymentData({ ...paymentData, chequeNumber: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Date
                        </label>
                        <input
                          type="date"
                          value={paymentData.chequeDate}
                          onChange={(e) => setPaymentData({ ...paymentData, chequeDate: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={paymentData.bankName}
                          onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {paymentData.paymentMode === 'Bank Transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={paymentData.transactionId}
                        onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {paymentData.paymentMode === 'UPI' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={paymentData.upiId}
                        onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={paymentData.remarks}
                    onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaReceipt />
                    {loading ? 'Processing...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* No Student Selected */}
          {!selectedStudent && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Select a student to record payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRecording;
