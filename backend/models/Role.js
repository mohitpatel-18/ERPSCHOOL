const mongoose = require('mongoose');

/**
 * Advanced Role Schema
 * Manages role hierarchy, inheritance, and custom roles
 * Industry-level features:
 * - Role hierarchy and inheritance
 * - Custom role creation
 * - Role templates
 * - Dynamic permission assignment
 */

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  displayName: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['system', 'custom'],
    default: 'custom',
    index: true
  },
  
  category: {
    type: String,
    enum: ['administrative', 'academic', 'support', 'student', 'parent', 'other'],
    required: true
  },
  
  // Role hierarchy
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    index: true
  },
  
  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
  
  // Inherit permissions from parent role
  inheritPermissions: {
    type: Boolean,
    default: false
  },
  
  // Permissions (reference to Permission model)
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  
  // Quick permission map for fast access
  permissionMap: {
    type: Map,
    of: {
      create: Boolean,
      read: Boolean,
      update: Boolean,
      delete: Boolean,
      list: Boolean,
      export: Boolean,
      import: Boolean,
      print: Boolean,
      approve: Boolean,
      reject: Boolean,
      publish: Boolean,
      archive: Boolean
    },
    default: new Map()
  },
  
  // User limits
  maxUsers: {
    type: Number,
    default: null // null means unlimited
  },
  
  currentUserCount: {
    type: Number,
    default: 0
  },
  
  // Features and capabilities
  features: [{
    name: String,
    enabled: { type: Boolean, default: true },
    config: mongoose.Schema.Types.Mixed
  }],
  
  // Dashboard configuration
  dashboardConfig: {
    layout: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'custom'],
      default: 'custom'
    },
    widgets: [{
      name: String,
      position: Number,
      size: String,
      visible: { type: Boolean, default: true }
    }],
    defaultRoute: String
  },
  
  // Restrictions
  restrictions: {
    canCreateUsers: { type: Boolean, default: false },
    canModifyRoles: { type: Boolean, default: false },
    canAccessAuditLogs: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    canImportData: { type: Boolean, default: false },
    canModifySettings: { type: Boolean, default: false }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active',
    index: true
  },
  
  // Metadata
  isDefault: {
    type: Boolean,
    default: false
  },
  
  color: {
    type: String,
    default: '#6366f1' // Tailwind indigo-500
  },
  
  icon: {
    type: String,
    default: 'Users'
  },
  
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
roleSchema.index({ name: 1, status: 1 });
roleSchema.index({ type: 1, category: 1 });
roleSchema.index({ level: 1 });

/* ==================== VIRTUAL PROPERTIES ==================== */
roleSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

roleSchema.virtual('hasUsers').get(function() {
  return this.currentUserCount > 0;
});

roleSchema.virtual('canAddUsers').get(function() {
  if (this.maxUsers === null) return true;
  return this.currentUserCount < this.maxUsers;
});

roleSchema.virtual('usersRemaining').get(function() {
  if (this.maxUsers === null) return Infinity;
  return Math.max(0, this.maxUsers - this.currentUserCount);
});

/* ==================== STATIC METHODS ==================== */

// Get role hierarchy tree
roleSchema.statics.getRoleHierarchy = async function() {
  const roles = await this.find({ status: 'active' }).sort({ level: 1 }).lean();
  
  const buildTree = (parentId = null) => {
    return roles
      .filter(role => {
        if (parentId === null) return role.parentRole === null;
        return role.parentRole?.toString() === parentId.toString();
      })
      .map(role => ({
        ...role,
        children: buildTree(role._id)
      }));
  };
  
  return buildTree();
};

// Get all permissions for a role (including inherited)
roleSchema.statics.getAllPermissions = async function(roleId) {
  const role = await this.findById(roleId).populate('permissions parentRole');
  
  if (!role) return [];
  
  let allPermissions = [...role.permissions];
  
  // If role inherits permissions, get parent permissions recursively
  if (role.inheritPermissions && role.parentRole) {
    const parentPermissions = await this.getAllPermissions(role.parentRole._id);
    allPermissions = [...allPermissions, ...parentPermissions];
  }
  
  // Remove duplicates
  const uniquePermissions = allPermissions.filter((perm, index, self) =>
    index === self.findIndex(p => p.module === perm.module)
  );
  
  return uniquePermissions;
};

// Get effective permissions (merged from hierarchy)
roleSchema.statics.getEffectivePermissions = async function(roleId) {
  const allPermissions = await this.getAllPermissions(roleId);
  
  const permissionMap = {};
  
  allPermissions.forEach(perm => {
    if (!permissionMap[perm.module]) {
      permissionMap[perm.module] = { ...perm.actions };
    } else {
      // Merge permissions (OR operation - most permissive wins)
      Object.keys(perm.actions).forEach(action => {
        permissionMap[perm.module][action] = 
          permissionMap[perm.module][action] || perm.actions[action];
      });
    }
  });
  
  return permissionMap;
};

// Create role from template
roleSchema.statics.createFromTemplate = async function(templateName, customName, userId) {
  const templates = {
    'super_admin': {
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      category: 'administrative',
      level: 1,
      color: '#ef4444',
      icon: 'Shield'
    },
    'principal': {
      displayName: 'Principal',
      description: 'School principal with high-level administrative access',
      category: 'administrative',
      level: 2,
      color: '#8b5cf6',
      icon: 'Award'
    },
    'teacher': {
      displayName: 'Teacher',
      description: 'Teaching staff with classroom management permissions',
      category: 'academic',
      level: 5,
      color: '#3b82f6',
      icon: 'BookOpen'
    },
    'student': {
      displayName: 'Student',
      description: 'Student with limited read access',
      category: 'student',
      level: 8,
      color: '#10b981',
      icon: 'GraduationCap'
    }
  };
  
  const template = templates[templateName];
  if (!template) throw new Error('Template not found');
  
  return await this.create({
    name: customName || templateName,
    ...template,
    type: 'custom',
    createdBy: userId
  });
};

// Get roles by category
roleSchema.statics.getRolesByCategory = async function(category) {
  return await this.find({ category, status: 'active' }).sort({ level: 1 });
};

// Check if role can be deleted
roleSchema.statics.canDelete = async function(roleId) {
  const role = await this.findById(roleId);
  
  if (!role) return { canDelete: false, reason: 'Role not found' };
  if (role.type === 'system') return { canDelete: false, reason: 'System roles cannot be deleted' };
  if (role.currentUserCount > 0) return { canDelete: false, reason: 'Role has active users' };
  
  // Check if any role has this as parent
  const childRoles = await this.find({ parentRole: roleId });
  if (childRoles.length > 0) return { canDelete: false, reason: 'Role has child roles' };
  
  return { canDelete: true };
};

/* ==================== INSTANCE METHODS ==================== */

// Add permission to role
roleSchema.methods.addPermission = async function(permissionId) {
  if (!this.permissions.includes(permissionId)) {
    this.permissions.push(permissionId);
    await this.save();
  }
  return this;
};

// Remove permission from role
roleSchema.methods.removePermission = async function(permissionId) {
  this.permissions = this.permissions.filter(
    p => p.toString() !== permissionId.toString()
  );
  await this.save();
  return this;
};

// Sync permission map (for fast access)
roleSchema.methods.syncPermissionMap = async function() {
  await this.populate('permissions');
  
  const permMap = new Map();
  this.permissions.forEach(perm => {
    permMap.set(perm.module, perm.actions);
  });
  
  this.permissionMap = permMap;
  await this.save();
  return this;
};

// Increment user count
roleSchema.methods.incrementUserCount = async function() {
  this.currentUserCount += 1;
  await this.save();
  return this;
};

// Decrement user count
roleSchema.methods.decrementUserCount = async function() {
  this.currentUserCount = Math.max(0, this.currentUserCount - 1);
  await this.save();
  return this;
};

/* ==================== MIDDLEWARE ==================== */

// Pre-save validation
roleSchema.pre('save', async function(next) {
  // Prevent circular hierarchy
  if (this.parentRole) {
    let currentParent = this.parentRole;
    const visited = new Set([this._id.toString()]);
    
    while (currentParent) {
      if (visited.has(currentParent.toString())) {
        return next(new Error('Circular role hierarchy detected'));
      }
      visited.add(currentParent.toString());
      
      const parent = await this.constructor.findById(currentParent);
      currentParent = parent?.parentRole;
    }
  }
  
  next();
});

// Post-save audit logging
roleSchema.post('save', async function(doc) {
  try {
    // Check if AuditLog model exists to avoid circular dependency issues
    if (mongoose.models.AuditLog) {
      const AuditLog = mongoose.model('AuditLog');
      await AuditLog.create({
        action: 'ROLE_MODIFIED',
        module: 'roles',
        performedBy: doc.updatedBy || doc.createdBy,
        targetModel: 'Role',
        targetId: doc._id,
        changes: {
          name: doc.name,
          displayName: doc.displayName,
          status: doc.status
        },
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Failed to log role change:', error);
  }
});

// Pre-remove validation
roleSchema.pre('remove', async function(next) {
  const canDeleteResult = await this.constructor.canDelete(this._id);
  
  if (!canDeleteResult.canDelete) {
    return next(new Error(canDeleteResult.reason));
  }
  
  next();
});

module.exports = mongoose.model('Role', roleSchema);
