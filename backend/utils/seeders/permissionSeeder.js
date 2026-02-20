const Permission = require('../../models/Permission');
const Role = require('../../models/Role');
const logger = require('../logger');

/**
 * Advanced Permission Seeder - Industry Level
 * Creates comprehensive default permissions and roles for the system
 */

// Define all modules in the system
const MODULES = [
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
];

// Define default roles with their configurations
const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    type: 'system',
    category: 'administrative',
    level: 1,
    color: '#ef4444',
    icon: 'Shield',
    restrictions: {
      canCreateUsers: true,
      canModifyRoles: true,
      canAccessAuditLogs: true,
      canExportData: true,
      canImportData: true,
      canModifySettings: true
    },
    dashboardConfig: {
      layout: 'admin',
      defaultRoute: '/admin/dashboard'
    }
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'High-level administrative access',
    type: 'system',
    category: 'administrative',
    level: 2,
    color: '#8b5cf6',
    icon: 'UserCog',
    restrictions: {
      canCreateUsers: true,
      canModifyRoles: false,
      canAccessAuditLogs: true,
      canExportData: true,
      canImportData: true,
      canModifySettings: false
    }
  },
  {
    name: 'teacher',
    displayName: 'Teacher',
    description: 'Teaching staff with class management access',
    type: 'system',
    category: 'academic',
    level: 5,
    color: '#3b82f6',
    icon: 'BookOpen',
    dashboardConfig: {
      layout: 'teacher',
      defaultRoute: '/teacher/dashboard'
    }
  },
  {
    name: 'student',
    displayName: 'Student',
    description: 'Student with view-only access to own records',
    type: 'system',
    category: 'student',
    level: 8,
    color: '#10b981',
    icon: 'GraduationCap',
    dashboardConfig: {
      layout: 'student',
      defaultRoute: '/student/dashboard'
    }
  }
];

// Permission templates for each role
const PERMISSION_TEMPLATES = {
  super_admin: {
    defaultActions: {
      create: true, read: true, update: true, delete: true,
      list: true, export: true, import: true, print: true,
      approve: true, reject: true, publish: true, archive: true
    },
    scope: 'global',
    applyToAllModules: true
  },
  
  admin: {
    modules: [
      'dashboard', 'students', 'teachers', 'staff', 'classes', 'sections',
      'attendance', 'leaves', 'timetable', 'homework', 'assignments',
      'exams', 'grades', 'results', 'marks', 'report_cards',
      'fees', 'payments', 'invoices', 'receipts',
      'announcements', 'notices', 'events', 'notifications',
      'reports', 'analytics', 'users'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: true,
      list: true, export: true, import: true, print: true,
      approve: true, reject: true, publish: true
    },
    scope: 'organization'
  },
  
  teacher: {
    modules: [
      'dashboard', 'students', 'attendance', 'leaves',
      'timetable', 'homework', 'assignments',
      'exams', 'grades', 'marks',
      'announcements', 'notices'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, print: true
    },
    scope: 'class',
    conditions: { assignedOnly: true },
    customPermissions: {
      students: { read: true, list: true, update: false },
      attendance: { create: true, read: true, update: true, list: true },
      homework: { create: true, read: true, update: true, delete: true, list: true },
      grades: { create: true, read: true, update: true, list: true }
    }
  },
  
  student: {
    modules: [
      'dashboard', 'attendance', 'timetable', 'homework', 'assignments',
      'exams', 'grades', 'results', 'report_cards',
      'fees', 'payments', 'announcements', 'notices'
    ],
    defaultActions: {
      read: true, list: true, print: true
    },
    scope: 'self',
    conditions: { ownDataOnly: true },
    customPermissions: {
      homework: { read: true, list: true, create: true },
      leaves: { create: true, read: true, list: true }
    }
  }
};

/**
 * Generate permissions for a role
 */
function generateRolePermissions(roleName, template) {
  const permissions = [];
  const modules = template.applyToAllModules ? MODULES : (template.modules || []);
  
  modules.forEach(module => {
    const customPerm = template.customPermissions?.[module];
    const actions = customPerm || { ...template.defaultActions };
    
    permissions.push({
      role: roleName,
      module,
      actions,
      scope: template.scope || 'self',
      conditions: template.conditions || {},
      status: 'active'
    });
  });
  
  return permissions;
}

/**
 * Main seeder function
 */
const seedPermissions = async () => {
  try {
    const existingRoles = await Role.countDocuments();
    const existingPerms = await Permission.countDocuments();
    
    if (existingRoles > 0 || existingPerms > 0) {
      logger.info(`Permissions/Roles already exist. Skipping seeder.`);
      return;
    }
    
    logger.info('🌱 Starting advanced permission seeder...');
    
    // Create roles
    const createdRoles = {};
    for (const roleData of DEFAULT_ROLES) {
      const role = await Role.create(roleData);
      createdRoles[role.name] = role;
      logger.info(`✅ Created role: ${role.displayName}`);
    }
    
    // Create permissions
    let totalPermissions = 0;
    for (const [roleName, template] of Object.entries(PERMISSION_TEMPLATES)) {
      const rolePermissions = generateRolePermissions(roleName, template);
      const created = await Permission.insertMany(rolePermissions);
      totalPermissions += created.length;
      
      // Update role's permissions array
      if (createdRoles[roleName]) {
        createdRoles[roleName].permissions = created.map(p => p._id);
        await createdRoles[roleName].save();
      }
      
      logger.info(`✅ Created ${created.length} permissions for ${roleName}`);
    }
    
    logger.success(`🎉 Seeded ${Object.keys(createdRoles).length} roles and ${totalPermissions} permissions`);
    
  } catch (error) {
    logger.error('Failed to seed permissions:', error);
    throw error;
  }
};

module.exports = seedPermissions;
