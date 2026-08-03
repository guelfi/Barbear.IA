import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, RegisterData } from '../types';
import { authAPI } from '../api';
import sessionStore from '../api/sessionStore';
import type { SessionState } from '../api/sessionStore';

interface AuthContextType {
  user: User | null;
  /** Bootstrap da sessão (restauração). Usado pelo App para splash inicial — NÃO desmonta o AuthForm no login. */
  isInitializing: boolean;
  /** Operação de login/register em andamento (botão loading). */
  isLoading: boolean;
  permissions: string[];
  dashboardSections: string[];
  login: (email: string, password: string, userType?: 'barbershop' | 'client' | 'barber' | 'super_admin') => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateLastLogin: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessTenant: (tenantId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [dashboardSections, setDashboardSections] = useState<string[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const token = await sessionStore.restoreSessionFromStorage();

        if (token) {
          try {
            // Timeout evita splash "Carregando..." infinito se /auth/me travar na rede
            const validation = await Promise.race([
              authAPI.validateSession(token),
              new Promise<{ valid: false }>((resolve) => {
                window.setTimeout(() => resolve({ valid: false }), 12_000);
              }),
            ]);

            if (validation.valid && validation.user && validation.sessionData) {
              const sessionState: SessionState = {
                userId: validation.user.id,
                email: validation.user.email,
                role: validation.user.role,
                tenantId: validation.user.tenantId,
                permissions: validation.sessionData.permissions,
                dashboardSections: validation.sessionData.dashboardSections,
                token: token,
                createdAt: validation.sessionData.createdAt,
                expiresAt: validation.sessionData.expiresAt,
                lastActivity: new Date().toISOString()
              };

              sessionStore.setSession(sessionState);
              setUser(validation.user);
              setPermissions(validation.sessionData.permissions);
              setDashboardSections(validation.sessionData.dashboardSections);
            } else {
              sessionStore.clearSession();
            }
          } catch {
            sessionStore.clearSession();
          }
        }
      } catch (error) {
        console.error('AuthContext: Erro na inicialização:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    void initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, userType?: 'super_admin' | 'barber' | 'client' | 'barbershop'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const loginResult = await authAPI.login({
        email,
        password,
        userType
      });

      if (loginResult.success && loginResult.user && loginResult.token) {
        const sessionState: SessionState = {
          userId: loginResult.user.id,
          email: loginResult.user.email,
          role: loginResult.user.role,
          tenantId: loginResult.user.tenantId,
          permissions: loginResult.permissions || [],
          dashboardSections: loginResult.dashboardSections || [],
          token: loginResult.token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString()
        };

        sessionStore.setSession(sessionState);
        setUser(loginResult.user);
        setPermissions(loginResult.permissions || []);
        setDashboardSections(loginResult.dashboardSections || []);

        return { success: true };
      }

      return { success: false, error: loginResult.error || 'Usuário ou senha inválido' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Usuário ou senha inválido' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const result = data.userType === 'barbershop'
        ? await authAPI.registerBarbershop({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            barbershopName: data.businessName || data.name,
            address: data.address,
          })
        : await authAPI.registerClient({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
          });
      return result.success
        ? { success: true }
        : { success: false, error: result.error || 'Não foi possível criar a conta.' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível criar a conta.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const session = sessionStore.getSession();
      const token = session?.token;

      if (token) {
        await authAPI.logout(token);
      }

      sessionStore.clearSession();
      setUser(null);
      setPermissions([]);
      setDashboardSections([]);
    } catch {
      sessionStore.clearSession();
      setUser(null);
      setPermissions([]);
      setDashboardSections([]);
    }
  }, []);

  const updateLastLogin = useCallback(() => {
    if (user) {
      setUser({
        ...user,
        lastLogin: new Date().toISOString()
      });
      sessionStore.updateLastActivity();
    }
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    return sessionStore.hasPermission(permission);
  }, []);

  const canAccessTenant = useCallback((tenantId: string): boolean => {
    return sessionStore.canAccessTenant(tenantId);
  }, []);

  const value = {
    user,
    isInitializing,
    isLoading,
    permissions,
    dashboardSections,
    login,
    register,
    logout,
    updateLastLogin,
    hasPermission,
    canAccessTenant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
