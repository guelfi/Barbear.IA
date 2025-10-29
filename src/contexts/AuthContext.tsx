import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, RegisterData } from '../types';
import { authAPI } from '../api';
import sessionStore from '../api/sessionStore';
import type { SessionState } from '../api/sessionStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  permissions: string[];
  dashboardSections: string[];
  login: (email: string, password: string, userType?: 'barbershop' | 'client' | 'barber' | 'super_admin') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [dashboardSections, setDashboardSections] = useState<string[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext: Inicializando autenticação com API simulada...');
        console.log('AuthContext: Ambiente:', process.env.NODE_ENV);
        console.log('AuthContext: URL atual:', typeof window !== 'undefined' ? window.location.href : 'servidor');
        
        if (typeof window === 'undefined') {
          console.log('AuthContext: Executando no servidor, pulando verificação');
          return;
        }

        // Tentar restaurar sessão do localStorage
        const token = await sessionStore.restoreSessionFromStorage();
        
        console.log('AuthContext: Token do localStorage:', {
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : null
        });

        if (token) {
          try {
            // Validar token com a API simulada
            const validation = await authAPI.validateSession(token);
            
            console.log('AuthContext: Validação de sessão:', {
              valid: validation.valid,
              hasUser: !!validation.user,
              hasSessionData: !!validation.sessionData
            });

            if (validation.valid && validation.user && validation.sessionData) {
              // Restaurar sessão no store em memória
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

              console.log('AuthContext: Sessão restaurada com sucesso:', {
                userId: validation.user.id,
                role: validation.user.role,
                permissionsCount: validation.sessionData.permissions.length
              });
            } else {
              console.log('AuthContext: Token inválido, limpando dados');
              sessionStore.clearSession();
            }
          } catch (error) {
            console.error('AuthContext: Erro na validação de token:', error);
            sessionStore.clearSession();
          }
        } else {
          console.log('AuthContext: Nenhum token encontrado no localStorage');
        }
      } catch (error) {
        console.error('AuthContext: Erro na inicialização:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, userType?: 'super_admin' | 'barber' | 'client' | 'barbershop'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('AuthContext: Tentativa de login via API simulada:', {
        email,
        userType,
        ambiente: process.env.NODE_ENV,
        url: typeof window !== 'undefined' ? window.location.href : 'servidor'
      });
      
      // Chamar API de login simulada
      const loginResult = await authAPI.login({
        email,
        password,
        userType
      });

      console.log('AuthContext: Resultado do login:', {
        success: loginResult.success,
        hasUser: !!loginResult.user,
        hasToken: !!loginResult.token,
        error: loginResult.error
      });

      if (loginResult.success && loginResult.user && loginResult.token) {
        // Criar sessão no store em memória
        const sessionState: SessionState = {
          userId: loginResult.user.id,
          email: loginResult.user.email,
          role: loginResult.user.role,
          tenantId: loginResult.user.tenantId,
          permissions: loginResult.permissions || [],
          dashboardSections: loginResult.dashboardSections || [],
          token: loginResult.token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
          lastActivity: new Date().toISOString()
        };

        sessionStore.setSession(sessionState);
        setUser(loginResult.user);
        setPermissions(loginResult.permissions || []);
        setDashboardSections(loginResult.dashboardSections || []);

        console.log('AuthContext: Login bem-sucedido, sessão criada:', {
          userId: loginResult.user.id,
          role: loginResult.user.role,
          tenantId: loginResult.user.tenantId,
          permissionsCount: loginResult.permissions?.length || 0
        });

        return true;
      } else {
        console.log('AuthContext: Login falhou:', loginResult.error);
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would create the user in the database
      console.log('New user registration:', data);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('AuthContext: Iniciando logout...');
      
      // Obter token atual
      const session = sessionStore.getSession();
      const token = session?.token;

      if (token) {
        // Chamar API de logout
        await authAPI.logout(token);
        console.log('AuthContext: Logout via API concluído');
      }

      // Limpar estado local
      sessionStore.clearSession();
      setUser(null);
      setPermissions([]);
      setDashboardSections([]);

      console.log('AuthContext: Logout realizado com sucesso');
    } catch (error) {
      console.error('AuthContext: Erro no logout:', error);
      
      // Mesmo com erro, limpar estado local
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
      
      // Atualizar atividade na sessão
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