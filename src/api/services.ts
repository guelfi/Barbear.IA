import servicesData from '../database/services.json';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const simulateNetworkDelay = (min: number = 200, max: number = 500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const logServiceEvent = (event: string, data: any) => {
  console.log(`[SERVICES API] ${event}:`, data);
};

export const servicesAPI = {
  async getServices(tenantId?: string, category?: string): Promise<Service[]> {
    logServiceEvent('GET_SERVICES', { tenantId, category });
    await simulateNetworkDelay();

    let services = [...servicesData.services];
    
    if (tenantId) {
      services = services.filter(service => service.tenantId === tenantId);
    }
    
    if (category) {
      services = services.filter(service => service.category === category);
    }

    return services.filter(service => service.isActive);
  },

  async getServiceById(id: string): Promise<Service | null> {
    logServiceEvent('GET_SERVICE_BY_ID', { id });
    await simulateNetworkDelay();

    const service = servicesData.services.find(s => s.id === id);
    return service || null;
  },

  async createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    logServiceEvent('CREATE_SERVICE', { name: serviceData.name, tenantId: serviceData.tenantId });
    await simulateNetworkDelay();

    const newId = `service-${Date.now()}`;
    const newService: Service = {
      ...serviceData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logServiceEvent('SERVICE_CREATED', { id: newId });
    return newService;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    logServiceEvent('UPDATE_SERVICE', { id, updates });
    await simulateNetworkDelay();

    const service = servicesData.services.find(s => s.id === id);
    if (!service) return null;

    const updatedService = {
      ...service,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logServiceEvent('SERVICE_UPDATED', { id });
    return updatedService;
  },

  async deleteService(id: string): Promise<boolean> {
    logServiceEvent('DELETE_SERVICE', { id });
    await simulateNetworkDelay();

    const service = servicesData.services.find(s => s.id === id);
    if (!service) return false;

    // Em uma implementação real, faria soft delete ou verificaria dependências
    logServiceEvent('SERVICE_DELETED', { id });
    return true;
  },

  async getServiceCategories(tenantId?: string): Promise<string[]> {
    logServiceEvent('GET_SERVICE_CATEGORIES', { tenantId });
    await simulateNetworkDelay();

    let services = servicesData.services;
    
    if (tenantId) {
      services = services.filter(service => service.tenantId === tenantId);
    }

    const categories = [...new Set(services.map(service => service.category))];
    return categories;
  }
};

export default servicesAPI;