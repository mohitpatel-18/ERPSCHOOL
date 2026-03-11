import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Shield, Users, Check, X, Edit, Trash2, Copy, Download, Upload,
  Save, Plus, Search, Filter, RefreshCw, Eye, Lock, Unlock,
  AlertTriangle, TrendingUp, Settings, ChevronDown, ChevronRight, Grid, List
} from 'lucide-react';
import PermissionMatrix from './PermissionMatrix';
import RoleCard from './RoleCard';

/**
 * Advanced Permission Manager - Industry Level
 * Features:
 * - Role-based permission management
 * - Visual permission matrix
 * - Role CRUD operations
 * - Permission analytics
 */

const PermissionManager = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    type: 'custom',
    category: 'administrative',
    color: '#3b82f6'
  });

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

  // Create new role
  const createRole = async () => {
    try {
      await api.post('/roles', newRole);
      toast.success('Role created successfully!');
      setShowRoleModal(false);
      setNewRole({
        name: '',
        displayName: '',
        description: '',
        type: 'custom',
        category: 'administrative',
        color: '#3b82f6'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create role');
      console.error(error);
    }
  };

  // Edit role
  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRole(role);
    setShowRoleModal(true);
  };

  // Delete role
  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.displayName}"?`)) return;
    
    try {
      await api.delete(`/roles/${role._id}`);
      toast.success('Role deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete role');
      console.error(error);
    }
  };

  // Clone role
  const handleCloneRole = async (role) => {
    try {
      const clonedRole = {
        ...role,
        name: `${role.name}_copy`,
        displayName: `${role.displayName} (Copy)`,
        type: 'custom'
      };
      delete clonedRole._id;
      
      await api.post('/roles', clonedRole);
      toast.success('Role cloned successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to clone role');
      console.error(error);
    }
  };

  // Get permission count for role
  const getPermissionCount = (roleName) => {
    return permissions.filter(p => p.role === roleName).length;
  };

  // Get unique modules
  const uniqueModules = [...new Set(permissions.map(p => p.module))].sort();

  // Filtered permissions
  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = p.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || p.module === filterModule;
    const matchesRole = filterRole === 'all' || p.role === filterRole;
    return matchesSearch && matchesModule && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Advanced Permission Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage roles, permissions, and access control for your organization
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Modules</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueModules.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Grid className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Roles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roles.filter(r => r.type === 'system').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'matrix', 'permissions', 'analytics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setEditingRole(null);
                    setShowRoleModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Role
                </button>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles
                .filter(role => 
                  role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  role.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(role => (
                  <RoleCard
                    key={role._id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    onClone={handleCloneRole}
                    permissionCount={getPermissionCount(role.name)}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <PermissionMatrix />
        )}

        {activeTab === 'permissions' && (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role._id} value={role.name}>{role.displayName}</option>
                ))}
              </select>
              
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map(module => (
                  <option key={module} value={module}>{module.replace(/_/g, ' ')}</option>
                ))}
              </select>

              <div className="ml-auto text-sm text-gray-600">
                Showing {filteredPermissions.length} of {permissions.length} permissions
              </div>
            </div>

            {/* Permissions List */}
            <div className="space-y-4">
              {filteredPermissions.map(perm => (
                <div key={perm._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {perm.module.replace(/_/g, ' ')}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {roles.find(r => r.name === perm.role)?.displayName || perm.role}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                          {perm.scope}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(perm.actions || {}).map(([action, enabled]) => (
                      <span
                        key={action}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-6">Permission Analytics</h3>
            
            {stats && (
              <div className="space-y-6">
                {/* By Role */}
                <div>
                  <h4 className="font-medium mb-3">Permissions by Role</h4>
                  <div className="space-y-2">
                    {stats.byRole?.map(item => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="capitalize">{item._id}</span>
                        <span className="font-bold text-blue-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Module */}
                <div>
                  <h4 className="font-medium mb-3">Top Modules</h4>
                  <div className="space-y-2">
                    {stats.byModule?.slice(0, 10).map(item => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="capitalize">{item._id?.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-green-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name (Slug)
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., vice_principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newRole.displayName}
                    onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Vice Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newRole.category}
                    onChange={(e) => setNewRole({ ...newRole, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="administrative">Administrative</option>
                    <option value="academic">Academic</option>
                    <option value="student">Student</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                    setNewRole({
                      name: '',
                      displayName: '',
                      description: '',
                      type: 'custom',
                      category: 'administrative',
                      color: '#3b82f6'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createRole}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Update' : 'Create'} Role
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManager;
