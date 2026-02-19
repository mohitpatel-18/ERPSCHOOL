import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaKey } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../common/Navbar';
import toast from 'react-hot-toast';
import api from '../../services/api';


const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, user } = useAuth();

  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  /* ===================== GUARD ===================== */
  useEffect(() => {
    if (!email) {
      toast.error('Invalid OTP session. Please login again.');
      navigate('/erp-login', { replace: true });
    }
  }, [email, navigate]);

  /* ===================== REDIRECT AFTER AUTH ===================== */
  useEffect(() => {
    if (user?.role) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyOTP(email, otp);

    if (!result?.success) {
      toast.error('OTP verification failed');
    }

    setLoading(false);
  };

  /* ===================== RESEND ===================== */
  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent successfully');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mb-4">
                <FaKey className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
              <p className="text-gray-600 mt-2">
                Enter the code sent to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;
