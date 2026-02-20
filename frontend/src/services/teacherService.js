import api from './api';

export const teacherService = {
  /* ================= DASHBOARD ================= */
  getDashboard: () => api.get('/teacher/dashboard'),

  /* ================= PROFILE ================= */
  getProfile: () => api.get('/teacher/profile'),

  /* ================= STUDENTS ================= */
  addStudent: data => api.post('/teacher/students', data),

  getStudentsByClass: classId =>
    api.get(`/teacher/students/${classId}`),

  /* ================= ATTENDANCE ================= */
  markAttendance: data =>
    api.post('/teacher/attendance/mark', data),

  getAttendanceByClass: (classId, params) =>
    api.get(`/teacher/attendance/${classId}`, { params }),

  updateAttendance: (attendanceId, data) =>
    api.put(`/teacher/attendance/${attendanceId}`, data),

  /* ================= LEAVE MANAGEMENT ================= */
  applyLeave: (formData) =>
    api.post("/leaves/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getMyLeaves: (params) =>
    api.get("/leaves/my", { params }),

  getLeaveBalance: () =>
    api.get("/leaves/balance"),

  cancelLeave: (id, data) =>
    api.put(`/leaves/${id}/cancel`, data),
};
