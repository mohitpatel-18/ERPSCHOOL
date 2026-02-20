import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Advanced Permission Hook - Industry Level
 * Comprehensive permission checking and management for frontend
 */

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/permissions/role/' + getUserRole());
      const permMap = {};
      data.data.forEach(p => {
        permMap[p.module] = {
          actions: p.actions,
          scope: p.scope,
          conditions: p.conditions,
          fieldPermissions: p.fieldPermissions
        };
      });
      setPermissions(permMap);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'student';
  };

  // Legacy support
  const can = (module, action) => {
    return permissions[module]?.actions?.[action] === true;
  };

  // Check if user has specific permission
  const hasPermission = useCallback((module, action) => {
    return permissions[module]?.actions?.[action] === true;
  }, [permissions]);

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback((checks) => {
    return checks.some(([module, action]) => hasPermission(module, action));
  }, [hasPermission]);

  // Check if user has all permissions
  const hasAllPermissions = useCallback((checks) => {
    return checks.every(([module, action]) => hasPermission(module, action));
  }, [hasPermission]);

  // Get all allowed actions for a module
  const getAllowedActions = useCallback((module) => {
    if (!permissions[module]) return [];
    const actions = permissions[module].actions || {};
    return Object.entries(actions)
      .filter(([_, allowed]) => allowed)
      .map(([action, _]) => action);
  }, [permissions]);

  // Check field-level permission
  const canAccessField = useCallback((module, field, accessType = 'read') => {
    if (!permissions[module]) return true;
    const fieldPerms = permissions[module].fieldPermissions || {};
    const fieldPerm = fieldPerms[field];
    if (!fieldPerm) return true;
    return fieldPerm[accessType] === true;
  }, [permissions]);

  // Get permission scope
  const getScope = useCallback((module) => {
    if (!permissions[module]) return 'self';
    return permissions[module].scope || 'self';
  }, [permissions]);

  return {
    permissions,
    loading,
    error,
    can, // Legacy
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllowedActions,
    canAccessField,
    getScope,
    refresh: fetchPermissions
  };
};

/**
 * Hook for permission checking with remote validation
 */
export const usePermissionCheck = () => {
  const [checking, setChecking] = useState(false);

  const checkPermission = useCallback(async (module, action, context = {}) => {
    setChecking(true);
    try {
      const { data } = await api.post('/permissions/check', { module, action, context });
      return data.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  const batchCheckPermissions = useCallback(async (checks) => {
    setChecking(true);
    try {
      const { data } = await api.post('/permissions/batch-check', { checks });
      return data.data;
    } catch (error) {
      console.error('Batch permission check failed:', error);
      return [];
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checkPermission,
    batchCheckPermissions,
    checking
  };
};

/**
 * Hook for role management
 */
export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/roles', { params: filters });
      setRoles(data.data);
      setError(null);
      return data.data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData) => {
    try {
      const { data } = await api.post('/roles', roleData);
      await fetchRoles();
      return data.data;
    } catch (err) {
      throw err;
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (roleId, updates) => {
    try {
      const { data } = await api.put(`/roles/${roleId}`, updates);
      await fetchRoles();
      return data.data;
    } catch (err) {
      throw err;
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (roleId) => {
    try {
      await api.delete(`/roles/${roleId}`);
      await fetchRoles();
    } catch (err) {
      throw err;
    }
  }, [fetchRoles]);

  const getRoleHierarchy = useCallback(async () => {
    try {
      const { data } = await api.get('/roles/hierarchy');
      return data.data;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleHierarchy
  };
};

export default usePermissions;
