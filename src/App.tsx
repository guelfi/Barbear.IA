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
import { BarberList } from './components/barbers/BarberList';
import { ServiceList } from './components/services/ServiceList';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Appointment, Client } from './types';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { mounted } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const titles = useMemo(() => ({
    dashboard: user?.role === 'super_admin' ? 'Super Dashboard' : 'Dashboard',
    appointments: 'Agendamentos',
    clients: 'Clientes',
    barbers: 'Barbeiros',
    services: 'Serviços',
    settings: 'Configurações',
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
    // Placeholder for barber creation logic
    toast.success('Barbeiro criado com sucesso!');
  }, []);

  const handleEditBarber = useCallback(() => {
    // Placeholder for barber editing logic
    toast.success('Barbeiro atualizado com sucesso!');
  }, []);

  const handleCreateService = useCallback(() => {
    // Placeholder for service creation logic
    toast.success('Serviço criado com sucesso!');
  }, []);

  const handleEditService = useCallback(() => {
    // Placeholder for service editing logic
    toast.success('Serviço atualizado com sucesso!');
  }, []);

  const handleCancel = useCallback(() => {
    setShowAppointmentForm(false);
    setShowClientForm(false);
    setEditingAppointment(undefined);
    setEditingClient(undefined);
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
      case 'settings':
        return (
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
    editingAppointment,
    editingClient,
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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      
      <div className="flex flex-col min-h-screen lg:ml-64">
        <Header
          title={currentTitle}
          onMenuToggle={handleSidebarToggle}
        />
        
        {user?.role !== 'super_admin' && user?.role !== 'barber' && <TrialBanner />}
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
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