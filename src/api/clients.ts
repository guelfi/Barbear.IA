import clientsData from '../database/clients.json';
import appointmentsData from '../database/appointments.json';

interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tenantId: string;
  dateOfBirth?: string;
  address?: any;
  preferences?: any;
  totalAppointments: number;
  totalSpent: number;
  lastVisit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const simulateNetworkDelay = (min: number = 300, max: number = 700): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const logClientEvent = (event: string, data: any) => {
  console.log(`[CLIENTS API] ${event}:`, data);
};

export const clientsAPI = {
  async getClients(tenantId?: string, search?: string): Promise<Client[]> {
    logClientEvent('GET_CLIENTS', { tenantId, search });
    await simulateNetworkDelay();

    let clients = [...clientsData.clients];
    
    if (tenantId) {
      clients = clients.filter(client => client.tenantId === tenantId);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(search)
      );
    }

    return clients;
  },

  async getClientById(id: string): Promise<Client | null> {
    logClientEvent('GET_CLIENT_BY_ID', { id });
    await simulateNetworkDelay();

    const client = clientsData.clients.find(c => c.id === id);
    return client || null;
  },

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalAppointments' | 'totalSpent'>): Promise<Client> {
    logClientEvent('CREATE_CLIENT', { name: clientData.name, email: clientData.email });
    await simulateNetworkDelay();

    const newId = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      totalAppointments: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logClientEvent('CLIENT_CREATED', { id: newId });
    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    logClientEvent('UPDATE_CLIENT', { id, updates });
    await simulateNetworkDelay();

    const client = clientsData.clients.find(c => c.id === id);
    if (!client) return null;

    const updatedClient = {
      ...client,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logClientEvent('CLIENT_UPDATED', { id });
    return updatedClient;
  },

  async getClientStats(clientId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalSpent: number;
    favoriteBarber?: string;
    lastVisit?: string;
  }> {
    logClientEvent('GET_CLIENT_STATS', { clientId });
    await simulateNetworkDelay();

    const appointments = appointmentsData.appointments.filter(apt => apt.clientId === clientId);
    
    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      totalSpent: appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.price, 0),
      lastVisit: appointments
        .filter(apt => apt.status === 'completed')
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    };

    return stats;
  }
};

export default clientsAPI;