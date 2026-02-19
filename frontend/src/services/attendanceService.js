import api from './api';

export const attendanceService = {
  /* ================= ADMIN ================= */

  // Admin attendance stats (present / absent)
  getReports: (params) =>
    api.get('/admin/attendance', { params }),

  // Admin monthly PDF
  downloadMonthlyPDF: (params) =>
    api.get('/admin/attendance/report/pdf', {
      params,
      responseType: 'blob', // 🔥 MUST
    }),

  /* ================= STUDENT ================= */

  getStudentAttendance: (studentId, params) =>
    api.get(`/attendance/student/${studentId}`, { params }),
};
