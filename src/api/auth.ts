import { get, post, put } from './http';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'barber' | 'client';
  tenantId?: string;
  tenantStatus?: 'pending' | 'approved' | 'suspended' | 'cancelled';
  clientProfileId?: string;
  barberProfileId?: string;
  avatar: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

interface LoginRequest {
  email: string;
  password: string;
  userType?: 'super_admin' | 'admin' | 'barber' | 'client' | 'barbershop';
}

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  permissions?: string[];
  dashboardSections?: string[];
  error?: string;
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions: string[];
  dashboardSections: string[];
  createdAt: string;
  expiresAt: string;
}

type ApiUser = Omit<User, 'avatar' | 'lastLogin' | 'role' | 'tenantStatus'> & {
  role: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  tenantStatus?: string | null;
  clientProfileId?: string | null;
  barberProfileId?: string | null;
};
type AuthResponse = {
  success: boolean;
  user?: ApiUser;
  accessToken?: string;
  refreshToken?: string;
  permissions?: string[];
  error?: string;
};

const sectionsByRole: Record<string, string[]> = {
  super_admin: ['overview', 'barbershops', 'users', 'billing'],
  admin: ['overview', 'appointments', 'barbers', 'clients', 'services', 'settings'],
  barber: ['overview', 'appointments', 'clients'],
  client: ['overview', 'appointments'],
};

function mapUser(user: ApiUser): User {
  const status = user.tenantStatus?.toLowerCase();
  const tenantStatus =
    status === 'pending' || status === 'approved' || status === 'suspended' || status === 'cancelled'
      ? status
      : undefined;

  return {
    ...user,
    role: user.role as User['role'],
    tenantStatus,
    clientProfileId: user.clientProfileId ?? undefined,
    barberProfileId: user.barberProfileId ?? undefined,
    avatar: user.avatarUrl ?? '',
    phone: user.phone ?? '',
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? new Date().toISOString(),
    lastLogin: user.lastLoginAt ?? new Date().toISOString(),
  };
}

function persistRefreshToken(token?: string): void {
  if (!token || typeof window === 'undefined') return;
  try { localStorage.setItem('refreshToken', token); } catch { /* best-effort */ }
}

function removeRefreshToken(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem('refreshToken'); } catch { /* best-effort */ }
}

function toLoginResponse(result: AuthResponse): LoginResponse {
  if (!result.success || !result.user || !result.accessToken) {
    return { success: false, error: result.error || 'Não foi possível autenticar.' };
  }
  persistRefreshToken(result.refreshToken);
  const user = mapUser(result.user);
  return {
    success: true,
    user,
    token: result.accessToken,
    permissions: result.permissions ?? [],
    dashboardSections: sectionsByRole[user.role] ?? [],
  };
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      return toLoginResponse(await post<AuthResponse>('/auth/login', credentials, { skipAuth: true }));
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível autenticar.' };
    }
  },

  async logout(token: string): Promise<{ success: boolean }> {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      await post<void>('/auth/logout', { refreshToken }, { token });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      removeRefreshToken();
    }
  },

  async validateSession(token: string): Promise<{ valid: boolean; user?: User; sessionData?: SessionData }> {
    try {
      const me = await get<{ user: ApiUser; permissions?: string[] }>('/auth/me', { token });
      const user = mapUser(me.user);
      return {
        valid: true,
        user,
        sessionData: {
          userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId,
          permissions: me.permissions ?? [], dashboardSections: sectionsByRole[user.role] ?? [],
          createdAt: user.createdAt, expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      };
    } catch {
      return { valid: false };
    }
  },

  async registerBarbershop(data: Record<string, unknown>): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/register/barbershop', data, { skipAuth: true });
  },

  async registerClient(data: Record<string, unknown>): Promise<AuthResponse> {
    return post<AuthResponse>('/auth/register/client', data, { skipAuth: true });
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    return toLoginResponse(await post<AuthResponse>('/auth/refresh', { refreshToken }, { skipAuth: true }));
  },

  async updateMyProfile(data: { name: string; phone: string; email?: string }): Promise<User> {
    const me = await put<{ user: ApiUser }>('/auth/me', data);
    return mapUser(me.user);
  },
};

export default authAPI;
