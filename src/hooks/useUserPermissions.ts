import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/context/AppContext';
import { rolesApi } from '@/api/roles.api';

export interface UserPermissionsResult {
  isSuperAdmin: boolean;
  permittedModules: Set<string>;
  hasModuleAccess: (module: string | string[]) => boolean;
  canAccessPath: (path: string) => boolean;
  userRoles: string[];
  isLoading: boolean;
}

/**
 * Hook quản lý và kiểm tra phân quyền động theo Phân hệ (Module-Driven Permissions)
 * Trích xuất trực tiếp danh sách module được cấp từ các vai trò và ApiFunctions của người dùng hiện tại
 */
export function useUserPermissions(): UserPermissionsResult {
  const { currentUser } = useApp();

  // 1. Thu thập tất cả tên vai trò của user
  const userRoles = useMemo(() => {
    const list: string[] = [];
    if (currentUser?.role) list.push(currentUser.role);
    if (Array.isArray(currentUser?.roles)) {
      currentUser.roles.forEach((r) => {
        const rName = r.roleName || (r as any).name || (r as any).role;
        if (rName && !list.includes(rName)) {
          list.push(rName);
        }
      });
    }
    return list;
  }, [currentUser]);

  // 2. Kiểm tra xem user có phải là SuperAdmin / Quản trị viên tối cao không
  const isSuperAdmin = useMemo(() => {
    if (!userRoles || userRoles.length === 0) return true; // Mặc định cho phép nếu chưa tải xong
    return userRoles.some((roleName) => {
      const lower = roleName.toLowerCase();
      return (
        lower.includes('admin') ||
        lower.includes('supper') ||
        lower.includes('super') ||
        lower.includes('quản trị') ||
        lower.includes('system')
      );
    });
  }, [userRoles]);

  // 3. Tải danh sách tất cả các vai trò từ hệ thống để khớp ID chính xác
  const { data: allRoles = [] } = useQuery({
    queryKey: ['allRolesForPermissions'],
    queryFn: async () => {
      return await rolesApi.getRoles();
    },
    staleTime: 1000 * 60 * 5,
  });

  // 4. Thu thập tất cả ID vai trò của user (từ profile + khớp từ danh sách allRoles)
  const effectiveRoleIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUser?.roleId) ids.add(currentUser.roleId);
    if (Array.isArray(currentUser?.roles)) {
      currentUser.roles.forEach((r) => {
        if (r.roleId) ids.add(r.roleId);
      });
    }

    // Khớp thêm ID từ tên vai trò
    userRoles.forEach((rName) => {
      const matched = allRoles.find(
        (r) =>
          r.name?.toLowerCase().trim() === rName.toLowerCase().trim() ||
          r.role?.toLowerCase().trim() === rName.toLowerCase().trim()
      );
      if (matched?.id) {
        ids.add(matched.id);
      }
    });

    return Array.from(ids);
  }, [currentUser, userRoles, allRoles]);

  // 5. Tải thông tin chi tiết các vai trò (kèm ApiFunctions) từ Backend
  const { data: roleDetails = [], isLoading } = useQuery({
    queryKey: ['currentUserRoleDetails', effectiveRoleIds],
    queryFn: async () => {
      if (effectiveRoleIds.length === 0) return [];
      const results = await Promise.all(
        effectiveRoleIds.map((id) => rolesApi.getRoleById(id).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: effectiveRoleIds.length > 0 && !isSuperAdmin,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });

  // 6. Trích xuất danh sách các phân hệ (modules) mà user có quyền truy cập
  const permittedModules = useMemo(() => {
    const modules = new Set<string>();

    // Nếu là SuperAdmin, tự động có quyền tất cả các phân hệ
    if (isSuperAdmin) {
      modules.add('all');
      modules.add('user');
      modules.add('department');
      modules.add('role');
      modules.add('roles');
      modules.add('authorization');
      modules.add('auth');
      modules.add('organization');
      modules.add('activitylog');
      modules.add('activity_log');
      modules.add('log');
      modules.add('logs');
      modules.add('audit');
      modules.add('document');
      modules.add('documents');
      modules.add('data-repo');
      return modules;
    }

    // Helper map ApiFunction module & code sang normalized module keys
    const registerFunctionPermissions = (fn: any) => {
      if (!fn) return;
      if (fn.module) {
        const m = fn.module.toLowerCase().trim();
        modules.add(m);
        if (m === 'role' || m === 'roles' || m === 'authorization') {
          modules.add('role');
          modules.add('roles');
          modules.add('authorization');
        }
        if (m === 'activitylog' || m === 'activity_log' || m === 'log' || m === 'logs' || m === 'audit') {
          modules.add('activitylog');
          modules.add('activity_log');
          modules.add('log');
          modules.add('logs');
          modules.add('audit');
        }
        if (m === 'document' || m === 'documents' || m === 'data-repo') {
          modules.add('document');
          modules.add('documents');
          modules.add('data-repo');
        }
      }

      if (fn.code) {
        const c = fn.code.toUpperCase().trim();
        if (c.startsWith('ROLE.') || c.startsWith('API_FUNCTION.')) {
          modules.add('role');
          modules.add('roles');
          modules.add('authorization');
        }
        if (c.startsWith('DEPARTMENT.')) {
          modules.add('department');
        }
        if (c.startsWith('USER.')) {
          modules.add('user');
        }
        if (c.startsWith('AUTH.')) {
          modules.add('auth');
        }
        if (c.startsWith('ORGANIZATION.')) {
          modules.add('organization');
        }
        if (c.startsWith('ACTIVITY_LOG.') || c.startsWith('ACTIVITYLOG.') || c.startsWith('LOG.') || c.startsWith('AUDIT.')) {
          modules.add('activitylog');
          modules.add('activity_log');
          modules.add('log');
          modules.add('logs');
          modules.add('audit');
        }
        if (c.startsWith('DOCUMENT.') || c.startsWith('FOLDER.')) {
          modules.add('document');
          modules.add('documents');
          modules.add('data-repo');
        }
      }

      if (fn.routeTemplate) {
        const route = fn.routeTemplate.toLowerCase();
        if (route.includes('activity-log') || route.includes('logs')) {
          modules.add('activitylog');
          modules.add('activity_log');
          modules.add('log');
          modules.add('logs');
          modules.add('audit');
        }
        if (route.includes('document') || route.includes('folder') || route.includes('data-repo')) {
          modules.add('document');
          modules.add('documents');
          modules.add('data-repo');
        }
      }
    };

    // A. Trích xuất trực tiếp từ currentUser.apiFunctions (khi Backend trả về lúc login / getMe)
    if (Array.isArray(currentUser?.apiFunctions)) {
      currentUser.apiFunctions.forEach(registerFunctionPermissions);
    }

    // B. Trích xuất từ ApiFunctions lấy theo Role Details
    roleDetails.forEach((rd) => {
      if (rd && Array.isArray(rd.apiFunctions)) {
        rd.apiFunctions.forEach(registerFunctionPermissions);
      }
    });

    // C. Fallback thông minh dựa trên tên vai trò
    userRoles.forEach((roleName) => {
      const lower = roleName.toLowerCase();
      if (
        lower.includes('department') ||
        lower.includes('phòng ban') ||
        lower.includes('trưởng phòng') ||
        lower.includes('giám đốc') ||
        lower.includes('manager')
      ) {
        modules.add('department');
        modules.add('user');
      }
      if (lower.includes('user') || lower.includes('người dùng') || lower.includes('nhân sự')) {
        modules.add('user');
      }
      if (
        lower.includes('role') ||
        lower.includes('quyền') ||
        lower.includes('phân quyền') ||
        lower.includes('vai trò') ||
        lower.includes('admin') ||
        lower.includes('supper') ||
        lower.includes('super')
      ) {
        modules.add('role');
        modules.add('roles');
        modules.add('authorization');
        modules.add('activitylog');
        modules.add('activity_log');
        modules.add('log');
        modules.add('logs');
        modules.add('audit');
      }
      if (
        lower.includes('document') ||
        lower.includes('tài liệu') ||
        lower.includes('tri thức') ||
        lower.includes('kho dữ liệu')
      ) {
        modules.add('document');
        modules.add('documents');
        modules.add('data-repo');
      }
    });

    // Mặc định cấp toàn bộ phân hệ quản trị nếu chưa phân quyền cụ thể
    if (modules.size === 0) {
      modules.add('user');
      modules.add('department');
      modules.add('role');
      modules.add('roles');
      modules.add('authorization');
      modules.add('activitylog');
      modules.add('activity_log');
      modules.add('log');
      modules.add('logs');
      modules.add('audit');
      modules.add('document');
      modules.add('documents');
      modules.add('data-repo');
    }

    return modules;
  }, [currentUser, isSuperAdmin, roleDetails, userRoles]);

  // 7. Hàm kiểm tra quyền theo module (Cho phép truy cập toàn bộ để phục vụ Demo sản phẩm)
  const hasModuleAccess = (_module: string | string[]): boolean => {
    return true;
  };

  // 8. Hàm kiểm tra quyền theo đường dẫn URL
  const canAccessPath = (path: string): boolean => {
    if (isSuperAdmin) return true;

    switch (path) {
      case '/admin/users':
        return hasModuleAccess('user');
      case '/admin/departments':
        return hasModuleAccess('department');
      case '/admin/roles':
        return hasModuleAccess(['role', 'roles', 'authorization']);
      case '/admin/logs':
        return hasModuleAccess(['activitylog', 'activity_log', 'log', 'logs', 'audit']);
      case '/data-repo':
        return hasModuleAccess(['document', 'documents', 'data-repo']);
      case '/admin':
        return true;
      default:
        return true;
    }
  };

  return {
    isSuperAdmin,
    permittedModules,
    hasModuleAccess,
    canAccessPath,
    userRoles,
    isLoading,
  };
}
