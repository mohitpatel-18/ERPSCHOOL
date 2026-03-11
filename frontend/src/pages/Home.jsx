// frontend/src/pages/Home.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaAward,
  FaUsers,
  FaShieldAlt,
  FaCloud,
  FaMobileAlt,
  FaRobot,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';

const Home = () => {
  const [activePersona, setActivePersona] = useState('admin');

  const features = [
    {
      icon: <FaGraduationCap className="text-4xl text-primary-600" />,
      title: 'Quality Education',
      description: 'Comprehensive curriculum designed for holistic development',
    },
    {
      icon: <FaChalkboardTeacher className="text-4xl text-primary-600" />,
      title: 'Expert Faculty',
      description: 'Highly qualified and experienced teachers',
    },
    {
      icon: <FaChartLine className="text-4xl text-primary-600" />,
      title: 'Smart ERP System',
      description: 'Advanced technology for seamless management',
    },
    {
      icon: <FaCalendarAlt className="text-4xl text-primary-600" />,
      title: 'Digital Attendance',
      description: 'Real-time attendance tracking and reports',
    },
  ];

  const stats = [
    { icon: <FaUserGraduate />, value: '1000+', label: 'Students' },
    { icon: <FaChalkboardTeacher />, value: '50+', label: 'Teachers' },
    { icon: <FaBook />, value: '30+', label: 'Courses' },
    { icon: <FaAward />, value: '100%', label: 'Success Rate' },
  ];

  const enterpriseCapabilities = [
    {
      icon: <FaShieldAlt className="text-2xl text-success-500" />,
      title: 'Role-based security',
      description: 'Granular permissions with audit-friendly workflows for admins, faculty, and students.',
    },
    {
      icon: <FaCloud className="text-2xl text-primary-500" />,
      title: 'Cloud-ready operations',
      description: 'Centralized records, backups, and cross-campus data availability with minimal downtime.',
    },
    {
      icon: <FaMobileAlt className="text-2xl text-secondary-500" />,
      title: 'Mobile-first experience',
      description: 'Responsive portals for attendance, homework, fee tracking, and communication on the go.',
    },
    {
      icon: <FaRobot className="text-2xl text-warning-500" />,
      title: 'Analytics driven planning',
      description: 'Performance trends and actionable insights to improve student outcomes and resource planning.',
    },
  ];

  const personaContent = useMemo(
    () => ({
      admin: {
        title: 'Principal & Admin View',
        points: ['Live admissions funnel', 'Fee collection visibility', 'Staff workload balancing', 'Policy notifications with acknowledgement tracking'],
      },
      teacher: {
        title: 'Teacher Productivity View',
        points: ['One-click attendance sheets', 'Homework scheduling with due-date reminders', 'Exam result publishing workflows', 'Parent-ready progress snapshots'],
      },
      student: {
        title: 'Student Success View',
        points: ['Daily timetable and homework board', 'Attendance percentage tracker', 'Digital marksheet and result insights', 'Fee and leave request status updates'],
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                <FaCheckCircle /> Trusted by modern schools
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Welcome to
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {' '}Samrose Nalanda School
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Shaping futures through excellence in education. Join us in our journey of
                academic brilliance and character building.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/erp-login"
                  className="btn-primary text-center"
                >
                  Access ERP System
                </Link>
                <Link
                  to="/about"
                  className="btn-secondary text-center"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-96 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaGraduationCap className="text-white text-9xl opacity-20" />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 rounded-xl p-3 text-gray-800 text-sm font-semibold shadow-lg">
                  99.2% uptime this quarter
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-8">
                  <h3 className="text-white text-2xl font-bold">Empowering Tomorrow's Leaders</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-4xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Industry-level School Operations</h2>
              <p className="text-lg text-gray-600 mb-8">Enterprise-grade workflows designed to scale from one campus to multi-branch institutions.</p>
              <div className="space-y-5">
                {enterpriseCapabilities.map((capability, index) => (
                  <motion.div
                    key={capability.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card flex items-start gap-4"
                  >
                    <div className="mt-1">{capability.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{capability.title}</h3>
                      <p className="text-gray-600 mt-1">{capability.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Role-specific Productivity Workspace</h3>
              <p className="text-gray-600 mb-6">Switch personas to preview how every stakeholder gets a focused experience.</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {Object.keys(personaContent).map((persona) => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => setActivePersona(persona)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                      activePersona === persona
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {persona.charAt(0).toUpperCase() + persona.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-primary-50 rounded-xl p-5">
                <h4 className="font-bold text-primary-700 mb-4">{personaContent[activePersona].title}</h4>
                <ul className="space-y-3">
                  {personaContent[activePersona].points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-gray-700">
                      <FaCheckCircle className="text-success-500 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              Discover the features that make us stand out
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:scale-105 transform transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ERP Access Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Access Our ERP System
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Seamless management for administrators, teachers, and students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {['Admin', 'Teacher', 'Student'].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                  <FaUsers className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{role} Portal</h3>
                <p className="text-gray-600 mb-6">
                  {role === 'Admin' && 'Manage entire school operations efficiently'}
                  {role === 'Teacher' && 'Track attendance and manage students'}
                  {role === 'Student' && 'View attendance and academic progress'}
                </p>
                <Link
                  to="/erp-login"
                  state={{ role: role.toLowerCase() }}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  Login as {role} <FaArrowRight className="text-xs" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Experience excellence in education with our modern facilities and dedicated staff
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all"
              >
                Contact Us
              </Link>
              <Link
                to="/about"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
