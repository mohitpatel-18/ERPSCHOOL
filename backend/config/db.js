const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ================= OPTIMIZED CONNECTION OPTIONS =================
    const options = {
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections to maintain
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
      
      // Performance optimizations
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool Size: ${options.maxPoolSize}`);
    console.log(`🔧 Auto-indexing: ${options.autoIndex ? 'Enabled' : 'Disabled (Production)'}`);
    
    // ================= CONNECTION EVENT HANDLERS =================
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });
    
    // ================= GRACEFUL SHUTDOWN =================
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

