const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;

    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: 'admin',
    });

    if (existingAdmin) {
      console.log('✅ Super Admin already exists');
      return;
    }

    await User.create({
      name: process.env.SUPER_ADMIN_NAME,
      email: adminEmail,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });

    console.log('🔥 Super Admin created successfully');
  } catch (error) {
    console.error('❌ Admin seed error:', error.message);
  }
};

module.exports = seedAdmin;
