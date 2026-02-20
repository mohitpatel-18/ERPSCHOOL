/**
 * Audit Logger Middleware
 * Automatically logs important system activities
 */

const AuditLog = require('../models/AuditLog');

/**
 * Create audit log entry
 */
const createAuditLog = async (logData) => {
  try {
    await AuditLog.log(logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the main flow
  }
};

/**
 * Middleware to log API requests
 */
const auditLogger = (options = {}) => {
  const {
    actions = ['CREATE', 'UPDATE', 'DELETE'], // Only log write operations by default
    excludePaths = ['/api/health', '/api/auth/refresh-token']
  } = options;

  return async (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.includes(path))) {
      return next();
    }

    // Only log if user is authenticated
    if (!req.user) {
      return next();
    }

    // Store original send method
    const originalSend = res.send.bind(res);
    
    // Track start time
    const startTime = Date.now();

    // Override send method to capture response
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Determine action based on HTTP method
      let action = null;
      switch (req.method) {
        case 'POST':
          action = 'CREATE';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'UPDATE';
          break;
        case 'DELETE':
          action = 'DELETE';
          break;
        case 'GET':
          action = 'READ';
          break;
        default:
          action = 'UNKNOWN';
      }

      // Only log specified actions
      if (actions.includes(action)) {
        // Extract entity from route
        const entity = extractEntityFromPath(req.path);
        
        // Determine status from response
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';

        // Create audit log entry
        createAuditLog({
          user: req.user._id,
          userRole: req.user.role,
          action,
          entity: entity || 'Unknown',
          entityId: req.params.id || null,
          description: generateDescription(req, action, entity),
          requestDetails: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          },
          status,
          metadata: {
            duration,
            statusCode: res.statusCode
          }
        });
      }

      return originalSend(data);
    };

    next();
  };
};

/**
 * Manual audit logging helper
 */
const logActivity = async (req, actionType, entity, entityId, description, options = {}) => {
  if (!req.user) return;

  const { changes, metadata, status = 'success', error } = options;

  await createAuditLog({
    user: req.user._id,
    userRole: req.user.role,
    action: actionType,
    entity,
    entityId,
    description,
    requestDetails: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    },
    changes,
    status,
    error,
    metadata
  });
};

/**
 * Extract entity name from API path
 */
const extractEntityFromPath = (path) => {
  const entityMap = {
    '/student': 'Student',
    '/teacher': 'Teacher',
    '/class': 'Class',
    '/attendance': 'Attendance',
    '/fee': 'Fee',
    '/payment': 'Payment',
    '/announcement': 'Announcement',
    '/leave': 'Leave',
    '/user': 'User',
    '/grade': 'Grade',
    '/academic-year': 'AcademicYear'
  };

  for (const [key, value] of Object.entries(entityMap)) {
    if (path.includes(key)) return value;
  }

  return 'Unknown';
};

/**
 * Generate human-readable description
 */
const generateDescription = (req, action, entity) => {
  const user = req.user.username || 'User';
  const entityName = entity || 'record';

  switch (action) {
    case 'CREATE':
      return `${user} created a new ${entityName}`;
    case 'UPDATE':
      return `${user} updated ${entityName}${req.params.id ? ` (ID: ${req.params.id})` : ''}`;
    case 'DELETE':
      return `${user} deleted ${entityName}${req.params.id ? ` (ID: ${req.params.id})` : ''}`;
    case 'READ':
      return `${user} viewed ${entityName}${req.params.id ? ` (ID: ${req.params.id})` : ''}`;
    default:
      return `${user} performed ${action} on ${entityName}`;
  }
};

/**
 * Log authentication events
 */
const logAuthEvent = async (userId, action, status, metadata = {}) => {
  await createAuditLog({
    user: userId,
    userRole: metadata.role || 'unknown',
    action,
    entity: 'User',
    entityId: userId,
    description: `${action} ${status}`,
    requestDetails: {
      method: 'POST',
      url: metadata.url || '/api/auth',
      ip: metadata.ip,
      userAgent: metadata.userAgent
    },
    status,
    metadata
  });
};

module.exports = {
  auditLogger,
  logActivity,
  logAuthEvent,
  createAuditLog
};
