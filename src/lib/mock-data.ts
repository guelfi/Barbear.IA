// Mock data for dashboard statistics
export const mockDashboardStats = {
  todayAppointments: 8,
  weeklyRevenue: 2450.50,
  totalClients: 156,
  completionRate: 92,
  totalRevenue: 15420,
  totalAppointments: 89,
  growthRate: 12.5,
  upcomingAppointments: [
    {
      id: '1',
      client: {
        name: 'João Silva',
        avatar: '/avatars/01.png'
      },
      service: {
        name: 'Corte + Barba'
      },
      barber: {
        name: 'João Barbeiro'
      },
      time: '09:00',
      price: 55.00,
      status: 'confirmed' as const
    },
    {
      id: '2',
      client: {
        name: 'Pedro Santos',
        avatar: '/avatars/02.png'
      },
      service: {
        name: 'Corte Simples'
      },
      barber: {
        name: 'Pedro Silva'
      },
      time: '10:30',
      price: 35.00,
      status: 'scheduled' as const
    },
    {
      id: '3',
      client: {
        name: 'Carlos Lima',
        avatar: '/avatars/03.png'
      },
      service: {
        name: 'Barba'
      },
      barber: {
        name: 'João Barbeiro'
      },
      time: '14:00',
      price: 25.00,
      status: 'in-progress' as const
    }
  ],
  recentClients: [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      avatar: '/avatars/client-01.png',
      totalAppointments: 12,
      lastVisit: '2024-01-18'
    },
    {
      id: '2',
      name: 'Ana Costa',
      email: 'ana@email.com',
      avatar: '/avatars/client-02.png',
      totalAppointments: 8,
      lastVisit: '2024-01-17'
    },
    {
      id: '3',
      name: 'Roberto Lima',
      email: 'roberto@email.com',
      avatar: '/avatars/client-03.png',
      totalAppointments: 15,
      lastVisit: '2024-01-16'
    }
  ]
};

// Mock data for appointments
export const mockAppointments = [
  {
    id: '1',
    clientId: 'client-1',
    barberId: 'barber-1',
    serviceId: 'service-1',
    date: '2024-01-20',
    time: '09:00',
    duration: 45,
    price: 55,
    status: 'confirmed' as const,
    notes: 'Cliente preferencial',
    tenantId: 'tenant-1',
    client: {
      id: 'client-1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      avatar: '/avatars/client-01.png',
      tenantId: 'tenant-1',
      totalAppointments: 12,
      lastVisit: '2024-01-18'
    },
    barber: {
      id: 'barber-1',
      name: 'João Barbeiro',
      email: 'joao@barbear.ia',
      phone: '(11) 99999-9999',
      avatar: '/avatars/barber-01.png',
      specialties: ['Corte Masculino', 'Barba'],
      workingHours: {
        monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        saturday: { isWorking: true, startTime: '08:00', endTime: '16:00' },
        sunday: { isWorking: false }
      },
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    service: {
      id: 'service-1',
      name: 'Corte + Barba',
      description: 'Pacote completo corte e barba',
      price: 55,
      duration: 45,
      category: 'Pacote',
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    }
  },
  {
    id: '2',
    clientId: 'client-2',
    barberId: 'barber-2',
    serviceId: 'service-2',
    date: '2024-01-20',
    time: '10:30',
    duration: 30,
    price: 35,
    status: 'scheduled' as const,
    notes: '',
    tenantId: 'tenant-1',
    client: {
      id: 'client-2',
      name: 'Pedro Santos',
      email: 'pedro@email.com',
      phone: '(11) 88888-8888',
      avatar: '/avatars/client-02.png',
      tenantId: 'tenant-1',
      totalAppointments: 8,
      lastVisit: '2024-01-17'
    },
    barber: {
      id: 'barber-2',
      name: 'Pedro Silva',
      email: 'pedro@barbear.ia',
      phone: '(11) 88888-8888',
      avatar: '/avatars/barber-02.png',
      specialties: ['Corte Feminino', 'Coloração'],
      workingHours: {
        monday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorking: true, startTime: '09:00', endTime: '15:00' },
        sunday: { isWorking: false }
      },
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    service: {
      id: 'service-2',
      name: 'Corte Simples',
      description: 'Corte de cabelo masculino tradicional',
      price: 35,
      duration: 30,
      category: 'Corte',
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    }
  },
  {
    id: '3',
    clientId: 'client-3',
    barberId: 'barber-1',
    serviceId: 'service-3',
    date: '2024-01-20',
    time: '14:00',
    duration: 20,
    price: 25,
    status: 'in-progress' as const,
    notes: 'Primeira vez',
    tenantId: 'tenant-1',
    client: {
      id: 'client-3',
      name: 'Carlos Lima',
      email: 'carlos@email.com',
      phone: '(11) 77777-7777',
      avatar: '/avatars/client-03.png',
      tenantId: 'tenant-1',
      totalAppointments: 15,
      lastVisit: '2024-01-16'
    },
    barber: {
      id: 'barber-1',
      name: 'João Barbeiro',
      email: 'joao@barbear.ia',
      phone: '(11) 99999-9999',
      avatar: '/avatars/barber-01.png',
      specialties: ['Corte Masculino', 'Barba'],
      workingHours: {
        monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
        saturday: { isWorking: true, startTime: '08:00', endTime: '16:00' },
        sunday: { isWorking: false }
      },
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    },
    service: {
      id: 'service-3',
      name: 'Barba',
      description: 'Aparar e modelar barba',
      price: 25,
      duration: 20,
      category: 'Barba',
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-20')
    }
  }
];

// Mock data for barbers
export const mockBarbers = [
  {
    id: '1',
    name: 'João Barbeiro',
    email: 'joao@barbear.ia',
    phone: '(11) 99999-9999',
    specialties: ['Corte Masculino', 'Barba'],
    rating: 4.8,
    avatar: '/avatars/barber-01.png'
  },
  {
    id: '2',
    name: 'Pedro Silva',
    email: 'pedro@barbear.ia',
    phone: '(11) 88888-8888',
    specialties: ['Corte Feminino', 'Coloração'],
    rating: 4.9,
    avatar: '/avatars/barber-02.png'
  }
];

// Mock data for clients
export const mockClients = [
  {
    id: '1',
    name: 'Carlos Cliente',
    email: 'carlos@email.com',
    phone: '(11) 77777-7777',
    lastVisit: '2024-01-15',
    totalVisits: 12,
    avatar: '/avatars/client-01.png'
  },
  {
    id: '2',
    name: 'Ana Maria',
    email: 'ana@email.com',
    phone: '(11) 66666-6666',
    lastVisit: '2024-01-10',
    totalVisits: 8,
    avatar: '/avatars/client-02.png'
  }
];

// Mock data for services
export const mockServices = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte de cabelo masculino tradicional',
    price: 35,
    duration: 30,
    category: 'Corte'
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Aparar e modelar barba',
    price: 25,
    duration: 20,
    category: 'Barba'
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Pacote completo corte e barba',
    price: 55,
    duration: 45,
    category: 'Pacote'
  }
];

// Dados adicionais para o Dashboard - versão ultra segura
export const mockDashboardStatsComplete = {
  todayAppointments: 8,
  weeklyRevenue: 2450.50,
  totalClients: 156,
  completionRate: 92,
  upcomingAppointments: [
    {
      id: '1',
      client: {
        id: '1',
        name: 'João Silva',
        avatar: '/avatars/01.png'
      },
      service: {
        id: '1',
        name: 'Corte + Barba'
      },
      barber: {
        id: '1',
        name: 'João Barbeiro'
      },
      time: '09:00',
      price: 55.00,
      status: 'confirmed' as const
    },
    {
      id: '2',
      client: {
        id: '2',
        name: 'Pedro Santos',
        avatar: '/avatars/02.png'
      },
      service: {
        id: '2',
        name: 'Corte Simples'
      },
      barber: {
        id: '2',
        name: 'Pedro Silva'
      },
      time: '10:30',
      price: 35.00,
      status: 'scheduled' as const
    },
    {
      id: '3',
      client: {
        id: '3',
        name: 'Carlos Lima',
        avatar: '/avatars/03.png'
      },
      service: {
        id: '3',
        name: 'Barba'
      },
      barber: {
        id: '1',
        name: 'João Barbeiro'
      },
      time: '14:00',
      price: 25.00,
      status: 'in-progress' as const
    }
  ],
  recentClients: [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      avatar: '/avatars/client-01.png',
      totalAppointments: 12,
      lastVisit: '2024-01-18'
    },
    {
      id: '2',
      name: 'Ana Costa',
      email: 'ana@email.com',
      avatar: '/avatars/client-02.png',
      totalAppointments: 8,
      lastVisit: '2024-01-17'
    },
    {
      id: '3',
      name: 'Roberto Lima',
      email: 'roberto@email.com',
      avatar: '/avatars/client-03.png',
      totalAppointments: 15,
      lastVisit: '2024-01-16'
    }
  ]
};