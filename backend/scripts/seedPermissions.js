#!/usr/bin/env node

/**
 * Permission Seeder Script
 * Run: node scripts/seedPermissions.js
 */

require('dotenv').config();
const connectDB = require('../config/db');
const seedPermissions = require('../utils/seeders/permissionSeeder');

const runSeeder = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('🌱 Running permission seeder...');
    await seedPermissions();
    
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
