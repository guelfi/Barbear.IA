import { get, post, put } from './http';

interface Barbershop {
  id: string; name: string; email: string; phone: string; address: any; businessHours: any; settings: any;
  subscription: any; isActive: boolean; createdAt: string; updatedAt: string;
}
const map = (raw: any): any => ({
  ...raw, id: raw.id, name: raw.name, businessName: raw.businessName ?? raw.name, address: raw.address ?? '',
  phone: raw.phone ?? '', email: raw.email ?? '', settings: raw.settings ?? {}, subscription: raw.subscription ?? null,
  status: String(raw.status ?? (raw.isActive === false ? 'suspended' : 'approved')).toLowerCase(),
  isActive: raw.isActive ?? String(raw.status ?? '').toLowerCase() === 'approved',
  createdAt: raw.createdAt ?? new Date().toISOString(), updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
});
export const barbershopsAPI = {
  async getAll(): Promise<any[]> {
    const page = await get<{ items?: any[] } | any[]>('/tenants', { query: { pageSize: 100 } });
    return (Array.isArray(page) ? page : page.items ?? []).map(map);
  },
  async getBarbershops(): Promise<Barbershop[]> { return (await this.getAll()).map(map); },
  async getBarbershopById(id: string): Promise<Barbershop> { return map(await get<any>(`/tenants/${id}`)); },
  async createBarbershop(_data: Omit<Barbershop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Barbershop> {
    throw new Error('Criação de barbearia ocorre via POST /auth/register/barbershop.');
  },
  async updateBarbershop(id: string, updates: Partial<Barbershop>): Promise<Barbershop> {
    return map(await put<any>(`/tenants/${id}`, {
      name: updates.name ?? updates.businessName,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      businessHours: (updates as any).businessHours,
    }));
  },
  async approve(id: string): Promise<boolean> { await post(`/tenants/${id}/approve`); return true; },
  async reject(id: string): Promise<boolean> { await post(`/tenants/${id}/reject`); return true; },
  async suspend(id: string): Promise<boolean> { await post(`/tenants/${id}/suspend`); return true; },
  async reactivate(id: string): Promise<boolean> { await post(`/tenants/${id}/reactivate`); return true; },
  async updateSettings(id: string, settings: Record<string, unknown>): Promise<any> { return put(`/tenants/${id}/settings`, settings); },
};
export default barbershopsAPI;
