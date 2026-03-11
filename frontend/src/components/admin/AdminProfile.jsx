import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import profileService from "../../services/profileService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  User, Mail, Shield, Calendar, TrendingUp, Users, GraduationCap,
  BookOpen, DollarSign, Bell, Settings, LogOut, Edit, Camera,
  Activity, Award, Clock, BarChart3, PieChart, RefreshCw
} from "lucide-react";

/**
 * Modern Industry-Level Admin Profile Component
 * Features: Real-time stats, Activity feed, Quick actions, Modern glassmorphism UI
 */

const AdminProfileNew = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        profileService.getAdminProfile().catch(() => ({ data: { data: null } })),
        adminService.getDashboard()
      ]);
      
      setProfile(profileRes.data.data);
      
      // Extract stats with multiple fallbacks
      const responseData = statsRes.data.data;
      const extractedStats = responseData?.stats || responseData;
      
      console.log('📊 Raw API Response:', statsRes.data);
      console.log('📊 Extracted Stats:', extractedStats);
      console.log('📊 Students:', extractedStats?.totalStudents || extractedStats?.students);
      console.log('📊 Teachers:', extractedStats?.totalTeachers || extractedStats?.teachers);
      
      setStats(extractedStats);
      
      if (!extractedStats || Object.keys(extractedStats).length === 0) {
        toast.error('No stats data available');
      }
    } catch (error) {
      console.error('❌ Failed to load profile data:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, color, bgColor }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
    </motion.div>
  );

  const QuickActionButton = ({ icon: Icon, label, onClick, color }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-3 ${color} text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </motion.button>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-4xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-1">{user?.name || 'Administrator'}</h1>
                <p className="text-blue-100 mb-2">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Super Admin
                  </div>
                  <div className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Active
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <Settings className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <Bell className="w-6 h-6" />
              </button>
              <button 
                onClick={logout}
                className="w-12 h-12 bg-red-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-500/50 transition-all"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats?.totalStudents ?? stats?.students ?? stats?.stats?.totalStudents ?? 0}
            trend={stats?.totalStudents > 0 ? "+12%" : null}
            color="text-blue-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={GraduationCap}
            label="Total Teachers"
            value={stats?.totalTeachers ?? stats?.teachers ?? stats?.stats?.totalTeachers ?? 0}
            trend={stats?.totalTeachers > 0 ? "+5%" : null}
            color="text-green-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={BookOpen}
            label="Total Classes"
            value={stats?.totalClasses ?? stats?.classes ?? stats?.stats?.totalClasses ?? 0}
            trend={stats?.totalClasses > 0 ? "+2%" : null}
            color="text-purple-600"
            bgColor="bg-white"
          />
          <StatCard
            icon={Bell}
            label="Announcements"
            value={stats?.activeAnnouncements ?? stats?.announcements ?? stats?.stats?.activeAnnouncements ?? 0}
            color="text-orange-600"
            bgColor="bg-white"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Personal Information
                </h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
                <InfoItem icon={Shield} label="Role" value="Super Administrator" />
                <InfoItem icon={Award} label="Designation" value={profile?.designation || 'Administrator'} />
                <InfoItem icon={Calendar} label="Status" value="Active" />
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                System Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">System Status</span>
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Online</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">Server Uptime</span>
                  </div>
                  <span className="font-bold text-green-600">99.9%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Database Health</span>
                  </div>
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">Excellent</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Quick Actions & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionButton
                  icon={Users}
                  label="Add Student"
                  onClick={() => window.location.href = '/admin/add-student'}
                  color="bg-blue-600 hover:bg-blue-700"
                />
                <QuickActionButton
                  icon={GraduationCap}
                  label="Add Teacher"
                  onClick={() => window.location.href = '/admin/add-teacher'}
                  color="bg-green-600 hover:bg-green-700"
                />
                <QuickActionButton
                  icon={Bell}
                  label="New Announcement"
                  onClick={() => window.location.href = '/admin/announcements'}
                  color="bg-purple-600 hover:bg-purple-700"
                />
                <QuickActionButton
                  icon={DollarSign}
                  label="Fee Management"
                  onClick={() => window.location.href = '/admin/fees'}
                  color="bg-orange-600 hover:bg-orange-700"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Logged in</p>
                    <p className="text-xs text-gray-600">Just now</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">System backup completed</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database optimized</p>
                    <p className="text-xs text-gray-600">5 hours ago</p>
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

export default AdminProfileNew;
