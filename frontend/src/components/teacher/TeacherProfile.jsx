import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEdit, FaCamera, FaCertificate, FaChalkboardTeacher, 
  FaFileUpload, FaAward, FaChartLine, FaCheckCircle, FaGraduationCap 
} from 'react-icons/fa';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getTeacherProfile();
      setProfile(res.data.data);
      setFormData(res.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await profileService.updateTeacherProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Photo size must be less than 2MB');
    }

    try {
      await profileService.uploadTeacherPhoto(file);
      toast.success('Photo uploaded successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Photo upload failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'professional', label: 'Professional', icon: FaGraduationCap },
    { id: 'certifications', label: 'Certifications', icon: FaCertificate },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'documents', label: 'Documents', icon: FaFileUpload },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white">
        {/* Edit Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition font-semibold shadow-lg"
          >
            <FaEdit className="text-lg" />
            <span>{editing ? '✖ Cancel Edit' : '✏️ Edit Profile'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center overflow-hidden border-4 border-white/30">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:scale-110 transition"
              >
                <FaCamera className="text-sm" />
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
              <h1 className="text-3xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
              <p className="text-blue-100 text-lg">{profile?.designation || 'Teacher'}</p>
              <p className="text-blue-100">Employee ID: {profile?.employeeId}</p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {profile?.department}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {profile?.experience} years exp
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <FaCheckCircle />
                  <span>{profile?.profileCompletion || 0}% Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Completion</span>
            <span>{profile?.profileCompletion || 0}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${profile?.profileCompletion || 0}%` }}
            />
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
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab profile={profile} />}
          {activeTab === 'professional' && <ProfessionalTab profile={profile} />}
          {activeTab === 'certifications' && <CertificationsTab profile={profile} fetchProfile={fetchProfile} />}
          {activeTab === 'performance' && <PerformanceTab profile={profile} />}
          {activeTab === 'documents' && <DocumentsTab profile={profile} fetchProfile={fetchProfile} />}
        </div>
      </div>
    </motion.div>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InfoCard label="Email" value={profile?.email} icon="📧" />
      <InfoCard label="Phone" value={profile?.phone} icon="📱" />
      <InfoCard label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} icon="🎂" />
      <InfoCard label="Blood Group" value={profile?.bloodGroup || 'N/A'} icon="🩸" />
      <InfoCard label="Qualification" value={profile?.qualification || 'N/A'} icon="🎓" />
      <InfoCard label="Joining Date" value={new Date(profile?.joiningDate).toLocaleDateString()} icon="📅" />
    </div>

    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="bg-blue-50 p-6 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-3">🏫 Teaching Information</h4>
        <p className="text-sm text-gray-600 mb-2">Assigned Classes: <span className="font-medium text-gray-900">{profile?.assignedClasses?.length || 0}</span></p>
        <p className="text-sm text-gray-600 mb-2">Subjects: <span className="font-medium text-gray-900">{profile?.subjects?.join(', ') || 'N/A'}</span></p>
        <p className="text-sm text-gray-600">Teaching Load: <span className="font-medium text-gray-900">{profile?.teachingLoad?.periodsPerWeek || 0} periods/week</span></p>
      </div>

      <div className="bg-green-50 p-6 rounded-xl">
        <h4 className="font-semibold text-green-900 mb-3">📊 Leave Balance</h4>
        <p className="text-sm text-gray-600 mb-2">Casual: <span className="font-medium text-gray-900">{profile?.leaveBalance?.casual || 0}</span></p>
        <p className="text-sm text-gray-600 mb-2">Sick: <span className="font-medium text-gray-900">{profile?.leaveBalance?.sick || 0}</span></p>
        <p className="text-sm text-gray-600">Earned: <span className="font-medium text-gray-900">{profile?.leaveBalance?.earned || 0}</span></p>
      </div>
    </div>

    {/* Address */}
    <div className="border-t pt-6">
      <h3 className="text-xl font-bold mb-4">Contact Information</h3>
      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Address: </span>
          {profile?.address?.street}, {profile?.address?.city}, {profile?.address?.state} - {profile?.address?.pincode}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Emergency Contact: </span>
          {profile?.emergencyContact?.name} ({profile?.emergencyContact?.relation}) - {profile?.emergencyContact?.phone}
        </p>
      </div>
    </div>
  </div>
);

// ==================== PROFESSIONAL TAB ====================
const ProfessionalTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <InfoCard label="Highest Degree" value={profile?.highestDegree || 'N/A'} icon="🎓" />
      <InfoCard label="University" value={profile?.university || 'N/A'} icon="🏛️" />
      <InfoCard label="Graduation Year" value={profile?.graduationYear || 'N/A'} icon="📅" />
    </div>

    <div className="border-t pt-6">
      <h3 className="text-xl font-bold mb-4">🎯 Specialization</h3>
      <div className="flex flex-wrap gap-2">
        {profile?.specialization?.map((spec, idx) => (
          <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            {spec}
          </span>
        ))}
      </div>
    </div>

    {profile?.trainings?.length > 0 && (
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">📚 Training History</h3>
        <div className="space-y-3">
          {profile.trainings.map((training, idx) => (
            <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-gray-900">{training.trainingName}</h4>
              <p className="text-sm text-gray-600">{training.provider} • {training.duration} hours</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ==================== CERTIFICATIONS TAB ====================
const CertificationsTab = ({ profile, fetchProfile }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    certificationName: '',
    issuingOrganization: '',
    issueDate: '',
  });
  const [file, setFile] = useState(null);

  const handleAddCertification = async (e) => {
    e.preventDefault();
    try {
      await profileService.addTeacherCertification(file, formData);
      toast.success('Certification added!');
      setShowAddForm(false);
      setFormData({ certificationName: '', issuingOrganization: '', issueDate: '' });
      setFile(null);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add certification');
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
      >
        {showAddForm ? 'Cancel' : '+ Add New Certification'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddCertification} className="bg-blue-50 p-6 rounded-xl space-y-4">
          <input
            type="text"
            placeholder="Certification Name"
            value={formData.certificationName}
            onChange={(e) => setFormData({...formData, certificationName: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Issuing Organization"
            value={formData.issuingOrganization}
            onChange={(e) => setFormData({...formData, issuingOrganization: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Add Certification
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {profile?.certifications?.map((cert, idx) => (
          <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-l-4 border-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                  <FaAward className="text-orange-500" />
                  <span>{cert.certificationName}</span>
                </h4>
                <p className="text-sm text-gray-600 mt-1">{cert.issuingOrganization}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </p>
              </div>
              {cert.isVerified && (
                <FaCheckCircle className="text-green-500 text-xl" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== PERFORMANCE TAB ====================
const PerformanceTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <StatCard label="Average Rating" value={`${profile?.performanceMetrics?.averageRating || 0}/5`} color="blue" />
      <StatCard label="Student Satisfaction" value={`${profile?.performanceMetrics?.studentSatisfaction || 0}%`} color="green" />
      <StatCard label="Punctuality" value={`${profile?.performanceMetrics?.punctuality || 0}%`} color="purple" />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <InfoCard label="Total Reviews" value={profile?.performanceMetrics?.totalReviews || 0} icon="📝" />
      <InfoCard label="Result Percentage" value={`${profile?.performanceMetrics?.resultPercentage || 0}%`} icon="📊" />
    </div>

    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">📈 Attendance Stats</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Present</p>
          <p className="text-2xl font-bold text-green-600">{profile?.attendanceStats?.totalPresent || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Leaves</p>
          <p className="text-2xl font-bold text-orange-600">{profile?.attendanceStats?.totalLeaves || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Attendance %</p>
          <p className="text-2xl font-bold text-blue-600">{profile?.attendanceStats?.attendancePercentage || 0}%</p>
        </div>
      </div>
    </div>
  </div>
);

// ==================== DOCUMENTS TAB ====================
const DocumentsTab = ({ profile, fetchProfile }) => {
  const fileInputRef = useRef(null);

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await profileService.addTeacherDocument(file, 'Other', file.name);
      toast.success('Document uploaded!');
      fetchProfile();
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition text-center"
      >
        <FaFileUpload className="text-4xl text-blue-400 mx-auto mb-2" />
        <p className="text-blue-600 font-medium">Click to upload document</p>
        <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleDocumentUpload}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {profile?.documents?.map((doc, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold">{doc.documentName}</p>
              <p className="text-sm text-gray-600">{doc.documentType}</p>
              <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
            </div>
            {doc.isVerified && (
              <FaCheckCircle className="text-green-500 text-xl" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================
const InfoCard = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-sm text-gray-600 mb-1">{icon} {label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const EditField = ({ label, value, onChange, icon }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-sm text-gray-600 mb-2">{icon} {label}</p>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg`}>
      <p className="text-sm opacity-90 mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default TeacherProfile;
