import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, tokenStorage } from './client';
import { User, LoginCredentials, AuthTokens, ApiResponse, LoginResponseData } from '@/types';

// ============================================================================
// 1. DATA NORMALIZER
// ============================================================================
export function normalizeUser(data: any): User {
  if (!data) {
    throw new Error('Không có dữ liệu người dùng');
  }

  const userObj = data.data || data;
  const email = userObj.email || '';
  const fallbackName = email ? email.split('@')[0] : 'Người dùng';

  return {
    id: userObj.userId || userObj.id?.toString() || userObj._id?.toString() || `usr_${Date.now()}`,
    name: userObj.name || userObj.fullName || userObj.full_name || userObj.username || fallbackName,
    email: email,
    role: userObj.role || userObj.userRole || userObj.user_role || 'Quản trị viên',
    status: userObj.status || (userObj.isActive === false || userObj.is_active === false ? 'Bị khóa' : 'Đang hoạt động'),
    department: userObj.department || userObj.departmentName || userObj.department_name || 'Công nghệ thông tin',
    avatar: userObj.avatar || userObj.avatarUrl || userObj.avatar_url,
    phone: userObj.phone || userObj.phoneNumber || userObj.phone_number,
  };
}

// ============================================================================
// 2. RAW HTTP FETCH METHODS
// ============================================================================
export const authApi = {
  /**
   * Đăng nhập với email/username và mật khẩu
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const payload = {
      email: credentials.email,
      username: credentials.username || credentials.email,
      password: credentials.password,
    };

    const response = await apiClient<ApiResponse<LoginResponseData> | LoginResponseData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });

    const authData: any = (response as any).data || response;

    const tokens: AuthTokens = {
      accessToken: authData.accessToken || authData.access_token || authData.token,
      refreshToken: authData.refreshToken || authData.refresh_token,
      tokenType: authData.tokenType || authData.token_type || 'Bearer',
      accessTokenExpiresAt: authData.accessTokenExpiresAt || authData.access_token_expires_at,
      refreshTokenExpiresAt: authData.refreshTokenExpiresAt || authData.refresh_token_expires_at,
    };

    if (!tokens.accessToken) {
      throw new Error('Phản hồi từ máy chủ không chứa access token');
    }

    tokenStorage.setTokens(tokens);

    let user: User;
    if (authData.userId || authData.email || authData.user) {
      user = normalizeUser(authData.user || authData);
    } else {
      try {
        user = await this.getMe();
      } catch {
        user = normalizeUser(authData);
      }
    }

    return { user, tokens };
  },

  /**
   * Lấy thông tin người dùng hiện tại từ token đã lưu
   * GET /api/auth/me
   */
  async getMe(): Promise<User> {
    const response = await apiClient<ApiResponse<any> | any>('/api/auth/me', {
      method: 'GET',
    });

    const userData = (response as any).data || response;
    return normalizeUser(userData);
  },

  /**
   * Làm mới Access Token
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token');
    }

    const response = await apiClient<ApiResponse<any> | any>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshToken,
        refresh_token: refreshToken,
      }),
      skipAuth: true,
      skipAutoRefresh: true,
    });

    const data = (response as any).data || response;

    const tokens: AuthTokens = {
      accessToken: data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || refreshToken,
      tokenType: data.tokenType || data.token_type || 'Bearer',
      accessTokenExpiresAt: data.accessTokenExpiresAt || data.access_token_expires_at,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt || data.refresh_token_expires_at,
    };

    tokenStorage.setTokens(tokens);
    return tokens;
  },

  /**
   * Đăng xuất khỏi hệ thống
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      await apiClient<void>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: refreshToken,
          refresh_token: refreshToken,
        }),
      });
    } catch (err) {
      console.warn('Lỗi khi gọi API logout trên server:', err);
    } finally {
      tokenStorage.clearTokens();
    }
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccessToken());
  },
};

// ============================================================================
// 3. TANSTACK QUERY v5 KEYS & HOOKS (Sử dụng trực tiếp trong components)
// ============================================================================

export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'currentUser'] as const,
};

/**
 * TanStack Query Hook: Lấy thông tin người dùng hiện tại
 * Tự động caching và kiểm tra phiên đăng nhập
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: async (): Promise<User> => {
      return await authApi.getMe();
    },
    enabled: authApi.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    retry: 1,
  });
}

/**
 * TanStack Query Hook: Mutation Đăng nhập
 * Tự động ghi cache user và làm mới query keys
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
      return await authApi.login(credentials);
    },
    onSuccess: (data) => {
      // Cập nhật ngay lập tức user vào cache của TanStack Query
      queryClient.setQueryData(authQueryKeys.currentUser(), data.user);
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

/**
 * TanStack Query Hook: Mutation Đăng xuất
 * Tự động dọn sạch cache query và localStorage
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await authApi.logout();
    },
    onSuccess: () => {
      // Reset toàn bộ cache
      queryClient.clear();
    },
  });
}

/**
 * TanStack Query Hook: Mutation Làm mới Token
 */
export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (): Promise<AuthTokens> => {
      return await authApi.refreshToken();
    },
  });
}
