import api from './api';

export const adminService = {

  /* ================= DASHBOARD ================= */
  getDashboard: () => api.get('/admin/dashboard'),
  getWeeklyAttendance: () => api.get('/admin/attendance/weekly'),

  /* ================= TEACHERS ================= */
  getAllTeachers: () => api.get('/admin/teachers'),
  getTeacher: (id) => api.get(`/admin/teachers/${id}`),
  addTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),

  /* ================= STUDENTS ================= */
  getAllStudents: (params) =>
    api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  addStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  /* ================= CLASSES ================= */
  getAllClasses: () => api.get('/class'),
  addClass: (data) => api.post('/class', data),
  deleteClass: (id) => api.delete(`/class/${id}`),

  /* ================= ANALYTICS ================= */
  getStudentGrowth: () =>
    api.get('/admin/analytics/students-growth'),

  getAttendanceTrend: () =>
    api.get('/admin/analytics/attendance-trend'),

  getClassAttendanceStats: () =>
    api.get('/admin/analytics/class-attendance'),

  getRiskStudents: () =>
    api.get('/admin/analytics/risk-students'),

  /* ================= ANNOUNCEMENTS ================= */

  getAnnouncements: () =>
    api.get('/announcements'),

  getAllAnnouncementsAdmin: () =>
    api.get('/announcements/admin/all'),

  createAnnouncement: (data) =>
    api.post('/announcements', data),

  updateAnnouncement: (id, data) =>
    api.put(`/announcements/${id}`, data),

  deleteAnnouncement: (id) =>
    api.delete(`/announcements/${id}`),

  toggleAnnouncement: (id) =>
    api.patch(`/announcements/${id}/toggle`),

  /* ================= LEAVES ================= */

  getAllLeaves: (params) => api.get("/leaves", { params }),

  updateLeaveStatus: (id, data) =>
    api.put(`/leaves/${id}/status`, data),

  getLeaveAnalytics: (params) =>
    api.get("/leaves/analytics", { params }),

  /* ================= FEE MANAGEMENT ================= */

  // 📊 Dashboard Summary
  getFeeSummary: () =>
    api.get('/fees/admin/summary'),

  // 📈 Monthly Collection Trend
  getCollectionTrend: () =>
    api.get('/fees/admin/trend'),

  // 💳 Recent Payments
  getRecentPayments: () =>
    api.get('/fees/admin/recent-payments'),

// 📅 Academic Years
getAcademicYears: () =>
  api.get("/academic-years"),

  // 🏗 Create Fee Structure
  createFeeStructure: (data) =>
    api.post('/fees/structure', data),

  // 📅 Generate Monthly Ledger
  generateLedger: (data) =>
  api.post('/fees/generate', data),

  // 👨‍🎓 Get Student Ledger
  getStudentLedger: (studentId) =>
    api.get(`/fees/student/${studentId}`),

  // 💰 Record Manual Payment
  recordPayment: (ledgerId, data) =>
    api.post(`/fees/pay/${ledgerId}`, data),

  // ⏰ Apply Late Fine Manually
  applyLateFine: () =>
  api.post('/fees/late-fine'),
  // 📊 Collection Report
  getCollectionReport: (classId) =>
  api.get(`/fees/report/${classId}`),
/* ================= ACADEMIC YEARS ================= */

createAcademicYear: (data) =>
  api.post("/academic-years", data),

getAcademicYears: () =>
  api.get("/academic-years"),

toggleAcademicYear: (id) =>
  api.patch(`/academic-years/${id}/toggle`),

};
