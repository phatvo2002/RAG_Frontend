import { apiClient } from './client';

export interface AccountProfile {
  email: string;
  userName: string;
  displayName: string;
  preferredLanguage: string;
  timeZone: string | null;
}

export interface ProviderKeyStatus {
  provider: string;
  endpointId: string;
  maskedSuffix: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export interface ProviderKeySettings {
  keys: ProviderKeyStatus[];
  claudeEndpoints: { id: string; name: string }[];
  configurationError?: string | null;
}

export const accountApi = {
  profile: () => apiClient<AccountProfile>('/api/account/profile'),
  updateProfile: (body: Pick<AccountProfile, 'displayName' | 'preferredLanguage' | 'timeZone'>) =>
    apiClient<AccountProfile>('/api/account/profile', { method: 'PUT', body: JSON.stringify(body) }),
  providerKeys: () => apiClient<ProviderKeySettings>('/api/account/provider-keys'),
  saveProviderKey: (provider: string, apiKey: string, endpointId: string) =>
    apiClient<ProviderKeyStatus>(`/api/account/provider-keys/${provider}`, {
      method: 'PUT', body: JSON.stringify({ apiKey, endpointId }),
    }),
  deleteProviderKey: (provider: string) =>
    apiClient<void>(`/api/account/provider-keys/${provider}`, { method: 'DELETE' }),
};
