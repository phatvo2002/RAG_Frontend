import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { NotFoundPage } from '@/pages/NotFoundPage';

interface PermissionGuardProps {
  module?: string | string[];
  isImplemented?: boolean;
  children: React.ReactNode;
}

/**
 * Route Guard kiểm tra quyền truy cập theo Phân hệ (Module).
 * Nếu người dùng không có quyền truy cập hoặc module chưa có API Backend,
 * tự động hiển thị/chuyển hướng sang trang 404 NotFound.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  isImplemented = true,
  children,
}) => {
  const { hasModuleAccess, isSuperAdmin, isLoading } = useUserPermissions();

  if (isLoading) {
    return null;
  }

  // 1. Nếu module chưa có API Backend -> Hiển thị 404
  if (!isImplemented) {
    return <NotFoundPage />;
  }

  // 2. Nếu là SuperAdmin -> Luôn cho phép
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // 3. Nếu không yêu cầu phân hệ đặc biệt
  if (!module || module === 'all') {
    const hasAnyAdminAccess =
      hasModuleAccess([
        'user', 'users',
        'department', 'departments', 'dept',
        'role', 'roles', 'authorization', 'permission', 'permissions',
        'activitylog', 'activity_log', 'log', 'logs', 'audit',
        'policy', 'policies',
        'config', 'configuration', 'system',
      ]);

    if (!hasAnyAdminAccess) {
      return <NotFoundPage />;
    }
    return <>{children}</>;
  }

  // 4. Kiểm tra quyền của phân hệ được yêu cầu
  if (!hasModuleAccess(module)) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
};

export default PermissionGuard;

