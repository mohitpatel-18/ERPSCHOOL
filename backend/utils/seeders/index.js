/**
 * Master Seeder
 * Runs all seeders in correct order
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../logger');

// Load env variables
dotenv.config();

// Import seeders
const seedAcademicYears = require('./academicYearSeeder');
const seedClasses = require('./classSeeder');
const seedPermissions = require('./permissionSeeder');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.success('MongoDB Connected for seeding');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

// Run all seeders
const runSeeders = async () => {
  try {
    await connectDB();
    
    logger.info('🌱 Starting database seeding...\n');
    
    // Run seeders in order
    await seedPermissions();
    await seedAcademicYears();
    await seedClasses();
    
    logger.success('\n✅ All seeders completed successfully!');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', error);
    process.exit(1);
  }
};

// Clear all data (DANGER!)
const clearDatabase = async () => {
  try {
    await connectDB();
    
    logger.warn('⚠️  Clearing all database collections...');
    
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      logger.info(`Cleared ${key}`);
    }
    
    logger.success('✅ Database cleared');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to clear database', error);
    process.exit(1);
  }
};

// Export functions
module.exports = {
  runSeeders,
  clearDatabase,
  seedAcademicYears,
  seedClasses
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    console.log('\n⚠️  WARNING: This will delete ALL data!');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
    
    setTimeout(() => {
      clearDatabase();
    }, 3000);
  } else {
    runSeeders();
  }
}
