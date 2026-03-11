import React from 'react';
import { Shield, Users, Edit, Trash2, Copy, MoreVertical, Crown, Lock } from 'lucide-react';

/**
 * Role Card Component
 * Display role information with actions
 */
const RoleCard = ({ role, onEdit, onDelete, onClone, permissionCount }) => {
  const getIcon = (iconName) => {
    const icons = {
      Shield: Shield,
      Crown: Crown,
      Users: Users,
      Lock: Lock
    };
    const IconComponent = icons[iconName] || Shield;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4" style={{ borderLeftColor: role.color || '#3b82f6' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${role.color}20`, color: role.color }}
          >
            {getIcon(role.icon)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{role.displayName}</h3>
            <span className="text-xs text-gray-500 uppercase">{role.name}</span>
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <div className="relative group">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
            <button
              onClick={() => onEdit(role)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
            >
              <Edit className="w-4 h-4" />
              Edit Role
            </button>
            <button
              onClick={() => onClone(role)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
            >
              <Copy className="w-4 h-4" />
              Clone Role
            </button>
            {role.type === 'custom' && (
              <button
                onClick={() => onDelete(role)}
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{role.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500">Type</div>
          <div className="text-sm font-medium capitalize">{role.type}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Level</div>
          <div className="text-sm font-medium">{role.level}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Permissions</div>
          <div className="text-sm font-medium">{permissionCount || 0}</div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
          {role.category}
        </span>
        {role.restrictions?.canModifyRoles && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            Can Modify Roles
          </span>
        )}
        {role.restrictions?.canAccessAuditLogs && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Audit Access
          </span>
        )}
      </div>
    </div>
  );
};

export default RoleCard;
