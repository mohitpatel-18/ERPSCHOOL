/**
 * Backup Script
 * Usage: npm run backup
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createBackup, cleanOldBackups } = require('../databaseBackup');
const logger = require('../logger');

dotenv.config();

const runBackup = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    logger.success('Connected to MongoDB');
    
    // Create backup
    const result = await createBackup();
    
    logger.info('\n📦 Backup Details:');
    logger.info(`Path: ${result.path}`);
    logger.info(`Size: ${result.size} MB`);
    logger.info('Statistics:');
    Object.entries(result.stats).forEach(([key, count]) => {
      logger.info(`  ${key}: ${count} records`);
    });
    
    // Clean old backups (keep last 10)
    logger.info('\n🧹 Cleaning old backups...');
    const cleaned = cleanOldBackups(10);
    logger.info(`Removed ${cleaned.deleted} old backups`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Backup failed', error);
    process.exit(1);
  }
};

runBackup();
