import { Appointment, Barber, Client, Service, DashboardStats, Tenant } from '../types';

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'João Silva',
    businessName: 'Barbearia do João',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    phone: '(11) 99999-1111',
    email: 'joao@barbeariadojoao.com',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+',
    settings: {
      workingHours: { start: '08:00', end: '18:00' },
      workingDays: [1, 2, 3, 4, 5, 6],
      appointmentDuration: 30,
      bookingAdvance: 30
    },
    subscription: {
      id: 'sub-1',
      tenantId: 'tenant-1',
      plan: 'basic',
      status: 'active',
      currentPeriodStart: '2024-02-01T00:00:00Z',
      currentPeriodEnd: '2024-03-01T00:00:00Z',
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      cancelAtPeriodEnd: false
    },
    status: 'approved',
    createdAt: '2024-01-15T14:20:00Z',
    approvedAt: '2024-01-16T09:15:00Z',
    ownerId: 'admin-1',
    totalUsers: 5,
    totalAppointments: 157,
    monthlyRevenue: 2450.00
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte de cabelo masculino tradicional',
    price: 35,
    duration: 30,
    tenantId: 'tenant1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Barba completa com navalha',
    price: 25,
    duration: 20,
    tenantId: 'tenant1',
    isActive: true,
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Corte de cabelo + barba completa',
    price: 55,
    duration: 45,
    tenantId: 'tenant1',
    isActive: true,
  },
  {
    id: '4',
    name: 'Sobrancelha',
    description: 'Design de sobrancelha masculina',
    price: 15,
    duration: 15,
    tenantId: 'tenant1',
    isActive: true,
  },
];

export const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@barbearia.com',
    phone: '(11) 98765-4321',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPg==',
    services: ['1', '2', '3'],
    schedule: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isWorking: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '16:00', isWorking: true },
      { dayOfWeek: 0, startTime: '08:00', endTime: '16:00', isWorking: false },
    ],
    tenantId: 'tenant1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos@barbearia.com',
    phone: '(11) 98765-4322',
    services: ['1', '2', '3', '4'],
    schedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', isWorking: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isWorking: true },
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isWorking: false },
    ],
    tenantId: 'tenant1',
    isActive: true,
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Pedro Santos',
    email: 'pedro@email.com',
    phone: '(11) 99999-1111',
    tenantId: 'tenant1',
    notes: 'Prefere corte mais baixo nas laterais',
    totalAppointments: 15,
    lastVisit: '2024-01-15',
  },
  {
    id: '2',
    name: 'Lucas Ferreira',
    email: 'lucas@email.com',
    phone: '(11) 99999-2222',
    tenantId: 'tenant1',
    totalAppointments: 8,
    lastVisit: '2024-01-10',
  },
  {
    id: '3',
    name: 'Rafael Costa',
    email: 'rafael@email.com',
    phone: '(11) 99999-3333',
    tenantId: 'tenant1',
    totalAppointments: 3,
    lastVisit: '2024-01-08',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    barberId: '1',
    serviceId: '3',
    date: '2024-01-25',
    time: '10:00',
    duration: 45,
    status: 'scheduled',
    price: 55,
    tenantId: 'tenant1',
    client: mockClients[0],
    barber: mockBarbers[0],
    service: mockServices[2],
  },
  {
    id: '2',
    clientId: '2',
    barberId: '2',
    serviceId: '1',
    date: '2024-01-25',
    time: '14:00',
    duration: 30,
    status: 'confirmed',
    price: 35,
    tenantId: 'tenant1',
    client: mockClients[1],
    barber: mockBarbers[1],
    service: mockServices[0],
  },
  {
    id: '3',
    clientId: '3',
    barberId: '1',
    serviceId: '2',
    date: '2024-01-25',
    time: '16:30',
    duration: 20,
    status: 'scheduled',
    price: 25,
    tenantId: 'tenant1',
    client: mockClients[2],
    barber: mockBarbers[0],
    service: mockServices[1],
  },
];

export const mockDashboardStats: DashboardStats = {
  todayAppointments: 8,
  weeklyRevenue: 1250,
  totalClients: 156,
  completionRate: 95,
  upcomingAppointments: mockAppointments.slice(0, 3),
  recentClients: mockClients.slice(0, 3),
};