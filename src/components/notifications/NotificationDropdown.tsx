import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    Bell,
    Calendar,
    User,
    DollarSign,
    AlertCircle,
    Clock,
    X
} from 'lucide-react';

import { toast } from 'sonner';

/**
 * Configuration for notification types including icons, colors, and labels
 * Used to maintain consistency across the notification system
 */
const NOTIFICATION_CONFIG = {
    appointment: {
        icon: Calendar,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Agendamento'
    },
    payment: {
        icon: DollarSign,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        label: 'Pagamento'
    },
    client: {
        icon: User,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: 'Cliente'
    },
    system: {
        icon: AlertCircle,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'Sistema'
    },
    reminder: {
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        label: 'Lembrete'
    }
} as const;

/**
 * Configuration for notification priorities with visual indicators
 * Defines border colors and labels for different priority levels
 */
const PRIORITY_CONFIG = {
    high: {
        border: 'border-l-red-500 dark:border-l-red-400',
        indicator: 'bg-red-500',
        label: 'Alta prioridade'
    },
    medium: {
        border: 'border-l-yellow-500 dark:border-l-yellow-400',
        indicator: 'bg-yellow-500',
        label: 'Média prioridade'
    },
    low: {
        border: 'border-l-gray-300 dark:border-l-gray-600',
        indicator: 'bg-gray-400',
        label: 'Baixa prioridade'
    }
} as const;

/**
 * Notification data structure
 * Represents a single notification with all necessary metadata
 */
interface Notification {
    id: string;
    type: 'appointment' | 'payment' | 'client' | 'system' | 'reminder';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
    avatar?: string;
    clientName?: string;
}

/**
 * Props for the NotificationDropdown component
 */
interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'appointment',
        title: 'Novo Agendamento',
        message: 'Pedro Santos agendou um corte para hoje às 14:00',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        isRead: false,
        priority: 'high',
        clientName: 'Pedro Santos'
    },
    {
        id: '2',
        type: 'payment',
        title: 'Pagamento Recebido',
        message: 'Pagamento de R$ 45,00 confirmado - João Silva',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        isRead: false,
        priority: 'medium',
        clientName: 'João Silva'
    },
    {
        id: '3',
        type: 'reminder',
        title: 'Lembrete',
        message: 'Você tem 3 agendamentos para amanhã',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        isRead: true,
        priority: 'low'
    },
    {
        id: '4',
        type: 'client',
        title: 'Novo Cliente',
        message: 'Maria Oliveira se cadastrou na plataforma',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        isRead: true,
        priority: 'medium',
        clientName: 'Maria Oliveira'
    },
    {
        id: '5',
        type: 'system',
        title: 'Atualização do Sistema',
        message: 'Nova versão disponível com melhorias de performance',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        isRead: true,
        priority: 'low'
    }
];

/**
 * Enhanced NotificationDropdown Component
 * 
 * Features:
 * - Responsive design with mobile optimization
 * - Keyboard navigation support
 * - Accessibility compliant (ARIA labels, roles)
 * - Error handling and loading states
 * - Smooth animations and transitions
 * - Priority-based visual indicators
 * - Type-specific icons and colors
 * - Smart message truncation
 * - Undo functionality for deletions
 * 
 * @param isOpen - Controls dropdown visibility
 * @param onClose - Callback to close the dropdown
 */
export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Memoized calculations for better performance
    const unreadCount = useMemo(() => 
        notifications.filter(n => !n.isRead).length, 
        [notifications]
    );

    const sortedNotifications = useMemo(() => 
        [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        [notifications]
    );

    const markAsRead = useCallback((id: string) => {
        try {
            const notification = notifications.find(n => n.id === id);
            if (!notification) {
                setError('Notificação não encontrada');
                return;
            }
            
            if (notification.isRead) return;

            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            setTimeout(() => {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === id
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                
                setIsLoading(false);
                toast.success('Notificação marcada como lida', {
                    duration: 2000,
                    position: 'bottom-right'
                });
            }, 100);
        } catch (error) {
            setIsLoading(false);
            setError('Erro ao marcar notificação como lida');
            toast.error('Erro ao marcar notificação como lida');
            console.error('Error marking notification as read:', error);
        }
    }, [notifications]);

    const markAllAsRead = useCallback(() => {
        try {
            const unreadNotifications = notifications.filter(n => !n.isRead);
            if (unreadNotifications.length === 0) {
                toast.info('Todas as notificações já foram lidas');
                return;
            }

            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            setTimeout(() => {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                
                setIsLoading(false);
                toast.success(`${unreadNotifications.length} notificações marcadas como lidas`, {
                    duration: 3000,
                    position: 'bottom-right'
                });
            }, 200);
        } catch (error) {
            setIsLoading(false);
            setError('Erro ao marcar todas as notificações como lidas');
            toast.error('Erro ao marcar todas as notificações como lidas');
            console.error('Error marking all notifications as read:', error);
        }
    }, [notifications]);

    const deleteNotification = useCallback((id: string, title: string) => {
        try {
            const notification = notifications.find(n => n.id === id);
            if (!notification) {
                setError('Notificação não encontrada');
                return;
            }

            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setIsLoading(false);
                
                toast.success(`"${title}" removida`, {
                    duration: 3000,
                    position: 'bottom-right',
                    action: {
                        label: 'Desfazer',
                        onClick: () => {
                            // Restore notification (in a real app, this would restore from a backup)
                            const deletedNotification = mockNotifications.find(n => n.id === id);
                            if (deletedNotification) {
                                setNotifications(prev => [...prev, deletedNotification]);
                                toast.success('Notificação restaurada');
                            }
                        }
                    }
                });
            }, 150);
        } catch (error) {
            setIsLoading(false);
            setError('Erro ao remover notificação');
            toast.error('Erro ao remover notificação');
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev < sortedNotifications.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev > 0 ? prev - 1 : sortedNotifications.length - 1
                );
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < sortedNotifications.length) {
                    markAsRead(sortedNotifications[focusedIndex].id);
                }
                break;
        }
    }, [isOpen, onClose, sortedNotifications, focusedIndex, markAsRead]);

    const getNotificationIcon = useCallback((type: Notification['type']) => {
        const config = NOTIFICATION_CONFIG[type];
        if (!config) {
            return <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
        }
        
        const IconComponent = config.icon;
        return <IconComponent className={`h-4 w-4 ${config.color}`} />;
    }, []);

    const getNotificationIconBackground = useCallback((type: Notification['type']) => {
        const config = NOTIFICATION_CONFIG[type];
        return config?.bgColor || 'bg-gray-100 dark:bg-gray-900/30';
    }, []);

    const getPriorityConfig = useCallback((priority: Notification['priority']) => {
        return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
    }, []);

    const formatTimestamp = useCallback((timestamp: Date) => {
        try {
            const now = new Date();
            const diff = now.getTime() - timestamp.getTime();
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(days / 7);

            if (minutes < 1) return 'Agora';
            if (minutes < 60) return `${minutes}min atrás`;
            if (hours < 24) return `${hours}h atrás`;
            if (days === 1) return 'Ontem';
            if (days < 7) return `${days}d atrás`;
            if (weeks === 1) return '1 semana atrás';
            if (weeks < 4) return `${weeks} semanas atrás`;
            
            return timestamp.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit',
                year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Data inválida';
        }
    }, []);

    const truncateMessage = useCallback((message: string, maxLength: number = 100) => {
        if (message.length <= maxLength) return message;
        
        // Find the last space before the max length to avoid cutting words
        const truncated = message.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + '...';
        }
        
        return truncated + '...';
    }, []);

    const getClientInitials = useCallback((name: string) => {
        if (!name) return '?';
        
        const names = name.trim().split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div 
                className="absolute top-full right-0 mt-2 w-80 sm:w-80 md:w-80 lg:w-80 xl:w-96 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] z-50 animate-in slide-in-from-top-2 duration-200"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-label="Painel de notificações"
                aria-modal="false"
            >
                <Card className="shadow-2xl border-2 bg-background backdrop-blur-none border-border ring-1 ring-black/10 dark:ring-white/20">
                    <CardHeader className="pb-3 px-4 pt-4 bg-muted border-b border-border">
                        <div className="flex flex-col space-y-3">
                            {/* Header com título e botão fechar */}
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center space-x-2">
                                    <Bell className="h-5 w-5 text-foreground" />
                                    <span className="font-semibold">Notificações</span>
                                    {unreadCount > 0 && (
                                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 animate-pulse">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="hover:bg-muted/80 transition-colors flex-shrink-0"
                                    aria-label="Fechar notificações"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Botão "Marcar todas como lidas" em linha separada */}
                            {unreadCount > 0 && (
                                <div className="flex justify-start">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        disabled={isLoading}
                                        className="text-xs hover:bg-muted/80 transition-colors disabled:opacity-50 px-3 py-1.5 h-auto text-muted-foreground hover:text-foreground"
                                        aria-label="Marcar todas as notificações como lidas"
                                    >
                                        {isLoading ? 'Processando...' : 'Marcar todas como lidas'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 max-h-96 sm:max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        {error ? (
                            <div className="text-center py-12 px-4">
                                <AlertCircle className="h-16 w-16 mx-auto text-red-500/60 mb-4" />
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                                    Ops! Algo deu errado
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {error}
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setError(null);
                                        setNotifications(mockNotifications);
                                    }}
                                    className="hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/20"
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        ) : sortedNotifications.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <div className="relative">
                                    <div className="animate-bounce">
                                        <Bell className="h-20 w-20 mx-auto text-muted-foreground/40 mb-6" />
                                    </div>
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
                                </div>
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    Nenhuma notificação
                                </h3>
                                <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
                                    Você está em dia com tudo! Quando houver novidades, elas aparecerão aqui.
                                </p>
                                <div className="mt-6 flex justify-center">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-500/30 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-purple-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-green-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50" role="list" aria-label="Lista de notificações">
                                {sortedNotifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className={`
                                            group relative p-3 sm:p-4 border-l-4 hover:bg-muted/60 transition-all duration-200 cursor-pointer
                                            ${getPriorityConfig(notification.priority).border}
                                            ${!notification.isRead 
                                                ? 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900' 
                                                : 'bg-background hover:bg-muted'
                                            }
                                            ${focusedIndex === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                                        `}
                                        onClick={() => markAsRead(notification.id)}
                                        role="listitem"
                                        tabIndex={focusedIndex === index ? 0 : -1}
                                        aria-label={`Notificação: ${notification.title}. ${notification.message}. ${notification.isRead ? 'Lida' : 'Não lida'}. ${formatTimestamp(notification.timestamp)}`}
                                        onFocus={() => setFocusedIndex(index)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                markAsRead(notification.id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start space-x-2 sm:space-x-3">
                                            <div className={`flex-shrink-0 mt-1 p-1.5 sm:p-2 rounded-full shadow-sm ${getNotificationIconBackground(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1 sm:gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm sm:text-sm font-semibold leading-tight ${
                                                            !notification.isRead 
                                                                ? 'text-foreground' 
                                                                : 'text-muted-foreground'
                                                        }`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                                                            !notification.isRead 
                                                                ? 'text-foreground/80' 
                                                                : 'text-muted-foreground/80'
                                                        }`}>
                                                            {truncateMessage(notification.message, window.innerWidth < 640 ? 60 : 85)}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                                        {!notification.isRead && (
                                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id, notification.title);
                                                            }}
                                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
                                                            aria-label="Remover notificação"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-border/30">
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </span>

                                                    {notification.clientName && (
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-border/50">
                                                                <AvatarImage src={notification.avatar} alt={`Avatar de ${notification.clientName}`} />
                                                                <AvatarFallback className="text-xs font-semibold bg-muted">
                                                                    {getClientInitials(notification.clientName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                                                                {notification.clientName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    {sortedNotifications.length > 0 && (
                        <div className="p-4 border-t bg-muted border-border">
                            <Button 
                                variant="outline" 
                                className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200" 
                                size="sm"
                                aria-label="Ver todas as notificações"
                            >
                                Ver Todas as Notificações
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}