// API Central - Ponto de entrada para toda a API simulada
import authAPI from './auth';
import usersAPI from './users';
import appointmentsAPI from './appointments';
import clientsAPI from './clients';
import barbersAPI from './barbers';
import servicesAPI from './services';
import barbershopsAPI from './barbershops';
import dashboardAPI from './dashboard';

// Tipos para o sistema de roteamento
interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

interface AuthContext {
  userId?: string;
  role?: string;
  tenantId?: string;
  permissions?: string[];
}

// Middleware para autenticação
const authMiddleware = async (token?: string): Promise<AuthContext | null> => {
  if (!token) return null;

  try {
    const validation = await authAPI.validateSession(token);
    if (!validation.valid || !validation.user || !validation.sessionData) {
      return null;
    }

    return {
      userId: validation.user.id,
      role: validation.user.role,
      tenantId: validation.user.tenantId,
      permissions: validation.sessionData.permissions
    };
  } catch (error) {
    console.error('[API] Erro na validação de token:', error);
    return null;
  }
};

// Middleware para autorização
const authorizationMiddleware = (authContext: AuthContext | null | undefined, requiredPermission?: string, resourceTenantId?: string): boolean => {
  if (!authContext) return false;

  // Super admin tem acesso a tudo
  if (authContext.role === 'super_admin') return true;

  // Verificar permissão específica
  if (requiredPermission && !authContext.permissions?.includes(requiredPermission)) {
    return false;
  }

  // Verificar acesso ao tenant
  if (resourceTenantId && authContext.tenantId !== resourceTenantId) {
    return false;
  }

  return true;
};

// Função para log de API
const logAPICall = (request: APIRequest, response: APIResponse, authContext?: AuthContext | null) => {
  console.log(`[API] ${request.method} ${request.endpoint}`, {
    status: response.status,
    user: authContext?.userId,
    role: authContext?.role,
    success: response.success
  });
};

// Sistema de roteamento principal
export const apiRouter = {
  /**
   * Processar requisição da API
   */
  async request<T = any>(request: APIRequest): Promise<APIResponse<T>> {
    let authContext: AuthContext | null = null;

    try {
      // Extrair token do header
      const token = request.headers?.['Authorization']?.replace('Bearer ', '');
      
      // Validar autenticação (exceto para endpoints públicos)
      const publicEndpoints = ['/auth/login', '/auth/register'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => request.endpoint.startsWith(endpoint));

      if (!isPublicEndpoint) {
        authContext = await authMiddleware(token);
        if (!authContext) {
          const response: APIResponse<T> = {
            success: false,
            error: 'Token inválido ou expirado',
            status: 401
          };
          logAPICall(request, response);
          return response;
        }
      }

      // Roteamento baseado no endpoint
      let result: any;
      const { endpoint, method, data, params } = request;

      // Rotas de autenticação
      if (endpoint.startsWith('/auth/')) {
        result = await this.handleAuthRoutes(endpoint, method, data);
      }
      // Rotas de usuários
      else if (endpoint.startsWith('/users/')) {
        if (!authorizationMiddleware(authContext ?? undefined, 'view_all_users')) {
          return { success: false, error: 'Acesso negado', status: 403 };
        }
        result = await this.handleUserRoutes(endpoint, method, data, params);
      }
      // Rotas de dashboard
      else if (endpoint.startsWith('/dashboard/')) {
        result = await this.handleDashboardRoutes(endpoint, method, data, params, authContext ?? undefined);
      }
      // Rotas de agendamentos
      else if (endpoint.startsWith('/appointments/')) {
        result = await this.handleAppointmentRoutes(endpoint, method, data, params, authContext ?? undefined);
      }
      // Rotas de clientes
      else if (endpoint.startsWith('/clients/')) {
        result = await this.handleClientRoutes(endpoint, method, data, params, authContext ?? undefined);
      }
      // Rotas de barbeiros
      else if (endpoint.startsWith('/barbers/')) {
        result = await this.handleBarberRoutes(endpoint, method, data, params, authContext ?? undefined);
      }
      // Rotas de serviços
      else if (endpoint.startsWith('/services/')) {
        result = await this.handleServiceRoutes(endpoint, method, data, params, authContext ?? undefined);
      }
      // Rotas de barbearias
      else if (endpoint.startsWith('/barbershops/')) {
        if (!authorizationMiddleware(authContext ?? undefined, 'view_all_barbershops')) {
          return { success: false, error: 'Acesso negado', status: 403 };
        }
        result = await this.handleBarbershopRoutes(endpoint, method, data, params);
      }
      else {
        const response: APIResponse<T> = {
          success: false,
          error: 'Endpoint não encontrado',
          status: 404
        };
        logAPICall(request, response, authContext);
        return response;
      }

      const response: APIResponse<T> = {
        success: true,
        data: result,
        status: 200
      };

      logAPICall(request, response, authContext);
      return response;

    } catch (error) {
      const response: APIResponse<T> = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        status: 500
      };

      logAPICall(request, response, authContext);
      return response;
    }
  },

  // Handlers para cada grupo de rotas
  async handleAuthRoutes(endpoint: string, method: string, data: any) {
    const path = endpoint.replace('/auth/', '');
    
    switch (path) {
      case 'login':
        if (method !== 'POST') throw new Error('Método não permitido');
        return await authAPI.login(data);
      
      case 'logout':
        if (method !== 'POST') throw new Error('Método não permitido');
        return await authAPI.logout(data.token);
      
      default:
        throw new Error('Rota de autenticação não encontrada');
    }
  },

  async handleUserRoutes(endpoint: string, method: string, data: any, params: any) {
    const path = endpoint.replace('/users/', '');
    
    if (path === '') {
      return await usersAPI.getUsers(params.filters, params.pagination);
    } else if (path.startsWith('stats')) {
      return await usersAPI.getUserStats(params.tenantId);
    } else {
      // Assumir que é um ID
      const userId = path;
      switch (method) {
        case 'GET':
          return await usersAPI.getUserById(userId);
        case 'PUT':
          return await usersAPI.updateUser(userId, data);
        case 'DELETE':
          return await usersAPI.deactivateUser(userId);
        default:
          throw new Error('Método não permitido');
      }
    }
  },

  async handleDashboardRoutes(endpoint: string, method: string, data: any, params: any, authContext?: AuthContext) {
    if (!authContext) throw new Error('Contexto de autenticação obrigatório');
    
    const path = endpoint.replace('/dashboard/', '');
    
    switch (path) {
      case 'stats':
        return await dashboardAPI.getDashboardData(authContext.userId!, authContext.role!, authContext.tenantId);
      
      case 'global':
        if (authContext.role !== 'super_admin') throw new Error('Acesso negado');
        return await dashboardAPI.getGlobalStats();
      
      case 'realtime':
        return await dashboardAPI.getRealTimeMetrics(authContext.tenantId);
      
      case 'monthly':
        return await dashboardAPI.getMonthlyReport(authContext.tenantId, params.year, params.month);
      
      default:
        throw new Error('Rota de dashboard não encontrada');
    }
  },

  async handleAppointmentRoutes(endpoint: string, method: string, data: any, params: any, authContext?: AuthContext) {
    if (!authContext) throw new Error('Contexto de autenticação obrigatório');
    
    const path = endpoint.replace('/appointments/', '');
    
    // Aplicar filtros baseados no role
    if (authContext.role === 'barber') {
      params.filters = { ...params.filters, barberId: authContext.userId };
    } else if (authContext.role === 'client') {
      params.filters = { ...params.filters, clientId: authContext.userId };
    } else if (authContext.role === 'admin') {
      params.filters = { ...params.filters, tenantId: authContext.tenantId };
    }
    
    if (path === '') {
      switch (method) {
        case 'GET':
          return await appointmentsAPI.getAppointments(params.filters, params.pagination);
        case 'POST':
          return await appointmentsAPI.createAppointment(data);
        default:
          throw new Error('Método não permitido');
      }
    } else if (path === 'today') {
      return await appointmentsAPI.getTodayAppointments(authContext.tenantId, 
        authContext.role === 'barber' ? authContext.userId : undefined);
    } else if (path === 'upcoming') {
      return await appointmentsAPI.getUpcomingAppointments(authContext.tenantId,
        authContext.role === 'barber' ? authContext.userId : undefined,
        authContext.role === 'client' ? authContext.userId : undefined);
    } else {
      // Assumir que é um ID
      const appointmentId = path;
      switch (method) {
        case 'GET':
          return await appointmentsAPI.getAppointmentById(appointmentId);
        case 'PUT':
          return await appointmentsAPI.updateAppointment(appointmentId, data);
        case 'DELETE':
          return await appointmentsAPI.cancelAppointment(appointmentId, data.reason);
        default:
          throw new Error('Método não permitido');
      }
    }
  },

  async handleClientRoutes(endpoint: string, method: string, data: any, params: any, authContext?: AuthContext) {
    if (!authContext) throw new Error('Contexto de autenticação obrigatório');
    
    const path = endpoint.replace('/clients/', '');
    const tenantId = authContext.role === 'super_admin' ? params.tenantId : authContext.tenantId;
    
    if (path === '') {
      switch (method) {
        case 'GET':
          return await clientsAPI.getClients(tenantId, params.search);
        case 'POST':
          return await clientsAPI.createClient({ ...data, tenantId });
        default:
          throw new Error('Método não permitido');
      }
    } else {
      const clientId = path.replace('/stats', '');
      if (path.endsWith('/stats')) {
        return await clientsAPI.getClientStats(clientId);
      } else {
        switch (method) {
          case 'GET':
            return await clientsAPI.getClientById(clientId);
          case 'PUT':
            return await clientsAPI.updateClient(clientId, data);
          default:
            throw new Error('Método não permitido');
        }
      }
    }
  },

  async handleBarberRoutes(endpoint: string, method: string, data: any, params: any, authContext?: AuthContext) {
    if (!authContext) throw new Error('Contexto de autenticação obrigatório');
    
    const path = endpoint.replace('/barbers/', '');
    const tenantId = authContext.role === 'super_admin' ? params.tenantId : authContext.tenantId;
    
    if (path === '') {
      switch (method) {
        case 'GET':
          return await barbersAPI.getBarbers(tenantId);
        case 'POST':
          return await barbersAPI.createBarber({ ...data, tenantId });
        default:
          throw new Error('Método não permitido');
      }
    } else {
      const barberId = path.replace('/stats', '').replace('/services', '');
      if (path.endsWith('/stats')) {
        return await barbersAPI.getBarberStats(barberId);
      } else if (path.endsWith('/services')) {
        return await barbersAPI.getBarberServices(barberId);
      } else {
        switch (method) {
          case 'GET':
            return await barbersAPI.getBarberById(barberId);
          case 'PUT':
            return await barbersAPI.updateBarber(barberId, data);
          default:
            throw new Error('Método não permitido');
        }
      }
    }
  },

  async handleServiceRoutes(endpoint: string, method: string, data: any, params: any, authContext?: AuthContext) {
    if (!authContext) throw new Error('Contexto de autenticação obrigatório');
    
    const path = endpoint.replace('/services/', '');
    const tenantId = authContext.role === 'super_admin' ? params.tenantId : authContext.tenantId;
    
    if (path === '') {
      switch (method) {
        case 'GET':
          return await servicesAPI.getServices(tenantId, params.category);
        case 'POST':
          return await servicesAPI.createService({ ...data, tenantId });
        default:
          throw new Error('Método não permitido');
      }
    } else if (path === 'categories') {
      return await servicesAPI.getServiceCategories(tenantId);
    } else {
      const serviceId = path;
      switch (method) {
        case 'GET':
          return await servicesAPI.getServiceById(serviceId);
        case 'PUT':
          return await servicesAPI.updateService(serviceId, data);
        case 'DELETE':
          return await servicesAPI.deleteService(serviceId);
        default:
          throw new Error('Método não permitido');
      }
    }
  },

  async handleBarbershopRoutes(endpoint: string, method: string, data: any, _params: any) {
    const path = endpoint.replace('/barbershops/', '');
    
    if (path === '') {
      switch (method) {
        case 'GET':
          return await barbershopsAPI.getBarbershops();
        case 'POST':
          return await barbershopsAPI.createBarbershop(data);
        default:
          throw new Error('Método não permitido');
      }
    } else {
      const barbershopId = path.replace('/stats', '');
      if (path.endsWith('/stats')) {
        return await barbershopsAPI.getBarbershopStats(barbershopId);
      } else {
        switch (method) {
          case 'GET':
            return await barbershopsAPI.getBarbershopById(barbershopId);
          case 'PUT':
            return await barbershopsAPI.updateBarbershop(barbershopId, data);
          default:
            throw new Error('Método não permitido');
        }
      }
    }
  }
};

// Função helper para fazer requisições à API
export const apiCall = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  params?: Record<string, any>,
  token?: string
): Promise<APIResponse<T>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const request: APIRequest = {
    method,
    endpoint,
    data,
    params,
    headers
  };

  return await apiRouter.request<T>(request);
};

// Exportar APIs individuais para uso direto
export {
  authAPI,
  usersAPI,
  appointmentsAPI,
  clientsAPI,
  barbersAPI,
  servicesAPI,
  barbershopsAPI,
  dashboardAPI
};

export default apiRouter;