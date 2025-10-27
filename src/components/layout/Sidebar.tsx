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
  CreditCard,
  Smartphone
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AnimatedIcon } from '../ui/animated-icon';
import { usePreloadOnHover } from '../lazy/LazyComponents';
import { usePerformance } from '../../hooks/usePerformance';
import { useEffect, useRef, useState } from 'react';

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
    { id: 'mobile-test', label: '🧪 Teste Mobile', icon: Smartphone, animation: 'bounce' as const, category: 'system' as const },
    { id: 'settings', label: 'Configurações', icon: Settings, animation: 'spin' as const, category: 'system' as const },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, animation: 'scale' as const, category: 'stats' as const },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, animation: 'bounce' as const, category: 'calendar' as const },
    { id: 'clients', label: 'Clientes', icon: Users, animation: 'wiggle' as const, category: 'user' as const },
    { id: 'barbers', label: 'Barbeiros', icon: User, animation: 'float' as const, category: 'user' as const },
    { id: 'services', label: 'Serviços', icon: Scissors, animation: 'cut' as const, category: 'interactive' as const },
    { id: 'profile', label: 'Perfil da Barbearia', icon: Building2, animation: 'float' as const, category: 'user' as const },
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance for swipe gesture
  const minSwipeDistance = 50;

  // Performance monitoring
  const { measureAction, measureAsyncAction } = usePerformance('Sidebar');
  const { preloadComponent } = usePreloadOnHover();

  const handleLogout = () => {
    measureAsyncAction('logout', async () => {
      logout();
      toast.success('Logout realizado com sucesso!');
    });
  };

  // Handle swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isOpen) {
      onToggle();
    }
  };

  // Handle escape key and click outside with improved mobile support
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        // Don't close if clicking on the menu toggle button
        const target = e.target as Element;
        if (!target.closest('[data-sidebar-toggle]')) {
          onToggle();
        }
      }
    };

    // Add both mouse and touch events for better mobile support
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Get menu items based on user role
  const menuItems = user ? menuItemsByRole[user.role] || menuItemsByRole.admin : menuItemsByRole.admin;

  return (
    <>
      {/* Mobile overlay with improved animation */}
      {isOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onToggle();
            }
          }}
          aria-label="Fechar sidebar"
        />
      )}
      
      {/* Sidebar with enhanced animations and touch support */}
      <aside 
        ref={sidebarRef}
        className={`mobile-sidebar smooth-transition h-full bg-card border-r border-border w-64 relative z-50 transition-all duration-300 ease-in-out transform ${isOpen ? 'open' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="navigation"
        aria-label="Menu principal"
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full bg-card">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
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
                data-sidebar-toggle
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
          <nav className="flex-1 p-4 bg-card" role="navigation" aria-label="Menu de navegação">
            <ul className="space-y-2" role="menubar">
              {menuItems.map((item, index) => (
                <li key={item.id} role="none">
                  <Button
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start hover:scale-[1.02] transition-all duration-300 ease-out bg-transparent hover:bg-[#f5f5f5] dark:hover:bg-accent focus:bg-[#f5f5f5] dark:focus:bg-accent active:scale-[0.98] hover:shadow-sm"
                    onClick={() => {
                      measureAction(`navigate_to_${item.id}`, () => {
                        onTabChange(item.id);
                        // Close sidebar after navigation with smooth transition
                        if (isOpen) {
                          setTimeout(() => {
                            onToggle();
                          }, 150); // Small delay for better UX
                        }
                      });
                    }}
                    onMouseEnter={() => {
                      // Preload component on hover for better performance
                      const componentMap: Record<string, keyof typeof import('../lazy/LazyComponents')['preloadComponents']> = {
                        'dashboard': 'dashboard',
                        'appointments': 'appointments',
                        'clients': 'clients',
                        'barbers': 'barbers',
                        'services': 'services'
                      };
                      
                      const componentName = componentMap[item.id];
                      if (componentName) {
                        preloadComponent(componentName)();
                      }
                    }}
                    role="menuitem"
                    aria-label={`Navegar para ${item.label}`}
                    tabIndex={0}
                  >
                    <AnimatedIcon
                      icon={item.icon}
                      animation={item.animation}
                      category={item.category}
                      size="sm"
                      intensity={activeTab === item.id ? "high" : "medium"}
                      delay={index * 100}
                      className="mr-2"
                      aria-hidden="true"
                    />
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-card">
            <Button
              variant="ghost"
              className="w-full justify-start hover:scale-[1.02] transition-all duration-300 ease-out bg-transparent hover:bg-[#f5f5f5] dark:hover:bg-accent focus:bg-[#f5f5f5] dark:focus:bg-accent active:scale-[0.98] hover:shadow-sm"
              onClick={handleLogout}
              role="button"
              aria-label="Fazer logout da aplicação"
              tabIndex={0}
            >
              <AnimatedIcon
                icon={LogOut}
                animation="shake"
                category="action"
                size="sm"
                intensity="medium"
                className="mr-2"
                aria-hidden="true"
              />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
