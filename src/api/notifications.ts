import { del, get, post } from './http';

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export const notificationsAPI = {
  list: () => get<ApiNotification[]>('/notifications'),
  async read(id: string): Promise<void> { await post<void>(`/notifications/${id}/read`); },
  async readAll(): Promise<void> { await post<void>('/notifications/read-all'); },
  async delete(id: string): Promise<void> { await del<void>(`/notifications/${id}`); },
};
export default notificationsAPI;
