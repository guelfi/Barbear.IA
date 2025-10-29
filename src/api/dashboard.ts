import dashboardStatsData from '../database/dashboard-stats.json';
import appointmentsData from '../database/appointments.json';
import usersData from '../database/users.json';
import indexesData from '../database/indexes.json';
import clientsData from '../database/clients.json';
import barbersData from '../database/barbers.json';
import servicesData from '../database/services.json';

interface DashboardStats {
    totalAppointments: number;
    completedAppointments: number;
    scheduledAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageRating?: number;
    topBarber?: any;
    topService?: any;
    recentAppointments: any[];
}

const simulateNetworkDelay = (min: number = 400, max: number = 800): Promise<void> => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

const logDashboardEvent = (event: string, data: any) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        data,
        url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    console.log(`[DASHBOARD API] ${event}:`, data);

    // Salvar no sessionStorage para ProductionDebugPanel
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        try {
            const existingLogs = sessionStorage.getItem('dashboard_debug');
            const logs = existingLogs ? JSON.parse(existingLogs) : [];
            logs.push(logEntry);

            // Manter apenas os últimos 50 logs
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }

            sessionStorage.setItem('dashboard_debug', JSON.stringify(logs));
        } catch (error) {
            console.error('[DASHBOARD API] Erro ao salvar log:', error);
        }
    }
};

// Função para enriquecer appointments com dados de client, barber e service
const enrichAppointments = (appointments: any[]) => {
    return appointments.map(appointment => {
        const client = clientsData.clients.find(c => c.id === appointment.clientId) || 
                      usersData.users.find(u => u.id === appointment.clientId);
        const barber = barbersData.barbers.find(b => b.id === appointment.barberId) ||
                      usersData.users.find(u => u.id === appointment.barberId);
        const service = servicesData.services.find(s => s.id === appointment.serviceId);

        return {
            ...appointment,
            client: client ? {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                avatar: client.avatar
            } : {
                id: appointment.clientId,
                name: 'Cliente não encontrado',
                email: '',
                phone: '',
                avatar: null
            },
            barber: barber ? {
                id: barber.id,
                name: barber.name,
                email: barber.email,
                phone: barber.phone,
                avatar: barber.avatar
            } : {
                id: appointment.barberId,
                name: 'Barbeiro não encontrado',
                email: '',
                phone: '',
                avatar: null
            },
            service: service ? {
                id: service.id,
                name: service.name,
                description: service.description,
                duration: service.duration,
                price: service.price,
                category: service.category,
                updatedAt: service.updatedAt
            } : {
                id: appointment.serviceId,
                name: 'Serviço não encontrado',
                description: '',
                duration: 30,
                price: appointment.price || 0,
                category: 'outros',
                updatedAt: new Date().toISOString()
            }
        };
    });
};

export const dashboardAPI = {
    /**
     * Obter estatísticas globais (Super Admin)
     */
    async getGlobalStats(): Promise<any> {
        logDashboardEvent('GET_GLOBAL_STATS', {});
        await simulateNetworkDelay();

        try {
            const stats = dashboardStatsData.globalStats;
            logDashboardEvent('GLOBAL_STATS_SUCCESS', { totalBarbershops: stats.totalBarbershops });
            return stats;
        } catch (error) {
            logDashboardEvent('GLOBAL_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
            throw new Error('Erro ao obter estatísticas globais');
        }
    },

    /**
     * Obter estatísticas de uma barbearia (Admin)
     */
    async getBarbershopStats(tenantId: string): Promise<DashboardStats> {
        logDashboardEvent('GET_BARBERSHOP_STATS', { tenantId });
        await simulateNetworkDelay();

        try {
            const stats = (dashboardStatsData.barbershopStats as any)[tenantId];

            if (!stats) {
                throw new Error('Barbearia não encontrada');
            }

            logDashboardEvent('BARBERSHOP_STATS_SUCCESS', {
                tenantId,
                totalAppointments: stats.totalAppointments
            });

            return stats;
        } catch (error) {
            logDashboardEvent('BARBERSHOP_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido', tenantId });
            throw error;
        }
    },

    /**
     * Obter estatísticas de um barbeiro (Barber)
     */
    async getBarberStats(barberId: string): Promise<any> {
        logDashboardEvent('GET_BARBER_STATS', { barberId });
        await simulateNetworkDelay();

        try {
            const stats = (dashboardStatsData.barberStats as any)[barberId];

            if (!stats) {
                throw new Error('Barbeiro não encontrado');
            }

            logDashboardEvent('BARBER_STATS_SUCCESS', {
                barberId,
                totalAppointments: stats.totalAppointments
            });

            return stats;
        } catch (error) {
            logDashboardEvent('BARBER_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido', barberId });
            throw error;
        }
    },

    /**
     * Obter estatísticas de um cliente (Client)
     */
    async getClientStats(clientId: string): Promise<any> {
        logDashboardEvent('GET_CLIENT_STATS', { clientId });
        await simulateNetworkDelay();

        try {
            const stats = (dashboardStatsData.clientStats as any)[clientId];

            if (!stats) {
                throw new Error('Cliente não encontrado');
            }

            logDashboardEvent('CLIENT_STATS_SUCCESS', {
                clientId,
                totalAppointments: stats.totalAppointments
            });

            return stats;
        } catch (error) {
            logDashboardEvent('CLIENT_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido', clientId });
            throw error;
        }
    },

    /**
     * Obter dados para dashboard baseado no role do usuário
     */
    async getDashboardData(userId: string, role: string, tenantId?: string): Promise<any> {
        logDashboardEvent('GET_DASHBOARD_DATA', { userId, role, tenantId });
        await simulateNetworkDelay();

        try {
            let dashboardData;

            switch (role) {
                case 'super_admin':
                    dashboardData = {
                        type: 'global',
                        data: await this.getGlobalStats(),
                        barbershops: dashboardStatsData.barbershopStats
                    };
                    break;

                case 'admin':
                    if (!tenantId) throw new Error('TenantId é obrigatório para admin');
                    dashboardData = {
                        type: 'barbershop',
                        data: await this.getBarbershopStats(tenantId),
                        tenantId
                    };
                    break;

                case 'barber':
                    // Encontrar barberId baseado no userId
                    const barberId = Object.keys(dashboardStatsData.barberStats)
                        .find(id => (dashboardStatsData.barberStats as any)[id].name === usersData.users.find(u => u.id === userId)?.name);

                    if (!barberId) throw new Error('Dados do barbeiro não encontrados');

                    dashboardData = {
                        type: 'barber',
                        data: await this.getBarberStats(barberId),
                        barberId
                    };
                    break;

                case 'client':
                    // Encontrar clientId baseado no userId
                    const clientId = Object.keys(dashboardStatsData.clientStats)
                        .find(id => (dashboardStatsData.clientStats as any)[id].name === usersData.users.find(u => u.id === userId)?.name);

                    if (!clientId) throw new Error('Dados do cliente não encontrados');

                    dashboardData = {
                        type: 'client',
                        data: await this.getClientStats(clientId),
                        clientId
                    };
                    break;

                default:
                    throw new Error('Role não suportado');
            }

            logDashboardEvent('DASHBOARD_DATA_SUCCESS', {
                userId,
                role,
                type: dashboardData.type
            });

            return dashboardData;

        } catch (error) {
            logDashboardEvent('DASHBOARD_DATA_ERROR', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                userId,
                role,
                tenantId
            });
            throw error;
        }
    },

    /**
     * Obter relatórios mensais
     */
    async getMonthlyReport(tenantId?: string, year: number = 2025, month: number = 10): Promise<any> {
        logDashboardEvent('GET_MONTHLY_REPORT', { tenantId, year, month });
        await simulateNetworkDelay();

        try {
            const monthKey = `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase().replace(' ', '')}`;

            if (tenantId) {
                const barbershopStats = (dashboardStatsData.barbershopStats as any)[tenantId];
                const monthlyData = barbershopStats?.monthlyStats?.[monthKey as any];

                return {
                    tenantId,
                    month: monthKey,
                    data: monthlyData || {
                        appointments: 0,
                        revenue: 0,
                        newClients: 0,
                        completionRate: 0
                    }
                };
            } else {
                // Relatório global
                const globalData = {
                    appointments: 0,
                    revenue: 0,
                    newClients: 0,
                    completionRate: 0
                };

                Object.values(dashboardStatsData.barbershopStats).forEach(stats => {
                    const monthlyData = (stats.monthlyStats as any)?.[monthKey];
                    if (monthlyData) {
                        globalData.appointments += monthlyData.appointments;
                        globalData.revenue += monthlyData.revenue;
                        globalData.newClients += monthlyData.newClients;
                    }
                });

                return {
                    month: monthKey,
                    data: globalData
                };
            }

        } catch (error) {
            logDashboardEvent('MONTHLY_REPORT_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
            throw new Error('Erro ao obter relatório mensal');
        }
    },

    /**
     * Obter estatísticas do dashboard baseado na role do usuário
     */
    async getStats(userRole: string, userId: string): Promise<any> {
        logDashboardEvent('GET_STATS', { userRole, userId });
        await simulateNetworkDelay();

        try {
            const user = usersData.users.find(u => u.id === userId);
            if (!user) {
                logDashboardEvent('USER_NOT_FOUND', { userId });
                throw new Error('Usuário não encontrado');
            }

            logDashboardEvent('USER_FOUND', { userId, role: user.role, tenantId: user.tenantId });

            let filteredStats;

            switch (userRole) {
                case 'super_admin':
                    // Super admin vê dados globais
                    const globalStats = dashboardStatsData.globalStats;
                    filteredStats = {
                        todayAppointments: globalStats.totalAppointments,
                        weeklyRevenue: globalStats.totalRevenue,
                        totalClients: globalStats.totalUsers,
                        completionRate: 85, // Simulado
                        upcomingAppointments: enrichAppointments(
                            appointmentsData.appointments.filter((apt: any) => 
                                apt.status === 'scheduled'
                            ).slice(0, 5)
                        ),
                        recentClients: usersData.users.filter((u: any) => u.role === 'client').slice(0, 5)
                    };
                    break;

                case 'admin':
                case 'barber':
                    // Admin e barber veem dados da sua barbearia
                    logDashboardEvent('LOADING_TENANT_STATS', { tenantId: user.tenantId, availableKeys: Object.keys(dashboardStatsData.barbershopStats) });
                    const tenantStats = dashboardStatsData.barbershopStats[user.tenantId as keyof typeof dashboardStatsData.barbershopStats];
                    if (!tenantStats) {
                        logDashboardEvent('TENANT_STATS_NOT_FOUND', { tenantId: user.tenantId, availableKeys: Object.keys(dashboardStatsData.barbershopStats) });
                        throw new Error(`Dados da barbearia não encontrados para tenantId: ${user.tenantId}`);
                    }
                    logDashboardEvent('TENANT_STATS_FOUND', { tenantId: user.tenantId, tenantStats });

                    const tenantAppointments = appointmentsData.appointments.filter((apt: any) => 
                        apt.tenantId === user.tenantId
                    );
                    const tenantClients = usersData.users.filter((u: any) => 
                        u.role === 'client' && u.tenantId === user.tenantId
                    );

                    filteredStats = {
                        todayAppointments: tenantStats.scheduledAppointments,
                        weeklyRevenue: tenantStats.monthlyRevenue,
                        totalClients: tenantStats.totalClients,
                        completionRate: Math.round((tenantStats.completedAppointments / tenantStats.totalAppointments) * 100),
                        upcomingAppointments: enrichAppointments(
                            tenantAppointments.filter((apt: any) => apt.status === 'scheduled')
                        ),
                        recentClients: tenantClients
                    };

                    // Se for barbeiro, filtra apenas seus dados
                    if (userRole === 'barber') {
                        const barberStats = dashboardStatsData.barberStats[userId as keyof typeof dashboardStatsData.barberStats];
                        if (barberStats) {
                            filteredStats.todayAppointments = barberStats.scheduledAppointments;
                            filteredStats.weeklyRevenue = barberStats.monthlyRevenue;
                            filteredStats.upcomingAppointments = enrichAppointments(
                                tenantAppointments.filter((apt: any) => 
                                    apt.barberId === userId && apt.status === 'scheduled'
                                )
                            );
                        }
                    }
                    break;

                case 'client':
                    // Cliente vê apenas seus próprios dados
                    logDashboardEvent('LOADING_CLIENT_STATS', { userId, availableKeys: Object.keys(dashboardStatsData.clientStats) });
                    const clientStats = dashboardStatsData.clientStats[userId as keyof typeof dashboardStatsData.clientStats];
                    if (!clientStats) {
                        logDashboardEvent('CLIENT_STATS_NOT_FOUND', { userId, availableKeys: Object.keys(dashboardStatsData.clientStats) });
                        throw new Error(`Dados do cliente não encontrados para userId: ${userId}`);
                    }
                    logDashboardEvent('CLIENT_STATS_FOUND', { userId, clientStats });

                    // Buscar appointments reais do cliente
                    const clientAppointments = appointmentsData.appointments.filter((apt: any) => 
                        apt.clientId === userId && apt.status === 'scheduled'
                    );

                    filteredStats = {
                        todayAppointments: clientStats.scheduledAppointments,
                        weeklyRevenue: 0, // Cliente não vê receita
                        totalClients: 0, // Cliente não vê total de clientes
                        completionRate: Math.round((clientStats.completedAppointments / clientStats.totalAppointments) * 100),
                        upcomingAppointments: enrichAppointments(clientAppointments),
                        recentClients: [] // Cliente não vê outros clientes
                    };
                    break;

                default:
                    throw new Error(`Role não reconhecida: ${userRole}`);
            }

            logDashboardEvent('GET_STATS_SUCCESS', { userRole, statsCount: Object.keys(filteredStats).length });
            return filteredStats;

        } catch (error) {
            logDashboardEvent('GET_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
            throw error;
        }
    },

    /**
     * Obter estatísticas do super admin
     */
    async getSuperAdminStats(): Promise<any> {
        logDashboardEvent('GET_SUPER_ADMIN_STATS', {});
        await simulateNetworkDelay();

        try {
            const globalStats = dashboardStatsData.globalStats;
            
            // Construir estatísticas do super admin baseadas nos dados disponíveis
            const superAdminStats = {
                totalTenants: globalStats.totalBarbershops,
                activeTenants: globalStats.activeSubscriptions,
                pendingApprovals: globalStats.trialSubscriptions,
                totalUsers: globalStats.totalUsers,
                monthlyRevenue: globalStats.totalRevenue,
                conversionRate: 78.5, // Simulado
                recentTenants: Object.entries(dashboardStatsData.barbershopStats).map(([id, stats]: [string, any]) => ({
                    id,
                    name: stats.name,
                    businessName: stats.name,
                    status: 'approved',
                    createdAt: '2024-01-15T14:20:00Z',
                    totalUsers: stats.totalBarbers + stats.totalClients,
                    totalAppointments: stats.totalAppointments,
                    monthlyRevenue: stats.monthlyRevenue
                })),
                revenueByMonth: [
                    { month: 'Jan', revenue: globalStats.totalRevenue * 0.8 },
                    { month: 'Fev', revenue: globalStats.totalRevenue * 0.9 },
                    { month: 'Mar', revenue: globalStats.totalRevenue }
                ]
            };
            
            logDashboardEvent('GET_SUPER_ADMIN_STATS_SUCCESS', { 
                totalTenants: superAdminStats.totalTenants,
                totalUsers: superAdminStats.totalUsers 
            });
            
            return superAdminStats;

        } catch (error) {
            logDashboardEvent('GET_SUPER_ADMIN_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
            throw new Error('Erro ao obter estatísticas do super admin');
        }
    },

    /**
     * Obter métricas em tempo real
     */
    async getRealTimeMetrics(tenantId?: string): Promise<{
        todayAppointments: number;
        todayRevenue: number;
        activeBarbers: number;
        waitingClients: number;
    }> {
        logDashboardEvent('GET_REALTIME_METRICS', { tenantId });
        await simulateNetworkDelay(100, 300);

        try {
            const today = new Date().toISOString().split('T')[0];
            let todayAppointments = appointmentsData.appointments.filter(apt =>
                apt.date === today &&
                (tenantId ? apt.tenantId === tenantId : true)
            );

            const metrics = {
                todayAppointments: todayAppointments.filter(apt => apt.status === 'scheduled').length,
                todayRevenue: todayAppointments
                    .filter(apt => apt.status === 'completed')
                    .reduce((sum, apt) => sum + apt.price, 0),
                activeBarbers: tenantId ?
                    ((indexesData.relationships.barbersByTenant as any)[tenantId]?.length || 0) :
                    indexesData.counters.totalBarbers,
                waitingClients: Math.floor(Math.random() * 5) // Simulado
            };

            logDashboardEvent('REALTIME_METRICS_SUCCESS', metrics);
            return metrics;

        } catch (error) {
            logDashboardEvent('REALTIME_METRICS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
            throw new Error('Erro ao obter métricas em tempo real');
        }
    }
};

export default dashboardAPI;