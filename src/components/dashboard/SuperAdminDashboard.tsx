import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { UserManagement } from '../admin/UserManagement';
import { TenantCrudDialog } from '../admin/TenantCrudDialog';
import { AnimatedIcon } from '../ui/animated-icon';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Ban,
  Play,
} from 'lucide-react';
import { SuperAdminStats, Tenant } from '../../types';
import { toast } from 'sonner';

import { dashboardAPI, barbershopsAPI } from '../../api';

interface SuperAdminDashboardProps {
  activeSection?: string;
}

export function SuperAdminDashboard({ activeSection = 'dashboard' }: SuperAdminDashboardProps) {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  
  // Map sidebar sections to internal tabs
  const getTabFromSection = (section: string) => {
    switch (section) {
      case 'dashboard': return 'overview';
      case 'tenants': return 'tenants';
      case 'users': return 'users';
      case 'billing': return 'revenue';
      default: return 'overview';
    }
  };
  
  const [activeTab, setActiveTab] = useState(() => getTabFromSection(activeSection));
  
  // Update active tab when section changes
  React.useEffect(() => {
    setActiveTab(getTabFromSection(activeSection));
  }, [activeSection]);

  // Load data via API
  React.useEffect(() => {
    const loadSuperAdminData = async () => {
      try {
        setLoading(true);
        
        // Load super admin stats
        const superAdminStats = await dashboardAPI.getSuperAdminStats();
        setStats(superAdminStats);
        
        // Load all tenants
        const allTenants = await barbershopsAPI.getAll();
        setTenants(allTenants);
        
      } catch (error) {
        console.error('Erro ao carregar dados do super admin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuperAdminData();
  }, []);

  const filteredTenants = tenants.filter((tenant) => {
    const term = searchTerm.toLowerCase();
    const businessName = (tenant.businessName || tenant.name || '').toLowerCase();
    const name = (tenant.name || '').toLowerCase();
    const email = (tenant.email || '').toLowerCase();
    return businessName.includes(term) || name.includes(term) || email.includes(term);
  });

  const pendingTenants = filteredTenants.filter(t => t.status === 'pending');

  const handleApproveTenant = async (tenantId: string) => {
    try {
      await barbershopsAPI.approve(tenantId);
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === tenantId
            ? { ...tenant, status: 'approved' as const, approvedAt: new Date().toISOString() }
            : tenant
        )
      );
      toast.success('Barbearia aprovada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao aprovar barbearia.');
    }
  };

  const handleRejectTenant = async (tenantId: string) => {
    try {
      await barbershopsAPI.reject(tenantId);
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === tenantId ? { ...tenant, status: 'cancelled' as const } : tenant
        )
      );
      toast.success('Solicitação rejeitada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao rejeitar barbearia.');
    }
  };

  const handleSuspendTenant = async (tenantId: string) => {
    try {
      await barbershopsAPI.suspend(tenantId);
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === tenantId ? { ...tenant, status: 'suspended' as const } : tenant
        )
      );
      toast.success('Barbearia suspensa.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao suspender barbearia.');
    }
  };

  const handleReactivateTenant = async (tenantId: string) => {
    try {
      await barbershopsAPI.reactivate(tenantId);
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === tenantId ? { ...tenant, status: 'approved' as const } : tenant
        )
      );
      toast.success('Barbearia reativada.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao reativar barbearia.');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      approved: { variant: 'default' as const, label: 'Ativo', icon: CheckCircle },
      suspended: { variant: 'destructive' as const, label: 'Suspenso', icon: Ban },
      cancelled: { variant: 'outline' as const, label: 'Cancelado', icon: XCircle }
    };
    
    const config = variants[status as keyof typeof variants] ?? variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <AnimatedIcon
          icon={Icon}
          animation="pulse"
          category="admin"
          size="sm"
          intensity="low"
        />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value?: number | null) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value ?? 0));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do super admin...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do super admin</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Gerencie todas as barbearias e monitore a plataforma
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({pendingTenants.length})
            </TabsTrigger>
            <TabsTrigger value="tenants">Barbearias</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Barbearias</CardTitle>
                    <AnimatedIcon
                      icon={Building2}
                      animation="float"
                      category="navigation"
                      size="sm"
                      intensity="medium"
                      className="text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTenants ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeTenants ?? 0} ativas
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                    <AnimatedIcon
                      icon={Clock}
                      animation="pulse"
                      category="calendar"
                      size="sm"
                      intensity="medium"
                      className="text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                    <p className="text-xs text-muted-foreground">
                      Aguardando aprovação
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                    <AnimatedIcon
                      icon={Users}
                      animation="wiggle"
                      category="user"
                      size="sm"
                      intensity="medium"
                      className="text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Em todas as barbearias
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                    <AnimatedIcon
                      icon={DollarSign}
                      animation="scale"
                      category="stats"
                      size="sm"
                      intensity="high"
                      className="text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.monthlyRevenue)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <AnimatedIcon
                        icon={TrendingUp}
                        animation="bounce"
                        category="stats"
                        size="sm"
                        intensity="medium"
                        className="mr-1"
                      />
                      <span>{stats.conversionRate}% conversão</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle>Barbearias Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(stats.recentTenants ?? []).slice(0, 5).map((tenant, index) => (
                      <motion.div 
                        key={tenant.id} 
                        className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                        whileHover={{ x: 5, scale: 1.01 }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center hover:scale-110 transition-transform duration-200">
                          {tenant.logo ? (
                            <img
                              src={tenant.logo}
                              alt={tenant.businessName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AnimatedIcon
                              icon={Building2}
                              animation="float"
                              category="navigation"
                              size="md"
                              intensity="low"
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{tenant.businessName || tenant.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {tenant.name} • {tenant.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(tenant.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tenant.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Aprovações Pendentes</CardTitle>
                  <CardDescription>
                    Barbearias aguardando aprovação para usar a plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTenants.map((tenant, index) => (
                      <motion.div 
                        key={tenant.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center hover:scale-110 transition-transform duration-200">
                              {tenant.logo ? (
                                <img
                                  src={tenant.logo}
                                  alt={tenant.businessName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AnimatedIcon
                                  icon={Building2}
                                  animation="float"
                                  category="navigation"
                                  size="lg"
                                  intensity="medium"
                                  className="text-muted-foreground"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{tenant.businessName}</h4>
                              <p className="text-sm text-muted-foreground">{tenant.name}</p>
                              <p className="text-sm text-muted-foreground">{tenant.email}</p>
                              <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                              <p className="text-sm text-muted-foreground">{tenant.address}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Solicitado em: {formatDate(tenant.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveTenant(tenant.id)}
                              className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200"
                            >
                              <AnimatedIcon
                                icon={CheckCircle}
                                animation="pulse"
                                category="action"
                                size="sm"
                                intensity="medium"
                                className="mr-1"
                              />
                              Aprovar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="hover:scale-105 transition-all duration-200"
                                >
                                  <AnimatedIcon
                                    icon={XCircle}
                                    animation="shake"
                                    category="action"
                                    size="sm"
                                    intensity="high"
                                    className="mr-1"
                                  />
                                  Rejeitar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja rejeitar a solicitação de "{tenant.businessName}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRejectTenant(tenant.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Rejeitar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {pendingTenants.length === 0 && (
                      <motion.div 
                        className="text-center py-8 text-muted-foreground"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <AnimatedIcon
                          icon={CheckCircle}
                          animation="sparkle"
                          category="action"
                          size="xl"
                          intensity="high"
                          className="mx-auto mb-4 text-green-500"
                        />
                        <p>Nenhuma aprovação pendente no momento!</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Todas as Barbearias</CardTitle>
                      <CardDescription>
                        Gerencie todas as barbearias cadastradas na plataforma
                      </CardDescription>
                    </div>
                    <div className="relative w-full max-w-72 sm:w-72">
                      <AnimatedIcon
                        icon={Search}
                        animation="pulse"
                        category="action"
                        size="sm"
                        intensity="low"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="Buscar barbearias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barbearia</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Usuários</TableHead>
                        <TableHead>Receita</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.map((tenant) => (
                        <TableRow 
                          key={tenant.id}
                          className="hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setTenantDialogOpen(true);
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                {tenant.logo ? (
                                  <img
                                    src={tenant.logo}
                                    alt={tenant.businessName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <AnimatedIcon
                                    icon={Building2}
                                    animation="float"
                                    category="navigation"
                                    size="sm"
                                    intensity="low"
                                    className="text-muted-foreground"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{tenant.businessName}</p>
                                <p className="text-sm text-muted-foreground">{tenant.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tenant.name}</p>
                              <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(tenant.status)}
                          </TableCell>
                          <TableCell>{tenant.totalUsers}</TableCell>
                          <TableCell>{formatCurrency(tenant.monthlyRevenue)}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(tenant.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center space-x-2">
                              {tenant.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleSuspendTenant(tenant.id)}
                                  className="hover:scale-105 transition-transform"
                                  title="Suspender"
                                >
                                  <AnimatedIcon
                                    icon={Ban}
                                    animation="shake"
                                    category="action"
                                    size="sm"
                                    intensity="high"
                                  />
                                </Button>
                              )}
                              {tenant.status === 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleReactivateTenant(tenant.id)}
                                  className="hover:scale-105 transition-transform"
                                  title="Reativar"
                                >
                                  <AnimatedIcon
                                    icon={Play}
                                    animation="pulse"
                                    category="action"
                                    size="sm"
                                    intensity="medium"
                                  />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <UserManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle>Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(stats.monthlyRevenue)}
                    </div>
                    <p className="text-muted-foreground">Este mês</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle>Taxa de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.conversionRate}%</div>
                    <p className="text-muted-foreground">Trial para Pago</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle>Próximos Vencimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-muted-foreground">Próximos 7 dias</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Status das integrações de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors hover:scale-101">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
                          <AnimatedIcon
                            icon={DollarSign}
                            animation="scale"
                            category="stats"
                            size="md"
                            intensity="high"
                            className="text-purple-600"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-sm text-muted-foreground">
                            Processamento de pagamentos
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="hover:scale-105 transition-transform">
                        Ativo
                      </Badge>
                    </div>
                    
                    <motion.div 
                      className="p-4 bg-muted rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <p className="text-sm text-muted-foreground">
                        💡 <strong>Dica:</strong> As configurações do Stripe estão prontas para 
                        integração. Adicione suas chaves da API para ativar cobranças automáticas.
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <TenantCrudDialog
        tenant={selectedTenant}
        open={tenantDialogOpen}
        onOpenChange={setTenantDialogOpen}
        onSaved={(updated) => {
          setTenants((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
          setSelectedTenant(updated);
        }}
      />
    </motion.div>
  );
}