import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { FaEye, FaBullseye, FaHeart } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Samrose Nalanda School has been a beacon of educational excellence since 1995, 
              nurturing young minds and shaping future leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="card text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <FaBullseye className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide quality education that empowers students with knowledge, 
                skills, and values to excel in their chosen paths and contribute 
                positively to society.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <FaEye className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be recognized as a leading educational institution that fosters 
                holistic development, critical thinking, and innovation in every student.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <FaHeart className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Integrity, Excellence, Innovation, Respect, and Compassion form the 
                foundation of everything we do at Samrose Nalanda School.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 1995, Samrose Nalanda School began with a simple vision: 
                to provide quality education to students in Narsinghpur and surrounding areas. 
                Over the years, we have grown from a small institution with a handful of 
                students to a thriving educational community with over 1000 students and 
                50+ dedicated faculty members.
              </p>
              <p className="text-gray-600 mb-4">
                Our state-of-the-art facilities, modern teaching methodologies, and 
                commitment to holistic development have made us one of the most trusted 
                educational institutions in the region.
              </p>
              <p className="text-gray-600">
                We take pride in our student-centric approach, where every child is 
                recognized as unique and provided with personalized attention to help 
                them reach their full potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative h-96 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-2">30+</div>
                  <div className="text-xl">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">World-Class Facilities</h2>
            <p className="text-xl text-gray-600">
              Everything you need for a complete learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'Smart Classrooms',
              'Science Laboratories',
              'Computer Labs',
              'Library',
              'Sports Complex',
              'Arts & Crafts Center',
              'Auditorium',
              'Cafeteria',
              'Transportation',
            ].map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900">{facility}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
