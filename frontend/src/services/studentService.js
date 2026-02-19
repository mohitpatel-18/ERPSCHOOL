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
};
