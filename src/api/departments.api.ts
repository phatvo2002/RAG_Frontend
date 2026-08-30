import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Department, ApiResponse } from '@/types';

// ============================================================================
// 1. TYPES & DATA STRUCTURES (Payload matches Backend format)
// ============================================================================
export interface CreateDepartmentData {
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  managerUserId?: string | null;
  status?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface UpdateDepartmentData {
  departmentId?: string;
  name?: string;
  code?: string;
  parentDepartmentId?: string | null;
  managerUserId?: string | null;
  status?: string;
  phone?: string;
  address?: string;
  description?: string;
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
 * Normalizer: Chuyển đổi dữ liệu phòng ban từ Backend API sang Department chuẩn Frontend
 * Chuẩn payload Backend:
 * {
 *   "departmentId": "656811bc-683a-40ab-aa91-8fb327c7ffa9",
 *   "parentDepartmentId": null,
 *   "code": "CNTT",
 *   "name": "Phòng công nghệ thông tin",
 *   "managerUserId": "0b5d1100-9261-46a4-944e-381eca50e559",
 *   "status": "Active"
 * }
 */
export function normalizeDepartment(raw: any): Department {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      departmentId: '',
      name: '',
      code: '',
      parentDepartmentId: null,
      managerUserId: null,
      status: 'Active',
      memberCount: 0,
    };
  }

  const id = (raw.departmentId || raw.id || raw._id || '').toString();
  const departmentId = id;
  const parentDepartmentId = raw.parentDepartmentId !== undefined ? raw.parentDepartmentId : null;
  const code = raw.code || raw.departmentCode || '';
  const name = raw.name || raw.departmentName || raw.title || '';
  const managerUserId = raw.managerUserId !== undefined ? raw.managerUserId : null;
  const status = raw.status || 'Active';

  const parentDepartment = raw.parentDepartment || raw.parentDepartmentName || raw.parentName;
  const phone = raw.phone || raw.phoneNumber || raw.tel || '';
  const address = raw.address || raw.location || raw.office || '';
  const head = raw.head || raw.manager || raw.managerName || raw.lead || raw.leaderName || '';
  const manager = raw.manager || raw.head || raw.managerName || '';
  const managerName = raw.managerName || raw.head || raw.manager || '';
  const memberCount = typeof raw.memberCount === 'number'
    ? raw.memberCount
    : Array.isArray(raw.members)
    ? raw.members.length
    : 0;
  const description = raw.description || raw.desc || '';

  return {
    id,
    departmentId,
    parentDepartmentId,
    code,
    name,
    managerUserId,
    status,
    parentDepartment,
    head,
    manager,
    managerName,
    phone,
    address,
    memberCount,
    description,
  };
}

// ============================================================================
// 2. HTTP FETCH SERVICE (Direct Backend API)
// ============================================================================
export const departmentsApi = {
  /**
   * GET /api/departments
   * Lấy danh sách toàn bộ phòng ban từ Backend API
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

    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/departments${queryStr}`, {
      method: 'GET',
    });

    const rawList = (response as any)?.data || response;
    if (Array.isArray(rawList)) {
      return rawList.map(normalizeDepartment);
    }
    if (rawList && Array.isArray(rawList.items)) {
      return rawList.items.map(normalizeDepartment);
    }
    return [];
  },

  /**
   * POST /api/departments
   * Tạo mới phòng ban qua Backend API
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const payload: any = {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      parentDepartmentId: data.parentDepartmentId || null,
      managerUserId: data.managerUserId || null,
      status: data.status || 'Active',
    };

    if (data.phone) payload.phone = data.phone;
    if (data.address) payload.address = data.address;
    if (data.description) payload.description = data.description;

    const response = await apiClient<ApiResponse<any> | any>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const resData = (response as any)?.data || response;
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

    const resData = (response as any)?.data || response;
    return normalizeDepartment(resData);
  },

  /**
   * PUT /api/departments/{departmentId}
   * Cập nhật thông tin phòng ban qua Backend API
   */
  async updateDepartment(departmentId: string, data: UpdateDepartmentData): Promise<Department> {
    const payload: any = {
      departmentId: departmentId || data.departmentId,
      code: data.code?.trim().toUpperCase(),
      name: data.name?.trim(),
      parentDepartmentId: data.parentDepartmentId || null,
      managerUserId: data.managerUserId || null,
      status: data.status || 'Active',
    };

    if (data.phone) payload.phone = data.phone;
    if (data.address) payload.address = data.address;
    if (data.description) payload.description = data.description;

    let response: any;
    try {
      response = await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.status === 404 || err.status === 405) {
        response = await apiClient<ApiResponse<any> | any>('/api/departments', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        throw err;
      }
    }

    const resData = (response as any)?.data || response;
    return normalizeDepartment(resData);
  },

  /**
   * DELETE /api/departments/{departmentId}
   * Xóa / Vô hiệu hóa phòng ban qua Backend API
   */
  async archiveDepartment(departmentId: string): Promise<void> {
    try {
      await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });
    } catch {
      await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}/archive`, {
        method: 'POST',
      });
    }
  },

  /**
   * GET /api/departments/{departmentId}/members
   * Lấy danh sách thành viên trong phòng ban qua Backend API
   */
  async getDepartmentMembers(departmentId: string): Promise<DepartmentMember[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/departments/${departmentId}/members`, {
      method: 'GET',
    });

    const resData = (response as any)?.data || response;
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
   * Thêm hoặc cập nhật thành viên vào phòng ban qua Backend API
   */
  async addDepartmentMember(departmentId: string, userId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/departments/${departmentId}/members/${userId}`, {
      method: 'PUT',
    });
  },

  /**
   * DELETE /api/departments/{departmentId}/members/{userId}
   * Xóa thành viên khỏi phòng ban qua Backend API
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
 * Hook Query: Lấy danh sách toàn bộ phòng ban trực tiếp từ API
 */
export function useDepartmentsQuery(params?: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: departmentsQueryKeys.list(params),
    queryFn: async () => {
      return await departmentsApi.getDepartments(params);
    },
    staleTime: 1000 * 60 * 2, // Cache 2 phút
  });
}

/**
 * Hook Query: Lấy chi tiết một phòng ban trực tiếp từ API
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
 * Hook Query: Lấy danh sách thành viên của phòng ban trực tiếp từ API
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
 * Hook Mutation: Tạo mới phòng ban qua API
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
 * Hook Mutation: Cập nhật phòng ban qua API
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
 * Hook Mutation: Xóa / Lưu trữ phòng ban qua API
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
 * Hook Mutation: Thêm thành viên vào phòng ban qua API
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
 * Hook Mutation: Xóa thành viên khỏi phòng ban qua API
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
