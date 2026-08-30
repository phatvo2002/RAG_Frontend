import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';

// ============================================================================
// 1. TYPES & DATA STRUCTURES
// ============================================================================
export interface ActivityLogMetadata {
  statusCode?: number;
  elapsedMilliseconds?: number;
  routeTemplate?: string;
  userAgent?: string;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  [key: string]: any;
}

export interface ActivityLogItem {
  id: string;
  actorUserId?: string | null;
  actorName?: string;
  actorEmail?: string;
  apiFunctionId?: string | null;
  apiFunctionName?: string;
  module: string;
  action: string;
  resourceType: string;
  result: 'SUCCESS' | 'FAILED' | 'WARNING' | string;
  description: string;
  ip: string;
  metadataJson?: ActivityLogMetadata | string | null;
  parsedMetadata?: ActivityLogMetadata;
  occurredAt: string;
  createdAt?: string;
}

export interface GetActivityLogsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  module?: string;
  result?: string;
  action?: string;
}

// ============================================================================
// 2. DATA NORMALIZER
// ============================================================================
export function normalizeActivityLog(data: any): ActivityLogItem {
  if (!data) {
    throw new Error('Dữ liệu log không hợp lệ');
  }

  const raw = data.data || data;
  const id = raw.id || raw.logId || raw._id || `log_${Date.now()}_${Math.random()}`;

  let parsedMetadata: ActivityLogMetadata = {};
  if (typeof raw.metadataJson === 'string') {
    try {
      parsedMetadata = JSON.parse(raw.metadataJson);
    } catch {
      parsedMetadata = {};
    }
  } else if (typeof raw.metadataJson === 'object' && raw.metadataJson) {
    parsedMetadata = raw.metadataJson;
  }

  return {
    id: String(id),
    actorUserId: raw.actorUserId || raw.userId || null,
    actorName: raw.actorName || raw.userName || raw.actor || undefined,
    actorEmail: raw.actorEmail || raw.email || undefined,
    apiFunctionId: raw.apiFunctionId || null,
    apiFunctionName: raw.apiFunctionName || undefined,
    module: raw.module || 'HTTP',
    action: raw.action || 'GET',
    resourceType: raw.resourceType || 'Request',
    result: (raw.result || 'SUCCESS').toUpperCase(),
    description: raw.description || raw.routeTemplate || raw.path || '',
    ip: raw.ip || raw.ipAddress || '127.0.0.1',
    metadataJson: raw.metadataJson,
    parsedMetadata,
    occurredAt: raw.occurredAt || raw.createdAt || raw.timestamp || new Date().toISOString(),
    createdAt: raw.createdAt || raw.occurredAt,
  };
}

// ============================================================================
// 3. API METHODS
// ============================================================================
export const activityLogsApi = {
  /**
   * Lấy danh sách nhật ký hoạt động hệ thống
   * GET /api/activity-logs
   */
  getLogs: async (params?: GetActivityLogsParams): Promise<ActivityLogItem[]> => {
    try {
      const paramsObj = new URLSearchParams();
      if (params?.page) paramsObj.append('page', String(params.page));
      if (params?.pageSize) paramsObj.append('pageSize', String(params.pageSize));
      if (params?.search) paramsObj.append('search', params.search);
      if (params?.module && params.module !== 'all') paramsObj.append('module', params.module);
      if (params?.result && params.result !== 'all') paramsObj.append('result', params.result);

      const queryString = paramsObj.toString() ? `?${paramsObj.toString()}` : '';
      const response = await apiClient<ApiResponse<ActivityLogItem[]> | ActivityLogItem[]>(
        `/api/activity-logs${queryString}`
      );

      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray((response as any)?.items)
        ? (response as any).items
        : [];

      return list.map(normalizeActivityLog);
    } catch {
      return [];
    }
  },

  /**
   * Lấy chi tiết nhật ký theo ID
   * GET /api/activity-logs/{id}
   */
  getLogById: async (id: string): Promise<ActivityLogItem> => {
    const response = await apiClient<ApiResponse<ActivityLogItem>>(`/api/activity-logs/${id}`);
    return normalizeActivityLog(response);
  },
};

// ============================================================================
// 4. REACT QUERY HOOKS
// ============================================================================
export function useActivityLogsQuery(params?: GetActivityLogsParams) {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => activityLogsApi.getLogs(params),
    staleTime: 1000 * 30, // 30s
    refetchInterval: 1000 * 60, // Tự động làm mới mỗi 1 phút
  });
}

export function useActivityLogDetailQuery(id?: string) {
  return useQuery({
    queryKey: ['activityLogDetail', id],
    queryFn: () => activityLogsApi.getLogById(id!),
    enabled: Boolean(id),
  });
}

