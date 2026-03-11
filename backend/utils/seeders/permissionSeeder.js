const Permission = require('../../models/Permission');
const Role = require('../../models/Role');
const logger = require('../logger');

/**
 * Advanced Permission Seeder - Industry Level
 * Creates comprehensive default permissions and roles for the ERP system
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
    },
    dashboardConfig: {
      layout: 'admin',
      defaultRoute: '/admin/dashboard'
    }
  },
  {
    name: 'principal',
    displayName: 'Principal',
    description: 'School principal with high-level oversight',
    type: 'custom',
    category: 'administrative',
    level: 3,
    color: '#f59e0b',
    icon: 'Crown',
    restrictions: {
      canCreateUsers: true,
      canModifyRoles: false,
      canAccessAuditLogs: true,
      canExportData: true,
      canImportData: false,
      canModifySettings: false
    }
  },
  {
    name: 'vice_principal',
    displayName: 'Vice Principal',
    description: 'Assists principal in school management',
    type: 'custom',
    category: 'administrative',
    level: 4,
    color: '#06b6d4',
    icon: 'Award'
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
    name: 'class_teacher',
    displayName: 'Class Teacher',
    description: 'Teacher with additional class coordination duties',
    type: 'custom',
    category: 'academic',
    level: 6,
    color: '#6366f1',
    icon: 'Users'
  },
  {
    name: 'accountant',
    displayName: 'Accountant',
    description: 'Finance and fee management',
    type: 'custom',
    category: 'administrative',
    level: 7,
    color: '#84cc16',
    icon: 'DollarSign'
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
  },
  {
    name: 'parent',
    displayName: 'Parent/Guardian',
    description: 'Parent with access to child records',
    type: 'custom',
    category: 'student',
    level: 9,
    color: '#ec4899',
    icon: 'Heart'
  },
  {
    name: 'librarian',
    displayName: 'Librarian',
    description: 'Library management',
    type: 'custom',
    category: 'support',
    level: 10,
    color: '#a855f7',
    icon: 'Library'
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
    applyToAllModules: true,
    priority: 100
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
    scope: 'organization',
    priority: 90
  },
  
  principal: {
    modules: [
      'dashboard', 'students', 'teachers', 'staff', 'classes', 'sections',
      'attendance', 'leaves', 'timetable', 'homework', 'assignments',
      'exams', 'grades', 'results', 'report_cards',
      'fees', 'payments', 'announcements', 'notices', 'reports', 'analytics'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, export: true, print: true, approve: true, reject: true
    },
    scope: 'organization',
    priority: 80
  },
  
  vice_principal: {
    modules: [
      'dashboard', 'students', 'teachers', 'classes', 'sections',
      'attendance', 'leaves', 'timetable', 'exams', 'grades',
      'announcements', 'reports'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, print: true, approve: true
    },
    scope: 'organization',
    priority: 70
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
      grades: { create: true, read: true, update: true, list: true },
      marks: { create: true, read: true, update: true, list: true }
    },
    priority: 60
  },
  
  class_teacher: {
    modules: [
      'dashboard', 'students', 'attendance', 'leaves',
      'timetable', 'homework', 'assignments',
      'exams', 'grades', 'marks', 'report_cards',
      'announcements', 'notices', 'fees'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, print: true
    },
    scope: 'class',
    conditions: { assignedOnly: true },
    customPermissions: {
      students: { read: true, list: true, update: true },
      attendance: { create: true, read: true, update: true, list: true, approve: true },
      report_cards: { read: true, list: true, print: true },
      fees: { read: true, list: true }
    },
    priority: 65
  },
  
  accountant: {
    modules: [
      'dashboard', 'students', 'fees', 'payments', 'invoices', 'receipts',
      'expenses', 'reports'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, export: true, print: true
    },
    scope: 'organization',
    customPermissions: {
      students: { read: true, list: true },
      fees: { create: true, read: true, update: true, list: true, export: true },
      payments: { create: true, read: true, update: true, list: true, approve: true },
      invoices: { create: true, read: true, update: true, print: true },
      receipts: { create: true, read: true, print: true, export: true }
    },
    priority: 50
  },
  
  student: {
    modules: [
      'dashboard', 'attendance', 'timetable', 'homework', 'assignments',
      'exams', 'grades', 'results', 'report_cards',
      'fees', 'payments', 'announcements', 'notices', 'events'
    ],
    defaultActions: {
      read: true, list: true, print: true
    },
    scope: 'self',
    conditions: { ownDataOnly: true },
    customPermissions: {
      homework: { read: true, list: true, create: true },
      assignments: { read: true, list: true, create: true },
      leaves: { create: true, read: true, list: true },
      fees: { read: true, print: true },
      payments: { read: true }
    },
    priority: 40
  },
  
  parent: {
    modules: [
      'dashboard', 'students', 'attendance', 'timetable', 'homework',
      'exams', 'grades', 'results', 'report_cards',
      'fees', 'payments', 'announcements', 'notices'
    ],
    defaultActions: {
      read: true, list: true, print: true
    },
    scope: 'self',
    conditions: { ownDataOnly: true },
    customPermissions: {
      students: { read: true },
      fees: { read: true, print: true },
      payments: { create: true, read: true, print: true }
    },
    priority: 30
  },
  
  librarian: {
    modules: [
      'dashboard', 'library', 'books', 'issue_return', 'students', 'teachers'
    ],
    defaultActions: {
      create: true, read: true, update: true, delete: false,
      list: true, print: true
    },
    scope: 'department',
    customPermissions: {
      students: { read: true, list: true },
      teachers: { read: true, list: true },
      books: { create: true, read: true, update: true, delete: true, list: true },
      issue_return: { create: true, read: true, update: true, list: true }
    },
    priority: 45
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
      priority: template.priority || 50,
      conditions: template.conditions || {},
      status: 'active'
    });
  });
  
  return permissions;
}

/**
 * Main seeder function
 */
const seedAdvancedPermissions = async () => {
  try {
    const existingPerms = await Permission.countDocuments();
    
    // Only check permissions, not roles (admin role might already exist from seedAdmin)
    if (existingPerms > 0) {
      console.log(`⚠️  Permissions already exist (${existingPerms} permissions). Skipping seeder.`);
      return;
    }
    
    const existingRoles = await Role.countDocuments();
    
    console.log('🌱 Starting advanced permission seeder...');
    
    // Create roles (skip if already exists)
    const createdRoles = {};
    for (const roleData of DEFAULT_ROLES) {
      let role = await Role.findOne({ name: roleData.name });
      if (!role) {
        role = await Role.create(roleData);
        console.log(`✅ Created role: ${role.displayName}`);
      } else {
        console.log(`ℹ️  Role already exists: ${role.displayName}`);
      }
      createdRoles[role.name] = role;
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
      
      console.log(`✅ Created ${created.length} permissions for ${roleName}`);
    }
    
    console.log(`🎉 Successfully seeded ${Object.keys(createdRoles).length} roles and ${totalPermissions} permissions!`);
    
  } catch (error) {
    console.error('❌ Failed to seed permissions:', error.message);
    throw error;
  }
};

module.exports = seedAdvancedPermissions;
