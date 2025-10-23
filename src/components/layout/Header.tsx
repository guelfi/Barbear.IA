import { useState, useCallback } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ui/theme-toggle';
import { AnimatedIcon } from '../ui/animated-icon';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock unread count - in a real app, this would come from a context or API
  const unreadCount = 3;

  const handleNotificationToggle = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showNotifications) {
      setShowNotifications(false);
    }
  }, [showNotifications]);

  return (
    <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:scale-105 transition-transform duration-200"
            onClick={onMenuToggle}
            data-testid="sidebar-toggle"
            data-sidebar-toggle
          >
            <AnimatedIcon
              icon={Menu}
              animation="wiggle"
              category="navigation"
              size="md"
              intensity="medium"
            />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`relative hover:scale-105 transition-all duration-200 ${
                showNotifications ? 'bg-muted/80' : ''
              }`}
              onClick={handleNotificationToggle}
              onKeyDown={handleKeyDown}
              aria-label={`${unreadCount} notificações não lidas`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <AnimatedIcon
                icon={Bell}
                animation={unreadCount > 0 ? "bounce" : "none"}
                category="action"
                size="sm"
                intensity="medium"
                className="text-red-600 hover:text-red-700 transition-colors duration-200"
              />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-black bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-xl shadow-red-600/50 border-2 border-white dark:border-gray-900 ring-1 ring-red-700">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            <NotificationDropdown 
              isOpen={showNotifications}
              onClose={handleNotificationClose}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
