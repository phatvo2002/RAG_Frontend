import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';
import { mockRoles } from '@/data/mockData';
import type { ApiFunctionTreeNode } from './api-functions.api';

// ============================================================================
// 1. TYPES & DATA STRUCTURES (Chuẩn khớp đặc tả 10 endpoints Backend)
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
  functionId?: string;
  functionCode: string;
  functionName?: string;
  module?: string;
  effect?: number; // 0 = Allow, 1 = Deny
  validFrom?: string | null;
  expiresAt?: string | null;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  actions?: string[];
}

export interface ApiFunctionItem {
  apiFunctionId: string;
  code: string;
  module: string;
  name: string;
  description?: string | null;
  httpMethod?: string;
  routeTemplate?: string;
  actionType?: string;
  riskLevel?: string;
  requiresConfirmation?: boolean;
  status?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleUserItem {
  userId: string;
  email: string;
  userName: string;
  displayName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  department?: string;
}

export interface RoleDetailResponse {
  roleId: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  apiFunctions?: ApiFunctionTreeNode[];
  assignedApiFunctions?: ApiFunctionItem[];
  users?: RoleUserItem[];
}

// 2. Thêm mới Role payload: { name: string }
export interface CreateRoleData {
  name: string;
  code?: string;
  description?: string;
  permissions?: string[] | RolePermissionItem[];
}

// 4. Cập nhật Role payload: { name: string }
export interface UpdateRoleData {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
  permissions?: string[] | RolePermissionItem[];
}

// 7. Gán 1 ApiFunction cho Role payload
export interface AssignFunctionPermissionData {
  effect?: 0 | 1; // 0 = Allow, 1 = Deny
  validFrom?: string | null;
  expiresAt?: string | null;
}

// 10. Đồng bộ toàn bộ ApiFunction của Role payload
export interface SyncRolePermissionsData {
  functionIds: string[];
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
  const code = raw.code || raw.roleCode || name.slice(0, 5).toUpperCase();
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
    permissions: raw.permissions || raw.apiFunctions || [],
    isSystem: raw.isSystem || false,
  };
}

// ============================================================================
// 2. HTTP FETCH SERVICE (10 Backend Endpoints theo đúng đặc tả)
// ============================================================================
export const rolesApi = {
  /**
   * 1. GET /api/roles?page=1&pageSize=20
   * Lấy danh sách Role
   */
  async getRoles(params?: { search?: string; page?: number; pageSize?: number }): Promise<RoleItem[]> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;

    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('pageSize', pageSize.toString());
    if (params?.search) {
      query.append('search', params.search);
    }

    try {
      const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/roles?${query.toString()}`, {
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
   * 2. POST /api/roles
   * Thêm mới Role: Request body { "name": "SuperAdmin" }
   */
  async createRole(data: CreateRoleData): Promise<RoleItem> {
    const payload = {
      name: data.name.trim(),
    };

    const response = await apiClient<ApiResponse<any> | any>('/api/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeRole(resData);
  },

  /**
   * 3. GET /api/roles/{roleId}
   * Lấy chi tiết Role: apiFunctions là cây phân hệ; assignedApiFunctions chứa quyền đã cấp.
   */
  async getRoleById(roleId: string): Promise<RoleDetailResponse> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    const apiFunctions = Array.isArray(resData.apiFunctions) ? resData.apiFunctions : [];
    const apiFunctionTree = Array.isArray(resData.apiFunctionTree)
      ? resData.apiFunctionTree
      : apiFunctions.some((item: any) => Array.isArray(item.childFunctions))
        ? apiFunctions
        : [];
    const assignedApiFunctions = Array.isArray(resData.assignedApiFunctions)
      ? resData.assignedApiFunctions
      : apiFunctions.filter((item: any) => !Array.isArray(item.childFunctions));

    return {
      roleId: resData.roleId || resData.id || roleId,
      name: resData.name || resData.roleName || resData.role || '',
      code: resData.code || (resData.name || '').slice(0, 5).toUpperCase(),
      description: resData.description || '',
      isActive: resData.isActive !== false && resData.status !== 'Inactive' && resData.status !== 'Vô hiệu hóa',
      apiFunctions: apiFunctionTree,
      assignedApiFunctions,
      users: Array.isArray(resData.users) ? resData.users.map((u: any) => ({
        userId: u.userId || u.id || '',
        email: u.email || '',
        userName: u.userName || u.username || u.email?.split('@')[0] || '',
        displayName: u.displayName || u.name || u.userName || u.email?.split('@')[0] || '',
        phoneNumber: u.phoneNumber || u.phone || '',
        isActive: u.isActive !== false,
        department: u.department || 'Công nghệ thông tin',
      })) : [],
    };
  },

  /**
   * 4. PUT /api/roles/{roleId}
   * Cập nhật Role: Request body { "name": "SystemAdmin" }
   */
  async updateRole(roleId: string, data: UpdateRoleData): Promise<RoleItem> {
    const payload = {
      name: data.name ? data.name.trim() : '',
    };

    const response = await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeRole(resData);
  },

  /**
   * 5. POST /api/roles/{roleId}/deactivate
   * Vô hiệu hóa Role
   */
  async deactivateRole(roleId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * 6. POST /api/roles/{roleId}/reactivate
   * Kích hoạt lại Role
   */
  async reactivateRole(roleId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * 7. PUT /api/roles/{roleId}/permissions/{functionCode}
   * Gán một ApiFunction cho Role
   */
  async assignRoleFunction(
    roleId: string,
    functionCode: string,
    data?: AssignFunctionPermissionData
  ): Promise<void> {
    const payload = {
      effect: data?.effect ?? 0, // 0 = Allow, 1 = Deny
      validFrom: data?.validFrom ?? null,
      expiresAt: data?.expiresAt ?? null,
    };

    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions/${encodeURIComponent(functionCode)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 8. DELETE /api/roles/{roleId}/permissions/{functionCode}
   * Xóa ApiFunction khỏi Role (thu hồi quyền)
   */
  async removeRoleFunction(roleId: string, functionCode: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions/${encodeURIComponent(functionCode)}`, {
      method: 'DELETE',
    });
  },

  /**
   * 9. GET /api/roles/{roleId}/permissions
   * Lấy danh sách ApiFunction của Role
   */
  async getRolePermissions(roleId: string): Promise<any[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/roles/${roleId}/permissions`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    if (Array.isArray(resData)) {
      return resData;
    }
    if (resData && Array.isArray(resData.items)) {
      return resData.items;
    }
    return [];
  },

  /**
   * 10. PUT /api/roles/{roleId}/permissions
   * Đồng bộ toàn bộ ApiFunction của Role
   * Request body: { "functionIds": ["guid1", "guid2"] }
   */
  async syncRolePermissions(roleId: string, functionIds: string[]): Promise<void> {
    // Loại bỏ function ID trùng lặp
    const uniqueIds = Array.from(new Set(functionIds.filter(Boolean)));

    const payload = {
      functionIds: uniqueIds,
    };

    await apiClient<ApiResponse<any> | any>(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Alias tương thích ngược
  async updateRolePermissions(roleId: string, permissions: any): Promise<void> {
    const ids = Array.isArray(permissions)
      ? permissions
      : permissions?.functionIds || [];
    return this.syncRolePermissions(roleId, ids);
  },
  async assignRolePermission(roleId: string, functionCode: string, permissionData?: any): Promise<void> {
    return this.assignRoleFunction(roleId, functionCode, permissionData);
  },
  async removeRolePermission(roleId: string, functionCode: string): Promise<void> {
    return this.removeRoleFunction(roleId, functionCode);
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
 * Hook Query: 1. Lấy danh sách Role
 */
export function useRolesQuery(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: rolesQueryKeys.list(params),
    queryFn: async () => {
      return await rolesApi.getRoles(params);
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
}

/**
 * Hook Query: 3. Lấy chi tiết một vai trò
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
 * Hook Query: 9. Lấy danh sách ApiFunction của Role
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
 * Hook Mutation: 2. Tạo mới Role
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
 * Hook Mutation: 4. Cập nhật Role
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
 * Hook Mutation: 5. Vô hiệu hóa Role
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
 * Hook Mutation: 6. Kích hoạt lại Role
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
 * Hook Mutation: 7. Gán một ApiFunction cho Role
 */
export function useAssignRoleFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      functionCode,
      data,
    }: {
      roleId: string;
      functionCode: string;
      data?: AssignFunctionPermissionData;
    }): Promise<void> => {
      await rolesApi.assignRoleFunction(roleId, functionCode, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
    },
  });
}

/**
 * Hook Mutation: 8. Xóa ApiFunction khỏi Role
 */
export function useRemoveRoleFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      functionCode,
    }: {
      roleId: string;
      functionCode: string;
    }): Promise<void> => {
      await rolesApi.removeRoleFunction(roleId, functionCode);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
    },
  });
}

/**
 * Hook Mutation: 10. Đồng bộ toàn bộ ApiFunction của Role
 */
export function useSyncRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      functionIds,
    }: {
      roleId: string;
      functionIds: string[];
    }): Promise<void> => {
      await rolesApi.syncRolePermissions(roleId, functionIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.permissions(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
    },
  });
}

// Alias tương thích
export const useUpdateRolePermissionsMutation = useSyncRolePermissionsMutation;
export const useAssignRolePermissionMutation = useAssignRoleFunctionMutation;
export const useRemoveRolePermissionMutation = useRemoveRoleFunctionMutation;
