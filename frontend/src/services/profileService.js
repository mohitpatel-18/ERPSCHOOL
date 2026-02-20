import api from './api';

const profileService = {
  // ==================== STUDENT PROFILE ====================
  getStudentProfile: async () => {
    return await api.get('/profile/student');
  },

  updateStudentProfile: async (data) => {
    return await api.put('/profile/student', data);
  },

  uploadStudentPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return await api.post('/profile/student/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addStudentDocument: async (file, documentType, documentName) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('documentName', documentName);
    return await api.post('/profile/student/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addStudentActivity: async (activityData) => {
    return await api.post('/profile/student/activity', activityData);
  },

  // ==================== TEACHER PROFILE ====================
  getTeacherProfile: async () => {
    return await api.get('/profile/teacher');
  },

  updateTeacherProfile: async (data) => {
    return await api.put('/profile/teacher', data);
  },

  uploadTeacherPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return await api.post('/profile/teacher/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addTeacherCertification: async (file, certData) => {
    const formData = new FormData();
    if (file) formData.append('certificate', file);
    Object.keys(certData).forEach(key => {
      formData.append(key, certData[key]);
    });
    return await api.post('/profile/teacher/certification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addTeacherTraining: async (file, trainingData) => {
    const formData = new FormData();
    if (file) formData.append('certificate', file);
    Object.keys(trainingData).forEach(key => {
      formData.append(key, trainingData[key]);
    });
    return await api.post('/profile/teacher/training', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addTeacherDocument: async (file, documentType, documentName) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('documentName', documentName);
    return await api.post('/profile/teacher/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ==================== ADMIN PROFILE ====================
  getAdminProfile: async () => {
    return await api.get('/profile/admin');
  },

  updateAdminProfile: async (data) => {
    return await api.put('/profile/admin', data);
  },

  uploadAdminPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return await api.post('/profile/admin/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default profileService;
