// Sistema de gerenciamento de estado em memória
// Substitui a dependência excessiva do localStorage

interface SessionState {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions: string[];
  dashboardSections: string[];
  token: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Store principal em memória
class SessionStore {
  private currentSession: SessionState | null = null;
  private userPreferences: UserPreferences | null = null;
  private dataCache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Definir sessão ativa
   */
  setSession(session: SessionState): void {
    this.currentSession = session;
    this.updateLastActivity();
    
    // Salvar apenas token mínimo no localStorage para persistência
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('authToken', session.token);
        localStorage.setItem('userEmail', session.email);
        console.log('[SESSION STORE] Sessão definida em memória, token salvo no localStorage');
      } catch (error) {
        console.error('[SESSION STORE] Erro ao salvar token no localStorage:', error);
      }
    }
  }

  /**
   * Obter sessão ativa
   */
  getSession(): SessionState | null {
    if (this.currentSession && this.isSessionValid()) {
      this.updateLastActivity();
      return this.currentSession;
    }
    return null;
  }

  /**
   * Verificar se sessão é válida
   */
  isSessionValid(): boolean {
    if (!this.currentSession) return false;
    
    const now = new Date();
    const expiresAt = new Date(this.currentSession.expiresAt);
    
    return now < expiresAt;
  }

  /**
   * Atualizar última atividade
   */
  updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Limpar sessão
   */
  clearSession(): void {
    this.currentSession = null;
    this.userPreferences = null;
    this.clearCache();
    
    // Limpar localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        console.log('[SESSION STORE] Sessão limpa da memória e localStorage');
      } catch (error) {
        console.error('[SESSION STORE] Erro ao limpar localStorage:', error);
      }
    }
  }

  /**
   * Obter dados do usuário atual
   */
  getCurrentUser(): {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
    permissions: string[];
  } | null {
    const session = this.getSession();
    if (!session) return null;

    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId,
      permissions: session.permissions
    };
  }

  /**
   * Verificar permissão
   */
  hasPermission(permission: string): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    // Super admin tem todas as permissões
    if (session.role === 'super_admin') return true;
    
    return session.permissions.includes(permission);
  }

  /**
   * Verificar acesso ao tenant
   */
  canAccessTenant(tenantId: string): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    // Super admin pode acessar qualquer tenant
    if (session.role === 'super_admin') return true;
    
    return session.tenantId === tenantId;
  }

  /**
   * Definir preferências do usuário
   */
  setUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;
    console.log('[SESSION STORE] Preferências do usuário atualizadas');
  }

  /**
   * Obter preferências do usuário
   */
  getUserPreferences(): UserPreferences | null {
    return this.userPreferences;
  }

  /**
   * Cache de dados da API
   */
  setCacheData<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.CACHE_TTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    // Limpar cache se estiver muito grande
    if (this.dataCache.size >= this.MAX_CACHE_SIZE) {
      this.clearExpiredCache();
      
      // Se ainda estiver grande, remover entradas mais antigas
      if (this.dataCache.size >= this.MAX_CACHE_SIZE) {
        const oldestKey = Array.from(this.dataCache.entries())
          .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
        this.dataCache.delete(oldestKey);
      }
    }

    this.dataCache.set(key, entry);
    console.log(`[SESSION STORE] Dados em cache: ${key}`);
  }

  /**
   * Obter dados do cache
   */
  getCacheData<T>(key: string): T | null {
    const entry = this.dataCache.get(key);
    
    if (!entry) return null;
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.dataCache.delete(key);
      return null;
    }

    console.log(`[SESSION STORE] Cache hit: ${key}`);
    return entry.data as T;
  }

  /**
   * Remover entrada específica do cache
   */
  removeCacheData(key: string): void {
    this.dataCache.delete(key);
    console.log(`[SESSION STORE] Cache removido: ${key}`);
  }

  /**
   * Limpar cache expirado
   */
  clearExpiredCache(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.dataCache.entries()) {
      if (now > entry.expiresAt) {
        this.dataCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`[SESSION STORE] ${removedCount} entradas expiradas removidas do cache`);
    }
  }

  /**
   * Limpar todo o cache
   */
  clearCache(): void {
    const size = this.dataCache.size;
    this.dataCache.clear();
    console.log(`[SESSION STORE] Cache limpo (${size} entradas removidas)`);
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: string | null;
  } {
    let oldestEntry: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.dataCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestEntry = key;
      }
    }

    return {
      size: this.dataCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // Seria calculado com métricas reais
      oldestEntry
    };
  }

  /**
   * Restaurar sessão do localStorage (apenas token)
   */
  async restoreSessionFromStorage(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const token = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');

      if (token && email) {
        console.log('[SESSION STORE] Token encontrado no localStorage, validação necessária');
        return token;
      }

      return null;
    } catch (error) {
      console.error('[SESSION STORE] Erro ao restaurar do localStorage:', error);
      return null;
    }
  }

  /**
   * Debug: obter estado completo
   */
  getDebugInfo(): {
    hasSession: boolean;
    sessionValid: boolean;
    userId?: string;
    role?: string;
    cacheSize: number;
    lastActivity?: string;
  } {
    const session = this.currentSession;
    
    return {
      hasSession: !!session,
      sessionValid: this.isSessionValid(),
      userId: session?.userId,
      role: session?.role,
      cacheSize: this.dataCache.size,
      lastActivity: session?.lastActivity
    };
  }
}

// Instância singleton
const sessionStore = new SessionStore();

// Limpeza automática do cache a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    sessionStore.clearExpiredCache();
  }, 5 * 60 * 1000);
}

export default sessionStore;
export type { SessionState, UserPreferences };