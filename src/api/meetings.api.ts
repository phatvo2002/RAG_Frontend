import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export type MeetingStatus = 'Scheduled' | 'Live' | 'Ending' | 'Ended';

export interface OnlineMeeting {
  id: string;
  title: string;
  status: MeetingStatus;
  organizerUserId: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
}

export interface MeetingUserOption {
  id: string;
  displayName: string;
  email: string;
}

export interface MeetingDetail extends OnlineMeeting {
  rowVersion: number;
  participants: MeetingUserOption[];
}

export interface CreateOnlineMeeting {
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  participantUserIds: string[];
}

export interface UpdateOnlineMeeting extends CreateOnlineMeeting {
  expectedRowVersion: number;
}

export interface EligibleMeetingUsers {
  items: MeetingUserOption[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MeetingJoinToken {
  url: string;
  token: string;
}

function data<T>(response: ApiResponse<T> | T): T {
  return (response as ApiResponse<T>).data ?? response as T;
}

export const meetingsApi = {
  async list(): Promise<OnlineMeeting[]> {
    return data(await apiClient<ApiResponse<OnlineMeeting[]> | OnlineMeeting[]>('/api/meetings'));
  },
  async get(id: string): Promise<MeetingDetail> {
    return data(await apiClient<ApiResponse<MeetingDetail> | MeetingDetail>(`/api/meetings/${encodeURIComponent(id)}`));
  },
  async create(payload: CreateOnlineMeeting): Promise<OnlineMeeting> {
    return data(await apiClient<ApiResponse<OnlineMeeting> | OnlineMeeting>('/api/meetings', {
      method: 'POST', body: JSON.stringify(payload),
    }));
  },
  async update(id: string, payload: UpdateOnlineMeeting): Promise<MeetingDetail> {
    return data(await apiClient<ApiResponse<MeetingDetail> | MeetingDetail>(`/api/meetings/${encodeURIComponent(id)}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }));
  },
  async eligibleParticipants(search: string, page: number): Promise<EligibleMeetingUsers> {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (search.trim()) params.set('search', search.trim());
    return data(await apiClient<ApiResponse<EligibleMeetingUsers> | EligibleMeetingUsers>(
      `/api/meetings/eligible-participants?${params}`));
  },
  async start(id: string): Promise<OnlineMeeting> {
    return data(await apiClient<ApiResponse<OnlineMeeting> | OnlineMeeting>(`/api/meetings/${encodeURIComponent(id)}/start`, { method: 'POST' }));
  },
  async end(id: string): Promise<OnlineMeeting> {
    return data(await apiClient<ApiResponse<OnlineMeeting> | OnlineMeeting>(`/api/meetings/${encodeURIComponent(id)}/end`, { method: 'POST' }));
  },
  async join(id: string): Promise<MeetingJoinToken> {
    return data(await apiClient<ApiResponse<MeetingJoinToken> | MeetingJoinToken>(`/api/meetings/${encodeURIComponent(id)}/join-token`, { method: 'POST' }));
  },
};

export const meetingKeys = {
  list: ['meetings'] as const,
  detail: (id: string) => ['meetings', id] as const,
};

export function useMeetingsQuery() {
  return useQuery({ queryKey: meetingKeys.list, queryFn: meetingsApi.list, refetchInterval: 5000 });
}

export function useMeetingQuery(id: string) {
  return useQuery({ queryKey: meetingKeys.detail(id), queryFn: () => meetingsApi.get(id), refetchInterval: 3000 });
}
