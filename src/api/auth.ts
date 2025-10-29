import usersData from '../database/users.json';
import sessionsData from '../database/sessions.json';

// Tipos para TypeScript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'barber' | 'client';
  tenantId?: string;
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
  user?: Omit<User, 'password'>;
  token?: string;
  permissions?: string[];
  dashboardSections?: string[];
  error?: string;
}

interface SessionData {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions: string[];
  dashboardSections: string[];
  createdAt: string;
  expiresAt: string;
}

// Store em memória para sessões ativas
const activeSessions = new Map<string, SessionData>();

// Função para simular delay de rede
const simulateNetworkDelay = (min: number = 800, max: number = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Função para gerar token simulado
const generateToken = (userId: string, role: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `mock-token-${role}-${userId}-${timestamp}-${random}`;
};

// Função para log de debug
const logAuthEvent = (event: string, data: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    data,
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  };
  
  console.log(`[AUTH API] ${event}:`, data);
  
  // Salvar no sessionStorage para ProductionDebugPanel
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      const existingLogs = sessionStorage.getItem('auth_debug');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Manter apenas os últimos 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      sessionStorage.setItem('auth_debug', JSON.stringify(logs));
    } catch (error) {
      console.error('[AUTH API] Erro ao salvar log:', error);
    }
  }
};

// API de Autenticação Simulada
export const authAPI = {
  /**
   * Login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    logAuthEvent('LOGIN_ATTEMPT', {
      email: credentials.email,
      userType: credentials.userType,
      timestamp: new Date().toISOString()
    });

    await simulateNetworkDelay();

    try {
      // Buscar usuário por email
      const user = usersData.users.find(u => u.email === credentials.email);
      
      if (!user) {
        logAuthEvent('LOGIN_FAILED', { reason: 'USER_NOT_FOUND', email: credentials.email });
        return {
          success: false,
          error: 'Usuário não encontrado'
        };
      }

      // Verificar senha
      if (user.password !== credentials.password) {
        logAuthEvent('LOGIN_FAILED', { reason: 'INVALID_PASSWORD', email: credentials.email });
        return {
          success: false,
          error: 'Senha incorreta'
        };
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        logAuthEvent('LOGIN_FAILED', { reason: 'USER_INACTIVE', email: credentials.email });
        return {
          success: false,
          error: 'Usuário inativo'
        };
      }

      // Verificar compatibilidade de tipo de usuário
      if (credentials.userType && credentials.userType !== user.role) {
        // Permitir 'barbershop' para role 'admin'
        if (!(credentials.userType === 'barbershop' && user.role === 'admin')) {
          logAuthEvent('LOGIN_FAILED', { 
            reason: 'USER_TYPE_MISMATCH', 
            expected: credentials.userType, 
            actual: user.role 
          });
          return {
            success: false,
            error: 'Tipo de usuário incompatível'
          };
        }
      }

      // Obter template de sessão
      const sessionTemplate = sessionsData.sessionTemplates[user.role as keyof typeof sessionsData.sessionTemplates];
      if (!sessionTemplate) {
        logAuthEvent('LOGIN_FAILED', { reason: 'SESSION_TEMPLATE_NOT_FOUND', role: user.role });
        return {
          success: false,
          error: 'Configuração de sessão não encontrada'
        };
      }

      // Gerar token
      const token = generateToken(user.id, user.role);
      
      // Criar dados de sessão
      const sessionData: SessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined,
        permissions: sessionTemplate.permissions,
        dashboardSections: sessionTemplate.dashboardSections,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + sessionsData.sessionDefaults.tokenExpiry * 1000).toISOString()
      };

      // Armazenar sessão ativa
      activeSessions.set(token, sessionData);

      // Remover senha do objeto de usuário
      const { password, ...userWithoutPassword } = user;
      
      // Atualizar lastLogin
      userWithoutPassword.lastLogin = new Date().toISOString();

      logAuthEvent('LOGIN_SUCCESS', {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined,
        token: token.substring(0, 20) + '...' // Log apenas parte do token
      });

      return {
        success: true,
        user: userWithoutPassword as Omit<User, 'password'>,
        token,
        permissions: sessionTemplate.permissions,
        dashboardSections: sessionTemplate.dashboardSections
      };

    } catch (error) {
      logAuthEvent('LOGIN_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  },

  /**
   * Logout do usuário
   */
  async logout(token: string): Promise<{ success: boolean }> {
    logAuthEvent('LOGOUT_ATTEMPT', { token: token.substring(0, 20) + '...' });

    await simulateNetworkDelay(200, 500);

    try {
      const sessionData = activeSessions.get(token);
      
      if (sessionData) {
        activeSessions.delete(token);
        logAuthEvent('LOGOUT_SUCCESS', { userId: sessionData.userId });
      } else {
        logAuthEvent('LOGOUT_WARNING', { reason: 'SESSION_NOT_FOUND' });
      }

      return { success: true };
    } catch (error) {
      logAuthEvent('LOGOUT_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      return { success: false };
    }
  },

  /**
   * Validar token de sessão
   */
  async validateSession(token: string): Promise<{ valid: boolean; user?: Omit<User, 'password'>; sessionData?: SessionData }> {
    logAuthEvent('SESSION_VALIDATION', { token: token.substring(0, 20) + '...' });

    await simulateNetworkDelay(100, 300);

    try {
      const sessionData = activeSessions.get(token);
      
      if (!sessionData) {
        logAuthEvent('SESSION_INVALID', { reason: 'SESSION_NOT_FOUND' });
        return { valid: false };
      }

      // Verificar expiração
      if (new Date() > new Date(sessionData.expiresAt)) {
        activeSessions.delete(token);
        logAuthEvent('SESSION_EXPIRED', { userId: sessionData.userId });
        return { valid: false };
      }

      // Buscar dados atualizados do usuário
      const user = usersData.users.find(u => u.id === sessionData.userId);
      
      if (!user || !user.isActive) {
        activeSessions.delete(token);
        logAuthEvent('SESSION_INVALID', { reason: 'USER_NOT_FOUND_OR_INACTIVE' });
        return { valid: false };
      }

      const { password, ...userWithoutPassword } = user;

      logAuthEvent('SESSION_VALID', { userId: user.id });

      return {
        valid: true,
        user: userWithoutPassword as Omit<User, 'password'>,
        sessionData
      };

    } catch (error) {
      logAuthEvent('SESSION_VALIDATION_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      return { valid: false };
    }
  },

  /**
   * Obter sessões ativas (para debug)
   */
  getActiveSessions(): Map<string, SessionData> {
    return activeSessions;
  },

  /**
   * Limpar todas as sessões (para debug)
   */
  clearAllSessions(): void {
    logAuthEvent('CLEAR_ALL_SESSIONS', { count: activeSessions.size });
    activeSessions.clear();
  }
};

export default authAPI;