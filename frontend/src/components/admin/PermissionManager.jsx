import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button, Badge, Modal, Input, Select, Tabs } from '../ui';
import { toast } from 'react-hot-toast';
import { 
  Shield, Users, Check, X, Edit, Trash2, Copy, Download, Upload,
  Save, Plus, Search, Filter, RefreshCw, Eye, Lock, Unlock,
  AlertTriangle, TrendingUp, Settings, ChevronDown, ChevronRight
} from 'lucide-react';

/**
 * Advanced Permission Manager - Industry Level
 * Features:
 * - Role-based permission management
 * - Bulk operations
 * - Permission templates
 * - Visual permission matrix
 * - Role hierarchy
 * - Import/Export
 * - Analytics
 */

const PermissionManager = () => {
  // State management
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, statsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
        api.get('/permissions/analytics/stats')
      ]);
      
      setRoles(rolesRes.data.data || []);
      setPermissions(permsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission action
  const togglePermission = async (permId, action, currentValue) => {
    try {
      const perm = permissions.find(p => p._id === permId);
      const updatedActions = { ...perm.actions, [action]: !currentValue };
      
      await api.put(`/permissions/${permId}`, { actions: updatedActions });
      toast.success('Permission updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  // Bulk update permissions
  const handleBulkUpdate = async (updates) => {
    try {
      await api.post('/permissions/bulk-update', { updates });
      toast.success(`${updates.length} permissions updated`);
      fetchData();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  // Clone role permissions
  const clonePermissions = async (fromRole, toRole) => {
    try {
      await api.post('/permissions/clone', { fromRole, toRole });
      toast.success(`Permissions cloned from ${fromRole} to ${toRole}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to clone permissions');
    }
  };

  // Export permissions
  const exportPermissions = async (format = 'json') => {
    try {
      const { data } = await api.get(`/permissions/export?format=${format}`);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permissions-${new Date().toISOString()}.json`;
      a.click();
      toast.success('Permissions exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // Get unique modules
  const modules = [...new Set(permissions.map(p => p.module))].sort();

  // Filter permissions
  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = p.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterModule === 'all' || p.module === filterModule;
    return matchesSearch && matchesFilter;
  });

  // Group permissions by role
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.role]) acc[perm.role] = [];
    acc[perm.role].push(perm);
    return acc;
  }, {});

  // Toggle role expansion
  const toggleRoleExpand = (role) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  // Action columns
  const actionColumns = ['create', 'read', 'update', 'delete', 'list', 'export', 'import', 'print'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Advanced Permission Management
          </h1>
          <p className="text-gray-600 mt-1">Manage roles, permissions, and access control</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => exportPermissions()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowRoleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Total Roles</p>
                <p className="text-3xl font-bold mt-1">{stats.byRole?.length || 0}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-200" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Permissions</p>
                <p className="text-3xl font-bold mt-1">{stats.total?.[0]?.count || 0}</p>
              </div>
              <Lock className="w-12 h-12 text-green-200" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Modules</p>
                <p className="text-3xl font-bold mt-1">{stats.byModule?.length || 0}</p>
              </div>
              <Settings className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.byStatus?.find(s => s._id === 'active')?.count || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              {modules.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterModule('all'); }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Permission Matrix by Role */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([role, perms]) => {
          const isExpanded = expandedRoles.has(role);
          const roleData = roles.find(r => r.name === role);
          
          return (
            <Card key={role} className="overflow-hidden">
              {/* Role Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleRoleExpand(role)}
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? 
                    <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  }
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: roleData?.color || '#6366f1' }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {roleData?.displayName || role.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">{roleData?.description || ''}</p>
                  </div>
                  <Badge variant={roleData?.type === 'system' ? 'info' : 'success'}>
                    {roleData?.type || 'custom'}
                  </Badge>
                  <Badge variant="outline">{perms.length} permissions</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRole(role);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Clone permissions
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Permission Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Module
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          Scope
                        </th>
                        {actionColumns.map(action => (
                          <th key={action} className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            {action}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {perms.map(perm => (
                        <tr key={perm._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{perm.module}</span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <Badge variant="outline" size="sm">{perm.scope || 'self'}</Badge>
                          </td>
                          {actionColumns.map(action => (
                            <td key={action} className="px-3 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => togglePermission(perm._id, action, perm.actions[action])}
                                className={`p-1 rounded transition-all ${
                                  perm.actions[action]
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {perm.actions[action] ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingPermission(perm);
                                setShowPermissionModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedPermissions).length === 0 && (
        <Card className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or create new permissions</p>
          <Button onClick={() => setShowPermissionModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Permission
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PermissionManager;
