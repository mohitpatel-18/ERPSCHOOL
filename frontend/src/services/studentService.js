import api from './api';

export const studentService = {
  /* ================= DASHBOARD ================= */
  getDashboard: () =>
    api.get('/student/dashboard'),

  /* ================= ATTENDANCE ================= */
  getAttendance: (params) =>
    api.get('/student/attendance', { params }),

  /* ================= PROFILE ================= */
  getProfile: () =>
    api.get('/student/profile'),

  /* ================= FEES ================= */
  getFees: () =>
    api.get('/student/fees'),

  /* ================= LEAVE MANAGEMENT ================= */
  applyLeave: (formData) =>
    api.post('/student/leave', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getMyLeaves: (params) =>
    api.get('/student/leave', { params }),

  /* ================= EXAMS ================= */
  getExams: () =>
    api.get('/student/exams'),

  /* ================= HOMEWORK ================= */
  getHomework: () =>
    api.get('/student/homework'),

  submitHomework: (formData) =>
    api.post('/student/homework/submit', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
