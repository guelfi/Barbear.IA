import barbershopsData from '../database/barbershops.json';
import indexesData from '../database/indexes.json';

interface Barbershop {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: any;
  businessHours: any;
  settings: any;
  subscription: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const simulateNetworkDelay = (min: number = 300, max: number = 600): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const logBarbershopEvent = (event: string, data: any) => {
  console.log(`[BARBERSHOPS API] ${event}:`, data);
};

export const barbershopsAPI = {
  async getAll(): Promise<any[]> {
    logBarbershopEvent('GET_ALL_BARBERSHOPS', {});
    await simulateNetworkDelay();

    // Retorna todas as barbearias com dados formatados para o SuperAdminDashboard
    return barbershopsData.barbershops.map(shop => ({
      id: shop.id,
      name: shop.name,
      businessName: shop.name,
      address: typeof shop.address === 'string' ? shop.address : 
               `${shop.address?.street || ''}, ${shop.address?.city || ''}, ${shop.address?.state || ''}`,
      phone: shop.phone,
      email: shop.email,
      logo: null, // Pode ser adicionado depois
      settings: shop.settings,
      subscription: shop.subscription,
      status: shop.isActive ? 'approved' : 'suspended',
      createdAt: shop.createdAt,
      approvedAt: shop.updatedAt,
      ownerId: `admin-${shop.id}`,
      totalUsers: 3, // Simulado - pode ser calculado dos indexes
      totalAppointments: 10, // Simulado
      monthlyRevenue: 1500.00 // Simulado
    }));
  },

  async getBarbershops(): Promise<Barbershop[]> {
    logBarbershopEvent('GET_BARBERSHOPS', {});
    await simulateNetworkDelay();

    return barbershopsData.barbershops.filter(shop => shop.isActive);
  },

  async getBarbershopById(id: string): Promise<Barbershop | null> {
    logBarbershopEvent('GET_BARBERSHOP_BY_ID', { id });
    await simulateNetworkDelay();

    const barbershop = barbershopsData.barbershops.find(shop => shop.id === id);
    return barbershop || null;
  },

  async createBarbershop(barbershopData: Omit<Barbershop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Barbershop> {
    logBarbershopEvent('CREATE_BARBERSHOP', { name: barbershopData.name });
    await simulateNetworkDelay();

    const newId = `tenant-${Date.now()}`;
    const newBarbershop: Barbershop = {
      ...barbershopData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logBarbershopEvent('BARBERSHOP_CREATED', { id: newId });
    return newBarbershop;
  },

  async updateBarbershop(id: string, updates: Partial<Barbershop>): Promise<Barbershop | null> {
    logBarbershopEvent('UPDATE_BARBERSHOP', { id, updates });
    await simulateNetworkDelay();

    const barbershop = barbershopsData.barbershops.find(shop => shop.id === id);
    if (!barbershop) return null;

    const updatedBarbershop = {
      ...barbershop,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logBarbershopEvent('BARBERSHOP_UPDATED', { id });
    return updatedBarbershop;
  },

  async getBarbershopStats(id: string): Promise<{
    totalUsers: number;
    totalBarbers: number;
    totalClients: number;
    totalServices: number;
    subscription: any;
  }> {
    logBarbershopEvent('GET_BARBERSHOP_STATS', { id });
    await simulateNetworkDelay();

    const usersByTenant = (indexesData.relationships.usersByTenant as any)[id] || [];
    const barbersByTenant = (indexesData.relationships.barbersByTenant as any)[id] || [];
    const clientsByTenant = (indexesData.relationships.clientsByTenant as any)[id] || [];
    const servicesByTenant = (indexesData.relationships.servicesByTenant as any)[id] || [];
    
    const barbershop = barbershopsData.barbershops.find(shop => shop.id === id);

    return {
      totalUsers: usersByTenant.length,
      totalBarbers: barbersByTenant.length,
      totalClients: clientsByTenant.length,
      totalServices: servicesByTenant.length,
      subscription: barbershop?.subscription || null
    };
  }
};

export default barbershopsAPI;