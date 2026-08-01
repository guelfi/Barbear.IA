import { del, get, post, put } from './http';

interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tenantId: string;
  dateOfBirth?: string;
  address?: any;
  preferences?: any;
  totalAppointments: number;
  totalSpent: number;
  lastVisit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const map = (raw: any): Client => ({
  ...raw,
  avatar: raw.avatarUrl ?? raw.avatar ?? '',
  tenantId: raw.tenantId ?? '',
  preferences: raw.preferences ?? {},
  totalAppointments: raw.totalAppointments ?? 0,
  totalSpent: Number(raw.totalSpent ?? 0),
  isActive: raw.isActive ?? true,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
});

export const clientsAPI = {
  async getAll(): Promise<Client[]> {
    return (await get<any[]>('/clients')).map(map);
  },
  async getClients(tenantId?: string, search?: string): Promise<Client[]> {
    return (await get<any[]>('/clients', { query: { tenantId, search } })).map(map);
  },
  async getClientById(id: string): Promise<Client> {
    const found = (await this.getAll()).find((item) => item.id === id);
    if (!found) throw new Error('Cliente não encontrado.');
    return found;
  },
  async createClient(
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalAppointments' | 'totalSpent'>
  ): Promise<Client> {
    const created = await post<{ id: string }>('/clients', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: typeof data.preferences === 'string' ? data.preferences : undefined,
      userId: data.userId || null,
    });
    return this.getClientById(created.id);
  },
  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    await put(`/clients/${id}`, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      notes: typeof updates.preferences === 'string' ? updates.preferences : undefined,
    });
    return this.getClientById(id);
  },
  async deleteClient(id: string): Promise<boolean> {
    await del<void>(`/clients/${id}`);
    return true;
  },
};

export default clientsAPI;
