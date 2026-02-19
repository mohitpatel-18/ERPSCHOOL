// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import ERPLogin from './pages/ERPLogin';
import NotFound from './pages/NotFound';

// Auth Components
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import OTPVerification from './components/auth/OTPVerification';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AddTeacher from './components/admin/AddTeacher';
import ManageTeachers from './components/admin/ManageTeachers';
import AddStudent from './components/admin/AddStudent';
import ManageStudents from './components/admin/ManageStudents';
import AttendanceReports from './components/admin/AttendanceReports';
import ManageClasses from './components/admin/ManageClasses';

// Teacher Components
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherLayout from './components/teacher/TeacherLayout';
import MarkAttendance from './components/teacher/MarkAttendance';
import ViewAttendance from './components/teacher/ViewAttendance';
import ViewStudents from './components/teacher/ViewStudents';
import TeacherProfile from './components/teacher/TeacherProfile';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import StudentLayout from './components/student/StudentLayout';
import StudentAttendance from './components/student/ViewAttendance';
import StudentProfile from './components/student/StudentProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/erp-login" element={<ERPLogin />} />
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
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="add-teacher" element={<AddTeacher />} />
              <Route path="manage-teachers" element={<ManageTeachers />} />
              <Route path="add-student" element={<AddStudent />} />
              <Route path="manage-students" element={<ManageStudents />} />
              <Route path="attendance-reports" element={<AttendanceReports />} />
              <Route path="manage-classes" element={<ManageClasses />} />
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
              <Route index element={<TeacherDashboard />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="mark-attendance" element={<MarkAttendance />} />
              <Route path="view-attendance" element={<ViewAttendance />} />
              <Route path="students" element={<ViewStudents />} />
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
              <Route index element={<StudentDashboard />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;