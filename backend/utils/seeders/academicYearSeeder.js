/**
 * Academic Year Seeder
 * Creates default academic years for testing
 */

const AcademicYear = require('../../models/AcademicYear');
const logger = require('../logger');

const seedAcademicYears = async () => {
  try {
    const existingCount = await AcademicYear.countDocuments();
    
    if (existingCount > 0) {
      logger.info(`Academic years already exist (${existingCount}). Skipping seed.`);
      return;
    }
    
    const academicYears = [
      {
        name: '2024-25',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        isCurrent: false,
        isActive: true,
        description: 'Academic Year 2024-2025'
      },
      {
        name: '2025-26',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-03-31'),
        isCurrent: true,
        isActive: true,
        description: 'Academic Year 2025-2026 (Current)'
      },
      {
        name: '2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: false,
        isActive: false,
        description: 'Academic Year 2026-2027 (Future)'
      }
    ];
    
    const created = await AcademicYear.insertMany(academicYears);
    
    logger.success(`✅ Seeded ${created.length} academic years`);
    return created;
  } catch (error) {
    logger.error('Failed to seed academic years', error);
    throw error;
  }
};

module.exports = seedAcademicYears;
