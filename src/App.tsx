import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthForm } from './components/auth/AuthForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
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
import { ServiceList } from './components/services/ServiceList';
import { ServiceForm } from './components/services/ServiceForm';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Appointment, Client, Barber, Service } from './types';
import './components/layout/layout.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { mounted } = useTheme();
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

  const titles = useMemo(() => ({
    dashboard: user?.role === 'super_admin' ? 'Super Dashboard' : 'Dashboard',
    appointments: 'Agendamentos',
    clients: 'Clientes',
    barbers: 'Barbeiros',
    services: 'Serviços',
    settings: 'Configurações',
    profile: 'Meu Perfil',
    tenants: 'Barbearias',
    users: 'Usuários',
    billing: 'Faturamento',
  }), [user?.role]);

  // Form handlers - moved to top to comply with Rules of Hooks
  const handleCreateAppointment = useCallback(() => {
    setEditingAppointment(undefined);
    setShowAppointmentForm(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  }, []);

  const handleSaveAppointment = useCallback(() => {
    if (editingAppointment) {
      toast.success('Agendamento atualizado com sucesso!');
    } else {
      toast.success('Agendamento criado com sucesso!');
    }
    setShowAppointmentForm(false);
    setEditingAppointment(undefined);
  }, [editingAppointment]);

  const handleCreateClient = useCallback(() => {
    setEditingClient(undefined);
    setShowClientForm(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  }, []);

  const handleSaveClient = useCallback(() => {
    if (editingClient) {
      toast.success('Cliente atualizado com sucesso!');
    } else {
      toast.success('Cliente cadastrado com sucesso!');
    }
    setShowClientForm(false);
    setEditingClient(undefined);
  }, [editingClient]);

  const handleCreateBarber = useCallback(() => {
    setEditingBarber(undefined);
    setShowBarberForm(true);
  }, []);

  const handleEditBarber = useCallback((barber: Barber) => {
    setEditingBarber(barber);
    setShowBarberForm(true);
  }, []);

  const handleSaveBarber = useCallback((barberData: Partial<Barber>) => {
    if (editingBarber) {
      toast.success('Barbeiro atualizado com sucesso!');
    } else {
      toast.success('Barbeiro cadastrado com sucesso!');
    }
    setShowBarberForm(false);
    setEditingBarber(undefined);
  }, [editingBarber]);

  const handleCreateService = useCallback(() => {
    setEditingService(undefined);
    setShowServiceForm(true);
  }, []);

  const handleEditService = useCallback((service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  }, []);

  const handleSaveService = useCallback((serviceData: Partial<Service>) => {
    if (editingService) {
      toast.success('Serviço atualizado com sucesso!');
    } else {
      toast.success('Serviço cadastrado com sucesso!');
    }
    setShowServiceForm(false);
    setEditingService(undefined);
  }, [editingService]);

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
      switch (activeTab) {
        case 'dashboard':
        case 'tenants':
        case 'users':
        case 'billing':
          return <SuperAdminDashboard activeSection={activeTab} />;
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
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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

  // Early returns after all hooks
  if (isLoading || !mounted) {
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
    return <AuthForm />;
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
          {user?.role !== 'super_admin' && user?.role !== 'barber' && <TrialBanner />}
          {renderContent()}
        </main>
      </div>

      <Toaster position="top-right" />
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