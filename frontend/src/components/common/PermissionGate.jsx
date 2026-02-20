import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Lock } from 'lucide-react';

/**
 * Permission Gate Component
 * Conditionally renders children based on permission checks
 * 
 * Usage:
 * <PermissionGate module="students" action="create">
 *   <Button>Add Student</Button>
 * </PermissionGate>
 */

const PermissionGate = ({ 
  module, 
  action, 
  children, 
  fallback = null,
  showMessage = false,
  requireAll = false,
  permissions: permissionChecks = null
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return fallback;
  }

  let hasAccess = false;

  if (permissionChecks) {
    // Multiple permission checks
    hasAccess = requireAll 
      ? hasAllPermissions(permissionChecks)
      : hasAnyPermission(permissionChecks);
  } else if (module && action) {
    // Single permission check
    hasAccess = hasPermission(module, action);
  }

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="flex items-center gap-2 text-gray-500 p-4 bg-gray-50 rounded-lg">
          <Lock className="w-5 h-5" />
          <span>You don't have permission to access this feature</span>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = (Component, module, action) => {
  return (props) => (
    <PermissionGate module={module} action={action}>
      <Component {...props} />
    </PermissionGate>
  );
};

/**
 * Hook for conditional rendering based on permissions
 */
export const usePermissionGate = (module, action) => {
  const { hasPermission } = usePermissions();
  return hasPermission(module, action);
};

export default PermissionGate;
