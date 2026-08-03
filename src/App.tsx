import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthForm } from './components/auth/AuthForm';
import { LandingPage } from './components/marketing/LandingPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClientHome } from './components/dashboard/ClientHome';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TrialBanner } from './components/subscription/TrialBanner';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { AppointmentForm } from './components/appointments/AppointmentForm';
import { ClientList } from './components/clients/ClientList';
import { ClientForm } from './components/clients/ClientForm';
import { ClientProfile } from './components/clients/ClientProfile';
import { BarberList } from './components/barbers/BarberList';
import { BarberForm } from './components/barbers/BarberForm';
import { BarberProfile } from './components/barbers/BarberProfile';
import { BarbershopProfile } from './components/barbershop/BarbershopProfile';
import { ClientBarbershops } from './components/barbershop/ClientBarbershops';
import { ServiceList } from './components/services/ServiceList';
import { ServiceForm } from './components/services/ServiceForm';
import { Toaster } from './components/ui/sonner';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { AccessibilityChecker } from './components/accessibility/AccessibilityChecker';
import { toast } from 'sonner';
import { Appointment, Client, Barber, Service } from './types';
import { servicesAPI } from './api';
import { useTenantWriteAccess } from './hooks/useTenantWriteAccess';
import './components/layout/layout.css';

type GuestView = 'landing' | 'auth';

function AppContent() {
  const { user, isInitializing, isLoading, hasPermission } = useAuth();
  const { mounted } = useTheme();
  const { guardWrite } = useTenantWriteAccess();
  const [guestView, setGuestView] = useState<GuestView>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [editingBarber, setEditingBarber] = useState<Barber | undefined>();
  const [editingService, setEditingService] = useState<Service | undefined>();

  console.log('App: Estado atual:', {
    user: user ? { email: user.email, role: user.role } : null,
    isInitializing,
    isLoading,
    mounted,
    activeTab
  });

  const titles = useMemo(() => ({
    dashboard:
      user?.role === 'super_admin'
        ? 'Dashboard'
        : user?.role === 'client'
          ? 'Início'
          : 'Dashboard',
    appointments: 'Agendamentos',
    clients: 'Clientes',
    barbers: 'Barbeiros',
    services: 'Serviços',
    settings: 'Configurações',
    profile: 'Meu Perfil',
    tenants: 'Barbearias',
    barbershops: 'Barbearias',
    users: 'Usuários',
    billing: 'Faturamento',
  }), [user?.role]);

  // Form handlers - moved to top to comply with Rules of Hooks
  const handleCreateAppointment = useCallback(() => {
    if (!guardWrite()) return;
    setEditingAppointment(undefined);
    setShowAppointmentForm(true);
  }, [guardWrite]);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    if (!guardWrite()) return;
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  }, [guardWrite]);

  const handleSaveAppointment = useCallback(() => {
    if (!guardWrite()) return;
    if (editingAppointment) {
      toast.success('Agendamento atualizado com sucesso!');
    } else {
      toast.success('Agendamento criado com sucesso!');
    }
    setShowAppointmentForm(false);
    setEditingAppointment(undefined);
  }, [editingAppointment, guardWrite]);

  const handleCreateClient = useCallback(() => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_clients')) {
      toast.error('Barbeiros não podem cadastrar ou editar clientes.');
      return;
    }
    setEditingClient(undefined);
    setShowClientForm(true);
  }, [guardWrite, hasPermission]);

  const handleEditClient = useCallback((client: Client) => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_clients')) {
      toast.error('Barbeiros não podem cadastrar ou editar clientes.');
      return;
    }
    setEditingClient(client);
    setShowClientForm(true);
  }, [guardWrite, hasPermission]);

  const handleSaveClient = useCallback(() => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_clients')) {
      toast.error('Barbeiros não podem cadastrar ou editar clientes.');
      return;
    }
    if (editingClient) {
      toast.success('Cliente atualizado com sucesso!');
    } else {
      toast.success('Cliente cadastrado com sucesso!');
    }
    setShowClientForm(false);
    setEditingClient(undefined);
  }, [editingClient, guardWrite, hasPermission]);

  const handleCreateBarber = useCallback(() => {
    if (!guardWrite()) return;
    setEditingBarber(undefined);
    setShowBarberForm(true);
  }, [guardWrite]);

  const handleEditBarber = useCallback((barber: Barber) => {
    if (!guardWrite()) return;
    setEditingBarber(barber);
    setShowBarberForm(true);
  }, [guardWrite]);

  const handleSaveBarber = useCallback((_barberData: Partial<Barber>) => {
    if (!guardWrite()) return;
    if (editingBarber) {
      toast.success('Barbeiro atualizado com sucesso!');
    } else {
      toast.success('Barbeiro cadastrado com sucesso!');
    }
    setShowBarberForm(false);
    setEditingBarber(undefined);
  }, [editingBarber, guardWrite]);

  const handleCreateService = useCallback(() => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_services')) {
      toast.error('Sem permissão para cadastrar ou editar serviços.');
      return;
    }
    setEditingService(undefined);
    setShowServiceForm(true);
  }, [guardWrite, hasPermission]);

  const handleEditService = useCallback((service: Service) => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_services')) {
      toast.error('Sem permissão para cadastrar ou editar serviços.');
      return;
    }
    setEditingService(service);
    setShowServiceForm(true);
  }, [guardWrite, hasPermission]);

  const handleSaveService = useCallback(async (serviceData: Partial<Service>) => {
    if (!guardWrite()) return;
    if (!hasPermission('manage_services')) {
      toast.error('Sem permissão para cadastrar ou editar serviços.');
      return;
    }
    try {
      if (editingService) {
        await servicesAPI.updateService(editingService.id, serviceData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await servicesAPI.createService({
          name: serviceData.name || '',
          description: serviceData.description || '',
          duration: serviceData.duration || 30,
          price: serviceData.price || 0,
          category: serviceData.category || 'Corte',
          tenantId: user?.tenantId || '',
          isActive: serviceData.isActive ?? true,
        });
        toast.success('Serviço cadastrado com sucesso!');
      }
      setShowServiceForm(false);
      setEditingService(undefined);
      setActiveTab('services');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar serviço.');
    }
  }, [editingService, user?.tenantId, guardWrite, hasPermission]);

  const handleCancel = useCallback(() => {
    setShowAppointmentForm(false);
    setShowClientForm(false);
    setShowBarberForm(false);
    setShowServiceForm(false);
    setEditingAppointment(undefined);
    setEditingClient(undefined);
    setEditingBarber(undefined);
    setEditingService(undefined);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const renderContent = useCallback(() => {
    console.log('App: renderContent chamado:', { 
      showAppointmentForm, 
      showClientForm, 
      showBarberForm, 
      showServiceForm,
      userRole: user?.role,
      activeTab 
    });

    if (showAppointmentForm) {
      return (
        <AppointmentForm
          appointment={editingAppointment}
          onSave={handleSaveAppointment}
          onCancel={handleCancel}
        />
      );
    }

    if (showClientForm) {
      return (
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={handleCancel}
        />
      );
    }

    if (showBarberForm) {
      return (
        <BarberForm
          barber={editingBarber}
          onSave={handleSaveBarber}
          onCancel={handleCancel}
        />
      );
    }

    if (showServiceForm) {
      return (
        <ServiceForm
          service={editingService}
          onSave={handleSaveService}
          onCancel={handleCancel}
        />
      );
    }

    // Super Admin Routes
    if (user?.role === 'super_admin') {
      console.log('App: Renderizando SuperAdminDashboard para:', activeTab);
      switch (activeTab) {
        case 'dashboard':
        case 'tenants':
        case 'users':
        case 'billing':
          return <SuperAdminDashboard activeSection={activeTab} />;
        case 'services':
          return (
            <ServiceList
              onCreateService={handleCreateService}
              onEditService={handleEditService}
            />
          );
        case 'settings':
          return (
            <div className="text-center py-12">
              <h3>Configurações do Sistema</h3>
              <p className="text-muted-foreground">
                Configurações globais da plataforma em desenvolvimento
              </p>
            </div>
          );
        default:
          return <SuperAdminDashboard activeSection="dashboard" />;
      }
    }

    // Regular user routes
    console.log('App: Renderizando conteúdo para usuário regular:', { userRole: user?.role, activeTab, userId: user?.id, tenantId: user?.tenantId });
    switch (activeTab) {
      case 'dashboard':
        return user?.role === 'client' ? <ClientHome /> : <Dashboard />;
      case 'appointments':
        return (
          <AppointmentCalendar
            onCreateAppointment={handleCreateAppointment}
            onEditAppointment={handleEditAppointment}
          />
        );
      case 'clients':
        return (
          <ClientList
            onCreateClient={handleCreateClient}
            onEditClient={handleEditClient}
          />
        );
      case 'barbers':
        return (
          <BarberList
            onCreateBarber={handleCreateBarber}
            onEditBarber={handleEditBarber}
          />
        );
      case 'services':
        return (
          <ServiceList
            onCreateService={handleCreateService}
            onEditService={handleEditService}
          />
        );
      case 'barbershops':
        return user?.role === 'client' ? <ClientBarbershops /> : <Dashboard />;
      case 'profile':
        // Para admin (barbearia) mostra perfil da barbearia, para cliente mostra perfil do cliente
        return user?.role === 'admin' ? <BarbershopProfile /> : <ClientProfile />;
      case 'settings':
        // Para barbeiro mostra perfil do barbeiro, para outros mostra configurações
        return user?.role === 'barber' ? <BarberProfile /> : (
          <div className="text-center py-12">
            <h3>Configurações</h3>
            <p className="text-muted-foreground">
              Área de configurações em desenvolvimento
            </p>
          </div>
        );

      default:
        return <Dashboard />;
    }
  }, [
    showAppointmentForm,
    showClientForm,
    showBarberForm,
    showServiceForm,
    editingAppointment,
    editingClient,
    editingBarber,
    editingService,
    user?.role,
    activeTab,
    handleCreateAppointment,
    handleEditAppointment,
    handleCreateClient,
    handleEditClient,
    handleCreateBarber,
    handleEditBarber,
    handleCreateService,
    handleEditService,
    handleSaveAppointment,
    handleSaveClient,
    handleSaveBarber,
    handleSaveService,
    handleCancel
  ]);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth >= 1024) {
      setSidebarOpen(false);
    }
  }, [activeTab, sidebarOpen]);

  const currentTitle = titles[activeTab as keyof typeof titles] || 'Dashboard';

  // Splash só no bootstrap — login/register usam isLoading sem desmontar o AuthForm
  if (isInitializing || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (guestView === 'landing') {
      return (
        <LandingPage
          onEnter={() => {
            setAuthTab('login');
            setGuestView('auth');
          }}
          onStartTrial={() => {
            setAuthTab('register');
            setGuestView('auth');
          }}
        />
      );
    }

    return (
      <AuthForm
        key={authTab}
        initialTab={authTab}
        onBackToLanding={() => setGuestView('landing')}
      />
    );
  }

  return (
    <div className="sidebar-layout bg-background text-foreground">
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />
      </div>

      <div className="main-content">
        <Header
          title={currentTitle}
          onMenuToggle={handleSidebarToggle}
        />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {user?.role === 'admin' && <TrialBanner />}
          <ErrorBoundary fallbackTitle="Falha ao carregar o conteúdo">
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

      <Toaster position="top-right" />
      <InstallPrompt />
      {import.meta.env.DEV && <AccessibilityChecker />}
    </div>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Carregando aplicação...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}
