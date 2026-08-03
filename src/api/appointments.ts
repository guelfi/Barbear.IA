import { get, post } from './http';

interface Appointment {
  id: string; clientId: string; barberId: string; serviceId: string; tenantId: string; date: string; time: string;
  duration: number; status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  price: number; notes?: string; createdAt: string; updatedAt: string;
}
interface AppointmentWithDetails extends Appointment { client: any; barber: any; service: any; }
interface AppointmentFilters { tenantId?: string; barberId?: string; clientId?: string; serviceId?: string; status?: string; date?: string; dateFrom?: string; dateTo?: string; }
interface PaginationOptions { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }

function map(raw: any): AppointmentWithDetails {
  const startsAt = raw.startsAt ?? `${raw.date ?? ''}T${raw.time ?? '00:00'}:00`;
  const date = startsAt ? String(startsAt).slice(0, 10) : '';
  const time = startsAt ? new Date(startsAt).toISOString().slice(11, 16) : '';
  return {
    ...raw, id: raw.id, clientId: raw.clientId, barberId: raw.barberId, serviceId: raw.serviceId, tenantId: raw.tenantId ?? '',
    date, time, duration: raw.duration ?? raw.service?.durationMinutes ?? 30, status: String(raw.status ?? 'scheduled').toLowerCase() as Appointment['status'],
    price: Number(raw.price ?? raw.service?.price ?? 0), createdAt: raw.createdAt ?? new Date().toISOString(), updatedAt: raw.updatedAt ?? new Date().toISOString(),
    client: raw.client ?? null, barber: raw.barber ?? null, service: raw.service ?? null,
  };
}
const queryFor = (filters: AppointmentFilters) => ({
  from: filters.dateFrom ?? filters.date, to: filters.dateTo ?? (filters.date ? `${filters.date}T23:59:59Z` : undefined),
  status: filters.status,
});
export const appointmentsAPI = {
  async getAll(): Promise<AppointmentWithDetails[]> { return (await get<any[]>('/appointments')).map(map); },
  async getAppointments(filters: AppointmentFilters = {}, pagination: PaginationOptions = {}) {
    const appointments = (await get<any[]>('/appointments', { query: queryFor(filters) })).map(map);
    const limit = (pagination.limit ?? appointments.length) || 1;
    return { appointments, total: appointments.length, page: pagination.page ?? 1, limit, totalPages: Math.max(1, Math.ceil(appointments.length / limit)) };
  },
  async getAppointmentById(id: string): Promise<AppointmentWithDetails> { return map(await get<any>(`/appointments/${id}`)); },
  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentWithDetails> {
    const startsAt = `${data.date}T${data.time}:00.000Z`;
    const created = await post<{ id: string }>('/appointments', { barberId: data.barberId, clientId: data.clientId, serviceId: data.serviceId, startsAt, notes: data.notes });
    return this.getAppointmentById(created.id);
  },
  async cancelAppointment(id: string, reason?: string): Promise<boolean> { await post(`/appointments/${id}/cancel`, { reason }); return true; },
  async completeAppointment(id: string): Promise<boolean> { await post(`/appointments/${id}/complete`); return true; },
  async rescheduleAppointment(id: string, date: string, time: string): Promise<AppointmentWithDetails> {
    const startsAt = `${date}T${time}:00.000Z`;
    await post(`/appointments/${id}/reschedule`, { startsAt });
    return this.getAppointmentById(id);
  },
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<AppointmentWithDetails> {
    if (updates.status === 'cancelled') { await this.cancelAppointment(id, updates.notes); return this.getAppointmentById(id); }
    if (updates.status === 'completed') { await this.completeAppointment(id); return this.getAppointmentById(id); }
    if (updates.date && updates.time) {
      return this.rescheduleAppointment(id, updates.date, updates.time);
    }
    throw new Error('A API não suporta a atualização solicitada para o agendamento.');
  },
  async getTodayAppointments(_tenantId?: string, _barberId?: string): Promise<AppointmentWithDetails[]> { return (await get<any[]>('/appointments/today')).map(map); },
  async getUpcomingAppointments(_tenantId?: string, _barberId?: string, _clientId?: string, days = 7): Promise<AppointmentWithDetails[]> { return (await get<any[]>('/appointments/upcoming', { query: { days } })).map(map); },
};
export default appointmentsAPI;
