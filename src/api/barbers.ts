import { del, get, post, put } from './http';

interface Barber {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tenantId: string;
  specialties: string[];
  experience: string;
  bio: string;
  workingHours: any;
  services: string[];
  rating: number;
  totalAppointments: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const map = (raw: any): Barber => ({
  ...raw,
  userId: raw.userId ?? '',
  avatar: raw.avatarUrl ?? raw.avatar ?? '',
  tenantId: raw.tenantId ?? '',
  specialties: raw.specialties ?? [],
  experience: raw.experience ?? '',
  bio: raw.bio ?? '',
  workingHours: raw.workingHours ?? {},
  services: raw.serviceIds ?? raw.services ?? [],
  rating: raw.rating ?? 0,
  totalAppointments: raw.totalAppointments ?? 0,
  isActive: raw.isActive ?? true,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
});

export const barbersAPI = {
  async getAll(): Promise<Barber[]> {
    return (await get<any[]>('/barbers')).map(map);
  },
  async getBarbers(tenantId?: string): Promise<Barber[]> {
    return (await get<any[]>('/barbers', { query: { tenantId } })).map(map);
  },
  async getBarberById(id: string): Promise<Barber> {
    const found = (await this.getAll()).find((item) => item.id === id);
    if (!found) throw new Error('Barbeiro não encontrado.');
    return found;
  },
  async createBarber(
    data: Omit<Barber, 'id' | 'createdAt' | 'updatedAt' | 'totalAppointments' | 'rating'>
  ): Promise<Barber> {
    const created = await post<{ id: string }>('/barbers', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      userId: data.userId || null,
      serviceIds: data.services,
    });
    return this.getBarberById(created.id);
  },
  async updateBarber(id: string, updates: Partial<Barber>): Promise<Barber> {
    await put(`/barbers/${id}`, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      bio: updates.bio,
      userId: updates.userId,
      serviceIds: updates.services,
    });
    return this.getBarberById(id);
  },
  async deleteBarber(id: string): Promise<boolean> {
    await del<void>(`/barbers/${id}`);
    return true;
  },
};

export default barbersAPI;
