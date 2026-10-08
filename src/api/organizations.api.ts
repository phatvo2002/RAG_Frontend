import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiResponse } from '@/types';

export interface Organization {
  organizationId: string;
  slug: string;
  name: string;
  status: string;
  dataResidency: string | null;
}

export interface UpdateOrganizationData {
  name: string;
  dataResidency: string | null;
}

const currentOrganizationKey = ['organizations', 'current'] as const;

export const organizationsApi = {
  async getCurrent(): Promise<Organization> {
    const response = await apiClient<ApiResponse<Organization>>('/api/organizations/current');
    return response.data;
  },

  async update(organizationId: string, data: UpdateOrganizationData): Promise<Organization> {
    const response = await apiClient<ApiResponse<Organization>>(`/api/organizations/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

export function useCurrentOrganizationQuery(enabled = true) {
  return useQuery({
    queryKey: currentOrganizationKey,
    queryFn: organizationsApi.getCurrent,
    enabled,
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: UpdateOrganizationData }) =>
      organizationsApi.update(organizationId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentOrganizationKey }),
  });
}
