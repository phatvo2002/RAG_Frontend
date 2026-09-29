import { ApiResponse } from '@/types';
import { apiClient } from './client';

export interface RetrievedChunk {
  documentId: string;
  chunkId: string;
  fileName: string;
  excerpt: string;
  score: number;
  pageNo?: number | null;
  charStart?: number | null;
  charEnd?: number | null;
}

export interface RetrievalResponse {
  results: RetrievedChunk[];
  augmentedContext: string;
  promptVersion: string;
}

const unwrapData = <T>(response: T | ApiResponse<T>): T => {
  const value = response as ApiResponse<T>;
  return value && value.data !== undefined ? value.data as T : response as T;
};

export const ragApi = {
  async retrieve(query: string): Promise<RetrievalResponse> {
    const response = await apiClient<ApiResponse<RetrievalResponse> | RetrievalResponse>('/api/rag/retrieval', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const data = unwrapData(response);
    return {
      results: Array.isArray(data?.results) ? data.results : [],
      augmentedContext: typeof data?.augmentedContext === 'string' ? data.augmentedContext : '',
      promptVersion: typeof data?.promptVersion === 'string' ? data.promptVersion : 'rag-context-v1',
    };
  },
};
