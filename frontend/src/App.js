import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentAttendance from "./components/student/StudentAttendance";


/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ERPLogin from "./pages/ERPLogin";
import NotFound from "./pages/NotFound";

/* ================= AUTH ================= */
import Register from "./components/auth/Register";
import OTPVerification from "./components/auth/OTPVerification";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

/* ================= COMMON ================= */
import ProtectedRoute from "./common/ProtectedRoute";

/* ================= ADMIN ================= */
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddTeacher from "./components/admin/AddTeacher";
import AddStudent from "./components/admin/AddStudent";
import ManageTeachers from "./components/admin/ManageTeachers";
import ManageStudents from "./components/admin/ManageStudents";
import ManageClasses from "./components/admin/ManageClasses";
import AttendanceReports from "./components/admin/AttendanceReports";
import Announcements from "./components/admin/Announcements";
import AdminProfile from "./components/admin/AdminProfile";


/* ================= TEACHER ================= */
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import MarkAttendance from "./components/teacher/MarkAttendance";
import ViewAttendance from "./components/teacher/ViewAttendance";
import ViewStudents from "./components/teacher/ViewStudents";
import TeacherProfile from "./components/teacher/TeacherProfile";
import AddStudentTeacher from "./components/teacher/AddStudent";

/* ================= STUDENT ================= */
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentProfile from "./components/student/StudentProfile";
import StudentFees from "./components/student/StudentFees";

/* ================= LEAVE ================= */
import ApplyLeave from "./components/teacher/ApplyLeave";
import MyLeaves from "./components/teacher/MyLeaves";
import LeaveRequests from "./components/admin/LeaveRequests";

import FeeDashboard from "./components/admin/FeeDashboard";
import FeeStructure from "./components/admin/FeeStructure";
import GenerateLedger from "./components/admin/GenerateLedger";

function App() {
  return (
    <Router>
      <Routes>

        {/* ========== PUBLIC ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/erp-login" element={<ERPLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ========== AUTH ========== */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ========== ADMIN ========== */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="teachers/add" element={<AddTeacher />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="students/add" element={<AddStudent />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="attendance" element={<AttendanceReports />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="leaves" element={<LeaveRequests />} />
            <Route path="fees" element={<FeeDashboard />} />
            <Route path="fees/structure" element={<FeeStructure />} />
            <Route path="fees/generate" element={<GenerateLedger />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* ========== TEACHER ========== */}
        <Route element={<ProtectedRoute role="teacher" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="add-student" element={<AddStudentTeacher />} />
            <Route path="students" element={<ViewStudents />} />
            <Route path="attendance/mark" element={<MarkAttendance />} />
            <Route path="attendance/view" element={<ViewAttendance />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
          </Route>
        </Route>

       {/* ========== STUDENT ========== */}
<Route element={<ProtectedRoute role="student" />}>
  <Route path="/student" element={<StudentLayout />}>
    <Route index element={<StudentDashboard />} />
    <Route path="profile" element={<StudentProfile />} />
    <Route path="attendance" element={<StudentAttendance />} />
    <Route path="fees" element={<StudentFees />} />
  </Route>
</Route>


        {/* ========== FALLBACK ========== */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;
