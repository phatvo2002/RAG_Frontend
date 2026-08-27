import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';
import { mockRoles } from '@/data/mockData';

// ============================================================================
// 1. TYPES & DATA STRUCTURES
// ============================================================================
export interface RoleItem {
  id: string;
  name: string;
  role: string;
  code?: string;
  description: string;
  userCount: number;
  status: 'Đang hoạt động' | 'Tạm khóa' | 'Vô hiệu hóa' | string;
  permissions?: RolePermissionItem[];
  isSystem?: boolean;
}

export interface RolePermissionItem {
  id?: string;
  functionCode: string;
  functionName?: string;
  module?: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  actions?: string[];
}

export interface CreateRoleData {
  name: string;
  code?: string;
  description?: string;
  permissions?: string[] | RolePermissionItem[];
}

export interface UpdateRoleData {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
  permissions?: string[] | RolePermissionItem[];
}

/**
 * Normalizer: Chuyển đổi dữ liệu vai trò từ Backend sang RoleItem chuẩn Frontend
 */
export function normalizeRole(raw: any): RoleItem {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `role_${Date.now()}`,
      name: 'Nhân viên',
      role: 'Nhân viên',
      description: 'Quyền sử dụng thông thường',
      userCount: 0,
      status: 'Đang hoạt động',
    };
  }

  const id = (raw.id || raw.roleId || raw._id || '').toString();
  const name = raw.name || raw.roleName || raw.role || 'Vai trò mới';
  const role = raw.role || raw.name || raw.roleName || 'Vai trò mới';
  const code = raw.code || raw.roleCode || name.slice(0, 4).toUpperCase();
  const description = raw.description || raw.desc || '';
  const userCount = typeof raw.userCount === 'number'
    ? raw.userCount
    : typeof raw.usersCount === 'number'
    ? raw.usersCount
    : Array.isArray(raw.users)
    ? raw.users.length
    : 0;
  const status = raw.status === 'deactivated' || raw.isActive === false || raw.isDeactivated
    ? 'Vô hiệu hóa'
    : raw.status || 'Đang hoạt động';

  return {
    id,
    name,
    role,
    code,
    description,
    userCount,
    status,
    permissions: raw.permissions || [],
    isSystem: raw.isSystem || false,
  };
}

// ============================================================================
// 2. HTTP FETCH SERVICE (10 Backend Endpoints)
// ============================================================================
export const rolesApi = {
  /**
   * GET /api/roles
   * Lấy danh sách toàn bộ vai trò
   */
  async getRoles(params?: { search?: string }): Promise<RoleItem[]> {
    let queryStr = '';
    if (params?.search) {
      queryStr = `?search=${encodeURIComponent(params.search)}`;
    }

    try {
      const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/roles${queryStr}`, {
        method: 'GET',
      });

      const rawList = (response as any).data || response;
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeRole);
      }
      if (rawList && Array.isArray(rawList.items)) {
        return rawList.items.map(normalizeRole);
      }
      return mockRoles.map((r) => ({
        id: r.id,
        name: r.role,
        role: r.role,
        description: r.description,
        userCount: r.userCount,
        status: 'Đang hoạt động',
      }));
    } catch {
      // Fallback về mock roles nếu backend chưa khởi chạy
      return mockRoles.map((r) => ({
        id: r.id,
        name: r.role,
        role: r.role,
        description: r.description,
        userCount: r.userCount,
        status: 'Đang hoạt động',
      }));
    }
  },

  /**
   * POST /api/roles
   * Tạo mới vai trò
   */
  async createRole(data: CreateRoleData): Promise<RoleItem> {
    const payload = {
      name: data.name,
      roleName: data.name,
      code: data.code || data.name.slice(0, 4).toUpperCase(),
      description: data.description,
      permissions: data.permissions,
    };

    const response = await apiClient<ApiResponse<any> | any>('/api/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeRole(resData);
  },

  /**
   * GET /api/roles/{roleId}
   * Lấy thông tin chi tiết một vai trò
   */
  async getRoleById(roleId: string): Promise<RoleItem> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    return normalizeRole(resData);
  },

  /**
   * PUT /api/roles/{roleId}
   * Cập nhật thông tin vai trò
   */
  async updateRole(roleId: string, data: UpdateRoleData): Promise<RoleItem> {
    const payload = {
      name: data.name,
      roleName: data.name,
      code: data.code,
      description: data.description,
      status: data.status,
      permissions: data.permissions,
    };

    const response = await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeRole(resData);
  },

  /**
   * POST /api/roles/{roleId}/deactivate
   * Vô hiệu hóa vai trò
   */
  async deactivateRole(roleId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/roles/{roleId}/reactivate
   * Kích hoạt lại vai trò
   */
  async reactivateRole(roleId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * GET /api/roles/{roleId}/permissions
   * Lấy danh sách quyền hạn của vai trò
   */
  async getRolePermissions(roleId: string): Promise<RolePermissionItem[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/roles/${roleId}/permissions`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    if (Array.isArray(resData)) {
      return resData;
    }
    return [];
  },

  /**
   * PUT /api/roles/{roleId}/permissions
   * Cập nhật danh sách quyền hạn cho vai trò
   */
  async updateRolePermissions(roleId: string, permissions: any): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  /**
   * PUT /api/roles/{roleId}/permissions/{functionCode}
   * Gán quyền hạn chức năng cho vai trò
   */
  async assignRolePermission(roleId: string, functionCode: string, permissionData?: any): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions/${functionCode}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData || {}),
    });
  },

  /**
   * DELETE /api/roles/{roleId}/permissions/{functionCode}
   * Thu hồi quyền hạn chức năng của vai trò
   */
  async removeRolePermission(roleId: string, functionCode: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions/${functionCode}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// 3. TANSTACK QUERY v5 KEYS & HOOKS
// ============================================================================
export const rolesQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...rolesQueryKeys.lists(), params] as const,
  details: () => [...rolesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...rolesQueryKeys.details(), id] as const,
  permissions: (id: string) => [...rolesQueryKeys.detail(id), 'permissions'] as const,
};

/**
 * Hook Query: Lấy danh sách toàn bộ vai trò
 */
export function useRolesQuery(params?: { search?: string }) {
  return useQuery({
    queryKey: rolesQueryKeys.list(params),
    queryFn: async () => {
      return await rolesApi.getRoles(params);
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
}

/**
 * Hook Query: Lấy chi tiết một vai trò
 */
export function useRoleQuery(roleId: string) {
  return useQuery({
    queryKey: rolesQueryKeys.detail(roleId),
    queryFn: async () => {
      return await rolesApi.getRoleById(roleId);
    },
    enabled: Boolean(roleId),
  });
}

/**
 * Hook Query: Lấy quyền hạn của một vai trò
 */
export function useRolePermissionsQuery(roleId: string) {
  return useQuery({
    queryKey: rolesQueryKeys.permissions(roleId),
    queryFn: async () => {
      return await rolesApi.getRolePermissions(roleId);
    },
    enabled: Boolean(roleId),
  });
}

/**
 * Hook Mutation: Tạo mới vai trò
 */
export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleData): Promise<RoleItem> => {
      return await rolesApi.createRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

/**
 * Hook Mutation: Cập nhật vai trò
 */
export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, data }: { roleId: string; data: UpdateRoleData }): Promise<RoleItem> => {
      return await rolesApi.updateRole(roleId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Vô hiệu hóa vai trò
 */
export function useDeactivateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      await rolesApi.deactivateRole(roleId);
    },
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Kích hoạt lại vai trò
 */
export function useReactivateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      await rolesApi.reactivateRole(roleId);
    },
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Cập nhật quyền hạn vai trò
 */
export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: any }): Promise<void> => {
      await rolesApi.updateRolePermissions(roleId, permissions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
    },
  });
}

/**
 * Hook Mutation: Gán quyền hạn chức năng
 */
export function useAssignRolePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, functionCode, permissionData }: { roleId: string; functionCode: string; permissionData?: any }): Promise<void> => {
      await rolesApi.assignRolePermission(roleId, functionCode, permissionData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
    },
  });
}

/**
 * Hook Mutation: Thu hồi quyền hạn chức năng
 */
export function useRemoveRolePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, functionCode }: { roleId: string; functionCode: string }): Promise<void> => {
      await rolesApi.removeRolePermission(roleId, functionCode);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
    },
  });
}
