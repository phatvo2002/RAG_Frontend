import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types';
import { apiClient } from './client';

export interface DocumentUploadResponse {
  documentId: string;
  versionId: string;
  processingStatus: string;
}

export interface DocumentListItem {
  documentId: string;
  folderId: string;
  folderName: string;
  departmentId?: string | null;
  title: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  documentStatus: string;
  processingStatus: string;
  failureCode?: string | null;
  createdAt: string;
  updatedAt: string;
  readyAt?: string | null;
}

export interface DocumentListParams {
  folderId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  fileType?: string;
  processingStatus?: string;
  departmentId?: string;
}

export interface PagedDocumentResult {
  items: DocumentListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const unwrapData = <T>(response: T | ApiResponse<T>): T => {
  const value = response as ApiResponse<T>;
  return value && value.data !== undefined ? value.data as T : response as T;
};

export const documentsApi = {
  async getDocuments(params: DocumentListParams): Promise<PagedDocumentResult> {
    const query = new URLSearchParams({
      folderId: params.folderId,
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 25),
    });

    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.fileType && params.fileType !== 'all') query.set('fileType', params.fileType);
    if (params.processingStatus && params.processingStatus !== 'all') query.set('processingStatus', params.processingStatus);
    if (params.departmentId && params.departmentId !== 'all') query.set('departmentId', params.departmentId);

    const response = await apiClient<ApiResponse<PagedDocumentResult> | PagedDocumentResult>(`/api/documents?${query.toString()}`, {
      method: 'GET',
    });
    const data = unwrapData(response) as PagedDocumentResult;
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      page: data?.page ?? params.page ?? 1,
      pageSize: data?.pageSize ?? params.pageSize ?? 25,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 0,
    };
  },

  async upload(folderId: string, file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('file', file);

    const response = await apiClient<ApiResponse<DocumentUploadResponse> | DocumentUploadResponse>('/api/documents', {
      method: 'POST',
      body: formData,
    });

    return unwrapData(response);
  },
};

export const documentsQueryKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsQueryKeys.all, 'list'] as const,
  list: (params: DocumentListParams) => [...documentsQueryKeys.lists(), params] as const,
};

export function useDocumentsQuery(params: DocumentListParams, enabled = true) {
  return useQuery({
    queryKey: documentsQueryKeys.list(params),
    queryFn: () => documentsApi.getDocuments(params),
    enabled: enabled && Boolean(params.folderId),
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, file }: { folderId: string; file: File }) =>
      documentsApi.upload(folderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsQueryKeys.lists() });
    },
  });
}
