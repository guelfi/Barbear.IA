import { 
  Calendar,
  Users,
  Scissors,
  Settings,
  BarChart3,
  User,
  LogOut,
  Menu,
  Building2,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AnimatedIcon } from '../ui/animated-icon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Menu items based on user role with animation configs
const menuItemsByRole = {
  super_admin: [
    { id: 'dashboard', label: 'Super Dashboard', icon: BarChart3, animation: 'sparkle' as const, category: 'stats' as const },
    { id: 'tenants', label: 'Barbearias', icon: Building2, animation: 'float' as const, category: 'navigation' as const },
    { id: 'users', label: 'Usuários', icon: Users, animation: 'wiggle' as const, category: 'user' as const },
    { id: 'billing', label: 'Faturamento', icon: CreditCard, animation: 'pulse' as const, category: 'action' as const },
    { id: 'settings', label: 'Configurações', icon: Settings, animation: 'spin' as const, category: 'system' as const },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, animation: 'scale' as const, category: 'stats' as const },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, animation: 'bounce' as const, category: 'calendar' as const },
    { id: 'clients', label: 'Clientes', icon: Users, animation: 'wiggle' as const, category: 'user' as const },
    { id: 'barbers', label: 'Barbeiros', icon: User, animation: 'float' as const, category: 'user' as const },
    { id: 'services', label: 'Serviços', icon: Scissors, animation: 'cut' as const, category: 'interactive' as const },
    { id: 'settings', label: 'Configurações', icon: Settings, animation: 'spin' as const, category: 'system' as const },
  ],
  barber: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, animation: 'scale' as const, category: 'stats' as const },
    { id: 'appointments', label: 'Meus Agendamentos', icon: Calendar, animation: 'bounce' as const, category: 'calendar' as const },
    { id: 'clients', label: 'Meus Clientes', icon: Users, animation: 'wiggle' as const, category: 'user' as const },
    { id: 'services', label: 'Meus Serviços', icon: Scissors, animation: 'cut' as const, category: 'interactive' as const },
    { id: 'settings', label: 'Perfil', icon: Settings, animation: 'spin' as const, category: 'system' as const },
  ],
  client: [
    { id: 'dashboard', label: 'Início', icon: BarChart3, animation: 'scale' as const, category: 'stats' as const },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, animation: 'bounce' as const, category: 'calendar' as const },
    { id: 'barbershops', label: 'Barbearias', icon: Scissors, animation: 'cut' as const, category: 'interactive' as const },
    { id: 'profile', label: 'Meu Perfil', icon: User, animation: 'float' as const, category: 'user' as const },
  ]
};

export function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  // Get menu items based on user role
  const menuItems = user ? menuItemsByRole[user.role] || menuItemsByRole.admin : menuItemsByRole.admin;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 z-30 h-full bg-card border-r border-border transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-0
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <AnimatedIcon
                  icon={Scissors}
                  animation="cut"
                  category="interactive"
                  size="lg"
                  intensity="high"
                  className="text-primary transition-colors duration-300 group-hover:text-primary/80"
                />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary/50 transition-all duration-300">
                  Barbear.IA
                </h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onToggle}
              >
                <AnimatedIcon
                  icon={Menu}
                  animation="wiggle"
                  category="navigation"
                  size="sm"
                  intensity="medium"
                />
              </Button>
            </div>
            
            {user && (
              <div className="mt-4 flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start hover:scale-[1.02] transition-all duration-200"
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  >
                    <AnimatedIcon
                      icon={item.icon}
                      animation={item.animation}
                      category={item.category}
                      size="sm"
                      intensity={activeTab === item.id ? "high" : "medium"}
                      delay={index * 100}
                      className="mr-2"
                    />
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-[1.02] transition-all duration-200"
              onClick={handleLogout}
            >
              <AnimatedIcon
                icon={LogOut}
                animation="shake"
                category="action"
                size="sm"
                intensity="medium"
                className="mr-2"
              />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}