import React, { useState, useEffect } from 'react';
import { Check, X, Lock, Unlock, Eye, Edit, Trash2, Plus, Download, Upload } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

/**
 * Advanced Permission Matrix Component
 * Visual grid showing all permissions for all roles
 */
const PermissionMatrix = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);

      const rolesData = rolesRes.data.data || [];
      const permsData = permsRes.data.data || [];

      setRoles(rolesData);
      setPermissions(permsData);

      // Extract unique modules
      const uniqueModules = [...new Set(permsData.map(p => p.module))].sort();
      setModules(uniqueModules);
    } catch (error) {
      toast.error('Failed to load permission matrix');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get permission for specific role and module
  const getPermission = (roleName, module) => {
    return permissions.find(p => p.role === roleName && p.module === module);
  };

  // Toggle permission action
  const toggleAction = (roleName, module, action) => {
    if (!editMode) return;

    const key = `${roleName}-${module}-${action}`;
    setChanges(prev => ({
      ...prev,
      [key]: !changes[key]
    }));
  };

  // Check if action is enabled
  const isActionEnabled = (roleName, module, action) => {
    const perm = getPermission(roleName, module);
    const key = `${roleName}-${module}-${action}`;
    
    if (changes.hasOwnProperty(key)) {
      return changes[key];
    }
    
    return perm?.actions?.[action] || false;
  };

  // Save all changes
  const saveChanges = async () => {
    try {
      const updates = [];
      
      Object.entries(changes).forEach(([key, value]) => {
        const [roleName, module, action] = key.split('-');
        let update = updates.find(u => u.role === roleName && u.module === module);
        
        if (!update) {
          const perm = getPermission(roleName, module);
          update = {
            role: roleName,
            module: module,
            actions: { ...perm?.actions }
          };
          updates.push(update);
        }
        
        update.actions[action] = value;
      });

      await api.post('/permissions/bulk-update', { updates });
      toast.success('Permissions updated successfully!');
      setChanges({});
      setEditMode(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update permissions');
      console.error(error);
    }
  };

  const actions = ['create', 'read', 'update', 'delete', 'list', 'export', 'print', 'approve'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Matrix</h2>
          <p className="text-gray-600 mt-1">Visual overview of all role permissions</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setChanges({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Permissions
            </button>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Module
              </th>
              {roles.map(role => (
                <th key={role._id} colSpan={actions.length} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    <span style={{ color: role.color }}>{role.displayName}</span>
                  </div>
                  <div className="flex justify-around mt-2 text-xs text-gray-400 normal-case">
                    {actions.map(action => (
                      <span key={action} className="w-10" title={action}>
                        {action.charAt(0).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map((module, idx) => (
              <tr key={module} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 capitalize">
                  {module.replace(/_/g, ' ')}
                </td>
                {roles.map(role => (
                  <td key={role._id} className="border-l border-gray-200">
                    <div className="flex justify-around">
                      {actions.map(action => {
                        const enabled = isActionEnabled(role.name, module, action);
                        return (
                          <div
                            key={action}
                            onClick={() => toggleAction(role.name, module, action)}
                            className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer transition-all ${
                              editMode ? 'hover:scale-110' : ''
                            } ${
                              enabled
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-red-50 text-red-400 hover:bg-red-100'
                            }`}
                            title={`${action} - ${enabled ? 'Enabled' : 'Disabled'}`}
                          >
                            {enabled ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span>Enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 rounded flex items-center justify-center">
            <X className="w-3 h-3 text-red-400" />
          </div>
          <span>Disabled</span>
        </div>
        {Object.keys(changes).length > 0 && (
          <div className="ml-auto text-blue-600 font-medium">
            {Object.keys(changes).length} changes pending
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionMatrix;
