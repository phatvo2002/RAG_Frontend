import { apiClient } from './client';
import { ApiResponse } from '@/types';

export type PromptType = 'CHAT' | 'MEETING_TRANSLATION';
export interface PromptVersion {
  id: string;
  versionNo: number;
  instructions: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdByUserId: string | null;
  createdAt: string;
  publishedByUserId: string | null;
  publishedAt: string | null;
}
export interface SystemPrompt {
  id: string;
  promptType: PromptType;
  rowVersion: number;
  activeVersion: PromptVersion;
  draft: PromptVersion | null;
}

const unwrap = <T,>(response: ApiResponse<T>) => response.data;
export const systemPromptsApi = {
  async list() { return unwrap(await apiClient<ApiResponse<SystemPrompt[]>>('/api/system-prompts')); },
  async versions(type: PromptType) { return unwrap(await apiClient<ApiResponse<PromptVersion[]>>(`/api/system-prompts/${type}/versions`)); },
  async saveDraft(type: PromptType, instructions: string) {
    return unwrap(await apiClient<ApiResponse<PromptVersion>>(`/api/system-prompts/${type}/draft`, { method: 'PUT', body: JSON.stringify({ instructions }) }));
  },
  async preview(type: PromptType, question: string, instructions: string) {
    return unwrap(await apiClient<ApiResponse<{ promptType: PromptType; answer: string }>>(`/api/system-prompts/${type}/preview`, { method: 'POST', body: JSON.stringify({ question, instructions }) }));
  },
  async publish(type: PromptType) {
    return unwrap(await apiClient<ApiResponse<PromptVersion>>(`/api/system-prompts/${type}/publish`, { method: 'POST' }));
  },
  async restore(type: PromptType, versionId: string) {
    return unwrap(await apiClient<ApiResponse<PromptVersion>>(`/api/system-prompts/${type}/versions/${versionId}/restore`, { method: 'POST' }));
  },
};
