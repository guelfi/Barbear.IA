# Design Document - Sistema de Notificações Aprimorado

## Overview

O design aprimorado do sistema de notificações foca na melhoria da experiência do usuário através de uma interface mais intuitiva, responsiva e acessível. O sistema mantém a arquitetura existente baseada em React com TypeScript, expandindo as funcionalidades de interação e melhorando a apresentação visual.

## Architecture

### Componente Principal
- **NotificationDropdown**: Componente principal que gerencia o estado e renderização das notificações
- **Header**: Componente que contém o trigger (sininho) e gerencia a visibilidade do dropdown

### Estado e Dados
```typescript
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
```

### Fluxo de Dados
1. **Estado Local**: Gerenciado via useState no componente NotificationDropdown
2. **Ações**: markAsRead, markAllAsRead, deleteNotification
3. **Feedback**: Toast notifications para confirmação de ações

## Components and Interfaces

### NotificationDropdown Component

#### Props Interface
```typescript
interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### Funcionalidades Principais
- **Renderização Condicional**: Exibe apenas quando isOpen é true
- **Overlay**: Camada de fundo para fechar o dropdown
- **Lista Scrollável**: Container com altura máxima e scroll interno
- **Interações**: Click handlers para marcar como lido e remover

### NotificationCard Component (Interno)

#### Estrutura Visual
```
┌─────────────────────────────────────┐
│ [Ícone] [Título]           [•] [×]  │
│         [Mensagem]                  │
│         [Timestamp] [Avatar][Nome]  │
└─────────────────────────────────────┘
```

#### Estados Visuais
- **Não Lida**: Fundo azul claro + ponto azul + texto normal
- **Lida**: Fundo normal + texto acinzentado
- **Hover**: Fundo destacado + botão de remoção visível

### Header Integration

#### Trigger Button
```typescript
<Button variant="ghost" size="icon" className="relative">
  <Bell className="h-4 w-4" />
  {unreadCount > 0 && (
    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500">
      {unreadCount}
    </Badge>
  )}
</Button>
```

## Data Models

### Notification Types e Ícones
```typescript
const notificationIcons = {
  appointment: Calendar,    // Azul (#2563eb)
  payment: DollarSign,     // Verde (#16a34a)
  client: User,            // Roxo (#9333ea)
  system: AlertCircle,     // Laranja (#ea580c)
  reminder: Clock          // Amarelo (#ca8a04)
};
```

### Priority Colors
```typescript
const priorityColors = {
  high: 'border-l-red-500',      // Vermelho
  medium: 'border-l-yellow-500', // Amarelo
  low: 'border-l-gray-300'       // Cinza
};
```

### Timestamp Formatting
```typescript
const formatTimestamp = (timestamp: Date) => {
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
};
```

## Error Handling

### Estados de Erro
1. **Lista Vazia**: Exibe estado vazio com ícone e mensagem
2. **Falha na Ação**: Toast de erro para ações que falharam
3. **Dados Inválidos**: Validação de props e fallbacks

### Tratamento de Exceções
```typescript
const handleNotificationAction = (action: () => void, errorMessage: string) => {
  try {
    action();
    toast.success('Ação realizada com sucesso');
  } catch (error) {
    toast.error(errorMessage);
    console.error('Notification action failed:', error);
  }
};
```

## Testing Strategy

### Unit Tests
- **Renderização**: Testa se componentes renderizam corretamente
- **Estados**: Verifica mudanças de estado (lido/não lido)
- **Interações**: Testa clicks e ações do usuário
- **Formatação**: Valida formatação de timestamps e dados

### Integration Tests
- **Header Integration**: Testa integração com componente Header
- **Toast Integration**: Verifica funcionamento dos toasts
- **Theme Integration**: Testa compatibilidade com temas claro/escuro

### Accessibility Tests
- **Keyboard Navigation**: Navegação por teclado
- **Screen Reader**: Compatibilidade com leitores de tela
- **Color Contrast**: Contraste adequado de cores
- **Focus Management**: Gerenciamento de foco

### Performance Tests
- **Large Lists**: Performance com muitas notificações
- **Memory Leaks**: Verificação de vazamentos de memória
- **Render Optimization**: Otimização de re-renderizações

## Responsive Design

### Breakpoints
- **Desktop (≥768px)**: Largura fixa de 320px
- **Tablet (≥640px)**: Largura de 300px
- **Mobile (<640px)**: Largura de 280px com padding reduzido

### Layout Adaptations
```css
/* Desktop */
.notification-dropdown {
  width: 320px;
  max-height: 400px;
}

/* Mobile */
@media (max-width: 640px) {
  .notification-dropdown {
    width: 280px;
    max-height: 350px;
  }
  
  .notification-card {
    padding: 12px;
  }
}
```

## Accessibility Features

### ARIA Labels
```typescript
<Button 
  aria-label={`${unreadCount} notificações não lidas`}
  aria-expanded={isOpen}
  aria-haspopup="true"
>
```

### Keyboard Support
- **Enter/Space**: Abre/fecha dropdown
- **Escape**: Fecha dropdown
- **Tab**: Navega entre notificações
- **Enter**: Marca como lida

### Screen Reader Support
- **Live Regions**: Anúncio de mudanças de estado
- **Semantic HTML**: Uso correto de elementos semânticos
- **Alt Text**: Descrições para ícones e avatares

## Performance Optimizations

### Memoization
```typescript
const MemoizedNotificationCard = React.memo(NotificationCard);
```

### Virtual Scrolling (Futuro)
Para listas com mais de 50 notificações, implementar virtual scrolling para melhor performance.

### Lazy Loading
Carregar notificações em batches conforme necessário.

## Theme Integration

### CSS Variables
```css
:root {
  --notification-bg: hsl(var(--background));
  --notification-border: hsl(var(--border));
  --notification-unread: hsl(var(--primary) / 0.1);
}

[data-theme="dark"] {
  --notification-unread: hsl(var(--primary) / 0.2);
}
```

### Dynamic Classes
Uso do sistema de classes do Tailwind com suporte a dark mode através do prefixo `dark:`.

## Future Enhancements

### Real-time Updates
- WebSocket connection para notificações em tempo real
- Push notifications para dispositivos móveis

### Advanced Filtering
- Filtros por tipo de notificação
- Busca dentro das notificações
- Agrupamento por data

### Customization
- Preferências de notificação por usuário
- Configuração de sons e vibrações
- Temas personalizados para notificações