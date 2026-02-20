import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationCenter } from './components/ui';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import ERPLogin from './pages/ERPLogin';
import NotFound from './pages/NotFound';

// Auth Components
import { Register, ForgotPassword, OTPVerification, ResetPassword } from './components/auth';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardEnhanced from './components/admin/AdminDashboardEnhanced';
import ManageStudents from './components/admin/ManageStudents';
import ManageTeachers from './components/admin/ManageTeachers';
import ManageClasses from './components/admin/ManageClasses';
import AddStudent from './components/admin/AddStudent';
import AddTeacher from './components/admin/AddTeacher';
import FeeManagement from './components/admin/FeeManagement';
import Announcements from './components/admin/Announcements';
import LeaveRequests from './components/admin/LeaveRequests';
import AttendanceReports from './components/admin/AttendanceReports';
import AdminProfile from './components/admin/AdminProfile';
import PermissionManager from './components/admin/PermissionManager';

// Teacher Components
import TeacherLayout from './components/teacher/TeacherLayout';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import MarkAttendance from './components/teacher/MarkAttendance';
import ViewAttendance from './components/teacher/ViewAttendance';
import ViewStudents from './components/teacher/ViewStudents';
import HomeworkManagement from './components/teacher/HomeworkManagement';
import ExamManagement from './components/teacher/ExamManagement';
import ApplyLeave from './components/teacher/ApplyLeave';
import MyLeaves from './components/teacher/MyLeaves';
import TeacherProfile from './components/teacher/TeacherProfile';

// Student Components
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './components/student/StudentDashboard';
import StudentAttendance from './components/student/StudentAttendance';
import StudentHomework from './components/student/StudentHomework';
import StudentExams from './components/student/StudentExams';
import StudentFees from './components/student/StudentFees';
import StudentProfile from './components/student/StudentProfile';

// Protected Route
import ProtectedRoute from './common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global Notification System */}
        <NotificationCenter />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<ERPLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardEnhanced />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="add-teacher" element={<AddTeacher />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="leaves" element={<LeaveRequests />} />
            <Route path="attendance-reports" element={<AttendanceReports />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="permissions" element={<PermissionManager />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="view-attendance" element={<ViewAttendance />} />
            <Route path="students" element={<ViewStudents />} />
            <Route path="homework" element={<HomeworkManagement />} />
            <Route path="exams" element={<ExamManagement />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="homework" element={<StudentHomework />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
