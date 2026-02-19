export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const DEPARTMENTS = [
  'Science',
  'Mathematics',
  'English',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Physical Education',
];

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
};