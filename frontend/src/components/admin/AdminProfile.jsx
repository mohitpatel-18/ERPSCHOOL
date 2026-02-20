import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { adminService } from "../../services/adminService";
import profileService from "../../services/profileService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaUserShield,
  FaCheckCircle,
  FaToggleOn,
  FaToggleOff,
  FaCamera,
  FaUser,
  FaChartBar,
  FaCog,
  FaHistory,
  FaUsers,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaDollarSign,
  FaClipboardCheck,
  FaBell,
  FaBook,
  FaFileAlt,
  FaEdit,
  FaShieldAlt,
  FaServer,
  FaClock
} from "react-icons/fa";

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Super Admin'
  });
  const photoInputRef = useRef(null);

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchYears();
    fetchProfile();
    fetchStats();
    setAdminData({
      name: user?.name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      role: 'Super Admin'
    });
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getAdminProfile();
      setProfile(res.data.data);
    } catch {
      // Profile might not exist yet
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data.data);
    } catch {
      // Stats might not be available
    }
  };

  const fetchYears = async () => {
    try {
      const res = await adminService.getAcademicYears();
      setAcademicYears(res.data.data);
    } catch {
      toast.error("Failed to load academic years");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Photo size must be less than 2MB');
    }

    try {
      await profileService.uploadAdminPhoto(file);
      toast.success('Photo uploaded successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Photo upload failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      return toast.error("All fields are required");
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return toast.error("End date must be after start date");
    }

    setLoading(true);

    try {
      await adminService.createAcademicYear({
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      toast.success("Academic Year Created Successfully 🚀");

      setFormData({
        name: "",
        startDate: "",
        endDate: "",
      });

      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = async (id) => {
    await adminService.toggleAcademicYear(id);
    fetchYears();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'settings', label: 'Settings', icon: FaCog },
    { id: 'activity', label: 'Activity Log', icon: FaHistory },
  ];

  return (
    <div className="space-y-6">
      {/* ADMIN HEADER - UNIQUE DESIGN */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10">
          {/* Edit Button - Top Right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditing(!editing)}
              className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition font-semibold shadow-lg"
            >
              <FaEdit className="text-lg" />
              <span>{editing ? '✖ Cancel' : '✏️ Edit Profile'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-xl">
                  {profile?.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserShield className="text-6xl" />
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white text-purple-600 p-3 rounded-full shadow-lg hover:scale-110 transition"
                >
                  <FaCamera />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <FaShieldAlt className="text-3xl" />
                  <h1 className="text-4xl font-bold">{user?.name || 'Administrator'}</h1>
                </div>
                <p className="text-purple-100 text-lg font-medium">System Administrator</p>
                <p className="text-purple-100">{user?.email}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <FaCheckCircle />
                    <span>Super Admin Access</span>
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                    ID: {profile?.adminId || 'ADMIN001'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <SystemStatCard icon={<FaUsers />} label="Students" value={stats?.totalStudents || 0} />
            <SystemStatCard icon={<FaChalkboardTeacher />} label="Teachers" value={stats?.totalTeachers || 0} />
            <SystemStatCard icon={<FaGraduationCap />} label="Classes" value={stats?.totalClasses || 0} />
            <SystemStatCard icon={<FaDollarSign />} label="Fee Collection" value={`₹${stats?.feeCollection || 0}`} />
            <SystemStatCard icon={<FaClipboardCheck />} label="Pending" value={stats?.pendingApprovals || 0} />
            <SystemStatCard icon={<FaServer />} label="Uptime" value="99.9%" />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex space-x-1 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab profile={profile} user={user} />}
          {activeTab === 'analytics' && <AnalyticsTab profile={profile} />}
          {activeTab === 'settings' && <SettingsTab academicYears={academicYears} formData={formData} setFormData={setFormData} handleCreate={handleCreate} loading={loading} toggleYear={toggleYear} />}
          {activeTab === 'activity' && <ActivityTab profile={profile} />}
        </div>
      </div>
    </div>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ profile, user }) => (
  <div className="space-y-6">
    {/* Personal Info */}
    <div>
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <FaUser className="text-purple-600" />
        <span>Personal Information</span>
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard label="Email" value={user?.email} icon="📧" />
        <InfoCard label="Phone" value={profile?.phone || 'Not provided'} icon="📱" />
        <InfoCard label="Designation" value={profile?.designation || 'Administrator'} icon="👔" />
        <InfoCard label="Department" value={profile?.department || 'Administration'} icon="🏢" />
        <InfoCard label="Joining Date" value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'} icon="📅" />
        <InfoCard label="Status" value="Active" icon="✅" />
      </div>
    </div>

    {/* Permissions */}
    <div className="border-t pt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <FaShieldAlt className="text-purple-600" />
        <span>Permissions & Access</span>
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <PermissionBadge label="User Management" granted={true} />
        <PermissionBadge label="Fee Management" granted={true} />
        <PermissionBadge label="Academic Control" granted={true} />
        <PermissionBadge label="Reports & Analytics" granted={true} />
        <PermissionBadge label="System Settings" granted={true} />
        <PermissionBadge label="Backup & Restore" granted={true} />
        <PermissionBadge label="Announcements" granted={true} />
        <PermissionBadge label="Data Export" granted={true} />
      </div>
    </div>

    {/* System Info */}
    <div className="border-t pt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <FaServer className="text-purple-600" />
        <span>System Information</span>
      </h3>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Last Login</p>
            <p className="text-lg font-semibold">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Logins</p>
            <p className="text-lg font-semibold">{profile?.loginCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Account Created</p>
            <p className="text-lg font-semibold">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==================== ANALYTICS TAB ====================
const AnalyticsTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-4 gap-6">
      <StatCard label="Total Actions" value={profile?.performanceMetrics?.totalActions || 0} color="purple" />
      <StatCard label="Students Managed" value={profile?.performanceMetrics?.studentsManaged || 0} color="blue" />
      <StatCard label="Teachers Managed" value={profile?.performanceMetrics?.teachersManaged || 0} color="green" />
      <StatCard label="Reports Generated" value={profile?.performanceMetrics?.reportsGenerated || 0} color="orange" />
    </div>

    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">📊 Performance Metrics</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Issues Resolved</p>
          <p className="text-3xl font-bold text-purple-600">{profile?.performanceMetrics?.issuesResolved || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average Response Time</p>
          <p className="text-3xl font-bold text-blue-600">{profile?.performanceMetrics?.averageResponseTime || 0}h</p>
        </div>
      </div>
    </div>
  </div>
);

// ==================== SETTINGS TAB ====================
const SettingsTab = ({ academicYears, formData, setFormData, handleCreate, loading, toggleYear }) => (
  <div className="space-y-6">

    <div className="flex items-center gap-3 mb-6">
      <FaCalendarAlt className="text-xl text-purple-600" />
      <h2 className="text-xl font-semibold">
        Academic Year Management
      </h2>
    </div>

    {/* CREATE FORM */}
    <form
      onSubmit={handleCreate}
      className="grid md:grid-cols-4 gap-6"
    >
      <input
        type="text"
        placeholder="e.g. 2025-26"
        className="input-field"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      <input
        type="date"
        className="input-field"
        value={formData.startDate}
        onChange={(e) =>
          setFormData({ ...formData, startDate: e.target.value })
        }
      />

      <input
        type="date"
        className="input-field"
        value={formData.endDate}
        onChange={(e) =>
          setFormData({ ...formData, endDate: e.target.value })
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>

    {/* YEARS LIST */}
    <div className="space-y-4 mt-6">
      {academicYears.map((year) => (
        <div
          key={year._id}
          className="flex justify-between items-center p-5 border rounded-xl hover:shadow-sm transition"
        >
          <div>
            <h3 className="font-semibold text-lg">
              {year.name}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(year.startDate).toLocaleDateString()} —{" "}
              {new Date(year.endDate).toLocaleDateString()}
            </p>
            {year.isActive && (
              <span className="inline-flex items-center gap-1 text-green-600 text-xs mt-1">
                <FaCheckCircle /> Active
              </span>
            )}
          </div>

          <button
            onClick={() => toggleYear(year._id)}
            className="text-xl text-purple-600 hover:scale-110 transition"
          >
            {year.isActive ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ==================== ACTIVITY TAB ====================
const ActivityTab = ({ profile }) => (
  <div className="space-y-4">
    {profile?.activityLog?.length > 0 ? (
      profile.activityLog.slice(-20).reverse().map((activity, idx) => (
        <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{activity.action}</h4>
              <p className="text-sm text-gray-600">{activity.module} • {activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.timestamp).toLocaleString()} • {activity.ipAddress}
              </p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-8">No recent activity</p>
    )}
  </div>
);

// ==================== HELPER COMPONENTS ====================
const InfoCard = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-sm text-gray-600 mb-1">{icon} {label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg`}>
      <p className="text-sm opacity-90 mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const SystemStatCard = ({ icon, label, value }) => (
  <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition">
    <div className="flex items-center space-x-2 mb-2">
      <div className="text-2xl">{icon}</div>
    </div>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm opacity-90">{label}</p>
  </div>
);

const PermissionBadge = ({ label, granted }) => (
  <div className={`p-3 rounded-xl flex items-center justify-between ${granted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
    <span className="text-sm font-medium">{label}</span>
    {granted ? (
      <FaCheckCircle className="text-green-600" />
    ) : (
      <span className="text-gray-400">✕</span>
    )}
  </div>
);

export default AdminProfile;
