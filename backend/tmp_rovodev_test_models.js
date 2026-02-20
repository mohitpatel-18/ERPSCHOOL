// Test script to check if models can be loaded
require('dotenv').config();
const mongoose = require('mongoose');

async function testModels() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected');
    
    console.log('\nTesting Permission model...');
    const Permission = require('./models/Permission');
    console.log('✅ Permission model loaded');
    console.log('Permission model name:', Permission.modelName);
    
    console.log('\nTesting Role model...');
    const Role = require('./models/Role');
    console.log('✅ Role model loaded');
    console.log('Role model name:', Role.modelName);
    
    console.log('\nFetching permissions...');
    const permissions = await Permission.find().limit(5);
    console.log(`Found ${permissions.length} permissions`);
    
    console.log('\nFetching roles...');
    const roles = await Role.find().limit(5);
    console.log(`Found ${roles.length} roles`);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testModels();
