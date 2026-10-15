import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';

export type FolderAccessLevel = 'READ' | 'WRITE';

export interface FolderItem {
  id: string;
  departmentId: string;
  parentFolderId: string | null;
  name: string;
  ownerUserId: string;
  createdAt?: string;
  updatedAt?: string;
  documentCount?: number;
  totalSizeBytes?: number;
  indexedCount?: number;
  processingCount?: number;
  failedCount?: number;
  latestDocumentUpdatedAt?: string | null;
}

export interface FolderAccessGrant {
  id: string;
  folderId: string;
  departmentId: string | null;
  userId: string | null;
  accessLevel: FolderAccessLevel;
  validFrom: string;
  expiresAt: string | null;
}

export interface CreateFolderData {
  departmentId: string;
  name: string;
  parentFolderId: string | null;
}

export interface RenameFolderData {
  name: string;
}

export interface CreateAccessGrantData {
  departmentId: string | null;
  userId: string | null;
  accessLevel: FolderAccessLevel;
  expiresAt: string | null;
}

const unwrapData = <T>(response: T | ApiResponse<T>): T => {
  const value = response as ApiResponse<T>;
  return value && value.data !== undefined ? value.data as T : response as T;
};

export function normalizeFolder(raw: any): FolderItem {
  return {
    id: String(raw?.id || raw?.folderId || raw?._id || ''),
    departmentId: String(raw?.departmentId || ''),
    parentFolderId: raw?.parentFolderId || null,
    name: String(raw?.name || ''),
    ownerUserId: String(raw?.ownerUserId || raw?.ownerId || ''),
    createdAt: raw?.createdAt || undefined,
    updatedAt: raw?.updatedAt || undefined,
    documentCount: Number(raw?.documentCount || 0),
    totalSizeBytes: Number(raw?.totalSizeBytes || 0),
    indexedCount: Number(raw?.indexedCount || 0),
    processingCount: Number(raw?.processingCount || 0),
    failedCount: Number(raw?.failedCount || 0),
    latestDocumentUpdatedAt: raw?.latestDocumentUpdatedAt || null,
  };
}

export function normalizeFolderAccessGrant(raw: any): FolderAccessGrant {
  return {
    id: String(raw?.id || raw?.grantId || raw?._id || ''),
    folderId: String(raw?.folderId || ''),
    departmentId: raw?.departmentId || null,
    userId: raw?.userId || null,
    accessLevel: raw?.accessLevel === 'WRITE' ? 'WRITE' : 'READ',
    validFrom: raw?.validFrom || '',
    expiresAt: raw?.expiresAt || null,
  };
}

export const documentFoldersApi = {
  async getFolders(departmentId?: string): Promise<FolderItem[]> {
    const query = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
    const response = await apiClient<ApiResponse<any[]> | any[]>(`/api/document-folders${query}`);
    const data = unwrapData(response);
    return Array.isArray(data) ? data.map(normalizeFolder) : [];
  },

  async getFolderById(folderId: string): Promise<FolderItem> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/document-folders/${encodeURIComponent(folderId)}`);
    return normalizeFolder(unwrapData(response));
  },

  async createFolder(data: CreateFolderData): Promise<FolderItem> {
    const response = await apiClient<ApiResponse<any> | any>('/api/document-folders', {
      method: 'POST',
      body: JSON.stringify({
        departmentId: data.departmentId,
        name: data.name.trim(),
        parentFolderId: data.parentFolderId || null,
      }),
    });
    return normalizeFolder(unwrapData(response));
  },

  async renameFolder(folderId: string, data: RenameFolderData): Promise<FolderItem> {
    const response = await apiClient<ApiResponse<any> | any>(`/api/document-folders/${encodeURIComponent(folderId)}`, {
      method: 'PUT',
      body: JSON.stringify({ name: data.name.trim() }),
    });
    return normalizeFolder(unwrapData(response));
  },

  async deleteFolder(folderId: string): Promise<void> {
    await apiClient<ApiResponse<unknown> | unknown>(`/api/document-folders/${encodeURIComponent(folderId)}`, {
      method: 'DELETE',
    });
  },

  async getAccessGrants(folderId: string): Promise<FolderAccessGrant[]> {
    const response = await apiClient<ApiResponse<any[]> | any[]>(
      `/api/document-folders/${encodeURIComponent(folderId)}/access-grants`
    );
    const data = unwrapData(response);
    return Array.isArray(data) ? data.map(normalizeFolderAccessGrant) : [];
  },

  async createAccessGrant(folderId: string, data: CreateAccessGrantData): Promise<FolderAccessGrant> {
    const hasDepartment = Boolean(data.departmentId);
    const hasUser = Boolean(data.userId);
    if (hasDepartment === hasUser) {
      throw new Error('Chỉ được cấp quyền cho một phòng ban hoặc một người dùng.');
    }

    const response = await apiClient<ApiResponse<any> | any>(
      `/api/document-folders/${encodeURIComponent(folderId)}/access-grants`,
      {
        method: 'POST',
        body: JSON.stringify({
          departmentId: data.departmentId || null,
          userId: data.userId || null,
          accessLevel: data.accessLevel,
          expiresAt: data.expiresAt || null,
        }),
      }
    );
    return normalizeFolderAccessGrant(unwrapData(response));
  },

  async deleteAccessGrant(folderId: string, grantId: string): Promise<void> {
    await apiClient<ApiResponse<unknown> | unknown>(
      `/api/document-folders/${encodeURIComponent(folderId)}/access-grants/${encodeURIComponent(grantId)}`,
      { method: 'DELETE' }
    );
  },
};

export const documentFoldersQueryKeys = {
  all: ['document-folders'] as const,
  lists: () => [...documentFoldersQueryKeys.all, 'list'] as const,
  list: (departmentId?: string) => [...documentFoldersQueryKeys.lists(), departmentId || 'all'] as const,
  details: () => [...documentFoldersQueryKeys.all, 'detail'] as const,
  detail: (folderId: string) => [...documentFoldersQueryKeys.details(), folderId] as const,
  grants: (folderId: string) => [...documentFoldersQueryKeys.detail(folderId), 'access-grants'] as const,
};

export function useDocumentFoldersQuery(departmentId?: string) {
  return useQuery({
    queryKey: documentFoldersQueryKeys.list(departmentId),
    queryFn: () => documentFoldersApi.getFolders(departmentId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDocumentFolderQuery(folderId: string, enabled = true) {
  return useQuery({
    queryKey: documentFoldersQueryKeys.detail(folderId),
    queryFn: () => documentFoldersApi.getFolderById(folderId),
    enabled: Boolean(folderId) && enabled,
  });
}

export function useFolderAccessGrantsQuery(folderId: string, enabled = true) {
  return useQuery({
    queryKey: documentFoldersQueryKeys.grants(folderId),
    queryFn: () => documentFoldersApi.getAccessGrants(folderId),
    enabled: Boolean(folderId) && enabled,
    staleTime: 1000 * 30,
  });
}

export function useCreateDocumentFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFolderData) => documentFoldersApi.createFolder(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.lists() }),
  });
}

export function useRenameDocumentFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, data }: { folderId: string; data: RenameFolderData }) =>
      documentFoldersApi.renameFolder(folderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.detail(variables.folderId) });
    },
  });
}

export function useDeleteDocumentFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => documentFoldersApi.deleteFolder(folderId),
    onSuccess: (_, folderId) => {
      queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: documentFoldersQueryKeys.detail(folderId) });
    },
  });
}

export function useCreateFolderAccessGrantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, data }: { folderId: string; data: CreateAccessGrantData }) =>
      documentFoldersApi.createAccessGrant(folderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.grants(variables.folderId) });
    },
  });
}

export function useDeleteFolderAccessGrantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, grantId }: { folderId: string; grantId: string }) =>
      documentFoldersApi.deleteAccessGrant(folderId, grantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentFoldersQueryKeys.grants(variables.folderId) });
    },
  });
}
