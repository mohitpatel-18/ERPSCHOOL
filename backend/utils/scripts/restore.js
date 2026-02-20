/**
 * Restore Script
 * Usage: node utils/scripts/restore.js <backup-file>
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { restoreBackup, listBackups } = require('../databaseBackup');
const logger = require('../logger');

dotenv.config();

const runRestore = async () => {
  try {
    const backupFile = process.argv[2];
    
    if (!backupFile) {
      logger.warn('No backup file specified. Available backups:\n');
      
      await mongoose.connect(process.env.MONGO_URI);
      const backups = listBackups();
      
      if (backups.length === 0) {
        logger.warn('No backups found.');
      } else {
        backups.forEach((backup, index) => {
          logger.info(`${index + 1}. ${backup.filename}`);
          logger.info(`   Size: ${backup.size}`);
          logger.info(`   Created: ${backup.created.toLocaleString()}\n`);
        });
      }
      
      logger.info('Usage: node utils/scripts/restore.js <backup-filename>');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Resolve backup path
    const BACKUP_DIR = path.join(__dirname, '../backups');
    const backupPath = path.join(BACKUP_DIR, backupFile);
    
    logger.warn('\n⚠️  WARNING: This will DELETE all existing data!');
    logger.warn('Press Ctrl+C within 5 seconds to cancel...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    logger.success('Connected to MongoDB');
    
    // Restore backup
    const result = await restoreBackup(backupPath);
    
    logger.success('\n✅ Restore completed successfully!');
    logger.info('Restored:');
    Object.entries(result.restored).forEach(([key, count]) => {
      logger.info(`  ${key}: ${count} records`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Restore failed', error);
    process.exit(1);
  }
};

runRestore();
