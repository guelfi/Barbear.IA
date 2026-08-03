import { useState, useCallback, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { AnimatedIcon } from '../ui/animated-icon';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { useTenantWriteAccess } from '../../hooks/useTenantWriteAccess';
import { notificationsAPI } from '../../api/notifications';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { isSuspended } = useTenantWriteAccess();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const items = await notificationsAPI.list();
      setUnreadCount(items.filter((n) => !n.isRead).length);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    void refreshUnread();
    const id = window.setInterval(() => void refreshUnread(), 60_000);
    return () => window.clearInterval(id);
  }, [refreshUnread]);

  const handleNotificationToggle = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setShowNotifications(false);
    void refreshUnread();
  }, [refreshUnread]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showNotifications) {
      setShowNotifications(false);
      void refreshUnread();
    }
  }, [showNotifications, refreshUnread]);

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
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-semibold truncate">{title}</h1>
            {isSuspended && (
              <span
                className="shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-yellow-400 text-yellow-950"
                title="Barbearia suspensa — apenas leitura"
              >
                Suspensa
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`relative hover:scale-105 transition-all duration-200 ${showNotifications ? 'bg-muted/80' : ''}`}
              onClick={handleNotificationToggle}
              onKeyDown={handleKeyDown}
              aria-label={`${unreadCount} notificações não lidas`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <AnimatedIcon
                icon={Bell}
                animation={unreadCount > 0 ? 'bounce' : 'none'}
                category="action"
                size="sm"
                intensity="medium"
                className="text-foreground hover:text-red-600 transition-colors duration-200"
              />
              {unreadCount > 0 && (
                <div className="notification-badge absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg">
                  <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </div>
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
