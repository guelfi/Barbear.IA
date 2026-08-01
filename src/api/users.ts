import { get, post, put } from './http';

interface User {
  id: string; name: string; email: string; role: 'super_admin' | 'admin' | 'barber' | 'client';
  tenantId?: string; avatar: string; phone: string; isActive: boolean; createdAt: string; lastLogin: string;
}
interface UserFilters { tenantId?: string; role?: string; isActive?: boolean; search?: string; }
interface PaginationOptions { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }
type Page = { items?: User[]; users?: User[]; total?: number; page?: number; pageSize?: number };

function mapUser(raw: any): User {
  return { ...raw, avatar: raw.avatarUrl ?? raw.avatar ?? '', phone: raw.phone ?? '', isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? new Date().toISOString(), lastLogin: raw.lastLoginAt ?? raw.lastLogin ?? '' };
}

export const usersAPI = {
  async getAll(): Promise<Omit<User, 'password'>[]> {
    const page = await get<Page | User[]>('/users', { query: { pageSize: 100 } });
    return (Array.isArray(page) ? page : page.items ?? page.users ?? []).map(mapUser);
  },
  async getUsers(filters: UserFilters = {}, pagination: PaginationOptions = {}) {
    const page = await get<Page | User[]>('/users', { query: { ...filters, page: pagination.page, pageSize: pagination.limit, sortBy: pagination.sortBy, sortOrder: pagination.sortOrder } });
    const users = (Array.isArray(page) ? page : page.items ?? page.users ?? []).map(mapUser);
    const metadata = Array.isArray(page) ? {} : page;
    const limit = (pagination.limit ?? metadata.pageSize ?? users.length) || 1;
    const total = metadata.total ?? users.length;
    return { users, total, page: pagination.page ?? metadata.page ?? 1, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  },
  async getUserById(id: string) {
    const users = await this.getAll();
    const found = users.find((user) => user.id === id);
    if (!found) throw new Error('Usuário não encontrado.');
    return found;
  },
  async getUserByEmail(email: string) {
    const { users } = await this.getUsers({ search: email }, { limit: 100 });
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }) { return mapUser(await post<any>('/users', userData)); },
  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) { return mapUser(await put<any>(`/users/${id}`, updates)); },
  async activateUser(id: string) { await post<void>(`/users/${id}/activate`); return true; },
  async deactivateUser(id: string) { await post<void>(`/users/${id}/deactivate`); return true; },
  async getUserStats(tenantId?: string) { return get<{ total: number; byRole: Record<string, number>; active: number; inactive: number }>('/users/stats', { query: { tenantId } }); },
  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) { return this.updateUser(id, updates); },
};
export default usersAPI;
