const mongoose = require('mongoose');

/**
 * Advanced Permission Schema with RBAC + ABAC capabilities
 * Industry-level features:
 * - Fine-grained permissions with resource-level control
 * - Conditional permissions based on attributes
 * - Permission inheritance and delegation
 * - Time-based and context-aware permissions
 * - Field-level permissions for data access control
 */

const permissionSchema = new mongoose.Schema({
  // Basic Identifiers
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'principal', 'vice_principal', 'academic_coordinator', 
           'teacher', 'head_teacher', 'class_teacher', 'subject_teacher',
           'student', 'parent', 'accountant', 'librarian', 'receptionist'],
    required: true,
    index: true
  },
  
  module: {
    type: String,
    required: true,
    enum: [
      'dashboard', 'students', 'teachers', 'staff', 'classes', 'sections',
      'attendance', 'leaves', 'timetable', 'homework', 'assignments',
      'exams', 'grades', 'results', 'marks', 'report_cards',
      'fees', 'payments', 'invoices', 'receipts', 'expenses',
      'announcements', 'notices', 'events', 'notifications',
      'library', 'books', 'issue_return',
      'transport', 'routes', 'vehicles',
      'hostel', 'rooms', 'mess',
      'reports', 'analytics', 'audit_logs',
      'settings', 'system_config', 'backup', 'users', 'roles', 'permissions'
    ],
    index: true
  },
  
  // CRUD Actions
  actions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    list: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    import: { type: Boolean, default: false },
    print: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    reject: { type: Boolean, default: false },
    publish: { type: Boolean, default: false },
    archive: { type: Boolean, default: false }
  },
  
  // Field-level permissions (for data access control)
  fieldPermissions: {
    type: Map,
    of: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false }
    },
    default: new Map()
  },
  
  // Conditional permissions (ABAC - Attribute-Based Access Control)
  conditions: {
    // Own data only (e.g., teacher can only see their own classes)
    ownDataOnly: { type: Boolean, default: false },
    
    // Assigned data only (e.g., class teacher can see their assigned class students)
    assignedOnly: { type: Boolean, default: false },
    
    // Department-level access
    departmentOnly: { type: Boolean, default: false },
    
    // Time-based restrictions
    timeRestrictions: {
      enabled: { type: Boolean, default: false },
      allowedDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
    },
    
    // IP-based restrictions
    ipRestrictions: {
      enabled: { type: Boolean, default: false },
      allowedIPs: [String],
      deniedIPs: [String]
    },
    
    // Custom conditions (flexible JSON rules)
    customConditions: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }
  },
  
  // Resource-level permissions
  resourceLimits: {
    maxRecords: { type: Number, default: null }, // Limit number of records user can access
    maxExportSize: { type: Number, default: null }, // Limit export size
    rateLimit: { 
      requests: { type: Number, default: null },
      duration: { type: Number, default: 60 } // in seconds
    }
  },
  
  // Permission scope (hierarchy)
  scope: {
    type: String,
    enum: ['global', 'organization', 'department', 'class', 'self'],
    default: 'self'
  },
  
  // Delegation settings
  delegation: {
    canDelegate: { type: Boolean, default: false },
    delegatedTo: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    delegationExpiry: Date
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  description: String,
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModified: {
    action: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    changes: mongoose.Schema.Types.Mixed
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* ==================== INDEXES ==================== */
permissionSchema.index({ role: 1, module: 1 }, { unique: true });
permissionSchema.index({ status: 1 });
permissionSchema.index({ scope: 1 });
permissionSchema.index({ priority: -1 });

/* ==================== VIRTUAL PROPERTIES ==================== */
permissionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

permissionSchema.virtual('hasAnyAction').get(function() {
  return Object.values(this.actions).some(val => val === true);
});

/* ==================== STATIC METHODS ==================== */

// Check if user has specific permission
permissionSchema.statics.hasPermission = async function(role, module, action, context = {}) {
  const permission = await this.findOne({ 
    role, 
    module,
    status: 'active'
  });
  
  if (!permission) return false;
  if (!permission.actions[action]) return false;
  
  // Check conditional permissions
  if (permission.conditions.ownDataOnly && !context.isOwnData) {
    return false;
  }
  
  if (permission.conditions.assignedOnly && !context.isAssigned) {
    return false;
  }
  
  if (permission.conditions.departmentOnly && context.userDepartment !== context.resourceDepartment) {
    return false;
  }
  
  // Check time restrictions
  if (permission.conditions.timeRestrictions?.enabled) {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const { allowedDays, startTime, endTime } = permission.conditions.timeRestrictions;
    
    if (allowedDays?.length > 0 && !allowedDays.includes(currentDay)) {
      return false;
    }
    
    if (startTime && endTime) {
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }
  }
  
  // Check IP restrictions
  if (permission.conditions.ipRestrictions?.enabled && context.ipAddress) {
    const { allowedIPs, deniedIPs } = permission.conditions.ipRestrictions;
    
    if (deniedIPs?.includes(context.ipAddress)) {
      return false;
    }
    
    if (allowedIPs?.length > 0 && !allowedIPs.includes(context.ipAddress)) {
      return false;
    }
  }
  
  return true;
};

// Get all permissions for a role
permissionSchema.statics.getRolePermissions = async function(role) {
  return await this.find({ role, status: 'active' })
    .sort({ priority: -1, module: 1 })
    .lean();
};

// Get permission matrix for role
permissionSchema.statics.getPermissionMatrix = async function(role) {
  const permissions = await this.find({ role, status: 'active' });
  
  const matrix = {};
  permissions.forEach(perm => {
    matrix[perm.module] = {
      actions: perm.actions,
      scope: perm.scope,
      conditions: perm.conditions,
      fieldPermissions: Object.fromEntries(perm.fieldPermissions || new Map())
    };
  });
  
  return matrix;
};

// Bulk update permissions
permissionSchema.statics.bulkUpdatePermissions = async function(updates, userId) {
  const results = [];
  
  for (const update of updates) {
    const { role, module, actions, conditions, scope } = update;
    
    const permission = await this.findOneAndUpdate(
      { role, module },
      { 
        $set: {
          actions,
          conditions,
          scope,
          updatedBy: userId,
          'lastModified.action': 'bulk_update',
          'lastModified.by': userId,
          'lastModified.timestamp': new Date(),
          'lastModified.changes': update
        }
      },
      { new: true, upsert: true }
    );
    
    results.push(permission);
  }
  
  return results;
};

// Clone permissions from one role to another
permissionSchema.statics.cloneRolePermissions = async function(fromRole, toRole, userId) {
  const sourcePermissions = await this.find({ role: fromRole });
  
  const clonedPermissions = sourcePermissions.map(perm => ({
    role: toRole,
    module: perm.module,
    actions: perm.actions,
    fieldPermissions: perm.fieldPermissions,
    conditions: perm.conditions,
    resourceLimits: perm.resourceLimits,
    scope: perm.scope,
    description: `Cloned from ${fromRole}`,
    createdBy: userId,
    status: 'active'
  }));
  
  // Delete existing permissions for target role
  await this.deleteMany({ role: toRole });
  
  // Insert cloned permissions
  return await this.insertMany(clonedPermissions);
};

// Get permission conflicts
permissionSchema.statics.getConflicts = async function() {
  const conflicts = [];
  
  // Find duplicate role-module combinations
  const duplicates = await this.aggregate([
    { $group: {
      _id: { role: '$role', module: '$module' },
      count: { $sum: 1 },
      ids: { $push: '$_id' }
    }},
    { $match: { count: { $gt: 1 } }}
  ]);
  
  return duplicates;
};

// Check field-level permission
permissionSchema.statics.canAccessField = async function(role, module, field, accessType = 'read') {
  const permission = await this.findOne({ role, module, status: 'active' });
  
  if (!permission) return false;
  
  const fieldPerm = permission.fieldPermissions?.get(field);
  if (!fieldPerm) return true; // If no field permission set, allow by default
  
  return fieldPerm[accessType] === true;
};

/* ==================== INSTANCE METHODS ==================== */

// Check if permission allows specific action
permissionSchema.methods.allows = function(action, context = {}) {
  if (!this.actions[action]) return false;
  
  // Additional context-based checks can be added here
  if (this.conditions.ownDataOnly && !context.isOwnData) {
    return false;
  }
  
  return true;
};

// Get allowed actions
permissionSchema.methods.getAllowedActions = function() {
  return Object.entries(this.actions)
    .filter(([_, allowed]) => allowed)
    .map(([action, _]) => action);
};

// Get denied actions
permissionSchema.methods.getDeniedActions = function() {
  return Object.entries(this.actions)
    .filter(([_, allowed]) => !allowed)
    .map(([action, _]) => action);
};

/* ==================== MIDDLEWARE ==================== */

// Pre-save hook
permissionSchema.pre('save', function(next) {
  // Set priority based on scope
  if (!this.priority) {
    const scopePriorities = {
      'global': 100,
      'organization': 80,
      'department': 60,
      'class': 40,
      'self': 20
    };
    this.priority = scopePriorities[this.scope] || 0;
  }
  
  next();
});

// Post-save hook for audit logging
permissionSchema.post('save', async function(doc) {
  // Log permission change in audit log
  try {
    // Check if AuditLog model exists to avoid circular dependency issues
    if (mongoose.models.AuditLog) {
      const AuditLog = mongoose.model('AuditLog');
      await AuditLog.create({
        action: 'PERMISSION_MODIFIED',
        module: 'permissions',
        performedBy: doc.updatedBy || doc.createdBy,
        targetModel: 'Permission',
        targetId: doc._id,
        changes: {
          role: doc.role,
          module: doc.module,
          actions: doc.actions
        },
        ipAddress: doc._ipAddress, // Can be set before save
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Failed to log permission change:', error);
  }
});

module.exports = mongoose.model('Permission', permissionSchema);
