/**
 * Class Seeder
 * Creates default classes for testing
 */

const Class = require('../../models/Class');
const AcademicYear = require('../../models/AcademicYear');
const logger = require('../logger');

const seedClasses = async () => {
  try {
    const existingCount = await Class.countDocuments();
    
    if (existingCount > 0) {
      logger.info(`Classes already exist (${existingCount}). Skipping seed.`);
      return;
    }
    
    // Get current academic year
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    
    if (!currentYear) {
      logger.warn('No current academic year found. Please seed academic years first.');
      return;
    }
    
    const classes = [];
    const grades = [
      { name: 'Nursery', grade: 0 },
      { name: 'LKG', grade: 1 },
      { name: 'UKG', grade: 2 },
      { name: 'Class 1', grade: 3 },
      { name: 'Class 2', grade: 4 },
      { name: 'Class 3', grade: 5 },
      { name: 'Class 4', grade: 6 },
      { name: 'Class 5', grade: 7 },
      { name: 'Class 6', grade: 8 },
      { name: 'Class 7', grade: 9 },
      { name: 'Class 8', grade: 10 },
      { name: 'Class 9', grade: 11 },
      { name: 'Class 10', grade: 12 }
    ];
    
    const sections = ['A', 'B', 'C'];
    
    grades.forEach(({ name, grade }) => {
      sections.forEach(section => {
        classes.push({
          name,
          section,
          grade,
          academicYear: currentYear._id,
          strength: 0,
          maxStrength: 40,
          isActive: true,
          subjects: []
        });
      });
    });
    
    const created = await Class.insertMany(classes);
    
    logger.success(`✅ Seeded ${created.length} classes`);
    return created;
  } catch (error) {
    logger.error('Failed to seed classes', error);
    throw error;
  }
};

module.exports = seedClasses;
