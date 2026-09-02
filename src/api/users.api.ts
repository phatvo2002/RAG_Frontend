import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { User, ApiResponse } from '@/types';
import { normalizeUser } from './auth.api';

// ============================================================================
// 1. TYPES & DATA STRUCTURES
// ============================================================================
export interface CreateUserData {
  email: string;
  userName?: string;
  displayName?: string;
  fullName?: string;
  name?: string;
  password?: string;
  role?: string;
  roleId?: string;
  roleName?: string;
  roles?: any[];
  roleIds?: string[];
  department?: string;
  departmentId?: string;
  phone?: string;
  phoneNumber?: string;
}

export interface UpdateUserData {
  email?: string;
  userName?: string;
  displayName?: string;
  fullName?: string;
  name?: string;
  role?: string;
  roleId?: string;
  roleName?: string;
  roles?: any[];
  roleIds?: string[];
  department?: string;
  departmentId?: string;
  phone?: string;
  phoneNumber?: string;
  status?: string;
}

export interface ResetPasswordData {
  newPassword?: string;
  confirmPassword?: string;
}

export interface UserRoleItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

// ============================================================================
// 2. HTTP FETCH SERVICE (10 Backend Endpoints)
// ============================================================================
export const usersApi = {
  /**
   * GET /api/users
   * Lấy danh sách toàn bộ người dùng
   */
  async getUsers(params?: { search?: string; page?: number; pageSize?: number }): Promise<User[]> {
    let queryStr = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      const qs = searchParams.toString();
      if (qs) queryStr = `?${qs}`;
    }

    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/users${queryStr}`, {
      method: 'GET',
    });

    const rawList = (response as any).data || response;
    if (!Array.isArray(rawList)) {
      if (rawList && Array.isArray(rawList.items)) {
        return rawList.items.map(normalizeUser);
      }
      return [];
    }
    return rawList.map(normalizeUser);
  },

  /**
   * POST /api/users
   * Tạo mới người dùng
   */
  async createUser(data: CreateUserData): Promise<User> {
    const displayName = data.displayName || data.fullName || data.name || '';
    const roleName = data.role || data.roleName || 'Nhân viên';
    const roleId = data.roleId || (data.roleIds && data.roleIds[0]);

    const rolesArray = data.roles || (roleId ? [{ roleId, roleName, status: 'Active' }] : [{ roleName, status: 'Active' }]);
    const roleIdsArray = data.roleIds || (roleId ? [roleId] : []);

    const payload: any = {
      email: data.email,
      username: data.userName || data.email,
      userName: data.userName || data.email,
      displayName: displayName,
      fullName: data.fullName || displayName,
      name: data.name || displayName,
      password: data.password || 'Nexora@2026',
      role: roleName,
      roleName: roleName,
      roleId: roleId,
      roles: rolesArray,
      roleIds: roleIdsArray,
      department: data.department || 'Công nghệ thông tin',
      departmentId: data.departmentId,
      phoneNumber: data.phone || data.phoneNumber,
    };

    const response = await apiClient<ApiResponse<any> | any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    let resData = (response as any).data || response;
    const createdUserId = resData.userId || resData.id;

    // Nếu có roleId và tạo thành công user, đảm bảo vai trò được liên kết
    if (roleId && createdUserId) {
      try {
        await apiClient(`/api/users/${createdUserId}/roles/${roleId}`, {
          method: 'POST',
        });
      } catch {
        try {
          await apiClient(`/api/users/${createdUserId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ roleId, roleIds: [roleId] }),
          });
        } catch {
          // Bỏ qua
        }
      }
    }

    return normalizeUser(resData);
  },

  /**
   * GET /api/users/{userId}
   * Lấy thông tin chi tiết một người dùng
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/users/${userId}`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    return normalizeUser(resData);
  },

  /**
   * PUT /api/users/{userId}
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const displayName = data.displayName || data.fullName || data.name || '';
    const roleName = data.role || data.roleName || '';
    const roleId = data.roleId || (data.roleIds && data.roleIds[0]);

    const rolesArray = data.roles || (roleId ? [{ roleId, roleName: roleName || 'Vai trò', status: 'Active' }] : (roleName ? [{ roleName, status: 'Active' }] : []));
    const roleIdsArray = data.roleIds || (roleId ? [roleId] : []);

    const payload: any = {
      email: data.email,
      displayName: displayName,
      fullName: data.fullName || displayName,
      userName: data.userName || data.email,
      name: data.name || displayName,
      role: roleName,
      roleName: roleName,
      roleId: roleId,
      roles: rolesArray,
      roleIds: roleIdsArray,
      department: data.department,
      departmentId: data.departmentId,
      phoneNumber: data.phone || data.phoneNumber,
      status: data.status,
    };

    const response = await apiClient<ApiResponse<any> | any>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    let resData = (response as any).data || response;

    // Đồng thời gọi endpoint gán vai trò nếu có roleId để bảo đảm vai trò được lưu vào bảng UserRoles
    if (roleId) {
      try {
        await apiClient(`/api/users/${userId}/roles/${roleId}`, {
          method: 'POST',
        });
      } catch {
        try {
          await apiClient(`/api/users/${userId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ roleId, roleIds: [roleId] }),
          });
        } catch {
          // Bỏ qua nếu endpoint này không áp dụng
        }
      }

      // Fetch lại dữ liệu user sau khi gán role nếu response từ PUT chưa có roles
      if (!resData.roles || resData.roles.length === 0) {
        try {
          const freshUser = await apiClient<ApiResponse<any> | any>(`/api/users/${userId}`, { method: 'GET' });
          const freshData = (freshUser as any).data || freshUser;
          if (freshData) resData = freshData;
        } catch {
          // Fallback
        }
      }
    }

    return normalizeUser(resData);
  },

  /**
   * POST /api/users/{userId}/deactivate
   * Khóa / vô hiệu hóa người dùng
   */
  async deactivateUser(userId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/users/${userId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/users/{userId}/reactivate
   * Kích hoạt lại người dùng
   */
  async reactivateUser(userId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/users/${userId}/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/users/{userId}/reset-password
   * Đặt lại mật khẩu cho người dùng
   */
  async resetPassword(userId: string, data?: ResetPasswordData): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        newPassword: data?.newPassword || 'Nexora@2026',
        confirmPassword: data?.confirmPassword || data?.newPassword || 'Nexora@2026',
      }),
    });
  },

  /**
   * GET /api/users/{userId}/roles
   * Lấy danh sách các vai trò của người dùng
   */
  async getUserRoles(userId: string): Promise<UserRoleItem[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/users/${userId}/roles`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    return Array.isArray(resData) ? resData : [];
  },

  /**
   * POST /api/users/{userId}/roles/{roleId}
   * Gán vai trò cho người dùng và cập nhật thông tin User
   */
  async assignUserRole(userId: string, roleId: string, roleName?: string): Promise<void> {
    try {
      await apiClient<ApiResponse<any> | any>(`/api/users/${userId}/roles/${roleId}`, {
        method: 'POST',
      });
    } catch {
      try {
        await apiClient(`/api/users/${userId}/roles`, {
          method: 'POST',
          body: JSON.stringify({ roleId, roleIds: [roleId] }),
        });
      } catch {
        // Fallback
      }
    }

    // Đồng thời cập nhật User Profile để thêm vai trò này vào danh sách roles của user
    try {
      const userRes = await apiClient<ApiResponse<any> | any>(`/api/users/${userId}`, { method: 'GET' });
      const rawUser = (userRes as any).data || userRes;
      if (rawUser) {
        const existingRoles = Array.isArray(rawUser.roles) ? rawUser.roles : [];
        const isExisting = existingRoles.some((r: any) => (r.roleId || r.id) === roleId);

        const newRoleObj = { roleId, roleName: roleName || rawUser.role || 'Vai trò', status: 'Active' };
        const updatedRoles = isExisting ? existingRoles : [...existingRoles, newRoleObj];
        const updatedRoleIds = Array.isArray(rawUser.roleIds)
          ? (rawUser.roleIds.includes(roleId) ? rawUser.roleIds : [...rawUser.roleIds, roleId])
          : updatedRoles.map((r: any) => r.roleId || r.id);

        await apiClient(`/api/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...rawUser,
            role: roleName || rawUser.role,
            roleName: roleName || rawUser.roleName || rawUser.role,
            roleId: roleId,
            roles: updatedRoles,
            roleIds: updatedRoleIds,
          }),
        });
      }
    } catch {
      // Bỏ qua lỗi fallback
    }
  },

  /**
   * DELETE /api/users/{userId}/roles/{roleId}
   * Thu hồi vai trò của người dùng và cập nhật lại thông tin User
   */
  async removeUserRole(userId: string, roleId: string): Promise<void> {
    try {
      await apiClient<ApiResponse<any> | any>(`/api/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback nếu DELETE roles subresource không hỗ trợ
    }

    // Cập nhật lại thông tin User Profile để gỡ bỏ vai trò này
    try {
      const userRes = await apiClient<ApiResponse<any> | any>(`/api/users/${userId}`, { method: 'GET' });
      const rawUser = (userRes as any).data || userRes;
      if (rawUser) {
        const remainingRoles = Array.isArray(rawUser.roles)
          ? rawUser.roles.filter((r: any) => (r.roleId || r.id) !== roleId && r.roleName !== rawUser.role)
          : [];
        const remainingRoleIds = Array.isArray(rawUser.roleIds)
          ? rawUser.roleIds.filter((id: string) => id !== roleId)
          : remainingRoles.map((r: any) => r.roleId || r.id);

        const newPrimaryRole = remainingRoles.length > 0 ? remainingRoles[0].roleName : 'Nhân viên';
        const newPrimaryRoleId = remainingRoles.length > 0 ? (remainingRoles[0].roleId || remainingRoles[0].id) : null;

        await apiClient(`/api/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...rawUser,
            role: newPrimaryRole,
            roleName: newPrimaryRole,
            roleId: newPrimaryRoleId,
            roles: remainingRoles,
            roleIds: remainingRoleIds,
          }),
        });
      }
    } catch {
      // Bỏ qua lỗi fallback
    }
  },
};

// ============================================================================
// 3. TANSTACK QUERY v5 KEYS & HOOKS
// ============================================================================
export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...usersQueryKeys.lists(), params] as const,
  details: () => [...usersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
  roles: (id: string) => [...usersQueryKeys.detail(id), 'roles'] as const,
};

/**
 * Hook Query: Lấy danh sách toàn bộ người dùng
 */
export function useUsersQuery(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: async () => {
      return await usersApi.getUsers(params);
    },
    staleTime: 1000 * 60 * 3, // Cache 3 phút
  });
}

/**
 * Hook Query: Lấy chi tiết 1 người dùng
 */
export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: async () => {
      return await usersApi.getUserById(userId);
    },
    enabled: Boolean(userId),
  });
}

/**
 * Hook Query: Lấy danh sách vai trò của 1 người dùng
 */
export function useUserRolesQuery(userId: string) {
  return useQuery({
    queryKey: usersQueryKeys.roles(userId),
    queryFn: async () => {
      return await usersApi.getUserRoles(userId);
    },
    enabled: Boolean(userId),
  });
}

/**
 * Hook Mutation: Tạo mới người dùng
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<User> => {
      return await usersApi.createUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

/**
 * Hook Mutation: Cập nhật người dùng
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }): Promise<User> => {
      return await usersApi.updateUser(userId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Khóa / Vô hiệu hóa người dùng
 */
export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await usersApi.deactivateUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Mở khóa / Kích hoạt lại người dùng
 */
export function useReactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await usersApi.reactivateUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Đặt lại mật khẩu
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data?: ResetPasswordData }): Promise<void> => {
      await usersApi.resetPassword(userId, data);
    },
  });
}

/**
 * Hook Mutation: Gán vai trò
 */
export function useAssignRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId, roleName }: { userId: string; roleId: string; roleName?: string }): Promise<void> => {
      await usersApi.assignUserRole(userId, roleId, roleName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      if (variables.roleId) {
        queryClient.invalidateQueries({ queryKey: ['roles', 'detail', variables.roleId] });
      }
    },
  });
}

/**
 * Hook Mutation: Thu hồi vai trò
 */
export function useRemoveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }): Promise<void> => {
      await usersApi.removeUserRole(userId, roleId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      if (variables.roleId) {
        queryClient.invalidateQueries({ queryKey: ['roles', 'detail', variables.roleId] });
      }
    },
  });
}

