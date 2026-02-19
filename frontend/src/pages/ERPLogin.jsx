import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../common/Navbar';

const ERPLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const preSelectedRole = location.state?.role || 'student';

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: preSelectedRole,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ===================== ROLE BASED TEXT ===================== */
  const getIdentifierConfig = () => {
    switch (formData.role) {
      case 'admin':
        return {
          label: 'Admin Email',
          placeholder: 'admin@school.com',
          icon: <FaEnvelope />,
        };
      case 'teacher':
        return {
          label: 'Teacher Email / Teacher ID',
          placeholder: 'Teacher Email or Employee ID',
          icon: <FaIdBadge />,
        };
      case 'student':
      default:
        return {
          label: 'Student Email / Student ID',
          placeholder: 'Student Email or Student ID',
          icon: <FaIdBadge />,
        };
    }
  };

  const identifierConfig = getIdentifierConfig();

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({
      email: formData.identifier,
      password: formData.password,
      role: formData.role,
    });

    setLoading(false);

    // 🔐 OTP REQUIRED (Teacher / Student)
    if (result?.requiresOTP) {
      navigate('/verify-otp', {
        state: { email: result.email },
      });
      return;
    }

    // ✅ DIRECT LOGIN (Admin / Verified user)
    if (result?.success && result?.role) {
      navigate(`/${result.role}`, { replace: true });
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
                <FaUser className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">ERP Login</h2>
              <p className="text-gray-600 mt-2">Login using Email or ID</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                      identifier: '',
                    })
                  }
                  className="input-field"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Identifier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {identifierConfig.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {identifierConfig.icon}
                  </span>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) =>
                      setFormData({ ...formData, identifier: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder={identifierConfig.placeholder}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-primary-600">
                ← Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ERPLogin;
