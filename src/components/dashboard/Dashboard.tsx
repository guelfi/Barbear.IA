import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { MaterialCard, MaterialCardContent, MaterialCardHeader, MaterialCardTitle } from '../ui/material-card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { mockDashboardStatsComplete } from '../../lib/mock-data';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

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
  
  // Debug logs para produção
  console.log('Dashboard: Renderizando para usuário:', user?.role);
  console.log('Dashboard: Stats disponíveis:', mockDashboardStatsComplete);
  
  // This component should only render for non-super_admin users
  // Super admin routing is handled in App.tsx
  const stats = mockDashboardStatsComplete;
  
  // Fallback de segurança mais robusto
  if (!stats) {
    console.error('Dashboard: Stats é undefined!');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Erro no Dashboard</h3>
          <p className="text-muted-foreground">Dados não disponíveis</p>
        </div>
      </div>
    );
  }

  // Garantir que todos os valores numéricos existem
  const safeStats = {
    todayAppointments: stats.todayAppointments || 0,
    weeklyRevenue: stats.weeklyRevenue || 0,
    totalClients: stats.totalClients || 0,
    completionRate: stats.completionRate || 0,
    upcomingAppointments: stats.upcomingAppointments || [],
    recentClients: stats.recentClients || []
  };

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
            value={safeStats.todayAppointments}
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
            value={safeStats.totalClients}
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
            value={`${safeStats.completionRate}%`}
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
            {safeStats.upcomingAppointments.map((appointment, index) => (
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
                  <Badge className={statusColors[appointment.status]}>
                    {statusLabels[appointment.status]}
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
            {safeStats.recentClients.map((client, index) => (
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
