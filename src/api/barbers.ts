import barbersData from '../database/barbers.json';
import appointmentsData from '../database/appointments.json';
import servicesData from '../database/services.json';

interface Barber {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tenantId: string;
  specialties: string[];
  experience: string;
  bio: string;
  workingHours: any;
  services: string[];
  rating: number;
  totalAppointments: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const simulateNetworkDelay = (min: number = 300, max: number = 700): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const logBarberEvent = (event: string, data: any) => {
  console.log(`[BARBERS API] ${event}:`, data);
};

export const barbersAPI = {
  async getBarbers(tenantId?: string): Promise<Barber[]> {
    logBarberEvent('GET_BARBERS', { tenantId });
    await simulateNetworkDelay();

    let barbers = [...barbersData.barbers];
    
    if (tenantId) {
      barbers = barbers.filter(barber => barber.tenantId === tenantId);
    }

    return barbers;
  },

  async getBarberById(id: string): Promise<Barber | null> {
    logBarberEvent('GET_BARBER_BY_ID', { id });
    await simulateNetworkDelay();

    const barber = barbersData.barbers.find(b => b.id === id);
    return barber || null;
  },

  async createBarber(barberData: Omit<Barber, 'id' | 'createdAt' | 'updatedAt' | 'totalAppointments' | 'rating'>): Promise<Barber> {
    logBarberEvent('CREATE_BARBER', { name: barberData.name, email: barberData.email });
    await simulateNetworkDelay();

    const newId = `barber-${Date.now()}`;
    const newBarber: Barber = {
      ...barberData,
      id: newId,
      totalAppointments: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logBarberEvent('BARBER_CREATED', { id: newId });
    return newBarber;
  },

  async updateBarber(id: string, updates: Partial<Barber>): Promise<Barber | null> {
    logBarberEvent('UPDATE_BARBER', { id, updates });
    await simulateNetworkDelay();

    const barber = barbersData.barbers.find(b => b.id === id);
    if (!barber) return null;

    const updatedBarber = {
      ...barber,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logBarberEvent('BARBER_UPDATED', { id });
    return updatedBarber;
  },

  async getBarberStats(barberId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
    rating: number;
    todayAppointments: number;
  }> {
    logBarberEvent('GET_BARBER_STATS', { barberId });
    await simulateNetworkDelay();

    const appointments = appointmentsData.appointments.filter(apt => apt.barberId === barberId);
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      totalRevenue: appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.price, 0),
      rating: barbersData.barbers.find(b => b.id === barberId)?.rating || 0,
      todayAppointments: appointments.filter(apt => apt.date === today && apt.status === 'scheduled').length
    };

    return stats;
  },

  async getBarberServices(barberId: string): Promise<any[]> {
    logBarberEvent('GET_BARBER_SERVICES', { barberId });
    await simulateNetworkDelay();

    const barber = barbersData.barbers.find(b => b.id === barberId);
    if (!barber) return [];

    const services = servicesData.services.filter(service => 
      barber.services.includes(service.id)
    );

    return services;
  }
};

export default barbersAPI;