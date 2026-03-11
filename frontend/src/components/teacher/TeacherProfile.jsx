import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services/teacherService';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  BookOpen, Users, ClipboardCheck, Clock, Award, TrendingUp,
  Bell, Settings, Camera, Shield, Activity, BarChart3
} from 'lucide-react';

/**
 * Modern Industry-Level Teacher Profile
 * Features: Real-time stats, Editable fields, My Classes, Attendance tracking
 */

const TeacherProfileNew = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    subject: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        teacherService.getProfile(),
        teacherService.getMyStats().catch(() => ({ data: { data: null } }))
      ]);

      const profileData = profileRes.data.data;
      setProfile(profileData);
      setStats(statsRes.data?.data);

      setEditData({
        name: profileData?.name || user?.name || '',
        email: profileData?.email || user?.email || '',
        phone: profileData?.phone || '',
        address: profileData?.address?.street || '',
        qualification: profileData?.qualification || '',
        subject: profileData?.subject || ''
      });

      console.log('📊 Teacher Stats:', statsRes.data?.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    setEditData({
      name: profile?.name || user?.name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address?.street || '',
      qualification: profile?.qualification || '',
      subject: profile?.subject || ''
    });
  };

  const handleSave = async () => {
    try {
      await teacherService.updateProfile({
        ...editData,
        address: { street: editData.address }
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
    </motion.div>
  );

  const InfoField = ({ icon: Icon, label, value, editable, field }) => {
    const handleChange = (e) => {
      const newValue = e.target.value;
      setEditData(prev => ({ ...prev, [field]: newValue }));
    };

    return (
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          {isEditing && editable ? (
            <input
              type="text"
              value={editData[field] || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <p className="text-base font-semibold text-gray-900">{value || 'Not provided'}</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-green-600 text-4xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'T'}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Teacher Info */}
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile?.name || user?.name || 'Teacher'}</h1>
                <p className="text-green-100 mb-2">{profile?.email || user?.email}</p>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Teacher
                  </div>
                  <div className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Active
                  </div>
                  <div className="px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium">
                    ID: {profile?.teacherId || 'TCH001'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="w-12 h-12 bg-red-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-500/50 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-12 h-12 bg-green-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-green-500/50 transition-all"
                  >
                    <Save className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <Edit className="w-6 h-6" />
                  </button>
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                    <Bell className="w-6 h-6" />
                  </button>
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                    <Settings className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="My Students"
            value={stats?.totalStudents || stats?.students || 0}
            color="text-blue-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={BookOpen}
            label="My Classes"
            value={stats?.totalClasses || stats?.classes || 0}
            color="text-green-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Attendance Taken"
            value={stats?.attendanceTaken || stats?.attendance || 0}
            color="text-purple-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={Award}
            label="Assignments Given"
            value={stats?.assignmentsGiven || stats?.assignments || 0}
            color="text-orange-600"
            bgColor="bg-white"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-green-600" />
                Personal Information
              </h2>
              {isEditing && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Editing Mode
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoField icon={User} label="Full Name" value={profile?.name} editable field="name" />
              <InfoField icon={Mail} label="Email" value={profile?.email} editable field="email" />
              <InfoField icon={Phone} label="Phone" value={profile?.phone} editable field="phone" />
              <InfoField icon={BookOpen} label="Subject" value={profile?.subject} editable field="subject" />
              <InfoField icon={Award} label="Qualification" value={profile?.qualification} editable field="qualification" />
              <InfoField icon={MapPin} label="Address" value={profile?.address?.street} editable field="address" />
            </div>
          </motion.div>

          {/* Quick Stats & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Performance Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Performance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                  <span className="text-lg font-bold text-blue-600">{stats?.attendanceRate || 95}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Classes Completed</span>
                  <span className="text-lg font-bold text-green-600">{stats?.classesCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Pending Tasks</span>
                  <span className="text-lg font-bold text-purple-600">{stats?.pendingTasks || 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Attendance marked</p>
                    <p className="text-xs text-gray-600">Today, 9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assignment graded</p>
                    <p className="text-xs text-gray-600">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Homework assigned</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileNew;
