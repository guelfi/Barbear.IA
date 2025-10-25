import { ApiResponse, Appointment, Barber, Client, Service, DashboardStats } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Verificação de segurança para localStorage
    try {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('ApiClient: Token carregado do localStorage:', !!this.token);
    } catch (error) {
      console.error('ApiClient: Erro ao acessar localStorage:', error);
      this.token = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
