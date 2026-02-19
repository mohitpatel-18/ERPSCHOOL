import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services/teacherService';
import toast from 'react-hot-toast';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== PASSWORD ===== */
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await teacherService.getProfile();
        setProfile(res.data?.data || null);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('All fields are required');
      return;
    }

    try {
      await teacherService.changePassword(passwords);
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* BASIC INFO */}
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Last Login:{' '}
              {profile?.lastLogin
                ? new Date(profile.lastLogin).toLocaleString()
                : '—'}
            </p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div>
            <p className="text-sm text-gray-600 mb-1">Role</p>
            <p className="font-semibold capitalize">{user?.role}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <p className="font-semibold">{user?.phone || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Assigned Classes</p>
            <p className="font-semibold">
              {profile?.classes?.length || 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">
              Attendance Completion
            </p>
            <p className="font-semibold">
              {profile?.attendanceCompletion || 0}%
            </p>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-bold mb-4">Change Password</h3>

          <div className="grid md:grid-cols-2 gap-4 max-w-xl">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={e =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
              className="input-field"
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={e =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
              className="input-field"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="btn-primary mt-4"
          >
            Update Password
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherProfile;
