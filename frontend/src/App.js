import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
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
import ExamManagement from "./components/teacher/ExamManagement";
import HomeworkManagement from "./components/teacher/HomeworkManagement";

/* ================= STUDENT ================= */
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentProfile from "./components/student/StudentProfile";
import StudentExamResults from "./components/student/ExamResults";
import StudentHomeworkManagement from "./components/student/HomeworkManagement";
import StudentLeaveManagement from "./components/student/LeaveManagement";

/* ================= LEAVE ================= */
import TeacherLeaveManagement from "./components/teacher/LeaveManagement";
import AdminLeaveManagement from "./components/admin/LeaveManagement";

/* ================= ADMIN - OTHER ================= */
import PermissionManager from "./components/admin/PermissionManager";

/* ================= FEE MANAGEMENT ================= */
import FeeDashboard from "./components/admin/fee/FeeDashboard";
import FeeTemplateManager from "./components/admin/fee/FeeTemplateManager";
import FeeAssignment from "./components/admin/fee/FeeAssignment";
import PaymentRecording from "./components/admin/fee/PaymentRecording";
import FeeReports from "./components/admin/fee/FeeReports";
import StudentFeePortal from "./components/student/FeePortal";

function App() {
  return (
    <ToastProvider>
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
            <Route path="leaves" element={<AdminLeaveManagement />} />
            
            {/* Fee Management Routes */}
            <Route path="fees" element={<FeeDashboard />} />
            <Route path="fees/templates" element={<FeeTemplateManager />} />
            <Route path="fees/assign" element={<FeeAssignment />} />
            <Route path="fees/payments/record" element={<PaymentRecording />} />
            <Route path="fees/reports" element={<FeeReports />} />
            
            <Route path="permissions" element={<PermissionManager />} />
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
            <Route path="exams" element={<ExamManagement />} />
            <Route path="homework" element={<HomeworkManagement />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="leaves" element={<TeacherLeaveManagement />} />
          </Route>
        </Route>

       {/* ========== STUDENT ========== */}
<Route element={<ProtectedRoute role="student" />}>
  <Route path="/student" element={<StudentLayout />}>
    <Route index element={<StudentDashboard />} />
    <Route path="profile" element={<StudentProfile />} />
    <Route path="attendance" element={<StudentAttendance />} />
    <Route path="fees" element={<StudentFeePortal />} />
    <Route path="exams" element={<StudentExamResults />} />
    <Route path="homework" element={<StudentHomeworkManagement />} />
    <Route path="leaves" element={<StudentLeaveManagement />} />
  </Route>
</Route>


        {/* ========== FALLBACK ========== */}
        <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
