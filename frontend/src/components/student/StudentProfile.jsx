import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEdit, FaCamera, FaFileUpload, FaTrophy, 
  FaHeartbeat, FaBus, FaHome, FaBook, FaCheckCircle 
} from 'react-icons/fa';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getStudentProfile();
      setProfile(res.data.data);
      setFormData(res.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Photo size must be less than 2MB');
    }

    try {
      await profileService.uploadStudentPhoto(file);
      toast.success('Photo uploaded successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Photo upload failed');
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await profileService.updateStudentProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
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
    { id: 'academic', label: 'Academic', icon: FaBook },
    { id: 'medical', label: 'Medical', icon: FaHeartbeat },
    { id: 'activities', label: 'Activities', icon: FaTrophy },
    { id: 'documents', label: 'Documents', icon: FaFileUpload },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        {/* Edit Button - Top Right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition font-semibold shadow-lg"
          >
            <FaEdit className="text-lg" />
            <span>{editing ? '✖ Cancel Edit' : '✏️ Edit Profile'}</span>
          </button>
        </div>

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
              className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:scale-110 transition"
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

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
            <p className="text-indigo-100 text-lg">Student ID: {profile?.studentId}</p>
            <p className="text-indigo-100">Class: {profile?.class?.name} - {profile?.section}</p>
            <div className="mt-2 flex items-center space-x-2">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Roll No: {profile?.rollNumber}
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                <FaCheckCircle />
                <span>{profile?.profileCompletion || 0}% Complete</span>
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
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab profile={profile} editing={editing} formData={formData} setFormData={setFormData} handleUpdate={handleUpdate} />}
          {activeTab === 'academic' && <AcademicTab profile={profile} />}
          {activeTab === 'medical' && <MedicalTab profile={profile} editing={editing} formData={formData} setFormData={setFormData} handleUpdate={handleUpdate} />}
          {activeTab === 'activities' && <ActivitiesTab profile={profile} />}
          {activeTab === 'documents' && <DocumentsTab profile={profile} fetchProfile={fetchProfile} />}
        </div>
      </div>
    </motion.div>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ profile, editing, formData, setFormData, handleUpdate }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editing ? (
          <>
            <EditField label="Phone" value={formData?.contactNumber || ''} onChange={(v) => handleChange('contactNumber', v)} icon="📱" />
            <EditField label="Blood Group" value={formData?.bloodGroup || ''} onChange={(v) => handleChange('bloodGroup', v)} icon="🩸" />
          </>
        ) : (
          <>
            <InfoCard label="Email" value={profile?.email} icon="📧" />
            <InfoCard label="Phone" value={profile?.contactNumber || 'Not provided'} icon="📱" />
            <InfoCard label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} icon="🎂" />
            <InfoCard label="Blood Group" value={profile?.bloodGroup || 'N/A'} icon="🩸" />
            <InfoCard label="Gender" value={profile?.gender} icon="👤" />
            <InfoCard label="Admission Date" value={new Date(profile?.admissionDate).toLocaleDateString()} icon="📅" />
          </>
        )}
      </div>

      {/* Parent Info */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <FaHome className="text-indigo-600" />
          <span>Parent Information</span>
        </h3>
        {editing ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl space-y-3">
              <h4 className="font-semibold text-blue-900 mb-3">Father Details</h4>
              <input
                type="text"
                placeholder="Father's Name"
                value={formData?.parentInfo?.father?.name || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'father', { ...formData?.parentInfo?.father, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Father's Phone"
                value={formData?.parentInfo?.father?.phone || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'father', { ...formData?.parentInfo?.father, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Father's Occupation"
                value={formData?.parentInfo?.father?.occupation || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'father', { ...formData?.parentInfo?.father, occupation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="bg-pink-50 p-4 rounded-xl space-y-3">
              <h4 className="font-semibold text-pink-900 mb-3">Mother Details</h4>
              <input
                type="text"
                placeholder="Mother's Name"
                value={formData?.parentInfo?.mother?.name || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'mother', { ...formData?.parentInfo?.mother, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Mother's Phone"
                value={formData?.parentInfo?.mother?.phone || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'mother', { ...formData?.parentInfo?.mother, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Mother's Occupation"
                value={formData?.parentInfo?.mother?.occupation || ''}
                onChange={(e) => handleNestedChange('parentInfo', 'mother', { ...formData?.parentInfo?.mother, occupation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-3">Father Details</h4>
              <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{profile?.parentInfo?.father?.name || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{profile?.parentInfo?.father?.phone || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Occupation: <span className="font-medium text-gray-900">{profile?.parentInfo?.father?.occupation || 'N/A'}</span></p>
            </div>
            <div className="bg-pink-50 p-4 rounded-xl">
              <h4 className="font-semibold text-pink-900 mb-3">Mother Details</h4>
              <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{profile?.parentInfo?.mother?.name || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{profile?.parentInfo?.mother?.phone || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Occupation: <span className="font-medium text-gray-900">{profile?.parentInfo?.mother?.occupation || 'N/A'}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Address</h3>
        {editing ? (
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street"
              value={formData?.address?.street || ''}
              onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="City"
              value={formData?.address?.city || ''}
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="State"
              value={formData?.address?.state || ''}
              onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Pincode"
              value={formData?.address?.pincode || ''}
              onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">
              {profile?.address?.street}, {profile?.address?.city}, {profile?.address?.state} - {profile?.address?.pincode}
            </p>
          </div>
        )}
      </div>

      {editing && (
        <button onClick={handleUpdate} className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-semibold">
          💾 Save Changes
        </button>
      )}
    </div>
  );
};

// ==================== ACADEMIC TAB ====================
const AcademicTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-4 gap-6">
      <StatCard label="Overall Grade" value={profile?.academicPerformance?.overallGrade || 'N/A'} color="blue" />
      <StatCard label="Percentage" value={`${profile?.academicPerformance?.overallPercentage || 0}%`} color="green" />
      <StatCard label="Rank" value={profile?.academicPerformance?.rank || 'N/A'} color="purple" />
      <StatCard label="Attendance" value={`${profile?.academicPerformance?.attendance || 0}%`} color="orange" />
    </div>

    {profile?.previousSchool?.schoolName && (
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Previous School</h3>
        <div className="bg-gray-50 p-6 rounded-xl space-y-2">
          <p><span className="font-semibold">School:</span> {profile.previousSchool.schoolName}</p>
          <p><span className="font-semibold">Board:</span> {profile.previousSchool.board}</p>
          <p><span className="font-semibold">Last Percentage:</span> {profile.previousSchool.lastPercentage}%</p>
        </div>
      </div>
    )}
  </div>
);

// ==================== MEDICAL TAB ====================
const MedicalTab = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <InfoCard label="Height" value={`${profile?.medicalInfo?.height || 'N/A'} cm`} icon="📏" />
      <InfoCard label="Weight" value={`${profile?.medicalInfo?.weight || 'N/A'} kg`} icon="⚖️" />
      <InfoCard label="Blood Group" value={profile?.bloodGroup || 'N/A'} icon="🩸" />
    </div>

    {profile?.medicalInfo?.allergies?.length > 0 && (
      <div className="bg-red-50 p-4 rounded-xl">
        <h4 className="font-semibold text-red-900 mb-2">⚠️ Allergies</h4>
        <div className="flex flex-wrap gap-2">
          {profile.medicalInfo.allergies.map((allergy, idx) => (
            <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              {allergy}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ==================== ACTIVITIES TAB ====================
const ActivitiesTab = ({ profile }) => (
  <div className="space-y-4">
    {profile?.activities?.length > 0 ? (
      profile.activities.map((activity, idx) => (
        <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900">{activity.activityName}</h4>
              <p className="text-sm text-gray-600 mt-1">{activity.category} • {activity.level}</p>
              <p className="text-gray-700 mt-2">{activity.achievements}</p>
            </div>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {activity.year}
            </span>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-8">No activities recorded yet</p>
    )}
  </div>
);

// ==================== DOCUMENTS TAB ====================
const DocumentsTab = ({ profile, fetchProfile }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await profileService.addStudentDocument(file, 'Other', file.name);
      toast.success('Document uploaded!');
      fetchProfile();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-indigo-300 rounded-xl p-8 hover:border-indigo-500 hover:bg-indigo-50 transition text-center"
      >
        <FaFileUpload className="text-4xl text-indigo-400 mx-auto mb-2" />
        <p className="text-indigo-600 font-medium">Click to upload document</p>
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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg`}>
      <p className="text-sm opacity-90 mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StudentProfile;