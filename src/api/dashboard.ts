import { get } from './http';
import { appointmentsAPI } from './appointments';
import { barbershopsAPI } from './barbershops';

function mapAppointmentCard(raw: any) {
  return {
    id: raw.id,
    clientName: raw.client?.name ?? 'Cliente',
    service: raw.service?.name ?? 'Serviço',
    time: raw.time ?? (raw.startsAt ? new Date(raw.startsAt).toISOString().slice(11, 16) : ''),
    date: raw.date ?? (raw.startsAt ? String(raw.startsAt).slice(0, 10) : ''),
    status: raw.status,
    barberName: raw.barber?.name,
    price: raw.price ?? 0,
  };
}

export const dashboardAPI = {
  async getStats(userRole?: string, _userId?: string): Promise<any> {
    if (userRole === 'super_admin') {
      return this.getSuperAdminStats();
    }

    if (userRole === 'barber') {
      const [stats, upcoming] = await Promise.all([
        get<{ appointmentsToday: number; upcoming: number }>('/dashboard/barber'),
        appointmentsAPI.getUpcomingAppointments(),
      ]);
      return {
        todayAppointments: stats.appointmentsToday ?? 0,
        weeklyRevenue: 0,
        totalClients: 0,
        completionRate: 0,
        upcomingAppointments: upcoming.slice(0, 8).map(mapAppointmentCard),
        recentClients: [],
        raw: stats,
      };
    }

    const [stats, upcoming] = await Promise.all([
      get<{ appointmentsToday: number; clients: number; barbers: number; services: number }>('/dashboard/stats'),
      appointmentsAPI.getUpcomingAppointments(),
    ]);

    return {
      todayAppointments: stats.appointmentsToday ?? 0,
      weeklyRevenue: 0,
      totalClients: stats.clients ?? 0,
      completionRate: 0,
      upcomingAppointments: upcoming.slice(0, 8).map(mapAppointmentCard),
      recentClients: [],
      barbers: stats.barbers ?? 0,
      services: stats.services ?? 0,
      raw: stats,
    };
  },

  async getGlobalStats(): Promise<any> {
    return get('/dashboard/global');
  },

  async getBarbershopStats(_tenantId?: string): Promise<any> {
    return this.getStats('admin');
  },

  async getBarberStats(_barberId?: string): Promise<any> {
    return this.getStats('barber');
  },

  async getClientStats(_clientId?: string): Promise<any> {
    const upcoming = await appointmentsAPI.getUpcomingAppointments();
    return {
      todayAppointments: upcoming.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length,
      weeklyRevenue: 0,
      totalClients: 1,
      completionRate: 0,
      upcomingAppointments: upcoming.slice(0, 8).map(mapAppointmentCard),
      recentClients: [],
    };
  },

  async getDashboardData(_userId: string, role: string, tenantId?: string): Promise<any> {
    const data = await this.getStats(role, _userId);
    return {
      type: role === 'super_admin' ? 'global' : role === 'barber' ? 'barber' : 'barbershop',
      data,
      tenantId,
    };
  },

  async getRealTimeMetrics(_tenantId?: string): Promise<any> {
    return get('/dashboard/realtime');
  },

  async getMonthlyReport(_tenantId?: string, year?: number, month?: number): Promise<any> {
    return get('/dashboard/monthly', { query: { year, month } });
  },

  async getSuperAdminStats(): Promise<any> {
    const [global, tenants, revenue] = await Promise.all([
      get<{ tenants: number; pending: number; approved: number; users: number }>('/dashboard/global'),
      barbershopsAPI.getAll().catch(() => [] as any[]),
      get<{ activeSubscriptions?: number; trialSubscriptions?: number; estimatedMrr?: number }>(
        '/billing/revenue'
      ).catch(() => ({ estimatedMrr: 0 })),
    ]);

    const recentTenants = [...tenants]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8)
      .map((tenant) => ({
        ...tenant,
        businessName: tenant.businessName || tenant.name || 'Barbearia',
        monthlyRevenue: Number(tenant.monthlyRevenue ?? 0),
      }));

    const totalTenants = global.tenants ?? tenants.length;
    const activeTenants = global.approved ?? tenants.filter((t) => t.status === 'approved').length;
    const pendingApprovals = global.pending ?? tenants.filter((t) => t.status === 'pending').length;
    const monthlyRevenue = Number(revenue.estimatedMrr ?? 0);
    const conversionRate =
      totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 1000) / 10 : 0;

    return {
      totalTenants,
      activeTenants,
      pendingApprovals,
      totalUsers: global.users ?? 0,
      monthlyRevenue,
      conversionRate,
      recentTenants,
      revenueByMonth: [],
      // aliases usados em outras telas
      tenants: totalTenants,
      pending: pendingApprovals,
      approved: activeTenants,
      users: global.users ?? 0,
    };
  },
};

export default dashboardAPI;
