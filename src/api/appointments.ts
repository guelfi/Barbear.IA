import appointmentsData from '../database/appointments.json';
import barbersData from '../database/barbers.json';
import clientsData from '../database/clients.json';
import servicesData from '../database/services.json';

interface Appointment {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  tenantId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  price: number;
  notes?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentWithDetails extends Appointment {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  } | null;
  barber: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
  } | null;
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
  } | null;
}

interface AppointmentFilters {
  tenantId?: string;
  barberId?: string;
  clientId?: string;
  serviceId?: string;
  status?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Função para simular delay de rede
const simulateNetworkDelay = (min: number = 400, max: number = 900): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Função para log de debug
const logAppointmentEvent = (event: string, data: any) => {
  console.log(`[APPOINTMENTS API] ${event}:`, data);
};

// Função para enriquecer appointment com detalhes
const enrichAppointmentWithDetails = (appointment: Appointment): AppointmentWithDetails => {
  const client = clientsData.clients.find(c => c.id === appointment.clientId);
  const barber = barbersData.barbers.find(b => b.id === appointment.barberId);
  const service = servicesData.services.find(s => s.id === appointment.serviceId);

  return {
    ...appointment,
    client: client ? {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      avatar: client.avatar
    } : null,
    barber: barber ? {
      id: barber.id,
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      avatar: barber.avatar
    } : null,
    service: service ? {
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category
    } : null
  };
};

export const appointmentsAPI = {
  /**
   * Obter todos os agendamentos (sem filtros)
   */
  async getAll(): Promise<AppointmentWithDetails[]> {
    logAppointmentEvent('GET_ALL_APPOINTMENTS', {});
    await simulateNetworkDelay();

    try {
      const appointments = appointmentsData.appointments;
      const enrichedAppointments = appointments.map(appointment => 
        enrichAppointmentWithDetails(appointment)
      );

      logAppointmentEvent('GET_ALL_APPOINTMENTS_SUCCESS', { count: enrichedAppointments.length });
      return enrichedAppointments;

    } catch (error) {
      logAppointmentEvent('GET_ALL_APPOINTMENTS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao obter agendamentos');
    }
  },

  /**
   * Listar agendamentos com filtros e paginação
   */
  async getAppointments(filters: AppointmentFilters = {}, pagination: PaginationOptions = {}): Promise<{
    appointments: AppointmentWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    logAppointmentEvent('GET_APPOINTMENTS', { filters, pagination });
    await simulateNetworkDelay();

    try {
      let filteredAppointments = [...appointmentsData.appointments];

      // Aplicar filtros
      if (filters.tenantId) {
        filteredAppointments = filteredAppointments.filter(apt => apt.tenantId === filters.tenantId);
      }

      if (filters.barberId) {
        filteredAppointments = filteredAppointments.filter(apt => apt.barberId === filters.barberId);
      }

      if (filters.clientId) {
        filteredAppointments = filteredAppointments.filter(apt => apt.clientId === filters.clientId);
      }

      if (filters.serviceId) {
        filteredAppointments = filteredAppointments.filter(apt => apt.serviceId === filters.serviceId);
      }

      if (filters.status) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === filters.status);
      }

      if (filters.date) {
        filteredAppointments = filteredAppointments.filter(apt => apt.date === filters.date);
      }

      if (filters.dateFrom) {
        filteredAppointments = filteredAppointments.filter(apt => apt.date >= filters.dateFrom!);
      }

      if (filters.dateTo) {
        filteredAppointments = filteredAppointments.filter(apt => apt.date <= filters.dateTo!);
      }

      // Aplicar ordenação
      const sortBy = pagination.sortBy || 'date';
      const sortOrder = pagination.sortOrder || 'desc';
      
      filteredAppointments.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'date') {
          aValue = `${a.date} ${a.time}`;
          bValue = `${b.date} ${b.time}`;
        } else {
          aValue = a[sortBy as keyof Appointment] || '';
          bValue = b[sortBy as keyof Appointment] || '';
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Aplicar paginação
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
      
      // Enriquecer com detalhes
      const appointmentsWithDetails = paginatedAppointments.map(apt => enrichAppointmentWithDetails(apt as Appointment));

      return {
        appointments: appointmentsWithDetails,
        total: filteredAppointments.length,
        page,
        limit,
        totalPages: Math.ceil(filteredAppointments.length / limit)
      };

    } catch (error) {
      logAppointmentEvent('GET_APPOINTMENTS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao buscar agendamentos');
    }
  },

  /**
   * Obter agendamento por ID
   */
  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    logAppointmentEvent('GET_APPOINTMENT_BY_ID', { id });
    await simulateNetworkDelay();

    try {
      const appointment = appointmentsData.appointments.find(apt => apt.id === id);
      
      if (!appointment) {
        return null;
      }

      return enrichAppointmentWithDetails(appointment as Appointment);

    } catch (error) {
      logAppointmentEvent('GET_APPOINTMENT_BY_ID_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao buscar agendamento');
    }
  },

  /**
   * Criar novo agendamento
   */
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentWithDetails> {
    logAppointmentEvent('CREATE_APPOINTMENT', appointmentData);
    await simulateNetworkDelay();

    try {
      // Validações básicas
      const client = clientsData.clients.find(c => c.id === appointmentData.clientId);
      const barber = barbersData.barbers.find(b => b.id === appointmentData.barberId);
      const service = servicesData.services.find(s => s.id === appointmentData.serviceId);

      if (!client) throw new Error('Cliente não encontrado');
      if (!barber) throw new Error('Barbeiro não encontrado');
      if (!service) throw new Error('Serviço não encontrado');

      // Verificar se barbeiro pertence ao tenant
      if (barber.tenantId !== appointmentData.tenantId) {
        throw new Error('Barbeiro não pertence a esta barbearia');
      }

      // Verificar conflito de horário (simulado)
      const conflictingAppointment = appointmentsData.appointments.find(apt => 
        apt.barberId === appointmentData.barberId &&
        apt.date === appointmentData.date &&
        apt.time === appointmentData.time &&
        apt.status === 'scheduled'
      );

      if (conflictingAppointment) {
        throw new Error('Horário já ocupado para este barbeiro');
      }

      // Simular criação (em produção, seria salvo no backend)
      const newAppointment = {
        ...appointmentData,
        id: `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      logAppointmentEvent('APPOINTMENT_CREATED', { id: newAppointment.id });
      return enrichAppointmentWithDetails(newAppointment);

    } catch (error) {
      logAppointmentEvent('CREATE_APPOINTMENT_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw error;
    }
  },

  /**
   * Atualizar agendamento
   */
  async updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<AppointmentWithDetails | null> {
    logAppointmentEvent('UPDATE_APPOINTMENT', { id, updates });
    await simulateNetworkDelay();

    try {
      const appointmentIndex = appointmentsData.appointments.findIndex(apt => apt.id === id);
      
      if (appointmentIndex === -1) {
        return null;
      }

      const currentAppointment = appointmentsData.appointments[appointmentIndex];

      // Validar mudança de status
      if (updates.status) {
        if (updates.status === 'completed' && !updates.completedAt) {
          updates.completedAt = new Date().toISOString();
        }
        if (updates.status === 'cancelled' && !updates.cancelledAt) {
          updates.cancelledAt = new Date().toISOString();
        }
      }

      // Simular atualização (em produção, seria salvo no backend)
      const appointment = appointmentsData.appointments.find(a => a.id === id);
      const updatedAppointment = appointment ? { ...appointment, ...updates, updatedAt: new Date().toISOString() } : null;
      
      if (!updatedAppointment) {
        return null;
      }
      
      logAppointmentEvent('APPOINTMENT_UPDATED', { id });
      return enrichAppointmentWithDetails(updatedAppointment);

    } catch (error) {
      logAppointmentEvent('UPDATE_APPOINTMENT_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao atualizar agendamento');
    }
  },

  /**
   * Cancelar agendamento
   */
  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    logAppointmentEvent('CANCEL_APPOINTMENT', { id, reason });
    await simulateNetworkDelay();

    try {
      const appointment = appointmentsData.appointments.find(apt => apt.id === id);
      
      if (!appointment) {
        return false;
      }

      if (appointment.status !== 'scheduled') {
        throw new Error('Apenas agendamentos agendados podem ser cancelados');
      }

      // Em uma implementação real, atualizaria no banco de dados
      
      logAppointmentEvent('APPOINTMENT_CANCELLED', { id });
      return true;

    } catch (error) {
      logAppointmentEvent('CANCEL_APPOINTMENT_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw error;
    }
  },

  /**
   * Obter agendamentos do dia
   */
  async getTodayAppointments(tenantId?: string, barberId?: string): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    
    logAppointmentEvent('GET_TODAY_APPOINTMENTS', { date: today, tenantId, barberId });
    
    const filters: AppointmentFilters = { date: today };
    if (tenantId) filters.tenantId = tenantId;
    if (barberId) filters.barberId = barberId;

    const result = await this.getAppointments(filters, { limit: 100 });
    return result.appointments;
  },

  /**
   * Obter próximos agendamentos
   */
  async getUpcomingAppointments(tenantId?: string, barberId?: string, clientId?: string, days: number = 7): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    logAppointmentEvent('GET_UPCOMING_APPOINTMENTS', { dateFrom: today, dateTo: futureDateStr, tenantId, barberId, clientId });
    
    const filters: AppointmentFilters = { 
      dateFrom: today, 
      dateTo: futureDateStr,
      status: 'scheduled'
    };
    if (tenantId) filters.tenantId = tenantId;
    if (barberId) filters.barberId = barberId;
    if (clientId) filters.clientId = clientId;

    const result = await this.getAppointments(filters, { limit: 100, sortBy: 'date', sortOrder: 'asc' });
    return result.appointments;
  }
};

export default appointmentsAPI;