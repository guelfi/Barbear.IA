import dashboardStatsData from '../database/dashboard-stats.json';
import appointmentsData from '../database/appointments.json';
import usersData from '../database/users.json';
import indexesData from '../database/indexes.json';

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