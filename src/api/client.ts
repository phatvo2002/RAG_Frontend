import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE_URL } from '@/constants';
import { AuthTokens } from '@/types';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(tokens: any) {
    if (!tokens) return;
    const access = tokens.accessToken || tokens.access_token || tokens.token;
    const refresh = tokens.refreshToken || tokens.refresh_token;

    if (access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
    }
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipAutoRefresh?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getReadableErrorMessage(value: any): string | null {
  if (typeof value === 'string') {
    const message = value.trim();
    return message || null;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map(getReadableErrorMessage)
      .filter((message): message is string => Boolean(message));
    return messages.length ? messages.join(', ') : null;
  }

  if (!value || typeof value !== 'object') return null;

  for (const key of ['message', 'detail', 'title', 'description', 'details', 'errors']) {
    const message = getReadableErrorMessage(value[key]);
    if (message) return message;
  }

  return null;
}

function getErrorCodeMessage(value: any): string | null {
  const code = typeof value?.error?.code === 'string'
    ? value.error.code
    : typeof value?.code === 'string'
      ? value.code
      : null;

  switch (code) {
    case 'conflict':
      return 'Thao tác không thể hoàn tất do trạng thái hiện tại. Vui lòng thử lại sau.';
    case 'authorization.forbidden':
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 'authorization.unauthorized':
      return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
    case 'resource.not_found':
      return 'Không tìm thấy dữ liệu được yêu cầu.';
    case 'server.error':
      return 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.';
    default:
      return null;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    return null;
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        tokenStorage.clearTokens();
        return null;
      }

      const resJson = await response.json();
      const data = resJson.data || resJson;

      const newTokens: AuthTokens = {
        accessToken: data.accessToken || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token || refreshToken,
        tokenType: data.tokenType || data.token_type || 'Bearer',
      };

      tokenStorage.setTokens(newTokens);
      return newTokens.accessToken;
    } catch {
      tokenStorage.clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, skipAutoRefresh = false, headers, ...customConfig } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isFormDataBody = typeof FormData !== 'undefined' && customConfig.body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, {
    headers: requestHeaders,
    ...customConfig,
  });

  // Handle Token Expiry (401) with auto-refresh
  if (response.status === 401 && !skipAuth && !skipAutoRefresh && !endpoint.includes('/api/auth/login')) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      requestHeaders['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        headers: requestHeaders,
        ...customConfig,
      });
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let responseData: any = null;
  try {
    responseData = await response.json();
  } catch {
    // Body is not JSON
  }

  // Check HTTP Error status
  if (!response.ok) {
    const errorMessage = getReadableErrorMessage(responseData?.error?.details)
      ?? getReadableErrorMessage(responseData?.error)
      ?? getReadableErrorMessage(responseData)
      ?? getErrorCodeMessage(responseData)
      ?? `HTTP Error ${response.status}`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  // Check custom business logic envelope error (e.g. success: false with HTTP 200)
  if (responseData && typeof responseData === 'object' && responseData.success === false) {
    const errorMessage = responseData.message || 'Thao tác không thành công';
    throw new ApiError(errorMessage, responseData.statusCode || response.status, responseData);
  }

  return responseData as T;
}

