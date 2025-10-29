import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { MaterialCard, MaterialCardContent, MaterialCardHeader, MaterialCardTitle } from '../ui/material-card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { dashboardAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { DashboardStats } from '../../types';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'no-show': 'bg-red-100 text-red-800',
};

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  'in-progress': 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  'no-show': 'Não Compareceu',
};

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sistema de debug melhorado para produção
  const debugLog = (message: string, data?: any) => {
    // Usar alert em produção para garantir visibilidade
    if (process.env.NODE_ENV === 'production') {
      console.log(`[DASHBOARD DEBUG] ${message}`, data);
      // Adicionar também ao sessionStorage para análise posterior
      const debugLogs = JSON.parse(sessionStorage.getItem('dashboard_debug') || '[]');
      debugLogs.push({
        timestamp: new Date().toISOString(),
        message,
        data: data ? JSON.stringify(data) : null,
        url: window.location.href
      });
      // Manter apenas os últimos 50 logs
      if (debugLogs.length > 50) {
        debugLogs.splice(0, debugLogs.length - 50);
      }
      sessionStorage.setItem('dashboard_debug', JSON.stringify(debugLogs));
    } else {
      console.log(`[DASHBOARD DEBUG] ${message}`, data);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        debugLog('Iniciando carregamento do dashboard', {
          user: user ? { email: user.email, role: user.role } : null,
          environment: process.env.NODE_ENV,
          url: window.location.href,
          localStorage: {
            token: localStorage.getItem('token'),
            userEmail: localStorage.getItem('userEmail'),
            userRole: localStorage.getItem('userRole')
          }
        });
    
        // Verificar se o usuário está autenticado
        if (!user) {
          const errorMsg = 'Usuário não autenticado - redirecionando para login';
          debugLog(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }
    
        // Verificar se a role do usuário é válida
        if (!user.role) {
          const errorMsg = 'Role do usuário não definida';
          debugLog(errorMsg, { user });
          setError(errorMsg);
          setLoading(false);
          return;
        }
    
        debugLog('Usuário validado, carregando dados mockados', { role: user.role });
    
        // Carregar dados via API simulada baseados na role do usuário
        debugLog('Carregando dados via API simulada', { role: user.role, userId: user.id, tenantId: user.tenantId });
        
        const dashboardData = await dashboardAPI.getStats(user.role, user.id);
    
        debugLog('Dados carregados com sucesso', {
          role: user.role,
          userId: user.id,
          tenantId: user.tenantId,
          dataKeys: Object.keys(dashboardData || {}),
          appointmentsCount: dashboardData?.upcomingAppointments?.length || 0,
          dashboardData: dashboardData
        });

        if (!dashboardData) {
          throw new Error('Nenhum dado retornado pela API');
        }
    
        setStats(dashboardData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dashboard';
        debugLog('Erro ao carregar dashboard', { 
          error: errorMessage, 
          stack: err instanceof Error ? err.stack : null,
          user: user ? { id: user.id, role: user.role, tenantId: user.tenantId } : null
        });
        console.error('Dashboard Error:', err);
        
        // Em caso de erro, mostrar dados vazios em vez de erro
        setStats({
          todayAppointments: 0,
          weeklyRevenue: 0,
          totalClients: 0,
          completionRate: 0,
          upcomingAppointments: [],
          recentClients: []
        });
        
        // Ainda definir o erro para debug
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    loadDashboardData();
  }, [user]);

  // Função para exibir logs de debug (útil para produção)
  const showDebugLogs = () => {
    const logs = sessionStorage.getItem('dashboard_debug');
    if (logs) {
      const debugWindow = window.open('', '_blank');
      if (debugWindow) {
        debugWindow.document.write(`
          <html>
            <head><title>Dashboard Debug Logs</title></head>
            <body>
              <h1>Dashboard Debug Logs</h1>
              <pre>${logs}</pre>
              <button onclick="window.close()">Fechar</button>
            </body>
          </html>
        `);
      }
    } else {
      alert('Nenhum log de debug encontrado');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro no Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Recarregar Página
              </button>
              {process.env.NODE_ENV === 'production' && (
                <button 
                  onClick={showDebugLogs} 
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Ver Logs de Debug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível</p>
          {process.env.NODE_ENV === 'production' && (
            <button 
              onClick={showDebugLogs} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ver Logs de Debug
            </button>
          )}
        </div>
      </div>
    );
  }

  // Debug logs específicos para produção
  console.log('Dashboard: Renderizando para usuário:', user?.role);
  console.log('Dashboard: Usuário completo:', user);
  console.log('Dashboard: Stats carregados via API:', stats);
  console.log('Dashboard: Ambiente:', process.env.NODE_ENV);
  console.log('Dashboard: URL atual:', window.location.href);
  console.log('Dashboard: localStorage token:', localStorage.getItem('authToken'));
  console.log('Dashboard: localStorage email:', localStorage.getItem('userEmail'));
  console.log('Dashboard: Dados da API disponíveis:', {
    hasStats: !!stats,
    todayAppointments: stats?.todayAppointments,
    upcomingAppointments: stats?.upcomingAppointments?.length,
    recentClients: stats?.recentClients?.length
  });
  
  // Verificação específica de role
  console.log('Dashboard: Verificando role do usuário:', {
    userRole: user?.role,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin',
    isBarber: user?.role === 'barber',
    isClient: user?.role === 'client'
  });
  
  // Verificação de segurança - se não há usuário, não renderiza nada
  if (!user) {
    console.error('Dashboard: Usuário não encontrado, redirecionando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // Verificação de role válido
  const validRoles = ['super_admin', 'admin', 'barber', 'client'];
  if (!validRoles.includes(user.role)) {
    console.error('Dashboard: Role inválido:', user.role);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Erro de Permissão</h2>
          <p className="text-muted-foreground">Role de usuário inválido: {user.role}</p>
        </div>
      </div>
    );
  }
  
  // Verificações de segurança para evitar erros em produção
  const safeStats = stats || {
    todayAppointments: 0,
    weeklyRevenue: 0,
    totalClients: 0,
    completionRate: 0,
    upcomingAppointments: [],
    recentClients: []
  };
  
  // Log dos stats processados
  console.log('Dashboard: Stats processados:', safeStats);
  
  // Log adicional para verificar se os dados foram processados
  console.log('Dashboard: Stats processados:', {
    todayAppointments: safeStats.todayAppointments,
    weeklyRevenue: safeStats.weeklyRevenue,
    totalClients: safeStats.totalClients,
    completionRate: safeStats.completionRate,
    upcomingAppointmentsCount: safeStats.upcomingAppointments?.length || 0,
    recentClientsCount: safeStats.recentClients?.length || 0
  });

  // Verificação final antes de renderizar
  console.log('Dashboard: Pronto para renderizar com dados:', {
    hasUser: !!user,
    userRole: user.role,
    hasStats: !!stats,
    statsValid: safeStats.todayAppointments >= 0
  });

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <StatsCard
            title="Agendamentos Hoje"
            value={safeStats.todayAppointments || 0}
            icon={Calendar}
            description="agendamentos para hoje"
            trend={{ value: 12, isPositive: true }}
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <StatsCard
            title="Receita Semanal"
            value={`R$ ${(safeStats.weeklyRevenue || 0).toFixed(2)}`}
            icon={DollarSign}
            description="últimos 7 dias"
            trend={{ value: 8, isPositive: true }}
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <StatsCard
            title="Total de Clientes"
            value={safeStats.totalClients || 0}
            icon={Users}
            description="clientes cadastrados"
            trend={{ value: 5, isPositive: true }}
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <StatsCard
            title="Taxa de Conclusão"
            value={`${safeStats.completionRate || 0}%`}
            icon={TrendingUp}
            description="agendamentos concluídos"
            trend={{ value: 2, isPositive: true }}
          />
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Próximos Agendamentos */}
        <MaterialCard elevation={2} interactive={true} hoverElevation={3} animation="slideUp">
          <MaterialCardHeader>
            <MaterialCardTitle>Próximos Agendamentos</MaterialCardTitle>
          </MaterialCardHeader>
          <MaterialCardContent className="space-y-4">
            {(safeStats.upcomingAppointments || []).map((appointment: any, index: number) => (
              <motion.div 
                key={appointment.id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-material interactive"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className="h-9 w-9 elevation-1">
                    <AvatarImage src={appointment.client.avatar} />
                    <AvatarFallback>{appointment.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {appointment.client.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.service.name} com {appointment.barber.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.time} - R$ {(appointment.price || 0).toFixed(2)}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                    {statusLabels[appointment.status as keyof typeof statusLabels]}
                  </Badge>
                </motion.div>
              </motion.div>
            ))}
          </MaterialCardContent>
        </MaterialCard>

        {/* Clientes Recentes */}
        <MaterialCard elevation={2} interactive={true} hoverElevation={3} animation="slideUp">
          <MaterialCardHeader>
            <MaterialCardTitle>Clientes Recentes</MaterialCardTitle>
          </MaterialCardHeader>
          <MaterialCardContent className="space-y-4">
            {(safeStats.recentClients || []).map((client: any, index: number) => (
              <motion.div 
                key={client.id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-material interactive"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className="h-9 w-9 elevation-1">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.totalAppointments} agendamentos
                  </p>
                </div>
                <motion.div 
                  className="text-sm text-muted-foreground"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {client.lastVisit && new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                </motion.div>
              </motion.div>
            ))}
          </MaterialCardContent>
        </MaterialCard>
      </motion.div>
    </motion.div>
  );
}
