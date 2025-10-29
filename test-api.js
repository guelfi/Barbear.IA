// Teste simples da API
console.log('=== TESTE DA API ===');

// Simular dados dos usuários
const users = [
  { id: 'admin-1', email: 'admin@barbearia.com', role: 'admin', tenantId: 'tenant-1' },
  { id: 'barber-1', email: 'barbeiro@barbearia.com', role: 'barber', tenantId: 'tenant-1' },
  { id: 'client-1', email: 'cliente@email.com', role: 'client', tenantId: 'tenant-1' }
];

// Simular dados do dashboard-stats
const dashboardStats = {
  barbershopStats: {
    'tenant-1': {
      name: 'Barbearia Clássica',
      totalClients: 2,
      totalBarbers: 2,
      scheduledAppointments: 2,
      completedAppointments: 1,
      totalAppointments: 4,
      monthlyRevenue: 150.00
    }
  },
  barberStats: {
    'barber-1': {
      name: 'João Barbeiro',
      scheduledAppointments: 1,
      completedAppointments: 1,
      monthlyRevenue: 75.00
    }
  },
  clientStats: {
    'client-1': {
      name: 'Maria Cliente',
      scheduledAppointments: 1,
      completedAppointments: 1,
      totalAppointments: 2
    }
  }
};

// Testar cada usuário
users.forEach(user => {
  console.log(`\n--- Testando usuário: ${user.email} (${user.role}) ---`);
  
  switch (user.role) {
    case 'admin':
    case 'barber':
      const tenantStats = dashboardStats.barbershopStats[user.tenantId];
      if (tenantStats) {
        console.log('✅ Dados da barbearia encontrados:', tenantStats);
        
        if (user.role === 'barber') {
          const barberStats = dashboardStats.barberStats[user.id];
          if (barberStats) {
            console.log('✅ Dados do barbeiro encontrados:', barberStats);
          } else {
            console.log('❌ Dados do barbeiro NÃO encontrados para:', user.id);
          }
        }
      } else {
        console.log('❌ Dados da barbearia NÃO encontrados para tenantId:', user.tenantId);
      }
      break;
      
    case 'client':
      const clientStats = dashboardStats.clientStats[user.id];
      if (clientStats) {
        console.log('✅ Dados do cliente encontrados:', clientStats);
      } else {
        console.log('❌ Dados do cliente NÃO encontrados para:', user.id);
      }
      break;
  }
});

console.log('\n=== FIM DO TESTE ===');