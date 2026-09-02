import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';

// ============================================================================
// 1. TYPES & DATA STRUCTURES (Payload matches Backend format)
// ============================================================================
export interface ApiFunctionItem {
  apiFunctionId: string;
  code: string;
  module: string;
  name: string;
  description?: string | null;
  httpMethod: string;
  routeTemplate: string;
  actionType: string;
  riskLevel: string;
  requiresConfirmation?: boolean;
  status: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApiFunctionData {
  code: string;
  module: string;
  name: string;
  description?: string | null;
  httpMethod: string;
  routeTemplate: string;
  actionType?: string;
  riskLevel?: string;
  requiresConfirmation?: boolean;
  status?: string;
}

export interface UpdateApiFunctionData {
  apiFunctionId?: string;
  code?: string;
  module?: string;
  name?: string;
  description?: string | null;
  httpMethod?: string;
  routeTemplate?: string;
  actionType?: string;
  riskLevel?: string;
  requiresConfirmation?: boolean;
  status?: string;
}

export interface ApiFunctionFilterParams {
  search?: string;
  module?: string;
  status?: string;
  httpMethod?: string;
  actionType?: string;
  riskLevel?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Normalizer: Chuyển đổi dữ liệu ApiFunction từ Backend API sang format đồng bộ
 */
export function normalizeApiFunction(raw: any): ApiFunctionItem {
  if (!raw || typeof raw !== 'object') {
    return {
      apiFunctionId: '',
      code: '',
      module: 'Hệ thống',
      name: '',
      description: null,
      httpMethod: 'GET',
      routeTemplate: '',
      actionType: 'Read',
      riskLevel: 'Low',
      requiresConfirmation: false,
      status: 'Active',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const apiFunctionId = (raw.apiFunctionId || raw.id || raw._id || '').toString();
  const code = raw.code || '';
  const module = raw.module || 'Hệ thống';
  const name = raw.name || code || '';
  const description = raw.description !== undefined ? raw.description : null;
  const httpMethod = raw.httpMethod || raw.method || 'GET';
  const routeTemplate = raw.routeTemplate || raw.route || raw.path || '';
  const actionType = raw.actionType || 'Read';
  const riskLevel = raw.riskLevel || 'Low';
  const requiresConfirmation = Boolean(raw.requiresConfirmation);
  const status = raw.status || 'Active';
  const version = typeof raw.version === 'number' ? raw.version : 1;
  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = raw.updatedAt || raw.createdAt || new Date().toISOString();

  return {
    apiFunctionId,
    code,
    module,
    name,
    description,
    httpMethod,
    routeTemplate,
    actionType,
    riskLevel,
    requiresConfirmation,
    status,
    version,
    createdAt,
    updatedAt,
  };
}

// ============================================================================
// 2. API SERVICE METHODS
// ============================================================================
export const apiFunctionsApi = {
  /**
   * GET /api/api-functions
   * Lấy danh sách tất cả các chức năng / API endpoint trong hệ thống
   */
  async getApiFunctions(params?: ApiFunctionFilterParams): Promise<ApiFunctionItem[]> {
    const fetchPage = async (pageNum: number) => {
      const pSize = params?.pageSize ?? 999;
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.module) query.append('module', params.module);
      if (params?.status) query.append('status', params.status);
      if (params?.httpMethod) query.append('httpMethod', params.httpMethod);
      if (params?.actionType) query.append('actionType', params.actionType);
      if (params?.riskLevel) query.append('riskLevel', params.riskLevel);

      // Gửi đa dạng tham số phân trang để tương thích backend
      query.append('page', pageNum.toString());
      query.append('pageNumber', pageNum.toString());
      query.append('PageNumber', pageNum.toString());
      query.append('pageSize', pSize.toString());
      query.append('PageSize', pSize.toString());
      query.append('limit', pSize.toString());
      query.append('take', pSize.toString());
      query.append('size', pSize.toString());

      const endpoint = `/api/api-functions?${query.toString()}`;
      const response = await apiClient<ApiResponse<any[]> | any[]>(endpoint, {
        method: 'GET',
      });

      const resData = (response as any).data || response;
      let pageItems: any[] = [];
      let totalPages = 1;
      let totalCount = 0;

      if (Array.isArray(resData)) {
        pageItems = resData;
      } else if (resData && typeof resData === 'object') {
        if (Array.isArray(resData.items)) pageItems = resData.items;
        else if (Array.isArray(resData.data)) pageItems = resData.data;
        else if (Array.isArray(resData.results)) pageItems = resData.results;
        else {
          const foundArray = Object.values(resData).find((v) => Array.isArray(v));
          if (foundArray && Array.isArray(foundArray)) {
            pageItems = foundArray;
          }
        }

        totalPages = resData.totalPages || resData.total_pages || resData.pageCount || 1;
        totalCount = resData.totalCount || resData.total || resData.totalRecords || 0;
      }

      return {
        items: pageItems.map(normalizeApiFunction),
        totalPages,
        totalCount,
        count: pageItems.length,
      };
    };

    // Tải trang 1
    const firstPage = await fetchPage(1);
    let allItems = [...firstPage.items];

    // Nếu có tổng số trang > 1, tải tiếp các trang còn lại
    if (firstPage.totalPages > 1) {
      const remainingPages = [];
      for (let p = 2; p <= firstPage.totalPages; p++) {
        remainingPages.push(fetchPage(p));
      }
      const results = await Promise.all(remainingPages);
      results.forEach((r) => {
        allItems.push(...r.items);
      });
    } else if (firstPage.items.length >= 20 && (!firstPage.totalCount || firstPage.totalCount > firstPage.items.length)) {
      // Trường hợp backend mặc định giới hạn 20 bản ghi/trang mà không trả về totalPages
      for (let p = 2; p <= 10; p++) {
        const next = await fetchPage(p);
        if (!next.items.length) break;
        allItems.push(...next.items);
        if (firstPage.totalCount && allItems.length >= firstPage.totalCount) break;
        if (next.items.length < 20) break;
      }
    }

    // Khử trùng lặp theo apiFunctionId / code
    const dedupeMap = new Map<string, ApiFunctionItem>();
    allItems.forEach((fn) => {
      const key = fn.apiFunctionId || fn.code;
      if (key && !dedupeMap.has(key)) {
        dedupeMap.set(key, fn);
      }
    });

    return Array.from(dedupeMap.values());
  },

  /**
   * GET /api/api-functions/{apiFunctionId}
   * Lấy chi tiết một chức năng / API endpoint
   */
  async getApiFunctionById(apiFunctionId: string): Promise<ApiFunctionItem> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/api-functions/${apiFunctionId}`, {
      method: 'GET',
    });

    const resData = (response as any).data || response;
    return normalizeApiFunction(resData);
  },

  /**
   * POST /api/api-functions
   * Tạo mới một chức năng / API endpoint
   */
  async createApiFunction(data: CreateApiFunctionData): Promise<ApiFunctionItem> {
    const payload = {
      code: data.code,
      module: data.module,
      name: data.name,
      description: data.description || null,
      httpMethod: data.httpMethod,
      routeTemplate: data.routeTemplate,
      actionType: data.actionType || 'Write',
      riskLevel: data.riskLevel || 'Medium',
      requiresConfirmation: Boolean(data.requiresConfirmation),
      status: data.status || 'Active',
    };

    const response = await apiClient<ApiResponse<any> | any>('/api/api-functions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeApiFunction(resData);
  },

  /**
   * PUT /api/api-functions/{apiFunctionId}
   * Cập nhật thông tin chức năng / API endpoint
   */
  async updateApiFunction(apiFunctionId: string, data: UpdateApiFunctionData): Promise<ApiFunctionItem> {
    const payload = {
      apiFunctionId,
      code: data.code,
      module: data.module,
      name: data.name,
      description: data.description !== undefined ? data.description : null,
      httpMethod: data.httpMethod,
      routeTemplate: data.routeTemplate,
      actionType: data.actionType,
      riskLevel: data.riskLevel,
      requiresConfirmation: data.requiresConfirmation,
      status: data.status,
    };

    const response = await apiClient<ApiResponse<any> | any>(`/api/api-functions/${apiFunctionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const resData = (response as any).data || response;
    return normalizeApiFunction(resData);
  },

  /**
   * POST /api/api-functions/{apiFunctionId}/deactivate
   * Vô hiệu hóa chức năng / API endpoint
   */
  async deactivateApiFunction(apiFunctionId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/api-functions/${apiFunctionId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/api-functions/{apiFunctionId}/reactivate
   * Kích hoạt lại chức năng / API endpoint
   */
  async reactivateApiFunction(apiFunctionId: string): Promise<void> {
    await apiClient<ApiResponse<any> | any>(`/api/api-functions/${apiFunctionId}/reactivate`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// 3. TANSTACK QUERY v5 KEYS & HOOKS
// ============================================================================
export const apiFunctionsQueryKeys = {
  all: ['api-functions'] as const,
  lists: () => [...apiFunctionsQueryKeys.all, 'list'] as const,
  list: (params?: any) => [...apiFunctionsQueryKeys.lists(), params] as const,
  details: () => [...apiFunctionsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiFunctionsQueryKeys.details(), id] as const,
  modules: () => [...apiFunctionsQueryKeys.all, 'modules'] as const,
};

/**
 * Hook Query: Lấy danh sách toàn bộ API Functions
 */
export function useApiFunctionsQuery(params?: ApiFunctionFilterParams) {
  return useQuery({
    queryKey: apiFunctionsQueryKeys.list(params),
    queryFn: async () => {
      return await apiFunctionsApi.getApiFunctions(params);
    },
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
}

/**
 * Hook Query: Lấy chi tiết 1 API Function theo ID
 */
export function useApiFunctionQuery(apiFunctionId: string) {
  return useQuery({
    queryKey: apiFunctionsQueryKeys.detail(apiFunctionId),
    queryFn: async () => {
      return await apiFunctionsApi.getApiFunctionById(apiFunctionId);
    },
    enabled: Boolean(apiFunctionId),
  });
}

/**
 * Hook Mutation: Tạo mới API Function
 */
export function useCreateApiFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApiFunctionData): Promise<ApiFunctionItem> => {
      return await apiFunctionsApi.createApiFunction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.all });
    },
  });
}

/**
 * Hook Mutation: Cập nhật API Function
 */
export function useUpdateApiFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      apiFunctionId,
      data,
    }: {
      apiFunctionId: string;
      data: UpdateApiFunctionData;
    }): Promise<ApiFunctionItem> => {
      return await apiFunctionsApi.updateApiFunction(apiFunctionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.detail(variables.apiFunctionId) });
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Vô hiệu hóa API Function
 */
export function useDeactivateApiFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiFunctionId: string): Promise<void> => {
      await apiFunctionsApi.deactivateApiFunction(apiFunctionId);
    },
    onSuccess: (_, apiFunctionId) => {
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.detail(apiFunctionId) });
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.lists() });
    },
  });
}

/**
 * Hook Mutation: Kích hoạt lại API Function
 */
export function useReactivateApiFunctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiFunctionId: string): Promise<void> => {
      await apiFunctionsApi.reactivateApiFunction(apiFunctionId);
    },
    onSuccess: (_, apiFunctionId) => {
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.detail(apiFunctionId) });
      queryClient.invalidateQueries({ queryKey: apiFunctionsQueryKeys.lists() });
    },
  });
}

