import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Department, ApiResponse } from '@/types';
import { mockDepartments } from '@/data/mockData';

// ============================================================================
// 1. TYPES & DATA STRUCTURES
// ============================================================================
export interface CreateDepartmentData {
  name: string;
  code?: string;
  parentDepartmentId?: string;
  parentDepartment?: string;
  phone?: string;
  address?: string;
  head?: string;
  manager?: string;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  parentDepartmentId?: string;
  parentDepartment?: string;
  phone?: string;
  address?: string;
  head?: string;
  manager?: string;
  description?: string;
  status?: string;
}

export interface DepartmentMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  joinedAt?: string;
}

/**
 * Normalizer: Chuyển đổi dữ liệu phòng ban từ Backend sang Department chuẩn Frontend
 */
export function normalizeDepartment(raw: any): Department {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `dept_${Date.now()}`,
      name: 'Phòng ban',
      memberCount: 0,
    };
  }

  const id = (raw.id || raw.departmentId || raw._id || '').toString();
  const name = raw.name || raw.departmentName || raw.title || 'Phòng ban mới';
  const code = raw.code || raw.departmentCode || name.slice(0, 4).toUpperCase();
  const parentDepartment = raw.parentDepartment || raw.parentDepartmentName || raw.parentName;
  const phone = raw.phone || raw.phoneNumber || raw.tel;
  const address = raw.address || raw.location || raw.office;
  const head = raw.head || raw.manager || raw.lead || raw.leaderName;
  const manager = raw.manager || raw.head;
  const memberCount = typeof raw.memberCount === 'number'
    ? raw.memberCount
    : Array.isArray(raw.members)
    ? raw.members.length
    : 0;
  const description = raw.description || raw.desc || '';
  const status = raw.status === 'archived' || raw.isArchived
    ? 'Tạm dừng'
    : raw.status || 'Đang hoạt động';

  return {
    id,
    name,
    code,
    parentDepartment,
    phone,
    address,
    head,
    manager,
    memberCount,
    description,
    status,
  };
}

// ============================================================================
// 2. HTTP FETCH SERVICE (8 Backend Endpoints)
// ============================================================================
export const departmentsApi = {
  /**
   * GET /api/departments
   * Lấy danh sách toàn bộ phòng ban
   */
  async getDepartments(params?: { search?: string; page?: number; pageSize?: number }): Promise<Department[]> {
    let queryStr = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      const qs = searchParams.toString();
      if (qs) queryStr = `?${qs}`;
    }

    try {
      const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/departments${queryStr}`, {
        method: 'GET',
      });

      const rawList = (response as any).data || response;
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeDepartment);
      }
      if (rawList && Array.isArray(rawList.items)) {
        return rawList.items.map(normalizeDepartment);
      }
      return mockDepartments;
    } catch {
      // Fallback về mock data nếu backend chưa sẵn sàng
      return mockDepartments;
    }
  },

  /**
   * POST /api/departments
   * Tạo mới phòng ban
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const payload = {
      name: data.name,
      code: data.code || data.name.slice(0, 4).toUpperCase(),
      parentDepartmentId: data.parentDepartmentId,
      parentDepartment: data.parentDepartment,
      phoneNumber: data.phone,
      phone: data.phone,
      address: data.address,
      head: data.head,
      manager: data.manager || data.head,
      description: data.description,
    };

    const response = await apiClient<ApiResponse<any> | any>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeDepartment(resData);
  },

  /**
   * GET /api/departments/{departmentId}
   * Lấy thông tin chi tiết một phòng ban
   */
  async getDepartmentById(departmentId: string): Promise<Department> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    return normalizeDepartment(resData);
  },

  /**
   * PUT /api/departments/{departmentId}
   * Cập nhật thông tin phòng ban
   */
  async updateDepartment(departmentId: string, data: UpdateDepartmentData): Promise<Department> {
    const payload = {
      name: data.name,
      code: data.code,
      parentDepartmentId: data.parentDepartmentId,
      parentDepartment: data.parentDepartment,
      phoneNumber: data.phone,
      phone: data.phone,
      address: data.address,
      head: data.head,
      manager: data.manager || data.head,
      description: data.description,
      status: data.status,
    };

    const response = await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeDepartment(resData);
  },

  /**
   * POST /api/departments/{departmentId}/archive
   * Lưu trữ / vô hiệu hóa phòng ban
   */
  async archiveDepartment(departmentId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}/archive`, {
      method: 'POST',
    });
  },

  /**
   * GET /api/departments/{departmentId}/members
   * Lấy danh sách thành viên trong phòng ban
   */
  async getDepartmentMembers(departmentId: string): Promise<DepartmentMember[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/departments/${departmentId}/members`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    if (Array.isArray(resData)) {
      return resData.map((m) => ({
        id: (m.id || m.userId || '').toString(),
        userId: (m.userId || m.id || '').toString(),
        name: m.name || m.fullName || 'Thành viên',
        email: m.email || '',
        role: m.role || 'Nhân viên',
        avatar: m.avatar,
        joinedAt: m.joinedAt || m.createdAt,
      }));
    }
    return [];
  },

  /**
   * PUT /api/departments/{departmentId}/members/{userId}
   * Thêm hoặc cập nhật thành viên vào phòng ban
   */
  async addDepartmentMember(departmentId: string, userId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}/members/${userId}`, {
      method: 'PUT',
    });
  },

  /**
   * DELETE /api/departments/{departmentId}/members/{userId}
   * Xóa thành viên khỏi phòng ban
   */
  async removeDepartmentMember(departmentId: string, userId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// 3. TANSTACK QUERY v5 KEYS & HOOKS
// ============================================================================
export const departmentsQueryKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...departmentsQueryKeys.lists(), params] as const,
  details: () => [...departmentsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentsQueryKeys.details(), id] as const,
  members: (id: string) => [...departmentsQueryKeys.detail(id), 'members'] as const,
};

/**
 * Hook Query: Lấy danh sách toàn bộ phòng ban
 */
export function useDepartmentsQuery(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: departmentsQueryKeys.list(params),
    queryFn: async () => {
      return await departmentsApi.getDepartments(params);
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
}

/**
 * Hook Query: Lấy chi tiết một phòng ban
 */
export function useDepartmentQuery(departmentId: string) {
  return useQuery({
    queryKey: departmentsQueryKeys.detail(departmentId),
    queryFn: async () => {
      return await departmentsApi.getDepartmentById(departmentId);
    },
    enabled: Boolean(departmentId),
  });
}

/**
 * Hook Query: Lấy danh sách thành viên của phòng ban
 */
export function useDepartmentMembersQuery(departmentId: string) {
  return useQuery({
    queryKey: departmentsQueryKeys.members(departmentId),
    queryFn: async () => {
      return await departmentsApi.getDepartmentMembers(departmentId);
    },
    enabled: Boolean(departmentId),
  });
}

/**
 * Hook Mutation: Tạo mới phòng ban
 */
export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentData): Promise<Department> => {
      return await departmentsApi.createDepartment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.all });
    },
  });
}

/**
 * Hook Mutation: Cập nhật phòng ban
 */
export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, data }: { departmentId: string; data: UpdateDepartmentData }): Promise<Department> => {
      return await departmentsApi.updateDepartment(departmentId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.detail(variables.departmentId) });
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Lưu trữ phòng ban
 */
export function useArchiveDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string): Promise<void> => {
      await departmentsApi.archiveDepartment(departmentId);
    },
    onSuccess: (_, departmentId) => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.detail(departmentId) });
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Thêm thành viên vào phòng ban
 */
export function useAddDepartmentMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, userId }: { departmentId: string; userId: string }): Promise<void> => {
      await departmentsApi.addDepartmentMember(departmentId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.members(variables.departmentId) });
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Xóa thành viên khỏi phòng ban
 */
export function useRemoveDepartmentMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, userId }: { departmentId: string; userId: string }): Promise<void> => {
      await departmentsApi.removeDepartmentMember(departmentId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.members(variables.departmentId) });
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.lists() });
    },
  });
}
