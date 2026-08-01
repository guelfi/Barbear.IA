import { del, get, post, put } from './http';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const map = (raw: any): Service => ({
  ...raw,
  description: raw.description ?? '',
  duration: raw.durationMinutes ?? raw.duration ?? 30,
  price: Number(raw.price ?? 0),
  category: raw.category ?? 'geral',
  tenantId: raw.tenantId ?? '',
  isActive: raw.isActive ?? true,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? new Date().toISOString(),
});

export const servicesAPI = {
  async getAll(): Promise<Service[]> {
    return (await get<any[]>('/services')).map(map);
  },
  async getServices(tenantId?: string, category?: string): Promise<Service[]> {
    const items = (await get<any[]>('/services', { query: { tenantId } })).map(map);
    return category ? items.filter((service) => service.category === category) : items;
  },
  async getServiceById(id: string): Promise<Service> {
    const found = (await this.getAll()).find((item) => item.id === id);
    if (!found) throw new Error('Serviço não encontrado.');
    return found;
  },
  async createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const created = await post<{ id: string }>('/services', {
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      durationMinutes: data.duration,
    });
    return this.getServiceById(created.id);
  },
  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const current = await this.getServiceById(id);
    await put(`/services/${id}`, {
      name: updates.name ?? current.name,
      description: updates.description ?? current.description,
      category: updates.category ?? current.category,
      price: updates.price ?? current.price,
      durationMinutes: updates.duration ?? current.duration,
    });
    return this.getServiceById(id);
  },
  async deleteService(id: string): Promise<boolean> {
    await del<void>(`/services/${id}`);
    return true;
  },
  async getServiceCategories(tenantId?: string): Promise<string[]> {
    const services = await this.getServices(tenantId);
    return [...new Set(services.map((service) => service.category))];
  },
};

export default servicesAPI;
