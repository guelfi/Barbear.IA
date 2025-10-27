import { ApiResponse, Appointment, Barber, Client, Service, DashboardStats } from '../types';

// Em produção, usar dados mock locais ao invés de tentar conectar com API externa
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Não usar API externa em produção - usar dados mock
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Verificação de segurança para localStorage
    try {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('ApiClient: Token carregado do localStorage:', !!this.token);
      console.log('ApiClient: Ambiente:', process.env.NODE_ENV);
      console.log('ApiClient: Base URL:', this.baseUrl);
    } catch (error) {
      console.error('ApiClient: Erro ao acessar localStorage:', error);
      this.token = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Em produção, retornar dados mock ao invés de fazer requisições HTTP
    if (process.env.NODE_ENV === 'production') {
      console.log('ApiClient: Modo produção - usando dados mock para:', endpoint);
      return this.getMockData<T>(endpoint);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private getMockData<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log('ApiClient: Retornando dados mock para endpoint:', endpoint);
    
    // Simular delay de rede
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint === '/dashboard/stats') {
          resolve({
            success: true,
            data: {
              totalAppointments: 45,
              totalClients: 128,
              totalBarbers: 8,
              totalRevenue: 12500,
              appointmentsToday: 12,
              appointmentsTomorrow: 8,
              recentAppointments: [
                {
                  id: '1',
                  clientName: 'João Silva',
                  serviceName: 'Corte + Barba',
                  time: '14:30',
                  status: 'confirmed'
                },
                {
                  id: '2',
                  clientName: 'Pedro Santos',
                  serviceName: 'Corte Simples',
                  time: '15:00',
                  status: 'pending'
                }
              ]
            } as T
          });
        } else if (endpoint.startsWith('/appointments')) {
          resolve({
            success: true,
            data: [] as T
          });
        } else if (endpoint.startsWith('/clients')) {
          resolve({
            success: true,
            data: [] as T
          });
        } else if (endpoint.startsWith('/barbers')) {
          resolve({
            success: true,
            data: [] as T
          });
        } else if (endpoint.startsWith('/services')) {
          resolve({
            success: true,
            data: [] as T
          });
        } else {
          resolve({
            success: true,
            data: {} as T
          });
        }
      }, 500); // Simular 500ms de delay
    });
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  setToken(token: string) {
    this.token = token;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        console.log('ApiClient: Token salvo no localStorage');
      }
    } catch (error) {
      console.error('ApiClient: Erro ao salvar token no localStorage:', error);
    }
  }

  clearToken() {
    this.token = null;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        console.log('ApiClient: Token removido do localStorage');
      }
    } catch (error) {
      console.error('ApiClient: Erro ao remover token do localStorage:', error);
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Appointments
  async getAppointments(date?: string): Promise<ApiResponse<Appointment[]>> {
    const params = date ? `?date=${date}` : '';
    return this.request<Appointment[]>(`/appointments${params}`);
  }

  async createAppointment(appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients
  async getClients(): Promise<ApiResponse<Client[]>> {
    return this.request<Client[]>('/clients');
  }

  async createClient(client: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: string, client: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Barbers
  async getBarbers(): Promise<ApiResponse<Barber[]>> {
    return this.request<Barber[]>('/barbers');
  }

  async createBarber(barber: Partial<Barber>): Promise<ApiResponse<Barber>> {
    return this.request<Barber>('/barbers', {
      method: 'POST',
      body: JSON.stringify(barber),
    });
  }

  async updateBarber(id: string, barber: Partial<Barber>): Promise<ApiResponse<Barber>> {
    return this.request<Barber>(`/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(barber),
    });
  }

  async deleteBarber(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/barbers/${id}`, {
      method: 'DELETE',
    });
  }

  // Services
  async getServices(): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>('/services');
  }

  async createService(service: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  }

  async updateService(id: string, service: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  }

  async deleteService(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
