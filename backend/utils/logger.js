/**
 * Logger utility for consistent logging across the application
 */

const chalk = require('chalk') || null;

class Logger {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Info log
   */
  info(message, data = null) {
    const timestamp = this.getTimestamp();
    console.log(`[${timestamp}] ℹ️  INFO: ${message}`, data || '');
  }

  /**
   * Success log
   */
  success(message, data = null) {
    const timestamp = this.getTimestamp();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`, data || '');
  }

  /**
   * Warning log
   */
  warn(message, data = null) {
    const timestamp = this.getTimestamp();
    console.warn(`[${timestamp}] ⚠️  WARNING: ${message}`, data || '');
  }

  /**
   * Error log
   */
  error(message, error = null) {
    const timestamp = this.getTimestamp();
    console.error(`[${timestamp}] ❌ ERROR: ${message}`);
    
    if (error) {
      if (this.env === 'development') {
        console.error(error);
      } else {
        console.error({
          message: error.message,
          statusCode: error.statusCode,
          stack: error.stack?.split('\n')[0]
        });
      }
    }
  }

  /**
   * Debug log (only in development)
   */
  debug(message, data = null) {
    if (this.env === 'development') {
      const timestamp = this.getTimestamp();
      console.log(`[${timestamp}] 🐛 DEBUG: ${message}`, data || '');
    }
  }

  /**
   * Database log
   */
  db(message, data = null) {
    const timestamp = this.getTimestamp();
    console.log(`[${timestamp}] 💾 DB: ${message}`, data || '');
  }

  /**
   * API request log
   */
  api(method, path, statusCode, duration) {
    const timestamp = this.getTimestamp();
    const emoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
    console.log(
      `[${timestamp}] ${emoji} ${method} ${path} - ${statusCode} (${duration}ms)`
    );
  }

  /**
   * Auth log
   */
  auth(message, username = null) {
    const timestamp = this.getTimestamp();
    console.log(
      `[${timestamp}] 🔐 AUTH: ${message}${username ? ` - User: ${username}` : ''}`
    );
  }

  /**
   * Performance log
   */
  perf(operation, duration) {
    const timestamp = this.getTimestamp();
    const emoji = duration < 100 ? '⚡' : duration < 500 ? '🐢' : '🐌';
    console.log(
      `[${timestamp}] ${emoji} PERF: ${operation} completed in ${duration}ms`
    );
  }

  /**
   * Audit log
   */
  audit(action, user, entity, entityId) {
    const timestamp = this.getTimestamp();
    console.log(
      `[${timestamp}] 📝 AUDIT: ${user} ${action} ${entity}${entityId ? ` (${entityId})` : ''}`
    );
  }
}

// Export singleton instance
module.exports = new Logger();
