// frontend/src/pages/Home.jsx
import React from 'react';
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
  FaUsers
} from 'react-icons/fa';

const Home = () => {
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
                  className="btn-primary w-full"
                >
                  Login as {role}
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